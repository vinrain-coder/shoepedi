"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (orderId) {
        router.push(`/account/orders/${orderId}`);
      } else {
        router.push("/account/orders");
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [orderId, router]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border bg-background p-8 text-center shadow-sm">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        <h1 className="mt-6 text-2xl font-semibold">Processing your order...</h1>
        <p className="mt-2 text-muted-foreground">
          We&apos;re confirming your payment and preparing your order details.
        </p>
      </div>
    </main>
  );
}
