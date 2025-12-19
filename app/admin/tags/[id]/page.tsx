import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getTagById } from "@/lib/actions/tag.actions";
import TagForm from "../tag-form";

export const metadata: Metadata = {
  title: "Edit Tag",
};

type UpdateTagProps = {
  params: Promise<{
    id: string;
  }>;
};

const UpdateTag = async (props: UpdateTagProps) => {
  const params = await props.params;
  const { id } = params;

  const tag = await getTagById(id);
  if (!tag) notFound();

  return (
    <main className="max-w-4xl mx-auto p-4">
      {/* Breadcrumbs */}
      <div className="flex mb-4 text-sm text-gray-600 dark:text-gray-400">
        <Link href="/admin/tags" className="hover:underline">
          Tags
        </Link>
        <span className="mx-1">›</span>
        <Link href={`/admin/tags/${tag._id}`} className="hover:underline">
          {tag.name}
        </Link>
      </div>

      <div className="my-8">
        <TagForm
          type="Update"
          tag={tag}
          tagId={tag._id.toString()}
        />
      </div>
    </main>
  );
};

export default UpdateTag;
  
