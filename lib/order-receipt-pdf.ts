import { SerializedOrder } from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const escapePdf = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const drawTextLine = (text: string, y: number, size = 11) =>
  `BT /F1 ${size} Tf 50 ${y} Td (${escapePdf(text)}) Tj ET`;

export function buildOrderReceiptPdf(order: SerializedOrder): Buffer {
  const createdAt = formatDateTime(order.createdAt).dateTime;
  const paidAt = order.paidAt
    ? formatDateTime(order.paidAt).dateTime
    : "Not paid";
  const deliveredAt = order.deliveredAt
    ? formatDateTime(order.deliveredAt).dateTime
    : "Not delivered";

  const money = (value: number) => formatCurrency(value).padStart(14, " ");

  const lines: string[] = [
    "===================== SHOE PEDI RECEIPT =====================",
    `Order ID: ${order._id}`,
    `Created: ${createdAt}`,
    `Payment method: ${order.paymentMethod}`,
    `Paid: ${paidAt}`,
    `Delivered: ${deliveredAt}`,
    `Tracking number: ${order.trackingNumber}`,
    "-------------------------------------------------------------",
    "CUSTOMER",
    `${order.shippingAddress.fullName} (${order.shippingAddress.phone})`,
    `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.province}`,
    `${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`,
    "-------------------------------------------------------------",
    "ITEMS",
    ...order.items.map(
      (item) =>
        `- ${item.name} ${item.size ? `[${item.size}]` : ""} ${
          item.color ? `[${item.color}]` : ""
        } x${item.quantity} = ${formatCurrency(item.price * item.quantity)}`
    ),
    "-------------------------------------------------------------",
    `Items subtotal:${money(order.itemsPrice)}`,
    `Shipping:${money(order.shippingPrice)}`,
    `Tax:${money(order.taxPrice)}`,
    ...(order.coupon
      ? [
          `Coupon (${order.coupon.code}):${money(
            -Math.abs(order.coupon.discountAmount)
          )}`,
        ]
      : []),
    `TOTAL:${money(order.totalPrice)}`,
  ];

  if (order.paymentResult) {
    lines.push(
      "",
      "-------------------------------------------------------------",
      "PAYMENT DETAILS",
      `Gateway: ${order.paymentResult.gateway ?? "Paystack"}`,
      `Status: ${order.paymentResult.status ?? "-"}`,
      `Reference: ${order.paymentResult.paymentReference ?? "-"}`,
      `Transaction ID: ${order.paymentResult.id ?? "-"}`,
      `Channel: ${order.paymentResult.channel ?? "-"}`,
      `Amount paid: ${order.paymentResult.pricePaid ?? "-"}`,
      `Currency: ${order.paymentResult.currency ?? "-"}`
    );

    if (order.paymentResult.authorization?.last4) {
      lines.push(
        `Card: **** ${order.paymentResult.authorization.last4} (${
          order.paymentResult.authorization.brand ?? ""
        })`.trim()
      );
    }
  }

  let y = 790;
  const content = lines
    .flatMap((line) => {
      if (line === "") {
        y -= 10;
        return [];
      }
      const cmd = drawTextLine(
        line,
        y,
        line.startsWith("Order Receipt") ? 14 : 11
      );
      y -= 16;
      return [cmd];
    })
    .join("\n");

  const stream = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;

  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    stream,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  objects.forEach((obj, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${
    objects.length + 1
  } /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "binary");
}
