import mongoose from "mongoose";
import { notFound } from "next/navigation";
import { IProduct } from "@/lib/db/models/product.model";
import { connectToDatabase, enableProductsCache, Product } from "./shared";

export async function getProductById(productId: string) {
  enableProductsCache();
  await connectToDatabase();
  const product = await Product.findById(productId);
  return JSON.parse(JSON.stringify(product)) as IProduct;
}

export async function getProductsByIds(productIds: string[]) {
  enableProductsCache();
  await connectToDatabase();
  const objectIds = productIds.map((id) => new mongoose.Types.ObjectId(id));
  const products = await Product.find({ _id: { $in: objectIds } });
  return JSON.parse(JSON.stringify(products)) as IProduct[];
}

export async function getProductBySlug(slug: string) {
  enableProductsCache();
  await connectToDatabase();
  const product = await Product.findOne({ slug, isPublished: true });
  if (!product) return notFound();
  return JSON.parse(JSON.stringify(product)) as IProduct;
}

export async function getProductsByTag({ tag, limit = 10 }: { tag: string; limit?: number }) {
  enableProductsCache();
  await connectToDatabase();
  const products = await Product.find({ tags: { $in: [tag] }, isPublished: true })
    .sort({ createdAt: "desc" })
    .limit(limit);
  return JSON.parse(JSON.stringify(products)) as IProduct[];
}

export async function getProductsByCategory({
  category,
  limit = 10,
}: {
  category: string;
  limit?: number;
}) {
  enableProductsCache();
  await connectToDatabase();
  const products = await Product.find({
    category: { $regex: new RegExp(`^${category}$`, "i") },
    isPublished: true,
  })
    .sort({ createdAt: -1 })
    .limit(limit);

  return JSON.parse(JSON.stringify(products)) as IProduct[];
}
