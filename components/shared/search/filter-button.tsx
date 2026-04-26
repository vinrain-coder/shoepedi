"use client";

import { cn } from "@/lib/utils";
import React from "react";

interface FilterButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
  ...props
}: FilterButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "px-2 py-0.5 rounded-full transition-colors cursor-pointer",
        {
          "text-primary border-primary bg-primary/10": active,
          "hover:border-primary hover:text-primary hover:bg-primary/10":
            !active,
        },
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
