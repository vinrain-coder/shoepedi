"use server";

import { z } from "zod";
import { cacheLife, cacheTag, revalidatePath, updateTag } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { formatError, escapeRegExp } from "@/lib/utils";
import { BrandInputSchema, BrandUpdateSchema } from "../validator";
import { notFound } from "next/navigation";
import Brand from "../db/models/brand.model";

export type SerializedBrand = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isFeatured?: boolean;
  image?: string;
  logo?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: string;
  updatedAt: string;
};

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
export async function getBrandById(id: string): Promise<SerializedBrand | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("brands");
  try {
    await connectToDatabase();

    const brand = await Brand.findById(id).lean();

    if (!brand) return null;

    return {
      _id: brand._id.toString(),
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      isFeatured: brand.isFeatured,
      image: brand.image,
      logo: brand.logo,
      seoTitle: brand.seoTitle,
      seoDescription: brand.seoDescription,
      seoKeywords: brand.seoKeywords,
      createdAt: brand.createdAt.toISOString(),
      updatedAt: brand.updatedAt.toISOString(),
    };
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
            { name: { $regex: escapeRegExp(query), $options: "i" } },
            { slug: { $regex: escapeRegExp(query), $options: "i" } },
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
      .lean();

    const normalizedBrands = brands.map((brand) => ({
      ...brand,
      _id: brand._id.toString(),
    }));

    return {
      brands: normalizedBrands,
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

export async function getBrandStats() {
  "use cache";
  cacheLife("hours");
  cacheTag("brands");
  try {
    await connectToDatabase();
    const totalBrands = await Brand.countDocuments();
    return { totalBrands };
  } catch (error) {
    console.error("Error fetching brand stats:", error);
    return { totalBrands: 0 };
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

  const brands = await Brand.find().sort({ name: 1 }).select("_id name").lean();
  return brands.map((brand) => ({
    _id: brand._id.toString(),
    name: brand.name,
  }));
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

    return brands.map((brand) => ({
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
  return {
    _id: brand._id.toString(),
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    isFeatured: brand.isFeatured,
    image: brand.image,
    logo: brand.logo,
    seoTitle: brand.seoTitle,
    seoDescription: brand.seoDescription,
    seoKeywords: brand.seoKeywords,
    createdAt: brand.createdAt.toISOString(),
    updatedAt: brand.updatedAt.toISOString(),
  } satisfies SerializedBrand;
}
