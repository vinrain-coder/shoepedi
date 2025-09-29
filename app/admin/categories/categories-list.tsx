/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import React, { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import DeleteDialog from "@/components/shared/delete-dialog";
import {
  getAllCategoriesForAdmin,
  deleteCategory,
} from "@/lib/actions/category.actions";
import { ChevronLeft, ChevronRight, PenBox } from "lucide-react";
import { formatId, formatDateTime } from "@/lib/utils";

type CategoryListDataProps = {
  categories: any[]; // can refine to Category type
  totalPages: number;
  totalCategories: number;
  to: number;
  from: number;
};

const CategoryList = () => {
  const [page, setPage] = useState<number>(1);
  const [inputValue, setInputValue] = useState<string>("");
  const [data, setData] = useState<CategoryListDataProps>();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (changeType: "next" | "prev") => {
    const newPage = changeType === "next" ? page + 1 : page - 1;
    setPage(newPage);
    startTransition(async () => {
      const data = await getAllCategoriesForAdmin({
        query: inputValue,
        page: newPage,
      });
      setData(data);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    clearTimeout((window as any).debounce);
    (window as any).debounce = setTimeout(() => {
      startTransition(async () => {
        const data = await getAllCategoriesForAdmin({ query: value, page: 1 });
        setData(data);
      });
    }, 500);
  };

  useEffect(() => {
    startTransition(async () => {
      const data = await getAllCategoriesForAdmin({ query: "" });
      setData(data);
    });
  }, []);

  return (
    <div>
      <div className="space-y-2">
        <div className="flex flex-row flex-wrap justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-bold text-lg">Categories</h1>
            <div className="flex items-center gap-2">
              <input
                className="border rounded px-2 py-1 w-auto"
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder="Filter category..."
              />
              {isPending ? (
                <p>Loading...</p>
              ) : (
                <p>
                  {data?.totalCategories === 0
                    ? "No"
                    : `${data?.from}-${data?.to} of ${data?.totalCategories}`}{" "}
                  results
                </p>
              )}
            </div>
          </div>

          <Button asChild variant="default">
            <Link href="/admin/categories/create">Create Category</Link>
          </Button>
        </div>

        <div>
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>SEO Title</TableHead>
                <TableHead>SEO Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.categories.map((category: any) => (
                <TableRow key={category._id}>
                  <TableCell>{formatId(category._id)}</TableCell>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.parent?.name || "-"}</TableCell>
                  <TableCell>{category.seoTitle || "-"}</TableCell>
                  <TableCell>{category.seoDescription || "-"}</TableCell>
                  <TableCell>
                    {formatDateTime(category.createdAt).dateTime}
                  </TableCell>
                  <TableCell>
                    {formatDateTime(category.updatedAt).dateTime}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button asChild variant="outline" size="sm" title="Edit">
                        <Link href={`/admin/categories/${category._id}`}>
                          <PenBox />
                        </Link>
                      </Button>
                      <DeleteDialog
                        id={category._id}
                        action={deleteCategory}
                        callbackAction={() => {
                          startTransition(async () => {
                            const data = await getAllCategoriesForAdmin({
                              query: inputValue,
                              page,
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
            <div className="flex items-center gap-2 justify-center mt-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange("prev")}
                disabled={page <= 1}
                className="w-24"
              >
                <ChevronLeft /> Previous
              </Button>
              Page {page} of {data?.totalPages}
              <Button
                variant="outline"
                onClick={() => handlePageChange("next")}
                disabled={page >= (data?.totalPages ?? 0)}
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

export default CategoryList;
