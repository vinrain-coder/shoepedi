import { getAllPayouts, getPayoutAdminStats } from "@/lib/actions/affiliate.actions";
import PayoutsAdminPage from "./payouts-list";
import StatusCards from "./status-cards";
import PayoutFilters from "./payout-filters";
import { PayoutsDateRangePicker } from "./date-range-picker";

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

  const [payoutsData, statsData] = await Promise.all([
    getAllPayouts({
      page: Number(page),
      status,
      query,
      from,
      to,
    }),
    getPayoutAdminStats({ from, to }),
  ]);

  if (!payoutsData.success || !statsData.success) {
    return (
      <div className="w-full">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-destructive">
          <h2 className="text-lg font-bold">Failed to load payout data</h2>
          <ul className="mt-2 list-inside list-disc text-sm">
            {!payoutsData.success && (
              <li>Payouts List: {payoutsData.message}</li>
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
    total: { count: 0, amount: 0 },
    paid: { count: 0, amount: 0 },
    pending: { count: 0, amount: 0 },
    processing: { count: 0, amount: 0 },
    rejected: { count: 0, amount: 0 },
  };
  const payouts = payoutsData.data ?? [];
  const totalPages = payoutsData.totalPages ?? 1;
  const totalPayouts = payoutsData.totalPayouts ?? payouts.length;

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Payouts</h1>
          <p className="text-muted-foreground">
            Process and track affiliate payout requests
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <PayoutFilters />
          <PayoutsDateRangePicker />
        </div>
      </div>

      <StatusCards stats={stats} currentStatus={status} />

      <PayoutsAdminPage
        payouts={payouts}
        totalPages={totalPages}
        currentPage={Number(page)}
        totalPayouts={totalPayouts}
      />
    </div>
  );
}
