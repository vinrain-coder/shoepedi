import { Metadata } from "next";
import { getAllDeliveryLocations } from "@/lib/actions/delivery-location.actions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatId } from "@/lib/utils";
import DeleteDialog from "@/components/shared/delete-dialog";
import { deleteDeliveryLocation } from "@/lib/actions/delivery-location.actions";

export const metadata: Metadata = {
  title: "Admin Delivery Locations",
};

export default async function AdminDeliveryLocationPage() {
  const res = await getAllDeliveryLocations();
  const deliveryLocations = res.success ? res.data : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold text-3xl">Delivery Locations</h1>
          <p className="text-muted-foreground">
            Manage counties, cities and their delivery rates
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

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>County</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Rates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveryLocations.length > 0 ? (
              deliveryLocations.map((location: any) => (
                <TableRow key={location._id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatId(location._id)}
                  </TableCell>
                  <TableCell className="font-bold">
                    <div className="flex items-center gap-2">
                       <MapPin className="size-3 text-muted-foreground" />
                       {location.county}
                    </div>
                  </TableCell>
                  <TableCell>
                    {location.city}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {location.rates.map((rate: any, idx: number) => (
                        <span key={idx} className="text-xs">
                          {rate.deliveryDateName}: <span className="font-medium text-primary">KES.{rate.price}</span>
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/delivery-locations/${location._id}`}>Edit</Link>
                      </Button>
                      <DeleteDialog id={location._id} action={deleteDeliveryLocation} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No delivery locations found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
