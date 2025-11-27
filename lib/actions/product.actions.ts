"use server";

import { connectToDatabase } from "@/lib/db";
import Product, { IProduct } from "@/lib/db/models/product.model";
import { revalidatePath } from "next/cache";
import { formatError } from "../utils";
import { ProductInputSchema, ProductUpdateSchema } from "../validator";
import { IProductInput } from "@/types";
import { z } from "zod";
import { getSetting } from "./setting.actions";
import mongoose from "mongoose";
import { UTApi } from "uploadthing/server";
import { notFound } from "next/navigation";
import { cacheLife } from "next/cache";

const utapi = new UTApi(); // Initialize UTApi instance

// CREATE
export async function createProduct(data: IProductInput) {
  try {
    const product = ProductInputSchema.parse(data);
    await connectToDatabase();
    await Product.create(product);
    revalidatePath("/admin/products");
    return {
      success: true,
      message: "Product created successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// UPDATE
export async function updateProduct(data: z.infer<typeof ProductUpdateSchema>) {
  try {
    const product = ProductUpdateSchema.parse(data);
    await connectToDatabase();
    await Product.findByIdAndUpdate(product._id, product);
    revalidatePath("/admin/products");
    return {
      success: true,
      message: "Product updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// DELETE
export async function deleteProduct(id: string) {
  try {
    await connectToDatabase();

    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");

    // Delete images from UploadThing
    if (product.images && product.images.length > 0) {
      await Promise.all(
        product.images.map(async (imageUrl: string) => {
          const fileKeys = imageUrl.split("/").pop(); // Extract file key
          if (fileKeys) {
            await utapi.deleteFiles(fileKeys); // Use the UTApi instance
          }
        })
      );
    }

    // Delete product from the database
    await Product.findByIdAndDelete(id);

    revalidatePath("/admin/products");

    return {
      success: true,
      message: "Product and associated images deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// GET ONE PRODUCT BY ID
export async function getProductById(productId: string) {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();
  const product = await Product.findById(productId);
  return JSON.parse(JSON.stringify(product)) as IProduct;
}

export async function getProductsByIds(productIds: string[]) {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();

  const objectIds = productIds.map((id) => new mongoose.Types.ObjectId(id));
  const products = await Product.find({ _id: { $in: objectIds } });

  return JSON.parse(JSON.stringify(products)) as IProduct[];
}

// GET ALL PRODUCTS FOR ADMIN
export async function getAllProductsForAdmin({
  query,
  page = 1,
  sort = "latest",
  limit,
}: {
  query: string;
  page?: number;
  sort?: string;
  limit?: number;
}) {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();

  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  const queryFilter =
    query && query !== "all"
      ? {
          name: {
            $regex: query,
            $options: "i",
          },
        }
      : {};

  const order: Record<string, 1 | -1> =
    sort === "best-selling"
      ? { numSales: -1 }
      : sort === "price-low-to-high"
        ? { price: 1 }
        : sort === "price-high-to-low"
          ? { price: -1 }
          : sort === "avg-customer-review"
            ? { avgRating: -1 }
            : { _id: -1 };
  const products = await Product.find({
    ...queryFilter,
  })
    .sort(order)
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean();

  const countProducts = await Product.countDocuments({
    ...queryFilter,
  });
  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / pageSize),
    totalProducts: countProducts,
    from: pageSize * (Number(page) - 1) + 1,
    to: pageSize * (Number(page) - 1) + products.length,
  };
}

// GET ALL CATEGORIES
export async function getAllCategories(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();
  const categories = await Product.aggregate([
    { $match: { isPublished: true, category: { $exists: true, $ne: "" } } },
    { $project: { category: { $trim: { input: { $toLower: "$category" } } } } },
    { $group: { _id: "$category" } },
    { $sort: { _id: 1 } },
    { $project: { category: "$_id", _id: 0 } },
  ]);

  return categories.map((c) =>
    c.category
      .split(/\s+|-/)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
      .trim()
  );
}

export async function getProductsForCard({
  tag,
  limit = 4,
}: {
  tag: string;
  limit?: number;
}) {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();
  const products = await Product.find(
    { tags: { $in: [tag] }, isPublished: true },
    {
      name: 1,
      href: { $concat: ["/product/", "$slug"] },
      image: { $arrayElemAt: ["$images", 0] },
    }
  )
    .sort({ createdAt: "desc" })
    .limit(limit);
  return JSON.parse(JSON.stringify(products)) as {
    name: string;
    href: string;
    image: string;
  }[];
}
// GET PRODUCTS BY TAG
export async function getProductsByTag({
  tag,
  limit = 10,
}: {
  tag: string;
  limit?: number;
}) {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();
  const products = await Product.find({
    tags: { $in: [tag] },
    isPublished: true,
  })
    .sort({ createdAt: "desc" })
    .limit(limit);
  return JSON.parse(JSON.stringify(products)) as IProduct[];
}

// GET ONE PRODUCT BY SLUG
export async function getProductBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();
  const product = await Product.findOne({ slug, isPublished: true });
  if (!product) return notFound();
  return JSON.parse(JSON.stringify(product)) as IProduct;
}

// GET RELATED PRODUCTS: PRODUCTS WITH SAME CATEGORY
export async function getRelatedProductsByCategory({
  category,
  productId,
  limit = 4,
  page = 1,
}: {
  category: string;
  productId: string;
  limit?: number;
  page: number;
}) {
  "use cache";
  cacheLife("hours");
  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;

  await connectToDatabase();
  const skipAmount = (Number(page) - 1) * limit;
  const conditions = {
    isPublished: true,
    category,
    _id: { $ne: productId },
  };
  const products = await Product.find(conditions)
    .sort({ numSales: "desc" })
    .skip(skipAmount)
    .limit(limit);
  const productsCount = await Product.countDocuments(conditions);
  return {
    data: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(productsCount / limit),
  };
}

// GET ALL PRODUCTS
export async function getAllProducts({
  query,
  limit,
  page,
  category,
  tag,
  brand,
  color,
  size,
  price,
  rating,
  sort,
}: {
  query: string;
  category: string;
  tag: string;
  brand: string
  color: string
  size: string 
  limit?: number;
  page: number;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  "use cache";
  cacheLife("hours");
  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  await connectToDatabase();

  const queryFilter =
    query && query !== "all"
      ? {
          name: {
            $regex: query,
            $options: "i",
          },
        }
      : {};
  const categoryFilter = category && category !== "all" ? { category } : {};
  const tagFilter = tag && tag !== "all" ? { tags: tag } : {};
  const brandFilter =
  brand && brand !== "all" ? { brand } : {};
 const colorFilter =
  color && color !== "all" ? { colors: { $in: [color] } } : {};
 const sizeFilter =
  size && size !== "all" ? { sizes: { $in: [size] } } : {};
 const ratingFilter =
    rating && rating !== "all"
      ? {
          avgRating: {
            $gte: Number(rating),
          },
        }
      : {};
  // 10-50
  const priceFilter =
    price && price !== "all"
      ? {
          price: {
            $gte: Number(price.split("-")[0]),
            $lte: Number(price.split("-")[1]),
          },
        }
      : {};
  const order: Record<string, 1 | -1> =
    sort === "best-selling"
      ? { numSales: -1 }
      : sort === "price-low-to-high"
        ? { price: 1 }
        : sort === "price-high-to-low"
          ? { price: -1 }
          : sort === "avg-customer-review"
            ? { avgRating: -1 }
            : { _id: -1 };
  const isPublished = { isPublished: true };
  const products = await Product.find({
    ...isPublished,
    ...queryFilter,
    ...tagFilter,
    ...categoryFilter,
    ...brandFilter,
    ...colorFilter,
    ...sizeFilter,
    ...priceFilter,
    ...ratingFilter,
  })
    .sort(order)
    .skip(limit * (Number(page) - 1))
    .limit(limit)
    .lean();

  const countProducts = await Product.countDocuments({
    ...queryFilter,
    ...tagFilter,
    ...categoryFilter,
    ...brandFilter,
    ...colorFilter,
    ...sizeFilter,
    ...priceFilter,
    ...ratingFilter,
  });
  return {
    products: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(countProducts / limit),
    totalProducts: countProducts,
    from: limit * (Number(page) - 1) + 1,
    to: limit * (Number(page) - 1) + products.length,
  };
}

export async function getAllTags() {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();
  const tags = await Product.aggregate([
    // Ensure tags exist and are not empty
    { $match: { tags: { $exists: true, $ne: [] } } },
    // Unwind the tags array to process each tag individually
    { $unwind: "$tags" },
    // Trim whitespace and convert to lowercase
    {
      $set: {
        tags: {
          $trim: { input: { $toLower: "$tags" } },
        },
      },
    },
    // Group by tag to ensure uniqueness
    { $group: { _id: "$tags" } },
    // Sort alphabetically
    { $sort: { _id: 1 } },
    // Format the output
    { $project: { tag: "$_id", _id: 0 } },
  ]);

  // Format tags: capitalize each word and handle dashes/spaces
  return tags.map(
    (t) =>
      t.tag
        .split(/\s+|-/) // Handle both spaces and dashes
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
        .trim() // Ensure no leading/trailing spaces
  );
}

export async function getAllTagsForAdminProductCreate() {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();

  const tags = await Product.aggregate([
    // Ensure tags exist and are not empty
    { $match: { tags: { $exists: true, $ne: [] } } },
    // Unwind the tags array
    { $unwind: "$tags" },
    // Group by tag for uniqueness
    { $group: { _id: "$tags" } },
    // Sort alphabetically (optional, can remove if you want DB order)
    { $sort: { _id: 1 } },
    // Format output
    { $project: { tag: "$_id", _id: 0 } },
  ]);

  return tags.map((t) => t.tag);
}

// GET ALL BRANDS
export async function getAllBrands(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();

  const brands = await Product.aggregate([
    { $match: { brand: { $exists: true, $ne: "" } } },
    { $project: { brand: { $trim: { input: { $toLower: "$brand" } } } } },
    { $group: { _id: "$brand" } },
    { $sort: { _id: 1 } },
    { $project: { brand: "$_id", _id: 0 } },
  ]);

  return brands.map((b) =>
    b.brand
      .split(/\s+|-/)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
      .trim()
  );
}

// GET ALL COLORS
export async function getAllColors(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();

  const colors = await Product.aggregate([
    { $match: { colors: { $exists: true, $ne: [] } } },
    { $unwind: "$colors" },
    {
      $set: {
        colors: {
          $trim: { input: { $toLower: "$colors" } },
        },
      },
    },
    { $group: { _id: "$colors" } },
    { $sort: { _id: 1 } },
    { $project: { color: "$_id", _id: 0 } },
  ]);

  return colors.map((c) =>
    c.color
      .split(/\s+|-/)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .trim()
  );
}
// GET ALL SIZES
export async function getAllSizes(): Promise<string[]> {
  "use cache";
  cacheLife("hours");
  await connectToDatabase();

  const sizes = await Product.aggregate([
    { $match: { sizes: { $exists: true, $ne: [] } } },
    { $unwind: "$sizes" },
    {
      $set: {
        sizes: {
          $trim: { input: { $toLower: "$sizes" } },
        },
      },
    },
    { $group: { _id: "$sizes" } },
    { $sort: { _id: 1 } },
    { $project: { size: "$_id", _id: 0 } },
  ]);

  return sizes.map((s) =>
    s.size
      .split(/\s+|-/)
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .trim()
  );
}
