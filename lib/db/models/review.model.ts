import { Types, Document, Model, model, models, Schema } from "mongoose";
import { IReviewInput } from "@/types";

// Fix the type to allow ObjectId or string
export interface IReview
  extends Omit<IReviewInput, "user" | "product">,
    Document {
  _id: string;
  user: Types.ObjectId | string; // better-auth "users" collection
  product: Types.ObjectId | string; // reference to Product
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users", // ✅ match better-auth collection name
      required: true,
    },
    isVerifiedPurchase: {
      type: Boolean,
      required: true,
      default: false,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product", // ✅ normal Product model
      required: true,
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
  { timestamps: true }
);

const Review =
  (models.Review as Model<IReview>) || model<IReview>("Review", reviewSchema);

export default Review;
