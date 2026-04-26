import { notFound } from "next/navigation";

import { getProductById } from "@/lib/actions/product.actions";
import Link from "next/link";
import ProductForm from "../product-form";
import { Metadata } from "next";
import { getAllCategoriesForAdminProductInput } from "@/lib/actions/category.actions";
import { getAllBrandsForAdminProductInput } from "@/lib/actions/brand.actions";

export const metadata: Metadata = {
  title: "Edit Product",
};

type UpdateProductProps = {
  params: Promise<{
    id: string;
  }>;
};

const UpdateProduct = async (props: UpdateProductProps) => {
  const params = await props.params;

  const { id } = params;

  const product = await getProductById(id);
  if (!product) notFound();

  const categories = await getAllCategoriesForAdminProductInput();
  const brands = await getAllBrandsForAdminProductInput();
  const categoryOptions = categories.map((category) => ({
    _id: String(category._id),
    name: category.name,
  }));
  const brandOptions = brands.map((brand) => ({
    _id: String(brand._id),
    name: brand.name,
  }));

  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/admin/products">Products</Link>
        <span className="mx-1">›</span>
        <Link href={`/admin/products/${product._id}`}>
          {product._id.toString()}
        </Link>
      </div>

      <div className="my-8">
        <ProductForm
          type="Update"
          product={product}
          productId={product._id.toString()}
          categories={categoryOptions}
          brands={brandOptions}
        />
      </div>
    </main>
  );
};

export default UpdateProduct;
