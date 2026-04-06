"use client";

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

function extractFirstImageUrl(markdownContent: string) {
  if (!markdownContent) return null;
  const match = markdownContent.match(/!\[.*?\]\((https?:\/\/[^\s)]+)\)/);
  return match ? match[1] : null;
}

export default function BlogCard({ blog }: { blog: BlogCardProps }) {
  const formattedDate = formatDate(blog.createdAt);

  const firstImageUrl = extractFirstImageUrl(blog.content)?.trim();
  const imageSrc = blog.image?.trim() || firstImageUrl || null;

  return (
    <article className="group overflow-hidden rounded-2xl border border-border/50 bg-background transition-colors hover:border-border">
      
      {/* IMAGE */}
      <Link href={`/blogs/${blog.slug}`} className="block">
        <div className="relative h-44 w-full overflow-hidden bg-muted sm:h-48">
          
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={blog.title}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <div className="text-center space-y-1">
                <div className="text-3xl opacity-20">📰</div>
                <p className="text-xs text-muted-foreground/60">No Image</p>
              </div>
            </div>
          )}

          {/* Overlay (lighter, no blur) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          {/* Meta */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-2 text-xs text-white">
            <span className="font-medium">{formattedDate}</span>
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 font-medium border border-white/10">
              {blog.category}
            </span>
          </div>
        </div>
      </Link>

      {/* CONTENT */}
      <div className="p-4 space-y-3">
        
        <Link href={`/blogs/${blog.slug}`} className="block">
          <h3 className="line-clamp-2 text-base sm:text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
            {blog.title}
          </h3>
        </Link>

        {/* Footer */}
        <div className="flex items-center justify-between pt-1">
          
          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            
            <span className="inline-flex items-center gap-1.5">
              <Heart className="size-3.5 text-rose-500 fill-rose-500" />
              <span className="font-medium">{blog.likesCount || 0}</span>
            </span>

            <span className="inline-flex items-center gap-1.5">
              <MessageCircle className="size-3.5 text-sky-500 fill-sky-500" />
              <span className="font-medium">{blog.commentsCount || 0}</span>
            </span>

          </div>

          {/* CTA */}
          <Link
            href={`/blogs/${blog.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-transform duration-200 hover:translate-x-1"
          >
            Read
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
