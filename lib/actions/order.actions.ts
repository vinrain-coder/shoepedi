"use server";

import { Cart, IOrderList, OrderItem, ShippingAddress } from "@/types";
import { formatError, round2 } from "../utils";
import {
  canTransitionOrderStatus,
  generateTrackingNumber,
  normalizeOrderStatus,
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
} from "@/emails";
import { DateRange } from "react-day-picker";
import Product from "../db/models/product.model";
import User from "../db/models/user.model";
import mongoose from "mongoose";
import { getSetting } from "./setting.actions";
import { getServerSession } from "../get-session";
import { cacheLife } from "next/cache";
import { validateCoupon, incrementCouponUsage } from "./coupon.actions";
import { getAffiliateByCode } from "./affiliate.actions";
import Affiliate from "../db/models/affiliate.model";
import AffiliateEarning from "../db/models/affiliate-earning.model";
import { cookies } from "next/headers";
//import { sendAskReviewOrderItems, sendPurchaseReceipt } from "../email/transactional";

export type SerializedOrder = Omit<IOrder, "_id"> & { _id: string };

type OrderCouponInput = {
  _id?: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountAmount?: number;
  isAffiliate?: boolean;
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

  const user = order.user as unknown as { email?: string };
  if (!user?.email) return;

  const { site } = await getSetting();
  const trackingLink = `${site.url}${buildTrackingLink(order.trackingNumber)}`;

  await sendOrderTrackingNotification({
    order,
    statusLabel: ORDER_STATUS_LABELS[status],
    statusMessage: message,
    trackingLink,
  });
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

  order.status = nextStatus;

  if (nextStatus === "delivered") {
    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.shipment = {
      ...order.shipment,
      deliveredAt: order.deliveredAt,
    };
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
  const affiliateCode = cookieStore.get("affiliate_code")?.value;
  let affiliateId: string | undefined;

  if (affiliateCode) {
    const affiliate = await getAffiliateByCode(affiliateCode);
    if (affiliate) {
      affiliateId = affiliate._id.toString();
    }
  }

  const cart = {
    ...clientSideCart,
    ...calcDeliveryDateAndPrice({
      items: clientSideCart.items,
      shippingAddress: clientSideCart.shippingAddress,
      deliveryDateIndex: clientSideCart.deliveryDateIndex,
    }),
  };

  let appliedCoupon:
    | {
        _id?: string;
        code: string;
        discountType: "percentage" | "fixed";
        discountAmount: number;
        isAffiliate?: boolean;
      }
    | undefined;

  let totalPrice = cart.totalPrice;
  if (coupon?.code) {
    const validatedCoupon = await validateCoupon(coupon.code, cart.itemsPrice);

    appliedCoupon = {
      _id: validatedCoupon.coupon._id,
      code: validatedCoupon.coupon.code,
      discountType: validatedCoupon.coupon.discountType as "percentage" | "fixed",
      discountAmount: validatedCoupon.discount,
      isAffiliate: (validatedCoupon.coupon as any).isAffiliate,
    };
    totalPrice = round2(cart.totalPrice - validatedCoupon.discount);

    if (appliedCoupon.isAffiliate) {
      affiliateId = appliedCoupon._id;
      affiliateCode = appliedCoupon.code;
    }
  }

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

export async function updateOrderToPaid(orderId: string) {
  try {
    await connectToDatabase();
    const order = await Order.findById(orderId).populate<{
      user: { email: string; name: string };
    }>("user", "name email");
    if (!order) throw new Error("Order not found");
    if (order.isPaid) throw new Error("Order is already paid");
    order.isPaid = true;
    order.paidAt = new Date();
    appendTrackingHistory(order, {
      status: order.status,
      message: "Payment received successfully.",
      source: "system",
    });
    await order.save();
    if (!process.env.MONGODB_URI?.startsWith("mongodb://localhost"))
      await updateProductStock(order._id.toString());
    if (order.coupon?._id && !order.coupon.isAffiliate)
      await incrementCouponUsage(order.coupon._id.toString());

    // Calculate Affiliate Earnings
    if (order.affiliate) {
      const { affiliate: settings } = await getSetting();
      if (settings?.enabled) {
        const affiliateDoc = await Affiliate.findById(order.affiliate);

        if (affiliateDoc && affiliateDoc.status === "approved") {
          const commissionRate =
            affiliateDoc.commissionRate !== undefined
              ? affiliateDoc.commissionRate
              : settings.commissionRate;

          const commissionAmount = round2(
            (order.itemsPrice * commissionRate) / 100,
          );

          const existingEarning = await AffiliateEarning.findOne({
            order: order._id,
          });

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
          }
        }
      }
    }

    if (order.user.email)
      await sendPurchaseReceipt({ order: order as unknown as IOrder });
    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}`);
    return { success: true, message: "Order paid successfully" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

const updateProductStock = async (orderId: string) => {
  const session = await mongoose.connection.startSession();

  try {
    session.startTransaction();
    const opts = { session };

    // IMPORTANT: load the full order, not findOneAndUpdate
    const order = await Order.findById(orderId).session(session);
    if (!order) throw new Error("Order not found");

    // update stock item-by-item
    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) throw new Error("Product not found");

      product.countInStock -= item.quantity;

      await Product.updateOne(
        { _id: product._id },
        { countInStock: product.countInStock },
        opts,
      );
    }

    await session.commitTransaction();
    session.endSession();
    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
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
        await sendAskReviewOrderItems({ order: order as unknown as IOrder });
      }
    }

    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(buildTrackingLink(order.trackingNumber));

    return { success: true, message: "Order status updated successfully" };
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
}: {
  limit?: number;
  page: number;
}) {
  "use cache";
  cacheLife("minutes");
  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  await connectToDatabase();
  const skipAmount = (Number(page) - 1) * limit;
  const orders = await Order.find()
    .populate("user", "name")
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(limit);
  const ordersCount = await Order.countDocuments();
  return {
    data: JSON.parse(JSON.stringify(orders)) as IOrderList[],
    totalPages: Math.ceil(ordersCount / limit),
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
  items,
  shippingAddress,
  deliveryDateIndex,
}: {
  deliveryDateIndex?: number;
  items: OrderItem[];
  shippingAddress?: ShippingAddress;
}) => {
  const { availableDeliveryDates } = await getSetting();
  const itemsPrice = round2(
    items.reduce((acc, item) => acc + item.price * item.quantity, 0),
  );

  const deliveryDate =
    availableDeliveryDates[
      deliveryDateIndex === undefined
        ? availableDeliveryDates.length - 1
        : deliveryDateIndex
    ];
  const shippingPrice =
    !shippingAddress || !deliveryDate
      ? undefined
      : deliveryDate.freeShippingMinPrice > 0 &&
          itemsPrice >= deliveryDate.freeShippingMinPrice
        ? 0
        : deliveryDate.shippingPrice;

  const taxPrice = !shippingAddress ? undefined : round2(itemsPrice * 0);
  const totalPrice = round2(
    itemsPrice +
      (shippingPrice ? round2(shippingPrice) : 0) +
      (taxPrice ? round2(taxPrice) : 0),
  );
  return {
    availableDeliveryDates,
    deliveryDateIndex:
      deliveryDateIndex === undefined
        ? availableDeliveryDates.length - 1
        : deliveryDateIndex,
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  };
};

// GET ORDERS BY USER
export async function getOrderSummary(date: DateRange) {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();

  const ordersCount = await Order.countDocuments({
    createdAt: {
      $gte: date.from,
      $lte: date.to,
    },
  });
  const productsCount = await Product.countDocuments({
    createdAt: {
      $gte: date.from,
      $lte: date.to,
    },
  });
  const usersCount = await User.countDocuments({
    createdAt: {
      $gte: date.from,
      $lte: date.to,
    },
  });

  const totalSalesResult = await Order.aggregate([
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
        _id: null,
        sales: { $sum: "$totalPrice" },
      },
    },
    { $project: { totalSales: { $ifNull: ["$sales", 0] } } },
  ]);
  const totalSales = totalSalesResult[0] ? totalSalesResult[0].totalSales : 0;

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

    { $sort: { label: -1 } },
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
  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    monthlySales: JSON.parse(JSON.stringify(monthlySales)),
    salesChartData: JSON.parse(JSON.stringify(await getSalesChartData(date))),
    topSalesCategories: JSON.parse(JSON.stringify(topSalesCategories)),
    topSalesProducts: JSON.parse(JSON.stringify(topSalesProducts)),
    latestOrders: JSON.parse(JSON.stringify(latestOrders)) as IOrderList[],
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
    await connectToDatabase();

    // ----------------------------------------------------
    // 1. Load order with populated user
    // ----------------------------------------------------
    const order = await Order.findById(orderId).populate<{
      user: { email: string; name: string };
    }>("user", "name email");

    if (!order) throw new Error("Order not found");
    if (order.isPaid) throw new Error("Order is already paid");

    if (
      !paymentInfo.id ||
      !paymentInfo.email_address ||
      !paymentInfo.pricePaid
    ) {
      throw new Error("Missing required payment information");
    }

    // ----------------------------------------------------
    // 2. Update payment result (BUT DO NOT update stock here)
    // ----------------------------------------------------
    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = paymentInfo;
    appendTrackingHistory(order, {
      status: order.status,
      message: "Payment verified by gateway.",
      source: "system",
    });
    await order.save();

    // ----------------------------------------------------
    // 3. ALWAYS update stock (also inside transactions)
    // ----------------------------------------------------
    await updateProductStock(order._id.toString());
    if (order.coupon?._id) {
      await incrementCouponUsage(order.coupon._id.toString());
    }

    // ----------------------------------------------------
    // 4. Email receipt
    // ----------------------------------------------------
    if (!order.user || !order.user.email) {
      const populatedUser = await User.findById(order.user);
      if (populatedUser?.email) {
        order.user = populatedUser;
      }
    }

    if (order.user?.email) {
      await sendPurchaseReceipt({ order: order as unknown as IOrder });
    }

    // ----------------------------------------------------
    // 5. Revalidate cache & return
    // ----------------------------------------------------
    revalidatePath(`/account/orders/${orderId}`);
    revalidatePath(`/admin/orders/${orderId}`);

    return { success: true, message: "Order paid successfully" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}
