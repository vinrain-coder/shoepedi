import { getAffiliateDashboardData } from "@/lib/actions/affiliate.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Wallet,
} from "lucide-react";
import PayoutRequestForm from "@/components/affiliate/payout-request-form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/shared/pagination";
import Breadcrumb from "@/components/shared/breadcrumb";
import { redirect } from "next/navigation";

export default async function AffiliatePayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page = "1" } = await searchParams;
  const pageNum = Math.max(1, Math.floor(parseInt(page, 10) || 1));
  const result = await getAffiliateDashboardData({ payoutPage: pageNum });

  if (!result.success) {
    if (result.message === "User not authenticated") {
      const { toSignInPath } = await import("@/lib/redirects");
      redirect(toSignInPath());
    }

    return (
      <div className="container mx-auto py-10">
        <Breadcrumb />
        <div className="p-4 border border-destructive bg-destructive/10 text-destructive rounded-md">
          {result.message ||
            "An unexpected error occurred; please try again later"}
        </div>
      </div>
    );
  }

  const { affiliate, recentPayouts, payoutTotalPages = 1 } = result.data || {};
  const { affiliate: settings } = await getSetting();

  return (
    <div className="container mx-auto py-4 space-y-4">
      <Breadcrumb />

      <h1 className="text-3xl font-bold">Payouts Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 💰 BALANCE CARD (UPGRADED) */}
        <div className="space-y-4">
          <Card
            className={cn(
              "rounded-xl border-2 border-primary/20 border-dashed transition-all",
              "hover:ring-2 hover:ring-primary/20 hover:shadow-sm",
            )}
          >
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm text-muted-foreground uppercase">
                Earnings Balance
              </CardTitle>
              <div className="rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 p-2">
                <Wallet className="h-4 w-4" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="text-3xl font-bold">
                {formatCurrency(affiliate.earningsBalance)}
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Minimum withdrawal amount:{" "}
                {formatCurrency(settings.minWithdrawalAmount)}
              </p>
            </CardContent>
          </Card>

          {/* REQUEST FORM */}
          {affiliate.status === "approved" && (
            <PayoutRequestForm
              currentBalance={affiliate.earningsBalance}
              minAmount={settings.minWithdrawalAmount}
            />
          )}
        </div>

        {/* 📊 HISTORY CARD */}
        <Card className="rounded-xl border">
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
          </CardHeader>

          <CardContent>
            {recentPayouts.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                No withdrawals yet.
              </p>
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
                      <TableCell>
                        {new Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "numeric",
                          day: "numeric",
                          timeZone: "Africa/Nairobi",
                        }).format(new Date(payout.createdAt))}
                      </TableCell>

                      <TableCell className="font-medium">
                        {formatCurrency(payout.amount)}
                      </TableCell>

                      <TableCell>{payout.paymentMethod}</TableCell>

                      <TableCell>
                        <Badge
                          className={cn(
                            "text-[10px] flex items-center gap-1 px-2 py-0.5",
                            payout.status === "paid" &&
                              "bg-emerald-100 text-emerald-600",
                            payout.status === "pending" &&
                              "bg-orange-100 text-orange-600",
                            payout.status === "rejected" &&
                              "bg-red-100 text-red-600",
                          )}
                        >
                          {payout.status === "paid" && (
                            <CheckCircle2 className="h-3 w-3" />
                          )}
                          {payout.status === "pending" && (
                            <Clock className="h-3 w-3" />
                          )}
                          {payout.status === "rejected" && (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          {payout.status.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {payoutTotalPages > 1 && (
              <div className="flex justify-center pt-4">
                <Pagination page={pageNum} totalPages={payoutTotalPages} />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
