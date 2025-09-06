/* eslint-disable @typescript-eslint/no-unused-vars */
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { connectToDatabase } from "../db";
import Blog, { IBlog } from "../db/models/blog.model";
import { BlogInputSchema, BlogUpdateSchema } from "../validator";
import { notFound } from "next/navigation";

// 🔹 CREATE BLOG
export async function createBlog(data: z.infer<typeof BlogInputSchema>) {
  try {
    const blog = BlogInputSchema.parse(data);
    await connectToDatabase();
    await Blog.create(blog);
    revalidatePath("/admin/blogs");
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
    return { success: true, message: "Blog deleted successfully" };
  } catch (error) {
    return { success: false, message: "Error deleting blog" };
  }
}

export async function getAllBlogs({
  page = 1,
  limit = 9,
}: {
  page?: number;
  limit?: number;
}) {
  await connectToDatabase();

  const totalBlogs = await Blog.countDocuments({ isPublished: true });

  const totalPages = Math.ceil(totalBlogs / limit);

  const blogs = await Blog.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select(
      "_id title slug content category views tags createdAt updatedAt isPublished"
    )

    .lean();

  return {
    blogs: blogs.map((blog) => ({
      _id: blog._id.toString(),
      title: blog.title,
      slug: blog.slug,
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

export async function getBlogBySlug(slug: string): Promise<IBlog | null> {
  await connectToDatabase();
  const blog = await Blog.findOne({ slug }).lean();

  if (!blog) return null;

  return {
    ...blog,
    createdAt: new Date(blog.createdAt),
    updatedAt: new Date(blog.updatedAt),
  };
}

export async function getBlogById(blogId: string) {
  await connectToDatabase();
  const blog = await Blog.findById(blogId).lean();

  if (!blog) return null;

  return {
    ...blog,
    _id: blog._id.toString(), // ✅ Convert ObjectId to string
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
  };
}

// 🔹 GET ALL CATEGORIES (UNIQUE)
export async function getAllBlogCategories() {
  await connectToDatabase();
  return await Blog.distinct("category");
}

// 🔹 GET ALL TAGS (UNIQUE, FORMATTED)
export async function getAllBlogTags() {
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

export async function incrementBlogViews(slug: string) {
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

export async function getMostViewedBlogs(limit: number = 5) {
  try {
    await connectToDatabase();
    const blogs = await Blog.find({ isPublished: true })
      .sort({ views: -1 }) // ✅ Sort by views (highest first)
      .limit(limit)
      .select("title slug coverImage views");

    return blogs;
  } catch (error) {
    return [];
  }
}

export async function fetchLatestBlogs(p0: { limit: number; }) {
  await connectToDatabase();
  const blogs = await Blog.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .limit(4)
    .lean(); // ✅ lean returns plain JS objects

  return blogs.map((blog) => ({
    _id: blog._id.toString(),
    title: blog.title,
    slug: blog.slug,
    content: blog.content,
    category: blog.category,
    tags: blog.tags,
    createdAt: blog.createdAt.toISOString(),
  }));
}

