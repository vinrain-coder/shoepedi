import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconUsers, IconWallet, IconArrowsExchange, IconTrendingUp } from "@tabler/icons-react";
import { formatNumber } from "@/lib/utils";

interface StatsProps {
  totalUsers: number;
  totalWalletHolders: number;
  totalWalletBalance: number;
  averageBalance: number;
  topHolderName: string;
  topHolderBalance: number;
  totalAdjustments: number;
}

export function WalletStatsCards({ stats }: { stats: StatsProps }) {
  const cards = [
    {
      title: "Circulating Balance",
      value: formatNumber(stats.totalWalletBalance),
      description: "Total value across all wallets",
      icon: IconWallet,
      color: "text-emerald-600",
    },
    {
      title: "Wallet Holders",
      value: stats.totalWalletHolders,
      description: `${stats.totalUsers > 0 ? ((stats.totalWalletHolders / stats.totalUsers) * 100).toFixed(1) : "0.0"}% of total users`,
      icon: IconUsers,
      color: "text-blue-600",
    },
    {
      title: "Average Balance",
      value: formatNumber(stats.averageBalance),
      description: "Mean balance per holder",
      icon: IconTrendingUp,
      color: "text-amber-600",
    },
    {
      title: "Manual Adjustments",
      value: stats.totalAdjustments,
      description: "Total admin interventions",
      icon: IconArrowsExchange,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
