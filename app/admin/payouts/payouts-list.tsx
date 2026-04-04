"use client";

import { useState } from "react";
import { updatePayoutStatus } from "@/lib/actions/affiliate.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function PayoutsAdminPage({ payouts }: { payouts: any[] }) {
  const [list, setList] = useState(payouts);

  async function handleStatusUpdate(id: string, status: "paid" | "rejected") {
    const res = await updatePayoutStatus(id, status);
    if (res.success) {
      toast.success(res.message);
      setList(prev => prev.map(p => p._id === id ? { ...p, status } : p));
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
                      <Badge variant={payout.status === "paid" ? "default" : payout.status === "pending" ? "outline" : "destructive"}>
                        {payout.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {payout.status === "pending" && (
                        <>
                          <Button size="sm" variant="default" onClick={() => handleStatusUpdate(payout._id, "paid")}>
                            Mark Paid
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(payout._id, "rejected")}>
                            Reject
                          </Button>
                        </>
                      )}
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
