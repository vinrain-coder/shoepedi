import { IWebPageInput } from "@/types";
import { Document, Model, Types, model, models, Schema } from "mongoose";

export interface IWebPage extends Document, IWebPageInput {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const webPageSchema = new Schema<IWebPage>(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: String,

    excerpt: { type: String, maxLength: 160 },
    content: {
      type: String,
      required: true,
    },
    isPublished: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const WebPage =
  (models.WebPage as Model<IWebPage>) ||
  model<IWebPage>("WebPage", webPageSchema);

export default WebPage;
