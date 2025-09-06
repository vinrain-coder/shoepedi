"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="flex flex-row items-center gap-3 animate-fade-in">
        <Loader2 className="animate-spin" />
        <p className="text-md">Loading, please wait...</p>
      </div>
    </div>
  );
}
