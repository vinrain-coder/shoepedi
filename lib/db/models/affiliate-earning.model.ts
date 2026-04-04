import { Document, Model, model, models, Schema, Types } from "mongoose";

export interface IAffiliateEarning extends Document {
  affiliate: Types.ObjectId;
  order: Types.ObjectId;
  amount: number;
  commissionRate: number;
  status: "pending" | "earned" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

const affiliateEarningSchema = new Schema<IAffiliateEarning>(
  {
    affiliate: { type: Schema.Types.ObjectId, ref: "Affiliate", required: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    amount: { type: Number, required: true },
    commissionRate: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "earned", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const AffiliateEarning =
  (models.AffiliateEarning as Model<IAffiliateEarning>) ||
  model<IAffiliateEarning>("AffiliateEarning", affiliateEarningSchema);

export default AffiliateEarning;
