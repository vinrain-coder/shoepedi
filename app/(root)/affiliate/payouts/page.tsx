import { getAffiliateDashboardData } from "@/lib/actions/affiliate.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";
import PayoutRequestForm from "@/components/affiliate/payout-request-form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AffiliatePayoutsPage() {
  const { data } = await getAffiliateDashboardData();
  const { affiliate: settings } = await getSetting();

  if (!data) return <div>Unauthorized</div>;

  const { affiliate, recentPayouts } = data;

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-3xl font-bold">Payouts Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
             <Card>
                <CardHeader>
                    <CardTitle>Earnings Balance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">{formatCurrency(affiliate.earningsBalance)}</div>
                    <p className="text-sm text-muted-foreground mt-2">
                        Minimum withdrawal amount: {formatCurrency(settings.minWithdrawalAmount)}
                    </p>
                </CardContent>
            </Card>

            {affiliate.status === "approved" && (
                <PayoutRequestForm
                    currentBalance={affiliate.earningsBalance}
                    minAmount={settings.minWithdrawalAmount}
                />
            )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayouts.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No withdrawals yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayouts.map((payout: any) => (
                    <TableRow key={payout._id}>
                      <TableCell>{new Date(payout.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(payout.amount)}</TableCell>
                      <TableCell>{payout.paymentMethod}</TableCell>
                      <TableCell>
                        <Badge className={payout.status === "paid" ? "badge-success" : payout.status === "rejected" ? "badge-rejected" : "badge-pending"}>
                          {payout.status === "paid" && <CheckCircle2 className="h-3 w-3" />}
                          {payout.status === "pending" && <Clock className="h-3 w-3" />}
                          {payout.status === "rejected" && <AlertCircle className="h-3 w-3" />}
                          {payout.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
