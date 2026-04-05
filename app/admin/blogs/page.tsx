import { Metadata } from "next";
import BlogList from "./blog-list";
import {
  getAllBlogsForAdmin,
  getBlogAdminStats,
  getAllBlogCategories,
  getAllBlogTags,
} from "@/lib/actions/blog.actions";
import BlogStatsCards from "./blog-stats-cards";
import BlogFilters from "./blog-filters";
import { BlogsDateRangePicker } from "./date-range-picker";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getServerSession } from "@/lib/get-session";

export const metadata: Metadata = {
  title: "Admin Blogs",
};

export default async function AdminBlogPage(props: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    category?: string;
    tag?: string;
    isPublished?: string;
    from?: string;
    to?: string;
    sort?: string;
  }>;
}) {
  const session = await getServerSession();

  if (session?.user.role !== "ADMIN")
    throw new Error("Admin permission required");

  const searchParams = await props.searchParams;
  const {
    page = "1",
    query = "",
    category = "all",
    tag = "all",
    isPublished = "all",
    from,
    to,
    sort = "latest",
  } = searchParams;

  const [data, stats, categories, tags] = await Promise.all([
    getAllBlogsForAdmin({
      query,
      page: Number(page),
      category,
      tag,
      isPublished,
      from,
      to,
      sort,
    }),
    getBlogAdminStats({
      query,
      category,
      tag,
      from,
      to,
    }),
    getAllBlogCategories(),
    getAllBlogTags(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold">Blogs</h1>
          <p className="text-muted-foreground">
            Create, edit, and track engagement for your blog posts
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <BlogsDateRangePicker />
          <Button asChild>
            <Link href="/admin/blogs/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Blog
            </Link>
          </Button>
        </div>
      </div>

      <BlogStatsCards stats={stats} currentStatus={isPublished} />

      <div className="rounded-md border bg-card p-4">
        <BlogFilters
          categories={categories}
          tags={tags}
        />
      </div>

      <BlogList
        data={data}
        page={Number(page)}
      />
    </div>
  );
}
