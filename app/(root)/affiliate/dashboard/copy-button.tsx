"use client";

import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);

    setCopied(true);
    toast.success("Copied to clipboard");

    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      aria-label={copied ? "Copied" : "Copy to clipboard"}
      className={`
        h-9 w-9 rounded-lg border transition-all duration-200
        hover:scale-105 hover:bg-muted
        active:scale-95
        ${copied ? "border-green-500 bg-green-50" : "border-border"}
      `}
    >
      <span className="transition-all duration-200">
        {copied ? (
          <CheckIcon className="h-4 w-4 text-green-600" />
        ) : (
          <CopyIcon className="h-4 w-4 text-muted-foreground" />
        )}
      </span>
    </Button>
  );
}
