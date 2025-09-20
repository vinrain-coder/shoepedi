"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface PaystackInlineProps {
  email: string;
  amount: number; // amount in kobo (multiply by 100)
  publicKey: string;
  orderId: string;
  onSuccess?: (reference: any) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: any) => { openIframe: () => void };
    };
  }
}

export default function PaystackInline({
  email,
  amount,
  publicKey,
  orderId,
  onSuccess,
  onClose,
}: PaystackInlineProps) {
  // Load Paystack script and trigger payment
  useEffect(() => {
    const ensureScript = () =>
      new Promise<void>((resolve, reject) => {
        if (window.PaystackPop) return resolve();

        const script = document.createElement("script");
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Paystack"));
        document.body.appendChild(script);
      });

    ensureScript()
      .then(() => {
        const handler = window.PaystackPop!.setup({
          key: publicKey,
          email,
          amount,
          ref: `order_${orderId}_${Date.now()}`,
          onClose: () => {
            toast.error("Payment cancelled");
            onClose?.();
          },
          callback: (response: any) => {
            toast.success("Payment successful");
            onSuccess?.(response);
          },
        });

        handler.openIframe();
      })
      .catch((err) => {
        console.error(err);
        toast.error("Unable to start Paystack");
      });
  }, [email, amount, publicKey, orderId, onSuccess, onClose]);

  return null; // No UI needed, popup opens automatically
}
