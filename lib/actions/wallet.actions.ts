"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { getServerSession } from "@/lib/get-session";
import WalletTransaction, { IWalletTransaction } from "@/lib/db/models/wallet-transaction.model";
import User from "@/lib/db/models/user.model";
import Order from "@/lib/db/models/order.model";
import WalletPayout from "@/lib/db/models/wallet-payout.model";
import { escapeRegExp, formatError, round2, formatCurrency } from "@/lib/utils";
import { getSetting } from "./setting.actions";
import { WalletPayoutInputSchema } from "../validator";
import { sendAdminEventNotification, sendWalletAdjustmentNotification, sendWalletPayoutStatusNotification } from "../email/transactional";
import { z } from "zod";

const MAX_TOPUP = 100000; // Define a sensible max top-up limit (e.g. 100k KES)

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

  const sanitizedUsers = (users as any[]).map(u => ({
    ...u,
    _id: u._id.toString(),
    walletBalance: Number(u.walletBalance || 0),
  }));

  return {
    data: JSON.parse(JSON.stringify(sanitizedUsers)) as WalletEarnerRow[],
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
    ).select("_id name email walletBalance addresses");

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

    // Send user notification
    try {
      const defaultAddress = (updatedUser.addresses as any[] || []).find((a: any) => a.isDefault) || (updatedUser.addresses as any[] || [])[0];
      await sendWalletAdjustmentNotification({
        email: updatedUser.email,
        name: updatedUser.name || "Customer",
        amount: normalizedAmount,
        reason: normalizedReason,
        newBalance,
        phone: defaultAddress?.phone,
      });
    } catch (notifyErr) {
      console.error("Failed to notify user of wallet adjustment:", notifyErr);
    }

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

export type PaystackVerifyResponse = {
  status: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    amount: number;
    currency: string;
    customer: {
      email: string;
    };
    metadata: {
      userId: string;
      type: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
};

export async function initializeWalletTopup(amount: number) {
  try {
    const numericAmount = round2(Number(amount));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      throw new Error("Invalid top-up amount");
    }

    if (numericAmount > MAX_TOPUP) {
      throw new Error(`Maximum top-up amount is ${formatCurrency(MAX_TOPUP)}`);
    }

    const session = await getServerSession();
    if (!session) throw new Error("User not authenticated");

    const user = await User.findById(session.user.id).select("email");
    if (!user) throw new Error("User not found");

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(numericAmount * 100), // convert to cents
        currency: "KES",
        callback_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/account/wallet`,
        metadata: {
          userId: user._id.toString(),
          type: "wallet_topup",
        },
      }),
    });

    const data = await res.json();
    if (!data.status) throw new Error(data.message);

    return {
      success: true,
      data: {
        ...data.data,
        email: user.email,
      },
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function completeWalletTopup(
  reference: string,
  data: PaystackVerifyResponse,
) {
  await connectToDatabase();

  try {
    const authSession = await getServerSession();
    if (!authSession) throw new Error("Unauthorized");

    // Preliminary idempotency check outside transaction
    const existingTxPre = await WalletTransaction.findOne({
      externalReference: reference,
    }).lean();
    if (existingTxPre) return { success: true, message: "Already processed" };

    // Validate Paystack response
    if (!data?.status || data.data.status !== "success") {
      throw new Error("Payment not successful");
    }

    if (data.data.currency !== "KES") {
      throw new Error(`Unsupported currency: ${data.data.currency}`);
    }

    const amount = data.data.amount / 100;
    if (!Number.isFinite(amount) || amount <= 0 || amount > MAX_TOPUP) {
      throw new Error("Invalid payment amount");
    }

    const metadata = data.data.metadata;
    if (!metadata || metadata.type !== "wallet_topup") {
      throw new Error("Invalid transaction type");
    }

    if (metadata.userId !== authSession.user.id) {
      throw new Error("User mismatch");
    }

    const connection = await connectToDatabase();
    const session = await connection.startSession();
    session.startTransaction();

    try {
      // Re-verify inside transaction
      const existingTx = await WalletTransaction.findOne({
        externalReference: reference,
      }).session(session);

      if (existingTx) {
        await session.abortTransaction();
        return { success: true, message: "Already processed" };
      }

      const user = await User.findById(metadata.userId).session(session);
      if (!user) throw new Error("User not found");

      const balanceBefore = round2(user.walletBalance || 0);
      user.walletBalance = round2(balanceBefore + amount);
      await user.save({ session });

      const balanceAfter = round2(user.walletBalance);

      try {
        await WalletTransaction.create(
          [
            {
              user: user._id,
              amount: amount,
              reason: `Wallet Top-up via Paystack (${reference})`,
              source: "deposit",
              balanceBefore,
              balanceAfter,
              externalReference: reference,
            },
          ],
          { session },
        );
      } catch (dbErr: any) {
        if (dbErr.code === 11000 || dbErr.name === "MongoServerError") {
          await session.abortTransaction();
          return { success: true, message: "Already processed" };
        }
        throw dbErr;
      }

      await session.commitTransaction();
      revalidatePath("/account/wallet");
      return { success: true, message: "Wallet credited successfully" };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (err) {
    console.error("completeWalletTopup error:", err);
    return { success: false, message: formatError(err) };
  }
}

export async function createWalletPayoutRequest(data: z.infer<typeof WalletPayoutInputSchema>) {
  const connection = await connectToDatabase();
  const session = await connection.startSession();
  session.startTransaction();

  try {
    const authSession = await getServerSession();
    if (!authSession) throw new Error("User not authenticated");

    const validatedData = WalletPayoutInputSchema.parse(data);

    const user = await User.findById(authSession.user.id).session(session);
    if (!user) throw new Error("User not found");

    if (validatedData.amount > user.walletBalance) {
      throw new Error("Insufficient wallet balance");
    }

    const payout = await WalletPayout.create(
      [
        {
          user: user._id,
          amount: validatedData.amount,
          paymentMethod: validatedData.paymentMethod,
          paymentDetails: validatedData.paymentDetails,
          status: "pending",
        },
      ],
      { session }
    );

    const balanceBefore = round2(user.walletBalance);
    user.walletBalance = round2(user.walletBalance - validatedData.amount);
    await user.save({ session });

    const balanceAfter = round2(user.walletBalance);

    await WalletTransaction.create(
      [
        {
          user: user._id,
          amount: -validatedData.amount,
          reason: `Payout request: ${validatedData.paymentMethod}`,
          source: "payout",
          balanceBefore,
          balanceAfter,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    await sendAdminEventNotification({
      title: "New wallet payout request",
      description: `${user.name || "A user"} requested a wallet payout of ${formatCurrency(validatedData.amount)} via ${validatedData.paymentMethod}.`,
      href: "/admin/wallet/payouts",
      meta: "Payout pending",
      createdAt: new Date().toISOString(),
    });

    revalidatePath("/account/wallet");
    revalidatePath("/admin/wallet/payouts");

    return {
      success: true,
      message: "Payout request submitted successfully",
      data: JSON.parse(JSON.stringify(payout[0])),
    };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return { success: false, message: formatError(error) };
  } finally {
    session.endSession();
  }
}

export async function getAllWalletPayouts({
  page = 1,
  limit,
  status,
  query,
}: {
  page?: number;
  limit?: number;
  status?: string;
  query?: string;
}) {
  try {
    await ensureAdmin();
    await connectToDatabase();

    const {
      common: { pageSize },
    } = await getSetting();

    const currentLimit = limit || pageSize;

    const filter: any = {};
    if (status && status !== "all") {
      filter.status = status;
    }

    if (query) {
      // Defense-in-depth: cap query length to mitigate ReDoS risks
      const truncatedQuery = query.slice(0, 100);
      const escapedQuery = escapeRegExp(truncatedQuery);
      const regex = new RegExp(escapedQuery, "i");
      const users = await User.find({
        $or: [{ name: regex }, { email: regex }],
      }).select("_id");
      const userIds = users.map((u: any) => u._id);
      filter.user = { $in: userIds };
    }

    const payouts = await WalletPayout.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * currentLimit)
      .limit(currentLimit);

    const count = await WalletPayout.countDocuments(filter);

    return {
      success: true,
      data: JSON.parse(JSON.stringify(payouts)),
      totalPages: Math.ceil(count / currentLimit),
      totalPayouts: count,
    };
  } catch (error) {
    return {
      success: false,
      message: formatError(error),
      data: [],
      totalPages: 0,
      totalPayouts: 0,
    };
  }
}

export async function updateWalletPayoutStatus(
  id: string,
  status: "paid" | "rejected",
  adminNote?: string
) {
  const connection = await connectToDatabase();
  const session = await connection.startSession();
  session.startTransaction();

  try {
    await ensureAdmin();

    const payout = await WalletPayout.findById(id).session(session);
    if (!payout) throw new Error("Payout not found");
    if (payout.status !== "pending" && payout.status !== "processing") {
      throw new Error("Payout already processed");
    }

    if (status === "rejected") {
      if (!adminNote || adminNote.trim().length === 0) {
        throw new Error("A rejection reason is mandatory for rejection");
      }
      payout.adminNote = adminNote.trim();

      // Refund user balance
      const user = await User.findById(payout.user).session(session);
      if (user) {
        const balanceBefore = round2(user.walletBalance);
        user.walletBalance = round2(user.walletBalance + payout.amount);
        await user.save({ session });

        const balanceAfter = round2(user.walletBalance);

        await WalletTransaction.create(
          [
            {
              user: user._id,
              amount: payout.amount,
              reason: `Payout rejected: ${adminNote}`,
              source: "refund",
              balanceBefore,
              balanceAfter,
            },
          ],
          { session }
        );
      }
    } else if (status === "paid") {
      payout.adminNote = adminNote?.trim() || "";
    }

    payout.status = status;
    await payout.save({ session });

    await session.commitTransaction();

    // Send user notification
    try {
      const user = await User.findById(payout.user).select("name email addresses");
      if (user) {
        const defaultAddress = (user.addresses as any[] || []).find((a: any) => a.isDefault) || (user.addresses as any[] || [])[0];
        await sendWalletPayoutStatusNotification({
          email: user.email,
          name: user.name || "Customer",
          amount: payout.amount,
          status,
          paymentMethod: payout.paymentMethod,
          adminNote,
          phone: defaultAddress?.phone,
        });
      }
    } catch (notifyErr) {
      console.error("Failed to notify user of payout status update:", notifyErr);
    }

    revalidatePath("/admin/wallet/payouts");
    revalidatePath("/account/wallet");

    return { success: true, message: `Payout marked as ${status}` };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return { success: false, message: formatError(error) };
  } finally {
    session.endSession();
  }
}

export async function deleteWalletPayoutRequest(id: string) {
  const connection = await connectToDatabase();
  const session = await connection.startSession();
  session.startTransaction();

  try {
    await ensureAdmin();

    const payout = await WalletPayout.findById(id).session(session);
    if (!payout) throw new Error("Payout request not found");

    if (payout.status === "pending" || payout.status === "processing") {
      // Refund user balance before deletion
      const user = await User.findById(payout.user).session(session);
      if (user) {
        const balanceBefore = round2(user.walletBalance);
        user.walletBalance = round2(user.walletBalance + payout.amount);
        await user.save({ session });

        const balanceAfter = round2(user.walletBalance);

        await WalletTransaction.create(
          [
            {
              user: user._id,
              amount: payout.amount,
              reason: "Payout request deleted by admin (refunded)",
              source: "refund",
              balanceBefore,
              balanceAfter,
            },
          ],
          { session }
        );
      }
    }

    await WalletPayout.findByIdAndDelete(id).session(session);

    await session.commitTransaction();

    revalidatePath("/admin/wallet/payouts");
    revalidatePath("/account/wallet");

    return {
      success: true,
      message: "Payout request deleted and balance refunded if applicable",
    };
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return { success: false, message: formatError(error) };
  } finally {
    session.endSession();
  }
}
