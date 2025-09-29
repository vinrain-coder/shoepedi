/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectToDatabase } from ".";
import Category, { ICategory } from "./models/category.model";
import { cwd } from "process";
import { loadEnvConfig } from "@next/env";
import { categoriesData, CategorySeed } from "@/lib/categories";

loadEnvConfig(cwd());

const main = async () => {
  try {
    await connectToDatabase(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing categories
    await Category.deleteMany({});
    console.log("Cleared existing categories");

    const createdCategories = await createCategoryTree(categoriesData);
    console.log({
      createdCategories,
      message: "Seeded categories successfully",
    });

    process.exit(0);
  } catch (error) {
    console.error(error);
    throw new Error("Failed to seed categories");
  }
};

/**
 * Recursive function to create categories, subcategories, and minicategories
 */
async function createCategoryTree(
  data: CategorySeed[],
  parent: ICategory | null = null
): Promise<ICategory[]> {
  const created: ICategory[] = [];

  for (const cat of data) {
    const { subcategories, minicategories, ...rest } = cat as any;

    const newCategory = await Category.create({
      ...rest,
      parent: parent?._id || null,
    });

    // Handle subcategories recursively
    if (subcategories && subcategories.length > 0) {
      await createCategoryTree(subcategories, newCategory);
    }

    // Handle minicategories recursively (optional)
    if (minicategories && minicategories.length > 0) {
      await createCategoryTree(minicategories, newCategory);
    }

    created.push(newCategory);
  }

  return created;
}

main();
