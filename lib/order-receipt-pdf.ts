import PDFDocument from "pdfkit";
import fetch from "node-fetch"; // if Node <18
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
      if (site.logo.startsWith("http")) {
        const res = await fetch(site.logo);
        const logoBuffer = Buffer.from(await res.arrayBuffer());
        doc.image(logoBuffer, 50, 45, { width: 100 });
      } else {
        doc.image(site.logo, 50, 45, { width: 100 });
      }
    } catch (err) {
      console.warn("Logo not found, skipping image", err);
    }

    doc.fontSize(20).fillColor("#333333").text("SHOESTAR RECEIPT", 0, 50, { align: "center" }).moveDown(2);

    // --- rest of your PDF content ---
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

    // ... customer info, items table, totals, payment details ...

    doc.end();
  });
                  }
