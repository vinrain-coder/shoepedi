"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bell, BellOff, ListTodo } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface StockSubStatsCardsProps {
  stats: {
    total: number;
    pending: number;
    notified: number;
  };
  currentFilter: string;
}

export default function StockSubStatsCards({
  stats,
  currentFilter,
}: StockSubStatsCardsProps) {
  const searchParams = useSearchParams();

  const getFilterLink = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("filter", filter);
    params.set("page", "1");
    return `/admin/stockSubs?${params.toString()}`;
  };

  const cards = [
    {
      title: "Total Subscriptions",
      value: stats.total,
      icon: ListTodo,
      filter: "all",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      title: "Pending Notifications",
      value: stats.pending,
      icon: Bell,
      filter: "pending",
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    },
    {
      title: "Notified Subscribers",
      value: stats.notified,
      icon: BellOff,
      filter: "notified",
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = currentFilter === card.filter;

        return (
          <Link key={card.title} href={getFilterLink(card.filter)}>
            <Card
              className={cn(
                "transition-all hover:ring-2 hover:ring-primary/20 cursor-pointer",
                isActive
                  ? "ring-2 ring-primary"
                  : "opacity-80 shadow-none border-dashed"
              )}
            >
              <CardContent className="flex flex-col items-center justify-center p-3 text-center">
                <div className={cn("rounded-full p-1.5 mb-1", card.color)}>
                  <Icon className="size-3" />
                </div>
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-tight line-clamp-1">
                  {card.title}
                </span>
                <span className="text-lg font-bold leading-tight">
                  {card.value}
                </span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
