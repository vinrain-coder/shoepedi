"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";

import { connectToDatabase } from "../db";
import NewsletterSubscription from "../db/models/newsletter-subscription.model";
import { NewsletterSubscriptionSchema } from "../validator";
import { formatError } from "../utils";
import {
  sendAdminEventNotification,
  sendNewsletterConfirmationEmail,
} from "@/lib/email/transactional";
import { getSetting } from "./setting.actions";
import { getServerSession } from "../get-session";

export async function subscribeToNewsletter(input: {
  email: string;
  source?: "footer" | "checkout" | "api" | "manual";
  tags?: string[];
  botField?: string;
}) {
  try {
    const parsed = NewsletterSubscriptionSchema.parse(input);

    if (parsed.botField) {
      return { success: true, message: "Subscription received." };
    }

    await connectToDatabase();

    const existing = await NewsletterSubscription.findOne({
      email: parsed.email,
      status: "subscribed",
    });

    if (existing) {
      await NewsletterSubscription.findByIdAndUpdate(existing._id, {
        $set: {
          source: parsed.source,
          lastSourceAt: new Date(),
          tags: Array.from(new Set([...(existing.tags || []), ...parsed.tags])),
        },
      });

      return {
        success: true,
        message: "You're already subscribed. We'll keep you in the loop!",
      };
    }

    const now = new Date();
    const unsubscribeToken = crypto.randomBytes(24).toString("hex");

    const reactivated = await NewsletterSubscription.findOneAndUpdate(
      { email: parsed.email, status: "unsubscribed" },
      {
        $set: {
          status: "subscribed",
          source: parsed.source,
          tags: parsed.tags,
          subscribedAt: now,
          unsubscribedAt: null,
          lastSourceAt: now,
          unsubscribeToken,
        },
      },
      { upsert: false, new: true }
    );

    const created = reactivated ?? (await NewsletterSubscription.create({
      email: parsed.email,
      source: parsed.source,
      tags: parsed.tags,
      status: "subscribed",
      subscribedAt: now,
      lastSourceAt: now,
      unsubscribeToken,
    }).catch(async (error) => {
      if (error?.code === 11000) {
        return NewsletterSubscription.findOne({
          email: parsed.email,
          status: "subscribed",
        });
      }
      throw error;
    }));

    const { site } = await getSetting();
    const unsubscribeLink = `${site.url}/unsubscribe?email=${encodeURIComponent(parsed.email)}&token=${unsubscribeToken}`;

    await Promise.all([
      sendNewsletterConfirmationEmail({
        email: parsed.email,
        unsubscribeLink,
      }),
      sendAdminEventNotification({
        title: "Newsletter subscription created",
        description: `${parsed.email} subscribed from ${parsed.source}.`,
        href: "/admin/newsletters",
        meta: "Newsletter",
        createdAt: now.toISOString(),
      }),
    ]);

    revalidatePath("/");
    revalidatePath("/admin/newsletters");

    return {
      success: true,
      message: "Thanks for subscribing! Check your inbox for upcoming offers.",
      data: created
        ? {
            id: String(created._id),
            unsubscribeToken: created.unsubscribeToken,
          }
        : undefined,
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function unsubscribeFromNewsletter(input: {
  email: string;
  token: string;
}) {
  try {
    await connectToDatabase();
    const email = input.email.trim().toLowerCase();

    const updated = await NewsletterSubscription.findOneAndUpdate(
      {
        email,
        status: "subscribed",
        unsubscribeToken: input.token,
      },
      {
        $set: {
          status: "unsubscribed",
          unsubscribedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updated) {
      return { success: false, message: "Invalid unsubscribe link." };
    }

    revalidatePath("/admin/newsletters");

    return {
      success: true,
      message: "You have been unsubscribed from marketing emails.",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getAllSubscribers({
  limit,
  page,
  search,
  status = "all",
  from,
  to,
}: {
  limit?: number;
  page: number;
  search?: string;
  status?: string;
  from?: string;
  to?: string;
}) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (session?.user.role !== "ADMIN") {
      throw new Error("Admin permission required");
    }

    const {
      common: { pageSize },
    } = await getSetting();
    const finalLimit = limit || pageSize;
    const skipAmount = (Number(page) - 1) * finalLimit;

    const query: any = {};
    if (search) {
      query.email = { $regex: search, $options: "i" };
    }
    if (status !== "all") {
      query.status = status;
    }
    if (from || to) {
      const fromDate = from ? new Date(from) : null;
      const toDate = to ? new Date(to) : null;

      if ((fromDate && !isNaN(fromDate.getTime())) || (toDate && !isNaN(toDate.getTime()))) {
        query.subscribedAt = {};
        if (fromDate && !isNaN(fromDate.getTime())) query.subscribedAt.$gte = fromDate;
        if (toDate && !isNaN(toDate.getTime())) query.subscribedAt.$lte = toDate;
      }
    }

    const [subscribers, totalSubscribers] = await Promise.all([
      NewsletterSubscription.find(query)
        .sort({ subscribedAt: -1 })
        .skip(skipAmount)
        .limit(finalLimit)
        .lean(),
      NewsletterSubscription.countDocuments(query),
    ]);

    return {
      data: JSON.parse(JSON.stringify(subscribers)),
      totalPages: Math.ceil(totalSubscribers / finalLimit),
      totalSubscribers,
    };
  } catch (error) {
    throw new Error(formatError(error));
  }
}

export async function getNewsletterStats() {
  const session = await getServerSession();
  if (session?.user.role !== "ADMIN") {
    throw new Error("Admin permission required");
  }

  await connectToDatabase();
  const [totalSubscribers, activeSubscribers, unsubscribedCount] = await Promise.all([
    NewsletterSubscription.countDocuments(),
    NewsletterSubscription.countDocuments({ status: "subscribed" }),
    NewsletterSubscription.countDocuments({ status: "unsubscribed" }),
  ]);

  return {
    totalSubscribers,
    activeSubscribers,
    unsubscribedCount,
  };
}

export async function deleteSubscription(id: string) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (session?.user.role !== "ADMIN") {
      throw new Error("Admin permission required");
    }

    const res = await NewsletterSubscription.findByIdAndDelete(id);
    if (!res) throw new Error("Subscription not found");

    revalidatePath("/admin/newsletters");

    return {
      success: true,
      message: "Subscription deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
