"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import Category from "@/lib/db/models/category.model";
import { formatError } from "@/lib/utils";
import { CategoryInputSchema, CategoryUpdateSchema } from "../validator";

// CREATE CATEGORY
export async function createCategory(
  data: z.infer<typeof CategoryInputSchema>
) {
  try {
    const category = CategoryInputSchema.parse(data); // validate
    await connectToDatabase();
    await Category.create(category);
    revalidatePath("/admin/categories");

    return { success: true, message: "Category created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// UPDATE CATEGORY
export async function updateCategory(
  data: z.infer<typeof CategoryUpdateSchema>
) {
  try {
    const category = CategoryUpdateSchema.parse(data);
    if (!category._id) throw new Error("Category ID is required");

    await connectToDatabase();
    await Category.findByIdAndUpdate(category._id, category);
    revalidatePath("/admin/categories");

    return { success: true, message: "Category updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// DELETE CATEGORY
export async function deleteCategory(id: string) {
  try {
    await connectToDatabase();
    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");
    await Category.findByIdAndDelete(id);
    revalidatePath("/admin/categories");

    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Fetch a single category by ID
export async function getCategoryById(id: string) {
  try {
    // Connect to database
    await connectToDatabase();

    // Find category
    const category = await Category.findById(id).lean();

    if (!category) {
      return null;
    }

    return category;
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    return null;
  }
}

//  Get all categories for admin panel with pagination and search
interface GetAllCategoriesParams {
  query?: string;
  page?: number;
  limit?: number;
}

export async function getAllCategoriesForAdmin({
  query = "",
  page = 1,
  limit = 10,
}: GetAllCategoriesParams) {
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

    const totalCategories = await Category.countDocuments(filter);
    const totalPages = Math.ceil(totalCategories / limit);
    const skip = (page - 1) * limit;

    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("parent", "name") // populate parent category name
      .lean();

    return {
      categories,
      totalCategories,
      totalPages,
      from: skip + 1,
      to: skip + categories.length,
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      categories: [],
      totalCategories: 0,
      totalPages: 0,
      from: 0,
      to: 0,
    };
  }
}

export async function getAllCategoriesForAdminProductInput() {
  // Fetch top-level categories and populate subcategories and minicategories
  const categories = await Category.find({ parent: null })
    .populate({
      path: "subcategories",
      populate: { path: "subcategories" }, // populate mini-categories
    })
    .lean();

  return categories.map((cat) => ({
    ...cat,
    subcategories: cat.subcategories || [],
  }));
}
