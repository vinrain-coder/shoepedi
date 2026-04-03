import PDFDocument from "pdfkit";
import fs from "fs";
import { SerializedOrder } from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime } from "@/lib/utils";

export function buildOrderReceiptPdf(order: SerializedOrder): Buffer {
  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const buffers: Buffer[] = [];
  doc.on("data", buffers.push.bind(buffers));

  // --- HEADER WITH LOGO ---
  const logoPath = "public/logo.png"; // Replace with your logo path
  try {
    doc.image(logoPath, 50, 45, { width: 100 });
  } catch (err) {
    console.warn("Logo not found, skipping image");
  }

  doc
    .fillColor("#333333")
    .fontSize(20)
    .text("SHOE PEDI RECEIPT", 0, 50, { align: "center" })
    .moveDown(2);

  // --- ORDER INFO ---
  const createdAt = formatDateTime(order.createdAt).dateTime;
  const paidAt = order.paidAt ? formatDateTime(order.paidAt).dateTime : "Not paid";
  const deliveredAt = order.deliveredAt
    ? formatDateTime(order.deliveredAt).dateTime
    : "Not delivered";

  doc.fontSize(12).fillColor("#000000");
  doc.text(`Order ID: ${order._id}`);
  doc.text(`Created: ${createdAt}`);
  doc.text(`Payment method: ${order.paymentMethod}`);
  doc.text(`Paid: ${paidAt}`);
  doc.text(`Delivered: ${deliveredAt}`);
  doc.moveDown();

  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#aaaaaa").stroke();
  doc.moveDown();

  // --- CUSTOMER INFO ---
  doc.fontSize(12).fillColor("#333333").text("CUSTOMER", { underline: true });
  doc.text(`${order.shippingAddress.fullName} (${order.shippingAddress.phone})`);
  doc.text(
    `${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.province}`
  );
  doc.text(`${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`);
  doc.moveDown();

  doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#aaaaaa").stroke();
  doc.moveDown();

  // --- ITEMS TABLE ---
  doc.fontSize(12).fillColor("#333333").text("ITEMS", { underline: true });
  const tableTop = doc.y + 5;

  const itemX = {
    name: 50,
    size: 250,
    color: 300,
    qty: 360,
    price: 420,
    total: 480,
  };

  doc.font("Helvetica-Bold");
  doc.text("Name", itemX.name, tableTop);
  doc.text("Size", itemX.size, tableTop);
  doc.text("Color", itemX.color, tableTop);
  doc.text("Qty", itemX.qty, tableTop);
  doc.text("Price", itemX.price, tableTop);
  doc.text("Total", itemX.total, tableTop);
  doc.moveDown();

  doc.font("Helvetica");
  order.items.forEach((item, i) => {
    const y = tableTop + 20 + i * 20;
    doc.text(item.name, itemX.name, y);
    doc.text(item.size || "-", itemX.size, y);
    doc.text(item.color || "-", itemX.color, y);
    doc.text(item.quantity.toString(), itemX.qty, y);
    doc.text(formatCurrency(item.price), itemX.price, y);
    doc.text(formatCurrency(item.price * item.quantity), itemX.total, y);
  });

  doc.moveDown(2);

  // --- TOTALS ---
  const money = (value: number) => formatCurrency(value).padStart(14, " ");
  doc.text(`Items subtotal: ${money(order.itemsPrice)}`);
  doc.text(`Shipping: ${money(order.shippingPrice)}`);
  doc.text(`Tax: ${money(order.taxPrice)}`);
  if (order.coupon) {
    doc.text(`Coupon (${order.coupon.code}): ${money(-Math.abs(order.coupon.discountAmount))}`);
  }
  doc.font("Helvetica-Bold").text(`TOTAL: ${money(order.totalPrice)}`);
  doc.font("Helvetica").moveDown();

  // --- PAYMENT DETAILS ---
  if (order.paymentResult) {
    doc.moveDown();
    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#aaaaaa").stroke();
    doc.moveDown();
    doc.fontSize(12).fillColor("#333333").text("PAYMENT DETAILS", { underline: true });
    doc.text(`Gateway: ${order.paymentResult.gateway ?? "Paystack"}`);
    doc.text(`Status: ${order.paymentResult.status ?? "-"}`);
    doc.text(`Reference: ${order.paymentResult.paymentReference ?? "-"}`);
    doc.text(`Transaction ID: ${order.paymentResult.id ?? "-"}`);
    doc.text(`Channel: ${order.paymentResult.channel ?? "-"}`);
    doc.text(`Amount paid: ${order.paymentResult.pricePaid ?? "-"}`);
    doc.text(`Currency: ${order.paymentResult.currency ?? "-"}`);
    if (order.paymentResult.authorization?.last4) {
      doc.text(
        `Card: **** ${order.paymentResult.authorization.last4} (${order.paymentResult.authorization.brand ?? ""})`.trim()
      );
    }
  }

  doc.end();
  return Buffer.concat(buffers);
              }
