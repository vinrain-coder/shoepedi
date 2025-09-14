import { markPaystackOrderAsPaid } from "@/lib/actions/order.actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { reference, orderId } = await req.json();

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

    if (data.status && data.data.status === "success") {
      // mark order as paid in DB
      await markPaystackOrderAsPaid(orderId, {
        paymentMethod: "Paystack",
        paymentReference: reference,
      });

      return NextResponse.json({ status: true, data: data.data });
    }

    return NextResponse.json({
      status: false,
      message: "Payment not successful",
    });
  } catch (err) {
    return NextResponse.json({ status: false, message: "Verification failed" });
  }
}
