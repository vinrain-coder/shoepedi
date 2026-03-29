"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function OrderPlacedPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const orderId = params?.id;

  useEffect(() => {
    if (!orderId) return;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    timeout = setTimeout(() => {
      router.replace(`/account/orders/${orderId}`);
    }, 2200);

    return () => timeout && clearTimeout(timeout);
  }, [orderId, router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="mx-auto mb-5 h-20 w-20 rounded-full bg-green-100 flex items-center justify-center animate-pulse">
          <CheckCircle2 className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold">Order placed successfully 🎉</h1>
        <p className="text-muted-foreground mt-3">
          We are preparing your order details. Redirecting now...
        </p>
        <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          One moment please
        </p>
      </div>
    </div>
  );
}
