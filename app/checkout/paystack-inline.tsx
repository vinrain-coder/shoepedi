"use client";

import React from "react";

// Tell TypeScript that PaystackPop exists on window
declare global {
  interface Window {
    PaystackPop: any;
  }
}

interface PaystackInlineProps {
  email: string;
  amount: number; // amount in kobo
  publicKey: string;
  orderId: string;
  onSuccessUrl?: string; // redirect after success
  onCancelUrl?: string; // redirect after cancel
}

export function PaystackInline({
  email,
  amount,
  publicKey,
  orderId,
  onSuccessUrl = "/account/orders",
  onCancelUrl = "/account/orders",
}: PaystackInlineProps) {
  // Only run this on the client
  if (typeof window === "undefined") return null;

  const handler = () => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => {
      // Use window.PaystackPop
      const paystackHandler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount,
        ref: "order_" + orderId + "_" + Date.now(),
        onClose: () => {
          window.location.href = onCancelUrl;
        },
        callback: () => {
          window.location.href = onSuccessUrl;
        },
      });
      paystackHandler.openIframe();
    };
    document.body.appendChild(script);
  };

  // Run handler once after component mounts
  // Avoid multiple triggers on re-render
  const [called, setCalled] = React.useState(false);
  React.useEffect(() => {
    if (!called) {
      handler();
      setCalled(true);
    }
  }, [called]);

  return null; // No actual UI needed, popup handles itself
}
