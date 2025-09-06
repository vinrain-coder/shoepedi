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
import {
  deleteProduct,
  getAllProductsForAdmin,
} from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";

import React, { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { formatDateTime, formatId } from "@/lib/utils";
import { ChevronLeft, ChevronRight, EyeIcon, PenBox } from "lucide-react";
import Image from "next/image";

type ProductListDataProps = {
  products: IProduct[];
  totalPages: number;
  totalProducts: number;
  to: number;
  from: number;
};
const ProductList = () => {
  const [page, setPage] = useState<number>(1);
  const [inputValue, setInputValue] = useState<string>("");
  const [data, setData] = useState<ProductListDataProps>();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (changeType: "next" | "prev") => {
    const newPage = changeType === "next" ? page + 1 : page - 1;
    if (changeType === "next") {
      setPage(newPage);
    } else {
      setPage(newPage);
    }
    startTransition(async () => {
      const data = await getAllProductsForAdmin({
        query: inputValue,
        page: newPage,
      });
      setData(data);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    if (value) {
      clearTimeout((window as any).debounce);
      (window as any).debounce = setTimeout(() => {
        startTransition(async () => {
          const data = await getAllProductsForAdmin({ query: value, page: 1 });
          setData(data);
        });
      }, 500);
    } else {
      startTransition(async () => {
        const data = await getAllProductsForAdmin({ query: "", page });
        setData(data);
      });
    }
  };
  useEffect(() => {
    startTransition(async () => {
      const data = await getAllProductsForAdmin({ query: "" });
      setData(data);
    });
  }, []);

  return (
    <div>
      <div className="space-y-2">
        <div className="flex flex-row flex-wrap justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2 ">
            <h1 className="font-bold text-lg">Products</h1>
            <div className="flex flex-wrap items-center  gap-2 ">
              <Input
                className="w-auto"
                type="text "
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Filter name..."
              />

              {isPending ? (
                <p>Loading...</p>
              ) : (
                <p>
                  {data?.totalProducts === 0
                    ? "No"
                    : `${data?.from}-${data?.to} of ${data?.totalProducts}`}
                  {" results"}
                </p>
              )}
            </div>
          </div>

          <Button asChild variant="default">
            <Link href="/admin/products/create">Create Product</Link>
          </Button>
        </div>
        <div>
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Id</TableHead>
                <TableHead className="w-20">Image</TableHead>
                <TableHead className="w-60">Name</TableHead>
                <TableHead className="w-28 text-right">Price</TableHead>
                <TableHead className="w-40">Category</TableHead>
                <TableHead className="w-20">Stock</TableHead>
                <TableHead className="w-20">Rating</TableHead>
                <TableHead className="w-24">Published</TableHead>
                <TableHead className="w-40">Updated</TableHead>
                <TableHead className="w-36">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.products.map((product: IProduct) => (
                <TableRow key={product._id}>
                  <TableCell className="w-16">{formatId(product._id)}</TableCell>
                  <TableCell>
                    {product.images?.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="object-cover rounded-md border"
                      />
                    ) : (
                      <span>No Image</span>
                    )}
                  </TableCell>
                  <TableCell className="truncate">
                    <Link href={`/admin/products/${product._id}`}>
                      {product.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">${product.price}</TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell>{product.countInStock}</TableCell>
                  <TableCell>{product.avgRating}</TableCell>
                  <TableCell>{product.isPublished ? "Yes" : "No"}</TableCell>
                  <TableCell className="w-40">
                    {formatDateTime(product.updatedAt).dateTime}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-start gap-2">
                      <Button asChild variant="outline" size="sm" title="Edit">
                        <Link href={`/admin/products/${product._id}`}>
                          <PenBox />
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" title="View">
                        <Link target="_blank" href={`/product/${product.slug}`}>
                          <EyeIcon />
                        </Link>
                      </Button>
                      <DeleteDialog
                        id={product._id}
                        action={deleteProduct}
                        callbackAction={() => {
                          startTransition(async () => {
                            const data = await getAllProductsForAdmin({
                              query: inputValue,
                            });
                            setData(data);
                          });
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {(data?.totalPages ?? 0) > 1 && (
            <div className="flex items-center gap-2 justify-center">
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

export default ProductList;
