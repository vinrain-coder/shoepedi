import { sendEmail } from "./send";
import AskReviewOrderItemsEmail from "./templates/transactional/ask-review-order-items";
import StockSubscriptionNotificationEmail from "./templates/transactional/stock-subscription";
import { IOrder } from "@/lib/db/models/order.model";
import { IProduct } from "@/lib/db/models/product.model";
import { getSetting } from "@/lib/actions/setting.actions";
import PurchaseReceiptEmail from "./templates/transactional/purchase-receipt";
import { buildOrderReceiptPdf } from "@/lib/order-receipt-pdf";
import type { SerializedOrder } from "@/lib/actions/order.actions";

export const sendPurchaseReceipt = async (order: IOrder) => {
  const serializedOrder = JSON.parse(
    JSON.stringify(order),
  ) as unknown as SerializedOrder;
  const pdf = buildOrderReceiptPdf(serializedOrder);
  await sendEmail({
    to: (order.user as { email: string }).email,
    subject: "Purchase Receipt",
    react: <PurchaseReceiptEmail order={order} />,
    attachments: [
      {
        filename: `order-${order._id.toString()}.pdf`,
        content: pdf,
      },
    ],
  });
};

export const sendAskReviewOrderItems = async (order: IOrder) => {
  await sendEmail({
    to: (order.user as { email: string }).email,
    subject: "Review your order items",
    react: <AskReviewOrderItemsEmail order={order} />,
  });
};

export const sendStockSubscriptionNotification = async (
  email: string,
  product: IProduct
) => {
  const { site } = await getSetting();

  await sendEmail({
    to: email,
    subject: `🔔 "${product.name}" is back in stock!`,
    react: (
      <StockSubscriptionNotificationEmail
        product={product}
        siteUrl={site.url}
        siteName={site.name}
        siteCopyright={site.copyright}
        email=""
      />
    ),
  });
};
