import { z } from "zod";

export const firstPurchaseDiscountQuoteSchema = z.object({
  itemsPrice: z.number().nonnegative(),
  email: z.string().email().optional(),
});
