import { Metadata } from "next";
import DeliveryLocationList from "./delivery-location-list";
import {
  getAllDeliveryLocations,
  getDeliveryLocationStats,
  getAllCounties,
} from "@/lib/actions/delivery-location.actions";
import DeliveryLocationStatsCards from "./delivery-location-stats-cards";
import DeliveryLocationFilters from "./delivery-location-filters";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Delivery Locations",
};

export default async function AdminDeliveryLocationPage(props: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    county?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const {
    page = "1",
    query = "",
    county = "all",
  } = searchParams;

  const [data, stats, counties] = await Promise.all([
    getAllDeliveryLocations({
      query,
      page: Number(page),
      county,
    }),
    getDeliveryLocationStats(),
    getAllCounties(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold">Delivery Locations</h1>
          <p className="text-muted-foreground">
            Manage shipping rates for different counties and places
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button asChild>
            <Link href="/admin/delivery-locations/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Location
            </Link>
          </Button>
        </div>
      </div>

      <DeliveryLocationStatsCards stats={stats} />

      <div className="rounded-md border bg-card p-4">
        <DeliveryLocationFilters counties={counties} />
      </div>

      <DeliveryLocationList
        data={data}
        page={Number(page)}
      />
    </div>
  );
}
