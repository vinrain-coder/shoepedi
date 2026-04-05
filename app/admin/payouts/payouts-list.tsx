"use client";

import { useState } from "react";
import { updatePayoutStatus, deletePayoutRequest } from "@/lib/actions/affiliate.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Trash2, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function PayoutsAdminPage({ payouts }: { payouts: any[] }) {
  const [list, setList] = useState(payouts);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  async function handleStatusUpdate(id: string, status: "paid" | "rejected") {
    setIsUpdating(id);
    // Only pass rejectionReason if status is rejected
    const res = await updatePayoutStatus(id, status, status === "rejected" ? rejectionReason : undefined);
    setIsUpdating(null);

    if (res.success) {
      toast.success(res.message);
      setList(prev => prev.map(p => p._id === id ? { ...p, status } : p));
      setRejectionReason("");
    } else {
      toast.error(res.message);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this payout request?")) return;

    setIsDeleting(id);
    const res = await deletePayoutRequest(id);
    setIsDeleting(null);

    if (res.success) {
      toast.success(res.message);
      setList(prev => prev.filter(p => p._id !== id));
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Manage Payouts</h1>

      <Card>
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No payout requests found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Affiliate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((payout: any) => (
                  <TableRow key={payout._id}>
                    <TableCell>
                      <div className="font-medium">{payout.affiliate?.user?.name}</div>
                      <div className="text-xs text-muted-foreground">{payout.affiliate?.user?.email}</div>
                    </TableCell>
                    <TableCell className="font-bold">{formatCurrency(payout.amount)}</TableCell>
                    <TableCell>{payout.paymentMethod}</TableCell>
                    <TableCell>
                      <div className="text-xs">{payout.paymentDetails?.recipient}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={payout.status === "paid" ? "badge-success" : payout.status === "pending" ? "badge-pending" : "badge-rejected"}>
                        {payout.status === "paid" && <CheckCircle2 className="h-3 w-3" />}
                        {payout.status === "pending" && <Clock className="h-3 w-3" />}
                        {payout.status === "rejected" && <AlertCircle className="h-3 w-3" />}
                        {payout.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {payout.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            disabled={isUpdating === payout._id}
                            onClick={() => handleStatusUpdate(payout._id, "paid")}
                          >
                            {isUpdating === payout._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Paid"}
                          </Button>

                          <Dialog onOpenChange={(open) => !open && setRejectionReason("")}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="destructive" disabled={isUpdating === payout._id}>
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Payout Request</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for rejecting this payout. This is mandatory.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Textarea
                                  placeholder="Reason for rejection..."
                                  value={rejectionReason}
                                  onChange={(e) => setRejectionReason(e.target.value)}
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="destructive"
                                  onClick={() => handleStatusUpdate(payout._id, "rejected")}
                                  disabled={!rejectionReason.trim() || isUpdating === payout._id}
                                >
                                  {isUpdating === payout._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Reject"}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={isDeleting === payout._id}
                        onClick={() => handleDelete(payout._id)}
                      >
                        {isDeleting === payout._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
