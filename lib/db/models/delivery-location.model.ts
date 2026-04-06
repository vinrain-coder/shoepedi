import { Document, Model, model, models, Schema, Types } from "mongoose";

export interface IDeliveryLocation extends Document {
  _id: Types.ObjectId;
  county: string;
  city: string;
  rate: number;
  createdAt: Date;
  updatedAt: Date;
}

const deliveryLocationSchema = new Schema<IDeliveryLocation>(
  {
    county: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },
    rate: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  }
);

deliveryLocationSchema.index({ county: 1, city: 1 }, { unique: true });

const DeliveryLocation =
  (models.DeliveryLocation as Model<IDeliveryLocation>) ||
  model<IDeliveryLocation>("DeliveryLocation", deliveryLocationSchema);

export default DeliveryLocation;
