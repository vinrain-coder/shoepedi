import { createOrderFromCart, getFirstPurchaseDiscountQuote } from "@/lib/server/services/order.service";

export const cartService = {
  createOrderFromCart,
  getFirstPurchaseDiscountQuote,
};
