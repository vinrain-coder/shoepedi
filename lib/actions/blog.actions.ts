/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { notFound } from "next/navigation";

import { connectToDatabase } from "../db";
import Blog, { IBlog } from "../db/models/blog.model";
import { BlogInputSchema, BlogUpdateSchema } from "../validator";

/* ================================
   CREATE BLOG
================================ */
export async function createBlog(
  data: z.infer<typeof BlogInputSchema>
) {
  try {
    const blog = BlogInputSchema.parse(data);
    await connectToDatabase();
    await Blog.create(blog);

    revalidatePath("/admin/blogs");
    revalidateTag("blogs");

    return { success: true, message: "Blog created successfully" };
  } catch {
    return { success: false, message: "Error creating blog" };
  }
}

/* ================================
   UPDATE BLOG
================================ */
export async function updateBlog(
  data: z.infer<typeof BlogUpdateSchema>
) {
  try {
    const blog = BlogUpdateSchema.parse(data);
    await connectToDatabase();
    await Blog.findByIdAndUpdate(blog._id, blog);

    revalidatePath("/admin/blogs");
    revalidateTag("blogs");

    return { success: true, message: "Blog updated successfully" };
  } catch {
    return { success: false, message: "Error updating blog" };
  }
}

/* ================================
   DELETE BLOG
================================ */
export async function deleteBlog(id: string) {
  try {
    await connectToDatabase();
    const res = await Blog.findByIdAndDelete(id);
    if (!res) throw new Error("Blog not found");

    revalidatePath("/admin/blogs");
    revalidateTag("blogs");

    return { success: true, message: "Blog deleted successfully" };
  } catch {
    return { success: false, message: "Error deleting blog" };
  }
}

/* ================================
   GET ALL BLOGS
================================ */
export async function getAllBlogs({
  page = 1,
  limit = 9,
  onlyPublished = false,
}: {
  page?: number;
  limit?: number;
  onlyPublished?: boolean;
}) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  await connectToDatabase();

  const filter = onlyPublished ? { isPublished: true } : {};
  const totalBlogs = await Blog.countDocuments(filter);
  const totalPages = Math.ceil(totalBlogs / limit);

  const blogs = await Blog.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select(
      "_id title slug image content category views tags createdAt updatedAt isPublished"
    )
    .lean();

  return {
    blogs: blogs.map((blog) => ({
      _id: blog._id.toString(),
      title: blog.title,
      slug: blog.slug,
      image: blog.image,
      content: blog.content,
      category: blog.category,
      views: blog.views,
      tags: blog.tags,
      createdAt: blog.createdAt.toISOString(),
      updatedAt: blog.updatedAt.toISOString(),
      isPublished: blog.isPublished,
    })),
    totalPages,
  };
}

/* ================================
   GET PUBLISHED BLOGS
================================ */
export async function getPublishedBlogs({
  page = 1,
  limit = 9,
}: {
  page?: number;
  limit?: number;
}) {
  return getAllBlogs({ page, limit, onlyPublished: true });
}

/* ================================
   GET BLOG BY SLUG
================================ */
export async function getBlogBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  await connectToDatabase();
  const blog = await Blog.findOne({
    slug,
    isPublished: true,
  }).lean();

  if (!blog) notFound();

  return blog as IBlog;
}

/* ================================
   GET BLOG BY ID
================================ */
export async function getBlogById(blogId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  await connectToDatabase();
  const blog = await Blog.findById(blogId).lean();
  if (!blog) return null;

  return blog as IBlog;
}

/* ================================
   GET ALL CATEGORIES
================================ */
export async function getAllBlogCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  await connectToDatabase();
  return Blog.distinct("category");
}

/* ================================
   GET ALL TAGS
================================ */
export async function getAllBlogTags() {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  await connectToDatabase();

  const tags = await Blog.aggregate([
    { $unwind: "$tags" },
    { $group: { _id: "$tags", count: { $sum: 1 } } },
    { $match: { count: { $gt: 0 } } },
    { $sort: { _id: 1 } },
    { $project: { tag: "$_id", _id: 0 } },
  ]);

  return tags.map((t) =>
    t.tag
      .split("-")
      .map((w: string) => w[0].toUpperCase() + w.slice(1))
      .join(" ")
  );
}

/* ================================
   INCREMENT BLOG VIEWS (NO CACHE)
================================ */
export async function incrementBlogViews(slug: string) {
  try {
    await connectToDatabase();
    const blog = await Blog.findOneAndUpdate(
      { slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    );

    return { success: true, views: blog?.views ?? 0 };
  } catch {
    return { success: false, message: "Failed to update views" };
  }
}

/* ================================
   MOST VIEWED BLOGS
================================ */
export async function getMostViewedBlogs(limit = 5) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  await connectToDatabase();
  return Blog.find({ isPublished: true })
    .sort({ views: -1 })
    .limit(limit)
    .select("title slug image views")
    .lean();
}

/* ================================
   LATEST BLOGS
================================ */
export async function fetchLatestBlogs({
  limit = 4,
}: {
  limit?: number;
}) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  await connectToDatabase();
  const blogs = await Blog.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return blogs.map((blog) => ({
    _id: blog._id.toString(),
    title: blog.title,
    slug: blog.slug,
    image: blog.image,
    content: blog.content,
    category: blog.category,
    tags: blog.tags,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    isPublished: blog.isPublished,
  }));
      }
  
