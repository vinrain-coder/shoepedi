"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface PaystackInlineProps {
  email: string;
  amount: number; // in kobo (multiply KES by 100)
  publicKey: string;
  orderId: string;
  onSuccess?: (reference: { reference: string }) => void;
  onClose?: () => void;
  onFailure?: (error?: unknown) => void; // <-- new
  autoStart?: boolean;
  hideButton?: boolean;
  buttonLabel?: string;
  className?: string;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        onClose: () => void;
        callback: (response: { reference: string }) => void;
      }) => { openIframe: () => void };
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
  onFailure, // <-- new
  autoStart = false,
  hideButton = false,
  buttonLabel = "Complete Payment",
  className,
}: PaystackInlineProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const hasAutoStarted = useRef(false);

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

  const payWithPaystack = useCallback(() => {
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
      callback: function (response: { reference: string }) {
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
  }, [amount, email, onClose, onFailure, onSuccess, orderId, publicKey, isScriptLoaded]);

  useEffect(() => {
    if (!autoStart || !isScriptLoaded || hasAutoStarted.current) return;
    hasAutoStarted.current = true;
    payWithPaystack();
  }, [autoStart, isScriptLoaded, payWithPaystack]);

  if (hideButton) {
    return (
      <div className="w-full rounded-xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 text-sm text-muted-foreground shadow-sm">
        <p className="inline-flex items-center gap-2 font-medium text-primary">
          <Loader2 className="h-4 w-4 animate-spin" />
          Launching secure Paystack checkout...
        </p>
        <p className="mt-2 text-xs">
          Please keep this tab open. If your browser blocked the popup, use the button below.
        </p>
        <Button
          onClick={payWithPaystack}
          disabled={!isScriptLoaded}
          variant="outline"
          className="mt-3 w-full"
        >
          Open payment window manually
        </Button>
      </div>
    );
  }
  return (
    <Button
      onClick={payWithPaystack}
      disabled={!isScriptLoaded}
      className={
        className ??
        "w-1/3 rounded-full mt-2 px-8 py-3 bg-primary text-white hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
      }
    >
      {buttonLabel}
    </Button>
  );
}
