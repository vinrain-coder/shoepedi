"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

interface SubmitButtonProps extends ComponentProps<typeof Button> {
  isLoading?: boolean;
  loadingText?: string;
}

export default function SubmitButton({
  isLoading,
  loadingText = "Submitting...",
  children,
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isLoading || disabled}
      className={cn("w-full cursor-pointer", className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 size={16} className="mr-2 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
