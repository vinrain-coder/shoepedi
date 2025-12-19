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

import { getAllTagsForAdmin, deleteTag } from "@/lib/actions/tag.actions";

import { ChevronLeft, ChevronRight, PenBox, Loader2 } from "lucide-react";

import { formatId, formatDateTime } from "@/lib/utils";
import { ITag } from "@/lib/db/models/tag.model";

type TagListDataProps = {
  tags: ITag[];
  totalPages: number;
  totalTags: number;
  to: number;
  from: number;
};

const TagList = () => {
  const [page, setPage] = useState<number>(1);
  const [inputValue, setInputValue] = useState<string>("");
  const [data, setData] = useState<TagListDataProps>();
  const [isPending, startTransition] = useTransition();

  // Initial fetch
  useEffect(() => {
    fetchTags("", 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchTags(inputValue, 1);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  const fetchTags = (query: string, currentPage: number) => {
    startTransition(async () => {
      const result = await getAllTagsForAdmin({
        query,
        page: currentPage,
      });

      // @ts-ignore
      setData(result);
    });
  };

  const handlePageChange = (type: "next" | "prev") => {
    const newPage = type === "next" ? page + 1 : page - 1;
    setPage(newPage);
    fetchTags(inputValue, newPage);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <h1 className="font-bold text-2xl">Tags</h1>

          <div className="relative w-full sm:w-auto">
            <input
              className="border rounded-md px-3 py-2 text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-slate-400"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Filter tag name..."
            />
            {isPending && (
              <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-slate-400" />
            )}
          </div>

          <p className="text-sm text-muted-foreground whitespace-nowrap">
            {data?.totalTags === 0
              ? "No results"
              : `${data?.from}-${data?.to} of ${data?.totalTags}`}
          </p>
        </div>

        <Button asChild>
          <Link href="/admin/tags/create">Create Tag</Link>
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="w-[200px]">Name</TableHead>

              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data?.tags.map((tag) => (
              <TableRow key={tag.id as string}>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {formatId(tag.id as string)}
                </TableCell>

                <TableCell className="font-medium">{tag.name}</TableCell>

                <TableCell className="text-sm">
                  {formatDateTime(tag.createdAt).dateTime}
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button asChild variant="ghost" size="icon" title="Edit">
                      <Link href={`/admin/tags/${tag._id}`}>
                        <PenBox className="w-4 h-4" />
                      </Link>
                    </Button>

                    <DeleteDialog
                      id={tag.id as string}
                      action={deleteTag}
                      callbackAction={() => fetchTags(inputValue, page)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {!isPending && data?.tags.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No tags found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange("next")}
              disabled={page >= (data?.totalPages ?? 0) || isPending}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagList;
