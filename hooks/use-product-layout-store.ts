"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ProductCardLayout = "classic" | "detailed";

type ProductLayoutState = {
  layout: ProductCardLayout;
  setLayout: (layout: ProductCardLayout) => void;
};

const useProductLayoutStore = create<ProductLayoutState>()(
  persist(
    (set) => ({
      layout: "classic",
      setLayout: (layout) => set({ layout }),
    }),
    {
      name: "product-layout-preference",
    },
  ),
);

export default useProductLayoutStore;
