"use client";

import { useEffect, useState, useTransition } from "react";
import { getUniqueCounties, getCitiesByCounty } from "@/lib/actions/delivery-location.actions";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Truck, Loader2, Info } from "lucide-react";
import ProductPrice from "./product-price";

export default function DeliverySelection() {
  const [counties, setCounties] = useState<string[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCounty, setSelectedCounty] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function loadCounties() {
      const res = await getUniqueCounties();
      if (res.success && res.data) {
        setCounties(res.data);
      }
      setIsLoading(false);
    }
    loadCounties();
  }, []);

  useEffect(() => {
    if (!selectedCounty) {
      setCities([]);
      setSelectedCity("");
      return;
    }

    async function loadCities() {
      startTransition(async () => {
        const res = await getCitiesByCounty(selectedCounty);
        if (res.success && res.data) {
          setCities(res.data);
        }
      });
    }
    loadCities();
  }, [selectedCounty]);

  const selectedCityData = cities.find((c) => c.city === selectedCity);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 p-4 animate-pulse bg-muted/20 rounded-lg border">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading delivery options...</span>
      </div>
    );
  }

  return (
    <Card className="border shadow-none bg-muted/5">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Truck className="h-4 w-4 text-primary" />
          <span>Delivery Details</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground px-1">County</label>
            <Select value={selectedCounty} onValueChange={setSelectedCounty}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select County" />
              </SelectTrigger>
              <SelectContent>
                {counties.map((county) => (
                  <SelectItem key={county} value={county}>
                    {county}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase font-bold text-muted-foreground px-1">City/Area</label>
            <Select
              value={selectedCity}
              onValueChange={setSelectedCity}
              disabled={!selectedCounty || isPending}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder={isPending ? "Loading..." : "Select City"} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((location) => (
                  <SelectItem key={location._id} value={location.city}>
                    {location.city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedCityData ? (
          <div className="pt-2 space-y-2 border-t mt-2">
            <div className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5 mb-2">
              <Info className="h-3 w-3" />
              Available Shipping Speeds
            </div>
            <div className="grid gap-2">
              {selectedCityData.rates.map((rate: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-background border text-sm">
                  <span className="font-medium">{rate.deliveryDateName} Delivery</span>
                  <span className="text-primary font-bold">
                    <ProductPrice price={rate.price} plain />
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="pt-2 text-xs text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3 w-3" />
            <span>Select your location to see shipping rates and delivery times.</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
