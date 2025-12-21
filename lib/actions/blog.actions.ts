/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { cacheTag, revalidatePath, updateTag } from "next/cache";
import { z } from "zod";
import { connectToDatabase } from "../db";
import Blog, { IBlog } from "../db/models/blog.model";
import { BlogInputSchema, BlogUpdateSchema } from "../validator";
import { cacheLife } from "next/cache";

// 🔹 CREATE BLOG
export async function createBlog(data: z.infer<typeof BlogInputSchema>) {
  try {
    const blog = BlogInputSchema.parse(data);
    await connectToDatabase();
    await Blog.create(blog);
    revalidatePath("/admin/blogs");
    updateTag("blogs");
    return { success: true, message: "Blog created successfully" };
  } catch (error) {
    return { success: false, message: "Error creating blog" };
  }
}

// 🔹 UPDATE BLOG
export async function updateBlog(data: z.infer<typeof BlogUpdateSchema>) {
  try {
    const blog = BlogUpdateSchema.parse(data);
    await connectToDatabase();
    await Blog.findByIdAndUpdate(blog._id, blog);
    revalidatePath("/admin/blogs");
    updateTag("blogs");
    return { success: true, message: "Blog updated successfully" };
  } catch (error) {
    return { success: false, message: "Error updating blog" };
  }
}

// 🔹 DELETE BLOG
export async function deleteBlog(id: string) {
  try {
    await connectToDatabase();
    const res = await Blog.findByIdAndDelete(id);
    if (!res) throw new Error("Blog not found");
    revalidatePath("/admin/blogs");
    updateTag("blogs");
    return { success: true, message: "Blog deleted successfully" };
  } catch (error) {
    return { success: false, message: "Error deleting blog" };
  }
}

// 🔹 GET ALL BLOGS (WITH OPTIONAL PUBLISHED FILTER)
export async function getAllBlogs({
  page = 1,
  limit = 9,
  onlyPublished = false, // ✅ New optional filter
}: {
  page?: number;
  limit?: number;
  onlyPublished?: boolean;
}) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");
  await connectToDatabase();

  const filter = onlyPublished ? { isPublished: true } : {}; // fetch all if false

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

// get published bogs only
export async function getPublishedBlogs({
  page = 1,
  limit = 9,
}: {
  page?: number;
  limit?: number;
}) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");
  await connectToDatabase();
  return getAllBlogs({
    page,
    limit,
    onlyPublished: true,
  });
}

// 🔹 GET BLOG BY SLUG
export async function getBlogBySlug(slug: string): Promise<IBlog | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");
  await connectToDatabase();
  const blog = await Blog.findOne({ slug }).lean();
  if (!blog) return null;

  return {
    ...blog,
    createdAt: new Date(blog.createdAt),
    updatedAt: new Date(blog.updatedAt),
  };
}

// 🔹 GET BLOG BY ID
export async function getBlogById(blogId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");
  await connectToDatabase();
  const blog = await Blog.findById(blogId).lean();
  if (!blog) return null;

  return {
    ...blog,
    _id: blog._id.toString(),
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
  };
}

// 🔹 GET ALL CATEGORIES
export async function getAllBlogCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");
  await connectToDatabase();
  return await Blog.distinct("category");
}

// 🔹 GET ALL TAGS
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
  return tags.map((tag) =>
    tag.tag
      .split("-")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  );
}

// 🔹 INCREMENT BLOG VIEWS
export async function incrementBlogViews(slug: string) {
  "use cache";
  cacheLife("hours");

  try {
    await connectToDatabase();
    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    );
    return { success: true, views: blog?.views || 0 };
  } catch (error) {
    return { success: false, message: "Failed to update views" };
  }
}

// 🔹 GET MOST VIEWED BLOGS
export async function getMostViewedBlogs(limit: number = 5) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");
  try {
    await connectToDatabase();
    const blogs = await Blog.find()
      .sort({ views: -1 })
      .limit(limit)
      .select("title slug image views");
    return blogs;
  } catch (error) {
    return [];
  }
}

// 🔹 FETCH LATEST BLOGS
export async function fetchLatestBlogs({ limit = 4 }: { limit?: number }) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");
  await connectToDatabase();
  const blogs = await Blog.find().sort({ createdAt: -1 }).limit(limit).lean();

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
