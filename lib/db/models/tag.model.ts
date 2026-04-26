import { Document, Model, Schema, model, models } from "mongoose";

export interface ITag extends Document {
  id: string;
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

const Tag =
  (models.Tag as Model<ITag> | undefined) || model<ITag>("Tag", tagSchema);

export default Tag;
