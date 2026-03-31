import { create } from "zustand";
import { persist } from "zustand/middleware";
import { IProduct } from "@/lib/db/models/product.model";

const MAX_COMPARE_ITEMS = 4;

interface CompareState {
  products: IProduct[];
  ids: string[];
  count: number;
  maxItems: number;
  addProduct: (product: IProduct) => { added: boolean; reason?: "duplicate" | "max" };
  removeProduct: (productId: string) => void;
  clearProducts: () => void;
  isInCompare: (productId: string) => boolean;
}

export const useCompareStore = create(
  persist<CompareState>(
    (set, get) => ({
      products: [],
      ids: [],
      count: 0,
      maxItems: MAX_COMPARE_ITEMS,

      addProduct: (product) => {
        const id = product._id.toString();
        const state = get();

        if (state.ids.includes(id)) {
          return { added: false, reason: "duplicate" as const };
        }

        if (state.ids.length >= MAX_COMPARE_ITEMS) {
          return { added: false, reason: "max" as const };
        }

        const updatedProducts = [...state.products, product];

        set({
          products: updatedProducts,
          ids: [...state.ids, id],
          count: updatedProducts.length,
        });

        return { added: true };
      },

      removeProduct: (productId) => {
        set((state) => {
          const updatedProducts = state.products.filter(
            (product) => product._id.toString() !== productId
          );

          return {
            products: updatedProducts,
            ids: updatedProducts.map((product) => product._id.toString()),
            count: updatedProducts.length,
          };
        });
      },

      clearProducts: () => set({ products: [], ids: [], count: 0 }),

      isInCompare: (productId) => get().ids.includes(productId),
    }),
    {
      name: "compare-store",
    }
  )
);
