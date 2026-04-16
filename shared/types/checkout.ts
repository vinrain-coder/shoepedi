import { IProduct } from "@/lib/db/models/product.model";

export type DiscountType = "percentage" | "fixed";

export type AppliedCoupon = {
  _id?: string;
  code: string;
  discountType: DiscountType;
  discountAmount: number;
};

export type FirstPurchaseDiscountState = {
  eligible: boolean;
  rate: number;
  discountAmount: number;
  loading: boolean;
};

export type DeliveryPlace = { city: string; rate: number };

export type CheckoutReferenceData = {
  products: IProduct[];
  counties: string[];
  places: DeliveryPlace[];
  liveUserCoins: number | null;
  countiesError: string | null;
  placesError: string | null;
  isCountiesLoading: boolean;
  isPlacesLoading: boolean;
};
