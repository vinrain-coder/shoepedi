"use client";
import { useTransition } from "react";

import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LoadingButton } from "./loading-button";

export default function ActionButton({
  caption,
  action,
  className = "w-full",
  variant = "default",
  size = "default",
  requireConfirmation = false,
  confirmationMessage = "Are you sure you want to perform this action?",
}: {
  caption: string;
  action: () => Promise<{ success: boolean; message: string }>;
  className?: string;
  variant?: "default" | "outline" | "destructive";
  size?: "default" | "sm" | "lg";
  requireConfirmation?: boolean;
  confirmationMessage?: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleAction = () => {
    startTransition(async () => {
      const res = await action();
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    });
  };

  const button = (
    <LoadingButton
      type="button"
      className={cn("rounded-full cursor-pointer", className)}
      variant={variant}
      size={size}
      loading={isPending}
      loadingText="Processing..."
      onClick={requireConfirmation ? undefined : handleAction}
    >
      {caption}
    </LoadingButton>
  );

  if (requireConfirmation) {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {button}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction} disabled={isPending}>
              {isPending ? "Processing..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return button;
}
