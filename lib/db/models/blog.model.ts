import { IBlogInput } from "@/types";
import { Document, Model, Types, model, models, Schema } from "mongoose";

const blogCommentSchemaFields = {
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userImage: { type: String, default: "" },
  content: { type: String, required: true, trim: true, minlength: 1, maxlength: 2000 },
  likesCount: { type: Number, default: 0 },
  likedByUsers: { type: [String], default: [] },
  likedByGuests: { type: [String], default: [] },
} as const;

const blogReplySchema = new Schema(
  blogCommentSchemaFields,
  {
    _id: true,
    timestamps: true,
  }
);

const blogCommentSchema = new Schema(
  {
    ...blogCommentSchemaFields,
    replies: { type: [blogReplySchema], default: [] },
  },
  {
    _id: true,
    timestamps: true,
  }
);

export interface IBlogReply {
  _id: Types.ObjectId;
  userId: string;
  userName: string;
  userImage?: string;
  content: string;
  likesCount: number;
  likedByUsers: string[];
  likedByGuests: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IBlogComment extends Omit<IBlogReply, "_id"> {
  _id: Types.ObjectId;
  replies: IBlogReply[];
}

export interface IBlog extends Document, IBlogInput {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  image: string;
  content: string;
  views: number;
  likesCount: number;
  likedByUsers: string[];
  likedByGuests: string[];
  comments: IBlogComment[];
  category: string;
  tags: string[];
  isPublished: boolean;
  publishedAt: Date;
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
    image: String,
    content: { type: String, required: true, minlength: 10 },
    category: { type: String, required: true, minlength: 3 },
    views: { type: Number, default: 0 },
    likesCount: { type: Number, default: 0 },
    likedByUsers: { type: [String], default: [] },
    likedByGuests: { type: [String], default: [] },
    comments: { type: [blogCommentSchema], default: [] },
    tags: { type: [String], default: [] },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

const Blog: Model<IBlog> = models.Blog || model<IBlog>("Blog", blogSchema);

export default Blog;
