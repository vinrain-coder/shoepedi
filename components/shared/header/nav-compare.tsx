"use client";

import Link from "next/link";
import { ArrowLeftRight } from "lucide-react";
import { useCompareStore } from "@/hooks/useCompareStore";

export default function NavbarCompare() {
  const { count } = useCompareStore();

  return (
    <Link
      href="/compare"
      className="relative flex items-center gap-1 p-2 cursor-pointer group"
      aria-label={`Compare products, ${count} items`}
      title={`Compare (${count})`}
    >
      <ArrowLeftRight className="w-6 h-6 text-white" />

      <span className="sr-only">Compare products with {count} items</span>

      <span
        className="
          absolute top-0 -right-0.5
          flex min-h-4.5 min-w-4.5
          items-center justify-center
          rounded-full bg-primary
          text-[10px] leading-none text-black font-semibold
        "
        aria-hidden="true"
      >
        {count}
      </span>

      <span
        className="
          absolute top-full mt-3.5 left-1/2 -translate-x-1/2
          whitespace-nowrap rounded-md bg-black px-2 py-1
          text-xs text-white opacity-0
          transition-opacity duration-200
          group-hover:opacity-100
          pointer-events-none z-50
        "
      >
        Compare ({count})
      </span>
    </Link>
  );
}
