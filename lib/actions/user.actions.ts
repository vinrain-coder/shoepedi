"use server";

import bcrypt from "bcryptjs";
import { IUserName, IUserSignUp } from "@/types";
import { UserSignUpSchema, UserUpdateSchema } from "../validator";
import { connectToDatabase } from "../db";
import User, { IUser } from "../db/models/user.model";
import Order from "../db/models/order.model";
import Product from "../db/models/product.model";
import WalletTransaction from "../db/models/wallet-transaction.model";
import mongoose, { Types } from "mongoose";
import { formatError, escapeRegExp } from "../utils";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSetting } from "./setting.actions";
import { getServerSession } from "../get-session";
import {
  sendAdminEventNotification,
  sendWelcomeNewUserEmail,
} from "../email/transactional";

// CREATE
export async function registerUser(userSignUp: IUserSignUp) {
  try {
    const user = await UserSignUpSchema.parseAsync({
      name: userSignUp.name,
      email: userSignUp.email,
      password: userSignUp.password,
      confirmPassword: userSignUp.confirmPassword,
    });

    await connectToDatabase();
    const newUser = await User.create({
      ...user,
      password: await bcrypt.hash(user.password, 5),
    });

    if (newUser) {
      await sendAdminEventNotification({
        title: "New customer account",
        description: `${newUser.name || newUser.email} created an account${newUser.email ? ` with ${newUser.email}` : ""}.`,
        href: "/admin/users",
        meta: "Needs verification",
        createdAt: new Date().toISOString(),
      });

      try {
        await sendWelcomeNewUserEmail({
          email: newUser.email,
          name: newUser.name,
        });
      } catch (error) {
        console.error("Non-critical: Failed to send welcome email:", error);
      }
    }

    return { success: true, message: "User created successfully" };
  } catch (error) {
    return { success: false, error: formatError(error) };
  }
}

export async function createUserByAdmin(
  userData: IUserSignUp & { role?: "ADMIN" | "USER" },
) {
  try {
    const session = await getServerSession();
    if (session?.user?.role !== "ADMIN") {
      throw new Error("Unauthorized");
    }

    const user = await UserSignUpSchema.parseAsync({
      name: userData.name,
      email: userData.email,
      password: userData.password,
      confirmPassword: userData.confirmPassword,
    });

    await connectToDatabase();
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) throw new Error("Email already exists");

    const newUser = await User.create({
      ...user,
      role: userData.role || "USER",
      password: await bcrypt.hash(user.password, 5),
    });

    if (newUser && newUser.role !== "ADMIN") {
      await sendAdminEventNotification({
        title: "New account created by admin",
        description: `Admin ${session.user.name} created an account for ${newUser.name || newUser.email}.`,
        href: "/admin/users",
        createdAt: new Date().toISOString(),
      });

      try {
        await sendWelcomeNewUserEmail({
          email: newUser.email,
          name: newUser.name,
        });
      } catch (error) {
        console.error("Non-critical: Failed to send welcome email:", error);
      }
    }

    revalidatePath("/admin/users");

    return { success: true, message: "User created successfully" };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// DELETE

export async function deleteUser(id: string) {
  try {
    await connectToDatabase();
    const res = await User.findByIdAndDelete(id);
    if (!res) throw new Error("Use not found");
    revalidatePath("/admin/users");
    return {
      success: true,
      message: "User deleted successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
// UPDATE

export async function updateUser(user: z.infer<typeof UserUpdateSchema>) {
  try {
    await connectToDatabase();
    const dbUser = await User.findById(user._id);
    if (!dbUser) throw new Error("User not found");
    dbUser.name = user.name;
    dbUser.email = user.email;
    dbUser.role = user.role;
    const updatedUser = await dbUser.save();
    revalidatePath("/admin/users");
    return {
      success: true,
      message: "User updated successfully",
      data: JSON.parse(JSON.stringify(updatedUser)),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
export async function updateUserName(user: IUserName) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    const currentUser = await User.findById(session?.user?.id);
    if (!currentUser) throw new Error("User not found");
    currentUser.name = user.name;
    const updatedUser = await currentUser.save();
    return {
      success: true,
      message: "User updated successfully",
      data: JSON.parse(JSON.stringify(updatedUser)),
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// export async function signInWithCredentials(user: IUserSignIn) {
//   return await signIn("credentials", { ...user, redirect: false });
// }
// export const SignInWithGoogle = async () => {
//   await signIn("google");
// };
// export const SignOut = async () => {
//   const redirectTo = await signOut({ redirect: false });
//   redirect(redirectTo.redirect);
// };

// GET
export async function getAllUsers({
  limit,
  page,
  search,
  role,
}: {
  limit?: number;
  page: number;
  search?: string;
  role?: string;
}) {
  const {
    common: { pageSize },
  } = await getSetting();
  limit = limit || pageSize;
  await connectToDatabase();

  const query: any = {};
  if (search) {
    const escapedSearch = escapeRegExp(search);
    query.$or = [
      { name: { $regex: escapedSearch, $options: "i" } },
      { email: { $regex: escapedSearch, $options: "i" } },
    ];
  }
  if (role && role !== "all") {
    query.role = role;
  }

  const skipAmount = (Number(page) - 1) * limit;
  const users = await User.find(query)
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(limit)
    .lean();
  const usersCount = await User.countDocuments(query);
  const safeUsers = users.map((user) => ({
    ...user,
    _id: user._id.toString(),
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  }));
  return {
    data: safeUsers as unknown as IUser[],
    totalPages: Math.ceil(usersCount / limit),
    totalUsers: usersCount,
  };
}

export async function getUserStats() {
  await connectToDatabase();

  const [totalUsers, adminCount, customerCount, recentUsers] =
    await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "ADMIN" }),
      User.countDocuments({ role: "USER" }),
      User.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      }),
    ]);

  return {
    totalUsers,
    adminCount,
    customerCount,
    recentUsers,
  };
}

export async function getUserById(userId: string) {
  await connectToDatabase();
  const user = await User.findById(userId).lean();
  if (!user) throw new Error("User not found");
  return {
    ...user,
    _id: user._id.toString(),
    createdAt: user.createdAt?.toISOString(),
    updatedAt: user.updatedAt?.toISOString(),
  } as unknown as IUser;
}

export async function getAdminUserInsights(userId: string) {
  await connectToDatabase();

  const user = await User.findById(userId)
    .select("name email role createdAt wishlist coins navigationHistory")
    .lean();

  if (!user) throw new Error("User not found");

  const wishlistIds = (Array.isArray(user.wishlist) ? user.wishlist : [])
    .map((id) => String(id))
    .filter((id) => Types.ObjectId.isValid(id));

  const [wishlistProducts, orders, orderStats] = await Promise.all([
    wishlistIds.length > 0
      ? Product.find({ _id: { $in: wishlistIds } })
          .select("name slug images category price isPublished")
          .sort({ updatedAt: -1 })
          .limit(12)
          .lean()
      : [],
    Order.find({ user: user._id })
      .select("_id createdAt totalPrice status isPaid isDelivered items")
      .sort({ createdAt: -1 })
      .limit(15)
      .lean(),
    Order.aggregate([
      { $match: { user: user._id } },
      {
        $facet: {
          totals: [
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalSpent: { $sum: "$totalPrice" },
                avgOrderValue: { $avg: "$totalPrice" },
                paidOrders: {
                  $sum: {
                    $cond: [{ $eq: ["$isPaid", true] }, 1, 0],
                  },
                },
                deliveredOrders: {
                  $sum: {
                    $cond: [{ $eq: ["$isDelivered", true] }, 1, 0],
                  },
                },
              },
            },
          ],
          monthlyOrders: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                orders: { $sum: 1 },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
          ],
        },
      },
    ]),
  ]);

  const stats = orderStats?.[0];
  const totals = stats?.totals?.[0] ?? {
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0,
    paidOrders: 0,
    deliveredOrders: 0,
  };

  const monthlyOrders = (stats?.monthlyOrders ?? []).map(
    (item: { _id: { year: number; month: number }; orders: number }) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
      orders: item.orders,
    }),
  );

  const navigationHistory = (user.navigationHistory ?? [])
    .sort(
      (a, b) =>
        new Date(String(b.visitedAt)).getTime() -
        new Date(String(a.visitedAt)).getTime(),
    )
    .slice(0, 15);

  return JSON.parse(
    JSON.stringify({
      user: {
        ...user,
        wishlist: wishlistProducts,
      },
      metrics: {
        ...totals,
        wishlistCount: wishlistIds.length,
      },
      monthlyOrders,
      recentOrders: orders,
      navigationHistory,
    }),
  );
}

export async function getUserCoins(): Promise<number | null> {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session?.user?.id) return null;

    const user = await User.findById(session.user.id).select("coins").lean();
    if (!user) return null;
    return Number(Number(user.coins || 0).toFixed(2));
  } catch (error) {
    console.error("Error fetching user coins:", error);
    return null;
  }
}

export async function getUserWalletBalance(): Promise<number | null> {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session?.user?.id) return null;

    const user = await User.findById(session.user.id)
      .select("walletBalance")
      .lean();
    if (!user) return null;
    return Number(Number(user.walletBalance || 0).toFixed(2));
  } catch (error) {
    console.error("Error fetching user wallet balance:", error);
    return null;
  }
}

export async function convertGuestToUser(orderId: string, accessToken: string) {
  try {
    await connectToDatabase();
    const order = await Order.findOne({
      _id: orderId,
      isGuest: true,
      accessToken: accessToken,
    });
    if (!order) throw new Error("Order not found or already linked");

    const session = await getServerSession();
    if (!session?.user?.id || !session?.user?.email)
      throw new Error("You must be signed in to link an order");

    const userId = session.user.id;
    const userEmail = session.user.email.toLowerCase();

    // Verify email matches
    const orderEmail =
      order.userEmail?.toLowerCase() ||
      order.shippingAddress.email?.toLowerCase();
    if (orderEmail && userEmail !== orderEmail) {
      throw new Error("Signed-in email does not match order email");
    }

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    // Start transaction for atomic operations
    const dbSession = await mongoose.startSession();
    dbSession.startTransaction();

    try {
      // Link order to user
      order.user = new Types.ObjectId(userId);
      order.isGuest = false;
      order.accessToken = undefined;

      // Handle financial adjustments
      let coinsAdjustment = 0;
      let walletAdjustment = 0;

      // 1. Credit earned coins if order was paid and coins not yet credited
      if (order.isPaid && order.coinsEarned > 0 && !order.coinsCredited) {
        coinsAdjustment += order.coinsEarned;
        order.coinsCredited = true;
      }

      // 2. Handle coins redeemed by guest (deduct from user balance)
      if (order.coinsRedeemed > 0) {
        coinsAdjustment -= order.coinsRedeemed;
      }

      // 3. Handle wallet amounts redeemed by guest (deduct from user balance)
      if (order.walletAmountRedeemed > 0) {
        walletAdjustment -= order.walletAmountRedeemed;
      }

      // 4. Handle refunds issued to guest order
      if (order.refundedToCoins && order.coinsRedeemed > 0) {
        coinsAdjustment += order.coinsRedeemed;
      }

      if (order.refundedToWallet && order.totalPrice > 0) {
        walletAdjustment += order.totalPrice;
      }

      // Apply financial adjustments
      if (coinsAdjustment !== 0) {
        user.coins = Math.max(0, (user.coins || 0) + coinsAdjustment);
      }

      if (walletAdjustment !== 0) {
        user.walletBalance = Math.max(
          0,
          (user.walletBalance || 0) + walletAdjustment,
        );
      }

      await order.save({ session: dbSession });
      await user.save({ session: dbSession });

      // Transfer wallet transactions to user account
      await WalletTransaction.updateMany(
        { order: order._id },
        { user: userId },
        { session: dbSession },
      );

      // Link address if user has none
      if (user.addresses.length === 0) {
        const newAddress = {
          id: new Types.ObjectId().toString(),
          label: "Home",
          ...order.shippingAddress,
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        user.addresses.push(newAddress);
        await user.save({ session: dbSession });
      }

      await dbSession.commitTransaction();

      revalidatePath(`/account/orders/${orderId}`);
      revalidatePath("/account/orders");
      revalidatePath("/account");
      revalidatePath("/account/wallet");

      return {
        success: true,
        message: "Order successfully linked to your account",
      };
    } catch (error) {
      await dbSession.abortTransaction();
      throw error;
    } finally {
      dbSession.endSession();
    }
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
