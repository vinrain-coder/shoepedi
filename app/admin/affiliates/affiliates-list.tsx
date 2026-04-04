"use client";

import { useState } from "react";
import { updateAffiliateStatus } from "@/lib/actions/affiliate.actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AffiliatesAdminPage({ affiliates }: { affiliates: any[] }) {
  const [list, setList] = useState(affiliates);

  async function handleStatusUpdate(id: string, status: "approved" | "rejected") {
    const res = await updateAffiliateStatus(id, status);
    if (res.success) {
      toast.success(res.message);
      setList(prev => prev.map(a => a._id === id ? { ...a, status } : a));
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
                      <Badge variant={affiliate.status === "approved" ? "default" : affiliate.status === "pending" ? "outline" : "destructive"}>
                        {affiliate.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(affiliate.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {affiliate.status === "pending" && (
                        <>
                          <Button size="sm" variant="default" onClick={() => handleStatusUpdate(affiliate._id, "approved")}>
                            Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleStatusUpdate(affiliate._id, "rejected")}>
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
