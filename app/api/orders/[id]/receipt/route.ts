import { getOrderById } from "@/lib/actions/order.actions";
import { getServerSession } from "@/lib/get-session";
import { generateReceiptPdf } from "@/lib/receipt-pdf";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
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

  const pdf = generateReceiptPdf(order);

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=receipt-${order._id}.pdf`,
    },
  });
}
