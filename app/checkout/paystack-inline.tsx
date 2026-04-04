"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [isPaystackLaunched, setIsPaystackLaunched] = useState(false);
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
        setIsPaystackLaunched(false);
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
    setIsPaystackLaunched(true);
  }, [amount, email, onClose, onFailure, onSuccess, orderId, publicKey, isScriptLoaded]);

  useEffect(() => {
    if (!autoStart || !isScriptLoaded || hasAutoStarted.current) return;
    hasAutoStarted.current = true;
    payWithPaystack();
  }, [autoStart, isScriptLoaded, payWithPaystack]);

  if (hideButton) {
    return (
      <Dialog open={!isPaystackLaunched} modal={false}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">
              Completing Your Order...
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              We&apos;re connecting you to Paystack&apos;s secure checkout.
              Please keep this window open.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center space-y-6 pb-6">
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              {orderId === "initializing"
                ? "Creating your order..."
                : "Initializing payment..."}
            </div>
            {orderId !== "initializing" && (
              <Button
                onClick={payWithPaystack}
                disabled={!isScriptLoaded}
                className="w-full rounded-full py-6 text-lg font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                Launch Payment Window
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              If the payment window didn&apos;t open automatically, click the
              button above.
            </p>
          </div>
        </DialogContent>
      </Dialog>
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
