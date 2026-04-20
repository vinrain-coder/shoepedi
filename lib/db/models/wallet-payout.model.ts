import { Document, Model, model, models, Schema, Types } from "mongoose";

export interface IWalletPayout extends Document {
  user: Types.ObjectId;
  amount: number;
  status: "pending" | "processing" | "paid" | "rejected";
  paymentMethod: string;
  paymentDetails: { recipient: string };
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const walletPayoutSchema = new Schema<IWalletPayout>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "paid", "rejected"],
      default: "pending",
    },
    paymentMethod: { type: String, required: true },
    paymentDetails: { type: Schema.Types.Mixed, required: true },
    adminNote: String,
  },
  {
    timestamps: true,
  }
);

walletPayoutSchema.index({ user: 1 });
walletPayoutSchema.index({ status: 1, createdAt: -1 });

const WalletPayout =
  (models.WalletPayout as Model<IWalletPayout>) ||
  model<IWalletPayout>("WalletPayout", walletPayoutSchema);

export default WalletPayout;
