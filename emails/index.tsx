import { Resend } from "resend";
import PurchaseReceiptEmail from "./purchase-receipt";
import AskReviewOrderItemsEmail from "./ask-review-order-items";
import StockSubscriptionNotificationEmail from "./stock-subscription";
import { IOrder } from "@/lib/db/models/order.model";
import { IProduct } from "@/lib/db/models/product.model";
import { SENDER_EMAIL, SENDER_NAME } from "@/lib/constants";
import { getSetting } from "@/lib/actions/setting.actions";
import PasswordResetEmail from "./reset-password";
import AdminEventNotificationEmail from "./admin-event-notification";
import { buildOrderReceiptPdf } from "@/lib/order-receipt-pdf";

const resend = new Resend(process.env.RESEND_API_KEY as string);

const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS ?? "")
    .split(/[;,]/)
    .map((email) => email.trim())
    .filter(Boolean);

export const sendAdminEventNotification = async ({
  title,
  description,
  href,
  meta,
  createdAt = new Date().toISOString(),
}: {
  title: string;
  description: string;
  href: string;
  meta?: string;
  createdAt?: string;
}) => {
  const adminEmails = [...new Set(getAdminEmails())];

  if (adminEmails.length === 0) {
    return { success: true, message: "No admin recipients configured." };
  }

  const { site } = await getSetting();
  const subject = `[Admin Alert] ${title}`;

  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: adminEmails,
    subject,
    react: (
      <AdminEventNotificationEmail
        title={title}
        description={description}
        href={href}
        meta={meta}
        createdAt={createdAt}
        siteName={site.name}
        siteUrl={site.url}
      />
    ),
  });

  console.log(`✅ Admin event email sent to ${adminEmails.join(", ")} for "${title}"`);

  return { success: true, message: "Admin event email sent successfully" };
};

export const sendPurchaseReceipt = async ({ order }: { order: IOrder }) => {
  const serializedOrder = JSON.parse(JSON.stringify(order));
  const receiptPdf = buildOrderReceiptPdf(serializedOrder);
  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: "Purchase Receipt",
    react: <PurchaseReceiptEmail order={order} />,
    attachments: [
      {
        filename: `order-${order._id.toString()}.pdf`,
        content: receiptPdf,
      },
    ],
  });
};

export const sendAskReviewOrderItems = async ({ order }: { order: IOrder }) => {
  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: "Review your order items",
    react: <AskReviewOrderItemsEmail order={order} />,
  });
};

export const sendStockSubscriptionNotification = async ({
  email,
  product,
}: {
  email: string;
  product: IProduct;
}) => {
  const { site } = await getSetting();

  if (!product) {
    return { success: false, message: "Product not found." };
  }

  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: email,
    subject: `🔔 "${product.name}" is back in stock!`,
    react: (
      <StockSubscriptionNotificationEmail
        product={product}
        email={email}
        siteUrl={site.url}
        siteName={site.name}
        siteCopyright={site.copyright}
      />
    ),
  });

  console.log(
    `✅ Stock notification email sent to ${email} for "${product.name}"`
  );

  return {
    success: true,
    message: "Stock subscription email sent successfully",
  };
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const { site } = await getSetting();

  const resetLink = `${site.url}/reset-password?token=${token}`;

  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: email,
    subject: "🔑 Reset Your Password",
    react: (
      <PasswordResetEmail
        resetLink={resetLink}
        siteName={site.name}
        siteUrl={site.url}
        siteCopyright={site.copyright}
        siteLogo={site.logo}
      />
    ),
  });

  console.log(`✅ Password reset email sent to ${email}`);

  return { success: true, message: "Password reset email sent successfully" };
};
