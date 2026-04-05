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
  getAllCategoriesForAdmin,
  deleteCategory,
  getCategoryStats,
} from "@/lib/actions/category.actions";
import { Plus, Search, PenBox, LayoutGrid } from "lucide-react";
import { formatId, formatDateTime } from "@/lib/utils";
import { ICategory } from "@/lib/db/models/category.model";
import Pagination from "@/components/shared/pagination";
import CategoryStatsCards from "./category-stats-cards";
import { Input } from "@/components/ui/input";
import Form from "next/form";

export const metadata: Metadata = {
  title: "Admin Categories",
};

export default async function AdminCategoryPage(props: {
  searchParams: Promise<{
    page?: string;
    query?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const query = searchParams.query || "";

  const [data, stats] = await Promise.all([
    getAllCategoriesForAdmin({
      query,
      page,
    }),
    getCategoryStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold text-3xl">Categories</h1>
          <p className="text-muted-foreground">
            Organize your products into meaningful groups for easier discovery
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Form action="/admin/categories" className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="query"
              placeholder="Search categories..."
              defaultValue={query}
              className="pl-9"
            />
          </Form>
          <Button asChild>
            <Link href="/admin/categories/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Link>
          </Button>
        </div>
      </div>

      <CategoryStatsCards stats={stats} />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">SEO Title</TableHead>
              <TableHead className="hidden lg:table-cell">Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.categories.length > 0 ? (
              (data.categories as ICategory[]).map((category) => (
                <TableRow key={category._id as string}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatId(category._id as string)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center">
                          <LayoutGrid className="size-4 text-primary" />
                       </div>
                       <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-xs text-muted-foreground truncate max-w-[200px]">
                    {category.seoTitle || "-"}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {formatDateTime(category.createdAt).dateTime}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/categories/${category._id}`}>
                          <PenBox className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <DeleteDialog id={category._id as string} action={deleteCategory} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No categories found matching the criteria.
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
