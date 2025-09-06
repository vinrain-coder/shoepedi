import { notFound } from "next/navigation";
import Link from "next/link";
import { getBlogById } from "@/lib/actions/blog.actions";
import BlogForm from "../blog-form";

type UpdateBlogProps = {
  params: Promise<{
    id: string;
  }>;
};

const UpdateBlog = async (props: UpdateBlogProps) => {
  const params = await props.params;

  const { id } = params;

  const blog = await getBlogById(id);
  if (!blog) notFound();
  return (
    <main className="max-w-6xl mx-auto p-4">
      <div className="flex mb-4">
        <Link href="/admin/blogs">Blogs</Link>
        <span className="mx-1">›</span>
        <Link href={`/admin/blogs/${blog._id}`}>{blog._id}</Link>
      </div>

      <div className="my-8">
        <BlogForm type="Update" blog={blog} blogId={blog._id} />
      </div>
    </main>
  );
};

export default UpdateBlog;
