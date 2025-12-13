"use client";

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export default function BlogCard({ blog }: { blog: any }) {
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

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg p-0">
      {/* Image */}
      <Link href={`/blogs/${blog.slug}`} className="group block">
        <div className="relative h-40 w-full overflow-hidden">
          <Image
            src={firstImageUrl || "/images/not-found.png"}
            alt={blog.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </Link>

      {/* Content */}
      <CardHeader className="px-2 py-0">
        <Link href={`/blogs/${blog.slug}`}>
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 hover:text-primary transition-colors">
            {blog.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="px-2 py-0">
        <p className="text-xs text-muted-foreground">{formattedDate}</p>
      </CardContent>

      {/* Footer */}
      <CardFooter className="px-2 mb-2 py-0 flex flex-col gap-1 items-center justify-center">
        <Badge variant="secondary" className="text-xs">
          {blog.category}
        </Badge>

        <Link
          href={`/blogs/${blog.slug}`}
          className="text-xs font-medium text-primary hover:underline flex gap-1"
        >
          Read more <ArrowRight size={16} />
        </Link>
      </CardFooter>
    </Card>
  );
}
