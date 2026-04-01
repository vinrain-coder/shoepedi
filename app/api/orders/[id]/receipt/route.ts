import { NextResponse } from "next/server";
import { connection } from "@/lib/db/client"; // runtime-safe MongoDB connection
import { getServerSession } from "@/lib/get-session";
import { getOrderById } from "@/lib/actions/order.actions";
import { buildOrderReceiptPdf } from "@/lib/order-receipt-pdf";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Connect to MongoDB at runtime
  await connection();

  // Check user session
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // Get order ID from route params
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  // Generate PDF
  const pdfBuffer = buildOrderReceiptPdf(order);

  // Return PDF as response
  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=order-${order._id}.pdf`,
      "Cache-Control": "no-store",
    },
  });
}
