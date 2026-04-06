import { Document, Model, Schema, Types, model, models } from "mongoose";

export interface IDeliveryRate {
  deliveryDateName: string; // "Standard", "Express", etc.
  price: number;
}

export interface IDeliveryLocation extends Document {
  _id: Types.ObjectId;
  county: string;
  city: string;
  rates: IDeliveryRate[];
  createdAt: Date;
  updatedAt: Date;
}

const deliveryLocationSchema = new Schema<IDeliveryLocation>(
  {
    county: { type: String, required: true, index: true },
    city: { type: String, required: true, index: true },
    rates: [
      {
        deliveryDateName: { type: String, required: true },
        price: { type: Number, required: true, min: 0 },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Ensure a unique county-city pair
deliveryLocationSchema.index({ county: 1, city: 1 }, { unique: true });

const DeliveryLocation =
  (models.DeliveryLocation as Model<IDeliveryLocation> | undefined) ||
  model<IDeliveryLocation>("DeliveryLocation", deliveryLocationSchema);

export default DeliveryLocation;
