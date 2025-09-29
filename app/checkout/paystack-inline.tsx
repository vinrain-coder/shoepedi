"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PaystackInlineProps {
  email: string;
  amount: number; // in kobo (multiply KES by 100)
  publicKey: string;
  orderId: string;
  onSuccess?: (reference: any) => void;
  onClose?: () => void;
  onFailure?: (error?: any) => void; // <-- new
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
  onFailure, // <-- new
}: PaystackInlineProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    if (window.PaystackPop) {
      setIsScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.id = "paystack-script";
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
      toast.error("Payment system not ready. Please try again.");
      return;
    }

    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount,
      currency: "KES",
      ref: `${orderId}-${Date.now()}`,
      onClose: function () {
        toast.error("Payment popup closed");
        if (onClose) onClose();
        if (onFailure) onFailure("popup_closed"); // <-- treat popup close as failure
      },
      callback: function (response: any) {
        fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reference: response.reference,
            orderId,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status && data.data.status === "success") {
              toast.success("Payment successful!");
              if (onSuccess) onSuccess(response);
            } else {
              toast.error("Payment verification failed");
              if (onFailure) onFailure("verification_failed");
            }
          })
          .catch((err) => {
            toast.error("Verification request failed");
            if (onFailure) onFailure(err);
          });
      },
    });

    handler.openIframe();
  };

  return (
    <Button
      onClick={payWithPaystack}
      disabled={!isScriptLoaded}
      className="w-1/3 rounded-full mt-2"
    >
      Complete Payment
    </Button>
  );
}
