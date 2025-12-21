import { sendEmail } from "./send";
import AskReviewOrderItemsEmail from "./templates/transactional/ask-review-order-items";
import StockSubscriptionNotificationEmail from "./templates/transactional/stock-subscription";
import { IOrder } from "@/lib/db/models/order.model";
import { IProduct } from "@/lib/db/models/product.model";
import { getSetting } from "@/lib/actions/setting.actions";

export const sendPurchaseReceipt = async (order: IOrder) => {
  await sendEmail({
    to: (order.user as { email: string }).email,
    subject: "Order Confirmation",
    react: <PurchaseReceiptEmail order={order} />,
  });
};

export const sendAskReviewOrderItems = async (order: IOrder) => {
  const oneDayFromNow = new Date(
    Date.now() + 1000 * 60 * 60 * 24
  ).toISOString();

  await sendEmail({
    to: (order.user as { email: string }).email,
    subject: "Review your order items",
    react: <AskReviewOrderItemsEmail order={order} />,
    scheduledAt: oneDayFromNow,
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
      />
    ),
  });
};
