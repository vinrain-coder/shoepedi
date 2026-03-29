import { NextResponse } from "next/server";
import {
  markOrderPaymentAsFailed,
  markPaystackOrderAsPaid,
} from "@/lib/actions/order.actions";

export async function POST(req: Request) {
  try {
    const { reference, orderId, cancelled } = await req.json();

    if (cancelled) {
      await markOrderPaymentAsFailed(orderId, reference);
      return NextResponse.json({ status: false, message: "Payment cancelled" });
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const data = await response.json();

    if (!data?.status || data.data.status !== "success") {
      return NextResponse.json({
        status: false,
        message: "Payment not successful",
      });
    }

    const customerEmail = data.data.customer?.email;
    const transactionId = data.data.id;
    const amount = data.data.amount;
    const paidAt = data.data.paid_at;

    if (!customerEmail || !transactionId || amount == null) {
      return NextResponse.json({
        status: false,
        message: "Incomplete payment data from Paystack",
      });
    }

    const result = await markPaystackOrderAsPaid(orderId, {
      id: transactionId.toString(),
      status: "success",
      email_address: customerEmail,
      pricePaid: amount.toString(),
      paymentReference: reference,
      paymentDetails: data.data,
      paymentChannel: data.data.channel,
      paymentAuthorization: data.data.authorization,
      paymentFees: data.data.fees,
      paidAt: paidAt ? new Date(paidAt) : undefined,
    });

    if (!result.success) {
      return NextResponse.json({
        status: false,
        message: result.message,
      });
    }

    return NextResponse.json({ status: true, data: data.data });
  } catch {
    return NextResponse.json({
      status: false,
      message: "Verification failed",
    });
  }
}
