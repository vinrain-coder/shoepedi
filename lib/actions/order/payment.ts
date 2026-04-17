"use server";

import { formatError } from "../../utils";
import { processOrderPayment } from "./helpers";

export async function updateOrderToPaid(orderId: string) {
  try {
    return await processOrderPayment(orderId);
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}

export async function markPaystackOrderAsPaid(
  orderId: string,
  paymentInfo: {
    id: string;
    status: string;
    email_address: string;
    pricePaid: string;
    paymentMethod?: string;
    paymentReference?: string;
    gateway?: string;
    currency?: string;
    paidAtGateway?: Date;
    channel?: string;
    authorization?: {
      card_type?: string;
      bank?: string;
      brand?: string;
      last4?: string;
      exp_month?: string;
      exp_year?: string;
    };
  },
) {
  try {
    if (
      !paymentInfo.id ||
      !paymentInfo.email_address ||
      !paymentInfo.pricePaid
    ) {
      throw new Error("Missing required payment information");
    }

    return await processOrderPayment(orderId, paymentInfo);
  } catch (err) {
    return { success: false, message: formatError(err) };
  }
}
