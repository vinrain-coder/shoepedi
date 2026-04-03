import PDFDocument from "pdfkit";
import fetch from "node-fetch"; // for Node <18, else use native fetch
import { SerializedOrder } from "@/lib/actions/order.actions";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getSetting } from "./actions/setting.actions";

export async function buildOrderReceiptPdf(order: SerializedOrder): Promise<Buffer> {
  const { site } = await getSetting();
  const doc = new PDFDocument({ size: "A4", margin: 50 });

  const buffers: Buffer[] = [];

  return new Promise(async (resolve, reject) => {
    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // --- LOGO ---
    try {
      if (site.logo && site.logo.startsWith("http")) {
        const res = await fetch(site.logo);
        const logoBuffer = Buffer.from(await res.arrayBuffer());
        doc.image(logoBuffer, 50, 45, { width: 100 });
      } else if (site.logo) {
        doc.image(site.logo, 50, 45, { width: 100 });
      }
    } catch (err) {
      console.warn("Logo not found, skipping image", err);
    }

    // --- HEADER ---
    doc
      .fontSize(20)
      .fillColor("#333333")
      .text("SHOESTAR RECEIPT", 0, 50, { align: "center" })
      .moveDown(2);

    // --- ORDER INFO ---
    const createdAt = formatDateTime(order.createdAt).dateTime;
    const paidAt = order.paidAt ? formatDateTime(order.paidAt).dateTime : "Not paid";
    const deliveredAt = order.deliveredAt ? formatDateTime(order.deliveredAt).dateTime : "Not delivered";

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
    doc.text(`${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.province}`);
    doc.text(`${order.shippingAddress.postalCode}, ${order.shippingAddress.country}`);
    doc.moveDown();

    doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor("#aaaaaa").stroke();
    doc.moveDown();

    // --- ITEMS TABLE ---
    doc.fontSize(12).fillColor("#333333").text("ITEMS", { underline: true });
    doc.moveDown(0.5);

    const tableX = { name: 50, size: 250, color: 300, qty: 360, price: 420, total: 480 };

    doc.font("Helvetica-Bold");
    doc.text("Name", tableX.name, doc.y);
    doc.text("Size", tableX.size, doc.y);
    doc.text("Color", tableX.color, doc.y);
    doc.text("Qty", tableX.qty, doc.y);
    doc.text("Price", tableX.price, doc.y);
    doc.text("Total", tableX.total, doc.y);
    doc.moveDown(0.5);
    doc.font("Helvetica");

    order.items.forEach((item) => {
      if (doc.y > 750) doc.addPage(); // automatic page break

      doc.text(item.name, tableX.name, doc.y);
      doc.text(item.size || "-", tableX.size, doc.y);
      doc.text(item.color || "-", tableX.color, doc.y);
      doc.text(item.quantity.toString(), tableX.qty, doc.y);
      doc.text(formatCurrency(item.price), tableX.price, doc.y);
      doc.text(formatCurrency(item.price * item.quantity), tableX.total, doc.y);
      doc.moveDown(0.5);
    });

    doc.moveDown(1);

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
  });
}
