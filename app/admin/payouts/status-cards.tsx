"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn, formatCurrency } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  LayoutPanelTop,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface StatusCardsProps {
  stats: {
    total: { count: number; amount: number };
    paid: { count: number; amount: number };
    pending: { count: number; amount: number };
    processing: { count: number; amount: number };
    rejected: { count: number; amount: number };
  };
  currentStatus?: string;
}

export default function StatusCards({
  stats,
  currentStatus = "all",
}: StatusCardsProps) {
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
      label: "Total",
      value: stats.total,
      icon: Wallet,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      id: "paid",
      label: "Paid",
      value: stats.paid,
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    },
    {
      id: "pending",
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    },
    {
      id: "processing",
      label: "Processing",
      value: stats.processing,
      icon: Loader2,
      color: "bg-sky-100 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400",
    },
    {
      id: "rejected",
      label: "Rejected",
      value: stats.rejected,
      icon: AlertCircle,
      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutPanelTop className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Payout Overview</h2>
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {statConfig.map((stat) => {
            const isActive = currentStatus === stat.id;
            const Icon = stat.icon;

            return (
              <Card
                key={stat.id}
                className={cn(
                  "cursor-pointer transition-all hover:ring-2 hover:ring-primary/20",
                  isActive
                    ? "ring-2 ring-primary"
                    : "opacity-80 shadow-none border-dashed"
                )}
                onClick={() => handleStatusClick(stat.id)}
              >
                <CardContent className="flex flex-col items-center justify-center p-3 text-center">
                  <div className={cn("rounded-full p-1.5 mb-1", stat.color)}>
                    <Icon className={cn("size-3", stat.id === "processing" && "animate-spin")} />
                  </div>
                  <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-tight line-clamp-1">
                    {stat.label}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold leading-tight">
                      {stat.value.count}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {formatCurrency(stat.value.amount)}
                    </span>
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
