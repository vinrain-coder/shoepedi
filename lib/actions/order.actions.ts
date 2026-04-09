"use server";

import { Cart, IOrderList, OrderItem, ShippingAddress } from "@/types";
import { escapeRegExp, formatError, round2 } from "../utils";
import {
  canTransitionOrderStatus,
  generateTrackingNumber,
  normalizeOrderStatus,
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  OrderTrackingHistoryEventInput,
  OrderTrackingStatus,
  shouldSendStatusNotification,
} from "../order-tracking";
import { connectToDatabase } from "../db";
import { OrderInputSchema } from "../validator";
import Order, { IOrder } from "../db/models/order.model";
import { revalidatePath } from "next/cache";
import {
  sendAdminEventNotification,
  sendAskReviewOrderItems,
  sendOrderTrackingNotification,
  sendPurchaseReceipt,
} from "@/lib/email/transactional";
import { DateRange } from "react-day-picker";
import Product from "../db/models/product.model";
import User from "../db/models/user.model";
import Review from "../db/models/review.model";
import NewsletterSubscription from "../db/models/newsletter-subscription.model";
import SupportTicket from "../db/models/support-ticket.model";
import mongoose from "mongoose";
import { getSetting } from "./setting.actions";
import { getServerSession } from "../get-session";
import { cacheLife } from "next/cache";
import { validateCoupon, incrementCouponUsage, decrementCouponUsage } from "./coupon.actions";
import { getAffiliateByCode } from "./affiliate.actions";
import Affiliate from "../db/models/affiliate.model";
import AffiliateEarning from "../db/models/affiliate-earning.model";
import { cookies } from "next/headers";
import { calculateShippingPrice } from "../delivery";
import DeliveryLocation from "../db/models/delivery-location.model";
//import { sendAskReviewOrderItems, sendPurchaseReceipt } from "../email/transactional";

export type SerializedOrder = Omit<IOrder, "_id"> & { _id: string };

type OrderCouponInput = {
  _id?: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountAmount?: number;
  isAffiliate?: boolean;
  isFirstPurchase?: boolean;
};

type FirstPurchaseDiscountQuote = {
  eligible: boolean;
  rate: number;
  discountAmount: number;
};

const getFirstPurchaseDiscountQuoteForUser = async (
  userId: string,
  itemsPrice: number,
): Promise<FirstPurchaseDiscountQuote> => {
  const {
    common: { firstPurchaseDiscountRate = 0 },
  } = await getSetting();
  const normalizedRate = Math.max(0, Math.min(100, Number(firstPurchaseDiscountRate) || 0));
  const normalizedItemsPrice = Math.max(0, Number(itemsPrice) || 0);

  if (!userId || normalizedRate <= 0 || normalizedItemsPrice <= 0) {
    return { eligible: false, rate: normalizedRate, discountAmount: 0 };
  }

  const [user, existingOrdersCount] = await Promise.all([
    User.findById(userId).select("firstPurchaseDiscountUsed").lean(),
    Order.countDocuments({ user: userId }),
  ]);

  if (!user || user.firstPurchaseDiscountUsed || existingOrdersCount > 0) {
    return { eligible: false, rate: normalizedRate, discountAmount: 0 };
  }

  const discountAmount = Math.min(
    round2((normalizedItemsPrice * normalizedRate) / 100),
    normalizedItemsPrice,
  );

  return {
    eligible: discountAmount > 0,
    rate: normalizedRate,
    discountAmount,
  };
};

export const getFirstPurchaseDiscountQuote = async (itemsPrice: number) => {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session?.user?.id) {
      return { eligible: false, rate: 0, discountAmount: 0 };
    }

    return await getFirstPurchaseDiscountQuoteForUser(session.user.id, itemsPrice);
  } catch (error) {
    console.error("Failed to fetch first purchase discount quote:", error);
    return { eligible: false, rate: 0, discountAmount: 0 };
  }
};

const serializeOrder = (order: IOrder | null): SerializedOrder | null => {
  if (!order) return null;

  const serializedOrder = JSON.parse(JSON.stringify(order)) as SerializedOrder;
  return {
    ...serializedOrder,
    _id: serializedOrder._id.toString(),
  };
};

const buildTrackingLink = (trackingNumber: string) =>
  `/track/${encodeURIComponent(trackingNumber)}`;

const ensureTrackingState = async (order: IOrder | (IOrder & { user?: { email?: string; name?: string } })) => {
  let changed = false;

  if (!order.trackingNumber) {
    order.trackingNumber = generateTrackingNumber();
    changed = true;
  }

  if (!order.status) {
    order.status = order.isDelivered ? "delivered" : "confirmed";
    changed = true;
  }

  if (!order.trackingHistory || order.trackingHistory.length === 0) {
    appendTrackingHistory(order, {
      status: order.status,
      message: `Order currently ${ORDER_STATUS_LABELS[order.status].toLowerCase()}.`,
      source: "system",
    });
    changed = true;
  }

  if (changed) {
    await order.save();
  }

  return order;
};

const appendTrackingHistory = (
  order: IOrder | (IOrder & { user?: { email?: string; name?: string } }),
  event: OrderTrackingHistoryEventInput,
) => {
  const createdAt = event.createdAt ?? new Date();
  const history = [...(order.trackingHistory || [])];
  const lastEvent = history[history.length - 1];

  if (
    lastEvent &&
    lastEvent.status === event.status &&
    lastEvent.message === event.message
  ) {
    return false;
  }

  history.push({
    status: event.status,
    message: event.message,
    location: event.location,
    source: event.source ?? "system",
    metadata: event.metadata,
    createdAt,
  });

  history.sort((a, b) =>
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  order.trackingHistory = history;
  return true;
};

const notifyCustomerOrderStatus = async (
  order: IOrder | (IOrder & { user?: { email?: string; name?: string } }),
  status: OrderTrackingStatus,
  message: string,
) => {
  if (!shouldSendStatusNotification(status)) return;

  let email = (order.user as unknown as { email?: string })?.email;

  if (!email) {
     const populatedOrder = await Order.findById(order._id).populate("user", "email name");
     email = (populatedOrder?.user as unknown as { email?: string })?.email;
     if (email) {
       (order as any).user = populatedOrder?.user;
     }
  }

  if (!email) return;

  const { site } = await getSetting();
  const trackingLink = `${site.url}${buildTrackingLink(order.trackingNumber)}`;

  await sendOrderTrackingNotification({
    order: order as IOrder,
    statusLabel: ORDER_STATUS_LABELS[status],
    statusMessage: message,
    trackingLink,
  });
};

const revertOrderEffects = async (order: IOrder, options: { refundToCoins: boolean } = { refundToCoins: true }) => {
  const userId = (order.user as any)?._id || order.user;

  // 1. Refund paid amount to coins if paid and not already refunded (Only for cancellations)
  if (options.refundToCoins && order.isPaid) {
    const updatedOrder = await Order.findOneAndUpdate(
      { _id: order._id, refundedToCoins: { $ne: true }, isPaid: true },
      { $set: { refundedToCoins: true } },
      { new: true }
    );

    if (updatedOrder) {
      await User.findByIdAndUpdate(userId, {
        $inc: { coins: round2(order.totalPrice) },
      });
      order.refundedToCoins = true;
    }
  }

  // 2. Restore product stock if it was previously adjusted and not yet reverted
  const updatedOrderForStock = await Order.findOneAndUpdate(
    { _id: order._id, stockAdjusted: true, stockReverted: { $ne: true } },
    { $set: { stockReverted: true } },
    { new: true }
  );

  if (updatedOrderForStock) {
    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product },
        {
          $inc: {
            countInStock: item.quantity,
            numSales: -item.quantity,
          },
        }
      );
    }
    order.stockReverted = true;
  }

  // 3. Revoke earned coins if credited
  const updatedOrderForCoins = await Order.findOneAndUpdate(
    { _id: order._id, coinsCredited: true },
    { $set: { coinsCredited: false } },
    { new: true }
  );

  if (updatedOrderForCoins && order.coinsEarned > 0) {
    await User.findByIdAndUpdate(userId, {
      $inc: { coins: -round2(order.coinsEarned) },
    });
    order.coinsCredited = false;
  }

  // 4. Revoke affiliate commissions
  if (order.affiliate) {
    const earning = await AffiliateEarning.findOneAndUpdate(
      { order: order._id, status: { $ne: "cancelled" } },
      { $set: { status: "cancelled" } },
      { new: true }
    );

    if (earning) {
      await Affiliate.findByIdAndUpdate(order.affiliate, {
        $inc: {
          earningsBalance: -earning.amount,
          totalEarnings: -earning.amount,
        },
      });
    }
  }

  // 5. Revert coupon usage
  if (order.coupon?._id && !order.coupon.isAffiliate) {
    const updatedOrderForCoupon = await Order.findOneAndUpdate(
      { _id: order._id, couponUsageReverted: { $ne: true } },
      { $set: { couponUsageReverted: true } },
      { new: true }
    );

    if (updatedOrderForCoupon) {
      try {
        await decrementCouponUsage(order.coupon._id.toString());
        order.couponUsageReverted = true;
      } catch (error) {
        console.error("Non-critical: Failed to revert coupon usage:", error);
      }
    }
  }
};

const runStatusTransition = async ({
  order,
  nextStatus,
  message,
  location,
  source = "system",
  metadata,
  actor,
}: {
  order: IOrder | (IOrder & { user?: { email?: string; name?: string } });
  nextStatus: OrderTrackingStatus;
  message?: string;
  location?: string;
  source?: "system" | "admin" | "courier" | "customer";
  metadata?: Record<string, unknown>;
  actor?: string;
}) => {
  if (order.status === nextStatus) {
    return order;
  }

  if (!canTransitionOrderStatus(order.status, nextStatus)) {
    throw new Error(
      `Invalid status transition from ${order.status} to ${nextStatus}.`,
    );
  }

  if (nextStatus === "cancelled") {
    await revertOrderEffects(order as IOrder, { refundToCoins: true });
  }

  if (nextStatus === "returned") {
    await revertOrderEffects(order as IOrder, { refundToCoins: false });
  }

  if (nextStatus === "delivered") {
    // If we're moving to delivered, and it's already marked as delivered (e.g. from return_requested)
    // we don't want to overwrite timestamps or backfill
    if (order.isDelivered && order.deliveredAt) {
      order.status = nextStatus;
    } else {
      // Backfill intermediate statuses if jumping to delivered
      const flow = [...ORDER_STATUS_FLOW];
      const currentIndex = flow.indexOf(order.status as any);
      const deliveredIndex = flow.indexOf("delivered");

      if (currentIndex !== -1 && currentIndex < deliveredIndex - 1) {
        const now = Date.now();
        for (let i = currentIndex + 1; i < deliveredIndex; i++) {
          const intermediateStatus = flow[i];
          appendTrackingHistory(order, {
            status: intermediateStatus,
            message: `Order moved to ${ORDER_STATUS_LABELS[intermediateStatus].toLowerCase()} (system).`,
            source: "system",
            // Use slightly earlier timestamps for intermediate events to maintain order
            createdAt: new Date(now - (deliveredIndex - i) * 1000),
          });
        }
      }

      order.status = nextStatus;
      order.isDelivered = true;
      order.deliveredAt = new Date();
      order.shipment = {
        ...order.shipment,
        deliveredAt: order.deliveredAt,
      };
    }
  } else {
    order.status = nextStatus;
  }

  if (nextStatus === "cancelled") {
    order.isDelivered = false;
  }

  appendTrackingHistory(order, {
    status: nextStatus,
    message:
      message ||
      `Order moved to ${ORDER_STATUS_LABELS[nextStatus].toLowerCase()}${actor ? ` by ${actor}` : ""}.`,
    location,
    source,
    metadata,
  });

  await order.save();

  if (nextStatus === "returned") {
    const user = order.user as unknown as { email?: string; name?: string };
    if (user?.email) {
      await sendOrderTrackingNotification({
        order: order as unknown as IOrder,
        statusLabel: "Return Approved",
        statusMessage: "Your return request has been approved.",
        trackingLink: `${(await getSetting()).site.url}${buildTrackingLink(order.trackingNumber)}`,
      });
    }
  }
  await notifyCustomerOrderStatus(
    order,
    nextStatus,
    message || ORDER_STATUS_LABELS[nextStatus],
  );

  return order;
};


// CREATE
export const createOrder = async (
  clientSideCart: Cart & { coupon?: OrderCouponInput },
) => {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session) throw new Error("User not authenticated");

    const createdOrder = await createOrderFromCart(
      clientSideCart,
      session.user.id!,
      clientSideCart.coupon,
    );

    return {
      success: true,
      message: "Order placed successfully",
      data: serializeOrder(createdOrder),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const createOrderFromCart = async (
  clientSideCart: Cart,
  userId: string,
  coupon?: OrderCouponInput,
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

      if (result.success) {
        const validatedCoupon = result;
        appliedCoupon = {
          _id: validatedCoupon.coupon!._id,
          code: validatedCoupon.coupon!.code,
          discountType: validatedCoupon.coupon!.discountType as "percentage" | "fixed",
          discountAmount: validatedCoupon.discount!,
          isAffiliate: (validatedCoupon.coupon as any).isAffiliate,
          isFirstPurchase: false,
        };

        if (appliedCoupon.isAffiliate) {
          affiliateId = appliedCoupon._id;
          affiliateCode = appliedCoupon.code;
        }
      } else {
        console.error("Auto-coupon application failed:", result.message);
      }
    } catch (error) {
       console.error("Auto-coupon application failed:", error);
    }
  }

  const firstPurchaseDiscount = await getFirstPurchaseDiscountQuoteForUser(
    userId,
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

  const initialTrackingNumber = generateTrackingNumber();
  const order = OrderInputSchema.parse({
    user: userId,
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

  if (appliedCoupon?.isFirstPurchase) {
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
  const orderUser = await User.findById(userId).select("name email").lean();

  await sendAdminEventNotification({
    title: "New order received",
    description: `${orderUser?.name || "Customer"} placed an order for ${round2(createdOrder.totalPrice).toFixed(2)}.`,
    href: `/admin/orders/${createdOrder._id.toString()}`,
    meta: createdOrder.isPaid ? "Paid order" : "Awaiting payment",
    createdAt: createdOrder.createdAt.toISOString(),
  });

  return createdOrder;
};

const runPostPaymentSideEffects = async (orderId: string) => {
  const order = await Order.findById(orderId);
  if (!order) return;

  // 1. Credit earned coins to user
  try {
    const userId = (order.user as any)?._id || order.user;
    if (order.coinsEarned > 0 && !order.coinsCredited) {
      const updatedOrder = await Order.findOneAndUpdate(
        { _id: order._id, coinsCredited: { $ne: true } },
        { $set: { coinsCredited: true } },
        { new: true }
      );

      if (updatedOrder) {
        await User.findByIdAndUpdate(userId, {
          $inc: { coins: round2(order.coinsEarned) },
        });
      }
    }
  } catch (coinsError) {
    console.error("Non-critical: Failed to credit earned coins:", coinsError);
  }

  // 2. Update product stock
  try {
    const updatedOrderForStock = await Order.findOneAndUpdate(
      { _id: order._id, stockAdjusted: { $ne: true } },
      { $set: { stockAdjusted: true } },
      { new: true }
    );
    if (updatedOrderForStock) {
      await updateProductStock(order._id.toString());
    }
  } catch (stockError) {
    console.error("Critical: Failed to update product stock:", stockError);
  }

  // 3. Increment coupon usage
  try {
    if (order.coupon?._id && !order.coupon.isAffiliate) {
      await incrementCouponUsage(order.coupon._id.toString());
    }
  } catch (couponError) {
    console.error("Non-critical: Failed to increment coupon usage:", couponError);
  }

  // 4. Handle Affiliate Earnings
  try {
    if (order.affiliate) {
      const { affiliate: settings } = await getSetting();
      if (settings?.enabled) {
        const affiliateDoc = await Affiliate.findById(order.affiliate);
        if (affiliateDoc && affiliateDoc.status === "approved") {
          const commissionRate = settings.commissionRate;

          const commissionAmount = round2((order.itemsPrice * commissionRate) / 100);

          if (commissionAmount > 0) {
            const existingEarning = await AffiliateEarning.findOne({ order: order._id });
            if (!existingEarning) {
              await AffiliateEarning.create({
                affiliate: order.affiliate,
                order: order._id,
                amount: commissionAmount,
                commissionRate: commissionRate,
                status: "earned",
              });

              await Affiliate.findByIdAndUpdate(order.affiliate, {
                $inc: {
                  earningsBalance: commissionAmount,
                  totalEarnings: commissionAmount,
                },
              });
              revalidatePath("/affiliate/dashboard");
            }
          }
        }
      }
    }
  } catch (affiliateError) {
    console.error("Non-critical: Failed to process affiliate earnings:", affiliateError);
  }

  // 5. Send purchase receipt
  try {
    const populatedOrder = await Order.findById(orderId).populate("user", "name email");
    const emailUser = populatedOrder?.user as unknown as { email?: string };

    if (emailUser?.email) {
      await sendPurchaseReceipt(populatedOrder as unknown as IOrder);
    }
  } catch (emailError) {
    console.error("Non-critical: Failed to send purchase receipt email:", emailError);
  }

  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}`);
};

const processOrderPayment = async (orderId: string, paymentInfo?: any) => {
  await connectToDatabase();
  const order = await Order.findById(orderId);

  if (!order) throw new Error("Order not found");
  if (order.isPaid) return { success: true, message: "Order is already paid" };

  order.isPaid = true;
  order.paidAt = new Date();
  if (paymentInfo) {
    order.paymentResult = paymentInfo;
  }

  appendTrackingHistory(order, {
    status: order.status,
    message: paymentInfo ? "Payment verified by gateway." : "Payment received successfully.",
    source: "system",
  });

  await order.save();

  await runPostPaymentSideEffects(orderId);

  return { success: true, message: "Order paid successfully" };
};

export async function updateOrderToPaid(orderId: string) {
  try {
    return await processOrderPayment(orderId);
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

const updateProductStock = async (orderId: string) => {
  try {
    const order = await Order.findById(orderId);
    if (!order) throw new Error("Order not found");

    for (const item of order.items) {
      await Product.updateOne(
        { _id: item.product },
        {
          $inc: {
            countInStock: -item.quantity,
            numSales: item.quantity,
          },
        },
      );
    }
    return true;
  } catch (error) {
    console.error("Failed to update product stock:", error);
    throw error;
  }
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
      if ((order.user as { email?: string })?.email) {
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

    const isUserOwner = order.user._id.toString() === session.user.id;
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

    if (order.user._id.toString() !== session.user.id) {
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

export async function getOrderByTrackingNumber(trackingNumber: string) {
  await connectToDatabase();
  const order = await Order.findOne({ trackingNumber }).select(
    "_id trackingNumber status trackingHistory shipment expectedDeliveryDate shippingAddress items itemsPrice shippingPrice taxPrice totalPrice updatedAt",
  );

  if (!order) return null;
  const hydrated = await ensureTrackingState(order as IOrder);
  return serializeOrder(hydrated);
}

// DELETE
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

// GET ALL ORDERS

export async function getAllOrders({
  limit,
  page,
  status,
  from,
  to,
  query,
}: {
  limit?: number;
  page: number;
  status?: string;
  from?: string;
  to?: string;
  query?: string;
}) {
  "use cache";
  cacheLife("minutes");
  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  await connectToDatabase();
  const skipAmount = (Number(page) - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};
  if (status && status !== "all") {
    filter.status = status;
  }
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = toDate;
    }
  }
  if (query) {
    const escapedQuery = escapeRegExp(query);
    const users = await User.find({
      name: { $regex: escapedQuery, $options: "i" },
    })
      .select("_id")
      .limit(50);
    const userIds = users.map((u) => u._id);

    filter.$or = [
      { trackingNumber: { $regex: escapedQuery, $options: "i" } },
      { user: { $in: userIds } },
    ];
    if (mongoose.Types.ObjectId.isValid(query)) {
      filter.$or.push({ _id: query });
    }
  }

  const orders = await Order.find(filter)
    .populate("user", "name")
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(limit);
  const ordersCount = await Order.countDocuments(filter);
  return {
    data: JSON.parse(JSON.stringify(orders)) as IOrderList[],
    totalPages: Math.ceil(ordersCount / limit),
    totalOrders: ordersCount,
  };
}

export async function getOrderStatusStats(
  dateRange?: {
    from?: string;
    to?: string;
  },
  searchQuery?: string
) {
  "use cache";
  cacheLife("minutes");
  await connectToDatabase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};
  if (dateRange?.from || dateRange?.to) {
    filter.createdAt = {};
    if (dateRange.from) filter.createdAt.$gte = new Date(dateRange.from);
    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = toDate;
    }
  }

  if (searchQuery) {
    const escapedQuery = escapeRegExp(searchQuery);
    const users = await User.find({
      name: { $regex: escapedQuery, $options: "i" },
    })
      .select("_id")
      .limit(50);
    const userIds = users.map((u) => u._id);

    filter.$or = [
      { trackingNumber: { $regex: escapedQuery, $options: "i" } },
      { user: { $in: userIds } },
    ];
    if (mongoose.Types.ObjectId.isValid(searchQuery)) {
      filter.$or.push({ _id: searchQuery });
    }
  }

  const statusDistribution = await Order.aggregate([
    { $match: filter },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const totalOrders = await Order.countDocuments(filter);

  const stats = statusDistribution.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {} as Record<string, number>);

  return {
    stats,
    totalOrders,
  };
}
export async function getMyOrders({
  limit,
  page,
}: {
  limit?: number;
  page: number;
}) {
  "use cache: private";
  cacheLife("hours");
  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  await connectToDatabase();
  const session = await getServerSession();
  if (!session) {
    throw new Error("User is not authenticated");
  }
  const skipAmount = (Number(page) - 1) * limit;
  const orders = await Order.find({
    user: session?.user?.id,
  })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(limit);
  const ordersCount = await Order.countDocuments({ user: session?.user?.id });

  return {
    data: JSON.parse(JSON.stringify(orders)),
    totalPages: Math.ceil(ordersCount / limit),
  };
}
export async function getOrderById(
  orderId: string,
): Promise<SerializedOrder | null> {
  "use cache: private";
  cacheLife("hours");
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return null;
  }

  const session = await getServerSession();
  if (!session?.user?.id) {
    return null;
  }

  const query =
    session.user.role === "ADMIN"
      ? { _id: orderId }
      : { _id: orderId, user: session.user.id };

  const order = await Order.findOne(query);
  if (!order) return null;
  const hydrated = await ensureTrackingState(order);
  return serializeOrder(hydrated);
}

export const calcDeliveryDateAndPrice = async ({
  items = [],
  shippingAddress,
  deliveryDateIndex,
  discount = 0,
}: {
  deliveryDateIndex?: number;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
  discount?: number;
}) => {
  try {
    const { availableDeliveryDates, common } = await getSetting();
    const itemsPrice = round2(
      (items || []).reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 0), 0),
    );

    let locationRate = 0;
    if (shippingAddress?.province && shippingAddress?.city) {
      await connectToDatabase();
      const normalizedProvince = (shippingAddress.province || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
      const normalizedCity = (shippingAddress.city || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

      if (normalizedProvince && normalizedCity) {
        const location = await DeliveryLocation.findOne({
          county: normalizedProvince,
          city: normalizedCity,
        }).lean();
        if (location) {
          locationRate = location.rate || 0;
        }
      }
    }

    const safeDeliveryDateIndex =
      deliveryDateIndex === undefined || isNaN(Number(deliveryDateIndex))
        ? Math.max(0, (availableDeliveryDates?.length || 1) - 1)
        : Number(deliveryDateIndex);

    const deliveryDate = availableDeliveryDates?.[safeDeliveryDateIndex];

    const shippingPrice =
      !shippingAddress || !deliveryDate
        ? 0
        : calculateShippingPrice({
            deliveryDate,
            itemsPrice,
            shippingRate: locationRate,
          });

    const netItemsPrice = Math.max(0, itemsPrice - (discount || 0));
    const taxRate = common?.taxRate ?? 0;
    const taxPrice = !shippingAddress ? 0 : round2(netItemsPrice * (taxRate / 100));

    const safeShippingPrice = shippingPrice ?? 0;
    const totalPrice = round2(netItemsPrice + safeShippingPrice + taxPrice);

    return {
      deliveryDateIndex: safeDeliveryDateIndex,
      itemsPrice: Number(itemsPrice) || 0,
      shippingPrice: Number(safeShippingPrice) || 0,
      taxPrice: Number(taxPrice) || 0,
      discount: Number(discount) || 0,
      totalPrice: Number(totalPrice) || 0,
    };
  } catch (error) {
    console.error("calcDeliveryDateAndPrice error:", error);
    return {
      deliveryDateIndex: 0,
      itemsPrice: 0,
      shippingPrice: 0,
      taxPrice: 0,
      discount: 0,
      totalPrice: 0,
    };
  }
};

// GET ORDERS BY USER
export async function getOrderSummary(date: DateRange) {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();

  const query = {
    createdAt: {
      $gte: date.from,
      $lte: date.to,
    },
  };

  const [
    ordersCount,
    productsCount,
    usersCount,
    reviewsCount,
    newslettersCount,
    ticketsCount,
  ] = await Promise.all([
    Order.countDocuments(query),
    Product.countDocuments(query),
    User.countDocuments(query),
    Review.countDocuments(query),
    NewsletterSubscription.countDocuments({
      ...query,
      status: "subscribed",
    }),
    SupportTicket.countDocuments({ status: "open" }),
  ]);

  const totalSalesResult = await Order.aggregate([
    {
      $match: query,
    },
    {
      $group: {
        _id: null,
        sales: { $sum: "$totalPrice" },
      },
    },
    { $project: { totalSales: { $ifNull: ["$sales", 0] } } },
  ]);
  const totalSales = totalSalesResult[0] ? totalSalesResult[0].totalSales : 0;

  const avgOrderValue = ordersCount > 0 ? totalSales / ordersCount : 0;

  const orderStatusDistribution = await Order.aggregate([
    { $match: query },
    { $group: { _id: "$status", value: { $sum: 1 } } },
    { $project: { name: "$_id", value: 1, _id: 0 } },
  ]);

  const today = new Date();
  const sixMonthEarlierDate = new Date(
    today.getFullYear(),
    today.getMonth() - 5,
    1,
  );
  const monthlySales = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: sixMonthEarlierDate,
        },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        totalSales: { $sum: "$totalPrice" },
      },
    },
    {
      $project: {
        _id: 0,
        label: "$_id",
        value: "$totalSales",
      },
    },

    { $sort: { label: 1 } },
  ]);
  const topSalesCategories = await getTopSalesCategories(date);
  const topSalesProducts = await getTopSalesProducts(date);

  const {
    common: { pageSize },
  } = await getSetting();
  const limit = pageSize;
  const latestOrders = await Order.find()
    .populate("user", "name")
    .sort({ createdAt: "desc" })
    .limit(limit);

  const latestReviews = await Review.find()
    .sort({ createdAt: "desc" })
    .limit(5)
    .populate("user", "name")
    .populate("product", "name");

  const latestSubscribers = await NewsletterSubscription.find()
    .sort({ subscribedAt: "desc" })
    .limit(5)
    .lean();

  return {
    ordersCount,
    productsCount,
    usersCount,
    reviewsCount,
    newslettersCount,
    ticketsCount,
    totalSales,
    avgOrderValue,
    orderStatusDistribution: JSON.parse(JSON.stringify(orderStatusDistribution)),
    monthlySales: JSON.parse(JSON.stringify(monthlySales)),
    salesChartData: JSON.parse(JSON.stringify(await getSalesChartData(date))),
    topSalesCategories: JSON.parse(JSON.stringify(topSalesCategories)),
    topSalesProducts: JSON.parse(JSON.stringify(topSalesProducts)),
    latestOrders: JSON.parse(JSON.stringify(latestOrders)) as IOrderList[],
    latestReviews: JSON.parse(JSON.stringify(latestReviews)),
    latestSubscribers: JSON.parse(JSON.stringify(latestSubscribers)),
  };
}

async function getSalesChartData(date: DateRange) {
  "use cache";
  cacheLife("hours");
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: date.from,
          $lte: date.to,
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        totalSales: { $sum: "$totalPrice" },
      },
    },
    {
      $project: {
        _id: 0,
        date: {
          $concat: [
            { $toString: "$_id.year" },
            "/",
            { $toString: "$_id.month" },
            "/",
            { $toString: "$_id.day" },
          ],
        },
        totalSales: 1,
      },
    },
    { $sort: { date: 1 } },
  ]);

  return result;
}

async function getTopSalesProducts(date: DateRange) {
  "use cache";
  cacheLife("hours");
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: date.from,
          $lte: date.to,
        },
      },
    },
    // Step 1: Unwind orderItems array
    { $unwind: "$items" },

    // Step 2: Group by productId to calculate total sales per product
    {
      $group: {
        _id: {
          name: "$items.name",
          image: "$items.image",
          _id: "$items.product",
        },
        totalSales: {
          $sum: { $multiply: ["$items.quantity", "$items.price"] },
        }, // Assume quantity field in orderItems represents units sold
      },
    },
    {
      $sort: {
        totalSales: -1,
      },
    },
    { $limit: 6 },

    // Step 3: Replace productInfo array with product name and format the output
    {
      $project: {
        _id: 0,
        id: "$_id._id",
        label: "$_id.name",
        image: "$_id.image",
        value: "$totalSales",
      },
    },

    // Step 4: Sort by totalSales in descending order
    { $sort: { _id: 1 } },
  ]);

  return result;
}

async function getTopSalesCategories(date: DateRange, limit = 5) {
  "use cache";
  cacheLife("hours");
  const result = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: date.from,
          $lte: date.to,
        },
      },
    },
    // Step 1: Unwind orderItems array
    { $unwind: "$items" },
    // Step 2: Group by productId to calculate total sales per product
    {
      $group: {
        _id: "$items.category",
        totalSales: { $sum: "$items.quantity" }, // Assume quantity field in orderItems represents units sold
      },
    },
    // Step 3: Sort by totalSales in descending order
    { $sort: { totalSales: -1 } },
    // Step 4: Limit to top N products
    { $limit: limit },
  ]);

  return result;
}

export async function markPaystackOrderAsPaid(
  orderId: string,
  paymentInfo: {
    id: string;
    status: string;
    email_address: string;
    pricePaid: string;
    paymentMethod?: string;
    paymentReference?: string;
    gateway?: string;
    currency?: string;
    paidAtGateway?: Date;
    channel?: string;
    authorization?: {
      card_type?: string;
      bank?: string;
      brand?: string;
      last4?: string;
      exp_month?: string;
      exp_year?: string;
    };
  },
) {
  try {
    if (
      !paymentInfo.id ||
      !paymentInfo.email_address ||
      !paymentInfo.pricePaid
    ) {
      throw new Error("Missing required payment information");
    }

    return await processOrderPayment(orderId, paymentInfo);
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}
