"use server";

import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user.model";
import mongoose from "mongoose";
import { IProduct } from "../db/models/product.model";
import { getServerSession } from "../get-session";

// Get wishlist product IDs
export async function getWishlist() {
  await connectToDatabase();
  const session = await getServerSession();
  if (!session) return [];

  const user = await User.findOne({ email: session.user?.email }).select(
    "wishlist"
  );
  return (
    user?.wishlist.map((id: mongoose.Types.ObjectId) => id.toString()) || []
  );
}

// Add product to wishlist
export async function addToWishlist(productId: string) {
  await connectToDatabase();
  const session = await getServerSession();
  if (!session) return [];

  const user = await User.findOneAndUpdate(
    { email: session.user?.email },
    { $addToSet: { wishlist: new mongoose.Types.ObjectId(productId) } },
    { new: true }
  ).select("wishlist");

  return (
    user?.wishlist.map((id: mongoose.Types.ObjectId) => id.toString()) || []
  );
}

// Remove product from wishlist
export async function removeFromWishlist(productId: string) {
  await connectToDatabase();
  const session = await getServerSession();
  if (!session) return [];

  const user = await User.findOneAndUpdate(
    { email: session.user?.email },
    { $pull: { wishlist: new mongoose.Types.ObjectId(productId) } },
    { new: true }
  ).select("wishlist");

  return (
    user?.wishlist.map((id: mongoose.Types.ObjectId) => id.toString()) || []
  );
}

// Fetch full product details for wishlist
export async function getWishlistProducts(): Promise<IProduct[]> {
  await connectToDatabase();
  const session = await getServerSession();
  if (!session) return [];

  const user = await User.findOne({ email: session.user?.email })
    .populate<{ wishlist: IProduct[] }>({
      path: "wishlist",
      model: "Product",
    })
    .lean(); // Convert Mongoose documents to plain JS objects

  if (!user?.wishlist) return [];

  // Convert _id fields to strings
  return user.wishlist.map((product) => ({
    ...product,
    _id: product._id.toString(), // Convert ObjectId to string
  }));
}
