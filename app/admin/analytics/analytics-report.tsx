"use client";

import { useEffect, useState, useTransition } from "react";
import { DateRange } from "react-day-picker";
import { Activity, Clock3, Eye, TimerReset, Users } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { getWebAnalyticsSummary } from "@/lib/actions/analytics.actions";
import { calculatePastDate, formatDateTime, formatNumber } from "@/lib/utils";
import { CalendarDateRangePicker } from "@/app/admin/overview/date-range-picker";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLORS = ["#2563eb", "#9333ea", "#0d9488", "#ea580c", "#dc2626", "#7c3aed"];

function formatDuration(seconds: number) {
  if (!seconds) return "0s";
  const mins = Math.floor(seconds / 60);
  const secs = Math.round(seconds % 60);
  if (!mins) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export default function AnalyticsReport() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: calculatePastDate(30),
    to: new Date(),
  });
  const [data, setData] = useState<Awaited<ReturnType<typeof getWebAnalyticsSummary>>>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!date) return;

    startTransition(async () => {
      const result = await getWebAnalyticsSummary(date);
      setData(result);
    });
  }, [date]);

  if (!data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[340px] rounded-xl" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Skeleton className="h-[360px] rounded-xl" />
          <Skeleton className="h-[360px] rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Web Analytics</h1>
          <p className="text-muted-foreground">
            Traffic and engagement insights inspired by Vercel Analytics.
          </p>
        </div>
        <CalendarDateRangePicker defaultDate={date} setDate={setDate} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="Visitors" value={formatNumber(data.totals.visitors)} icon={Users} />
        <MetricCard title="Page Views" value={formatNumber(data.totals.pageViews)} icon={Eye} />
        <MetricCard title="Sessions" value={formatNumber(data.totals.sessions)} icon={Activity} />
        <MetricCard title="Realtime (5m)" value={formatNumber(data.totals.realtimeVisitors)} icon={TimerReset} />
        <MetricCard title="Bounce Rate" value={`${data.totals.bounceRate}%`} icon={Clock3} />
        <MetricCard
          title="Avg Session Duration"
          value={formatDuration(data.totals.avgDurationSeconds)}
          icon={Clock3}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visitors vs Page Views</CardTitle>
          <CardDescription>
            {formatDateTime(new Date(data.range.from)).dateOnly} - {formatDateTime(new Date(data.range.to)).dateOnly}
            {isPending ? " · Refreshing..." : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.pageViewsByDay}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              />
              <Tooltip labelFormatter={(label) => formatDateTime(new Date(label)).dateOnly} />
              <Area type="monotone" dataKey="pageViews" stroke="#2563eb" fill="url(#colorViews)" />
              <Area type="monotone" dataKey="visitors" stroke="#9333ea" fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TopTableCard title="Top Pages" rows={data.topPages} primaryKey="path" label="Path" />
        <TopTableCard title="Top Referrers" rows={data.topReferrers} primaryKey="source" label="Source" />
        <TopTableCard title="Top Countries" rows={data.topCountries} primaryKey="country" label="Country" />



        <TopTableCard
          title="Top Browsers"
          rows={data.topBrowsers.map((item: { name: string; views: number }) => ({ browser: item.name, views: item.views }))}
          primaryKey="browser"
          label="Browser"
        />

        <Card>
          <CardHeader>
            <CardTitle>Device Breakdown</CardTitle>
            <CardDescription>Distribution by device class</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.topDevices} dataKey="views" nameKey="name" innerRadius={55} outerRadius={90}>
                  {data.topDevices.map((entry: { name: string; views: number }, index: number) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device</TableHead>
                  <TableHead className="text-right">Views</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topDevices.map((item: { name: string; views: number }) => (
                  <TableRow key={item.name}>
                    <TableCell className="capitalize">{item.name}</TableCell>
                    <TableCell className="text-right">{formatNumber(item.views)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function TopTableCard({
  title,
  rows,
  primaryKey,
  label,
}: {
  title: string;
  rows: Array<Record<string, string | number>>;
  primaryKey: string;
  label: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{label}</TableHead>
              <TableHead className="text-right">Views</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={String(row[primaryKey])}>
                  <TableCell className="max-w-[360px] truncate">{String(row[primaryKey])}</TableCell>
                  <TableCell className="text-right">{formatNumber(Number(row.views || 0))}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center text-muted-foreground">
                  No data collected yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
