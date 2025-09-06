"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "../db";
import StockSubscription from "../db/models/stock-subscription.model";
import Product from "../db/models/product.model";
import { sendStockSubscriptionNotification } from "@/emails";
import { getSetting } from "./setting.actions";

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

    await StockSubscription.create({
      email,
      product: productId,
      subscribedAt: new Date(),
      isNotified: false, // Reset notified status for new subscriptions
    });

    revalidatePath("/admin/stock-subscriptions");
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
}: {
  limit?: number;
  page: number;
  filter?: "notified" | "pending";
}) {
  const {
    common: { pageSize },
  } = await getSetting();

  // Ensure limit is always a number
  limit = Number(limit ?? pageSize);

  await connectToDatabase();

  const skipAmount = (Number(page) - 1) * limit;

  let query = {};
  if (filter === "notified") query = { isNotified: true };
  if (filter === "pending") query = { isNotified: false };

  const subscriptions = await StockSubscription.find(query)
    .populate("product")
    .sort({ subscribedAt: "desc" }) // Sorting by latest subscriptions first
    .skip(skipAmount)
    .limit(limit);

  const totalSubscriptions = await StockSubscription.countDocuments(query);

  return {
    data: JSON.parse(JSON.stringify(subscriptions)),
    totalPages: Math.ceil(totalSubscriptions / limit),
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

      console.log(
        `✅ Notified ${subscriptions.length} subscribers about "${product.name}"`
      );

      // Instead of deleting, mark them as notified
      await StockSubscription.updateMany(
        { product: productId, isNotified: false },
        { $set: { isNotified: true, notifiedAt: new Date() } }
      );

      revalidatePath("/admin/stock-subscriptions");
      return { success: true, message: "Subscribers notified." };
    }

    return { success: false, message: "Product is still out of stock." };
  } catch (error) {
    console.error("❌ Stock notification error:", error);
    return { success: false, message: "An error occurred." };
  }
};
