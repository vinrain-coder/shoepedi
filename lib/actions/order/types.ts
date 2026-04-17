import { IOrder } from "../../db/models/order.model";

export type SerializedOrder = Omit<IOrder, "_id"> & { _id: string };

export type OrderCouponInput = {
  _id?: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountAmount?: number;
  isAffiliate?: boolean;
  isFirstPurchase?: boolean;
};

export type FirstPurchaseDiscountQuote = {
  eligible: boolean;
  rate: number;
  discountAmount: number;
};
