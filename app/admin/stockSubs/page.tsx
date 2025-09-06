import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { formatDateTime } from "@/lib/utils";
import Pagination from "@/components/shared/pagination"; // Import Pagination
import { getAllStockSubscriptions } from "@/lib/actions/stock.actions";
import NotifyButton from "./notify-button";
import { getServerSession } from "@/lib/get-session";
import {
  ReactElement,
  JSXElementConstructor,
  ReactNode,
  ReactPortal,
} from "react";

export const metadata: Metadata = {
  title: "Admin Stock Subscriptions",
};

const validFilters = ["pending", "notified"] as const;
type FilterType = (typeof validFilters)[number];

export default async function StockSubscriptionsPage({
  searchParams,
}: {
  searchParams?: { page?: string; filter?: string };
}) {
  const session = await getServerSession();
  if (session?.user.role !== "ADMIN")
    throw new Error("Admin permission required");

  // Handle page and filter parameters
  const page = Number(searchParams?.page) || 1;
  const filter: FilterType = validFilters.includes(
    searchParams?.filter as FilterType
  )
    ? (searchParams?.filter as FilterType)
    : "pending";

  // Fetch paginated subscriptions
  const { data: subscriptions, totalPages } = await getAllStockSubscriptions({
    page,
    filter,
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="h1-bold">Stock Subscriptions</h1>

        <div className="flex gap-2">
          {validFilters.map((f) => (
            <Button
              key={f}
              asChild
              variant={filter === f ? "default" : "outline"}
            >
              <Link href={`/admin/stockSubs?filter=${f}`}>
                {f === "pending" ? "Pending" : "Notified"}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Subscribed At</TableHead>
            <TableHead>Notified</TableHead>
            <TableHead className="w-[150px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subscriptions && subscriptions.length > 0 ? (
            subscriptions.map(
              (sub: {
                _id: any;
                email: any;
                product: {
                  slug: any;
                  name:
                    | string
                    | number
                    | bigint
                    | boolean
                    | ReactElement<unknown, string | JSXElementConstructor<any>>
                    | Iterable<ReactNode>
                    | ReactPortal
                    | Promise<
                        | string
                        | number
                        | bigint
                        | boolean
                        | ReactPortal
                        | ReactElement<
                            unknown,
                            string | JSXElementConstructor<any>
                          >
                        | Iterable<ReactNode>
                        | null
                        | undefined
                      >
                    | null
                    | undefined;
                  _id: string;
                };
                subscribedAt: Date;
                isNotified: any;
              }) => (
                <TableRow key={sub?._id ?? Math.random()}>
                  {/* Email */}
                  <TableCell>{sub?.email ?? "N/A"}</TableCell>

                  {/* Product */}
                  <TableCell>
                    {sub?.product ? (
                      <Link
                        href={`/product/${sub.product.slug}`}
                        className="hover:underline"
                      >
                        {sub.product.name}
                      </Link>
                    ) : (
                      <span>Product not found</span>
                    )}
                  </TableCell>

                  {/* Subscribed At */}
                  <TableCell>
                    {sub?.subscribedAt
                      ? `${formatDateTime(sub.subscribedAt).dateOnly} ${formatDateTime(sub.subscribedAt).timeOnly}`
                      : "N/A"}
                  </TableCell>

                  {/* Notified */}
                  <TableCell>{sub?.isNotified ? "Yes" : "No"}</TableCell>

                  {/* Actions */}
                  <TableCell>
                    {!sub?.isNotified && sub?.product?._id && (
                      <NotifyButton productId={sub.product._id} />
                    )}
                  </TableCell>
                </TableRow>
              )
            )
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="text-center">
                No subscriptions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
    </div>
  );
}
