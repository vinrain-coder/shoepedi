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
  const [scriptLoaded, setScriptLoaded] = React.useState(false);

  // Load Paystack script once
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    if (!window.PaystackPop) {
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  const handleClick = () => {
    if (!scriptLoaded || !window.PaystackPop) return;

    const handler = window.PaystackPop.setup({
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
    handler.openIframe();
  };

  // Render a hidden button or call this function from your existing "Place Order" button
  return (
    <button
      onClick={handleClick}
      style={{ display: "none" }}
      id="paystack-trigger"
    >
      Pay
    </button>
  );
}
