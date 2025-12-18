import Link from "next/link";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "Create Brand",
};

const CreateBrandPage = () => {
  return (
    <main className="max-w-4xl mx-auto p-4">
      {/* Breadcrumbs */}
      <div className="flex mb-4 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/admin/brands" className="hover:underline">
          Brands
        </Link>
        <span className="mx-1">›</span>
        <Link href="/admin/brands/create" className="hover:underline">
          Create
        </Link>
      </div>

      <div className="my-8">
        {/* Pass type="Create" for new brand */}
        <BrandForm type="Create" />
      </div>
    </main>
  );
};

export default CreateBrandPage;
