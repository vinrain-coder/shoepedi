"use server";

import { z } from "zod";
import { cacheLife, cacheTag, revalidatePath, updateTag } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { formatError } from "@/lib/utils";
import { BrandInputSchema, BrandUpdateSchema } from "../validator";
import { notFound } from "next/navigation";
import Brand, { IBrand } from "../db/models/brand.model";

/* ---------------------------------
   CREATE BRAND
   ---------------------------------- */
export async function createBrand(data: z.infer<typeof BrandInputSchema>) {
  try {
    const brand = BrandInputSchema.parse(data);

    await connectToDatabase();

    const existing = await Brand.findOne({ slug: brand.slug });
    if (existing) {
      return {
        success: false,
        message: "A brand with this name/slug already exists.",
      };
    }

    await Brand.create(brand);
    revalidatePath("/admin/brands");
    updateTag("brands");

    return { success: true, message: "Brand created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

/* ---------------------------------
                                                                                  UPDATE BRAND
                                                                                  ---------------------------------- */
export async function updateBrand(data: z.infer<typeof BrandUpdateSchema>) {
  try {
    const brand = BrandUpdateSchema.parse(data);

    await connectToDatabase();

    const updated = await Brand.findByIdAndUpdate(
      brand._id,
      { $set: brand },
      { new: true }
    );

    if (!updated) {
      throw new Error("Brand not found");
    }

    revalidatePath("/admin/brands");
    updateTag("brands");
    return { success: true, message: "Brand updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

/* ---------------------------------
                                                                                                                                                             DELETE BRAND
                                                                                                                                                             ---------------------------------- */
export async function deleteBrand(id: string) {
  try {
    await connectToDatabase();

    const brand = await Brand.findById(id);
    if (!brand) throw new Error("Brand not found");

    // Optional safety: prevent deleting brand with children
    const hasChildren = await Brand.exists({ parent: id });
    if (hasChildren) {
      throw new Error("Cannot delete a brand with child brands");
    }

    await Brand.findByIdAndDelete(id);

    revalidatePath("/admin/brands");

    return { success: true, message: "Brand deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

/* ---------------------------------
                                                                                                                                                                                                                        GET BRAND BY ID
                                                                                                                                                                                                                        ---------------------------------- */
export async function getBrandById(id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("brands");
  try {
    await connectToDatabase();

    const brand = await Brand.findById(id).populate("name").lean();

    return brand || null;
  } catch (error) {
    console.error("Error fetching brand by ID:", error);
    return null;
  }
}

/* ---------------------------------
                                                                                                                                                                                                                                                                       GET ALL BRANDS (ADMIN)
                                                                                                                                                                                                                                                                       ---------------------------------- */
export interface GetAllBrandsParams {
  query?: string;
  page?: number;
  limit?: number;
}

export async function getAllBrandsForAdmin({
  query = "",
  page = 1,
  limit = 10,
}: GetAllBrandsParams) {
  "use cache";
  cacheLife("hours");
  cacheTag("brands");
  try {
    await connectToDatabase();

    const filter = query
      ? {
          $or: [
            { name: { $regex: query, $options: "i" } },
            { slug: { $regex: query, $options: "i" } },
          ],
        }
      : {};

    const totalBrands = await Brand.countDocuments(filter);
    const totalPages = Math.ceil(totalBrands / limit);
    const skip = (page - 1) * limit;

    const brands = await Brand.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("name")
      .lean();

    return {
      brands,
      totalBrands,
      totalPages,
      from: skip + 1,
      to: skip + brands.length,
    };
  } catch (error) {
    console.error("Error fetching brands:", error);
    return {
      brands: [],
      totalBrands: 0,
      totalPages: 0,
      from: 0,
      to: 0,
    };
  }
}

/* ---------------------------------
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        GET ALL BRANDS FOR PRODUCT INPUT
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           (Flat list or parent-based)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        ---------------------------------- */
export async function getAllBrandsForAdminProductInput() {
  "use cache";
  cacheLife("hours");
  cacheTag("brands");
  await connectToDatabase();

  const brands = await Brand.find().sort({ name: 1 }).populate("name").lean();

  return brands;
}

/* ---------------------------------
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      GET ALL BRANDS FOR STOREFRONT (Public & Cached)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         ---------------------------------- */
export async function getAllBrandsForStore() {
  "use cache";
  cacheLife("days");
  cacheTag("brands");

  try {
    await connectToDatabase();

    const brands = await Brand.find()
      .sort({ isFeatured: -1, name: 1 })
      .select("name slug image logo description isFeatured")
      .lean();

    return brands.map((brand: any) => ({
      ...brand,
      _id: brand._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching store brands:", error);
    return [];
  }
}

// GET ONE PRODUCT BY SLUG
export async function getBrandBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("brands");
  await connectToDatabase();
  const brand = await Brand.findOne({ slug }).lean();
  if (!brand) return notFound();
  return JSON.parse(JSON.stringify(brand)) as IBrand;
}
