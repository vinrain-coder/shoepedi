"use client"; // make this component a client component

import { useEffect, useState } from "react";
import { formatDate } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

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
    <div className="border rounded-xl h-96 max-w-80 shadow-md dark:shadow-lg overflow-hidden bg-white dark:bg-gray-900 transition-all duration-300 hover:shadow-xl dark:hover:shadow-2xl">
      <Link href={`/blogs/${blog.slug}`} className="block group">
        <div className="relative w-full h-56 overflow-hidden">
          <Image
            src={firstImageUrl || "/images/not-found.png"}
            alt={blog.title}
            width={640}
            height={224}
            style={{ objectFit: "cover" }}
            className="group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      <div className="p-5">
        <Link href={`/blogs/${blog.slug}`} className="block group">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 group-hover:text-primary transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </Link>

        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {formattedDate}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm items-center justify-between">
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 font-medium">
            {blog.category}
          </span>
          <span>
            <Link
              href={`/blogs/${blog.slug}`}
              className="hover:underline hover:text-primary"
            >
              Read more →
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
