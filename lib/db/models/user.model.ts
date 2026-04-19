import { IUserInput } from "@/types";
import { Document, Model, model, models, Schema, Types } from "mongoose";

export interface IUserNavigationEntry {
  path: string;
  title?: string;
  visitedAt: Date;
}

export interface IUser extends Document, IUserInput {
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  wishlist: Types.ObjectId[];
  addresses: unknown[];
  coins: number;
  walletBalance: number;
  isAffiliate: boolean;
  navigationHistory: IUserNavigationEntry[];
  firstPurchaseDiscountUsed?: boolean;
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
    walletBalance: { type: Number, default: 0 },
    isAffiliate: { type: Boolean, default: false },
    firstPurchaseDiscountUsed: { type: Boolean, default: false },
    navigationHistory: [
      {
        path: { type: String, required: true },
        title: { type: String },
        visitedAt: { type: Date, required: true, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

userSchema.index({ name: 1 });

const User = (models.User as Model<IUser>) || model<IUser>("User", userSchema);

export default User;
