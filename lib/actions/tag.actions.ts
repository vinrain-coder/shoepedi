"use server";

import { z } from "zod";
import { cacheLife, cacheTag, revalidatePath, updateTag } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import { formatError, escapeRegExp } from "@/lib/utils";
import { TagInputSchema, TagUpdateSchema } from "../validator";
import { notFound } from "next/navigation";
import Tag from "../db/models/tag.model";

export type SerializedTag = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

/* ---------------------------------
   CREATE TAG
---------------------------------- */
export async function createTag(data: z.infer<typeof TagInputSchema>) {
  try {
    const tag = TagInputSchema.parse(data);
    await connectToDatabase();

    const existing = await Tag.findOne({ slug: tag.slug });
    if (existing) {
      return {
        success: false,
        message: "A tag with this name/slug already exists.",
      };
    }

    await Tag.create(tag);

    revalidatePath("/admin/tags");
    updateTag("tags");

    return { success: true, message: "Tag created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

/* ---------------------------------
   UPDATE TAG
---------------------------------- */
export async function updateTagAction(data: z.infer<typeof TagUpdateSchema>) {
  try {
    const tag = TagUpdateSchema.parse(data);
    await connectToDatabase();

    const updated = await Tag.findByIdAndUpdate(
      tag._id,
      { $set: tag },
      { new: true }
    );

    if (!updated) {
      throw new Error("Tag not found");
    }

    revalidatePath("/admin/tags");
    updateTag("tags");

    return { success: true, message: "Tag updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

/* ---------------------------------
   DELETE TAG
---------------------------------- */
export async function deleteTag(id: string) {
  try {
    await connectToDatabase();

    const tag = await Tag.findById(id);
    if (!tag) throw new Error("Tag not found");

    await Tag.findByIdAndDelete(id);

    revalidatePath("/admin/tags");
    updateTag("tags");

    return { success: true, message: "Tag deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

/* ---------------------------------
   GET TAG BY ID
---------------------------------- */
export async function getTagById(id: string): Promise<SerializedTag | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("tags");

  try {
    await connectToDatabase();
    const tag = await Tag.findById(id).lean();
    if (!tag) return null;
    return {
      _id: tag._id.toString(),
      name: tag.name,
      slug: tag.slug,
      image: tag.image || "",
      description: tag.description,
      createdAt: tag.createdAt.toISOString(),
      updatedAt: tag.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error("Error fetching tag by ID:", error);
    return null;
  }
}

/* ---------------------------------
   GET ALL TAGS (ADMIN)
---------------------------------- */
export interface GetAllTagsParams {
  query?: string;
  page?: number;
  limit?: number;
}

export async function getAllTagsForAdmin({
  query = "",
  page = 1,
  limit = 10,
}: GetAllTagsParams) {
  "use cache";
  cacheLife("hours");
  cacheTag("tags");

  try {
    await connectToDatabase();

    const filter = query
      ? {
          $or: [
            { name: { $regex: escapeRegExp(query), $options: "i" } },
            { slug: { $regex: escapeRegExp(query), $options: "i" } },
          ],
        }
      : {};

    const totalTags = await Tag.countDocuments(filter);
    const totalPages = Math.ceil(totalTags / limit);
    const skip = (page - 1) * limit;

    const tags = await Tag.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const normalizedTags = tags.map((tag) => ({
      ...tag,
      _id: tag._id.toString(),
    }));

    return {
      tags: normalizedTags,
      totalTags,
      totalPages,
      from: skip + 1,
      to: skip + tags.length,
    };
  } catch (error) {
    console.error("Error fetching tags:", error);
    return {
      tags: [],
      totalTags: 0,
      totalPages: 0,
      from: 0,
      to: 0,
    };
  }
}

export async function getTagStats() {
  "use cache";
  cacheLife("hours");
  cacheTag("tags");
  try {
    await connectToDatabase();
    const totalTags = await Tag.countDocuments();
    return { totalTags };
  } catch (error) {
    console.error("Error fetching tag stats:", error);
    return { totalTags: 0 };
  }
}

/* ---------------------------------
   GET ALL TAGS FOR PRODUCT INPUT
---------------------------------- */
export async function getAllTagsForAdminProductCreate() {
  "use cache";
  cacheLife("hours");
  cacheTag("tags");

  await connectToDatabase();

  const tags = await Tag.find().sort({ name: 1 }).select("name").lean();

  return tags.map((t) => t.name);
}

/* ---------------------------------
   GET ALL TAGS FOR STOREFRONT
---------------------------------- */
export async function getAllTagsForStore() {
  "use cache";
  cacheLife("days");
  cacheTag("tags");

  try {
    await connectToDatabase();

    const tags = await Tag.find().sort({ name: 1 }).select("name slug image description").lean();

    return tags.map((tag) => ({
      ...tag,
      _id: tag._id.toString(),
    }));
  } catch (error) {
    console.error("Error fetching store tags:", error);
    return [];
  }
}

/* ---------------------------------
   GET TAG BY SLUG
---------------------------------- */
export async function getTagBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("tags");

  await connectToDatabase();

  const tag = await Tag.findOne({ slug }).lean();
  if (!tag) return notFound();

  return {
    _id: tag._id.toString(),
    name: tag.name,
    slug: tag.slug,
    image: tag.image || "",
    description: tag.description,
    createdAt: tag.createdAt.toISOString(),
    updatedAt: tag.updatedAt.toISOString(),
  } satisfies SerializedTag;
}
