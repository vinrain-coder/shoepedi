import { Metadata } from "next";
import Link from "next/link";
import DeleteDialog from "@/components/shared/delete-dialog";
import Pagination from "@/components/shared/pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteOrder, getAllOrders, getOrderStatusStats } from "@/lib/actions/order.actions";
import { formatDateTime, formatId } from "@/lib/utils";
import { IOrderList } from "@/types";
import ProductPrice from "@/components/shared/product/product-price";
import { getServerSession } from "@/lib/get-session";
import StatusCards from "./status-cards";
import { OrdersDateRangePicker } from "./date-range-picker";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLOR_STYLES } from "@/lib/order-tracking";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Form from "next/form";

export const metadata: Metadata = {
  title: "Admin Orders",
};

export default async function OrdersPage(props: {
  searchParams: Promise<{
    page?: string;
    status?: string;
    from?: string;
    to?: string;
    query?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const {
    page = "1",
    status = "all",
    from,
    to,
    query
  } = searchParams;

  const session = await getServerSession();
  if (session?.user.role !== "ADMIN")
    throw new Error("Admin permission required");

  const [orders, statsData] = await Promise.all([
    getAllOrders({
      page: Number(page),
      status,
      from,
      to,
      query,
    }),
    getOrderStatusStats({ from, to }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Form action="/admin/orders" className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="query"
              placeholder="Search orders..."
              defaultValue={query}
              className="pl-9"
            />
            {status !== "all" && <input type="hidden" name="status" value={status} />}
            {from && <input type="hidden" name="from" value={from} />}
            {to && <input type="hidden" name="to" value={to} />}
          </Form>
          <OrdersDateRangePicker />
        </div>
      </div>

      <StatusCards
        stats={statsData.stats}
        totalOrders={statsData.totalOrders}
        currentStatus={status}
      />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Id</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Delivered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.data.length > 0 ? (
              orders.data.map((order: IOrderList) => {
                const statusStyles = ORDER_STATUS_COLOR_STYLES[order.status];
                return (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono text-xs">{formatId(order._id)}</TableCell>
                    <TableCell>
                      {formatDateTime(order.createdAt!).dateTime}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{order.user ? order.user.name : "Deleted User"}</span>
                        {order.trackingNumber && (
                          <span className="text-[10px] text-muted-foreground uppercase">
                            {order.trackingNumber}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ProductPrice price={order.totalPrice} plain />
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${statusStyles.bg} ${statusStyles.text} ${statusStyles.border}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${statusStyles.dot}`} />
                        {ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </TableCell>
                    <TableCell>
                      {order.isPaid && order.paidAt ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Yes</span>
                          <span className="text-[10px] text-muted-foreground">{formatDateTime(order.paidAt).dateTime}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {order.isDelivered && order.deliveredAt ? (
                        <div className="flex flex-col">
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Yes</span>
                          <span className="text-[10px] text-muted-foreground">{formatDateTime(order.deliveredAt).dateTime}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/orders/${order._id}`}>Details</Link>
                        </Button>
                        <DeleteDialog id={order._id} action={deleteOrder} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No orders found matching the criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {orders.totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={orders.totalPages!} />
        </div>
      )}
    </div>
  );
}
