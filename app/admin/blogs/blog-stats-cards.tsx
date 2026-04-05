"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  FileEdit,
  Eye,
  ThumbsUp,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface BlogStatsCardsProps {
  stats: {
    totalBlogs: number;
    publishedBlogs: number;
    draftBlogs: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
  };
  currentStatus?: string;
}

export default function BlogStatsCards({
  stats,
  currentStatus = "all",
}: BlogStatsCardsProps) {
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
      label: "Total Blogs",
      value: stats.totalBlogs,
      icon: LayoutGrid,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      clickable: true,
    },
    {
      id: "true",
      label: "Published",
      value: stats.publishedBlogs,
      icon: Eye,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
      clickable: true,
    },
    {
      id: "false",
      label: "Draft",
      value: stats.draftBlogs,
      icon: FileEdit,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
      clickable: true,
    },
    {
      id: "views",
      label: "Total Views",
      value: stats.totalViews,
      icon: BarChart3,
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      clickable: false,
    },
    {
      id: "likes",
      label: "Total Likes",
      value: stats.totalLikes,
      icon: ThumbsUp,
      color: "bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
      clickable: false,
    },
    {
      id: "comments",
      label: "Total Comments",
      value: stats.totalComments,
      icon: MessageSquare,
      color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
      clickable: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Engagement Overview</h2>
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
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
          {statConfig.map((stat) => {
            const isActive = currentStatus === stat.id;
            const Icon = stat.icon;

            return (
              <Card
                key={stat.id}
                className={cn(
                  "transition-all",
                  stat.clickable ? "cursor-pointer hover:ring-2 hover:ring-primary/20" : "cursor-default",
                  isActive
                    ? "ring-2 ring-primary"
                    : "opacity-80 shadow-none border-dashed"
                )}
                onClick={() => stat.clickable && handleStatusClick(stat.id)}
              >
                <CardContent className="flex flex-col items-center justify-center p-3 text-center">
                  <div className={cn("rounded-full p-1.5 mb-1", stat.color)}>
                    <Icon className="size-3" />
                  </div>
                  <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-tight line-clamp-1">
                    {stat.label}
                  </span>
                  <span className="text-lg font-bold leading-tight">
                    {stat.value.toLocaleString()}
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
