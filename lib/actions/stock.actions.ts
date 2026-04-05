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
import { cacheLife } from "next/cache";

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
    // We need to find products that match the query to filter by product name
    const products = await Product.find({
      name: { $regex: query, $options: "i" },
    }).select("_id");
    const productIds = products.map((p) => p._id);

    filterQuery.$or = [
      { email: { $regex: query, $options: "i" } },
      { product: { $in: productIds } },
    ];
  }

  if (from || to) {
    filterQuery.subscribedAt = {};
    if (from) filterQuery.subscribedAt.$gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      filterQuery.subscribedAt.$lte = toDate;
    }
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
    const products = await Product.find({
      name: { $regex: query, $options: "i" },
    }).select("_id");
    const productIds = products.map((p) => p._id);
    filterQuery.$or = [
      { email: { $regex: query, $options: "i" } },
      { product: { $in: productIds } },
    ];
  }
  if (from || to) {
    filterQuery.subscribedAt = {};
    if (from) filterQuery.subscribedAt.$gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      filterQuery.subscribedAt.$lte = toDate;
    }
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
 * Notify all subscribers about product restock.
 */
export const notifySubscribers = async (productId: string) => {
  try {
    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) return { success: false, message: "Product not found." };

    if (product.countInStock > 0) {
      const subscriptions = await StockSubscription.find({
        product: productId,
        isNotified: false,
      });

      if (subscriptions.length === 0)
        return { success: true, message: "No subscribers to notify." };

      await Promise.all(
        subscriptions.map((sub) =>
          sendStockSubscriptionNotification({ email: sub.email, product })
        )
      );

      // Mark them as notified
      await StockSubscription.updateMany(
        { product: productId, isNotified: false },
        { $set: { isNotified: true, notifiedAt: new Date() } }
      );

      revalidatePath("/admin/stockSubs");
      return { success: true, message: `Successfully notified ${subscriptions.length} subscribers.` };
    }

    return { success: false, message: "Product is still out of stock." };
  } catch (error) {
    console.error("❌ Stock notification error:", error);
    return { success: false, message: "An error occurred." };
  }
};

/**
 * Delete a stock subscription.
 */
export const deleteStockSubscription = async (id: string) => {
  try {
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
