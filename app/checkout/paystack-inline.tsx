"use client";

import { useEffect } from "react";
import { toast } from "sonner";

interface PaystackInlineProps {
  email: string;
  amount: number; // in kobo (multiply KES by 100)
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
  useEffect(() => {
    // Load Paystack script if not already loaded
    if (!document.querySelector("#paystack-script")) {
      const script = document.createElement("script");
      script.id = "paystack-script";
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const payWithPaystack = () => {
    // @ts-ignore (Paystack adds handler globally)
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount, // Paystack expects kobo
      currency: "KES",
      ref: `${orderId}-${Date.now()}`, // unique reference
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
