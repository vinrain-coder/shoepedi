import { getAffiliateDashboardData } from "@/lib/actions/affiliate.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLinkIcon,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import CopyButton from "./copy-button";
import Breadcrumb from "@/components/shared/breadcrumb";

export default async function AffiliateDashboardPage() {
  const { success, data, message } = await getAffiliateDashboardData();
  const { site } = await getSetting();

  if (!success || !data) {
    return (
      <div className="container mx-auto py-10 text-center">
        <h1 className="text-2xl font-bold mb-4">Affiliate Program</h1>
        <p className="mb-6">
          {message || "You are not registered as an affiliate."}
        </p>
        <Button asChild>
          <Link href="/affiliate/register">Register Now</Link>
        </Button>
      </div>
    );
  }

  const { affiliate, recentEarnings, recentPayouts } = data;
  const referralLink = `${site.url}?ref=${affiliate.affiliateCode}`;

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Breadcrumb />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold">Affiliate Dashboard</h1>
        <div className="flex items-center gap-2">
          <Badge
            variant={
              affiliate.status === "approved"
                ? "success"
                : affiliate.status === "pending"
                  ? "pending"
                  : "destructive"
            }
            className="flex items-center gap-1"
          >
            {affiliate.status === "approved" && (
              <CheckCircle2 className="h-3 w-3" />
            )}
            {affiliate.status === "pending" && <Clock className="h-3 w-3" />}
            {affiliate.status === "rejected" && (
              <AlertCircle className="h-3 w-3" />
            )}
            Status: {affiliate.status.toUpperCase()}
          </Badge>
          <Button asChild variant="outline" size="sm">
            <Link href="/affiliate/payouts">Payout History</Link>
          </Button>
        </div>
      </div>

      {affiliate.status === "rejected" && (
        <Card className="border-red-200 bg-red-50/70">
          <CardContent className="pt-6 space-y-3">
            <p className="text-sm font-semibold text-red-700">
              Your application was rejected.
            </p>
            {affiliate.adminNote ? (
              <p className="text-sm text-red-700/90">
                Reason: {affiliate.adminNote}
              </p>
            ) : (
              <p className="text-sm text-red-700/90">
                Please review your application details and submit again.
              </p>
            )}
            <Button asChild size="sm" variant="destructive">
              <Link href="/affiliate/register">Update & Reapply</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Current Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(affiliate.earningsBalance)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available for withdrawal
            </p>
            {affiliate.status === "approved" && (
              <Button asChild size="sm" className="mt-4 w-full">
                <Link href="/affiliate/payouts">Request Payout</Link>
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(affiliate.totalEarnings)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
              Affiliate Code
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{affiliate.affiliateCode}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Your unique identifier
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <code className="flex-1 p-2 bg-muted rounded border truncate">
              {referralLink}
            </code>
            <CopyButton value={referralLink} />
            <Button asChild variant="outline" size="icon">
              <a href={referralLink} target="_blank" rel="noopener noreferrer">
                <ExternalLinkIcon className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Share this link with your audience. When they make a purchase using
            your link, you earn commission!
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEarnings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No earnings yet.
              </p>
            ) : (
              <div className="space-y-4">
                {recentEarnings.map((earning: any) => (
                  <div
                    key={earning._id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">
                        Order #{earning.order?.trackingNumber || "N/A"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(earning.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        +{formatCurrency(earning.amount)}
                      </p>
                      <Badge
                        variant={
                          earning.status === "earned"
                            ? "success"
                            : earning.status === "pending"
                              ? "pending"
                              : "destructive"
                        }
                        className="text-[10px] h-4 flex items-center gap-1"
                      >
                        {earning.status === "earned" && (
                          <CheckCircle2 className="h-2 w-2" />
                        )}
                        {earning.status === "pending" && (
                          <Clock className="h-2 w-2" />
                        )}
                        {earning.status === "cancelled" && (
                          <AlertCircle className="h-2 w-2" />
                        )}
                        {earning.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payouts</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPayouts.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No payout history.
              </p>
            ) : (
              <div className="space-y-4">
                {recentPayouts.map((payout: any) => (
                  <div
                    key={payout._id}
                    className="flex justify-between items-center border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{payout.paymentMethod}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(payout.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        -{formatCurrency(payout.amount)}
                      </p>
                      <Badge
                        variant={
                          payout.status === "paid"
                            ? "success"
                            : payout.status === "pending"
                              ? "pending"
                              : "destructive"
                        }
                        className="text-[10px] min-h-4 px-1.5 flex items-center gap-1"
                      >
                        {payout.status === "paid" && (
                          <CheckCircle2 className="h-2 w-2" />
                        )}
                        {payout.status === "pending" && (
                          <Clock className="h-2 w-2" />
                        )}
                        {payout.status === "rejected" && (
                          <AlertCircle className="h-2 w-2" />
                        )}
                        {payout.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
