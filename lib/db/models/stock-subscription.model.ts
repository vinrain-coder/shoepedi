import { Document, Model, Schema, Types, model, models } from "mongoose";

export interface IStockSubscription extends Document {
  product: Types.ObjectId;
  email: string;
  subscribedAt: Date;
  isNotified: boolean;
}

const stockSubscriptionSchema = new Schema<IStockSubscription>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    isNotified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const StockSubscription =
  (models.StockSubscription as Model<IStockSubscription> | undefined) ||
  model<IStockSubscription>("StockSubscription", stockSubscriptionSchema);

export default StockSubscription;
