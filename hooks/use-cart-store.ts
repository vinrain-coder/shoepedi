import { create } from "zustand";
import { persist } from "zustand/middleware";

import { Cart, OrderItem, ShippingAddress } from "@/types";
import { calcDeliveryDateAndPrice } from "@/lib/actions/order.actions";

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
  setShippingAddress: (shippingAddress: ShippingAddress) => Promise<void>;
  setPaymentMethod: (paymentMethod: string) => void;
  setDeliveryDateIndex: (index: number) => Promise<void>;
  setCartPrices: (prices: {
    itemsPrice: number;
    shippingPrice?: number;
    taxPrice?: number;
    totalPrice: number;
  }) => void;
}

const useCartStore = create(
  persist<CartState>(
    (set, get) => ({
      cart: initialState,

      addItem: async (item: OrderItem, quantity: number) => {
        const { items, shippingAddress } = get().cart;
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
            ...(await calcDeliveryDateAndPrice({
              items: updatedCartItems,
              shippingAddress,
            })),
          },
        });
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
        const { items, shippingAddress } = get().cart;
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
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...(await calcDeliveryDateAndPrice({
              items: updatedCartItems,
              shippingAddress,
            })),
          },
        });
      },
      removeItem: async (item: OrderItem) => {
        const { items, shippingAddress } = get().cart;
        const updatedCartItems = items.filter(
          (x) =>
            x.product !== item.product ||
            x.color !== item.color ||
            x.size !== item.size
        );
        set({
          cart: {
            ...get().cart,
            items: updatedCartItems,
            ...(await calcDeliveryDateAndPrice({
              items: updatedCartItems,
              shippingAddress,
            })),
          },
        });
      },
      setShippingAddress: async (shippingAddress: ShippingAddress) => {
        const { items } = get().cart;
        set({
          cart: {
            ...get().cart,
            shippingAddress,
            ...(await calcDeliveryDateAndPrice({
              items,
              shippingAddress,
            })),
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
      setDeliveryDateIndex: async (index: number) => {
        const { items, shippingAddress } = get().cart;

        set({
          cart: {
            ...get().cart,
            deliveryDateIndex: index,
            ...(await calcDeliveryDateAndPrice({
              items,
              shippingAddress,
              deliveryDateIndex: index,
            })),
          },
        });
      },
      setCartPrices: (prices) => {
        set({
          cart: {
            ...get().cart,
            ...prices,
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
