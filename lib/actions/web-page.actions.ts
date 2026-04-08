"use server";

import { cacheTag, revalidatePath, revalidateTag } from "next/cache";

import { connectToDatabase } from "@/lib/db";
import WebPage, { IWebPage } from "@/lib/db/models/web-page.model";
import { formatError, escapeRegExp } from "@/lib/utils";

import { WebPageInputSchema, WebPageUpdateSchema } from "../validator";
import { z } from "zod";
import { cacheLife } from "next/cache";

// CREATE
export async function createWebPage(data: z.infer<typeof WebPageInputSchema>) {
  try {
    const webPage = WebPageInputSchema.parse(data);
    await connectToDatabase();
    await WebPage.create(webPage);
    revalidatePath("/admin/web-pages");
    revalidateTag("web-pages");
    return {
      success: true,
      message: "WebPage created successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// UPDATE
export async function updateWebPage(data: z.infer<typeof WebPageUpdateSchema>) {
  try {
    const webPage = WebPageUpdateSchema.parse(data);
    await connectToDatabase();
    await WebPage.findByIdAndUpdate(webPage._id, webPage);
    revalidatePath("/admin/web-pages");
    revalidateTag("web-pages");
    return {
      success: true,
      message: "WebPage updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
// DELETE
export async function deleteWebPage(id: string) {
  try {
    await connectToDatabase();
    const res = await WebPage.findByIdAndDelete(id);
    if (!res) throw new Error("WebPage not found");
    revalidatePath("/admin/web-pages");
    revalidateTag("web-pages");
    return {
      success: true,
      message: "WebPage deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// GET ALL
export async function getAllWebPages({
  query = "",
  page = 1,
  limit = 10,
  isPublished = "all",
}: {
  query?: string;
  page?: number;
  limit?: number;
  isPublished?: string;
} = {}) {
  "use cache";
  cacheLife("hours");
  cacheTag("web-pages");
  await connectToDatabase();

  // Normalize and validate inputs
  const normalizedLimit = Math.min(Math.max(1, Math.floor(Number(limit) || 10)), 100);
  const normalizedPage = Math.max(1, Math.floor(Number(page) || 1));
  const normalizedIsPublished = ["true", "false", "all"].includes(String(isPublished))
    ? String(isPublished)
    : "all";

  const filter: any = {};
  if (query) {
    const escapedQuery = escapeRegExp(query);
    filter.$or = [
      { title: { $regex: escapedQuery, $options: "i" } },
      { slug: { $regex: escapedQuery, $options: "i" } },
    ];
  }
  if (normalizedIsPublished !== "all") {
    filter.isPublished = normalizedIsPublished === "true";
  }

  const totalCount = await WebPage.countDocuments(filter);
  const totalPages = Math.ceil(totalCount / normalizedLimit);
  const skip = (normalizedPage - 1) * normalizedLimit;

  const webPages = await WebPage.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(normalizedLimit);

  return {
    data: JSON.parse(JSON.stringify(webPages)) as IWebPage[],
    totalPages,
    totalWebPages: totalCount,
  };
}

export async function getWebPageStats() {
  await connectToDatabase();
  const [totalWebPages, publishedWebPages, draftWebPages] = await Promise.all([
    WebPage.countDocuments(),
    WebPage.countDocuments({ isPublished: true }),
    WebPage.countDocuments({ isPublished: false }),
  ]);

  return {
    totalWebPages,
    publishedWebPages,
    draftWebPages,
  };
}
export async function getWebPageById(webPageId: string) {
  "use cache";
  cacheLife("days");
  cacheTag("web-pages");
  await connectToDatabase();
  const webPage = await WebPage.findById(webPageId);
  return JSON.parse(JSON.stringify(webPage)) as IWebPage;
}

// GET ONE PAGE BY SLUG
export async function getWebPageBySlug(slug: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("web-pages");
  await connectToDatabase();
  const webPage = await WebPage.findOne({ slug, isPublished: true });
  if (!webPage) throw new Error("WebPage not found");
  return JSON.parse(JSON.stringify(webPage)) as IWebPage;
}