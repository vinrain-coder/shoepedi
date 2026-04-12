"use client";

import { useState, useTransition, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, BellOff } from "lucide-react";
import Link from "next/link";
import Breadcrumb from "@/components/shared/breadcrumb";

import { unsubscribeFromStock } from "@/lib/actions/stock.actions";
import { Button } from "@/components/ui/button";

function UnsubscribeStockContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleUnsubscribe = () => {
    if (!token) {
        setResult({
            success: false,
            message: "Missing unsubscribe token. Please use the link provided in your email.",
        });
        return;
    }

    startTransition(async () => {
      try {
        const res = await unsubscribeFromStock(token);
        setResult(res);
      } catch (error) {
        console.error("Unsubscribe error:", error);
        setResult({
            success: false,
            message: "Failed to unsubscribe. An unexpected error occurred.",
        });
      }
    });
  };

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 self-start">
        <Breadcrumb />
      </div>
      <div className="mx-auto max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <BellOff className="size-10" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Stock Alert Unsubscribe</h1>

        {!result && !isPending && (
            <div className="space-y-4 py-4">
                <p className="text-muted-foreground leading-relaxed">
                    Are you sure you want to stop receiving restock alerts for this product?
                </p>
                <Button onClick={handleUnsubscribe} className="w-full" size="lg">
                    Confirm Unsubscribe
                </Button>
            </div>
        )}

        {isPending && (
          <div className="flex flex-col items-center gap-4 py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm font-medium animate-pulse">
              Processing your request...
            </p>
          </div>
        )}

        {result && !isPending && (
          <div className="space-y-4 py-4">
            {result.success ? (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle2 className="size-12 text-emerald-500" />
                <p className="text-muted-foreground leading-relaxed">
                  {result.message}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <XCircle className="size-12 text-destructive" />
                <p className="text-muted-foreground leading-relaxed">
                  {result.message}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="pt-4 border-t">
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to Store</Link>
          </Button>
        </div>
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        If you have any trouble unsubscribing, please contact our support team.
      </p>
    </div>
  );
}

export default function UnsubscribeStockPage() {
  return (
    <Suspense fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    }>
      <UnsubscribeStockContent />
    </Suspense>
  );
}
