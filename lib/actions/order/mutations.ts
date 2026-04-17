"use server";

import { connectToDatabase } from "../../db";
import { getServerSession } from "../../get-session";
import {
  serializeOrder,
  runStatusTransition,
  getFirstPurchaseDiscountQuoteForUser,
  runPostPaymentSideEffects,
  buildTrackingLink,
  appendTrackingHistory,
} from "./helpers";
import { Cart, OrderItem, ShippingAddress } from "@/types";
import { OrderCouponInput } from "./types";
import { formatError, round2 } from "../../utils";
import { cookies } from "next/headers";
import { getAffiliateByCode } from "../affiliate.actions";
import { validateCoupon } from "../coupon.actions";
import { getSetting } from "../setting.actions";
import { calcDeliveryDateAndPrice } from "./queries";
import User from "../../db/models/user.model";
import { generateTrackingNumber, normalizeOrderStatus, ORDER_STATUS_LABELS } from "../../order-tracking";
import { OrderInputSchema } from "../../validator";
import Order, { IOrder } from "../../db/models/order.model";
import { sendAdminEventNotification, sendOrderTrackingNotification, sendAskReviewOrderItems } from "@/lib/email/transactional";
import { revalidatePath } from "next/cache";

export const createOrder = async (
  clientSideCart: Cart & { coupon?: OrderCouponInput; userEmail?: string; userName?: string },
) => {
  try {
    await connectToDatabase();
    const session = await getServerSession();

    const createdOrder = await createOrderFromCart(
      clientSideCart,
      session?.user?.id,
      clientSideCart.coupon,
      clientSideCart.userEmail,
      clientSideCart.userName,
    );

    // For guest checkout, we need to return the accessToken once upon creation
    const serialized = serializeOrder(createdOrder);
    if (createdOrder.isGuest && createdOrder.accessToken && serialized) {
      (serialized as any).accessToken = createdOrder.accessToken;
    }

    return {
      success: true,
      message: "Order placed successfully",
      data: serialized,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const createOrderFromCart = async (
  clientSideCart: Cart,
  userId: string | undefined,
  coupon?: OrderCouponInput,
  userEmail?: string,
  userName?: string,
) => {
  const cookieStore = await cookies();
  let affiliateCode = cookieStore.get("affiliate_code")?.value;
  let affiliateId: string | undefined;

  if (affiliateCode) {
    const affiliate = await getAffiliateByCode(affiliateCode);
    if (affiliate) {
      affiliateId = affiliate._id.toString();
    }
  }

  let appliedCoupon:
    | {
        _id?: string;
        code: string;
        discountType: "percentage" | "fixed";
        discountAmount: number;
        isAffiliate?: boolean;
        isFirstPurchase?: boolean;
      }
    | undefined;

  const { common } = await getSetting();
  let coinsEarned = 0;
  let coinsRedeemed = 0;
  let isPaid = false;
  let paidAt: Date | undefined;

  const itemsPriceRaw = round2(
    clientSideCart.items.reduce((acc, item) => acc + item.price * item.quantity, 0),
  );

  const couponCodeToUse = coupon?.code || affiliateCode;

  if (couponCodeToUse) {
    try {
      const result = await validateCoupon(couponCodeToUse, itemsPriceRaw);

      if (result.success && result.data) {
        const { coupon, discount } = result.data;
        appliedCoupon = {
          _id: coupon._id,
          code: coupon.code,
          discountType: coupon.discountType as "percentage" | "fixed",
          discountAmount: discount,
          isAffiliate: (coupon as any).isAffiliate,
          isFirstPurchase: false,
        };

        if (appliedCoupon.isAffiliate) {
          affiliateId = appliedCoupon._id;
          affiliateCode = appliedCoupon.code;
        }
      }
    } catch (error) {
      console.error("Auto-coupon application failed:", error);
    }
  }

  const firstPurchaseDiscount = await getFirstPurchaseDiscountQuoteForUser(
    userId,
    userEmail,
    itemsPriceRaw,
  );
  if (
    firstPurchaseDiscount.eligible &&
    firstPurchaseDiscount.discountAmount > (appliedCoupon?.discountAmount || 0)
  ) {
    appliedCoupon = {
      code: `FIRST-${firstPurchaseDiscount.rate}%`,
      discountType: "percentage",
      discountAmount: firstPurchaseDiscount.discountAmount,
      isAffiliate: false,
      isFirstPurchase: true,
    };
  }

  const pricing = await calcDeliveryDateAndPrice({
    items: clientSideCart.items,
    shippingAddress: clientSideCart.shippingAddress,
    deliveryDateIndex: clientSideCart.deliveryDateIndex,
    discount: appliedCoupon?.discountAmount || 0,
  });

  const cart = {
    ...clientSideCart,
    ...pricing,
  };

  if (cart.paymentMethod === "Coins") {
    if (!userId) throw new Error("Authentication required for Coin payments");
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.coins < cart.totalPrice) {
      throw new Error("Insufficient coins balance");
    }
    if (coupon?.code) {
      throw new Error("Coupons cannot be used with coin payments");
    }
    // Ignore affiliate code for coin payments
    affiliateId = undefined;
    affiliateCode = undefined;
    coinsRedeemed = cart.totalPrice;
    isPaid = true;
    paidAt = new Date();
  }

  const totalPrice = cart.totalPrice;
  coinsEarned = round2(cart.itemsPrice * (common.coinsRewardRate / 100));

  const normalizedUserEmail = (userEmail || (userId ? undefined : clientSideCart.shippingAddress?.email))?.trim().toLowerCase();
  const initialTrackingNumber = generateTrackingNumber();
  const order = OrderInputSchema.parse({
    user: userId,
    isGuest: !userId,
    userEmail: normalizedUserEmail,
    userName: userName || clientSideCart.shippingAddress?.fullName,
    accessToken: !userId ? crypto.randomUUID() : undefined,
    items: cart.items,
    shippingAddress: cart.shippingAddress,
    paymentMethod: cart.paymentMethod,
    itemsPrice: cart.itemsPrice,
    shippingPrice: cart.shippingPrice,
    taxPrice: cart.taxPrice,
    totalPrice,
    expectedDeliveryDate: cart.expectedDeliveryDate,
    coupon: appliedCoupon,
    coinsEarned,
    coinsRedeemed,
    coinsCredited: false,
    isPaid,
    paidAt,
    trackingNumber: initialTrackingNumber,
    status: "pending",
    affiliate: affiliateId,
    affiliateCode: affiliateCode,
    shipment: {
      estimatedDeliveryDate: cart.expectedDeliveryDate,
    },
    trackingHistory: [
      {
        status: "pending",
        message: "Order created and awaiting confirmation.",
        source: "system",
      },
    ],
  });
  const createdOrder = await Order.create(order);

  if (appliedCoupon?.isFirstPurchase && userId) {
    await User.findByIdAndUpdate(userId, {
      $set: { firstPurchaseDiscountUsed: true },
    });
  }

  if (cart.paymentMethod === "Coins") {
    const userUpdate = await User.findOneAndUpdate(
      { _id: userId, coins: { $gte: totalPrice } },
      { $inc: { coins: -totalPrice } },
      { new: true }
    );

    if (!userUpdate) {
      await Order.findByIdAndDelete(createdOrder._id);
      throw new Error("Insufficient coins balance or payment failed");
    }

    await runPostPaymentSideEffects(createdOrder._id.toString());
  }

  await runStatusTransition({
    order: createdOrder,
    nextStatus: "confirmed",
    message: "Order confirmed and queued for processing.",
    source: "system",
  });
  const orderUser = userId ? await User.findById(userId).select("name email").lean() : null;

  await sendAdminEventNotification({
    title: "New order received",
    description: `${orderUser?.name || userName || "Guest Customer"} placed an order for ${round2(createdOrder.totalPrice).toFixed(2)}.`,
    href: `/admin/orders/${createdOrder._id.toString()}`,
    meta: createdOrder.isPaid ? "Paid order" : "Awaiting payment",
    createdAt: createdOrder.createdAt.toISOString(),
  });

  return createdOrder;
};

export async function updateOrderStatus({
  orderId,
  status,
  message,
  location,
  courierName,
  courierTrackingReference,
  estimatedDeliveryDate,
}: {
  orderId: string;
  status: string;
  message?: string;
  location?: string;
  courierName?: string;
  courierTrackingReference?: string;
  estimatedDeliveryDate?: Date;
}) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (session?.user?.role !== "ADMIN") {
      throw new Error("Admin permission required");
    }

    const normalizedStatus = normalizeOrderStatus(status);
    if (!normalizedStatus) throw new Error("Invalid order status value.");

    const order = await Order.findById(orderId).populate<{
      user: { email: string; name: string };
    }>("user", "name email");

    if (!order) throw new Error("Order not found");

    if (courierName || courierTrackingReference || estimatedDeliveryDate) {
      order.shipment = {
        ...order.shipment,
        ...(courierName ? { courierName } : {}),
        ...(courierTrackingReference ? { courierTrackingReference } : {}),
        ...(estimatedDeliveryDate ? { estimatedDeliveryDate } : {}),
        ...(normalizedStatus === "shipped" ? { dispatchedAt: new Date() } : {}),
      };
    }

    await runStatusTransition({
      order,
      nextStatus: normalizedStatus,
      message,
      location,
      source: "admin",
      actor: session.user.name,
    });

    if (normalizedStatus === "delivered") {
      const finalEmail = order.userEmail || (order.user as unknown as { email?: string })?.email;
      if (finalEmail) {
        if (!order.userEmail) order.userEmail = finalEmail;
        await sendAskReviewOrderItems(order as unknown as IOrder);
      }
    }

    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(buildTrackingLink(order.trackingNumber));

    return { success: true, message: `Order status updated to ${ORDER_STATUS_LABELS[normalizedStatus]}` };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

export async function initiateExchange(orderId: string) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (session?.user?.role !== "ADMIN") {
      throw new Error("Admin permission required");
    }

    const order = await Order.findById(orderId).populate<{
      user: { email: string; name: string };
    }>("user", "name email");

    if (!order) throw new Error("Order not found");
    if (order.status !== "returned") {
      throw new Error("Exchange can only be initiated for returned orders");
    }

    order.isExchangeInitiated = true;
    appendTrackingHistory(order, {
      status: "returned",
      message: "Admin initiated an exchange for a different product. User will pay for delivery costs.",
      source: "admin",
      actor: session.user.name,
    });

    await order.save();

    const user = order.user as unknown as { email?: string; name?: string };
    if (user?.email) {
      await sendOrderTrackingNotification({
        order: order as unknown as IOrder,
        statusLabel: "Exchange Initiated",
        statusMessage: "An exchange has been initiated for your returned order. Please note that you will be responsible for the new delivery costs.",
        trackingLink: `${(await getSetting()).site.url}${buildTrackingLink(order.trackingNumber)}`,
      });
    }

    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, message: "Exchange process initiated successfully" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

export async function deliverOrder(orderId: string) {
  return updateOrderStatus({
    orderId,
    status: "delivered",
    message: "Order marked as delivered.",
  });
}

export async function cancelOrder(orderId: string) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session) throw new Error("User not authenticated");

    const order = await Order.findById(orderId).populate<{
      user: { _id: string; email: string; name: string };
    }>("user", "name email");

    if (!order) throw new Error("Order not found");

    const isUserOwner = order.user?._id?.toString() === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isUserOwner && !isAdmin) {
      throw new Error("Unauthorized");
    }

    if (!["pending", "confirmed", "processing"].includes(order.status)) {
      throw new Error(`Order cannot be cancelled in ${order.status} status`);
    }

    await runStatusTransition({
      order,
      nextStatus: "cancelled",
      message: `Order cancelled by ${isAdmin ? "admin" : "customer"}.`,
      source: isAdmin ? "admin" : "customer",
      actor: session.user.name,
    });

    await sendAdminEventNotification({
      title: "Order cancelled",
      description: `Order ${orderId.slice(-8).toUpperCase()} was cancelled by ${session.user.name}.`,
      href: `/admin/orders/${orderId}`,
      meta: order.isPaid ? "Paid amount refunded to coins" : "Unpaid order",
      createdAt: new Date().toISOString(),
    });

    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath("/admin/orders");

    return { success: true, message: "Order cancelled successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function requestReturnOrder(orderId: string) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session) throw new Error("User not authenticated");

    const order = await Order.findById(orderId).populate<{
      user: { _id: string; email: string; name: string };
    }>("user", "name email");

    if (!order) throw new Error("Order not found");

    if (order.user?._id?.toString() !== session.user.id) {
      throw new Error("Unauthorized");
    }

    if (order.status !== "delivered") {
      throw new Error("Only delivered orders can be returned");
    }

    if (!order.deliveredAt) {
      throw new Error("Delivery date not recorded");
    }

    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    const isWithinReturnWindow = Date.now() - new Date(order.deliveredAt).getTime() <= sevenDaysInMs;

    if (!isWithinReturnWindow) {
      throw new Error("Return period has expired (7 days after delivery)");
    }

    await runStatusTransition({
      order,
      nextStatus: "return_requested",
      message: "Customer requested a return.",
      source: "customer",
      actor: session.user.name,
    });

    await sendAdminEventNotification({
      title: "Return request received",
      description: `${session.user.name} requested a return for order ${orderId.slice(-8).toUpperCase()}.`,
      href: `/admin/orders/${orderId}`,
      createdAt: new Date().toISOString(),
    });

    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, message: "Return request submitted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function deleteOrder(id: string) {
  try {
    await connectToDatabase();
    const res = await Order.findByIdAndDelete(id);
    if (!res) throw new Error("Order not found");
    revalidatePath("/admin/orders");
    return {
      success: true,
      message: "Order deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
