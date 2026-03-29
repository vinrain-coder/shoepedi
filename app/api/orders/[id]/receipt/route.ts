import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/get-session";
import { getOrderById } from "@/lib/actions/order.actions";
import { buildOrderReceiptPdf } from "@/lib/order-receipt-pdf";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return NextResponse.json({ message: "Order not found" }, { status: 404 });
  }

  const pdfBuffer = buildOrderReceiptPdf(order);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=order-${order._id}.pdf`,
      "Cache-Control": "no-store",
    },
  });
}
