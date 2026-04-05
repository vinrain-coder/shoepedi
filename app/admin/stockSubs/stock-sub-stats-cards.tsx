import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Bell, BellOff, ListTodo } from "lucide-react";
import Link from "next/link";

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
  const cards = [
    {
      title: "Total Subscriptions",
      value: stats.total,
      icon: ListTodo,
      filter: "all",
      color: "text-blue-600",
    },
    {
      title: "Pending Notifications",
      value: stats.pending,
      icon: Bell,
      filter: "pending",
      color: "text-amber-600",
    },
    {
      title: "Notified Subscribers",
      value: stats.notified,
      icon: BellOff,
      filter: "notified",
      color: "text-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = currentFilter === card.filter;

        return (
          <Link key={card.title} href={`/admin/stockSubs?filter=${card.filter}`}>
            <Card
              className={cn(
                "transition-all hover:shadow-md cursor-pointer",
                isActive && "ring-2 ring-primary"
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={cn("h-4 w-4", card.color)} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
