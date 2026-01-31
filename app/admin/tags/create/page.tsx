import Link from "next/link";
import { Metadata } from "next";
import TagForm from "../tag-form";

export const metadata: Metadata = {
  title: "Create Tag",
};

const CreateTagPage = () => {
  return (
    <main className="max-w-4xl mx-auto p-4">
      {/* Breadcrumbs */}
      <div className="flex mb-4 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/admin/tags" className="hover:underline">
          Tags
        </Link>
        <span className="mx-1">›</span>
        <Link href="/admin/tags/create" className="hover:underline">
          Create
        </Link>
      </div>

      <div className="my-8">
        {/* Pass type="Create" for new brand */}
        <TagForm type="Create" />
      </div>
    </main>
  );
};

export default CreateTagPage;
