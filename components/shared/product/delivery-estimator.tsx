"use client";

import ProductPrice from "@/components/shared/product/product-price";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateShippingPrice, findDeliveryCounty } from "@/lib/delivery";
import { DeliveryCounty, DeliveryDate } from "@/types";
import { useMemo, useState } from "react";

export default function DeliveryEstimator({
  deliveryCounties,
  deliveryDates,
  itemsPrice,
}: {
  deliveryCounties: DeliveryCounty[];
  deliveryDates: DeliveryDate[];
  itemsPrice: number;
}) {
  const [county, setCounty] = useState(deliveryCounties[0]?.county ?? "");
  const [place, setPlace] = useState("");
  const [speedName, setSpeedName] = useState(deliveryDates[0]?.name ?? "");

  const selectedCounty = useMemo(
    () => findDeliveryCounty(deliveryCounties, county),
    [county, deliveryCounties],
  );
  const selectedSpeed =
    deliveryDates.find((item) => item.name === speedName) ?? deliveryDates[0];

  const estimatedRate = calculateShippingPrice({
    deliveryDate: selectedSpeed,
    itemsPrice,
    deliveryCounties,
    county,
    place,
  });

  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <p className="mb-2 text-sm font-semibold">Delivery estimate</p>
      <div className="space-y-2">
        <Input
          value={county}
          onChange={(event) => {
            setCounty(event.target.value);
            setPlace("");
          }}
          list="product-delivery-county-options"
          placeholder="Search county"
        />
        <datalist id="product-delivery-county-options">
          {deliveryCounties.map((deliveryCounty) => (
            <option key={deliveryCounty.county} value={deliveryCounty.county} />
          ))}
        </datalist>

        <Select value={place} onValueChange={setPlace} disabled={!selectedCounty}>
          <SelectTrigger>
            <SelectValue placeholder="Select delivery place" />
          </SelectTrigger>
          <SelectContent>
            {(selectedCounty?.places ?? []).map((deliveryPlace) => (
              <SelectItem key={deliveryPlace.name} value={deliveryPlace.name}>
                {deliveryPlace.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={speedName} onValueChange={setSpeedName}>
          <SelectTrigger>
            <SelectValue placeholder="Select shipping speed" />
          </SelectTrigger>
          <SelectContent>
            {deliveryDates.map((deliveryDate) => (
              <SelectItem key={deliveryDate.name} value={deliveryDate.name}>
                {deliveryDate.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 text-sm">
        {!place ? (
          <p className="text-muted-foreground">Select county and place to see delivery price.</p>
        ) : (
          <p>
            Estimated delivery: <strong>{estimatedRate === 0 ? "FREE" : <ProductPrice price={estimatedRate ?? 0} plain />}</strong>
          </p>
        )}
      </div>

      <Button type="button" variant="link" className="h-auto px-0 text-xs text-muted-foreground">
        Final delivery amount is confirmed at checkout.
      </Button>
    </div>
  );
}
