"use client";
import { useState, useTransition } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

export default function DeleteDialog({
  id,
  action,
  callbackAction,
}: {
  id: string;
  action: (id: string) => Promise<{ success: boolean; message: string }>;
  callbackAction?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          title="Delete"
          className="group hover:border-red-200 hover:bg-red-50 dark:hover:border-red-900 dark:hover:bg-red-950/20 transition-all"
        >
          <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <AlertDialogTitle className="text-xl">
              Delete this item?
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base leading-relaxed pt-2">
            This action cannot be undone. This will permanently delete the item
            from the system.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel
            disabled={isPending}
            className="sm:flex-1"
          >
            Cancel
          </AlertDialogCancel>

          <Button
            variant="destructive"
            disabled={isPending}
            className="sm:flex-1 gap-2"
            onClick={() =>
              startTransition(async () => {
                const res = await action(id);
                if (res.success) {
                  setOpen(false);
                  toast.success(res.message);
                  if (callbackAction) callbackAction();
                } else {
                  toast.error(res.message);
                }
              })
            }
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
  }
  
