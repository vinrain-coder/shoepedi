import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getBrandById } from "@/lib/actions/brand.actions";
import BrandForm from "../brand-form";

export const metadata: Metadata = {
  title: "Edit Brand",
};

type UpdateBrandProps = {
  params: Promise<{
    id: string;
  }>;
};

const UpdateBrand = async (props: UpdateBrandProps) => {
  const params = await props.params;
  const { id } = params;

  const brand = await getBrandById(id);
  if (!brand) notFound();

  return (
    <main className="max-w-4xl mx-auto p-4">
      {/* Breadcrumbs */}
      <div className="flex mb-4 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/admin/brands" className="hover:underline">
          Brands
        </Link>
        <span className="mx-1">›</span>
        <Link href={`/admin/brands/${brand._id}`} className="hover:underline">
          {brand.name}
        </Link>
      </div>

      <div className="my-8">
        <BrandForm type="Update" brand={brand} brandId={brand._id.toString()} />
      </div>
    </main>
  );
};

export default UpdateBrand;
