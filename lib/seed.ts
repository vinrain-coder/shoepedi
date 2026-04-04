/* eslint-disable @typescript-eslint/no-explicit-any */
import { cwd } from "process";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(cwd());

import data from "./data";
import { connectToDatabase } from "./db";
import User from "./db/models/user.model";
import Product from "./db/models/product.model";
import Category, { ICategory } from "./db/models/category.model";
import Setting from "./db/models/setting.model";
import WebPage from "./db/models/web-page.model";
import { categoriesData, CategorySeed } from "./categories";

const main = async () => {
  try {
    await connectToDatabase(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Setting.deleteMany({});
    await WebPage.deleteMany({});
    console.log("Cleared existing data");

    // Seed Categories
    const createdCategories = await createCategoryTree(categoriesData);
    console.log(`Seeded ${createdCategories.length} categories`);

    // Seed Settings
    await Setting.insertMany(data.settings);
    console.log("Seeded settings");

    // Seed WebPages
    await WebPage.insertMany(data.webPages);
    console.log("Seeded web pages");

    // Seed Users
    await User.insertMany(data.users);
    console.log("Seeded users");

    // Seed Products
    await Product.insertMany(data.products);
    console.log("Seeded products");

    console.log("Database seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
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

    created.push(newCategory);

    // Handle subcategories recursively
    if (subcategories && subcategories.length > 0) {
      const subCreated = await createCategoryTree(subcategories, newCategory);
      created.push(...subCreated);
    }

    // Handle minicategories recursively
    if (minicategories && minicategories.length > 0) {
      const miniCreated = await createCategoryTree(minicategories, newCategory);
      created.push(...miniCreated);
    }
  }

  return created;
}

main();
