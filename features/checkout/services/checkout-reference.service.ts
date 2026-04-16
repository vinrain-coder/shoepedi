import { getProductsByIds } from "@/lib/actions/product.actions";
import { getAllCounties, getPlacesByCounty } from "@/lib/actions/delivery-location.actions";
import { getUserCoins } from "@/lib/actions/user.actions";

export const checkoutReferenceService = {
  fetchProductsByIds: async (productIds: string[]) => {
    const uniqueProductIds = [...new Set(productIds)];
    if (uniqueProductIds.length === 0) return [];
    return getProductsByIds(uniqueProductIds);
  },
  fetchCounties: async () => getAllCounties(),
  fetchPlacesByCounty: async (county: string) => getPlacesByCounty(county),
  fetchUserCoins: async () => getUserCoins(),
};
