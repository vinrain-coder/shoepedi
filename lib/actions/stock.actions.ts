"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../db";
import StockSubscription from "../db/models/stock-subscription.model";
import Product from "../db/models/product.model";
import {
  sendAdminEventNotification,
  sendStockSubscriptionNotification,
} from "@/lib/email/transactional";
import { getSetting } from "./setting.actions";
import { escapeRegExp, normalizeDateRange } from "@/lib/utils";
import { getServerSession } from "@/lib/get-session";

/**
 * Subscribe to stock notifications for a product.
 */
export const subscribeToStock = async (data: {
  email: string;
  productId: string;
}) => {
  try {
    await connectToDatabase();
    const { email, productId } = data;

    const product = await Product.findById(productId);
    if (!product) return { success: false, message: "Product not found." };

    // Allow re-subscription if the previous subscription was notified
    const existingSubscription = await StockSubscription.findOne({
      email,
      product: productId,
      isNotified: false, // Only block active, non-notified subscriptions
    });

    if (existingSubscription)
      return {
        success: false,
        message: "You are already subscribed to this product.",
      };

    const subscription = await StockSubscription.create({
      email,
      product: productId,
      subscribedAt: new Date(),
      isNotified: false, // Reset notified status for new subscriptions
    });

    await sendAdminEventNotification({
      title: "Restock request created",
      description: `${email} asked to be notified when ${product.name || "a product"} is back in stock.`,
      href: "/admin/stockSubs",
      meta: "Waiting for restock",
      createdAt: (subscription.subscribedAt || new Date()).toISOString(),
    });

    revalidatePath("/admin/stockSubs");
    return { success: true, message: "Subscription successful!" };
  } catch (error) {
    console.error("Error subscribing to stock:", error);
    return { success: false, message: "An error occurred. Please try again." };
  }
};

/**
 * Fetch stock subscriptions with optional filtering.
 */
export async function getAllStockSubscriptions({
  limit,
  page,
  filter,
  query,
  from,
  to,
}: {
  limit?: number;
  page: number;
  filter?: string;
  query?: string;
  from?: string;
  to?: string;
}) {
  const {
    common: { pageSize },
  } = await getSetting();

  // Ensure limit is always a number
  limit = Number(limit ?? pageSize);

  await connectToDatabase();

  const skipAmount = (Number(page) - 1) * limit;

  // Build Filter Query
  const filterQuery: any = {};
  if (filter === "notified") filterQuery.isNotified = true;
  if (filter === "pending") filterQuery.isNotified = false;

  if (query) {
    const escapedQuery = escapeRegExp(query);
    // We need to find products that match the query to filter by product name
    const products = await Product.find({
      name: { $regex: escapedQuery, $options: "i" },
    }).select("_id");
    const productIds = products.map((p) => p._id);

    filterQuery.$or = [
      { email: { $regex: escapedQuery, $options: "i" } },
      { product: { $in: productIds } },
    ];
  }

  const { fromDate, toDate } = normalizeDateRange(from, to);
  if (fromDate || toDate) {
    filterQuery.subscribedAt = {};
    if (fromDate) filterQuery.subscribedAt.$gte = fromDate;
    if (toDate) filterQuery.subscribedAt.$lte = toDate;
  }

  const subscriptions = await StockSubscription.find(filterQuery)
    .populate("product")
    .sort({ subscribedAt: "desc" }) // Sorting by latest subscriptions first
    .skip(skipAmount)
    .limit(limit);

  const totalSubscriptions = await StockSubscription.countDocuments(filterQuery);

  return {
    data: JSON.parse(JSON.stringify(subscriptions)),
    totalPages: Math.ceil(totalSubscriptions / limit),
  };
}

/**
 * Get stock subscription statistics.
 */
export async function getStockSubscriptionStats(params?: {
  query?: string;
  from?: string;
  to?: string;
}) {
  await connectToDatabase();
  const { query, from, to } = params || {};

  const filterQuery: any = {};
  if (query) {
    const escapedQuery = escapeRegExp(query);
    const products = await Product.find({
      name: { $regex: escapedQuery, $options: "i" },
    }).select("_id");
    const productIds = products.map((p) => p._id);
    filterQuery.$or = [
      { email: { $regex: escapedQuery, $options: "i" } },
      { product: { $in: productIds } },
    ];
  }

  const { fromDate, toDate } = normalizeDateRange(from, to);
  if (fromDate || toDate) {
    filterQuery.subscribedAt = {};
    if (fromDate) filterQuery.subscribedAt.$gte = fromDate;
    if (toDate) filterQuery.subscribedAt.$lte = toDate;
  }

  const [total, pending, notified] = await Promise.all([
    StockSubscription.countDocuments(filterQuery),
    StockSubscription.countDocuments({ ...filterQuery, isNotified: false }),
    StockSubscription.countDocuments({ ...filterQuery, isNotified: true }),
  ]);

  return {
    total,
    pending,
    notified,
  };
}

/**
 * Notify subscribers about product restock.
 * Supports notifying either a specific subscription or all pending for a product.
 */
export const notifySubscribers = async ({
  productId,
  subscriptionId,
}: {
  productId?: string;
  subscriptionId?: string;
}) => {
  try {
    const session = await getServerSession();
    if (session?.user.role !== "ADMIN") {
      return { success: false, message: "Admin permission required" };
    }

    await connectToDatabase();

    // 1. Identify subscriptions to notify
    let query: any = { isNotified: false };
    if (subscriptionId) {
      query._id = subscriptionId;
    } else if (productId) {
      query.product = productId;
    } else {
      return { success: false, message: "Product ID or Subscription ID is required." };
    }

    const subscriptions = await StockSubscription.find(query).populate("product");

    if (subscriptions.length === 0) {
      return { success: true, message: "No pending subscriptions to notify." };
    }

    let successCount = 0;
    let failureCount = 0;

    // 2. Process notifications individually for robustness
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        const product = sub.product as any; // Populated product

        if (!product) {
          throw new Error(`Product not found for subscription ${sub._id}`);
        }

        if (product.countInStock <= 0) {
          throw new Error(`Product "${product.name}" is still out of stock.`);
        }

        if (!product.isPublished) {
          throw new Error(`Product "${product.name}" is not published.`);
        }

        // Attempt to send email
        await sendStockSubscriptionNotification(sub.email, product);

        // Update specific subscription upon success
        await StockSubscription.findByIdAndUpdate(sub._id, {
          $set: { isNotified: true, notifiedAt: new Date() },
        });

        return sub.email;
      })
    );

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        successCount++;
      } else {
        failureCount++;
        console.error("❌ Notification failed:", result.reason);
      }
    });

    revalidatePath("/admin/stockSubs");

    if (successCount > 0 && failureCount === 0) {
      return {
        success: true,
        message: `Successfully notified ${successCount} subscriber(s).`,
      };
    } else if (successCount > 0 && failureCount > 0) {
      return {
        success: true,
        message: `Notified ${successCount} subscriber(s), but ${failureCount} failed. Check logs.`,
      };
    } else {
      return {
        success: false,
        message: `Failed to notify subscribers. ${failureCount} error(s) occurred.`,
      };
    }
  } catch (error: any) {
    console.error("❌ Stock notification error:", error);
    return { success: false, message: error.message || "An error occurred." };
  }
};

/**
 * Delete a stock subscription.
 */
export const deleteStockSubscription = async (id: string) => {
  try {
    const session = await getServerSession();
    if (session?.user.role !== "ADMIN") {
      return { success: false, message: "Admin permission required" };
    }

    await connectToDatabase();
    const subscription = await StockSubscription.findByIdAndDelete(id);
    if (!subscription) return { success: false, message: "Subscription not found." };
    revalidatePath("/admin/stockSubs");
    return { success: true, message: "Subscription deleted successfully." };
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return { success: false, message: "An error occurred." };
  }
};

/**
 * Unsubscribe from stock notifications.
 */
export const unsubscribeFromStock = async (email: string, productId: string) => {
  try {
    await connectToDatabase();

    const result = await StockSubscription.deleteMany({
      email: email.toLowerCase().trim(),
      product: productId,
    });

    if (result.deletedCount === 0) {
      return { success: false, message: "No active subscription found for this email and product." };
    }

    revalidatePath("/admin/stockSubs");
    return { success: true, message: "You have been successfully unsubscribed." };
  } catch (error) {
    console.error("❌ Unsubscribe error:", error);
    return { success: false, message: "An error occurred while unsubscribing." };
  }
};
