"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TrackOrderForm() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const router = useRouter();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleaned = trackingNumber.trim();
    if (!cleaned) return;
    router.push(`/track/${encodeURIComponent(cleaned)}`);
  };

  return (
    <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
      <Input
        value={trackingNumber}
        onChange={(event) => setTrackingNumber(event.target.value)}
        placeholder="Enter your tracking number"
        className="h-11"
      />
      <Button type="submit" className="h-11 px-6">
        Track order
      </Button>
    </form>
  );
}
