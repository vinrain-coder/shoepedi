import { connectToDatabase } from "@/lib/db";
import Product from "@/lib/db/models/product.model";

export const productRepo = {
  connectToDatabase,
  Product,
};
