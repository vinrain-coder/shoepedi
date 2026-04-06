"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Star,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  ShieldCheck,
  MessageSquareOff,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ReviewStatsCardsProps {
  stats: {
    totalReviews: number;
    avgRating: string | number;
    verifiedPurchases: number;
    pendingReplies: number;
  };
  currentRating?: string;
}

export default function ReviewStatsCards({
  stats,
  currentRating = "all",
}: ReviewStatsCardsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  const handleRatingClick = (rating: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (rating === "all") {
      params.delete("rating");
    } else {
      params.set("rating", rating);
    }
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, {
      scroll: false,
    });
  };

  const statConfig = [
    {
      id: "all",
      label: "Total Reviews",
      value: stats.totalReviews,
      icon: LayoutGrid,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      clickable: true,
    },
    {
      id: "avg",
      label: "Avg Rating",
      value: `${stats.avgRating}/5`,
      icon: Star,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      clickable: false,
    },
    {
      id: "verified",
      label: "Verified",
      value: stats.verifiedPurchases,
      icon: ShieldCheck,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
      clickable: false,
    },
    {
      id: "pending",
      label: "Pending Reply",
      value: stats.pendingReplies,
      icon: MessageSquareOff,
      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
      clickable: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Review Overview</h2>
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {statConfig.map((stat) => {
            const isActive = currentRating === stat.id;
            const Icon = stat.icon;

            return (
              <button
                key={stat.id}
                type="button"
                disabled={!stat.clickable}
                onClick={() => stat.clickable && handleRatingClick(stat.id)}
                className={cn(
                  "w-full text-left focus:outline-none",
                  !stat.clickable && "cursor-default"
                )}
              >
                <Card
                  className={cn(
                    "transition-all",
                    stat.clickable && "cursor-pointer hover:ring-2 hover:ring-primary/20",
                    isActive
                      ? "ring-2 ring-primary"
                      : "opacity-80 shadow-none border-dashed"
                  )}
                >
                  <CardContent className="flex flex-col items-center justify-center p-3 text-center">
                    <div className={cn("rounded-full p-1.5 mb-1", stat.color)}>
                      <Icon className="size-3" />
                    </div>
                    <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-tight line-clamp-1">
                      {stat.label}
                    </span>
                    <span className="text-lg font-bold leading-tight">
                      {stat.value}
                    </span>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
