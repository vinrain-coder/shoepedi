import { connection } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { getOrderByTrackingNumber } from "@/lib/server/actions/order.actions";
import { hitTrackingLookupLimit } from "@/lib/tracking-rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ trackingNumber: string }> },
) {
  await connection();
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "anonymous";
  const limit = hitTrackingLookupLimit(ip);

  if (!limit.allowed) {
    return NextResponse.json(
      { message: "Too many tracking requests. Please retry shortly." },
      {
        status: 429,
        headers: {
          "Retry-After": String(limit.retryAfterSeconds),
        },
      },
    );
  }

  const { trackingNumber } = await params;
  const normalizedTrackingNumber = decodeURIComponent(trackingNumber)
    .trim()
    .toUpperCase();

  if (!/^TRK-[A-Z0-9-]{8,40}$/.test(normalizedTrackingNumber)) {
    return NextResponse.json({ message: "Invalid tracking number." }, { status: 400 });
  }

  const order = await getOrderByTrackingNumber(normalizedTrackingNumber);
  if (!order) {
    return NextResponse.json({ message: "Tracking number not found." }, { status: 404 });
  }

  const sanitized = {
    ...order,
    shippingAddress: {
      fullName: order.shippingAddress?.fullName,
      city: order.shippingAddress?.city,
      country: order.shippingAddress?.country,
      street: "Hidden for privacy",
    },
  };

  return NextResponse.json({
    data: sanitized,
    now: new Date().toISOString(),
  });
}
