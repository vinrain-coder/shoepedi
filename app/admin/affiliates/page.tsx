import { getAllAffiliates } from "@/lib/actions/affiliate.actions";
import AffiliatesAdminPage from "./affiliates-list";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string, status?: string }> }) {
  const { page = "1", status } = await searchParams;
  const { success, data } = await getAllAffiliates({ page: Number(page), status });

  if (!success) return <div>Error loading affiliates</div>;

  return <AffiliatesAdminPage affiliates={data} />;
}
