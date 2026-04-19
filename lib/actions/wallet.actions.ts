"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "@/lib/get-session";
import WalletTransaction, { IWalletTransaction } from "@/lib/db/models/wallet-transaction.model";
import User from "@/lib/db/models/user.model";
import Order from "@/lib/db/models/order.model";
import { escapeRegExp, formatError, round2 } from "@/lib/utils";
import { getSetting } from "./setting.actions";

export type WalletTransactionRow = {
  id: string;
  date: Date;
  type: string;
  amount: number;
  signedAmount: number;
  reason: string;
  source: string;
  orderId?: string;
  orderTrackingNumber?: string;
  admin?: { name?: string; email?: string } | null;
  balanceBefore: number;
  balanceAfter: number;
};

export type WalletEarnerRow = {
  _id: string;
  name: string;
  email: string;
  walletBalance: number;
  createdAt: Date;
};

async function ensureAdmin() {
  const session = await getServerSession();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Admin permission required");
  }

  return session;
}

export async function getWalletEarnersAdmin({
  page,
  search,
  limit,
}: {
  page: number;
  search?: string;
  limit?: number;
}) {
  await ensureAdmin();
  await connectToDatabase();

  const {
    common: { pageSize },
  } = await getSetting();

  const currentLimit = limit ?? pageSize;
  if (currentLimit <= 0) throw new Error("Invalid limit");
  const currentPage = Math.max(1, Math.floor(page || 1));
  const query: Record<string, unknown> = {};

  if (search?.trim()) {
    const escaped = escapeRegExp(search.trim());
    query.$or = [
      { name: { $regex: escaped, $options: "i" } },
      { email: { $regex: escaped, $options: "i" } },
    ];
  }

  const skip = (currentPage - 1) * currentLimit;

  const [users, totalUsers] = await Promise.all([
    User.find(query)
      .select("name email walletBalance createdAt")
      .sort({ walletBalance: -1, updatedAt: -1 })
      .skip(skip)
      .limit(currentLimit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    data: JSON.parse(JSON.stringify(users)) as WalletEarnerRow[],
    totalUsers,
    totalPages: Math.ceil(totalUsers / currentLimit),
  };
}

export async function getWalletAdminStats() {
  await ensureAdmin();
  await connectToDatabase();

  const [allStats, topUser, totalAdjustments] = await Promise.all([
    User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalWalletHolders: {
            $sum: {
              $cond: [{ $gt: ["$walletBalance", 0] }, 1, 0],
            },
          },
          totalWalletBalance: { $sum: "$walletBalance" },
          averageBalance: { $avg: "$walletBalance" },
        },
      },
    ]),
    User.findOne({ walletBalance: { $gt: 0 } }).sort({ walletBalance: -1 }).select("name walletBalance").lean(),
    WalletTransaction.countDocuments({ source: "admin_adjustment" }),
  ]);

  const stat = allStats[0] || {
    totalUsers: 0,
    totalWalletHolders: 0,
    totalWalletBalance: 0,
    averageBalance: 0,
  };

  return {
    totalUsers: stat.totalUsers,
    totalWalletHolders: stat.totalWalletHolders,
    totalWalletBalance: round2(stat.totalWalletBalance || 0),
    averageBalance: round2(stat.averageBalance || 0),
    topHolderName: topUser?.name || "-",
    topHolderBalance: round2(topUser?.walletBalance || 0),
    totalAdjustments,
  };
}

export async function getUserWalletHistoryAdmin({
  userId,
  page,
  limit,
}: {
  userId: string;
  page: number;
  limit?: number;
}) {
  await ensureAdmin();
  await connectToDatabase();

  const {
    common: { pageSize },
  } = await getSetting();

  const currentLimit = limit ?? pageSize;
  if (currentLimit <= 0) throw new Error("Invalid limit");
  const currentPage = Math.max(1, Math.floor(page || 1));
  const skip = (currentPage - 1) * currentLimit;

  const user = await User.findById(userId).select("name email walletBalance").lean();
  if (!user) throw new Error("User not found");

  const [transactions, totalEvents] = await Promise.all([
    WalletTransaction.find({ user: userId })
      .populate("admin", "name email")
      .populate({
        path: "order",
        select: "trackingNumber status totalPrice"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(currentLimit)
      .lean() as unknown as (IWalletTransaction & {
        admin?: { name: string; email: string },
        order?: { _id: string; trackingNumber: string; status: string; totalPrice: number }
      })[],
    WalletTransaction.countDocuments({ user: userId })
  ]);

  const history = transactions.map((tx) => ({
    id: tx._id.toString(),
    date: tx.createdAt,
    type: tx.source === "refund" || tx.source === "wallet_payment" ? (tx.amount >= 0 ? "refund" : "redeemed") : (tx.amount >= 0 ? "adjustment_add" : "adjustment_deduct"),
    amount: round2(Math.abs(tx.amount)),
    signedAmount: round2(tx.amount),
    reason: tx.reason,
    source: tx.source,
    orderId: tx.order?._id?.toString(),
    orderTrackingNumber: tx.order?.trackingNumber,
    admin: tx.admin
      ? {
          name: tx.admin.name,
          email: tx.admin.email,
        }
      : null,
    balanceBefore: round2(tx.balanceBefore),
    balanceAfter: round2(tx.balanceAfter),
  })) as WalletTransactionRow[];

  return {
    user: {
      _id: userId,
      name: user.name,
      email: user.email,
      walletBalance: round2(user.walletBalance || 0),
    },
    history,
    totalEvents,
    totalPages: Math.ceil(totalEvents / currentLimit),
  };
}

export async function adjustUserWalletAdmin({
  userId,
  amount,
  reason,
}: {
  userId: string;
  amount: number;
  reason: string;
}) {
  const sessionUser = await ensureAdmin();

  try {
    await connectToDatabase();

    const normalizedAmount = round2(Number(amount));
    const normalizedReason = reason?.trim();

    if (!Number.isFinite(normalizedAmount) || normalizedAmount === 0) {
      throw new Error("Amount must be a non-zero number");
    }

    if (!normalizedReason || normalizedReason.length < 3) {
      throw new Error("Reason must be at least 3 characters");
    }

    const query: Record<string, unknown> = { _id: userId };
    if (normalizedAmount < 0) {
      query.walletBalance = { $gte: Math.abs(normalizedAmount) };
    }

    const updatedUser = await User.findOneAndUpdate(
      query,
      { $inc: { walletBalance: normalizedAmount } },
      { new: true }
    ).select("_id walletBalance");

    if (!updatedUser) {
      if (normalizedAmount < 0) {
        throw new Error("Deduction exceeds user's available balance");
      }
      throw new Error("User not found");
    }

    const newBalance = round2(updatedUser.walletBalance || 0);
    const balanceBefore = round2(newBalance - normalizedAmount);

    await WalletTransaction.create({
      user: updatedUser._id,
      admin: sessionUser.user.id,
      amount: normalizedAmount,
      reason: normalizedReason,
      source: "admin_adjustment",
      balanceBefore,
      balanceAfter: newBalance,
    });

    revalidatePath("/admin/wallet");
    revalidatePath(`/admin/wallet/${userId}`);
    revalidatePath("/account/wallet");
    revalidatePath("/checkout");

    return {
      success: true,
      message: `User wallet balance updated successfully. New balance: ${newBalance.toFixed(2)}`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
