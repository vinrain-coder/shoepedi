"use client";

import Link from "next/link";
import DeleteDialog from "@/components/shared/delete-dialog";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteDeliveryLocation, SerializedDeliveryLocation } from "@/lib/actions/delivery-location.actions";
import { formatDateTime, formatId } from "@/lib/utils";
import { PenBox } from "lucide-react";
import Pagination from "@/components/shared/pagination";
import ProductPrice from "@/components/shared/product/product-price";

interface DeliveryLocationListProps {
  data: {
    data: SerializedDeliveryLocation[];
    totalPages: number;
    totalLocations: number;
  };
  page: number;
}

const DeliveryLocationList = ({ data, page }: DeliveryLocationListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {data.totalLocations === 0
            ? "No delivery locations found"
            : `Showing ${data.data.length} of ${data.totalLocations} locations`}
        </p>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Id</TableHead>
              <TableHead>County</TableHead>
              <TableHead>City / Place</TableHead>
              <TableHead className="text-right">Base Rate</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.length > 0 ? (
              data.data.map((location) => (
                <TableRow key={location._id}>
                  <TableCell className="font-mono text-xs">
                    {formatId(location._id)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {location.county}
                  </TableCell>
                  <TableCell>
                    {location.city}
                  </TableCell>
                  <TableCell className="text-right">
                    <ProductPrice price={location.rate} plain />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatDateTime(location.createdAt).dateTime}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm" title="Edit">
                        <Link href={`/admin/delivery-locations/${location._id}`}>
                          <PenBox className="size-4" />
                        </Link>
                      </Button>
                      <DeleteDialog id={location._id} action={deleteDeliveryLocation} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  No delivery locations found matching the criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page.toString()} totalPages={data.totalPages} />
        </div>
      )}
    </div>
  );
};

export default DeliveryLocationList;
