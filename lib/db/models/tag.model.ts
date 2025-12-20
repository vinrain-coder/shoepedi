import { Schema, model, models, Document, Types, Model } from "mongoose";
import { StrictMode } from "react";

export interface ITag extends Document {
  name: string;
  slug: string;
  image: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const tagSchema = new Schema<ITag>(
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
    image: String,
    description: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

const Tag: Model<ITag> = models.Tag || model<ITag>("Tag", tagSchema);
export default Tag;
