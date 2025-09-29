"use client";

import { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { toast } from "sonner";

interface PaystackInlineProps {
  email: string;
  amount: number; // in kobo (KES × 100)
  publicKey: string;
  orderId: string;
  onSuccess?: (reference: any) => void;
  onFailure?: () => void;
}

declare global {
  interface Window {
    PaystackPop?: any;
  }
}

const PaystackInline = forwardRef(
  (
    {
      email,
      amount,
      publicKey,
      orderId,
      onSuccess,
      onFailure,
    }: PaystackInlineProps,
    ref
  ) => {
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);

    useEffect(() => {
      if (window.PaystackPop) {
        setIsScriptLoaded(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      script.onload = () => setIsScriptLoaded(true);
      script.onerror = () => toast.error("Failed to load Paystack script");
      document.body.appendChild(script);

      return () => {
        script.remove();
      };
    }, []);

    const payWithPaystack = () => {
      if (!isScriptLoaded || !window.PaystackPop) {
        toast.error("Payment system not ready. Try again.");
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
          if (onFailure) onFailure();
        },
        callback: (response: any) => {
          toast.success("Payment successful!");
          if (onSuccess) onSuccess(response);
        },
      });

      handler.openIframe();
    };

    // 🔑 Expose `payWithPaystack` to parent
    useImperativeHandle(ref, () => ({ payWithPaystack }));

    return null; // this component doesn’t render its own button now
  }
);

PaystackInline.displayName = "PaystackInline";
export default PaystackInline;
