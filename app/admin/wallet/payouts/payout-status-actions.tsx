"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, CheckCircle, XCircle, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { updateWalletPayoutStatus, deleteWalletPayoutRequest } from "@/lib/actions/wallet.actions";

export function PayoutStatusActions({ payout }: { payout: any }) {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"paid" | "rejected" | "delete" | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const handleAction = async () => {
    if (!actionType) return;

    setLoading(true);
    try {
      let res;
      if (actionType === "delete") {
        res = await deleteWalletPayoutRequest(payout._id);
      } else {
        res = await updateWalletPayoutStatus(payout._id, actionType, adminNote);
      }

      if (res.success) {
        toast.success(res.message);
        setDialogOpen(false);
        window.location.reload();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const openDialog = (type: "paid" | "rejected" | "delete") => {
    setActionType(type);
    setDialogOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {(payout.status === "pending" || payout.status === "processing") && (
            <>
              <DropdownMenuItem onClick={() => openDialog("paid")} className="text-green-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark as Paid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDialog("rejected")} className="text-red-600">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuItem onClick={() => openDialog("delete")} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "paid"
                ? "Confirm Payment"
                : actionType === "rejected"
                ? "Reject Payout"
                : "Delete Request"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "paid"
                ? "Are you sure you want to mark this payout as paid? This will notify the user."
                : actionType === "rejected"
                ? "Are you sure you want to reject this payout? The amount will be refunded to the user's wallet."
                : "Are you sure you want to delete this payout request? If it's pending/processing, the amount will be refunded."}
            </DialogDescription>
          </DialogHeader>
          {(actionType === "paid" || actionType === "rejected") && (
            <div className="py-4">
              <Textarea
                placeholder={actionType === "rejected" ? "Rejection reason (required)" : "Admin note (optional)"}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant={actionType === "rejected" || actionType === "delete" ? "destructive" : "default"}
              onClick={handleAction}
              disabled={loading || (actionType === "rejected" && !adminNote.trim())}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
