"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { notFound } from "next/navigation";
import mongoose from "mongoose";

import { connectToDatabase } from "../db";
import Blog, { IBlog, IBlogComment, IBlogReply } from "../db/models/blog.model";
import { BlogCommentInputSchema, BlogInputSchema, BlogLikeInputSchema, BlogUpdateSchema } from "../validator";
import { getServerSession } from "../get-session";
import { formatError } from "../utils";

const BLOG_ADMIN_PATH = "/admin/blogs";

function serializeReply(reply: IBlogReply) {
  return {
    _id: reply._id.toString(),
    userId: reply.userId,
    userName: reply.userName,
    userImage: reply.userImage || "",
    content: reply.content,
    likesCount: reply.likesCount ?? 0,
    likedByUsers: reply.likedByUsers || [],
    likedByGuests: reply.likedByGuests || [],
    createdAt: reply.createdAt.toISOString(),
    updatedAt: reply.updatedAt.toISOString(),
  };
}

function serializeComment(comment: IBlogComment) {
  return {
    _id: comment._id.toString(),
    userId: comment.userId,
    userName: comment.userName,
    userImage: comment.userImage || "",
    content: comment.content,
    likesCount: comment.likesCount ?? 0,
    likedByUsers: comment.likedByUsers || [],
    likedByGuests: comment.likedByGuests || [],
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    replies: (comment.replies || []).map(serializeReply),
  };
}

type SerializedComment = ReturnType<typeof serializeComment>;
type SerializedBlog = {
  _id: string;
  title: string;
  slug: string;
  image: string;
  content: string;
  category: string;
  views: number;
  likesCount: number;
  likedByUsers: string[];
  likedByGuests: string[];
  commentsCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
  comments: SerializedComment[];
};

function serializeBlog(blog: Record<string, unknown> & {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  image: string;
  content: string;
  category: string;
  views?: number;
  likesCount?: number;
  likedByUsers?: string[];
  likedByGuests?: string[];
  comments?: IBlogComment[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
}): SerializedBlog {
  const comments = (blog.comments || []).map(serializeComment);
  return {
    _id: blog._id.toString(),
    title: blog.title,
    slug: blog.slug,
    image: blog.image,
    content: blog.content,
    category: blog.category,
    views: blog.views ?? 0,
    likesCount: blog.likesCount ?? 0,
    likedByUsers: blog.likedByUsers || [],
    likedByGuests: blog.likedByGuests || [],
    commentsCount: comments.reduce((total, comment) => total + 1 + (comment.replies?.length || 0), 0),
    tags: blog.tags,
    createdAt: blog.createdAt.toISOString(),
    updatedAt: blog.updatedAt.toISOString(),
    isPublished: blog.isPublished,
    comments,
  };
}

function getActorSets(input: z.infer<typeof BlogLikeInputSchema>) {
  return input.userId
    ? { key: "likedByUsers" as const, actorId: input.userId }
    : { key: "likedByGuests" as const, actorId: input.guestId! };
}

export async function createBlog(data: z.infer<typeof BlogInputSchema>) {
  try {
    const blog = BlogInputSchema.parse(data);
    await connectToDatabase();
    await Blog.create(blog);

    revalidatePath(BLOG_ADMIN_PATH);
    revalidateTag("blogs");

    return { success: true, message: "Blog created successfully" };
  } catch {
    return { success: false, message: "Error creating blog" };
  }
}

export async function updateBlog(data: z.infer<typeof BlogUpdateSchema>) {
  try {
    const blog = BlogUpdateSchema.parse(data);
    await connectToDatabase();
    await Blog.findByIdAndUpdate(blog._id, blog);

    revalidatePath(BLOG_ADMIN_PATH);
    revalidateTag("blogs");

    return { success: true, message: "Blog updated successfully" };
  } catch {
    return { success: false, message: "Error updating blog" };
  }
}

export async function deleteBlog(id: string) {
  try {
    await connectToDatabase();
    const res = await Blog.findByIdAndDelete(id);
    if (!res) throw new Error("Blog not found");

    revalidatePath(BLOG_ADMIN_PATH);
    revalidateTag("blogs");

    return { success: true, message: "Blog deleted successfully" };
  } catch {
    return { success: false, message: "Error deleting blog" };
  }
}

export async function getAllBlogs({
  page = 1,
  limit = 9,
  onlyPublished,
}: {
  page?: number;
  limit?: number;
  onlyPublished?: boolean;
}) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  await connectToDatabase();

  const filter = typeof onlyPublished === "boolean" ? { isPublished: onlyPublished } : {};
  const totalBlogs = await Blog.countDocuments(filter);
  const totalPages = Math.ceil(totalBlogs / limit);

  const blogs = await Blog.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .select("_id title slug image content category views likesCount likedByUsers likedByGuests comments tags createdAt updatedAt isPublished")
    .lean();

  return {
    blogs: blogs.map(serializeBlog),
    totalPages,
  };
}

export async function getPublishedBlogs({ page = 1, limit = 9 }: { page?: number; limit?: number }) {
  return getAllBlogs({ page, limit, onlyPublished: true });
}

export async function getBlogBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  await connectToDatabase();
  const blog = await Blog.findOne({ slug, isPublished: true }).lean();
  if (!blog) notFound();
  return serializeBlog(blog) as unknown as IBlog;
}

export async function getBlogById(blogId: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  await connectToDatabase();
  const blog = await Blog.findById(blogId).lean();
  if (!blog) return null;
  return serializeBlog(blog) as unknown as IBlog;
}

export async function getAllBlogCategories() {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  await connectToDatabase();
  return Blog.distinct("category");
}

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

export async function incrementBlogViews(slug: string) {
  try {
    await connectToDatabase();
    const blog = await Blog.findOneAndUpdate({ slug, isPublished: true }, { $inc: { views: 1 } }, { new: true });
    revalidateTag("blogs");
    return { success: true, views: blog?.views ?? 0 };
  } catch {
    return { success: false, message: "Failed to update views" };
  }
}

export async function toggleBlogLike(input: z.infer<typeof BlogLikeInputSchema>) {
  try {
    const data = BlogLikeInputSchema.parse(input);
    await connectToDatabase();

    const { key, actorId } = getActorSets(data);
    const blog = await Blog.findById(data.blogId);
    if (!blog) throw new Error("Blog not found");

    const set = new Set((blog[key] || []).map(String));
    const hasLiked = set.has(actorId);

    if (hasLiked) {
      set.delete(actorId);
      blog.likesCount = Math.max(0, (blog.likesCount || 0) - 1);
    } else {
      set.add(actorId);
      blog.likesCount = (blog.likesCount || 0) + 1;
    }

    blog[key] = Array.from(set) as never;
    await blog.save();

    revalidateTag("blogs");
    revalidatePath(BLOG_ADMIN_PATH);
    revalidatePath(`/blogs/${blog.slug}`);
    revalidatePath("/blogs");

    return { success: true, liked: !hasLiked, likesCount: blog.likesCount };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function createBlogComment(input: z.infer<typeof BlogCommentInputSchema>) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Please sign in to comment");

    const data = BlogCommentInputSchema.parse(input);
    await connectToDatabase();

    const blog = await Blog.findById(data.blogId);
    if (!blog) throw new Error("Blog not found");

    const payload = {
      _id: new mongoose.Types.ObjectId(),
      userId: session.user.id,
      userName: session.user.name || session.user.email,
      userImage: session.user.image || "",
      content: data.content,
      likesCount: 0,
      likedByUsers: [],
      likedByGuests: [],
      replies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (data.parentCommentId) {
      const comment = blog.comments.id(data.parentCommentId);
      if (!comment) throw new Error("Parent comment not found");
      comment.replies.push(payload as never);
    } else {
      blog.comments.push(payload as never);
    }

    await blog.save();

    revalidateTag("blogs");
    revalidatePath(BLOG_ADMIN_PATH);
    revalidatePath(`/blogs/${blog.slug}`);
    return { success: true, message: data.parentCommentId ? "Reply added" : "Comment added" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function toggleBlogCommentLike(input: z.infer<typeof BlogLikeInputSchema> & { commentId: string; replyId?: string }) {
  try {
    const data = BlogLikeInputSchema.extend({ commentId: z.string().min(1), replyId: z.string().optional() }).parse(input);
    await connectToDatabase();

    const { key, actorId } = getActorSets(data);
    const blog = await Blog.findById(data.blogId);
    if (!blog) throw new Error("Blog not found");

    const comment = blog.comments.id(data.commentId);
    if (!comment) throw new Error("Comment not found");

    const target = data.replyId ? comment.replies.id(data.replyId) : comment;
    if (!target) throw new Error("Reply not found");

    const set = new Set((target[key] || []).map(String));
    const hasLiked = set.has(actorId);

    if (hasLiked) {
      set.delete(actorId);
      target.likesCount = Math.max(0, (target.likesCount || 0) - 1);
    } else {
      set.add(actorId);
      target.likesCount = (target.likesCount || 0) + 1;
    }

    target[key] = Array.from(set) as never;
    await blog.save();

    revalidateTag("blogs");
    revalidatePath(BLOG_ADMIN_PATH);
    revalidatePath(`/blogs/${blog.slug}`);

    return { success: true, liked: !hasLiked, likesCount: target.likesCount };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function editBlogComment(input: {
  blogId: string;
  commentId: string;
  replyId?: string;
  content: string;
}) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Please sign in to edit your comment");

    const data = z
      .object({
        blogId: z.string().regex(/^[0-9a-fA-F]{24}$/),
        commentId: z.string().min(1),
        replyId: z.string().optional(),
        content: z.string().trim().min(1).max(2000),
      })
      .parse(input);

    await connectToDatabase();
    const blog = await Blog.findById(data.blogId);
    if (!blog) throw new Error("Blog not found");

    const comment = blog.comments.id(data.commentId);
    if (!comment) throw new Error("Comment not found");

    if (data.replyId) {
      const reply = comment.replies.id(data.replyId);
      if (!reply) throw new Error("Reply not found");
      if (reply.userId !== session.user.id) throw new Error("You can only edit your own replies");
      reply.content = data.content;
      reply.updatedAt = new Date();
    } else {
      if (comment.userId !== session.user.id) throw new Error("You can only edit your own comments");
      comment.content = data.content;
      comment.updatedAt = new Date();
    }

    await blog.save();
    revalidateTag("blogs");
    revalidatePath(BLOG_ADMIN_PATH);
    revalidatePath(`/blogs/${blog.slug}`);
    return { success: true, message: "Comment updated" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function deleteBlogComment(input: {
  blogId: string;
  commentId: string;
  replyId?: string;
}) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Please sign in to delete your comment");

    const data = z
      .object({
        blogId: z.string().regex(/^[0-9a-fA-F]{24}$/),
        commentId: z.string().min(1),
        replyId: z.string().optional(),
      })
      .parse(input);

    await connectToDatabase();
    const blog = await Blog.findById(data.blogId);
    if (!blog) throw new Error("Blog not found");

    const comment = blog.comments.id(data.commentId);
    if (!comment) throw new Error("Comment not found");

    if (data.replyId) {
      const reply = comment.replies.id(data.replyId);
      if (!reply) throw new Error("Reply not found");
      if (reply.userId !== session.user.id) throw new Error("You can only delete your own replies");
      reply.deleteOne();
    } else {
      if (comment.userId !== session.user.id) throw new Error("You can only delete your own comments");
      comment.deleteOne();
    }

    await blog.save();
    revalidateTag("blogs");
    revalidatePath(BLOG_ADMIN_PATH);
    revalidatePath(`/blogs/${blog.slug}`);
    return { success: true, message: "Comment deleted" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getMostViewedBlogs(limit = 5) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  await connectToDatabase();
  return Blog.find({ isPublished: true }).sort({ views: -1 }).limit(limit).select("title slug image views likesCount comments").lean();
}

export async function fetchLatestBlogs({ limit = 4 }: { limit?: number }) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");

  await connectToDatabase();
  const blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 }).limit(limit).lean();
  return blogs.map(serializeBlog);
}
