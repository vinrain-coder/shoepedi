import { getAllPayouts } from "@/lib/actions/affiliate.actions";
import PayoutsAdminPage from "./payouts-list";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string, status?: string }> }) {
  const { page = "1", status } = await searchParams;
  const { success, data } = await getAllPayouts({ page: Number(page), status });

  if (!success) return <div>Error loading payouts</div>;

  return <PayoutsAdminPage payouts={data} />;
}
