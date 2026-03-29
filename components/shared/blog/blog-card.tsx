"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, MessageCircle } from "lucide-react";

type BlogCardProps = {
  _id: string;
  slug: string;
  title: string;
  image?: string;
  content: string;
  createdAt: string;
  category: string;
  likesCount?: number;
  commentsCount?: number;
};

export default function BlogCard({ blog }: { blog: BlogCardProps }) {
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    setFormattedDate(formatDate(blog.createdAt));
  }, [blog.createdAt]);

  function extractFirstImageUrl(markdownContent: string) {
    if (!markdownContent) return null;
    const match = markdownContent.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
    return match ? match[1] : null;
  }

  const firstImageUrl = extractFirstImageUrl(blog.content);
  const imageSrc =
    blog.image && blog.image.trim() !== ""
      ? blog.image
      : firstImageUrl && firstImageUrl.trim() !== ""
      ? firstImageUrl
      : null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-border/50 bg-background p-0 transition-all hover:border-border">
      <Link href={`/blogs/${blog.slug}`} className="block">
        <div className="relative h-44 w-full overflow-hidden bg-muted sm:h-48">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={blog.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-muted to-muted/50">
              <div className="text-center space-y-1">
                <div className="text-4xl opacity-20">📰</div>
                <p className="text-xs text-muted-foreground/60">No Image</p>
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3 text-xs text-white/90">
            <span className="font-medium">{formattedDate}</span>
            <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 font-medium border border-white/10">
              {blog.category}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4 space-y-3">
        <Link href={`/blogs/${blog.slug}`} className="block">
          <h3 className="line-clamp-2 text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
            {blog.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 transition-colors group-hover:text-rose-500">
              <Heart className="size-3.5 text-rose-500 fill-rose-500/20" />
              <span className="font-medium">{blog.likesCount || 0}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 transition-colors group-hover:text-sky-500">
              <MessageCircle className="size-3.5 text-sky-500 fill-sky-500/20" />
              <span className="font-medium">{blog.commentsCount || 0}</span>
            </span>
          </div>

          <Link
            href={`/blogs/${blog.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all"
          >
            Read
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
  
