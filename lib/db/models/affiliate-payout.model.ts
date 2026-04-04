import { Document, Model, model, models, Schema, Types } from "mongoose";

export interface IAffiliatePayout extends Document {
  affiliate: Types.ObjectId;
  amount: number;
  status: "pending" | "processing" | "paid" | "rejected";
  paymentMethod: string;
  paymentDetails: Record<string, any>;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const affiliatePayoutSchema = new Schema<IAffiliatePayout>(
  {
    affiliate: { type: Schema.Types.ObjectId, ref: "Affiliate", required: true },
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

const AffiliatePayout =
  (models.AffiliatePayout as Model<IAffiliatePayout>) ||
  model<IAffiliatePayout>("AffiliatePayout", affiliatePayoutSchema);

export default AffiliatePayout;
