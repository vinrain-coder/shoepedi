import { Document, Model, Schema, Types, model, models } from "mongoose";

export interface ICoinTransaction extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  admin?: Types.ObjectId;
  amount: number;
  reason: string;
  source: "admin_adjustment" | "system";
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
  updatedAt: Date;
}

const coinTransactionSchema = new Schema<ICoinTransaction>(
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
      enum: ["admin_adjustment", "system"],
      default: "admin_adjustment",
      required: true,
    },
    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },
    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

coinTransactionSchema.index({ user: 1, createdAt: -1 });
coinTransactionSchema.index({ admin: 1, createdAt: -1 });

const CoinTransaction =
  (models.CoinTransaction as Model<ICoinTransaction>) ||
  model<ICoinTransaction>("CoinTransaction", coinTransactionSchema);

export default CoinTransaction;
