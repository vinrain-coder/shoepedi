import { Schema, model, models, Document, Types, Model } from "mongoose";

export interface IBrand extends Document {
  name: string;
  slug: string;
  description?: string;
  isFeatured?: boolean;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const brandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      lowercase: true,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    image: String,
    seoTitle: {
      type: String,
      maxlength: 60,
    },
    seoDescription: {
      type: String,
      maxlength: 160,
    },
    seoKeywords: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

const Brand: Model<IBrand> =
  models.Brand || model<IBrand>("Brand", brandSchema);
export default Brand;
