import { ICouponInput } from "@/types";
import { Document, Model, model, models, Schema, Types } from "mongoose";

export enum DiscountType {
  PERCENTAGE = "percentage",
  FIXED = "fixed",
}

export interface ICoupon extends Document, ICouponInput {
  _id: Types.ObjectId;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  expiryDate?: Date;
  minPurchase?: number;
  usageCount: number;
  maxUsage?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const couponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    minPurchase: {
      type: Number,
      default: 0,
    },
    usageCount: {
      type: Number,
      required: true,
      default: 0,
    },
    maxUsage: {
      type: Number,
      default: null, // Null means unlimited usage
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Coupon =
  (models.Coupon as Model<ICoupon>) || model<ICoupon>("Coupon", couponSchema);

export default Coupon;
