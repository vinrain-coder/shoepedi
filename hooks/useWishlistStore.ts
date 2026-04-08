import { create } from "zustand";
import { IProduct } from "@/lib/db/models/product.model";

export interface WishlistState {
  products: IProduct[];
  ids: string[];
  count: number;

  setProducts: (products: IProduct[]) => void;
  addProduct: (product: IProduct) => void;
  addProductById: (productId: string) => void;
  removeProduct: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setCount: (count: number) => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  products: [],
  ids: [],
  count: 0,

  setProducts: (products) => {
    const unique = [
      ...new Map(products.map((p) => [p._id.toString(), p])).values(),
    ];
    set({
      products: unique,
      ids: unique.map((p) => p._id.toString()),
      count: unique.length,
    });
  },

  addProduct: (product) => {
    const id = product._id.toString();
    if (get().ids.includes(id)) return;
    set((state) => {
      const updated = [...state.products, product];
      return {
        products: updated,
        ids: [...state.ids, id],
        count: updated.length,
      };
    });
  },

  addProductById: (productId) => {
    if (get().ids.includes(productId)) return;
    set((state) => ({
      ids: [...state.ids, productId],
      count: state.count + 1,
    }));
  },

  removeProduct: (productId) => {
    set((state) => {
      const updatedProducts = state.products.filter(
        (p) => p._id.toString() !== productId
      );
      const updatedIds = state.ids.filter((id) => id !== productId);
      return {
        products: updatedProducts,
        ids: updatedIds,
        count: updatedIds.length,
      };
    });
  },

  isInWishlist: (productId) => get().ids.includes(productId),

  setCount: (count) => set({ count }),
}));
