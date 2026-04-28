"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import NotifyButton from "./notify-button";
import DeleteDialog from "@/components/shared/delete-dialog";
import { deleteStockSubscription } from "@/lib/actions/stock.actions";
import { Badge } from "@/components/ui/badge";

interface StockSubListProps {
  data: any[];
}

export default function StockSubList({ data }: StockSubListProps) {
  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Subscribed At</TableHead>
            <TableHead>Notified At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((sub) => (
              <TableRow key={sub._id}>
                <TableCell>
                  {sub.product ? (
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 overflow-hidden rounded border">
                        <Image
                          src={sub.product.images[0]}
                          alt={sub.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <Link
                        href={`/admin/products/${sub.product._id}`}
                        className="font-medium hover:underline line-clamp-1 max-w-64"
                      >
                        {sub.product.name}
                      </Link>
                      {!sub.product.isPublished && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-4 px-1 uppercase"
                        >
                          Draft
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic">
                      Product not found
                    </span>
                  )}
                </TableCell>
                <TableCell>{sub.email}</TableCell>
                <TableCell>
                  {sub.isNotified ? (
                    <Badge variant="success" className="rounded-full">
                      Notified
                    </Badge>
                  ) : (
                    <Badge variant="pending" className="rounded-full">
                      Pending
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {formatDateTime(sub.subscribedAt).dateTime}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {sub.notifiedAt
                    ? formatDateTime(sub.notifiedAt).dateTime
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!sub.isNotified && sub.product && (
                      <NotifyButton
                        subscriptionId={sub._id}
                        productId={sub.product._id}
                      />
                    )}
                    <DeleteDialog
                      id={sub._id}
                      action={deleteStockSubscription}
                    />
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
                No subscriptions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
