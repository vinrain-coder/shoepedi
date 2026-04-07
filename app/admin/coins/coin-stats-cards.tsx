"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn, formatNumber } from "@/lib/utils";
import { Coins, Users, Crown, RefreshCcw, ChevronDown, ChevronUp, LayoutPanelTop } from "lucide-react";
import { Button } from "@/components/ui/button";

const formatCoinAmount = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

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
  const [isVisible, setIsVisible] = useState(true);

  const cards = [
    {
      key: "circulation",
      title: "Circulating",
      value: formatCoinAmount(stats.circulatingCoins),
      detail: `Avg ${formatCoinAmount(stats.averageBalance)}`,
      icon: Coins,
      iconClass: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300",
    },
    {
      key: "holders",
      title: "Coin Holders",
      value: formatNumber(stats.totalCoinHolders),
      detail: `of ${formatNumber(stats.totalUsers)} users`,
      icon: Users,
      iconClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300",
    },
    {
      key: "top",
      title: "Top Holder",
      value: formatCoinAmount(stats.topHolderBalance),
      detail: stats.topHolderName,
      icon: Crown,
      iconClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300",
    },
    {
      key: "adjustments",
      title: "Adjustments",
      value: formatNumber(stats.totalAdjustments),
      detail: "Admin updates",
      icon: RefreshCcw,
      iconClass: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutPanelTop className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Coin Analytics</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible((prev) => !prev)}
          className="h-8 gap-1 text-xs"
        >
          {isVisible ? (
            <>
              Hide Stats <ChevronUp className="size-3" />
            </>
          ) : (
            <>
              Show Stats <ChevronDown className="size-3" />
            </>
          )}
        </Button>
      </div>

      {isVisible && (
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.key} className="border-dashed shadow-none">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wide">{card.title}</p>
                      <p className="text-base sm:text-xl font-bold leading-tight">{card.value}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{card.detail}</p>
                    </div>
                    <div className={cn("rounded-full p-1.5", card.iconClass)}>
                      <Icon className="size-3.5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
