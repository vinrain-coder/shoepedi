"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import Category from "@/lib/db/models/category.model";
import { formatError } from "@/lib/utils";
import {
  CategoryInputSchema,
  CategoryUpdateSchema,
} from "../validator";

/* ---------------------------------
   CREATE CATEGORY
---------------------------------- */
export async function createCategory(
  data: z.infer<typeof CategoryInputSchema>
) {
  try {
    const category = CategoryInputSchema.parse(data);

    await connectToDatabase();
    await Category.create(category);

    revalidatePath("/admin/categories");

    return { success: true, message: "Category created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

/* ---------------------------------
   UPDATE CATEGORY
---------------------------------- */
export async function updateCategory(
  data: z.infer<typeof CategoryUpdateSchema>
) {
  try {
    const category = CategoryUpdateSchema.parse(data);

    await connectToDatabase();

    const updated = await Category.findByIdAndUpdate(
      category._id,
      { $set: category },
      { new: true }
    );

    if (!updated) {
      throw new Error("Category not found");
    }

    revalidatePath("/admin/categories");

    return { success: true, message: "Category updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

/* ---------------------------------
   DELETE CATEGORY
---------------------------------- */
export async function deleteCategory(id: string) {
  try {
    await connectToDatabase();

    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");

    // Optional safety: prevent deleting category with children
    const hasChildren = await Category.exists({ parent: id });
    if (hasChildren) {
      throw new Error("Cannot delete a category with child categories");
    }

    await Category.findByIdAndDelete(id);

    revalidatePath("/admin/categories");

    return { success: true, message: "Category deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

/* ---------------------------------
   GET CATEGORY BY ID
---------------------------------- */
export async function getCategoryById(id: string) {
  try {
    await connectToDatabase();

    const category = await Category.findById(id)
      .populate("parent", "name")
      .lean();

    return category || null;
  } catch (error) {
    console.error("Error fetching category by ID:", error);
    return null;
  }
}

/* ---------------------------------
   GET ALL CATEGORIES (ADMIN)
---------------------------------- */
export interface GetAllCategoriesParams {
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
      .populate("parent", "name")
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

/* ---------------------------------
   GET ALL CATEGORIES FOR PRODUCT INPUT
   (Flat list or parent-based)
---------------------------------- */
export async function getAllCategoriesForAdminProductInput() {
  await connectToDatabase();

  const categories = await Category.find()
    .sort({ name: 1 })
    .populate("parent", "name")
    .lean();

  return categories;
}
