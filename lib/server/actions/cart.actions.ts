"use server";

import { cartService } from "@/lib/server/services/cart.service";

export const createOrderFromCart = cartService.createOrderFromCart;
export const getFirstPurchaseDiscountQuote = cartService.getFirstPurchaseDiscountQuote;
