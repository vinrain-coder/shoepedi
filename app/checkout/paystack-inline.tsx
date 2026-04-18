"use client";

import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

interface PaystackInlineProps {
  email: string;
  amount: number; // in kobo (multiply KES by 100)
  publicKey: string;
  orderId: string;
  onSuccess?: (reference: { reference: string }) => void;
  onClose?: () => void;
  onFailure?: (error?: unknown) => void;
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
  onFailure,
  autoStart = false,
  hideButton = false,
  buttonLabel = "Complete Payment",
  className,
}: PaystackInlineProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isPaystackLaunched, setIsPaystackLaunched] = useState(false);
  const hasAutoStarted = useRef(false);

  useEffect(() => {
    if (window.PaystackPop) {
      setIsScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById("paystack-script") as HTMLScriptElement | null;
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsScriptLoaded(true), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "paystack-script";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => toast.error("Failed to load Paystack script");
    document.body.appendChild(script);
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
        setIsPaystackLaunched(false);
        if (onClose) onClose();
        if (onFailure) onFailure("popup_closed");
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
              setIsPaystackLaunched(false);
              if (onFailure) onFailure("verification_failed");
            }
          })
          .catch((err) => {
            toast.error("Verification request failed");
            setIsPaystackLaunched(false);
            if (onFailure) onFailure(err);
          });
      },
    });

    handler.openIframe();
    setIsPaystackLaunched(true);
  }, [amount, email, onClose, onFailure, onSuccess, orderId, publicKey, isScriptLoaded]);

  useEffect(() => {
    if (!autoStart || !isScriptLoaded || hasAutoStarted.current) return;
    hasAutoStarted.current = true;
    payWithPaystack();
  }, [autoStart, isScriptLoaded, payWithPaystack]);

  if (hideButton) {
    return (
      <div className="flex flex-col items-center justify-center p-6 space-y-4 text-center border rounded-lg bg-primary/5 border-primary/20 animate-in fade-in zoom-in duration-300">
        <div className="relative flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse blur-xl" />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-primary">Completing your order...</h3>
          <p className="text-sm text-muted-foreground">
            We&apos;re connecting you to Paystack&apos;s secure checkout.
          </p>
        </div>
        {!isPaystackLaunched && orderId !== "initializing" && (
          <Button
            onClick={payWithPaystack}
            disabled={!isScriptLoaded}
            className="rounded-full px-8 py-6 text-lg font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            Launch Payment Window
          </Button>
        )}
        {isPaystackLaunched && (
          <div className="flex items-center gap-2 text-emerald-600 font-medium text-sm">
            <ShieldCheck className="h-5 w-5" />
            <span>Secure checkout window is open</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground italic">
          Please keep this page open until payment is complete.
        </p>
      </div>
    );
  }

  return (
    <Button
      onClick={payWithPaystack}
      disabled={!isScriptLoaded}
      className={
        className ??
        "w-full rounded-full mt-2 px-8 py-6 bg-primary text-white hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg"
      }
    >
      {buttonLabel}
    </Button>
  );
}
