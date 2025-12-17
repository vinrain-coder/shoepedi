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
import { ChevronLeft, ChevronRight, PenBox, Loader2 } from "lucide-react";
import { formatId, formatDateTime } from "@/lib/utils";
import { ICategory } from "@/lib/db/models/category.model"; // Adjust import path if needed

type CategoryListDataProps = {
  categories: ICategory[];
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

  // Initial Fetch
  useEffect(() => {
    fetchCategories(inputValue, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      // Only fetch if value changed to avoid double-fetch on mount
      // or simply rely on the debounce to handle the search updates
      if (inputValue !== "") {
        setPage(1); // Reset to page 1 on new search
        fetchCategories(inputValue, 1);
      } else {
        // Handle clear input case
        fetchCategories("", 1);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const fetchCategories = (query: string, currentPage: number) => {
    startTransition(async () => {
      const result = await getAllCategoriesForAdmin({
        query,
        page: currentPage,
      });
      // @ts-ignore - Mongoose lean() types can be tricky with explicit interfaces
      setData(result);
    });
  };

  const handlePageChange = (changeType: "next" | "prev") => {
    const newPage = changeType === "next" ? page + 1 : page - 1;
    setPage(newPage);
    fetchCategories(inputValue, newPage);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <h1 className="font-bold text-2xl">Categories</h1>
          
          <div className="relative w-full sm:w-auto">
            <input
              className="border rounded-md px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-slate-400"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Filter category name..."
            />
            {isPending && (
              <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            {data?.totalCategories === 0
              ? "No results"
              : `${data?.from}-${data?.to} of ${data?.totalCategories}`}
          </p>
        </div>

        <Button asChild variant="default">
          <Link href="/admin/categories/create">Create Category</Link>
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[150px]">Parent</TableHead>
              {/* Hide SEO on small screens, truncate heavily */}
              <TableHead className="hidden md:table-cell max-w-[150px]">SEO Title</TableHead>
              <TableHead className="hidden lg:table-cell max-w-[200px]">SEO Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.categories.map((category) => (
              <TableRow key={category._id as string}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {formatId(category._id as string)}
                </TableCell>
                <TableCell className="font-medium">
                  {category.name}
                  {/* Visual hint for subcategories */}
                  {category.parent && (
                    <span className="block text-xs text-muted-foreground">
                       ↳ Child
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  {/* Handle populated parent object */}
                  {typeof category.parent === 'object' && category.parent?.name 
                    ? category.parent.name 
                    : "-"}
                </TableCell>
                <TableCell className="hidden md:table-cell truncate max-w-[150px]" title={category.seoTitle}>
                  {category.seoTitle || "-"}
                </TableCell>
                <TableCell className="hidden lg:table-cell truncate max-w-[200px]" title={category.seoDescription}>
                  {category.seoDescription || "-"}
                </TableCell>
                <TableCell className="text-sm">
                  {formatDateTime(category.createdAt).dateTime}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild variant="ghost" size="icon" title="Edit">
                      <Link href={`/admin/categories/${category._id}`}>
                        <PenBox className="w-4 h-4" />
                      </Link>
                    </Button>
                    <DeleteDialog
                      id={category._id as string}
                      action={deleteCategory}
                      callbackAction={() => {
                        // Refresh current page after delete
                        fetchCategories(inputValue, page);
                      }}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {!isPending && data?.categories.length === 0 && (
               <TableRow>
                 <TableCell colSpan={7} className="h-24 text-center">
                   No categories found.
                 </TableCell>
               </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {(data?.totalPages ?? 0) > 1 && (
        <div className="flex items-center justify-end gap-4 py-4">
          <div className="text-sm text-muted-foreground">
             Page {page} of {data?.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange("prev")}
              disabled={page <= 1 || isPending}
            >
              <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange("next")}
              disabled={page >= (data?.totalPages ?? 0) || isPending}
            >
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
