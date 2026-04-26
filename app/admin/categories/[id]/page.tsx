import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getCategoryById } from "@/lib/actions/category.actions";
import CategoryForm from "../category-form";

export const metadata: Metadata = {
  title: "Edit Category",
};

type UpdateCategoryProps = {
  params: Promise<{
    id: string;
  }>;
};

const UpdateCategory = async (props: UpdateCategoryProps) => {
  const params = await props.params;
  const { id } = params;

  const category = await getCategoryById(id);
  if (!category) notFound();
  const normalizedCategory = {
    ...category,
    parent:
      typeof category.parent === "string" || category.parent === null
        ? category.parent
        : category.parent
          ? String(category.parent)
          : null,
  };

  return (
    <main className="max-w-4xl mx-auto p-4">
      {/* Breadcrumbs */}
      <div className="flex mb-4 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/admin/categories" className="hover:underline">
          Categories
        </Link>
        <span className="mx-1">›</span>
        <Link
          href={`/admin/categories/${category._id}`}
          className="hover:underline"
        >
          {category.name}
        </Link>
      </div>

      <div className="my-8">
        <CategoryForm
          type="Update"
          category={normalizedCategory}
          categoryId={String(category._id)}
        />
      </div>
    </main>
  );
};

export default UpdateCategory;
