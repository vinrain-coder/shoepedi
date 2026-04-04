import {
  OrderTrackingStatus,
  generateTrackingNumber,
} from "@/lib/order-tracking";
import { Document, Model, Schema, Types, model, models } from "mongoose";

export interface ICouponInfo {
  _id?: Types.ObjectId;
  code: string;
  discountType: "percentage" | "fixed";
  discountAmount: number;
  isAffiliate?: boolean;
}

export interface IOrderTrackingHistoryEvent {
  status: OrderTrackingStatus;
  message: string;
  location?: string;
  source: "system" | "admin" | "courier" | "customer";
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface IOrderShipment {
  courierName?: string;
  courierTrackingReference?: string;
  estimatedDeliveryDate?: Date;
  dispatchedAt?: Date;
  deliveredAt?: Date;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId | { email?: string; name?: string };
  items: Array<{
    product: Types.ObjectId;
    clientId: string;
    name: string;
    slug: string;
    image: string;
    category: string;
    price: number;
    countInStock: number;
    quantity: number;
    size?: string;
    color?: string;
  }>;
  shippingAddress: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    province: string;
    phone: string;
  };
  expectedDeliveryDate: Date;
  paymentMethod: string;
  paymentResult?: Record<string, unknown>;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  coupon?: ICouponInfo;
  affiliate?: Types.ObjectId;
  affiliateCode?: string;
  status: OrderTrackingStatus;
  trackingNumber: string;
  shipment?: IOrderShipment;
  trackingHistory: IOrderTrackingHistoryEvent[];
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    trackingNumber: {
      type: String,
      default: generateTrackingNumber,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "packed",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
        "returned",
        "delivery_exception",
      ],
      default: "pending",
      index: true,
    },
    trackingHistory: [
      {
        status: {
          type: String,
          required: true,
          enum: [
            "pending",
            "confirmed",
            "processing",
            "packed",
            "shipped",
            "out_for_delivery",
            "delivered",
            "cancelled",
            "returned",
            "delivery_exception",
          ],
        },
        message: { type: String, required: true },
        location: { type: String },
        source: {
          type: String,
          enum: ["system", "admin", "courier", "customer"],
          default: "system",
        },
        metadata: { type: Schema.Types.Mixed },
        createdAt: { type: Date, required: true, default: Date.now },
      },
    ],
    shipment: {
      courierName: { type: String },
      courierTrackingReference: { type: String },
      estimatedDeliveryDate: { type: Date },
      dispatchedAt: { type: Date },
      deliveredAt: { type: Date },
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        clientId: { type: String, required: true },
        name: { type: String, required: true },
        slug: { type: String, required: true },
        image: { type: String, required: true },
        category: { type: String, required: true },
        price: { type: Number, required: true },
        countInStock: { type: Number, required: true },
        quantity: { type: Number, required: true },
        size: { type: String },
        color: { type: String },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      province: { type: String, required: true },
      phone: { type: String, required: true },
    },
    expectedDeliveryDate: { type: Date, required: true },
    paymentMethod: { type: String, required: true },
    paymentResult: {
      id: String,
      status: String,
      email_address: String,
      pricePaid: String,
      paymentMethod: String,
      paymentReference: String,
      gateway: String,
      currency: String,
      paidAtGateway: Date,
      channel: String,
      authorization: {
        card_type: String,
        bank: String,
        brand: String,
        last4: String,
        exp_month: String,
        exp_year: String,
      },
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true },
    taxPrice: { type: Number, required: true },
    coupon: {
      _id: { type: Schema.Types.ObjectId, ref: "Coupon" },
      code: { type: String },
      discountType: { type: String, enum: ["percentage", "fixed"] },
      discountAmount: { type: Number },
      isAffiliate: { type: Boolean },
    },
    affiliate: {
      type: Schema.Types.ObjectId,
      ref: "Affiliate",
    },
    affiliateCode: {
      type: String,
    },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, required: true, default: false },
    deliveredAt: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ trackingNumber: 1 }, { unique: true });
orderSchema.index({ status: 1, updatedAt: -1 });
orderSchema.index({ user: 1, createdAt: -1 });

const Order =
  (models.Order as Model<IOrder> | undefined) ||
  model<IOrder>("Order", orderSchema);

export default Order;
