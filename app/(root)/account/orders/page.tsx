import { getServerSession } from "@/lib/get-session";
import { redirect } from "next/navigation";
import { toSignInPath } from "@/lib/redirects";
import { Metadata } from "next";
import Link from "next/link";

import Pagination from "@/components/shared/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getMyOrders } from "@/lib/actions/order.actions";
import { cn, formatDateTime, formatId } from "@/lib/utils";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import ProductPrice from "@/components/shared/product/product-price";
import Breadcrumb from "@/components/shared/breadcrumb";

import { Package, CreditCard, CheckCircle2, Clock } from "lucide-react";

const PAGE_TITLE = "Your Orders";

export const metadata: Metadata = {
  title: PAGE_TITLE,
};

type OrdersPageProps = {
  searchParams?: {
    page?: string;
  };
};

type MyOrderRow = {
  _id: string;
  createdAt: string | Date;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string | Date;
  isDelivered: boolean;
  deliveredAt?: string | Date;
};

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const session = await getServerSession();

  if (!session?.user) {
    redirect(toSignInPath("/account"));
  }

  // ✅ FIX: Next.js 16+ searchParams is async
  const params = await searchParams;
  const page = Number(params?.page || 1);

  const orders = await getMyOrders({ page });

  // 📊 STATS
  const totalOrders = orders.data.length;

  const totalSpent = orders.data.reduce(
    (acc: number, order: MyOrderRow) => acc + order.totalPrice,
    0,
  );

  const paidOrders = orders.data.filter((o: MyOrderRow) => o.isPaid).length;

  const pendingOrders = orders.data.filter((o: MyOrderRow) => !o.isPaid).length;

  return (
    <div className="space-y-6">
      <Breadcrumb />

      <h1 className="h1-bold pt-2">{PAGE_TITLE}</h1>

      {/* 📊 MODERN STATS (CLEAN + MINIMAL) */}
      {/* 📊 MODERN STATS (MATCHING PRODUCT STATS STYLE) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {[
          {
            id: "orders",
            label: "Orders",
            value: totalOrders,
            icon: Package,
            color:
              "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
          },
          {
            id: "spent",
            label: "Spent",
            value: totalSpent,
            isPrice: true,
            icon: CreditCard,
            color:
              "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
          },
          {
            id: "paid",
            label: "Paid",
            value: paidOrders,
            icon: CheckCircle2,
            color:
              "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
          },
          {
            id: "pending",
            label: "Pending",
            value: pendingOrders,
            icon: Clock,
            color:
              "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.id}
              className={cn(
                "rounded-xl border-2 border-primary/20 border-dashed p-3 sm:p-4 transition-all",
                "hover:ring-2 hover:ring-primary/20 hover:shadow-sm",
              )}
            >
              <div className="flex flex-col items-center text-center gap-1">
                <div className={cn("rounded-full p-2 mb-1", stat.color)}>
                  <Icon className="h-4 w-4" />
                </div>

                <p className="text-[10px] sm:text-xs uppercase tracking-tight text-muted-foreground">
                  {stat.label}
                </p>

                <p className="text-lg sm:text-xl font-bold leading-tight">
                  {"isPrice" in stat ? (
                    <ProductPrice price={stat.value as number} plain />
                  ) : (
                    stat.value
                  )}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 📦 ORDERS TABLE */}
      <div className="overflow-x-auto rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs text-muted-foreground">
                Id
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Date
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Total
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Paid
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Delivered
              </TableHead>
              <TableHead className="text-xs text-muted-foreground">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {orders.data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  You have no orders yet.
                </TableCell>
              </TableRow>
            )}

            {orders.data.map((order: MyOrderRow) => {
              const orderId = String(order._id);

              return (
                <TableRow key={orderId}>
                  <TableCell className="text-sm">
                    <Link
                      href={`/account/orders/${orderId}`}
                      className="hover:underline"
                    >
                      {formatId(orderId)}
                    </Link>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {formatDateTime(order.createdAt!).dateTime}
                  </TableCell>

                  {/* 💰 FIXED PRICE SIZE */}
                  <TableCell className="font-medium">
                    <ProductPrice price={order.totalPrice} plain />
                  </TableCell>

                  <TableCell>
                    {order.isPaid && order.paidAt
                      ? formatDateTime(order.paidAt).dateTime
                      : "No"}
                  </TableCell>

                  <TableCell>
                    {order.isDelivered && order.deliveredAt
                      ? formatDateTime(order.deliveredAt).dateTime
                      : "No"}
                  </TableCell>

                  <TableCell>
                    <Link
                      href={`/account/orders/${orderId}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* 📄 PAGINATION */}
      {orders.totalPages > 1 && (
        <Pagination page={page} totalPages={orders.totalPages} />
      )}

      {/* 📚 HISTORY */}
      <BrowsingHistoryList className="mt-10" />
    </div>
  );
}
