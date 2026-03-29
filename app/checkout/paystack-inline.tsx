"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { buildOrderPaymentReference } from "@/lib/payments";

interface PaystackInlineProps {
  email: string;
  amount: number;
  publicKey: string;
  orderId: string;
  autoStart?: boolean;
  onSuccess?: (reference: string) => void;
  onClose?: () => void;
  onFailure?: (error?: unknown) => void;
}

const autoStartedOrders = new Set<string>();
let paystackScriptPromise: Promise<void> | null = null;

declare global {
  interface Window {
    PaystackPop?: {
      setup: (options: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

export default function PaystackInline({
  email,
  amount,
  publicKey,
  orderId,
  autoStart,
  onSuccess,
  onClose,
  onFailure,
}: PaystackInlineProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const autoStartedRef = useRef(false);

  const ensurePaystackScript = async () => {
    if (window.PaystackPop) {
      setIsScriptLoaded(true);
      return;
    }

    if (!paystackScriptPromise) {
      paystackScriptPromise = new Promise<void>((resolve, reject) => {
        const existingScript = document.getElementById(
          "paystack-script",
        ) as HTMLScriptElement | null;

        if (existingScript) {
          existingScript.addEventListener("load", () => resolve(), {
            once: true,
          });
          existingScript.addEventListener("error", () => reject(), {
            once: true,
          });
          return;
        }

        const script = document.createElement("script");
        script.id = "paystack-script";
        script.src = "https://js.paystack.co/v1/inline.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load Paystack"));
        document.body.appendChild(script);
      });
    }

    await paystackScriptPromise;
    if (!window.PaystackPop) {
      throw new Error("Paystack SDK unavailable");
    }
    setIsScriptLoaded(true);
  };

  useEffect(() => {
    void ensurePaystackScript().catch(() => {
      toast.error("Failed to load Paystack script");
    });
  }, []);

  const payWithPaystack = async () => {
    if (isInitializing) {
      return;
    }

    try {
      await ensurePaystackScript();
    } catch {
      toast.error("Payment system not ready. Please try again.");
      return;
    }

    if (!window.PaystackPop) return;

    const existingScript = document.getElementById("paystack-script");
    if (existingScript) {
      existingScript.addEventListener("load", () => setIsScriptLoaded(true));
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

  const payWithPaystack = async () => {
    if (!isScriptLoaded || !window.PaystackPop || isInitializing) {
      return;
    }

    setIsInitializing(true);
    const reference = `${buildOrderPaymentReference(orderId)}-${Date.now()}`;

    try {
      const handler = window.PaystackPop.setup({
        key: publicKey,
        email,
        amount,
        currency: "KES",
        ref: reference,
        metadata: {
          orderId,
        },
        onClose: async () => {
          await fetch("/api/paystack/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reference,
              orderId,
              cancelled: true,
            }),
          });
          setIsInitializing(false);
          onClose?.();
          onFailure?.("popup_closed");
        },
        callback: async (response: { reference: string }) => {
          try {
            const verifyRes = await fetch("/api/paystack/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                reference: response.reference,
                orderId,
              }),
            });
            const data = await verifyRes.json();
            if (data.status && data.data?.status === "success") {
              toast.success("Payment successful!");
              onSuccess?.(response.reference);
              return;
            }
            toast.error(data.message || "Payment verification failed");
            onFailure?.(data);
          } catch (error) {
            toast.error("Verification request failed");
            onFailure?.(error);
          } finally {
            setIsInitializing(false);
          }
        },
      });

      handler.openIframe();
    } catch (error) {
      setIsInitializing(false);
      onFailure?.(error);
    }
  };

  useEffect(() => {
    if (
      autoStart &&
      isScriptLoaded &&
      !autoStartedRef.current &&
      !autoStartedOrders.has(orderId)
    ) {
      autoStartedRef.current = true;
      autoStartedOrders.add(orderId);
      void payWithPaystack();
    }
  }, [autoStart, isScriptLoaded, orderId]);

  return (
    <Button
      onClick={() => void payWithPaystack()}
      disabled={isInitializing}
      className="w-full rounded-full mt-2"
    >
      {isInitializing
        ? "Initializing payment..."
        : isScriptLoaded
          ? "Pay Now"
          : "Preparing secure checkout..."}
      disabled={!isScriptLoaded || isInitializing}
      className="w-full rounded-full mt-2"
    >
      {isInitializing ? "Initializing payment..." : "Pay Now"}
    </Button>
  );
}
