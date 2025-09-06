// hooks/useWishlistStore.ts
import { create } from "zustand";
import { IProduct } from "@/lib/db/models/product.model";

export interface WishlistState {
  products: IProduct[];
  ids: string[];
  count: number;

  setProducts: (products: IProduct[]) => void;
  addProduct: (product: IProduct) => void;
  removeProduct: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  setCount: (count: number) => void; // ✅ added
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  products: [],
  ids: [],
  count: 0,

  setProducts: (products) =>
    set({
      products,
      ids: products.map((p) => p._id.toString()),
      count: products.length,
    }),

  addProduct: (product) => {
    const id = product._id.toString();
    if (get().ids.includes(id)) return;
    set((state) => ({
      products: [...state.products, product],
      ids: [...state.ids, id],
      count: state.count + 1,
    }));
  },

  removeProduct: (productId) => {
    set((state) => ({
      products: state.products.filter((p) => p._id.toString() !== productId),
      ids: state.ids.filter((id) => id !== productId),
      count: Math.max(state.count - 1, 0),
    }));
  },

  isInWishlist: (productId) => get().ids.includes(productId),

  setCount: (count) => set({ count }), // ✅ new action
}));
