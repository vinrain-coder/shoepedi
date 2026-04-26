"use client";

import {
  BadgeDollarSign,
  Barcode,
  CreditCard,
  Users,
  Star,
  Mail,
  LifeBuoy,
  TrendingUp,
} from "lucide-react";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { calculatePastDate, formatDateTime, formatNumber } from "@/lib/utils";

import SalesCategoryPieChart from "./sales-category-pie-chart";
import OrderStatusChart from "./order-status-chart";

import { useEffect, useState, useTransition } from "react";
import { DateRange } from "react-day-picker";
import { getOrderSummary } from "@/lib/actions/order.actions";
import SalesAreaChart from "./sales-area-chart";
import { CalendarDateRangePicker } from "./date-range-picker";
import { IOrderList } from "@/types";
import ProductPrice from "@/components/shared/product/product-price";
import { Skeleton } from "@/components/ui/skeleton";
import TableChart from "./table-chart";

export default function OverviewReport() {
  const [date, setDate] = useState<DateRange | undefined>({
    from: calculatePastDate(30),
    to: new Date(),
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<{ [key: string]: any }>();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPending, startTransition] = useTransition();
  useEffect(() => {
    if (date) {
      startTransition(async () => {
        setData(await getOrderSummary(date));
      });
    }
  }, [date]);

  if (!data)
    return (
      <div className="space-y-4">
        {/* Summary Row 1 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-xl" />
          ))}
        </div>
        {/* Summary Row 2 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={index} className="h-32 w-full rounded-xl" />
          ))}
        </div>

        {/* Main Chart Row */}
        <div>
          <Skeleton className="h-100 w-full rounded-xl" />
        </div>

        {/* Secondary Charts Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, index) => (
            <Skeleton key={index} className="h-87.5 w-full rounded-xl" />
          ))}
        </div>

        {/* Categories and Status Row */}
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(2)].map((_, index) => (
            <Skeleton key={index} className="h-87.5 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Overview</h1>
          <p className="text-muted-foreground">
            Manage your store performance and see latest activity.
          </p>
        </div>
        <CalendarDateRangePicker defaultDate={date} setDate={setDate} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden border-l-4 border-l-emerald-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              <BadgeDollarSign className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <ProductPrice price={data.totalSales} plain />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gross sales in selected range
            </p>
          </CardContent>
          <div className="absolute bottom-0 right-0 p-2 opacity-5">
            <BadgeDollarSign className="size-12" />
          </div>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-sky-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <div className="rounded-full bg-sky-100 p-2 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400">
              <CreditCard className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(data.ordersCount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Confirmed transactions
            </p>
          </CardContent>
          <div className="absolute bottom-0 right-0 p-2 opacity-5">
            <CreditCard className="size-12" />
          </div>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-indigo-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order</CardTitle>
            <div className="rounded-full bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
              <TrendingUp className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <ProductPrice price={data.avgOrderValue} plain />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per order average revenue
            </p>
          </CardContent>
          <div className="absolute bottom-0 right-0 p-2 opacity-5">
            <TrendingUp className="size-12" />
          </div>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-purple-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <div className="rounded-full bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
              <Users className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.usersCount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              New registrations in range
            </p>
          </CardContent>
          <div className="absolute bottom-0 right-0 p-2 opacity-5">
            <Users className="size-12" />
          </div>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-amber-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Product Reviews</CardTitle>
            <div className="rounded-full bg-amber-100 p-2 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              <Star className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.reviewsCount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Customer feedback submitted
            </p>
          </CardContent>
          <div className="absolute bottom-0 right-0 p-2 opacity-5">
            <Star className="size-12" />
          </div>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-rose-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
            <div className="rounded-full bg-rose-100 p-2 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
              <Mail className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.newslettersCount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active newsletter members
            </p>
          </CardContent>
          <div className="absolute bottom-0 right-0 p-2 opacity-5">
            <Mail className="size-12" />
          </div>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-orange-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Inbox</CardTitle>
            <div className="rounded-full bg-orange-100 p-2 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
              <LifeBuoy className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.ticketsCount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Open tickets requiring action
            </p>
          </CardContent>
          <div className="absolute bottom-0 right-0 p-2 opacity-5">
            <LifeBuoy className="size-12" />
          </div>
        </Card>

        <Card className="relative overflow-hidden border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <div className="rounded-full bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Barcode className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(data.productsCount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active inventory items
            </p>
          </CardContent>
          <div className="absolute bottom-0 right-0 p-2 opacity-5">
            <Barcode className="size-12" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              Sales Performance
            </CardTitle>
            <CardDescription>Daily revenue trends in selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesAreaChart data={data.salesChartData} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
            <CardDescription>Distribution of order lifecycle</CardDescription>
          </CardHeader>
          <CardContent>
            <OrderStatusChart data={data.orderStatusDistribution} />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Subscribers</CardTitle>
              <CardDescription>Latest newsletter signups</CardDescription>
            </div>
            <Link
              href="/admin/newsletters"
              className="text-sm font-medium text-primary hover:underline"
            >
              View All
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.latestSubscribers.length > 0 ? (
                    data.latestSubscribers.map((sub: any) => (
                      <TableRow key={sub._id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{sub.email}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            sub.status === "subscribed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                          }`}>
                            {sub.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {sub.subscribedAt ? formatDateTime(sub.subscribedAt).dateOnly : "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center text-muted-foreground italic">
                        No recent subscribers.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Top Categories</CardTitle>
            <CardDescription>Sales distribution by product category</CardDescription>
          </CardHeader>
          <CardContent>
            <SalesCategoryPieChart data={data.topSalesCategories} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>Latest customer feedback across store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.latestReviews.length > 0 ? (
                data.latestReviews.map((review: any) => (
                  <div key={review._id} className="flex gap-4">
                    <Avatar className="size-9 border">
                      <AvatarImage src={review.user?.image} />
                      <AvatarFallback>{review.user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{review.user?.name}</span>
                        <div className="flex items-center text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`size-3 ${
                                i < review.rating ? "fill-current" : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs font-medium text-primary line-clamp-1">
                        {review.product?.name}
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2 italic">
                        &quot;{review.comment}&quot;
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatDateTime(review.createdAt).dateTime}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-40 items-center justify-center text-muted-foreground italic">
                  No reviews found in this period.
                </div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t">
              <Link
                href="/admin/reviews"
                className="text-sm font-medium text-primary hover:underline flex items-center justify-center gap-1"
              >
                Manage all reviews
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Earnings</CardTitle>
            <CardDescription>Revenue trajectory over last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <TableChart data={data.monthlySales} labelType="month" />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Best Sellers</CardTitle>
            <CardDescription>Highest performing products by sales</CardDescription>
          </CardHeader>
          <CardContent>
            <TableChart data={data.topSalesProducts} labelType="product" />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest transactions from your store</CardDescription>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-primary hover:underline"
          >
            View All
          </Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.latestOrders.map((order: IOrderList) => (
                  <TableRow key={order._id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">
                      {order.user ? order.user.name : "Guest Customer"}
                    </TableCell>
                    <TableCell>
                      {formatDateTime(order.createdAt).dateOnly}
                    </TableCell>
                    <TableCell>
                      <ProductPrice price={order.totalPrice} plain />
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/admin/orders/${order._id}`}
                        className="rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-accent"
                      >
                        Details
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
