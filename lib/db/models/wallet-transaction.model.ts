import { Document, Model, Schema, Types, model, models } from "mongoose";

export interface IWalletTransaction extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  admin?: Types.ObjectId;
  order?: Types.ObjectId;
  amount: number;
  reason: string;
  source: "admin_adjustment" | "refund" | "wallet_payment";
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    admin: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    amount: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
      maxlength: 280,
    },
    source: {
      type: String,
      enum: ["admin_adjustment", "refund", "wallet_payment"],
      default: "admin_adjustment",
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
    },
    balanceAfter: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

walletTransactionSchema.index({ user: 1, createdAt: -1 });
walletTransactionSchema.index({ admin: 1, createdAt: -1 });

const WalletTransaction =
  (models.WalletTransaction as Model<IWalletTransaction>) ||
  model<IWalletTransaction>("WalletTransaction", walletTransactionSchema);

export default WalletTransaction;
