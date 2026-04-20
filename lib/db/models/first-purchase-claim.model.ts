import { Document, Model, model, models, Schema } from "mongoose";

export interface IFirstPurchaseClaim extends Document {
  email: string;
  order?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const firstPurchaseClaimSchema = new Schema<IFirstPurchaseClaim>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
  },
  {
    timestamps: true,
  }
);

const FirstPurchaseClaim =
  (models.FirstPurchaseClaim as Model<IFirstPurchaseClaim>) ||
  model<IFirstPurchaseClaim>("FirstPurchaseClaim", firstPurchaseClaimSchema);

export default FirstPurchaseClaim;
