"use client";

import Link from "next/link";
import { Scale } from "lucide-react";
import { useCompareStore } from "@/hooks/useCompareStore";

export default function NavbarCompare() {
  const { count } = useCompareStore();

  return (
    <Link href="/compare" className="header-button relative">
      <Scale className="w-6 h-6" />
      <span className="header-badge">
        {count}
      </span>
    </Link>
  );
}
