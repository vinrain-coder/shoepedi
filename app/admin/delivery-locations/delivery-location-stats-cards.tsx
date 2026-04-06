"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Globe,
  Coins,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProductPrice from "@/components/shared/product/product-price";

interface DeliveryLocationStatsCardsProps {
  stats: {
    totalLocations: number;
    countiesCount: number;
    avgRate: number;
  };
}

export default function DeliveryLocationStatsCards({
  stats,
}: DeliveryLocationStatsCardsProps) {
  const [isVisible, setIsVisible] = useState(true);

  const statConfig = [
    {
      label: "Total Locations",
      value: stats.totalLocations,
      icon: MapPin,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      label: "Active Counties",
      value: stats.countiesCount,
      icon: Globe,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    },
    {
      label: "Average Rate",
      value: <ProductPrice price={stats.avgRate} plain />,
      icon: Coins,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayoutGrid className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Delivery Logistics Overview</h2>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {statConfig.map((stat, idx) => {
            const Icon = stat.icon;

            return (
              <Card
                key={idx}
                className="opacity-80 shadow-none border-dashed"
              >
                <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                  <div className={cn("rounded-full p-2 mb-2", stat.color)}>
                    <Icon className="size-4" />
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-tight line-clamp-1">
                    {stat.label}
                  </span>
                  <span className="text-xl font-bold leading-tight">
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
