"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLOR_STYLES,
  ORDER_TRACKING_STATUSES,
} from "@/lib/order-tracking";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Package, ListChecks, LayoutPanelTop, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface StatusCardsProps {
  stats: Record<string, number>;
  totalOrders: number;
  currentStatus?: string;
}

export default function StatusCards({
  stats,
  totalOrders,
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutPanelTop className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Order Statistics</h2>
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12">
          {/* "All" Card */}
          <Card
            className={cn(
              "cursor-pointer transition-all hover:ring-2 hover:ring-primary/20",
              currentStatus === "all" ? "ring-2 ring-primary" : "opacity-80 shadow-none border-dashed"
            )}
            onClick={() => handleStatusClick("all")}
          >
            <CardContent className="flex flex-col items-center justify-center p-3">
              <div className="rounded-full bg-primary/10 p-1.5 text-primary mb-1">
                <ListChecks className="size-3" />
              </div>
              <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-tight">
                All
              </span>
              <span className="text-lg font-bold leading-tight">{totalOrders}</span>
            </CardContent>
          </Card>

          {ORDER_TRACKING_STATUSES.map((status) => {
            const count = stats[status] || 0;
            const colorStyles = ORDER_STATUS_COLOR_STYLES[status];
            const isActive = currentStatus === status;

            return (
              <Card
                key={status}
                className={cn(
                  "cursor-pointer transition-all hover:ring-2 hover:ring-primary/20",
                  isActive ? "ring-2 ring-primary" : "opacity-80 shadow-none border-dashed"
                )}
                onClick={() => handleStatusClick(status)}
              >
                <CardContent className="flex flex-col items-center justify-center p-3 text-center">
                  <div className={cn("rounded-full p-1.5 mb-1", colorStyles.bg, colorStyles.text)}>
                    <Package className="size-3" />
                  </div>
                  <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-tight line-clamp-1">
                    {ORDER_STATUS_LABELS[status]}
                  </span>
                  <span className="text-lg font-bold leading-tight">{count}</span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
