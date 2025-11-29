"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PaystackInlineProps {
  email: string;
  amount: number; 
  publicKey: string;
  orderId: string;
  onSuccess?: (reference: any) => void;
  onClose?: () => void;
  onFailure?: (error?: any) => void;
}

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

export default function PaystackInline({
  email,
  amount,
  publicKey,
  orderId,
  onSuccess,
  onClose,
  onFailure,
}: PaystackInlineProps) {
  const [ready, setReady] = useState(false);

  /**
   * Load Paystack script ONCE globally.
   * Never remove it — speeds up popup loading.
   */
  useEffect(() => {
    // Already loaded
    if (window.PaystackPop) {
      setReady(true);
      return;
    }

    // Already injected script tag
    const existing = document.getElementById("paystack-script");
    if (existing) {
      existing.addEventListener("load", () => setReady(true));
      return;
    }

    // Fresh script injection
    const script = document.createElement("script");
    script.id = "paystack-script";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () => toast.error("Failed to load payment gateway");
    document.body.appendChild(script);
  }, []);

  /**
   * Launch the Paystack popup
   */
  const openPaystack = () => {
    if (!ready || !window.PaystackPop) {
      toast.error("Payment system still loading. Please try again.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount,
      currency: "KES",
      ref: `${orderId}-${Date.now()}`,

      onClose: () => {
        toast.error("Payment window closed");
        onClose?.();
        onFailure?.("popup_closed");
      },

      callback: (res: any) => {
        fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference: res.reference, orderId }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (data.status && data.data.status === "success") {
              toast.success("Payment successful!");
              onSuccess?.(res);
            } else {
              toast.error("Verification failed");
              onFailure?.("verification_failed");
            }
          })
          .catch((err) => {
            toast.error("Verification request failed");
            onFailure?.(err);
          });
      },
    });

    handler.openIframe();
  };

  return (
    <button
      onClick={openPaystack}
      disabled={!ready}
      className="w-1/3 rounded-full mt-2 px-8 py-3 bg-primary text-white hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {ready ? "Complete Payment" : "Loading…"}
    </button>
  );
}
