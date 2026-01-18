import Link from "next/link";
import DeleteDialog from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatId } from "@/lib/utils";
import { Metadata } from "next";
import { getAllBlogs, deleteBlog } from "@/lib/actions/blog.actions";
import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Admin Blog Pages",
};

interface BlogAdminPageProps {
  searchParams?: { filter?: "all" | "published" | "unpublished" };
}

export default async function BlogAdminPage({
  searchParams,
}: BlogAdminPageProps) {
  const session = await getServerSession();

  if (session?.user.role !== "ADMIN")
    throw new Error("Admin permission required");

  const filter = searchParams?.filter || "all";

  // Decide the flag for onlyPublished
  const onlyPublished =
    filter === "published"
      ? true
      : filter === "unpublished"
      ? false
      : undefined;

  const { blogs } = await getAllBlogs({
    page: 1,
    limit: 50,
    onlyPublished: onlyPublished === undefined ? false : onlyPublished,
  });

  return (
    <div className="space-y-2">
      {/* Header + Filters */}
      <div className="flex flex-row flex-wrap justify-between gap-2 items-center">
        <h1 className="h1-bold">Blogs</h1>

        <div className="flex gap-2">
          <Button
            asChild
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
          >
            <Link href="/admin/blogs?filter=all">All</Link>
          </Button>
          <Button
            asChild
            variant={filter === "published" ? "default" : "outline"}
            size="sm"
          >
            <Link href="/admin/blogs?filter=published">Published</Link>
          </Button>
          <Button
            asChild
            variant={filter === "unpublished" ? "default" : "outline"}
            size="sm"
          >
            <Link href="/admin/blogs?filter=unpublished">Unpublished</Link>
          </Button>

          <Button asChild variant="default" size="sm">
            <Link href="/admin/blogs/create">Create</Link>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Id</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Views</TableHead>
              <TableHead>IsPublished</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length > 0 ? (
              blogs.map((blog) => (
                <TableRow key={blog._id}>
                  <TableCell>{formatId(blog._id)}</TableCell>
                  <TableCell>{blog.title}</TableCell>
                  <TableCell>{blog.slug}</TableCell>
                  <TableCell>{blog.views}</TableCell>
                  <TableCell>{blog.isPublished ? "Yes" : "No"}</TableCell>
                  <TableCell className="flex gap-1">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/blogs/${blog._id}`}>Edit</Link>
                    </Button>
                    <DeleteDialog id={blog._id} action={deleteBlog} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No blogs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
