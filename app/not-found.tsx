"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-2xl border bg-background p-8 shadow-sm text-center">
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <AlertTriangle className="h-7 w-7 text-muted-foreground" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl font-semibold tracking-tight mb-3">
          Page not found
        </h1>

        {/* Description */}
        <p className="text-muted-foreground text-base">
          The page you’re trying to access doesn’t exist or may have been moved.
        </p>

        <p className="text-muted-foreground text-sm mt-2">
          Please check the URL or use one of the options below.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>

          <Button
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
  }
