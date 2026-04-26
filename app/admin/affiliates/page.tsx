import { getAllAffiliates, getAffiliateAdminStats } from "@/lib/actions/affiliate.actions";
import AffiliatesAdminPage from "./affiliates-list";
import StatusCards from "./status-cards";
import { AffiliatesDateRangePicker } from "./date-range-picker";
import AffiliateStats from "./affiliate-stats";
import AffiliateFilters from "./affiliate-filters";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    status?: string;
    query?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const {
    page = "1",
    status = "all",
    query,
    from,
    to,
  } = await searchParams;

  const [affiliatesData, statsData] = await Promise.all([
    getAllAffiliates({
      page: Number(page),
      status,
      query,
      from,
      to,
    }),
    getAffiliateAdminStats({ from, to }),
  ]);

  if (!affiliatesData.success || !statsData.success) {
    console.error("Affiliates data load failure:", {
      affiliatesError: affiliatesData.success ? null : affiliatesData.message,
      statsError: statsData.success ? null : statsData.message,
    });
    return (
      <div className="w-full space-y-8">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-destructive">
          <h2 className="text-lg font-bold">Failed to load affiliate data</h2>
          <ul className="mt-2 list-inside list-disc text-sm">
            {!affiliatesData.success && (
              <li>Affiliates List: {affiliatesData.message}</li>
            )}
            {!statsData.success && (
              <li>Admin Stats: {statsData.message}</li>
            )}
          </ul>
        </div>
      </div>
    );
  }

  const stats = statsData.data ?? {
    statusStats: { total: 0, approved: 0, pending: 0, rejected: 0 },
    periodLeaderboard: [],
    totalEarnedInPeriod: 0,
    totalDue: 0,
    monthlyPayouts: [],
    allTimeLeaderboard: [],
  };
  const affiliates = affiliatesData.data ?? [];
  const totalPages = affiliatesData.totalPages ?? 1;
  const totalAffiliates = affiliatesData.totalAffiliates ?? affiliates.length;

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Affiliates</h1>
          <p className="text-muted-foreground">
            Review applications and monitor performance
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <AffiliateFilters />
          <AffiliatesDateRangePicker />
        </div>
      </div>

      <StatusCards
        stats={stats.statusStats}
        currentStatus={status}
      />

      <AffiliateStats stats={stats} />

      <AffiliatesAdminPage
        affiliates={affiliates}
        totalPages={totalPages}
        currentPage={Number(page)}
        totalAffiliates={totalAffiliates}
      />
    </div>
  );
}
