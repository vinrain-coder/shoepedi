"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";

import { connectToDatabase } from "../db";
import NewsletterSubscription from "../db/models/newsletter-subscription.model";
import { NewsletterSubscriptionSchema } from "../validator";
import { formatError } from "../utils";
import { sendAdminEventNotification } from "@/emails";

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

    await sendAdminEventNotification({
      title: "Newsletter subscription created",
      description: `${parsed.email} subscribed from ${parsed.source}.`,
      href: "/admin",
      meta: "Newsletter",
      createdAt: now.toISOString(),
    });

    revalidatePath("/");

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

    return {
      success: true,
      message: "You have been unsubscribed from marketing emails.",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
