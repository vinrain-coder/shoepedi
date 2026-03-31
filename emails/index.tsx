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
import { getAdminSmsRecipients, sendAfricasTalkingSms } from "@/lib/sms/africas-talking";

const resend = new Resend(process.env.RESEND_API_KEY as string);


const toAdminSmsMessage = ({
  title,
  description,
  href,
  siteUrl,
}: {
  title: string;
  description: string;
  href: string;
  siteUrl: string;
}) => {
  const absoluteHref = href.startsWith("http") ? href : `${siteUrl}${href}`;
  return `Admin Alert: ${title}. ${description} View: ${absoluteHref}`;
};

const toUserSmsMessage = ({
  message,
  siteName,
}: {
  message: string;
  siteName: string;
}) => `${siteName}: ${message}`;


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

  const { site } = await getSetting();
  const subject = `[Admin Alert] ${title}`;

  if (adminEmails.length > 0) {
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
  }

  const adminSmsRecipients = await getAdminSmsRecipients();
  if (adminSmsRecipients.length) {
    await sendAfricasTalkingSms({
      to: adminSmsRecipients,
      message: toAdminSmsMessage({
        title,
        description,
        href,
        siteUrl: site.url,
      }),
    });
  }

  console.log(`✅ Admin event notification dispatched for "${title}"`);

  if (adminEmails.length === 0 && adminSmsRecipients.length === 0) {
    return { success: true, message: "No admin notification recipients configured." };
  }

  return { success: true, message: "Admin event notification sent successfully" };
};

export const sendPurchaseReceipt = async ({ order }: { order: IOrder }) => {
  const serializedOrder = JSON.parse(JSON.stringify(order));
  const receiptPdf = buildOrderReceiptPdf(serializedOrder);
  const { site } = await getSetting();
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

  const phone = order.shippingAddress?.phone;
  if (phone) {
    await sendAfricasTalkingSms({
      to: phone,
      message: toUserSmsMessage({
        siteName: site.name,
        message: `Payment received for order #${order._id.toString().slice(-6).toUpperCase()}. Receipt sent to your email.`,
      }),
    });
  }
};

export const sendAskReviewOrderItems = async ({ order }: { order: IOrder }) => {
  const { site } = await getSetting();
  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: "Review your order items",
    react: <AskReviewOrderItemsEmail order={order} />,
  });

  const phone = order.shippingAddress?.phone;
  if (phone) {
    await sendAfricasTalkingSms({
      to: phone,
      message: toUserSmsMessage({
        siteName: site.name,
        message: `Your order #${order._id.toString().slice(-6).toUpperCase()} was delivered. Please check your email to review your items.`,
      }),
    });
  }
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
