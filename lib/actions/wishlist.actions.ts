"use server";

import mongoose, { ObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "@/lib/get-session";
import { IProduct } from "../db/models/product.model";

// Helper: get the native MongoDB Db object
async function getDb() {
  const conn = await connectToDatabase(); // returns a Mongoose connection
  return conn.connection.db; // use the underlying native MongoDB driver
}

// Helper: get current user
async function getCurrentUser() {
  const db = await getDb();
  const session = await getServerSession();
  if (!session?.user?.id) return null;

  return await db.collection("users").findOne({
    _id: new mongoose.Types.ObjectId(session.user.id),
  });
}

// ✅ Get wishlist product IDs
export async function getWishlist(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  return (Array.isArray(user.wishlist) ? user.wishlist : []).map(
    (id: ObjectId) => id.toString()
  );
}

// ✅ Add product to wishlist
export async function addToWishlist(productId: string): Promise<string[]> {
  const db = await getDb();
  const session = await getServerSession();
  if (!session?.user?.id) return [];

  const result = await db
    .collection("users")
    .findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(session.user.id) },
      { $addToSet: { wishlist: new mongoose.Types.ObjectId(productId) } },
      { returnDocument: "after" }
    );

  return (
    Array.isArray(result.value?.wishlist) ? result.value.wishlist : []
  ).map((id: ObjectId) => id.toString());
}

// ✅ Remove product from wishlist
export async function removeFromWishlist(productId: string): Promise<string[]> {
  const db = await getDb();
  const session = await getServerSession();
  if (!session?.user?.id) return [];

  const result = await db
    .collection("users")
    .findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(session.user.id) },
      { $pull: { wishlist: new mongoose.Types.ObjectId(productId) } },
      { returnDocument: "after" }
    );

  return (
    Array.isArray(result.value?.wishlist) ? result.value.wishlist : []
  ).map((id: ObjectId) => id.toString());
}

// ✅ Fetch full product details for wishlist
export async function getWishlistProducts(): Promise<IProduct[]> {
  const db = await getDb();
  const user = await getCurrentUser();
  if (
    !user?.wishlist ||
    !Array.isArray(user.wishlist) ||
    user.wishlist.length === 0
  )
    return [];

  const products = await db
    .collection("products")
    .find({
      _id: {
        $in: user.wishlist.map((id: any) => new mongoose.Types.ObjectId(id)),
      },
    })
    .toArray();

  return products.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
  })) as IProduct[];
}

// ✅ Count wishlist items
export async function getWishlistCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;

  return Array.isArray(user.wishlist) ? user.wishlist.length : 0;
}
