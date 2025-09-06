"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="p-8 rounded-2xl shadow-lg w-full max-w-lg">
        <h1 className="text-5xl font-bold  mb-4">😢 Oops!</h1>
        <p className="text-muted-foreground text-lg">
          We couldn’t find the page you’re looking for.
        </p>
        <p className="text-muted-foreground text-sm mt-2">
          Maybe it was moved, deleted, or the link is incorrect.
        </p>
        <Button
          variant="default"
          className="mt-6"
          onClick={() => router.push("/")}
        >
          <ArrowLeft />
          Take Me Home
        </Button>
      </div>
    </div>
  );
}
