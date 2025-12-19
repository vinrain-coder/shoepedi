import { IBlogInput } from "@/types";
import { Document, Model, model, models, Schema } from "mongoose";

export interface IBlog extends Document, IBlogInput {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const blogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true, minlength: 3 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      minlength: 3,
    },
    content: { type: String, required: true, minlength: 10 },
    category: { type: String, required: true, minlength: 3 },
    views: { type: Number },
    tags: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Blog: Model<IBlog> = models.Blog || model<IBlog>("Blog", blogSchema);

export default Blog;
