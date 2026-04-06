"use client";

import ProductPrice from "@/components/shared/product/product-price";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { calculateShippingPrice } from "@/lib/delivery";
import { DeliveryDate } from "@/types";
import { useEffect, useState } from "react";
import { getPlacesByCounty, getAllCounties } from "@/lib/actions/delivery-location.actions";

export default function DeliveryEstimator({
  deliveryDates,
  itemsPrice,
}: {
  deliveryDates: DeliveryDate[];
  itemsPrice: number;
}) {
  const [counties, setCounties] = useState<string[]>([]);
  const [places, setPlaces] = useState<{ city: string; rate: number }[]>([]);
  const [county, setCounty] = useState("");
  const [place, setPlace] = useState("");
  const [speedName, setSpeedName] = useState(deliveryDates[0]?.name ?? "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCounties()
      .then((data) => {
        setCounties(data);
        if (data.length > 0) {
          setCounty(data[0]);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch counties:", error);
        setCounties([]);
        setCounty("");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (county) {
      setLoading(true);
      getPlacesByCounty(county)
        .then((data) => {
          setPlaces(data);
          setPlace("");
        })
        .catch((error) => {
          console.error("Failed to fetch places for county:", county, error);
          setPlaces([]);
          setPlace("");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setPlaces([]);
      setPlace("");
    }
  }, [county]);

  const selectedPlaceRecord = places.find((p) => p.city === place);
  const selectedSpeed =
    deliveryDates.find((item) => item.name === speedName) ?? deliveryDates[0];

  const estimatedRate = calculateShippingPrice({
    deliveryDate: selectedSpeed,
    itemsPrice,
    shippingRate: selectedPlaceRecord?.rate ?? 0,
  });

  return (
    <div className="rounded-xl border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold text-primary">Delivery Estimator</p>
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Kenya Wide</span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Select value={county} onValueChange={setCounty} disabled={loading}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Select county" />
          </SelectTrigger>
          <SelectContent>
            {counties.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={place} onValueChange={setPlace} disabled={!county || places.length === 0}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Select place" />
          </SelectTrigger>
          <SelectContent>
            {places.map((p) => (
              <SelectItem key={p.city} value={p.city}>
                {p.city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-2">
        <Select value={speedName} onValueChange={setSpeedName}>
          <SelectTrigger className="h-9 text-xs">
            <SelectValue placeholder="Shipping speed" />
          </SelectTrigger>
          <SelectContent>
            {deliveryDates.map((dd) => (
              <SelectItem key={dd.name} value={dd.name}>
                {dd.name} ({dd.daysToDeliver} days)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-muted-foreground/10 pt-2">
        <div className="text-xs">
          {!place ? (
            <span className="text-muted-foreground italic text-[11px]">Choose location for rate</span>
          ) : (
            <span className="font-medium">Estimated:</span>
          )}
        </div>
        {place && (
           <div className="text-sm font-bold text-green-700">
             {estimatedRate === 0 ? "FREE" : <ProductPrice price={estimatedRate ?? 0} plain />}
           </div>
        )}
      </div>

      <p className="mt-2 text-[10px] leading-tight text-muted-foreground/70">
        * Final amount confirmed at checkout based on exact location and speed.
      </p>
    </div>
  );
}