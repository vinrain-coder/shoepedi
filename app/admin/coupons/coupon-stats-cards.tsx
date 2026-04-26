"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Ticket,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CouponStatsCardsProps {
  stats: {
    totalCoupons: number;
    activeCoupons: number;
    expiredCoupons: number;
  };
  currentStatus?: string;
}

export default function CouponStatsCards({ stats }: CouponStatsCardsProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Note: Coupons don't currently have a 'status' filter in the same way products do,
  // but we can add one if needed. For now, this is for overview.
  // If we want to filter by active/expired, we'd need to update getAllCoupons.

  const statConfig = [
    {
      id: "all",
      label: "Total Coupons",
      value: stats.totalCoupons,
      icon: LayoutGrid,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      id: "active",
      label: "Active",
      value: stats.activeCoupons,
      icon: CheckCircle2,
      color:
        "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    },
    {
      id: "expired",
      label: "Expired",
      value: stats.expiredCoupons,
      icon: XCircle,
      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Ticket className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Coupon Overview</h2>
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
            const Icon = stat.icon;

            return (
              <Card
                key={stat.id}
                className={cn(
                  "border-dashed shadow-none transition-colors",
                  "opacity-80",
                )}
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
