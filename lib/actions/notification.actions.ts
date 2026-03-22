"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../db";
import { getServerSession } from "../get-session";
import { formatError } from "../utils";
import Order from "../db/models/order.model";
import Review from "../db/models/review.model";
import StockSubscription from "../db/models/stock-subscription.model";
import User from "../db/models/user.model";
import AdminNotificationState from "../db/models/admin-notification-state.model";

export type AdminNotificationItem = {
  id: string;
  type: "order" | "review" | "stock-subscription" | "customer";
  title: string;
  description: string;
  href: string;
  createdAt: string;
  isUnread: boolean;
  meta: string;
};

export type AdminNotificationFeed = {
  unreadCount: number;
  lastSeenAt: string | null;
  items: AdminNotificationItem[];
};

type OrderNotificationSource = {
  _id: { toString(): string } | string;
  createdAt: Date | string;
  totalPrice?: number;
  isPaid?: boolean;
  items?: Array<unknown>;
  user?: {
    name?: string;
    email?: string;
  } | null;
};

type ReviewNotificationSource = {
  _id: { toString(): string } | string;
  createdAt: Date | string;
  rating: number;
  title?: string;
  isVerifiedPurchase?: boolean;
  user?: {
    name?: string;
    email?: string;
  } | null;
  product?: {
    name?: string;
  } | null;
};

type StockSubscriptionNotificationSource = {
  _id: { toString(): string } | string;
  createdAt?: Date | string;
  subscribedAt?: Date | string;
  email: string;
  isNotified?: boolean;
  product?: {
    name?: string;
  } | null;
};

type CustomerNotificationSource = {
  _id: { toString(): string } | string;
  createdAt: Date | string;
  name?: string;
  email?: string;
  emailVerified?: boolean;
};

const asId = (value: { toString(): string } | string) => value.toString();
const asDate = (value: Date | string) => new Date(value).toISOString();

const ensureAdminSession = async () => {
  const session = await getServerSession();
  if (!session) throw new Error("User is not authenticated");
  if (session.user.role !== "ADMIN") throw new Error("Admin permission required");
  return session;
};

export async function getAdminNotificationFeed(
  limit = 12
): Promise<AdminNotificationFeed> {
  await connectToDatabase();
  const session = await ensureAdminSession();

  const state = await AdminNotificationState.findOne({
    adminUser: session.user.id,
  }).lean();

  const lastSeenAt = state?.lastSeenAt ? new Date(state.lastSeenAt) : null;

  const [orders, reviews, subscriptions, customers] = (await Promise.all([
    Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    Review.find()
      .populate("user", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
    StockSubscription.find()
      .populate("product", "name")
      .sort({ subscribedAt: -1, createdAt: -1 })
      .limit(limit)
      .lean(),
    User.find({ role: { $ne: "ADMIN" } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean(),
  ])) as [
    OrderNotificationSource[],
    ReviewNotificationSource[],
    StockSubscriptionNotificationSource[],
    CustomerNotificationSource[],
  ];

  const items: AdminNotificationItem[] = [
    ...orders.map((order) => ({
      id: `order-${asId(order._id)}`,
      type: "order" as const,
      title: "New order received",
      description: `${order.user?.name || "Customer"} placed an order for ${new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(order.totalPrice || 0)}${order.items?.length ? ` with ${order.items.length} item${order.items.length > 1 ? "s" : ""}` : ""}.`,
      href: `/admin/orders/${asId(order._id)}`,
      createdAt: asDate(order.createdAt),
      isUnread: lastSeenAt ? new Date(order.createdAt) > lastSeenAt : true,
      meta: order.isPaid ? "Paid order" : "Awaiting payment",
    })),
    ...reviews.map((review) => ({
      id: `review-${asId(review._id)}`,
      type: "review" as const,
      title: "New product review",
      description: `${review.user?.name || "Customer"} rated ${review.product?.name || "a product"} ${review.rating}/5${review.title ? ` — ${review.title}` : ""}.`,
      href: "/admin/reviews",
      createdAt: asDate(review.createdAt),
      isUnread: lastSeenAt ? new Date(review.createdAt) > lastSeenAt : true,
      meta: review.isVerifiedPurchase ? "Verified purchase" : "Customer feedback",
    })),
    ...subscriptions.map((subscription) => ({
      id: `stock-subscription-${asId(subscription._id)}`,
      type: "stock-subscription" as const,
      title: "Restock request created",
      description: `${subscription.email} asked to be notified when ${subscription.product?.name || "a product"} is back in stock.`,
      href: "/admin/stockSubs",
      createdAt: asDate(
        subscription.subscribedAt || subscription.createdAt || new Date()
      ),
      isUnread: lastSeenAt
        ? new Date(
            subscription.subscribedAt || subscription.createdAt || new Date()
          ) > lastSeenAt
        : true,
      meta: subscription.isNotified ? "Already notified" : "Waiting for restock",
    })),
    ...customers.map((customer) => ({
      id: `customer-${asId(customer._id)}`,
      type: "customer" as const,
      title: "New customer account",
      description: `${customer.name || customer.email} created an account${customer.email ? ` with ${customer.email}` : ""}.`,
      href: "/admin/users",
      createdAt: asDate(customer.createdAt),
      isUnread: lastSeenAt ? new Date(customer.createdAt) > lastSeenAt : true,
      meta: customer.emailVerified ? "Email verified" : "Needs verification",
    })),
  ]
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, limit);

  return {
    unreadCount: items.filter((item) => item.isUnread).length,
    lastSeenAt: lastSeenAt?.toISOString() ?? null,
    items,
  };
}

export async function markAdminNotificationsRead() {
  try {
    await connectToDatabase();
    const session = await ensureAdminSession();

    await AdminNotificationState.findOneAndUpdate(
      { adminUser: session.user.id },
      {
        $set: { lastSeenAt: new Date() },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    revalidatePath("/admin");
    return { success: true, message: "Notifications marked as read." };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
