"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { notifySubscribers } from "@/lib/actions/stock.actions";

export default function NotifyButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleNotify = () => {
    startTransition(async () => {
      try {
        await notifySubscribers(productId);
        location.reload(); // Refresh page after notification
      } catch (error) {
        console.error("Failed to notify subscribers:", error);
      }
    });
  };

  return (
    <Button
      size="sm"
      onClick={handleNotify}
      disabled={isPending}
      className="cursor-pointer"
    >
      {isPending ? "Notifying..." : "Notify"}
    </Button>
  );
}
