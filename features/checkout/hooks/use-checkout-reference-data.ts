import { useEffect, useState } from "react";
import { IProduct } from "@/lib/db/models/product.model";
import { checkoutReferenceService } from "@/features/checkout/services/checkout-reference.service";
import { DeliveryPlace } from "@/features/checkout/types";

export const useCheckoutReferenceData = ({
  productIds,
  selectedCounty,
}: {
  productIds: string[];
  selectedCounty?: string;
}) => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [liveUserCoins, setLiveUserCoins] = useState<number | null>(null);

  const [counties, setCounties] = useState<string[]>([]);
  const [places, setPlaces] = useState<DeliveryPlace[]>([]);
  const [countiesError, setCountiesError] = useState<string | null>(null);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [isCountiesLoading, setIsCountiesLoading] = useState(false);
  const [isPlacesLoading, setIsPlacesLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      const fetchedProducts = await checkoutReferenceService.fetchProductsByIds(productIds);
      setProducts(fetchedProducts);
    };

    void fetchProducts();
  }, [productIds]);

  useEffect(() => {
    setIsCountiesLoading(true);
    checkoutReferenceService
      .fetchCounties()
      .then((data) => {
        setCounties(data);
        setCountiesError(null);
      })
      .catch((error) => {
        console.error("Failed to fetch counties:", error);
        setCounties([]);
        setCountiesError("Failed to load counties. Please try again.");
      })
      .finally(() => setIsCountiesLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedCounty) {
      setPlaces([]);
      setPlacesError(null);
      setIsPlacesLoading(false);
      return;
    }

    setIsPlacesLoading(true);
    checkoutReferenceService
      .fetchPlacesByCounty(selectedCounty)
      .then((data) => {
        setPlaces(data);
        setPlacesError(null);
      })
      .catch((error) => {
        console.error("Failed to fetch places for county:", selectedCounty, error);
        setPlaces([]);
        setPlacesError("Failed to load delivery places. Please try again.");
      })
      .finally(() => setIsPlacesLoading(false));
  }, [selectedCounty]);

  useEffect(() => {
    checkoutReferenceService.fetchUserCoins().then((coins) => {
      if (coins !== null) setLiveUserCoins(coins);
    });
  }, []);

  return {
    products,
    liveUserCoins,
    counties,
    places,
    countiesError,
    placesError,
    isCountiesLoading,
    isPlacesLoading,
  };
};
