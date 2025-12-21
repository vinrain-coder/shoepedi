/* eslint-disable @typescript-eslint/no-unused-vars */
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getBlogBySlug, incrementBlogViews } from "@/lib/actions/blog.actions";
import { IBlog } from "@/lib/db/models/blog.model";
import { Separator } from "@/components/ui/separator";
import ShareBlog from "@/components/shared/blog/share-blog";
import { getSetting } from "@/lib/actions/setting.actions";
import Image from "next/image";
import Breadcrumb from "@/components/shared/breadcrumb";
import { cacheLife } from "next/cache";
import MarkdownRenderer from "@/components/shared/markdown-renderer";

// Helper to extract first image from markdown
function extractFirstImageUrl(markdownContent: string) {
  if (!markdownContent) return null;
  const match = markdownContent.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  return match ? match[1] : null;
}

// ==========================
// generateMetadata (fixed)
// ==========================
export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const p = await params; // unwrap promise

  const [blog, { site }] = await Promise.all([
    getBlogBySlug(p.slug),
    getSetting(),
  ]);

  if (!blog) return { title: "Blog Not Found" };

  let firstImageUrl = extractFirstImageUrl(blog.content);
  if (firstImageUrl && !firstImageUrl.startsWith("http"))
    firstImageUrl = `${site.url}${firstImageUrl}`;

  const ogImage = firstImageUrl || `${site.url}/default-image.jpg`;

  return {
    title: `${blog.title} | ShoePedi Blog`,
    description: blog.content.slice(0, 160),
    openGraph: {
      title: blog.title,
      description: "Discover expert insights on footwear trends at ShoePedi!",
      url: `${site.url}/blogs/${blog.slug}`,
      type: "article",
      images: [blog.image, ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.content.slice(0, 160),
      images: [blog.image, ogImage],
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  "use cache";
  cacheLife("days");
  const p = await params; // unwrap promise

  const blog: IBlog | null = await getBlogBySlug(p.slug);
  if (!blog) return notFound();

  void incrementBlogViews(p.slug); // fire-and-forget

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="max-w-3xl mx-auto px-1 sm:px-2 md:px-4">
      <Breadcrumb />
      {/* Blog Header */}
      <h1 className="text-4xl font-extrabold dark:text-gray-600 mb-3 leading-tight">
        {blog.title}
      </h1>
      <p className="text-gray-600 text-sm">
        By <span className="font-semibold">ShoePedi</span> •{" "}
        {formatDate(blog.createdAt)} • 👁 {blog.views} views
      </p>

      <div className="">
        <Image
          src={blog.image}
          alt={blog.title}
          width={900}
          height={500}
          className="rounded-xl"
        />
      </div>

      {/* Blog Content */}
      <MarkdownRenderer content={blog.content} className="mt-2" />

      {/* Blog Meta Info */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600 justify-between">
        <span className="font-medium">📌 Category: {blog.category}</span>
        <span className="font-medium">
          🏷️ Tags: {Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags}
        </span>
      </div>

      <Separator className="my-6" />

      {/* Share Blog Component */}
      <h1 className="text-primary font-semibold">Share this Article</h1>
      <ShareBlog slug={blog.slug} title={blog.title} />
    </div>
  );
}
