"use server";

import { connectToDatabase } from "@/lib/db";
import Coupon, { ICoupon } from "@/lib/db/models/coupon.model";
import { cacheLife, cacheTag, revalidatePath, revalidateTag } from "next/cache";
import { formatError } from "../utils";
import { CouponInputSchema, CouponUpdateSchema } from "../validator";
import Affiliate from "../db/models/affiliate.model";
import { getSetting } from "./setting.actions";
import { ICouponInput } from "@/types";
import { z } from "zod";
import mongoose from "mongoose";

const normalizeCouponCode = (code: string) => code.trim().toUpperCase();

// CREATE COUPON
export async function createCoupon(data: ICouponInput) {
  try {
    const coupon = CouponInputSchema.parse(data);
    await connectToDatabase();

    const existingCoupon = await Coupon.findOne({ code: normalizeCouponCode(coupon.code) });
    if (existingCoupon) throw new Error("Coupon code already exists.");

    await Coupon.create({ ...coupon, code: normalizeCouponCode(coupon.code) });
    revalidatePath("/admin/coupons");
    revalidateTag("coupons");
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

    const existingCoupon = await Coupon.findOne({
      code: normalizeCouponCode(coupon.code),
      _id: { $ne: coupon._id },
    });
    if (existingCoupon) throw new Error("Coupon code already exists.");

    const updatedCoupon = await Coupon.findByIdAndUpdate(coupon._id, {
      ...coupon,
      code: normalizeCouponCode(coupon.code),
    }, {
      new: true,
    });
    if (!updatedCoupon) throw new Error("Coupon not found.");

    revalidatePath("/admin/coupons");
    revalidateTag("coupons");
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
    revalidateTag("coupons");
    return { success: true, message: "Coupon deleted successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// GET SINGLE COUPON BY ID
export async function getCouponById(id: string) {
  "use cache";
  cacheLife("hours");
  cacheTag("coupons");
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
  "use cache: private";
  cacheLife("minutes");
  cacheTag("coupons");
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
export async function validateCoupon(code: string, itemsTotal: number) {
  await connectToDatabase();

  const normalizedCode = normalizeCouponCode(code);
  if (!normalizedCode) throw new Error("Enter a coupon code.");

  const coupon = await Coupon.findOne({ code: normalizedCode, isActive: true });

  if (coupon) {
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      throw new Error(`The coupon code "${code}" has expired.`);
    }
    if (coupon.maxUsage && coupon.usageCount >= coupon.maxUsage) {
      throw new Error(`The coupon code "${code}" has reached its maximum usage limit.`);
    }
    if (coupon.minPurchase && itemsTotal < coupon.minPurchase) {
      throw new Error(`Minimum purchase of ${coupon.minPurchase} is required for this coupon.`);
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (coupon.discountValue / 100) * itemsTotal;
    } else {
      discount = coupon.discountValue;
    }

    const normalizedDiscount = Math.min(Number(discount.toFixed(2)), itemsTotal);

    return {
      coupon: {
        _id: coupon._id.toString(),
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: normalizedDiscount,
      },
      discount: normalizedDiscount,
      newTotal: Math.max(Number((itemsTotal - normalizedDiscount).toFixed(2)), 0),
    };
  }

  // If not a regular coupon, check if it's an affiliate code
  const affiliate = await Affiliate.findOne({
    affiliateCode: normalizedCode,
    status: "approved",
  });

  if (affiliate) {
    const settings = await getSetting();
    if (!settings.affiliate.enabled) {
      throw new Error("Affiliate program is currently disabled.");
    }

    const discountRate =
      affiliate.discountRate !== undefined
        ? affiliate.discountRate
        : settings.affiliate.defaultDiscountRate;

    const discount = (discountRate / 100) * itemsTotal;
    const normalizedDiscount = Math.min(Number(discount.toFixed(2)), itemsTotal);

    return {
      coupon: {
        _id: affiliate._id.toString(),
        code: affiliate.affiliateCode,
        discountType: "percentage",
        discountValue: discountRate,
        discountAmount: normalizedDiscount,
        isAffiliate: true,
      },
      discount: normalizedDiscount,
      newTotal: Math.max(Number((itemsTotal - normalizedDiscount).toFixed(2)), 0),
    };
  }

  throw new Error(`The coupon code "${code}" is invalid or expired.`);
}

export async function incrementCouponUsage(couponId: string) {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new Error("Invalid coupon ID");
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    couponId,
    { $inc: { usageCount: 1 } },
    { new: true }
  );

  if (!updatedCoupon) throw new Error("Coupon not found.");

  revalidatePath("/admin/coupons");
  revalidateTag("coupons");

  return JSON.parse(JSON.stringify(updatedCoupon)) as ICoupon;
}

export async function decrementCouponUsage(couponId: string) {
  await connectToDatabase();

  if (!mongoose.Types.ObjectId.isValid(couponId)) {
    throw new Error("Invalid coupon ID");
  }

  const updatedCoupon = await Coupon.findByIdAndUpdate(
    couponId,
    { $inc: { usageCount: -1 } },
    { new: true }
  );

  if (!updatedCoupon) throw new Error("Coupon not found.");

  revalidatePath("/admin/coupons");
  revalidateTag("coupons");

  return JSON.parse(JSON.stringify(updatedCoupon)) as ICoupon;
}
