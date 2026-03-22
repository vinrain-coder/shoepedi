"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

import {
  Card,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
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
    <Card className="group overflow-hidden border-border/60 p-0 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/blogs/${blog.slug}`} className="block">
        <div className="relative h-52 w-full overflow-hidden bg-muted">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={blog.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
              No Image
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-4 py-3 text-xs text-white">
            <span>{formattedDate}</span>
            <span className="rounded-full bg-white/15 px-2 py-1 backdrop-blur">{blog.category}</span>
          </div>
        </div>
      </Link>

      <CardHeader className="space-y-3 px-4 pt-4 pb-2">
        <Link href={`/blogs/${blog.slug}`}>
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
            {blog.title}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Heart className="size-4 text-rose-500" /> {blog.likesCount || 0}</span>
          <span className="inline-flex items-center gap-1"><MessageCircle className="size-4 text-sky-500" /> {blog.commentsCount || 0}</span>
        </div>
      </CardHeader>

      <CardFooter className="px-4 pb-4 pt-0">
        <Link
          href={`/blogs/${blog.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Read more <ArrowRight size={16} />
        </Link>
      </CardFooter>
    </Card>
  );
}
