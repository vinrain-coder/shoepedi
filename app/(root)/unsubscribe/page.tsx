"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle, MailX } from "lucide-react";
import Link from "next/link";
import Breadcrumb from "@/components/shared/breadcrumb";

import { unsubscribeFromNewsletter } from "@/lib/actions/newsletter.actions";
import { Button } from "@/components/ui/button";

export default function UnsubscribePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (email && token) {
      startTransition(async () => {
        const res = await unsubscribeFromNewsletter({ email, token });
        setResult(res);
      });
    } else {
      setResult({
        success: false,
        message: "Missing email or unsubscribe token. Please use the link provided in your email.",
      });
    }
  }, [email, token]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
      <div className="mb-6 self-start">
        <Breadcrumb />
      </div>
      <div className="mx-auto max-w-md space-y-6 rounded-2xl border bg-card p-8 shadow-sm">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <MailX className="size-10" />
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Newsletter Unsubscribe</h1>

        {isPending ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm font-medium animate-pulse">
              Processing your request...
            </p>
          </div>
        ) : result ? (
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
        ) : null}

        <div className="pt-4 border-t">
          <Button asChild className="w-full">
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
