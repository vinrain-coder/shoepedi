// app/api/paystack/verify/route.ts
import { NextResponse } from "next/server";
import Order from "@/lib/db/models/order.model";
import { connectToDatabase } from "@/lib/db";

export async function POST(req: Request) {
  const { reference, orderId } = await req.json();

  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  const data = await response.json();

  if (data.status && data.data.status === "success") {
    await connectToDatabase();
    await Order.findByIdAndUpdate(orderId, {
      isPaid: true,
      paidAt: new Date(),
    });
  }

  return NextResponse.json(data);
}
