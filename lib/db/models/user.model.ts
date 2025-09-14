import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: string;
  name?: string;
  email: string;
  role?: string;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String },
    email: { type: String, required: true },
    role: { type: String, default: "USER" },
  },
  {
    collection: "users", // ✅ use the BetterAuth collection
    timestamps: true,
  }
);

// Avoid model overwrite on hot-reload
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
