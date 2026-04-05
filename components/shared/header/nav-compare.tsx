"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { useCompareStore } from "@/hooks/useCompareStore";

export default function NavbarCompare() {
  const { count } = useCompareStore();

  return (
    <Link href="/compare" className="relative flex items-center gap-1 p-2 cursor-pointer">
      <Scale className="w-6 h-6 text-white" />
      <span
        className="
          absolute -top-0 -right-0.5
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
