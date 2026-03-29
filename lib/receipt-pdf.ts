import { SerializedOrder } from "./actions/order.actions";

const escapePdfText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

export const generateReceiptPdf = (order: SerializedOrder) => {
  const lines = [
    `Receipt - Order ${order._id}`,
    `Payment status: ${order.paymentStatus ?? (order.isPaid ? "paid" : "pending")}`,
    `Payment reference: ${order.paymentReference ?? "N/A"}`,
    `Payment channel: ${order.paymentChannel ?? "N/A"}`,
    `Paid at: ${order.paidAt ?? "N/A"}`,
    `Total: ${order.totalPrice}`,
    "",
    "Items:",
    ...order.items.map(
      (item) => `${item.name} x${item.quantity} - ${item.price * item.quantity}`,
    ),
  ];

  const textCommands = lines
    .map((line, index) => `1 0 0 1 50 ${780 - index * 18} Tm (${escapePdfText(line)}) Tj`)
    .join("\n");

  const stream = `BT\n/F1 11 Tf\n${textCommands}\nET`;
  const objects = [
    "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj",
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj",
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj",
    "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj",
    `5 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (const object of objects) {
    offsets.push(pdf.length);
    pdf += `${object}\n`;
  }
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) {
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "utf-8");
};
