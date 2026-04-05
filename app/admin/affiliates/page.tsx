import { getAllAffiliates, getAffiliateAdminStats } from "@/lib/actions/affiliate.actions";
import AffiliatesAdminPage from "./affiliates-list";
import StatusCards from "./status-cards";
import { AffiliatesDateRangePicker } from "./date-range-picker";
import AffiliateStats from "./affiliate-stats";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Form from "next/form";

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

  if (!affiliatesData.success || !statsData.success)
    return <div>Error loading affiliates data</div>;

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Affiliates</h1>
          <p className="text-muted-foreground">
            Review applications and monitor performance
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Form action="/admin/affiliates" className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="query"
              placeholder="Search by name, email, or code..."
              defaultValue={query}
              className="pl-9"
            />
            {status !== "all" && (
              <input type="hidden" name="status" value={status} />
            )}
            {from && <input type="hidden" name="from" value={from} />}
            {to && <input type="hidden" name="to" value={to} />}
          </Form>
          <AffiliatesDateRangePicker />
        </div>
      </div>

      <StatusCards
        stats={statsData.data.statusStats}
        currentStatus={status}
      />

      <AffiliateStats stats={statsData.data} />

      <AffiliatesAdminPage
        affiliates={affiliatesData.data}
        totalPages={affiliatesData.totalPages}
        currentPage={Number(page)}
        totalAffiliates={affiliatesData.totalAffiliates}
      />
    </div>
  );
}
