"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Hash,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface TagStatsCardsProps {
  stats: {
    totalTags: number;
  };
}

export default function TagStatsCards({
  stats,
}: TagStatsCardsProps) {
  const [isVisible, setIsVisible] = useState(true);

  const statConfig = [
    {
      id: "all",
      label: "Total Tags",
      value: stats.totalTags,
      icon: Hash,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Hash className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Tag Overview</h2>
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
                  "transition-all hover:ring-2 hover:ring-primary/20",
                  "opacity-80 shadow-none border-dashed"
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
            );
          })}
        </div>
      )}
    </div>
  );
}
