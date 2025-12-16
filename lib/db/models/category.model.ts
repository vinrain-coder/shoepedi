import { Schema, model, models, Document, Types, Model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  slug: string;
  parent?: Types.ObjectId | null;
  description?: string;
  image?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  createdAt: Date;
  updatedAt: Date;
}

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
      default: null,
    },
    description: {
      type: String,
      maxlength: 500,
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

// Optional: populate parent category
categorySchema.pre(/^find/, function (next) {
  this.populate("parent");
  next();
});

const Category: Model<ICategory> =
  models.Category || model<ICategory>("Category", categorySchema);

export default Category;
      
