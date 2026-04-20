import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user.model";
import WalletTransaction from "@/lib/db/models/wallet-transaction.model";
import { round2 } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();

    // Verify payment with Paystack API
    const res = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await res.json();

    // Validate required fields
    if (!data?.status || data.data.status !== "success") {
      return NextResponse.json({
        status: false,
        message: "Payment not successful",
      });
    }

    const { userId, type } = data.data.metadata;
    if (type !== "wallet_topup") {
      return NextResponse.json({
        status: false,
        message: "Invalid transaction type",
      });
    }

    const amount = data.data.amount / 100; // convert from cents to original currency

    await connectToDatabase();

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ status: false, message: "User not found" });
    }

    const balanceBefore = round2(user.walletBalance || 0);
    user.walletBalance = round2(balanceBefore + amount);
    await user.save();

    const balanceAfter = round2(user.walletBalance);

    await WalletTransaction.create({
      user: user._id,
      amount: amount,
      reason: `Wallet Top-up via Paystack (${reference})`,
      source: "deposit",
      balanceBefore,
      balanceAfter,
    });

    return NextResponse.json({ status: true, message: "Wallet credited successfully" });
  } catch (err) {
    console.error("Wallet verify error:", err);
    return NextResponse.json({ status: false, message: "Verification failed" });
  }
}
