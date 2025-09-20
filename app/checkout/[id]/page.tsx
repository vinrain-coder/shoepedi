import { notFound } from "next/navigation";
import React from "react";

import { getOrderById } from "@/lib/actions/order.actions";
import PaymentForm from "./payment-form";
import { getServerSession } from "@/lib/get-session";

export const metadata = {
  title: "Payment",
};

const CheckoutPaymentPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const params = await props.params;

  const { id } = params;

  const order = await getOrderById(id);
  if (!order) notFound();

  const session = await getServerSession();

  let paystackPublicKey = null;
  if (order.paymentMethod === "Paystack" && !order.isPaid) {
    paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
  }

  return (
    <PaymentForm
      order={order}
      paystackPublicKey={paystackPublicKey}
      isAdmin={session?.user?.role === "ADMIN" || false}
    />
  );
};

export default CheckoutPaymentPage;
