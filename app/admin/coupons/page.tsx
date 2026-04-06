import { Metadata } from "next";
import {
  getAllCoupons,
  getCouponStats,
} from "@/lib/actions/coupon.actions";
import CouponStatsCards from "./coupon-stats-cards";
import { CouponsDateRangePicker } from "./date-range-picker";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Search, Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";
import Form from "next/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateTime, formatId } from "@/lib/utils";
import DeleteDialog from "@/components/shared/delete-dialog";
import { deleteCoupon } from "@/lib/actions/coupon.actions";
import Pagination from "@/components/shared/pagination";
import { ICoupon } from "@/lib/db/models/coupon.model";

export const metadata: Metadata = {
  title: "Admin Coupons",
};

export default async function AdminCouponPage(props: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    from?: string;
    to?: string;
    sort?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Math.floor(Number(searchParams.page) || 1));
  const {
    query = "",
    from,
    to,
    sort = "latest",
  } = searchParams;

  const [data, stats] = await Promise.all([
    getAllCoupons({
      query,
      page,
      from,
      to,
      sort,
    }),
    getCouponStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold text-3xl">Coupons</h1>
          <p className="text-muted-foreground">
            Manage promotional discounts and affiliate codes
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Form action="/admin/coupons" className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="query"
              placeholder="Search coupons..."
              defaultValue={query}
              className="pl-9"
            />
            {from && <input type="hidden" name="from" value={from} />}
            {to && <input type="hidden" name="to" value={to} />}
          </Form>
          <CouponsDateRangePicker />
          <Button asChild>
            <Link href="/admin/coupons/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Coupon
            </Link>
          </Button>
        </div>
      </div>

      <CouponStatsCards stats={stats} />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Min Purchase</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.coupons.length > 0 ? (
              data.coupons.map((coupon: ICoupon) => (
                <TableRow key={coupon._id.toString()}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatId(coupon._id.toString())}
                  </TableCell>
                  <TableCell className="font-bold">
                    <div className="flex items-center gap-2">
                       <Ticket className="size-3 text-muted-foreground" />
                       {coupon.code}
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    {coupon.discountType}
                  </TableCell>
                  <TableCell className="font-medium">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}%`
                      : `KES.${coupon.discountValue}`}
                  </TableCell>
                  <TableCell>
                    {coupon.minPurchase
                      ? `KES.${coupon.minPurchase}`
                      : "No Minimum"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-xs">{coupon.usageCount} / {coupon.maxUsage || "∞"}</span>
                      <div className="mt-1 h-1 w-16 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: coupon.maxUsage
                              ? `${Math.min((coupon.usageCount / coupon.maxUsage) * 100, 100)}%`
                              : "100%"
                          }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {coupon.expiryDate ? (
                      <div className="flex flex-col">
                        <span className={new Date(coupon.expiryDate) < new Date() ? "text-rose-500 font-medium" : ""}>
                          {formatDateTime(coupon.expiryDate).dateOnly}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDateTime(coupon.expiryDate).timeOnly}
                        </span>
                      </div>
                    ) : (
                      "No Expiry"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/coupons/${coupon._id}`}>Edit</Link>
                      </Button>
                      <DeleteDialog id={coupon._id.toString()} action={deleteCoupon} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No coupons found matching the criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data.totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={data.totalPages} />
        </div>
      )}
    </div>
  );
}
