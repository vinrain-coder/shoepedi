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
import { deleteWebPage, getAllWebPages, getWebPageStats } from "@/lib/actions/web-page.actions";
import { IWebPage } from "@/lib/db/models/web-page.model";
import { formatDateTime, formatId } from "@/lib/utils";
import { Plus, Search, FileText, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import Form from "next/form";
import WebPageStatsCards from "./web-page-stats-cards";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Admin Web Pages",
};

export default async function AdminWebPage(props: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    isPublished?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Math.floor(Number(searchParams.page) || 1));
  const query = searchParams.query || "";
  const isPublished = ["all", "true", "false"].includes(searchParams.isPublished as string)
    ? (searchParams.isPublished as string)
    : "all";

  const [data, stats] = await Promise.all([
    getAllWebPages({
      page,
      query,
      isPublished,
    }),
    getWebPageStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold text-3xl">Web Pages</h1>
          <p className="text-muted-foreground">
            Manage your store's static content like About Us, FAQs, and Terms
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Form action="/admin/web-pages" className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="query"
              placeholder="Search pages..."
              defaultValue={query}
              className="pl-9"
            />
            {isPublished !== "all" && <input type="hidden" name="isPublished" value={isPublished} />}
          </Form>
          <Button asChild>
            <Link href="/admin/web-pages/create">
              <Plus className="mr-2 h-4 w-4" />
              Create WebPage
            </Link>
          </Button>
        </div>
      </div>

      <WebPageStatsCards stats={stats} currentStatus={isPublished} />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.length > 0 ? (
              data.data.map((webPage: IWebPage) => (
                <TableRow key={webPage._id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatId(webPage._id)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <FileText className="size-4 text-muted-foreground" />
                       <span className="font-medium">{webPage.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/page/${webPage.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      /{webPage.slug}
                      <ExternalLink className="size-3" />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={webPage.isPublished ? "default" : "secondary"}>
                      {webPage.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {webPage.updatedAt ? formatDateTime(webPage.updatedAt).dateTime : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/web-pages/${webPage._id}`}>Edit</Link>
                      </Button>
                      <DeleteDialog id={webPage._id} action={deleteWebPage} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  No web pages found matching the criteria.
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
