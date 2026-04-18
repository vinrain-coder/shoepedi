"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ProductPrice from "@/components/shared/product/product-price";
import { formatDateTime, calculateFutureDate } from "@/lib/utils";
import { calculateShippingPrice } from "@/lib/delivery";

interface ShippingSpeedSectionProps {
  availableDeliveryDates: { name: string; daysToDeliver: number; shippingPrice: number; freeShippingMinPrice: number }[];
  deliveryDateIndex: number | undefined;
  setDeliveryDateIndex: (index: number, discount: number) => void;
  discount: number;
  itemsPrice: number;
  selectedPlace: string;
  places: { city: string; rate: number }[];
}

export const ShippingSpeedSection = ({
  availableDeliveryDates,
  deliveryDateIndex,
  setDeliveryDateIndex,
  discount,
  itemsPrice,
  selectedPlace,
  places,
}: ShippingSpeedSectionProps) => {
  const effectiveIndex = deliveryDateIndex ?? availableDeliveryDates.length - 1;
  const selectedDeliveryDate = availableDeliveryDates[effectiveIndex];

  return (
    <div className="font-bold">
      <p className="mb-2"> Choose a shipping speed:</p>
      <p className="mb-3 text-xs font-normal text-muted-foreground">
        Rates combine the selected delivery place base rate
        and the shipping speed charge.
      </p>

      <RadioGroup
        value={selectedDeliveryDate.name}
        onValueChange={(value) =>
          setDeliveryDateIndex(
            availableDeliveryDates.findIndex((dd) => dd.name === value)!,
            discount
          )
        }
      >
        {availableDeliveryDates.map((dd) => (
          <div key={dd.name} className="flex">
            <RadioGroupItem
              className="cursor-pointer"
              value={dd.name}
              id={`shipping-${dd.name}`}
            />
            <Label
              className="pl-2 space-y-2 cursor-pointer"
              htmlFor={`shipping-${dd.name}`}
            >
              <div className="text-green-700 font-semibold">
                {formatDateTime(calculateFutureDate(dd.daysToDeliver)).dateOnly}
              </div>
              <div>
                {(() => {
                  const placeRecord = places.find((p) => p.city === selectedPlace);
                  const locationRate = placeRecord?.rate ?? 0;
                  const totalPrice = calculateShippingPrice({
                    deliveryDate: dd,
                    itemsPrice,
                    shippingRate: locationRate,
                  }) ?? 0;

                  if (totalPrice === 0) return "FREE Shipping";

                  return (
                    <div className="flex flex-col">
                      <span className="font-bold">
                        <ProductPrice price={totalPrice} plain />
                      </span>
                      {locationRate > 0 && (
                        <span className="text-[10px] text-muted-foreground font-normal">
                          (Speed: <ProductPrice price={dd.shippingPrice} plain /> + Location: <ProductPrice price={locationRate} plain />)
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};
