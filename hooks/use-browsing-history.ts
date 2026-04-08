import { create } from "zustand";
import { persist } from "zustand/middleware";
type BrowsingHistory = {
  products: { id: string; category: string }[];
};
const initialState: BrowsingHistory = {
  products: [],
};

export const browsingHistoryStore = create<BrowsingHistory>()(
  persist(() => initialState, {
    name: "browsingHistoryStore",
  })
);

export default function useBrowsingHistory() {
  const { products } = browsingHistoryStore();
  return {
    products,
    addItem: (product: { id: string; category: string }) => {
      const index = products.findIndex((p) => p.id === product.id);
      if (index !== -1) products.splice(index, 1); // Remove duplicate if it exists
      products.unshift(product); // Add id to the start

      if (products.length > 100) products.pop(); // Remove excess items if length exceeds 100

      browsingHistoryStore.setState({
        products,
      });
    },

    removeItem: (id: string) => {
      const newProducts = products.filter((p) => p.id !== id);
      browsingHistoryStore.setState({
        products: newProducts,
      });
    },

    clear: () => {
      browsingHistoryStore.setState({
        products: [],
      });
    },
  };
}
