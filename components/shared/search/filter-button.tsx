"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface FilterButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function FilterButton({
  active,
  onClick,
  children,
  className,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
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
