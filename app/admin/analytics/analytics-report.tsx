"use client";

import { useEffect, useState, useTransition } from "react";
import { DateRange } from "react-day-picker";
import {
  Activity,
  Clock3,
  Eye,
  Globe,
  Gauge,
  TimerReset,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

import { getWebAnalyticsSummary } from "@/lib/actions/analytics.actions";
import { calculatePastDate, formatDateTime, formatNumber } from "@/lib/utils";
import { CalendarDateRangePicker } from "@/app/admin/overview/date-range-picker";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-[340px] rounded-xl" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-[330px] rounded-xl" />
          ))}
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
            Understand traffic quality, acquisition, and engagement across your storefront.
          </p>
        </div>
        <CalendarDateRangePicker defaultDate={date} setDate={setDate} />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard title="Visitors" value={formatNumber(data.totals.visitors)} icon={Users} tone="purple" />
        <MetricCard title="Page Views" value={formatNumber(data.totals.pageViews)} icon={Eye} tone="sky" />
        <MetricCard title="Sessions" value={formatNumber(data.totals.sessions)} icon={Activity} tone="indigo" />
        <MetricCard
          title="Realtime (5m)"
          value={formatNumber(data.totals.realtimeVisitors)}
          icon={TimerReset}
          tone="amber"
        />
        <MetricCard title="Bounce Rate" value={`${data.totals.bounceRate}%`} icon={Gauge} tone="rose" />
        <MetricCard
          title="Avg Session Duration"
          value={formatDuration(data.totals.avgDurationSeconds)}
          icon={Clock3}
          tone="emerald"
        />
      </div>

      <Card className="border-border/70 shadow-none">
        <CardHeader>
          <CardTitle>Visitors & Page Views Trend</CardTitle>
          <CardDescription>
            {formatDateTime(new Date(data.range.from)).dateOnly} -{" "}
            {formatDateTime(new Date(data.range.to)).dateOnly}
            {isPending ? " · Refreshing..." : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.pageViewsByDay}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.28} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.03} />
                  </linearGradient>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#9333ea" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="#9333ea" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })
                  }
                />
                <Tooltip
                  labelFormatter={(label) => formatDateTime(new Date(label)).dateOnly}
                />
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fill="url(#colorViews)"
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#9333ea"
                  strokeWidth={2}
                  fill="url(#colorVisitors)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <TopTableCard
          title="Top Pages"
          description="Most viewed storefront routes"
          rows={data.topPages}
          primaryKey="path"
          label="Path"
        />
        <TopTableCard
          title="Top Referrers"
          description="Traffic sources bringing users in"
          rows={data.topReferrers}
          primaryKey="source"
          label="Source"
        />
        <TopTableCard
          title="Top Countries"
          description="Countries based on edge header signals"
          rows={data.topCountries}
          primaryKey="country"
          label="Country"
        />
        <TopTableCard
          title="Top Browsers"
          description="Browsers used by visitors"
          rows={data.topBrowsers.map((item: { name: string; views: number }) => ({
            browser: item.name,
            views: item.views,
          }))}
          primaryKey="browser"
          label="Browser"
        />

        <Card className="xl:col-span-2 border-border/70 shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="size-4 text-muted-foreground" />
              Device Breakdown
            </CardTitle>
            <CardDescription>Distribution of traffic by device class.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.topDevices}
                    dataKey="views"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={85}
                    paddingAngle={2}
                  >
                    {data.topDevices.map(
                      (entry: { name: string; views: number }, index: number) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      )
                    )}
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
                    <TableCell className="text-right font-medium">
                      {formatNumber(item.views)}
                    </TableCell>
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
  tone,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "emerald" | "sky" | "indigo" | "purple" | "amber" | "rose";
}) {
  const toneClasses = {
    emerald: {
      border: "border-l-emerald-500",
      icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    },
    sky: {
      border: "border-l-sky-500",
      icon: "bg-sky-100 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400",
    },
    indigo: {
      border: "border-l-indigo-500",
      icon: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
    },
    purple: {
      border: "border-l-purple-500",
      icon: "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
    },
    amber: {
      border: "border-l-amber-500",
      icon: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    },
    rose: {
      border: "border-l-rose-500",
      icon: "bg-rose-100 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
    },
  }[tone];

  return (
    <Card className={`relative overflow-hidden border-l-4 shadow-sm transition-all hover:shadow-md ${toneClasses.border}`}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
        </div>
        <div className={`rounded-full p-2.5 ${toneClasses.icon}`}>
          <Icon className="size-4" />
        </div>
      </CardContent>
      <div className="absolute bottom-0 right-0 p-2 opacity-5">
        <Icon className="size-12" />
      </div>
    </Card>
  );
}

function TopTableCard({
  title,
  description,
  rows,
  primaryKey,
  label,
}: {
  title: string;
  description: string;
  rows: Array<Record<string, string | number>>;
  primaryKey: string;
  label: string;
}) {
  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
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
                  <TableCell className="max-w-[360px] truncate">
                    {String(row[primaryKey])}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatNumber(Number(row.views || 0))}
                  </TableCell>
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
