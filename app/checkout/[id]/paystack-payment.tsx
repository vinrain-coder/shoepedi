"use client";
import { useState } from "react";
import { PaystackButton } from "react-paystack";

export default function PaystackCheckout({ email, amount }: { email: string; amount: number }) {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!; // put in .env

  const [metadata] = useState({
    custom_fields: [
      {
        display_name: "Paid Via",
        variable_name: "paid_via",
        value: "Next.js Checkout",
      },
    ],
  });

  const componentProps = {
    email,
    amount: amount * 100, // Paystack uses kobo
    metadata,
    publicKey,
    text: "Pay Now",
    onSuccess: (response: any) => {
      console.log("Payment Success:", response);
      // ✅ send reference to backend to verify and save order
    },
    onClose: () => alert("Payment window closed."),
  };

  return <PaystackButton {...componentProps} className="px-4 py-2 bg-green-600 text-white rounded" />;
}
