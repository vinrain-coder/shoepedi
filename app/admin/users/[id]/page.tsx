import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock3,
  UserCircle,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import ProductPrice from "@/components/shared/product/product-price";
import { getAdminUserInsights } from "@/lib/server/actions/user.actions";
import { formatDateTime, formatId } from "@/lib/utils";

import UserEditForm from "./user-edit-form";
import UserOrderHistoryChart from "./user-order-history-chart";
import UserInsightStatsCards from "./user-insight-stats-cards";
import Image from "next/image";

export const metadata: Metadata = {
  title: "User Insights",
};

export default async function UserEditPage(props: {
  params: Promise<{
    id: string;
  }>;
}) {
  const params = await props.params;
  const { id } = params;

  let data: Awaited<ReturnType<typeof getAdminUserInsights>>;
  try {
    data = await getAdminUserInsights(id);
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      notFound();
    }
    throw error;
  }

  const { user, metrics, monthlyOrders, recentOrders, navigationHistory } = data;


  return (
    <main className="mx-auto w-full max-w-7xl space-y-4 px-0 sm:px-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/admin/users" className="hover:underline">
              Users
            </Link>
            <span>›</span>
            <span>{user.email}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{user.name}</h1>
          <p className="text-muted-foreground">
            Full customer profile, order insights, wishlist snapshot, and navigation activity.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/users">
            <ArrowLeft className="mr-2 size-4" />
            Back to users
          </Link>
        </Button>
      </div>

      <UserInsightStatsCards
        stats={{
          totalOrders: metrics.totalOrders,
          totalSpent: metrics.totalSpent,
          wishlistCount: metrics.wishlistCount,
          deliveredOrders: metrics.deliveredOrders,
        }}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Order History Trend</CardTitle>
            <CardDescription>Monthly order volume for this user.</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyOrders.length > 0 ? (
              <UserOrderHistoryChart data={monthlyOrders} />
            ) : (
              <p className="text-sm text-muted-foreground">No order history yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Account metadata and lifecycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Role</span>
              <Badge>{user.role}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Joined</span>
              <span>{formatDateTime(user.createdAt).dateOnly}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Paid Orders</span>
              <span>{metrics.paidOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Avg Order Value</span>
              <span>
                <ProductPrice price={metrics.avgOrderValue} plain />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Latest purchases by this user.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order: { _id: string; createdAt: Date; status: string; totalPrice: number }) => (
                    <TableRow key={order._id}>
                      <TableCell>
                        <Link className="underline" href={`/admin/orders/${order._id}`}>
                          {formatId(order._id)}
                        </Link>
                      </TableCell>
                      <TableCell>{formatDateTime(order.createdAt).dateOnly}</TableCell>
                      <TableCell className="capitalize">{String(order.status).replaceAll("_", " ")}</TableCell>
                      <TableCell>
                        <ProductPrice price={order.totalPrice} plain />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-20 text-center text-muted-foreground">
                      No orders yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wishlist</CardTitle>
            <CardDescription>Latest saved products.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.isArray(user.wishlist) && user.wishlist.length > 0 ? (
              user.wishlist.map((product: { _id: string; name: string; category: string; slug: string; images?: string[] }) => (
                <div key={product._id} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 overflow-hidden rounded border">
                      <Image
                        src={product.images?.[0] || "/images/placeholder.jpg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-tight">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.category}</p>
                    </div>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/product/${product.slug}`}>Open</Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No wishlist items.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Navigation History</CardTitle>
          <CardDescription>
            Most recent pages visited (tracked for signed-in users from this deployment onward).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {navigationHistory.length > 0 ? (
            <div className="space-y-2">
              {navigationHistory.map((item: { path: string; title?: string; visitedAt: Date }, index: number) => (
                <div
                  key={`${item.path}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3"
                >
                  <div className="flex items-center gap-2">
                    <Clock3 className="size-4 text-muted-foreground" />
                    <span className="font-medium">{item.title || item.path}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="mr-3">{item.path}</span>
                    <span>{formatDateTime(item.visitedAt).dateTime}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No navigation events captured yet for this user.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="size-5" />
            Edit User Details
          </CardTitle>
          <CardDescription>Update profile and role with immediate admin control.</CardDescription>
        </CardHeader>
        <CardContent>
          <UserEditForm user={user} />
        </CardContent>
      </Card>
    </main>
  );
}
