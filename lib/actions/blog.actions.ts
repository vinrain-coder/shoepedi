"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { cacheLife, cacheTag } from "next/cache";
import { z } from "zod";
import { notFound } from "next/navigation";
import mongoose from "mongoose";

import { connectToDatabase } from "../db";
import Blog, { IBlog, IBlogComment, IBlogReply } from "../db/models/blog.model";
import { BlogCommentInputSchema, BlogInputSchema, BlogLikeInputSchema, BlogUpdateSchema } from "../validator";
import { formatError } from "../utils";
import { getSetting } from "./setting.actions";

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

export type SerializedComment = ReturnType<typeof serializeComment>;
export type SerializedBlog = {
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

async function getServerSessionLazy() {
  const { getServerSession } = await import("../get-session");
  return getServerSession();
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

// GET ALL BLOGS FOR ADMIN
export async function getAllBlogsForAdmin({
  query,
  page = 1,
  sort = "latest",
  limit,
  category,
  tag,
  isPublished,
  from,
  to,
}: {
  query?: string;
  page?: number;
  sort?: string;
  limit?: number;
  category?: string;
  tag?: string;
  isPublished?: string;
  from?: string;
  to?: string;
}) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");
  await connectToDatabase();

  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;

  const pageNum = Math.max(1, Number.parseInt(String(page) || "1", 10) || 1);

  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const trimmedQuery = query?.trim() || "";
  const queryFilter = trimmedQuery
    ? {
        $or: [
          { title: { $regex: escapeRegex(trimmedQuery), $options: "i" } },
          { slug: { $regex: escapeRegex(trimmedQuery), $options: "i" } },
        ],
      }
    : {};

  const categoryFilter =
    category && category !== "all"
      ? { category }
      : {};

  const tagFilter =
    tag && tag !== "all"
      ? { tags: tag }
      : {};

  let publishedFilter = {};
  if (isPublished === "true") {
    publishedFilter = { isPublished: true };
  } else if (isPublished === "false") {
    publishedFilter = { isPublished: false };
  }

  const dateFilter =
    from || to
      ? {
          updatedAt: {
            ...(from
              ? {
                  $gte: (() => {
                    const d = new Date(from);
                    d.setUTCHours(0, 0, 0, 0);
                    return d;
                  })(),
                }
              : {}),
            ...(to
              ? {
                  $lte: (() => {
                    const d = new Date(to);
                    d.setUTCHours(23, 59, 59, 999);
                    return d;
                  })(),
                }
              : {}),
          },
        }
      : {};

  const filters = {
    ...queryFilter,
    ...categoryFilter,
    ...tagFilter,
    ...publishedFilter,
    ...dateFilter,
  };

  const order: Record<string, 1 | -1> =
    sort === "views"
      ? { views: -1 }
      : sort === "likes"
      ? { likesCount: -1 }
      : { createdAt: -1 };

  const blogs = await Blog.find(filters)
    .sort(order)
    .skip(limit * (pageNum - 1))
    .limit(limit)
    .lean();

  const countBlogs = await Blog.countDocuments(filters);

  return {
    blogs: blogs.map(serializeBlog),
    totalPages: Math.ceil(countBlogs / limit),
    totalBlogs: countBlogs,
    from: limit * (pageNum - 1) + 1,
    to: limit * (pageNum - 1) + blogs.length,
  };
}

export async function getBlogAdminStats(params: {
  query?: string;
  category?: string;
  tag?: string;
  from?: string;
  to?: string;
}) {
  "use cache";
  cacheLife("hours");
  cacheTag("blogs");
  await connectToDatabase();

  const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const trimmedQuery = params.query?.trim() || "";
  const queryFilter = trimmedQuery
    ? {
        $or: [
          { title: { $regex: escapeRegex(trimmedQuery), $options: "i" } },
          { slug: { $regex: escapeRegex(trimmedQuery), $options: "i" } },
        ],
      }
    : {};

  const categoryFilter =
    params.category && params.category !== "all"
      ? { category: { $regex: new RegExp(`^${params.category}$`, "i") } }
      : {};

  const tagFilter =
    params.tag && params.tag !== "all"
      ? { tags: { $regex: new RegExp(`^${params.tag}$`, "i") } }
      : {};

  const dateFilter =
    params.from || params.to
      ? {
          updatedAt: {
            ...(params.from
              ? {
                  $gte: (() => {
                    const d = new Date(params.from);
                    d.setUTCHours(0, 0, 0, 0);
                    return d;
                  })(),
                }
              : {}),
            ...(params.to
              ? {
                  $lte: (() => {
                    const d = new Date(params.to);
                    d.setUTCHours(23, 59, 59, 999);
                    return d;
                  })(),
                }
              : {}),
          },
        }
      : {};

  const baseFilters = {
    ...queryFilter,
    ...categoryFilter,
    ...tagFilter,
    ...dateFilter,
  };

  const [
    totalBlogs,
    publishedBlogs,
    draftBlogs,
    stats
  ] = await Promise.all([
    Blog.countDocuments(baseFilters),
    Blog.countDocuments({ ...baseFilters, isPublished: true }),
    Blog.countDocuments({ ...baseFilters, isPublished: false }),
    Blog.aggregate([
      { $match: baseFilters },
      {
        $group: {
          _id: null,
          totalViews: { $sum: "$views" },
          totalLikes: { $sum: "$likesCount" },
          totalComments: {
            $sum: {
              $reduce: {
                input: { $ifNull: ["$comments", []] },
                initialValue: 0,
                in: { $add: ["$$value", 1, { $size: { $ifNull: ["$$this.replies", []] } }] }
              }
            }
          },
        },
      },
    ]),
  ]);

  return {
    totalBlogs,
    publishedBlogs,
    draftBlogs,
    totalViews: stats[0]?.totalViews || 0,
    totalLikes: stats[0]?.totalLikes || 0,
    totalComments: stats[0]?.totalComments || 0,
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

  return tags.map((t) => ({
    value: t.tag,
    label: t.tag
      .split("-")
      .map((w: string) => w[0].toUpperCase() + w.slice(1))
      .join(" ")
  }));
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
    const session = await getServerSessionLazy();
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
    const data = z
      .object({
        blogId: z.string().regex(/^[0-9a-fA-F]{24}$/),
        userId: z.string().optional(),
        guestId: z.string().optional(),
        commentId: z.string().min(1),
        replyId: z.string().optional(),
      })
      .refine((value) => Boolean(value.userId || value.guestId), {
        message: "A user or guest identifier is required",
      })
      .parse(input);
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
    const session = await getServerSessionLazy();
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
    const session = await getServerSessionLazy();
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


export async function getMyBlogComments() {
  try {
    const session = await getServerSessionLazy();
    if (!session) throw new Error("Please sign in to view your comments");

    await connectToDatabase();
    const blogs = await Blog.find({
      $or: [{ "comments.userId": session.user.id }, { "comments.replies.userId": session.user.id }],
    })
      .select("_id title slug comments")
      .sort({ updatedAt: -1 })
      .lean();

    const comments = blogs.flatMap((blog) => {
      const ownComments = (blog.comments || [])
        .filter((comment) => comment.userId === session.user.id)
        .map((comment) => ({
          type: "comment" as const,
          blogId: blog._id.toString(),
          blogTitle: blog.title,
          blogSlug: blog.slug,
          commentId: comment._id.toString(),
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          likesCount: comment.likesCount || 0,
        }));

      const ownReplies = (blog.comments || []).flatMap((comment) =>
        (comment.replies || [])
          .filter((reply) => reply.userId === session.user.id)
          .map((reply) => ({
            type: "reply" as const,
            blogId: blog._id.toString(),
            blogTitle: blog.title,
            blogSlug: blog.slug,
            commentId: comment._id.toString(),
            replyId: reply._id.toString(),
            content: reply.content,
            createdAt: reply.createdAt.toISOString(),
            likesCount: reply.likesCount || 0,
          }))
      );

      return [...ownComments, ...ownReplies];
    });

    comments.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    return { success: true, data: comments };
  } catch (error) {
    return { success: false, message: formatError(error), data: [] };
  }
}