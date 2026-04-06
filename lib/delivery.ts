import { DeliveryDate } from "@/types";

const normalizeValue = (value: string) => value.trim().toLowerCase();

export const calculateShippingPrice = ({
  deliveryDate,
  itemsPrice,
  shippingRate = 0,
}: {
  deliveryDate?: DeliveryDate;
  itemsPrice: number;
  shippingRate?: number;
}) => {
  if (!deliveryDate) return undefined;

  const computedRate = shippingRate + deliveryDate.shippingPrice;

  if (
    deliveryDate.freeShippingMinPrice > 0 &&
    itemsPrice >= deliveryDate.freeShippingMinPrice
  ) {
    return 0;
  }

  return computedRate;
};
