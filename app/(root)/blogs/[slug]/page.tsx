import { notFound } from "next/navigation";
import { Metadata } from "next";
import { CalendarDays, Eye, Heart, MessageCircle, Tag } from "lucide-react";
import Image from "next/image";
import { getBlogBySlug, incrementBlogViews } from "@/lib/actions/blog.actions";
import { Separator } from "@/components/ui/separator";
import ShareBlog from "@/components/shared/blog/share-blog";
import { getSetting } from "@/lib/actions/setting.actions";
import Breadcrumb from "@/components/shared/breadcrumb";
import MarkdownRenderer from "@/components/shared/markdown-renderer";
import BlogSocial from "@/components/shared/blog/blog-social";

function extractFirstImageUrl(markdownContent: string) {
  if (!markdownContent) return null;
  const match = markdownContent.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  return match ? match[1] : null;
}

function resolveBlogImage(
  image?: string,
  markdownContent?: string,
  siteUrl?: string,
) {
  const uploadedImage = image?.trim();
  if (uploadedImage) return uploadedImage;

  const markdownImage = extractFirstImageUrl(markdownContent || "")?.trim();
  if (!markdownImage) return "";
  if (markdownImage.startsWith("http")) return markdownImage;
  return `${siteUrl || ""}${markdownImage}`;
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}): Promise<Metadata> {
  const p = await params;
  const decodedSlug = decodeURIComponent(p.slug);

  const [blog, { site }] = await Promise.all([
    getBlogBySlug(decodedSlug),
    getSetting(),
  ]);

  if (!blog) return { title: "Blog Not Found" };

  const resolvedImage = resolveBlogImage(blog.image, blog.content, site.url);
  const ogImage = resolvedImage || `${site.url}/default-image.jpg`;

  return {
    title: `${blog.title} | ${site.name} Blog`,
    description: blog.content.slice(0, 160),
    openGraph: {
      title: blog.title,
      description: `Discover expert insights on footwear trends at ${site.name}!`,
      url: `${site.url}/blogs/${blog.slug}`,
      type: "article",
      images: [resolvedImage || ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.content.slice(0, 160),
      images: [resolvedImage || ogImage],
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: { slug: string } | Promise<{ slug: string }>;
}) {
  const p = await params;
  const decodedSlug = decodeURIComponent(p.slug);
  const { site } = await getSetting();

  const blog = await getBlogBySlug(decodedSlug);
  if (!blog) return notFound();

  void incrementBlogViews(decodedSlug);

  const formatDate = (date: string | Date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const resolvedImage = resolveBlogImage(blog.image, blog.content, site.url);

  const commentCount = (blog.comments || []).reduce(
    (total, comment) => total + 1 + (comment.replies?.length || 0),
    0,
  );
  const serializedComments = (blog.comments || []).map((comment) => ({
    ...comment,
    _id: comment._id.toString(),
    createdAt: new Date(comment.createdAt).toISOString(),
    replies: (comment.replies || []).map((reply) => ({
      ...reply,
      _id: reply._id.toString(),
      createdAt: new Date(reply.createdAt).toISOString(),
    })),
  }));

  const ogImage = resolvedImage || `${site.url}/default-image.jpg`;

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    image: resolvedImage || ogImage,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    author: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}${site.logo}`,
      },
    },
    description: blog.content.slice(0, 160),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site.url}/blogs/${blog.slug}`,
    },
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogJsonLd) }}
      />
      <Breadcrumb />
      <div className="mt-2 rounded-2xl border border-border/60 bg-background p-2 sm:p-4">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
              {blog.category}
            </span>
            {(blog.tags || []).slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-muted px-3 py-1 text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
            {blog.title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Fresh takes, styling inspiration, and practical footwear advice for
            the {site.name} community.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <CalendarDays className="size-4" /> {formatDate(blog.createdAt)}
            </span>
            <span className="inline-flex items-center gap-2">
              <Eye className="size-4" /> {blog.views || 0} views
            </span>
            <span className="inline-flex items-center gap-2">
              <Heart className="size-4 text-rose-500" /> {blog.likesCount || 0}{" "}
              likes
            </span>
            <span className="inline-flex items-center gap-2">
              <MessageCircle className="size-4 text-sky-500" /> {commentCount}{" "}
              comments
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-border/60 bg-background p-2 sm:p-4">
        {resolvedImage && (
          <div className="relative mb-5 h-56 w-full overflow-hidden rounded-xl sm:h-72">
            <Image
              src={resolvedImage}
              alt={blog.title}
              fill
              priority
              className="object-cover"
            />
          </div>
        )}
        <MarkdownRenderer content={blog.content} className="mt-2" />

        <div className="mt-8 flex flex-wrap gap-4 text-sm text-muted-foreground justify-between">
          <span className="inline-flex items-center gap-2 font-medium">
            <Tag className="size-4" /> Category: {blog.category}
          </span>
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
          initialComments={serializedComments}
          initialLikedByUsers={blog.likedByUsers || []}
          initialLikedByGuests={blog.likedByGuests || []}
        />
      </div>
    </div>
  );
}
