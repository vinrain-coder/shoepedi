"use server";

import { cacheLife } from "next/cache";
import { connectToDatabase } from "../../db";
import { getServerSession } from "../../get-session";
import { getFirstPurchaseDiscountQuoteForUser, serializeOrder, ensureTrackingState } from "./helpers";
import Order from "../../db/models/order.model";
import { escapeRegExp, round2 } from "../../utils";
import User from "../../db/models/user.model";
import mongoose from "mongoose";
import { getSetting } from "../setting.actions";
import { cookies } from "next/headers";
import { OrderItem, ShippingAddress, IOrderList } from "@/types";
import DeliveryLocation from "../../db/models/delivery-location.model";
import { calculateShippingPrice } from "../../delivery";

export const getFirstPurchaseDiscountQuote = async (itemsPrice: number, email?: string) => {
  try {
    await connectToDatabase();
    const session = await getServerSession();

    return await getFirstPurchaseDiscountQuoteForUser(
      session?.user?.id,
      email,
      itemsPrice
    );
  } catch (error) {
    console.error("Failed to fetch first purchase discount quote:", error);
    return { eligible: false, rate: 0, discountAmount: 0 };
  }
};

export async function getOrderByTrackingNumber(trackingNumber: string) {
  await connectToDatabase();
  const order = await Order.findOne({ trackingNumber }).select(
    "_id trackingNumber status trackingHistory shipment expectedDeliveryDate shippingAddress items itemsPrice shippingPrice taxPrice totalPrice updatedAt",
  );

  if (!order) return null;
  const hydrated = await ensureTrackingState(order as any);
  return serializeOrder(hydrated);
}

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
      { userName: { $regex: escapedQuery, $options: "i" } },
      { userEmail: { $regex: escapedQuery, $options: "i" } },
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
      { userName: { $regex: escapedQuery, $options: "i" } },
      { userEmail: { $regex: escapedQuery, $options: "i" } },
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
  accessToken?: string,
) {
  "use cache: private";
  cacheLife("hours");
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return null;
  }

  const session = await getServerSession();
  const cookieStore = await cookies();
  const guestAccessToken = accessToken || cookieStore.get(`guest_order_access_${orderId}`)?.value;

  const query: any = { _id: orderId };

  if (session?.user?.role !== "ADMIN") {
    if (session?.user?.id) {
      query.$or = [
        { user: session.user.id },
        { isGuest: true, accessToken: guestAccessToken }
      ];
    } else {
      query.isGuest = true;
      query.accessToken = guestAccessToken;
    }
  }

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
