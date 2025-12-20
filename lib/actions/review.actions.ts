"use server";

import mongoose from "mongoose";
import { cacheTag, revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import { connectToDatabase } from "../db";
import Product from "../db/models/product.model";
import Review, { IReview } from "../db/models/review.model";
import { formatError } from "../utils";
import { ReviewInputSchema } from "../validator";
import { IReviewDetails } from "@/types";
import { getSetting } from "./setting.actions";
import { getServerSession } from "../get-session";
import { cacheLife } from "next/cache";



export async function submitReviewAction(
  values: z.infer<typeof ReviewInputSchema>,
  path: string
) {
  try {
    const session = await getServerSession();
    if (!session) throw new Error("Not authenticated");

    const data = ReviewInputSchema.parse({
      ...values,
      user: session.user.id,
    });

    await connectToDatabase();

    const existing = await Review.findOne({
      product: data.product,
      user: data.user,
    });

    if (existing) {
      existing.title = data.title;
      existing.comment = data.comment;
      existing.rating = data.rating;
      await existing.save();
    } else {
      await Review.create(data);
    }

    await updateProductReview(data.product);
    revalidatePath(path);

    return { success: true, message: "Review saved" };
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

async function updateProductReview(productId: string) {
  const stats = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$rating",
        count: { $sum: 1 },
      },
    },
  ]);

  const total = stats.reduce((a, b) => a + b.count, 0);
  const avg =
    total === 0
      ? 0
      : stats.reduce((a, b) => a + b._id * b.count, 0) / total;

  const distribution = Array.from({ length: 5 }, (_, i) => ({
    rating: i + 1,
    count: stats.find((s) => s._id === i + 1)?.count || 0,
  }));

  await Product.findByIdAndUpdate(productId, {
    avgRating: avg.toFixed(1),
    numReviews: total,
    ratingDistribution: distribution,
  });
}

export async function createUpdateReview({
  data,
  path,
}: {
  data: z.infer<typeof ReviewInputSchema>;
  path: string;
}) {
  
  try {
    const session = await getServerSession();
    if (!session) {
      throw new Error("User is not authenticated");
    }

    const review = ReviewInputSchema.parse({
      ...data,
      user: session?.user?.id,
    });

    await connectToDatabase();
    const existReview = await Review.findOne({
      product: review.product,
      user: review.user,
    });

    if (existReview) {
      existReview.comment = review.comment;
      existReview.rating = review.rating;
      existReview.title = review.title;
      await existReview.save();
      await updateProductReview(review.product);
      revalidatePath(path);
      return {
        success: true,
        message: "Review updated successfully",
        // data: JSON.parse(JSON.stringify(existReview)),
      };
    } else {
      await Review.create(review);
      await updateProductReview(review.product);
      revalidatePath(path);
      return {
        success: true,
        message: "Review created successfully",
        // data: JSON.parse(JSON.stringify(newReview)),
      };
    }
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}

const updateProductReview = async (productId: string) => {


export async function getReviews({
  productId,
  limit,
  page,
}: {
  productId: string;
  limit?: number;
  page: number;
}) {

  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  await connectToDatabase();
  const skipAmount = (page - 1) * limit;
  const reviews = await Review.find({ product: productId })
    .populate("user", "name")
    .sort({
      createdAt: "desc",
    })
    .skip(skipAmount)
    .limit(limit);
  const reviewsCount = await Review.countDocuments({ product: productId });
  return {
    data: JSON.parse(JSON.stringify(reviews)) as IReviewDetails[],
    totalPages: reviewsCount === 0 ? 1 : Math.ceil(reviewsCount / limit),
  };
}
export const getReviewByProductId = async ({
  productId,
}: {
  productId: string;
}) => {
  "use cache";
  cacheLife("hours");
  cacheTag("reviews");
  await connectToDatabase();
  const session = await getServerSession();
  if (!session) {
    throw new Error("User is not authenticated");
  }
  const review = await Review.findOne({
    product: productId,
    user: session?.user?.id,
  });
  return review ? (JSON.parse(JSON.stringify(review)) as IReview) : null;
};

// get all reviews (admin panel)
export async function getAllReviews({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}) {

  await connectToDatabase();

  const skip = (page - 1) * limit;

  const total = await Review.countDocuments();

  const reviews = await Review.find()
    .populate("user", "name email role") // ✅ safe, consistent
    .populate("product", "name slug images")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    data: JSON.parse(JSON.stringify(reviews)),
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function deleteReview(id: string) {
  
  try {
    await connectToDatabase();
    await Review.findByIdAndDelete(id);

    return {
      success: true,
      message: "Review deleted successfully",
    };
  } catch (error) {
    console.error("Failed to delete review:", error);
    return {
      success: false,
      message: "Failed to delete review",
    };
  }
}
