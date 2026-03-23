import { notFound } from "next/navigation";
import { Metadata } from "next";
import { CalendarDays, Eye, Heart, MessageCircle, Tag } from "lucide-react";
import { getBlogBySlug, incrementBlogViews } from "@/lib/actions/blog.actions";
import { IBlog } from "@/lib/db/models/blog.model";
import { Separator } from "@/components/ui/separator";
import ShareBlog from "@/components/shared/blog/share-blog";
import { getSetting } from "@/lib/actions/setting.actions";
import Breadcrumb from "@/components/shared/breadcrumb";
import { cacheLife } from "next/cache";
import MarkdownRenderer from "@/components/shared/markdown-renderer";
import BlogSocial from "@/components/shared/blog/blog-social";

function extractFirstImageUrl(markdownContent: string) {
  if (!markdownContent) return null;
  const match = markdownContent.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  return match ? match[1] : null;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const p = await params;

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
      images: [blog.image || ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.content.slice(0, 160),
      images: [blog.image || ogImage],
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
  const p = await params;
  const { site } = await getSetting();

  const blog: IBlog | null = await getBlogBySlug(p.slug);
  if (!blog) return notFound();

  void incrementBlogViews(p.slug);

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  let firstImageUrl = extractFirstImageUrl(blog.content);
  if (firstImageUrl && !firstImageUrl.startsWith("http"))
    firstImageUrl = `${site.url}${firstImageUrl}`;

  const commentCount = (blog.comments || []).reduce(
    (total, comment) => total + 1 + (comment.replies?.length || 0),
    0
  );

  return (
    <div className="mx-auto max-w-4xl px-1 sm:px-2 md:px-4">
      <Breadcrumb />
      <div className="rounded-3xl border border-border/70 bg-gradient-to-br from-primary/8 via-background to-background p-3 shadow-sm sm:p-8 mt-2">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">{blog.category}</span>
            {(blog.tags || []).slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-muted px-3 py-1 text-muted-foreground">#{tag}</span>
            ))}
          </div>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{blog.title}</h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Fresh takes, styling inspiration, and practical footwear advice for the ShoePedi community.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2"><CalendarDays className="size-4" /> {formatDate(blog.createdAt)}</span>
            <span className="inline-flex items-center gap-2"><Eye className="size-4" /> {blog.views || 0} views</span>
            <span className="inline-flex items-center gap-2"><Heart className="size-4 text-rose-500" /> {blog.likesCount || 0} likes</span>
            <span className="inline-flex items-center gap-2"><MessageCircle className="size-4 text-sky-500" /> {commentCount} comments</span>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-border/70 bg-background p-2 shadow-sm sm:p-8">
        <MarkdownRenderer content={blog.content} className="mt-2" />

        <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground justify-between">
          <span className="inline-flex items-center gap-2 font-medium"><Tag className="size-4" /> Category: {blog.category}</span>
          <span className="font-medium">
            Tags: {Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags}
          </span>
        </div>

        <Separator className="my-6" />

        <h2 className="font-semibold text-primary">Share this Article</h2>
        <ShareBlog slug={blog.slug} title={blog.title} />

        <BlogSocial
          blogId={blog._id.toString()}
          slug={blog.slug}
          initialLikesCount={blog.likesCount || 0}
          initialComments={blog.comments || []}
        />
      </div>
    </div>
  );
}
