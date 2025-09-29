"use client";

import Link from "next/link";
import { Metadata } from "next";
import CategoryForm from "../category-form";

export const metadata: Metadata = {
  title: "Create Category",
};

const CreateCategoryPage = () => {
  return (
    <main className="max-w-4xl mx-auto p-4">
      {/* Breadcrumbs */}
      <div className="flex mb-4 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/admin/categories" className="hover:underline">
          Categories
        </Link>
        <span className="mx-1">›</span>
        <Link href="/admin/categories/create" className="hover:underline">
          Create
        </Link>
      </div>

      <div className="my-8">
        {/* Pass type="Create" for new category */}
        <CategoryForm type="Create" />
      </div>
    </main>
  );
};

export default CreateCategoryPage;
