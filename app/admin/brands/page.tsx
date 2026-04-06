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
  getAllBrandsForAdmin,
  deleteBrand,
  getBrandStats,
} from "@/lib/actions/brand.actions";
import { Plus, Search, PenBox, Tag } from "lucide-react";
import { formatId, formatDateTime } from "@/lib/utils";
import { IBrand } from "@/lib/db/models/brand.model";
import Pagination from "@/components/shared/pagination";
import BrandStatsCards from "./brand-stats-cards";
import { Input } from "@/components/ui/input";
import Form from "next/form";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Admin Brands",
};

export default async function AdminBrandPage(props: {
  searchParams: Promise<{
    page?: string;
    query?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const page = Math.max(1, Math.floor(Number(searchParams.page) || 1));
  const query = searchParams.query || "";

  const [data, stats] = await Promise.all([
    getAllBrandsForAdmin({
      query,
      page,
    }),
    getBrandStats(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold text-3xl">Brands</h1>
          <p className="text-muted-foreground">
            Manage your product brands, logos, and featured status
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Form action="/admin/brands" className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="query"
              placeholder="Search brands..."
              defaultValue={query}
              className="pl-9"
              aria-label="Search brands"
            />
          </Form>
          <Button asChild>
            <Link href="/admin/brands/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Brand
            </Link>
          </Button>
        </div>
      </div>

      <BrandStatsCards stats={stats} />

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="hidden lg:table-cell">Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.brands.length > 0 ? (
              (data.brands as IBrand[]).map((brand) => (
                <TableRow key={brand._id as string}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {formatId(brand._id as string)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center overflow-hidden">
                          {brand.logo || brand.image ? (
                             <Image src={brand.logo || brand.image} alt={brand.name} width={32} height={32} className="object-cover" />
                          ) : (
                             <Tag className="size-4 text-primary" />
                          )}
                       </div>
                       <span className="font-medium">{brand.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    /{brand.slug}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                    {formatDateTime(brand.createdAt).dateTime}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/brands/${brand._id}`}>
                          <PenBox className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                      <DeleteDialog id={brand._id as string} action={deleteBrand} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  No brands found matching the criteria.
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
