import { getAllBlogs } from "@/lib/actions/blog.actions";
import BlogCard from "@/components/shared/blog/blog-card";
import Pagination from "@/components/shared/pagination";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs & Trends",
  description:
    "Explore our latest shoe-related blogs, trends, and styling tips. Stay updated with the newest footwear fashion at ShoePedi.",
};

export default async function BlogPage({
  searchParams = {},
}: {
  searchParams?: Record<string, string>;
}) {
  const currentPage = Number(searchParams.page) || 1;

  // Fetch blogs
  const { blogs, totalPages } = await getAllBlogs({ page: currentPage });

  return (
    <div className="space-y-6">
      <div className="bg-card grid md:grid-cols-3 md:gap-4">
        <div className="md:col-span-3 space-y-4">
          <div>
            <h1 className="font-bold text-2xl">Latest Blogs</h1>
            <p className="text-gray-600">
              Explore our latest blogs and articles
            </p>
          </div>

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
      </div>

      <BrowsingHistoryList className="mt-16" />
    </div>
  );
}
