"use server";

import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "@/lib/get-session";
import { IProduct } from "../db/models/product.model";

type UserWishlistDocument = {
  _id: ObjectId;
  wishlist?: ObjectId[];
};

type WishlistProductDocument = Omit<IProduct, "_id"> & {
  _id: ObjectId;
};

async function getDb() {
  const connection = await connectToDatabase();
  const db = connection.connection.db;
  if (!db) {
    throw new Error("Database is not initialized");
  }
  return db;
}

async function getCurrentUser() {
  const session = await getServerSession();
  if (!session?.user?.id) return null;

  const db = await getDb();
  return db.collection<UserWishlistDocument>("users").findOne({
    _id: new ObjectId(session.user.id),
  });
}

async function ensureWishlistIsArray(userId: string) {
  const db = await getDb();
  const usersCollection = db.collection<UserWishlistDocument>("users");
  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!user) return;

  if (!Array.isArray(user.wishlist)) {
    await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { wishlist: [] } },
    );
  }
}

export async function getWishlist(): Promise<string[]> {
  const user = await getCurrentUser();
  if (!user) return [];
  return (Array.isArray(user.wishlist) ? user.wishlist : []).map((id) =>
    id.toString(),
  );
}

export async function addToWishlist(productId: string): Promise<string[]> {
  const session = await getServerSession();
  if (!session?.user?.id) return [];

  await ensureWishlistIsArray(session.user.id);

  const db = await getDb();
  const usersCollection = db.collection<UserWishlistDocument>("users");
  const result = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(session.user.id) },
    { $addToSet: { wishlist: new ObjectId(productId) } },
    { returnDocument: "after" },
  );

  const wishlist = result?.wishlist ?? [];
  return wishlist.map((id) => id.toString());
}

export async function removeFromWishlist(productId: string): Promise<string[]> {
  const session = await getServerSession();
  if (!session?.user?.id) return [];

  await ensureWishlistIsArray(session.user.id);

  const db = await getDb();
  const usersCollection = db.collection<UserWishlistDocument>("users");
  const result = await usersCollection.findOneAndUpdate(
    { _id: new ObjectId(session.user.id) },
    { $pull: { wishlist: new ObjectId(productId) } },
    { returnDocument: "after" },
  );

  const wishlist = result?.wishlist ?? [];
  return wishlist.map((id) => id.toString());
}

export async function getWishlistProducts(): Promise<IProduct[]> {
  const user = await getCurrentUser();
  if (!user?.wishlist?.length) return [];

  const db = await getDb();
  const productsCollection = db.collection<WishlistProductDocument>("products");
  const products = await productsCollection
    .find({
      _id: {
        $in: user.wishlist.map((id) => new ObjectId(id)),
      },
    })
    .toArray();

  return products.map((product) => ({
    ...product,
    _id: new mongoose.Types.ObjectId(product._id.toHexString()),
  })) as IProduct[];
}

export async function getWishlistCount(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return 0;
  return Array.isArray(user.wishlist) ? user.wishlist.length : 0;
}
