"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

// Extend Window interface for TypeScript
declare global {
  interface Window {
    PaystackPop?: any;
  }
}

interface PaystackInlineProps {
  email: string;
  amount: number; // in kobo
  publicKey: string;
  orderId: string;
  onSuccess?: (reference: any) => void;
  onClose?: () => void;
}

export default function PaystackInline({
  email,
  amount,
  publicKey,
  orderId,
  onSuccess,
  onClose,
}: PaystackInlineProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (!document.querySelector("#paystack-script")) {
      const script = document.createElement("script");
      script.id = "paystack-script";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      script.onerror = () => toast.error("Failed to load Paystack script");
      document.body.appendChild(script);
    } else {
      setIsScriptLoaded(true);
    }
  }, []);

  const payWithPaystack = () => {
    if (!isScriptLoaded) {
      toast.error("Payment system not loaded yet. Please try again.");
      return;
    }

    if (!window.PaystackPop) {
      toast.error("Paystack not available. Refresh the page and try again.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount,
      currency: "KES",
      ref: `${orderId}-${Date.now()}`,
      onClose: () => {
        toast.error("Payment popup closed");
        if (onClose) onClose();
      },
      callback: async (response: any) => {
        try {
          const res = await fetch("/api/paystack/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference: response.reference,
              orderId,
            }),
          });

          const data = await res.json();

          if (data.status && data.data.status === "success") {
            toast.success("Payment successful!");
            if (onSuccess) onSuccess(response);
          } else {
            toast.error("Payment verification failed");
          }
        } catch (err) {
          toast.error("Verification request failed");
        }
      },
    });

    handler.openIframe();
  };

  return (
    <button
      onClick={payWithPaystack}
      className="w-full rounded-full bg-green-600 text-white py-2 px-4 hover:bg-green-700"
    >
      Pay with Paystack
    </button>
  );
}
