"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Barcode,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  FileEdit,
  Eye,
  AlertTriangle,
  Archive,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ProductStatsCardsProps {
  stats: {
    totalProducts: number;
    publishedProducts: number;
    draftProducts: number;
    outOfStockProducts: number;
    lowStockProducts: number;
  };
  currentStatus?: string;
}

export default function ProductStatsCards({
  stats,
  currentStatus = "all",
}: ProductStatsCardsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  const handleStatusClick = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("isPublished");
    } else {
      params.set("isPublished", status);
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
      value: stats.totalProducts,
      icon: LayoutGrid,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      id: "true",
      label: "Published",
      value: stats.publishedProducts,
      icon: Eye,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    },
    {
      id: "false",
      label: "Draft",
      value: stats.draftProducts,
      icon: FileEdit,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    },
    {
      id: "low_stock",
      label: "Low Stock",
      value: stats.lowStockProducts,
      icon: AlertTriangle,
      color: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    },
    {
      id: "out_of_stock",
      label: "Out of Stock",
      value: stats.outOfStockProducts,
      icon: Archive,
      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Barcode className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Inventory Overview</h2>
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
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
            );
          })}
        </div>
      )}
    </div>
  );
}
