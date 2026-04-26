import { SerializedOrder } from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime } from "@/lib/utils";

/** Escape PDF special characters */
const escapePdf = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

/** Draw a single line of text in PDF */
const drawTextLine = (text: string, y: number, size = 11) =>
  `BT /F1 ${size} Tf 50 ${y} Td (${escapePdf(text)}) Tj ET`;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** Build an order receipt PDF */
export function buildOrderReceiptPdf(order: SerializedOrder): Buffer {
  const createdAt = formatDateTime(order.createdAt).dateTime;
  const paidAt = order.paidAt ? formatDateTime(order.paidAt).dateTime : "Not paid";
  const deliveredAt = order.deliveredAt
    ? formatDateTime(order.deliveredAt).dateTime
    : "Not delivered";

  const money = (value: number) => formatCurrency(value).padStart(14, " ");
  const paymentResult = isRecord(order.paymentResult)
    ? order.paymentResult
    : undefined;
  const authorization =
    paymentResult && isRecord(paymentResult.authorization)
      ? paymentResult.authorization
      : undefined;
  const paymentGateway =
    typeof paymentResult?.gateway === "string" ? paymentResult.gateway : "Paystack";
  const paymentStatus =
    typeof paymentResult?.status === "string" ? paymentResult.status : "-";
  const paymentReference =
    typeof paymentResult?.paymentReference === "string"
      ? paymentResult.paymentReference
      : "-";
  const transactionId =
    typeof paymentResult?.id === "string" ? paymentResult.id : "-";
  const channel =
    typeof paymentResult?.channel === "string" ? paymentResult.channel : "-";
  const amountPaid =
    typeof paymentResult?.pricePaid === "string" ? paymentResult.pricePaid : "-";
  const currency =
    typeof paymentResult?.currency === "string" ? paymentResult.currency : "-";
  const cardLast4 =
    typeof authorization?.last4 === "string" ? authorization.last4 : undefined;
  const cardBrand =
    typeof authorization?.brand === "string" ? authorization.brand : "";

  // Lines to render in PDF
  const lines: string[] = [
    "===================== SHOE PEDI RECEIPT =====================",
    `Order ID: ${order._id}`,
    `Created: ${createdAt}`,
    `Payment method: ${order.paymentMethod}`,
    `Paid: ${paidAt}`,
    `Delivered: ${deliveredAt}`,
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
      ? [`Coupon (${order.coupon.code}):${money(-Math.abs(order.coupon.discountAmount))}`]
      : []),
    `TOTAL:${money(order.totalPrice)}`,
  ];

  // Payment details
  if (paymentResult) {
    lines.push(
      "",
      "-------------------------------------------------------------",
      "PAYMENT DETAILS",
      `Gateway: ${paymentGateway}`,
      `Status: ${paymentStatus}`,
      `Reference: ${paymentReference}`,
      `Transaction ID: ${transactionId}`,
      `Channel: ${channel}`,
      `Amount paid: ${amountPaid}`,
      `Currency: ${currency}`
    );

    if (cardLast4) {
      lines.push(
        `Card: **** ${cardLast4} (${cardBrand})`.trim()
      );
    }
  }

  // Render lines to PDF content
  let y = 790; // start from top
  const content = lines
    .flatMap((line) => {
      if (!line.trim()) {
        y -= 10; // add spacing for empty lines
        return [];
      }
      const size = line.includes("SHOE PEDI RECEIPT") ? 14 : 11;
      const cmd = drawTextLine(line, y, size);
      y -= 16; // line height
      return [cmd];
    })
    .join("\n");

  const stream = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;

  // PDF objects
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>",
    stream,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  // Build PDF
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  objects.forEach((obj, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let i = 1; i <= objects.length; i++) {
    pdf += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "binary");
}
