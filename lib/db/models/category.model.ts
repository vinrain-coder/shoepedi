import { Document, Model, model, models, Schema, Types } from "mongoose";

// Interface for Category
export interface ICategory extends Document {
  name: string;
  slug: string;
  parent?: Types.ObjectId | null;
  description?: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  subcategories?: ICategory[];
  createdAt: Date;
  updatedAt: Date;
}

// Category Schema
const categorySchema = new Schema<ICategory>(
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
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null, // null if root category
    },
    description: {
      type: String,
      maxlength: 500,
    },
    image: {
      type: String,
    },

    // SEO Fields
    seoTitle: { type: String, maxlength: 60 },
    seoDescription: { type: String, maxlength: 160 },
    seoKeywords: { type: [String], default: [] },

    // Optional embedded subcategories (can also fetch dynamically)
    subcategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Model
const Category: Model<ICategory> =
  models.Category || model<ICategory>("Category", categorySchema);

export default Category;
