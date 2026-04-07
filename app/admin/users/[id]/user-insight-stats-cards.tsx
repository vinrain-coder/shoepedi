"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Heart, Receipt, ShoppingBag, Truck } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn, formatNumber } from "@/lib/utils";
import ProductPrice from "@/components/shared/product/product-price";

interface UserInsightStatsCardsProps {
  stats: {
    totalOrders: number;
    totalSpent: number;
    wishlistCount: number;
    deliveredOrders: number;
  };
}

export default function UserInsightStatsCards({ stats }: UserInsightStatsCardsProps) {
  const [isVisible, setIsVisible] = useState(true);

  const cards = [
    {
      id: "orders",
      label: "Total Orders",
      value: <span>{formatNumber(stats.totalOrders)}</span>,
      icon: ShoppingBag,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
    },
    {
      id: "spent",
      label: "Total Spend",
      value: <ProductPrice price={stats.totalSpent} plain />,
      icon: Receipt,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    },
    {
      id: "wishlist",
      label: "Wishlist",
      value: <span>{formatNumber(stats.wishlistCount)}</span>,
      icon: Heart,
      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
    },
    {
      id: "delivered",
      label: "Delivered",
      value: <span>{formatNumber(stats.deliveredOrders)}</span>,
      icon: Truck,
      color: "bg-violet-100 text-violet-600 dark:bg-violet-900/20 dark:text-violet-400",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">User Statistics</h2>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={() => setIsVisible((prev) => !prev)}
        >
          {isVisible ? (
            <>
              Hide <ChevronUp className="ml-1 size-3" />
            </>
          ) : (
            <>
              Show <ChevronDown className="ml-1 size-3" />
            </>
          )}
        </Button>
      </div>

      {isVisible && (
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.id} className={cn("border-dashed shadow-none")}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{card.label}</p>
                      <p className="text-base font-semibold leading-6">{card.value}</p>
                    </div>
                    <div className={cn("rounded-full p-1.5", card.color)}>
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
