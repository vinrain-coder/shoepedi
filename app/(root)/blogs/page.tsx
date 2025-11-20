import React, { Suspense } from "react";
import { getPublishedBlogs } from "@/lib/actions/blog.actions";
import BlogCard from "@/components/shared/blog/blog-card";
import Pagination from "@/components/shared/pagination";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import { Metadata } from "next";
import { Skeleton } from "@/components/ui/skeleton";
import { cacheLife } from "next/cache";
import Breadcrumb from "@/components/shared/breadcrumb";

export const metadata: Metadata = {
  title: "Blogs & Trends",
  description:
    "Explore our latest shoe-related blogs, trends, and styling tips. Stay updated with the newest footwear fashion at ShoePedi.",
};

async function BlogList({ currentPage }: { currentPage: number }) {
  "use cache";
  cacheLife("days");
  const { blogs, totalPages } = await getPublishedBlogs({ page: currentPage });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {blogs.length === 0 ? (
          <p>No blogs found.</p>
        ) : (
          blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination page={currentPage} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}

function BlogListSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-5 w-64 mt-2" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = React.use(searchParams);
  const currentPage = Number(params.page) || 1;

  return (
    <div className="space-y-6">
      <Breadcrumb />
      <div>
        <h1 className="font-bold text-2xl">Latest Blogs</h1>
        <p className="text-gray-600">Explore our latest blogs and articles</p>
      </div>
      <div className="bg-card grid md:grid-cols-3 md:gap-4">
        <div className="md:col-span-3 space-y-4">
          <Suspense fallback={<BlogListSkeleton />}>
            <BlogList currentPage={currentPage} />
          </Suspense>
        </div>
      </div>

      <BrowsingHistoryList className="mt-16" />
    </div>
  );
}
