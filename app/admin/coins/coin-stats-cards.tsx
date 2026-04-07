import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, Users, Crown, RefreshCcw } from "lucide-react";

export default function CoinStatsCards({
  stats,
}: {
  stats: {
    totalUsers: number;
    totalCoinHolders: number;
    circulatingCoins: number;
    averageBalance: number;
    topHolderName: string;
    topHolderBalance: number;
    totalAdjustments: number;
  };
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Circulating Coins</CardTitle>
          <Coins className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.circulatingCoins.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Avg balance {stats.averageBalance.toFixed(2)} coins</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Coin Holders</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCoinHolders}</div>
          <p className="text-xs text-muted-foreground">Out of {stats.totalUsers} total users</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Holder</CardTitle>
          <Crown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.topHolderBalance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground truncate">{stats.topHolderName}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Manual Adjustments</CardTitle>
          <RefreshCcw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalAdjustments}</div>
          <p className="text-xs text-muted-foreground">Total admin coin updates logged</p>
        </CardContent>
      </Card>
    </div>
  );
}
