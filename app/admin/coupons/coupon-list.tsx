/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { deleteCoupon, getAllCoupons } from "@/lib/actions/coupon.actions";
import { ICoupon } from "@/lib/db/models/coupon.model";
import React, { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { formatDateTime, formatId } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CouponListDataProps = {
  coupons: ICoupon[];
  totalPages: number;
  totalCoupons: number;
  to: number;
  from: number;
};

const CouponList = () => {
  const [page, setPage] = useState<number>(1);
  const [inputValue, setInputValue] = useState<string>("");
  const [data, setData] = useState<CouponListDataProps>();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (changeType: "next" | "prev") => {
    const newPage = changeType === "next" ? page + 1 : page - 1;
    setPage(newPage);

    startTransition(async () => {
      const response = await getAllCoupons({ query: inputValue, page });

      setData({
        ...response,
        from: (page - 1) * 10 + 1, // Adjust based on page size
        to: Math.min(page * 10, response.totalCoupons),
      });
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value) {
      clearTimeout((window as any).debounce);
      (window as any).debounce = setTimeout(() => {
        startTransition(async () => {
          const data = await getAllCoupons({ query: value, page: 1 });
          setData(data);
        });
      }, 500);
    } else {
      startTransition(async () => {
        const data = await getAllCoupons({ query: "", page });
        setData(data);
      });
    }
  };

  useEffect(() => {
    startTransition(async () => {
      const data = await getAllCoupons({ query: "" });
      setData(data);
    });
  }, []);

  return (
    <div>
      <div className="space-y-2">
        <div className="flex-between flex-wrap gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-bold text-lg">Coupons</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                className="w-auto"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Filter by code..."
              />

              {isPending ? (
                <p>Loading...</p>
              ) : (
                <p>
                  {data?.totalCoupons === 0
                    ? "No"
                    : `${data?.from}-${data?.to} of ${data?.totalCoupons}`}{" "}
                  results
                </p>
              )}
            </div>
          </div>

          <Button asChild variant="default">
            <Link href="/admin/coupons/create">Create Coupon</Link>
          </Button>
        </div>

        <div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Id</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min Purchase</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Usage Limit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.coupons.map((coupon: ICoupon) => (
                <TableRow key={coupon._id.toString()}>
                  <TableCell>{formatId(coupon._id.toString())}</TableCell>
                  <TableCell>{coupon.code}</TableCell>
                  <TableCell>
                    {coupon.discountType === "percentage"
                      ? "Percentage"
                      : "Fixed"}
                  </TableCell>
                  <TableCell>
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
                    {coupon.expiryDate
                      ? formatDateTime(coupon.expiryDate).dateTime
                      : "No Expiry"}
                  </TableCell>
                  <TableCell>
                    {coupon.maxUsage ? coupon.maxUsage : "Unlimited"}
                  </TableCell>
                  <TableCell className="flex gap-1">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/coupons/${coupon._id}`}>Edit</Link>
                    </Button>
                    <DeleteDialog
                      id={coupon._id.toString()}
                      action={deleteCoupon}
                      callbackAction={() => {
                        startTransition(async () => {
                          const data = await getAllCoupons({
                            query: inputValue,
                          });
                          setData(data);
                        });
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(data?.totalPages ?? 0) > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange("prev")}
                disabled={Number(page) <= 1}
                className="w-24"
              >
                <ChevronLeft /> Previous
              </Button>
              Page {page} of {data?.totalPages}
              <Button
                variant="outline"
                onClick={() => handlePageChange("next")}
                disabled={Number(page) >= (data?.totalPages ?? 0)}
                className="w-24"
              >
                Next <ChevronRight />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponList;
