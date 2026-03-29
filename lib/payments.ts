export const PAYSTACK_PAYMENT_METHOD_LABEL =
  "Mobile Money (M-Pesa / Airtel) & Card";

export const isPaystackMethod = (paymentMethod?: string | null) => {
  if (!paymentMethod) return false;
  const normalized = paymentMethod.toLowerCase();
  return (
    normalized.includes("card") ||
    normalized.includes("mobile money") ||
    normalized.includes("paystack")
  );
};

export const buildOrderPaymentReference = (orderId: string) =>
  `order-${orderId}`;
