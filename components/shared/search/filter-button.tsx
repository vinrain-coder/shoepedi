"use client";

import { cn } from "@/lib/utils";
import * as React from "react";

interface FilterButtonProps {
  value: string;
  current: string;
  onClick: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export default function FilterButton({
  value,
  current,
  onClick,
  children,
  className,
}: FilterButtonProps) {
  const active = value === current;

  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={() => onClick(value)}
      className={cn(
        "border px-2 py-1 rounded-full transition-colors",
        {
          "text-primary border-primary": active,
          "hover:border-primary hover:text-primary": !active,
        },
        className
      )}
    >
      {children}
    </button>
  );
}
