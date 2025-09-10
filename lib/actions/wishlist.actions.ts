/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import mongoose, { ObjectId } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "@/lib/get-session";
import { IProduct } from "../db/models/product.model";

// Helper: get the native MongoDB Db object
async function getDb() {
  const conn = await connectToDatabase(); // Mongoose connection
  return conn.connection.db; // native MongoDB driver
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

  // Ensure wishlist is an array
  const wishlistArray = Array.isArray(user.wishlist) ? user.wishlist : [];
  return wishlistArray.map((id: ObjectId) => id.toString());
}

// ✅ Add product to wishlist
export async function addToWishlist(productId: string): Promise<string[]> {
  const db = await getDb();
  const session = await getServerSession();
  if (!session?.user?.id) return [];

  const userId = new mongoose.Types.ObjectId(session.user.id);
  const productObjId = new mongoose.Types.ObjectId(productId);

  // Use aggregation update pipeline to ensure wishlist is an array
  const result = await db.collection("users").findOneAndUpdate(
    { _id: userId },
    [
      {
        $set: {
          wishlist: {
            $cond: {
              if: { $not: [{ $isArray: "$wishlist" }] },
              then: [],
              else: "$wishlist",
            },
          },
        },
      },
      {
        $addToSet: { wishlist: productObjId },
      },
    ],
    { returnDocument: "after" }
  );

  const wishlistArray = Array.isArray(result.value?.wishlist)
    ? result.value.wishlist
    : [];
  return wishlistArray.map((id: ObjectId) => id.toString());
}

// ✅ Remove product from wishlist
export async function removeFromWishlist(productId: string): Promise<string[]> {
  const db = await getDb();
  const session = await getServerSession();
  if (!session?.user?.id) return [];

  const userId = new mongoose.Types.ObjectId(session.user.id);
  const productObjId = new mongoose.Types.ObjectId(productId);

  // Ensure wishlist is an array first
  await db.collection("users").updateOne({ _id: userId }, [
    {
      $set: {
        wishlist: {
          $cond: {
            if: { $not: [{ $isArray: "$wishlist" }] },
            then: [],
            else: "$wishlist",
          },
        },
      },
    },
  ]);

  // Remove product
  const result = await db
    .collection("users")
    .findOneAndUpdate(
      { _id: userId },
      { $pull: { wishlist: productObjId } },
      { returnDocument: "after" }
    );

  const wishlistArray = Array.isArray(result.value?.wishlist)
    ? result.value.wishlist
    : [];
  return wishlistArray.map((id: ObjectId) => id.toString());
}

// ✅ Fetch full product details for wishlist
export async function getWishlistProducts(): Promise<IProduct[]> {
  const db = await getDb();
  const user = await getCurrentUser();
  if (!user?.wishlist || user.wishlist.length === 0) return [];

  const wishlistArray = Array.isArray(user.wishlist) ? user.wishlist : [];

  const products = await db
    .collection("products")
    .find({
      _id: {
        $in: wishlistArray.map((id: any) => new mongoose.Types.ObjectId(id)),
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

  const wishlistArray = Array.isArray(user.wishlist) ? user.wishlist : [];
  return wishlistArray.length;
}
