import { sendEmail } from "./send";
import AskReviewOrderItemsEmail from "./templates/transactional/ask-review-order-items";
import StockSubscriptionNotificationEmail from "./templates/transactional/stock-subscription";
import { IOrder } from "@/lib/db/models/order.model";
import { IProduct } from "@/lib/db/models/product.model";
import { getSetting } from "@/lib/actions/setting.actions";
import PurchaseReceiptEmail from "./templates/transactional/purchase-receipt";
import { buildOrderReceiptPdf } from "@/lib/order-receipt-pdf";
import type { SerializedOrder } from "@/lib/actions/order.actions";
import AdminEventNotificationEmail from "./templates/transactional/admin-event-notification";
import { getAdminSmsRecipients, sendAfricasTalkingSms } from "../sms/africas-talking";
import { SENDER_EMAIL, SENDER_NAME } from "../constants";
import NewsletterConfirmationEmail from "./templates/transactional/newsletter-confirmation";
import SupportTicketReplyEmail from "./templates/transactional/support-ticket-reply";
import WelcomeNewUserEmail from "./templates/transactional/welcome-new-user";

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

const resolveOrderEmail = (order: IOrder) =>
  order.userEmail || (order.user as { email?: string } | undefined)?.email;

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
    await sendEmail({
      to: adminEmails.join(","),
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
    return {
      success: true,
      message: "No admin notification recipients configured.",
    };
  }

  return {
    success: true,
    message: "Admin event notification sent successfully",
  };
};

export const sendPurchaseReceipt = async (order: IOrder) => {
  const userEmail = resolveOrderEmail(order);
  if (!userEmail) {
    console.error(`Cannot send purchase receipt for order ${order._id}: User email not found`);
    return;
  }

  const serializedOrder = JSON.parse(
    JSON.stringify(order),
  ) as unknown as SerializedOrder;
  const pdf = buildOrderReceiptPdf(serializedOrder);
  await sendEmail({
    to: userEmail,
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
  const userEmail = resolveOrderEmail(order);
  if (!userEmail) {
    console.error(`Cannot send review request for order ${order._id}: User email not found`);
    return;
  }

  await sendEmail({
    to: userEmail,
    subject: "Review your order items",
    react: <AskReviewOrderItemsEmail order={order} />,
  });
};

export const sendStockSubscriptionNotification = async (
  email: string,
  product: IProduct,
  unsubscribeToken: string,
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
        unsubscribeToken={unsubscribeToken}
      />
    ),
  });
};

export const sendNewsletterConfirmationEmail = async ({
  email,
  unsubscribeLink,
}: {
  email: string;
  unsubscribeLink: string;
}) => {
  const { site } = await getSetting();

  await sendEmail({
    to: email,
    subject: `Welcome to the ${site.name} Newsletter! 🎉`,
    react: (
      <NewsletterConfirmationEmail
        email={email}
        unsubscribeLink={unsubscribeLink}
        siteName={site.name}
        siteUrl={site.url}
        siteCopyright={site.copyright}
      />
    ),
  });

  console.log(`✅ Newsletter confirmation email sent to ${email}`);

  return {
    success: true,
    message: "Newsletter confirmation email sent successfully",
  };
};


export const sendWelcomeNewUserEmail = async ({
  email,
  name,
}: {
  email: string;
  name?: string | null;
}) => {
  const { site, common } = await getSetting();

  await sendEmail({
    to: email,
    subject: `Welcome to ${site.name}!`,
    react: (
      <WelcomeNewUserEmail
        name={name}
        siteName={site.name}
        siteUrl={site.url}
        siteCopyright={site.copyright}
        firstPurchaseDiscountRate={common.firstPurchaseDiscountRate}
      />
    ),
  });

  console.log(`✅ Welcome email sent to ${email}`);

  return {
    success: true,
    message: "Welcome email sent successfully",
  };
};

export const sendOrderTrackingNotification = async ({
  order,
  statusLabel,
  statusMessage,
  trackingLink,
}: {
  order: IOrder;
  statusLabel: string;
  statusMessage: string;
  trackingLink: string;
}) => {
  const { site } = await getSetting();
  const email = resolveOrderEmail(order);

  if (email) {
    await sendEmail({
      to: email,
      subject: `Order update: ${statusLabel}`,
      react: (
        <div
          dangerouslySetInnerHTML={{
            __html: `<p>Your order <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong> is now <strong>${statusLabel}</strong>.</p><p>${statusMessage}</p><p>Track your order: <a href="${trackingLink}">${trackingLink}</a></p>`,
          }}
        />
      ),
    });
  }

  const phone = order.shippingAddress?.phone;
  if (phone) {
    await sendAfricasTalkingSms({
      to: phone,
      message: toUserSmsMessage({
        siteName: site.name,
        message: `Order #${order._id.toString().slice(-6).toUpperCase()} is ${statusLabel.toLowerCase()}. Track: ${trackingLink}`,
      }),
    });
  }

  return { success: true };
};

export const sendAffiliateApprovalNotification = async ({
  email,
  name,
  affiliateCode,
  phone,
}: {
  email: string;
  name: string;
  affiliateCode: string;
  phone?: string;
}) => {
  const { site } = await getSetting();

  await sendEmail({
    to: email,
    subject: `Congratulations! Your ${site.name} Affiliate Application is Approved`,
    react: (
      <div
        dangerouslySetInnerHTML={{
          __html: `
      <p>Hello ${name},</p>
      <p>We are excited to inform you that your application to join the <strong>${site.name}</strong> Affiliate Program has been approved!</p>
      <p>Your unique affiliate code is: <strong>${affiliateCode}</strong></p>
      <p>You can now start sharing your code and earning commissions. Log in to your dashboard to track your earnings and manage your profile.</p>
      <p>Dashboard: <a href="${site.url}/affiliate/dashboard">${site.url}/affiliate/dashboard</a></p>
      <p>Best regards,<br/>The ${site.name} Team</p>
    `,
        }}
      />
    ),
  });

  if (phone) {
    await sendAfricasTalkingSms({
      to: phone,
      message: toUserSmsMessage({
        siteName: site.name,
        message: `Congratulations! Your affiliate application was approved. Your code is ${affiliateCode}. Start earning now!`,
      }),
    });
  }

  console.log(`✅ Affiliate approval notification sent to ${email}`);
  return { success: true };
};

export const sendAffiliatePayoutNotification = async ({
  email,
  name,
  amount,
  paymentMethod,
  phone,
}: {
  email: string;
  name: string;
  amount: number;
  paymentMethod: string;
  phone?: string;
}) => {
  const { site } = await getSetting();
  // Using Intl.NumberFormat since formatCurrency might not be available here or might behave differently
  const formattedAmount = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);

  await sendEmail({
    to: email,
    subject: `Payout Processed - ${site.name} Affiliate Program`,
    react: (
      <div
        dangerouslySetInnerHTML={{
          __html: `
      <p>Hello ${name},</p>
      <p>Great news! Your payout of <strong>${formattedAmount}</strong> has been processed via ${paymentMethod}.</p>
      <p>The funds should reflect in your account shortly depending on the payment provider's processing times.</p>
      <p>Thank you for being a valued partner of ${site.name}.</p>
      <p>Best regards,<br/>The ${site.name} Team</p>
    `,
        }}
      />
    ),
  });

  if (phone) {
    await sendAfricasTalkingSms({
      to: phone,
      message: toUserSmsMessage({
        siteName: site.name,
        message: `Your payout of ${formattedAmount} has been processed via ${paymentMethod}. Thank you for being our partner!`,
      }),
    });
  }

  console.log(`✅ Affiliate payout notification sent to ${email}`);
  return { success: true };
};

export const sendAffiliateRejectedNotification = async ({
  email,
  name,
  affiliateCode,
  reason,
  phone,
}: {
  email: string;
  name: string;
  affiliateCode: string;
  reason: string;
  phone?: string;
}) => {
  const { site } = await getSetting();

  await sendEmail({
    to: email,
    subject: `Update on your ${site.name} affiliate application`,
    react: (
      <div
        dangerouslySetInnerHTML={{
          __html: `
      <p>Hello ${name},</p>
      <p>Thank you for applying to the <strong>${site.name}</strong> Affiliate Program.</p>
      <p>At this time, your application for code <strong>${affiliateCode}</strong> was not approved.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>You can update your details and reapply here:</p>
      <p><a href="${site.url}/affiliate/register">${site.url}/affiliate/register</a></p>
      <p>We appreciate your interest and encourage you to submit again.</p>
      <p>Best regards,<br/>The ${site.name} Team</p>
    `,
        }}
      />
    ),
  });

  if (phone) {
    await sendAfricasTalkingSms({
      to: phone,
      message: toUserSmsMessage({
        siteName: site.name,
        message: `Your affiliate application was not approved. Reason: ${reason}. Update details and reapply from your dashboard.`,
      }),
    });
  }

  console.log(`✅ Affiliate rejection notification sent to ${email}`);
  return { success: true };
};

export const sendAffiliateResubmittedNotification = async ({
  email,
  name,
  affiliateCode,
}: {
  email: string;
  name: string;
  affiliateCode: string;
}) => {
  const { site } = await getSetting();

  await sendEmail({
    to: email,
    subject: `Affiliate application resubmitted - ${site.name}`,
    react: (
      <div
        dangerouslySetInnerHTML={{
          __html: `
      <p>Hello ${name},</p>
      <p>Your affiliate application has been successfully resubmitted.</p>
      <p>Application code: <strong>${affiliateCode}</strong></p>
      <p>Our team will review it and notify you when a decision is made.</p>
      <p>Track status: <a href="${site.url}/affiliate/dashboard">${site.url}/affiliate/dashboard</a></p>
      <p>Best regards,<br/>The ${site.name} Team</p>
    `,
        }}
      />
    ),
  });

  console.log(`✅ Affiliate resubmission confirmation sent to ${email}`);
  return { success: true };
};

export const sendWalletPayoutStatusNotification = async ({
  email,
  name,
  amount,
  status,
  paymentMethod,
  adminNote,
  phone,
}: {
  email: string;
  name: string;
  amount: number;
  status: "paid" | "rejected";
  paymentMethod: string;
  adminNote?: string;
  phone?: string;
}) => {
  const { site } = await getSetting();
  const formattedAmount = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(amount);

  const subject = status === "paid"
    ? `Wallet Payout Processed - ${site.name}`
    : `Wallet Payout Rejected - ${site.name}`;

  const messageHtml = status === "paid"
    ? `
      <p>Hello ${name},</p>
      <p>Your wallet payout of <strong>${formattedAmount}</strong> has been successfully processed via ${paymentMethod}.</p>
      ${adminNote ? `<p><strong>Admin Note:</strong> ${adminNote}</p>` : ""}
      <p>Best regards,<br/>The ${site.name} Team</p>
    `
    : `
      <p>Hello ${name},</p>
      <p>Your wallet payout request of <strong>${formattedAmount}</strong> was not approved at this time.</p>
      <p>The funds have been returned to your wallet balance.</p>
      ${adminNote ? `<p><strong>Reason:</strong> ${adminNote}</p>` : ""}
      <p>You can view your wallet history and reapply if necessary: <a href="${site.url}/account/wallet">${site.url}/account/wallet</a></p>
      <p>Best regards,<br/>The ${site.name} Team</p>
    `;

  await sendEmail({
    to: email,
    subject,
    react: <div dangerouslySetInnerHTML={{ __html: messageHtml }} />,
  });

  if (phone) {
    const smsMessage = status === "paid"
      ? `Your wallet payout of ${formattedAmount} via ${paymentMethod} has been processed.`
      : `Your wallet payout of ${formattedAmount} was rejected. Funds returned to your wallet. Reason: ${adminNote || "N/A"}`;

    await sendAfricasTalkingSms({
      to: phone,
      message: toUserSmsMessage({ siteName: site.name, message: smsMessage }),
    });
  }

  console.log(`✅ Wallet payout ${status} notification sent to ${email}`);
  return { success: true };
};

export const sendWalletAdjustmentNotification = async ({
  email,
  name,
  amount,
  reason,
  newBalance,
  phone,
}: {
  email: string;
  name: string;
  amount: number;
  reason: string;
  newBalance: number;
  phone?: string;
}) => {
  const { site } = await getSetting();
  const formattedAmount = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(Math.abs(amount));
  const formattedBalance = new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
  }).format(newBalance);

  const type = amount > 0 ? "credited to" : "deducted from";
  const subject = `Wallet Balance Update - ${site.name}`;

  await sendEmail({
    to: email,
    subject,
    react: (
      <div
        dangerouslySetInnerHTML={{
          __html: `
      <p>Hello ${name},</p>
      <p>Your wallet balance has been updated.</p>
      <p><strong>Amount:</strong> ${formattedAmount} (${type} your wallet)</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>New Balance:</strong> ${formattedBalance}</p>
      <p>Best regards,<br/>The ${site.name} Team</p>
    `,
        }}
      />
    ),
  });

  if (phone) {
    const smsMessage = `Your wallet was ${type} ${formattedAmount}. Reason: ${reason}. New balance: ${formattedBalance}.`;
    await sendAfricasTalkingSms({
      to: phone,
      message: toUserSmsMessage({ siteName: site.name, message: smsMessage }),
    });
  }

  return { success: true };
};

export const sendCoinAdjustmentNotification = async ({
  email,
  name,
  amount,
  reason,
  newBalance,
  phone,
}: {
  email: string;
  name: string;
  amount: number;
  reason: string;
  newBalance: number;
  phone?: string;
}) => {
  const { site } = await getSetting();
  const absAmount = Math.abs(amount);
  const type = amount > 0 ? "credited to" : "deducted from";
  const subject = `Coins Balance Update - ${site.name}`;

  await sendEmail({
    to: email,
    subject,
    react: (
      <div
        dangerouslySetInnerHTML={{
          __html: `
      <p>Hello ${name},</p>
      <p>Your coins balance has been updated.</p>
      <p><strong>Amount:</strong> ${absAmount} coins (${type} your account)</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>New Balance:</strong> ${newBalance} coins</p>
      <p>Best regards,<br/>The ${site.name} Team</p>
    `,
        }}
      />
    ),
  });

  if (phone) {
    const smsMessage = `Your coins balance was ${type} ${absAmount} coins. Reason: ${reason}. New balance: ${newBalance} coins.`;
    await sendAfricasTalkingSms({
      to: phone,
      message: toUserSmsMessage({ siteName: site.name, message: smsMessage }),
    });
  }

  return { success: true };
};

export const sendSupportTicketReplyEmail = async ({
  to,
  customerName,
  subject,
  originalMessage,
  replyMessage,
}: {
  to: string;
  customerName: string;
  subject: string;
  originalMessage: string;
  replyMessage: string;
}) => {
  await sendEmail({
    to,
    subject: `Re: ${subject}`,
    react: (
      <SupportTicketReplyEmail
        customerName={customerName}
        subject={subject}
        originalMessage={originalMessage}
        replyMessage={replyMessage}
      />
    ),
  });
};
