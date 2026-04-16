import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user.model";
import Order from "@/lib/db/models/order.model";
import Product from "@/lib/db/models/product.model";

export const userRepo = {
  connectToDatabase,
  User,
  Order,
  Product,
};
