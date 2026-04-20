"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "@/lib/get-session";
import CoinTransaction from "@/lib/db/models/coin-transaction.model";
import User from "@/lib/db/models/user.model";
import Order from "@/lib/db/models/order.model";
import { escapeRegExp, formatError, round2 } from "@/lib/utils";
import { getSetting } from "./setting.actions";
import { sendCoinAdjustmentNotification } from "../email/transactional";

type LeanCoinOrder = {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt?: Date;
  status: string;
  totalPrice: number;
  coinsEarned: number;
  coinsRedeemed: number;
  coinsCredited: boolean;
  refundedToCoins: boolean;
  trackingNumber?: string;
};

type LeanCoinTransaction = {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  amount: number;
  reason: string;
  source: "admin_adjustment" | "system";
  balanceBefore: number;
  balanceAfter: number;
  admin?: { name?: string; email?: string } | null;
};

async function ensureAdmin() {
  const session = await getServerSession();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Admin permission required");
  }

  return session;
}

export async function getCoinEarnersAdmin({
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

  const currentLimit = limit || pageSize;
  const currentPage = Math.max(1, Math.floor(page || 1));
  const query: Record<string, unknown> = { coins: { $gt: 0 } };

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
      .select("name email coins createdAt")
      .sort({ coins: -1, updatedAt: -1 })
      .skip(skip)
      .limit(currentLimit)
      .lean(),
    User.countDocuments(query),
  ]);

  return {
    data: JSON.parse(JSON.stringify(users)),
    totalUsers,
    totalPages: Math.ceil(totalUsers / currentLimit),
  };
}

export async function getCoinAdminStats() {
  await ensureAdmin();
  await connectToDatabase();

  const [allStats, topUser, totalAdjustments] = await Promise.all([
    User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalCoinHolders: {
            $sum: {
              $cond: [{ $gt: ["$coins", 0] }, 1, 0],
            },
          },
          circulatingCoins: { $sum: "$coins" },
          averageBalance: { $avg: "$coins" },
        },
      },
    ]),
    User.findOne({ coins: { $gt: 0 } }).sort({ coins: -1 }).select("name coins").lean(),
    CoinTransaction.countDocuments({ source: "admin_adjustment" }),
  ]);

  const stat = allStats[0] || {
    totalUsers: 0,
    totalCoinHolders: 0,
    circulatingCoins: 0,
    averageBalance: 0,
  };

  return {
    totalUsers: stat.totalUsers,
    totalCoinHolders: stat.totalCoinHolders,
    circulatingCoins: round2(stat.circulatingCoins || 0),
    averageBalance: round2(stat.averageBalance || 0),
    topHolderName: topUser?.name || "-",
    topHolderBalance: round2(topUser?.coins || 0),
    totalAdjustments,
  };
}

export async function getUserCoinHistoryAdmin({
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

  const currentLimit = limit || pageSize;
  const currentPage = Math.max(1, Math.floor(page || 1));
  const skip = (currentPage - 1) * currentLimit;

  const user = await User.findById(userId).select("name email coins").lean();
  if (!user) throw new Error("User not found");

  const aggregation = await CoinTransaction.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $project: {
        _id: 1,
        createdAt: 1,
        amount: 1,
        reason: 1,
        source: 1,
        balanceBefore: 1,
        balanceAfter: 1,
        admin: 1,
      },
    },
    {
      $unionWith: {
        coll: "orders",
        pipeline: [
          {
            $match: {
              user: new mongoose.Types.ObjectId(userId),
              $or: [{ coinsEarned: { $gt: 0 } }, { coinsRedeemed: { $gt: 0 } }],
            },
          },
          // We might need to split earn and redeem events if they happened at different times,
          // but for now, we follow the previous logic and map them later.
          // To correctly paginate, each event should be a separate document in aggregation.
          {
            $project: {
              events: {
                $concatArrays: [
                  {
                    $cond: [
                      {
                        $and: [
                          { $gt: ["$coinsEarned", 0] },
                          { $eq: ["$coinsCredited", true] },
                          { $not: { $in: ["$status", ["cancelled", "returned"]] } },
                        ],
                      },
                      [
                        {
                          _id: { $concat: ["earn-", { $toString: "$_id" }] },
                          createdAt: { $ifNull: ["$updatedAt", "$createdAt"] },
                          type: "earned",
                          amount: "$coinsEarned",
                          reason: {
                            $concat: [
                              "Coins earned from order #",
                              { $ifNull: ["$trackingNumber", { $substr: [{ $toString: "$_id" }, 18, 6] }] },
                            ],
                          },
                          source: "order",
                          orderId: "$_id",
                        },
                      ],
                      [],
                    ],
                  },
                  {
                    $cond: [
                      { $gt: ["$coinsRedeemed", 0] },
                      [
                        {
                          _id: { $concat: ["redeem-", { $toString: "$_id" }] },
                          createdAt: "$createdAt",
                          type: "redeemed",
                          amount: "$coinsRedeemed",
                          reason: {
                            $concat: [
                              "Coins used to pay order #",
                              { $ifNull: ["$trackingNumber", { $substr: [{ $toString: "$_id" }, 18, 6] }] },
                            ],
                          },
                          source: "order",
                          orderId: "$_id",
                        },
                      ],
                      [],
                    ],
                  },
                ],
              },
            },
          },
          { $unwind: "$events" },
          {
            $replaceRoot: { newRoot: "$events" },
          },
        ],
      },
    },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [
          { $sort: { createdAt: -1 } },
          { $skip: skip },
          { $limit: currentLimit },
          {
            $lookup: {
              from: "users",
              localField: "admin",
              foreignField: "_id",
              as: "adminInfo",
            },
          },
          {
            $addFields: {
              admin: { $arrayElemAt: ["$adminInfo", 0] },
            },
          },
        ],
      },
    },
  ]);

  const totalEvents = aggregation[0].metadata[0]?.total || 0;
  const rawEvents = aggregation[0].data;

  const history = rawEvents.map((event: any) => {
    if (event.source === "order") {
      return {
        id: event._id,
        date: event.createdAt,
        type: event.type,
        amount: round2(event.amount),
        reason: event.reason,
        source: "order",
        orderId: event.orderId.toString(),
      };
    } else {
      return {
        id: `manual-${event._id}`,
        date: event.createdAt,
        type: event.amount >= 0 ? "adjustment_add" : "adjustment_deduct",
        amount: round2(Math.abs(event.amount)),
        signedAmount: round2(event.amount),
        reason: event.reason,
        source: event.source,
        admin: event.admin
          ? {
              name: event.admin.name,
              email: event.admin.email,
            }
          : null,
        balanceBefore: round2(event.balanceBefore),
        balanceAfter: round2(event.balanceAfter),
      };
    }
  });

  return {
    user: {
      _id: userId,
      name: user.name,
      email: user.email,
      coins: round2(user.coins || 0),
    },
    history,
    totalEvents,
    totalPages: Math.ceil(totalEvents / currentLimit),
  };
}

export async function adjustUserCoinsAdmin({
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
      query.coins = { $gte: Math.abs(normalizedAmount) };
    }

    const updatedUser = await User.findOneAndUpdate(
      query,
      { $inc: { coins: normalizedAmount } },
      { new: true }
    ).select("_id name email coins shippingAddress");

    if (!updatedUser) {
      if (normalizedAmount < 0) {
        throw new Error("Deduction exceeds user's available balance");
      }
      throw new Error("User not found");
    }

    const newBalance = round2(updatedUser.coins || 0);
    const balanceBefore = round2(newBalance - normalizedAmount);

    await CoinTransaction.create({
      user: updatedUser._id,
      admin: sessionUser.user.id,
      amount: normalizedAmount,
      reason: normalizedReason,
      source: "admin_adjustment",
      balanceBefore,
      balanceAfter: newBalance,
    });

    revalidatePath("/admin/coins");
    revalidatePath(`/admin/coins/${userId}`);
    revalidatePath("/account/coins");
    revalidatePath("/checkout");

    // Send user notification
    try {
      await sendCoinAdjustmentNotification({
        email: updatedUser.email,
        name: updatedUser.name || "Customer",
        amount: normalizedAmount,
        reason: normalizedReason,
        newBalance,
        phone: updatedUser.shippingAddress?.phone,
      });
    } catch (notifyErr) {
      console.error("Failed to notify user of coins adjustment:", notifyErr);
    }

    return {
      success: true,
      message: `User balance updated successfully. New balance: ${newBalance.toFixed(2)} coins`,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
    };
  }
}
