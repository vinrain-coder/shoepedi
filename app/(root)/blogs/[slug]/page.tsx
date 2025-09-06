/* eslint-disable @typescript-eslint/no-unused-vars */
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { getBlogBySlug, incrementBlogViews } from "@/lib/actions/blog.actions";
import { IBlog } from "@/lib/db/models/blog.model";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Separator } from "@/components/ui/separator";
import ShareBlog from "@/components/shared/blog/share-blog";
import { getSetting } from "@/lib/actions/setting.actions";
import Image from "next/image";

function extractFirstImageUrl(markdownContent: string) {
  if (!markdownContent) return null;
  const match = markdownContent.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  return match ? match[1] : null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const [blog, { site }] = await Promise.all([
    getBlogBySlug(params.slug),
    getSetting(),
  ]);

  if (!blog) return {};

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
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.content.slice(0, 160),
      images: [ogImage],
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: { slug: string };
}) {
  const blog: IBlog | null = await getBlogBySlug(params.slug);
  if (!blog) return notFound();

  void incrementBlogViews(params.slug);

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="max-w-3xl mx-auto px-1 sm:px-2 md:px-4">
      {/* Blog Header */}
      <h1 className="text-4xl font-extrabold dark:text-gray-600 mb-3 leading-tight">
        {blog.title}
      </h1>
      <p className="text-gray-600 text-sm">
        By <span className="font-semibold">ShoePedi</span> •{" "}
        {formatDate(blog.createdAt)} • 👁 {blog.views} views
      </p>

      {/* Blog Content */}
      <article className="prose prose-lg max-w-none mt-6">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: (props) => (
              <h1
                className="text-3xl font-bold mt-5 dark:text-gray-400 text-gray-900"
                {...props}
              />
            ),
            h2: (props) => (
              <h2
                className="text-2xl font-semibold mt-4 dark:text-gray-400 text-gray-800"
                {...props}
              />
            ),
            h3: (props) => (
              <h3
                className="text-xl font-medium mt-3 dark:text-gray-400 text-gray-700"
                {...props}
              />
            ),
            p: (props) => (
              <p
                className="leading-relaxed my-2 dark:text-gray-300 text-gray-800"
                {...props}
              />
            ),
            ul: (props) => (
              <ul
                className="list-disc pl-6 my-2 dark:text-gray-300 text-gray-800"
                {...props}
              />
            ),
            ol: (props) => (
              <ol
                className="list-decimal pl-6 my-2 dark:text-gray-300 text-gray-800"
                {...props}
              />
            ),
            li: (props) => (
              <li
                className="mb-1 dark:text-gray-300 text-gray-800"
                {...props}
              />
            ),
            blockquote: (props) => (
              <blockquote
                className="border-l-4 border-gray-500 pl-4 italic dark:text-gray-400 text-gray-700 my-3"
                {...props}
              />
            ),
            a: (props) => (
              <a
                target="_self"
                rel="noopener noreferrer"
                className="text-blue-500 font-medium hover:underline dark:text-blue-400"
                {...props}
              />
            ),
            strong: (props) => (
              <strong
                className="font-semibold dark:text-white text-gray-900"
                {...props}
              />
            ),
            pre: (props) => (
              <pre
                className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4"
                {...props}
              />
            ),
            img: ({ src = "", alt = "" }) => {
              try {
                return (
                  <Image
                    src={src}
                    alt={alt}
                    width={800}
                    height={450}
                    className="rounded-xl object-contain"
                    unoptimized
                  />
                );
              } catch (err) {
                return (
                  <Image
                    src={src}
                    alt={alt}
                    width={800}
                    height={450}
                    className="rounded-xl"
                  />
                );
              }
            },
          }}
        >
          {blog.content}
        </ReactMarkdown>
      </article>

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

      {/* Call to Action Section */}
      {/* <div className="border dark:border-gray-700 border-gray-300 rounded-lg p-6 mt-6 text-center shadow-md dark:bg-gray-800 bg-gray-100">
        <h2 className="text-2xl font-semibold dark:text-white text-gray-800">
          Enjoyed this article? 🎉
        </h2>
        <p className="mt-2 dark:text-gray-300 text-gray-700">
          If you found this helpful, share it with others! Stay updated with our
          latest posts by subscribing to our newsletter.
        </p>
        <button className="mt-4 px-6 py-2 bg-primary text-white font-medium rounded-lg transition duration-300 dark:hover:bg-primary-600 hover:bg-primary-500">
          Subscribe Now
        </button>
      </div> */}
    </div>
  );
}
