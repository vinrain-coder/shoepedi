import { Metadata } from "next";
import Link from "next/link";
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
  getAllTagsForAdmin,
  deleteTag,
  getTagStats,
} from "@/lib/actions/tag.actions";
import { Plus, Search, PenBox, Hash } from "lucide-react";
import { formatId, formatDateTime } from "@/lib/utils";
import { ITag } from "@/lib/db/models/tag.model";
import Pagination from "@/components/shared/pagination";
import TagStatsCards from "./tag-stats-cards";
import { Input } from "@/components/ui/input";
import Form from "next/form";

export const metadata: Metadata = {
  title: "Admin Tags",
};

export default async function AdminTagPage(props: {
  searchParams: Promise<{
    page?: string;
    query?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Math.floor(Number(searchParams.page) || 1));
  const query = searchParams.query || "";

  const [data, stats] = await Promise.all([
    getAllTagsForAdmin({
      query,
      page,
    }),
    getTagStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold text-3xl">Tags</h1>
          <p className="text-muted-foreground">
            Manage your product tags for better filtering and SEO
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Form action="/admin/tags" className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="query"
              placeholder="Search tags..."
              defaultValue={query}
              className="pl-9"
            />
          </Form>
          <Button asChild>
            <Link href="/admin/tags/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Tag
            </Link>
          </Button>
        </div>
      </div>

      <TagStatsCards stats={stats} />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="hidden lg:table-cell">Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.tags.length > 0 ? (
              (data.tags as ITag[]).map((tag) => {
                const id = String(tag._id);
                return (
                  <TableRow key={id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatId(id)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                          <Hash className="size-4 text-primary" />
                        </div>
                        <span className="font-medium">{tag.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      /{tag.slug}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                      {formatDateTime(tag.createdAt).dateTime}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/tags/${id}`}>
                            <PenBox className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </Button>
                        <DeleteDialog id={id} action={deleteTag} />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No tags found matching the criteria.
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
