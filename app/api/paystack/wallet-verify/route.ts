import { connectToDatabase } from "@/lib/db";
import User from "@/lib/db/models/user.model";
import WalletTransaction from "@/lib/db/models/wallet-transaction.model";
import { getServerSession } from "@/lib/get-session";
import { round2 } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const connection = await connectToDatabase();
  const session = await connection.startSession();
  session.startTransaction();

  try {
    const { reference } = await req.json();
    const authSession = await getServerSession();

    if (!authSession) {
      return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
    }

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

    const metadata = data.data.metadata;
    if (!metadata || metadata.type !== "wallet_topup") {
      return NextResponse.json({
        status: false,
        message: "Invalid transaction type",
      });
    }

    if (metadata.userId !== authSession.user.id) {
       return NextResponse.json({ status: false, message: "User mismatch" }, { status: 403 });
    }

    // Idempotency check: check if this reference was already processed
    const existingTx = await WalletTransaction.findOne({ externalReference: reference }).session(session);
    if (existingTx) {
      await session.commitTransaction();
      return NextResponse.json({ status: true, message: "Already processed" });
    }

    // Paystack amounts are in the smallest currency unit (e.g., kobo/cents)
    // Most currencies supported by Paystack (NGN, GHS, ZAR, KES) use 100 as divisor
    const amount = data.data.amount / 100;

    const user = await User.findById(metadata.userId).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    const balanceBefore = round2(user.walletBalance || 0);
    user.walletBalance = round2(balanceBefore + amount);
    await user.save({ session });

    const balanceAfter = round2(user.walletBalance);

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
      { session }
    );

    await session.commitTransaction();
    return NextResponse.json({ status: true, message: "Wallet credited successfully" });
  } catch (err) {
    await session.abortTransaction();
    console.error("Wallet verify error:", err);
    return NextResponse.json({ status: false, message: "Verification failed" });
  } finally {
    session.endSession();
  }
}
