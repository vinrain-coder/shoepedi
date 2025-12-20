import Link from "next/link";
import { Metadata } from "next";
import ProductForm from "../product-form";
import { getAllCategoriesForAdminProductInput } from "@/lib/actions/category.actions";
import { getAllBrandsForAdminProductInput } from "@/lib/actions/brand.actions";

export const metadata: Metadata = {
  title: "Create Product",
};

const CreateProductPage = async () => {
  const categories = await getAllCategoriesForAdminProductInput();
  const brands = await getAllBrandsForAdminProductInput();
  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/admin/products">Products</Link>
        <span className="mx-1">›</span>
        <Link href="/admin/products/create">Create</Link>
      </div>

      <div className="my-8">
        <ProductForm type="Create" categories={categories} brands={brands} />
      </div>
    </main>
  );
};

export default CreateProductPage;
