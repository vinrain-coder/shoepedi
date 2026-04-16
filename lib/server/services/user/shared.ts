import { userRepo } from "@/lib/server/repositories/user.repo";

export const { connectToDatabase, User, Order, Product } = userRepo;
