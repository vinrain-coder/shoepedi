"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Newspaper,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  UserPlus,
  UserMinus,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface NewsletterStatsCardsProps {
  stats: {
    totalSubscribers: number;
    activeSubscribers: number;
    unsubscribedCount: number;
  };
  currentStatus?: string;
}

export default function NewsletterStatsCards({
  stats,
  currentStatus = "all",
}: NewsletterStatsCardsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  const handleStatusClick = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  const statConfig = [
    {
      id: "all",
      label: "Total Subs",
      value: stats.totalSubscribers,
      icon: LayoutGrid,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      id: "subscribed",
      label: "Active",
      value: stats.activeSubscribers,
      icon: UserPlus,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    },
    {
      id: "unsubscribed",
      label: "Unsubscribed",
      value: stats.unsubscribedCount,
      icon: UserMinus,
      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Newspaper className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Newsletter Overview</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
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
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {statConfig.map((stat) => {
            const isActive = currentStatus === stat.id;
            const Icon = stat.icon;

            return (
              <Card
                key={stat.id}
                className={cn(
                  "cursor-pointer border-dashed shadow-none transition-colors",
                  isActive
                    ? "ring-2 ring-primary"
                   : "opacity-80 border-dashed shadow-none"
                )}
                onClick={() => handleStatusClick(stat.id)}
              >
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] sm:text-xs uppercase tracking-wide text-muted-foreground">
                        {stat.label}
                      </p>
                      <p className="text-base sm:text-xl font-bold leading-tight">
                        {stat.value}
                      </p>
                    </div>
                    <div className={cn("rounded-full p-1.5", stat.color)}>
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
