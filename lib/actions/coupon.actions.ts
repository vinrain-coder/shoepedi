"use server";

import { connectToDatabase } from "@/lib/db";
import Coupon, { ICoupon } from "@/lib/db/models/coupon.model";
import { revalidatePath } from "next/cache";
import { formatError } from "../utils";
import { CouponInputSchema, CouponUpdateSchema } from "../validator";
import { ICouponInput } from "@/types";
import { z } from "zod";
import mongoose from "mongoose";

// CREATE COUPON
export async function createCoupon(data: ICouponInput) {
  try {
    const coupon = CouponInputSchema.parse(data);
    await connectToDatabase();

    const existingCoupon = await Coupon.findOne({ code: coupon.code });
    if (existingCoupon) throw new Error("Coupon code already exists.");

    await Coupon.create(coupon);
    revalidatePath("/admin/coupons");
    return { success: true, message: "Coupon created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// UPDATE COUPON
export async function updateCoupon(data: z.infer<typeof CouponUpdateSchema>) {
  try {
    const coupon = CouponUpdateSchema.parse(data);
    await connectToDatabase();

    const updatedCoupon = await Coupon.findByIdAndUpdate(coupon._id, coupon, {
      new: true,
    });
    if (!updatedCoupon) throw new Error("Coupon not found.");

    revalidatePath("/admin/coupons");
    return { success: true, message: "Coupon updated successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// DELETE COUPON
export async function deleteCoupon(id: string) {
  try {
    await connectToDatabase();
    const res = await Coupon.findByIdAndDelete(id);
    if (!res) throw new Error("Coupon not found.");

    revalidatePath("/admin/coupons");
    return { success: true, message: "Coupon deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// GET SINGLE COUPON BY ID
export async function getCouponById(id: string) {
  await connectToDatabase();
  if (!mongoose.Types.ObjectId.isValid(id))
    throw new Error("Invalid coupon ID");

  const coupon = await Coupon.findById(id);
  if (!coupon) throw new Error("Coupon not found.");

  return JSON.parse(JSON.stringify(coupon)) as ICoupon;
}

// GET ALL COUPONS WITH FILTERING & PAGINATION
export async function getAllCoupons({
  query,
  page = 1,
  sort = "latest",
  limit = 10,
}: {
  query?: string;
  page?: number;
  sort?: string;
  limit?: number;
}) {
  await connectToDatabase();

  const queryFilter = query
    ? {
        code: { $regex: query, $options: "i" },
      }
    : {};

  const order: Record<string, 1 | -1> =
    sort === "discount-high-to-low"
      ? { discountValue: -1 }
      : sort === "discount-low-to-high"
      ? { discountValue: 1 }
      : { createdAt: -1 };

  const coupons = await Coupon.find(queryFilter)
    .sort(order)
    .skip(limit * (page - 1))
    .limit(limit)
    .lean();

  const totalCoupons = await Coupon.countDocuments(queryFilter);

  return {
    coupons: JSON.parse(JSON.stringify(coupons)) as ICoupon[],
    totalPages: Math.ceil(totalCoupons / limit),
    totalCoupons,
    from: (page - 1) * limit + 1, // 🟢 Ensure `from` exists
    to: Math.min(page * limit, totalCoupons), // 🟢 Ensure `to` exists
  };
}

// VALIDATE COUPON DURING CHECKOUT
export async function validateCoupon(code: string, orderTotal: number) {
  await connectToDatabase();

  const coupon = await Coupon.findOne({ code, isActive: true });
  if (!coupon) throw new Error("Invalid or expired coupon.");

  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
    throw new Error("Coupon has expired.");
  }
  if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
    throw new Error("Coupon usage limit reached.");
  }
  if (coupon.minPurchase && orderTotal < coupon.minPurchase) {
    throw new Error(`Minimum purchase amount required: ${coupon.minPurchase}`);
  }

  let discount = 0;
  if (coupon.discountType === "percentage") {
    discount = (coupon.discountValue / 100) * orderTotal;
  } else {
    discount = coupon.discountValue;
  }

  return {
    discount,
    newTotal: Math.max(orderTotal - discount, 0),
  };
}
