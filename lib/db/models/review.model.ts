import { IReviewInput } from "@/types";
import { Document, Model, Schema, Types, model, models } from "mongoose";

export interface IReview extends Document, IReviewInput {
  id: string;
  user: Types.ObjectId;
  product: Types.ObjectId;
  rating: number;
  comment: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isVerifiedPurchase: {
      type: Boolean,
      required: true,
      default: false,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
    },
    comment: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Review =
  (models.Review as Model<IReview> | undefined) ||
  model<IReview>("Review", reviewSchema);

export default Review;
