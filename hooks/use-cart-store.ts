import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Cart, OrderItem, ShippingAddress } from "@/types";
import { calcDeliveryDateAndPrice } from "@/lib/server/actions/order.actions";

const initialState: Cart = {
  items: [],
  itemsPrice: 0,
  taxPrice: undefined,
  shippingPrice: undefined,
  totalPrice: 0,
  paymentMethod: undefined,
  shippingAddress: undefined,
  deliveryDateIndex: undefined,
};

interface CartState {
  cart: Cart;
  addItem: (item: OrderItem, quantity: number) => Promise<string>;
  updateItem: (
    item: OrderItem,
    quantity: number,
    color?: string,
    size?: string
  ) => Promise<void>;
  removeItem: (item: OrderItem) => void;
  clearCart: () => void;
  setShippingAddress: (shippingAddress: ShippingAddress, discount?: number) => Promise<void>;
  setPaymentMethod: (paymentMethod: string) => void;
  setDeliveryDateIndex: (index: number, discount?: number) => Promise<void>;
  setCartPrices: (items: OrderItem[], shippingAddress?: ShippingAddress, deliveryDateIndex?: number, discount?: number) => Promise<void>;
}

const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      cart: initialState,

      setCartPrices: async (items: OrderItem[], shippingAddress?: ShippingAddress, deliveryDateIndex?: number, discount?: number) => {
        const result = await calcDeliveryDateAndPrice({
          items,
          shippingAddress,
          deliveryDateIndex,
          discount,
        });
        set({
          cart: {
            ...get().cart,
            items,
            shippingAddress,
            ...result,
          }
        });
      },

      addItem: async (item: OrderItem, quantity: number) => {
        const { items, shippingAddress, deliveryDateIndex, discount } = get().cart;
        const existItem = items.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        );

        if (existItem) {
          if (existItem.countInStock < quantity + existItem.quantity) {
            throw new Error("Not enough items in stock");
          }
        } else {
          if (item.countInStock < item.quantity) {
            throw new Error("Not enough items in stock");
          }
        }

        const updatedCartItems = existItem
          ? items.map((x) =>
              x.product === item.product &&
              x.color === item.color &&
              x.size === item.size
                ? { ...existItem, quantity: existItem.quantity + quantity }
                : x
            )
          : [...items, { ...item, quantity }];

        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
          },
        });

        try {
          const result = await calcDeliveryDateAndPrice({
            items: updatedCartItems,
            shippingAddress,
            deliveryDateIndex,
            discount,
          });
          set({
            cart: {
              ...get().cart,
              items: updatedCartItems,
              ...result,
            },
          });
        } catch {
          // keep optimistic item update even if price recomputation fails
        }

        const foundItem = updatedCartItems.find(
          (x) =>
            x.product === item.product &&
            x.color === item.color &&
            x.size === item.size
        );
        if (!foundItem) {
          throw new Error("Item not found in cart");
        }
        return foundItem.clientId;
      },
      updateItem: async (
        item: OrderItem,
        quantity: number,
        color?: string,
        size?: string
      ) => {
        const { items, shippingAddress, deliveryDateIndex, discount } = get().cart;
        const exist = items.find((x) => x.clientId === item.clientId);
        if (!exist) return;

        const newColor = color !== undefined ? color : exist.color;
        const newSize = size !== undefined ? size : exist.size;

        const duplicate = items.find(
          (x) =>
            x.clientId !== item.clientId &&
            x.product === item.product &&
            x.color === newColor &&
            x.size === newSize
        );

        let updatedCartItems: OrderItem[];
        if (duplicate) {
          const newQuantity = Math.min(
            duplicate.countInStock,
            duplicate.quantity + quantity
          );
          updatedCartItems = items
            .map((x) =>
              x.clientId === duplicate.clientId
                ? { ...x, quantity: newQuantity }
                : x
            )
            .filter((x) => x.clientId !== item.clientId);
        } else {
          updatedCartItems = items.map((x) =>
            x.clientId === item.clientId
              ? { ...x, quantity, color: newColor, size: newSize }
              : x
          );
        }
        const result = await calcDeliveryDateAndPrice({
          items: updatedCartItems,
          shippingAddress,
          deliveryDateIndex,
          discount,
        });
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...result,
          },
        });
      },
      removeItem: async (item: OrderItem) => {
        const { items, shippingAddress, deliveryDateIndex, discount } = get().cart;
        const updatedCartItems = items.filter(
          (x) =>
            x.product !== item.product ||
            x.color !== item.color ||
            x.size !== item.size
        );
        const result = await calcDeliveryDateAndPrice({
          items: updatedCartItems,
          shippingAddress,
          deliveryDateIndex,
          discount,
        });
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...result,
          },
        });
      },
      setShippingAddress: async (shippingAddress: ShippingAddress, discount?: number) => {
        const { items, deliveryDateIndex } = get().cart;
        const result = await calcDeliveryDateAndPrice({
          items,
          shippingAddress,
          deliveryDateIndex,
          discount,
        });
        set({
          cart: {
            ...get().cart,
            shippingAddress,
            ...result,
          },
        });
      },
      setPaymentMethod: (paymentMethod: string) => {
        set({
          cart: {
            ...get().cart,
            paymentMethod,
          },
        });
      },
      setDeliveryDateIndex: async (index: number, discount?: number) => {
        const { items, shippingAddress } = get().cart;
        const result = await calcDeliveryDateAndPrice({
          items,
          shippingAddress,
          deliveryDateIndex: index,
          discount,
        });
        set({
          cart: {
            ...get().cart,
            ...result,
          },
        });
      },
      clearCart: () => {
        set({
          cart: {
            ...get().cart,
            items: [],
          },
        });
      },
      init: () => set({ cart: initialState }),
    }),

    {
      name: "cart-store",
    }
  )
);
export default useCartStore;
