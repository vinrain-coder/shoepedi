"use client";

import { useState } from "react";
import { updateAffiliateStatus, deleteAffiliate } from "@/lib/actions/affiliate.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function AffiliatesAdminPage({ affiliates }: { affiliates: any[] }) {
  const [list, setList] = useState(affiliates);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  async function handleStatusUpdate(id: string, status: "approved" | "rejected") {
    setIsUpdating(id);
    // Only pass rejectionReason if status is rejected
    const res = await updateAffiliateStatus(id, status, status === "rejected" ? rejectionReason : undefined);
    setIsUpdating(null);

    if (res.success) {
      toast.success(res.message);
      setList(prev => prev.map(a => a._id === id ? { ...a, status } : a));
      setRejectionReason("");
    } else {
      toast.error(res.message);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this affiliate? This action cannot be undone.")) return;

    setIsDeleting(id);
    const res = await deleteAffiliate(id);
    setIsDeleting(null);

    if (res.success) {
      toast.success(res.message);
      setList(prev => prev.filter(a => a._id !== id));
    } else {
      toast.error(res.message);
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold">Manage Affiliates</h1>

      <Card>
        <CardHeader>
          <CardTitle>Affiliate Applications</CardTitle>
        </CardHeader>
        <CardContent>
          {list.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No affiliate applications found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Affiliate Code</TableHead>
                  <TableHead>Earnings Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map((affiliate: any) => (
                  <TableRow key={affiliate._id}>
                    <TableCell>
                      <div className="font-medium">{affiliate.user?.name}</div>
                      <div className="text-xs text-muted-foreground">{affiliate.user?.email}</div>
                    </TableCell>
                    <TableCell className="font-mono">{affiliate.affiliateCode}</TableCell>
                    <TableCell>{affiliate.earningsBalance.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={affiliate.status === "approved" ? "badge-success" : affiliate.status === "pending" ? "badge-pending" : "badge-rejected"}>
                        {affiliate.status === "approved" && <CheckCircle2 className="h-3 w-3" />}
                        {affiliate.status === "pending" && <Clock className="h-3 w-3" />}
                        {affiliate.status === "rejected" && <AlertCircle className="h-3 w-3" />}
                        {affiliate.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(affiliate.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {affiliate.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            disabled={isUpdating === affiliate._id}
                            onClick={() => handleStatusUpdate(affiliate._id, "approved")}
                          >
                            {isUpdating === affiliate._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Approve"}
                          </Button>

                          <Dialog onOpenChange={(open) => !open && setRejectionReason("")}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="destructive" disabled={isUpdating === affiliate._id}>
                                Reject
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Affiliate Application</DialogTitle>
                                <DialogDescription>
                                  Please provide a reason for rejecting this application. This is mandatory.
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
                                  onClick={() => handleStatusUpdate(affiliate._id, "rejected")}
                                  disabled={!rejectionReason.trim() || isUpdating === affiliate._id}
                                >
                                  {isUpdating === affiliate._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Reject"}
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
                        disabled={isDeleting === affiliate._id}
                        onClick={() => handleDelete(affiliate._id)}
                      >
                        {isDeleting === affiliate._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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
