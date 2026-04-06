import { DeliveryCounty, DeliveryDate } from "@/types";

const normalizeValue = (value: string) => value.trim().toLowerCase();

export const findDeliveryCounty = (
  deliveryCounties: DeliveryCounty[],
  county?: string,
): DeliveryCounty | undefined => {
  if (!county) return undefined;
  const normalizedCounty = normalizeValue(county);
  return deliveryCounties.find(
    (item) => normalizeValue(item.county) === normalizedCounty,
  );
};

export const findDeliveryPlace = (
  deliveryCounties: DeliveryCounty[],
  county?: string,
  place?: string,
) => {
  if (!county || !place) return undefined;
  const countyRecord = findDeliveryCounty(deliveryCounties, county);
  if (!countyRecord) return undefined;
  const normalizedPlace = normalizeValue(place);
  return countyRecord.places.find(
    (item) => normalizeValue(item.name) === normalizedPlace,
  );
};

export const calculateShippingPrice = ({
  deliveryDate,
  itemsPrice,
  deliveryCounties,
  county,
  place,
}: {
  deliveryDate?: DeliveryDate;
  itemsPrice: number;
  deliveryCounties: DeliveryCounty[];
  county?: string;
  place?: string;
}) => {
  if (!deliveryDate) return undefined;

  const placeRate = findDeliveryPlace(deliveryCounties, county, place)?.rate;
  const hasDeliveryZone = typeof placeRate === "number";

  const computedRate = (hasDeliveryZone ? placeRate : 0) + deliveryDate.shippingPrice;

  if (
    deliveryDate.freeShippingMinPrice > 0 &&
    itemsPrice >= deliveryDate.freeShippingMinPrice
  ) {
    return 0;
  }

  return hasDeliveryZone ? computedRate : deliveryDate.shippingPrice;
};
