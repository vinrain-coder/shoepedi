import { z } from "zod";
import { OrderInputSchema } from "@/lib/validator";

export const createOrderSchema = OrderInputSchema;
export const orderIdSchema = z.string().min(1, "Order id is required");
