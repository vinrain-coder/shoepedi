"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { useCompareStore } from "@/hooks/useCompareStore";
import { cn } from "@/lib/utils";

export default function NavbarCompare({ className }: { className?: string }) {
  const { count } = useCompareStore();

  return (
    <Link href="/compare" className={cn("relative flex items-center gap-1 p-2 cursor-pointer", className)}>
      <Scale className="w-6 h-6" />
      <span
        className="
          absolute top-1 right-0.5
          flex min-h-[18px] min-w-[18px]
          items-center justify-center
          rounded-full bg-primary px-1
          text-[10px] leading-none text-black font-semibold
        "
      >
        {count}
      </span>
    </Link>
  );
}
