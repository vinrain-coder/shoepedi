"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLOR_STYLES,
  ORDER_TRACKING_STATUSES,
} from "@/lib/order-tracking";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Package, ListChecks } from "lucide-react";

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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-12">
      {/* "All" Card */}
      <Card
        className={cn(
          "cursor-pointer transition-all hover:ring-2 hover:ring-primary/20",
          currentStatus === "all" ? "ring-2 ring-primary" : "opacity-80"
        )}
        onClick={() => handleStatusClick("all")}
      >
        <CardContent className="flex flex-col items-center justify-center p-4">
          <div className="rounded-full bg-primary/10 p-2 text-primary mb-2">
            <ListChecks className="size-4" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            All
          </span>
          <span className="text-xl font-bold">{totalOrders}</span>
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
              isActive ? "ring-2 ring-primary" : "opacity-80"
            )}
            onClick={() => handleStatusClick(status)}
          >
            <CardContent className="flex flex-col items-center justify-center p-4 text-center">
              <div className={cn("rounded-full p-2 mb-2", colorStyles.bg, colorStyles.text)}>
                <Package className="size-4" />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider line-clamp-1">
                {ORDER_STATUS_LABELS[status]}
              </span>
              <span className="text-xl font-bold">{count}</span>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
