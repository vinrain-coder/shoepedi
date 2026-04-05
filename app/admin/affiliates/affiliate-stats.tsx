"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  Wallet,
  Trophy,
  History,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  LineChart as ChartIcon,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LeaderboardEntry {
  _id: string;
  total: number;
  code: string;
  name: string;
}

interface MonthlyPayout {
  label: string;
  value: number;
}

interface AffiliateStatsProps {
  stats: {
    periodLeaderboard: LeaderboardEntry[];
    totalEarnedInPeriod: number;
    totalDue: number;
    monthlyPayouts: MonthlyPayout[];
    allTimeLeaderboard: LeaderboardEntry[];
  };
}

export default function AffiliateStats({ stats }: AffiliateStatsProps) {
  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChartIcon className="size-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Financial Analytics</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(!isVisible)}
          className="h-8 gap-1 text-xs"
        >
          {isVisible ? (
            <>
              Hide Analytics <ChevronUp className="size-3" />
            </>
          ) : (
            <>
              Show Analytics <ChevronDown className="size-3" />
            </>
          )}
        </Button>
      </div>

      {isVisible && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-dashed shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Earnings in Period</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalEarnedInPeriod)}</div>
                <p className="text-xs text-muted-foreground">Commission earned during selected dates</p>
              </CardContent>
            </Card>
            <Card className="border-dashed shadow-none">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Amount Due</CardTitle>
                <Wallet className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(stats.totalDue)}</div>
                <p className="text-xs text-muted-foreground">Unpaid affiliate balance across all time</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="h-4 w-4" /> Monthly Payouts
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.monthlyPayouts}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis
                      dataKey="label"
                      axisLine={false}
                      tickLine={false}
                      fontSize={10}
                      tickMargin={10}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      fontSize={10}
                      tickFormatter={(val) => formatCurrency(val).replace(/\.00$/, "")}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm text-xs">
                              <p className="font-bold">{payload[0].payload.label}</p>
                              <p className="text-primary">{formatCurrency(payload[0].value as number)}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar
                      dataKey="value"
                      radius={[4, 4, 0, 0]}
                      fill="hsl(var(--primary))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-amber-500" /> Top Earners (Period)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.periodLeaderboard.length === 0 ? (
                      <p className="text-xs text-center text-muted-foreground py-4">No earnings in this period</p>
                    ) : (
                      stats.periodLeaderboard.map((item, i) => (
                        <div key={item._id} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-muted-foreground w-4">{i + 1}.</span>
                            <div className="flex flex-col">
                              <span className="font-semibold">{item.name}</span>
                              <span className="text-[10px] text-muted-foreground uppercase">{item.code}</span>
                            </div>
                          </div>
                          <span className="font-bold">{formatCurrency(item.total)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-blue-500" /> Top Earners (All Time)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.allTimeLeaderboard.length === 0 ? (
                      <p className="text-xs text-center text-muted-foreground py-4">
                        No affiliates have earnings yet
                      </p>
                    ) : (
                      stats.allTimeLeaderboard.map((item, i) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-muted-foreground w-4">
                              {i + 1}.
                            </span>
                            <div className="flex flex-col">
                              <span className="font-semibold">{item.name}</span>
                              <span className="text-[10px] text-muted-foreground uppercase">
                                {item.code}
                              </span>
                            </div>
                          </div>
                          <span className="font-bold">
                            {formatCurrency(item.total)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
