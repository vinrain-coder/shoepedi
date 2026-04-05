import { IUserInput } from "@/types";
import { Document, Model, model, models, Schema, Types } from "mongoose";

export interface IUser extends Document, IUserInput {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
  wishlist: Types.ObjectId[];
  addresses: unknown[];
  coins: number;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    role: { type: String, required: true, default: "User" },
    password: { type: String },
    image: { type: String },
    emailVerified: { type: Boolean, default: false },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    addresses: { type: [Schema.Types.Mixed], default: [] },
    coins: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

userSchema.index({ name: 1 });

const User = (models.User as Model<IUser>) || model<IUser>("User", userSchema);

export default User;
