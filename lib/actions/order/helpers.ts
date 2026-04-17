import { IOrder } from "../../db/models/order.model";
import { FirstPurchaseDiscountQuote, SerializedOrder } from "./types";
import { getSetting } from "../setting.actions";
import { round2 } from "../../utils";
import User from "../../db/models/user.model";
import Order from "../../db/models/order.model";
import {
  generateTrackingNumber,
  ORDER_STATUS_LABELS,
  OrderTrackingHistoryEventInput,
  OrderTrackingStatus,
  shouldSendStatusNotification,
  ORDER_STATUS_FLOW,
  canTransitionOrderStatus,
} from "../../order-tracking";
import {
  sendOrderTrackingNotification,
  sendPurchaseReceipt,
} from "@/lib/email/transactional";
import AffiliateEarning from "../../db/models/affiliate-earning.model";
import Affiliate from "../../db/models/affiliate.model";
import { decrementCouponUsage, incrementCouponUsage } from "../coupon.actions";
import Product from "../../db/models/product.model";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../../db";

export const getFirstPurchaseDiscountQuoteForUser = async (
  userId: string | undefined,
  email: string | undefined,
  itemsPrice: number,
): Promise<FirstPurchaseDiscountQuote> => {
  const {
    common: { firstPurchaseDiscountRate = 0 },
  } = await getSetting();
  const normalizedRate = Math.max(0, Math.min(100, Number(firstPurchaseDiscountRate) || 0));
  const normalizedItemsPrice = Math.max(0, Number(itemsPrice) || 0);

  if ((!userId && !email) || normalizedRate <= 0 || normalizedItemsPrice <= 0) {
    return { eligible: false, rate: normalizedRate, discountAmount: 0 };
  }

  let existingOrdersCount = 0;
  let firstPurchaseDiscountUsed = false;

  if (userId) {
    const [user, userOrdersCount] = await Promise.all([
      User.findById(userId).select("firstPurchaseDiscountUsed").lean(),
      Order.countDocuments({ user: userId }),
    ]);
    firstPurchaseDiscountUsed = user?.firstPurchaseDiscountUsed || false;
    existingOrdersCount = userOrdersCount;
  } else if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    existingOrdersCount = await Order.countDocuments({ userEmail: normalizedEmail });
  }

  if (firstPurchaseDiscountUsed || existingOrdersCount > 0) {
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

export const serializeOrder = (order: IOrder | null): SerializedOrder | null => {
  if (!order) return null;

  const serializedOrder = JSON.parse(JSON.stringify(order)) as SerializedOrder;

  // Security: Always omit accessToken in general serialization
  if (serializedOrder.accessToken) {
    delete (serializedOrder as any).accessToken;
  }

  return {
    ...serializedOrder,
    _id: serializedOrder._id.toString(),
  };
};

export const buildTrackingLink = (trackingNumber: string) =>
  `/track/${encodeURIComponent(trackingNumber)}`;

export const ensureTrackingState = async (order: IOrder | (IOrder & { user?: { email?: string; name?: string } })) => {
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

export const appendTrackingHistory = (
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

export const notifyCustomerOrderStatus = async (
  order: IOrder | (IOrder & { user?: { email?: string; name?: string } }),
  status: OrderTrackingStatus,
  message: string,
) => {
  if (!shouldSendStatusNotification(status)) return;

  let email = order.userEmail || (order.user as unknown as { email?: string })?.email;

  if (!email && order.user) {
     const populatedOrder = await Order.findById(order._id).populate("user", "email name");
     email = (populatedOrder?.user as unknown as { email?: string })?.email;
     if (email) {
       (order as any).user = populatedOrder?.user;
       order.userEmail = email;
     }
  } else if (email && !order.userEmail) {
    order.userEmail = email;
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

export const revertOrderEffects = async (order: IOrder, options: { refundToCoins: boolean } = { refundToCoins: true }) => {
  const userId = (order.user as any)?._id || order.user;

  // 1. Refund paid amount to coins if paid and not already refunded (Only for cancellations)
  if (options.refundToCoins && order.isPaid && userId) {
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

  if (updatedOrderForCoins && order.coinsEarned > 0 && userId) {
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

export const runStatusTransition = async ({
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
    const finalEmail = order.userEmail || user?.email;
    if (finalEmail) {
      if (!order.userEmail) {
        order.userEmail = finalEmail;
      }
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

export const updateProductStock = async (orderId: string) => {
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

export const runPostPaymentSideEffects = async (orderId: string) => {
  const order = await Order.findById(orderId);
  if (!order) return;

  // 1. Credit earned coins to user
  try {
    const userId = (order.user as any)?._id || order.user;
    if (userId && order.coinsEarned > 0 && !order.coinsCredited) {
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
    const emailUser = (populatedOrder?.user as unknown as { email?: string })?.email;
    const finalEmail = populatedOrder?.userEmail || emailUser;

    if (finalEmail) {
      if (!populatedOrder?.userEmail) {
        populatedOrder!.userEmail = finalEmail;
      }
      await sendPurchaseReceipt(populatedOrder as unknown as IOrder);
    }
  } catch (emailError) {
    console.error("Non-critical: Failed to send purchase receipt email:", emailError);
  }

  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}`);
};

export const processOrderPayment = async (orderId: string, paymentInfo?: any) => {
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
