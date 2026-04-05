import { Document, Model, model, models, Schema, Types } from "mongoose";

export interface IAffiliate extends Document {
  user: Types.ObjectId;
  affiliateCode: string;
  status: "pending" | "approved" | "rejected";
  earningsBalance: number;
  totalEarnings: number;
  commissionRate?: number;
  discountRate?: number;
  paymentDetails: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    payPalEmail?: string;
    mPesaNumber?: string;
  };
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const affiliateSchema = new Schema<IAffiliate>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    affiliateCode: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    earningsBalance: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    commissionRate: { type: Number },
    discountRate: { type: Number },
    paymentDetails: {
      bankName: String,
      accountName: String,
      accountNumber: String,
      payPalEmail: String,
      mPesaNumber: String,
    },
    adminNote: String,
  },
  {
    timestamps: true,
  }
);

const Affiliate =
  (models.Affiliate as Model<IAffiliate>) ||
  model<IAffiliate>("Affiliate", affiliateSchema);

export default Affiliate;
