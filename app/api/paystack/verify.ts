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

    // Validate required fields
    if (!data?.status || data.data.status !== "success") {
      return NextResponse.json({
        status: false,
        message: "Payment not successful",
      });
    }

    const customerEmail = data.data.customer?.email;
    const transactionId = data.data.id;
    const amount = data.data.amount;
    const gatewayPaidAt = data.data.paid_at
      ? new Date(data.data.paid_at)
      : undefined;

    if (!customerEmail || !transactionId || amount == null) {
      return NextResponse.json({
        status: false,
        message: "Incomplete payment data from Paystack",
      });
    }

    // mark order as paid in DB
    await markPaystackOrderAsPaid(orderId, {
      id: transactionId,
      status: "success",
      email_address: customerEmail,
      pricePaid: amount.toString(),
      paymentMethod: "Mobile Money (M-Pesa / Airtel) & Card",
      paymentReference: reference,
      gateway: "paystack",
      currency: data.data.currency,
      channel: data.data.channel,
      paidAtGateway: gatewayPaidAt,
      authorization: data.data.authorization
        ? {
            card_type: data.data.authorization.card_type,
            bank: data.data.authorization.bank,
            brand: data.data.authorization.brand,
            last4: data.data.authorization.last4,
            exp_month: data.data.authorization.exp_month,
            exp_year: data.data.authorization.exp_year,
          }
        : undefined,
    });

    return NextResponse.json({ status: true, data: data.data });
  } catch (err) {
    return NextResponse.json({ status: false, message: "Verification failed" });
  }
}
