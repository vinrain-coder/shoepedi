"use client";

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
import { deleteBlog, SerializedBlog } from "@/lib/actions/blog.actions";
import { cn, formatDateTime, formatId } from "@/lib/utils";
import { EyeIcon, PenBox, ThumbsUp, MessageSquare, BarChart3 } from "lucide-react";
import Image from "next/image";
import Pagination from "@/components/shared/pagination";

type BlogListDataProps = {
  blogs: SerializedBlog[];
  totalPages: number;
  totalBlogs: number;
  to: number;
  from: number;
};

interface BlogListProps {
  data: BlogListDataProps;
  page: number;
}

const BlogList = ({ data, page }: BlogListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.totalBlogs === 0
            ? "No blogs found"
            : `Showing ${data.from}-${data.to} of ${data.totalBlogs} blogs`}
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Id</TableHead>
              <TableHead className="w-20">Image</TableHead>
              <TableHead className="w-60">Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-center">Views</TableHead>
              <TableHead className="text-center">Likes</TableHead>
              <TableHead className="text-center">Comments</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.blogs.length > 0 ? (
              data.blogs.map((blog: SerializedBlog) => (
                <TableRow key={blog._id}>
                  <TableCell className="font-mono text-xs">
                    {formatId(blog._id)}
                  </TableCell>
                  <TableCell>
                    {blog.image ? (
                      <div className="relative aspect-square w-12 overflow-hidden rounded-md border">
                        <Image
                          src={blog.image}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-muted text-[10px] text-muted-foreground">
                        No Image
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate font-medium">
                    <Link
                      href={`/admin/blogs/${blog._id}`}
                      className="hover:underline"
                    >
                      {blog.title}
                    </Link>
                    <p className="text-[10px] text-muted-foreground truncate">{blog.slug}</p>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                      {blog.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <BarChart3 className="size-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{blog.views || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <ThumbsUp className="size-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{blog.likesCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <MessageSquare className="size-3 text-muted-foreground" />
                      <span className="text-sm font-medium">{blog.commentsCount || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {blog.isPublished ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                        No
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(blog.updatedAt).dateTime}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm" title="Edit">
                        <Link href={`/admin/blogs/${blog._id}`}>
                          <PenBox className="size-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" title="View">
                        <Link target="_blank" href={`/blog/${blog.slug}`}>
                          <EyeIcon className="size-4" />
                        </Link>
                      </Button>
                      <DeleteDialog id={blog._id} action={deleteBlog} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={10}
                  className="h-24 text-center text-muted-foreground"
                >
                  No blogs found matching the criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page.toString()} totalPages={data.totalPages} />
        </div>
      )}
    </div>
  );
};

export default BlogList;
