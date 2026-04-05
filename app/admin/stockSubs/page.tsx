import { Metadata } from "next";
import {
  getAllStockSubscriptions,
  getStockSubscriptionStats,
} from "@/lib/actions/stock.actions";
import { getServerSession } from "@/lib/get-session";
import Pagination from "@/components/shared/pagination";
import StockSubStatsCards from "./stock-sub-stats-cards";
import StockSubFilters from "./stock-sub-filters";
import StockSubList from "./stock-sub-list";
import { StockSubDateRangePicker } from "./date-range-picker";

export const metadata: Metadata = {
  title: "Admin Stock Subscriptions",
};

export default async function StockSubscriptionsPage(props: {
  searchParams: Promise<{
    page?: string;
    filter?: string;
    query?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const {
    page = "1",
    filter = "all",
    query = "",
    from,
    to,
  } = searchParams;

  const session = await getServerSession();
  if (session?.user.role !== "ADMIN")
    throw new Error("Admin permission required");

  const [data, stats] = await Promise.all([
    getAllStockSubscriptions({
      page: Number(page),
      filter,
      query,
      from,
      to,
    }),
    getStockSubscriptionStats({
      query,
      from,
      to,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold">Stock Subscriptions</h1>
          <p className="text-muted-foreground">
            Monitor and manage customer restock alerts
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <StockSubDateRangePicker />
        </div>
      </div>

      <StockSubStatsCards stats={stats} currentFilter={filter} />

      <div className="rounded-md border bg-card p-4">
        <StockSubFilters />
      </div>

      <StockSubList data={data.data} />

      {data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={Number(page)} totalPages={data.totalPages} />
        </div>
      )}
    </div>
  );
}
