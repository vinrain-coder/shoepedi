import { Metadata } from "next";
import ProductList from "./product-list";
import {
  getAllBrands,
  getAllCategories,
  getAllProductsForAdmin,
  getAllTags,
  getProductAdminStats,
} from "@/lib/actions/product.actions";
import ProductStatsCards from "./product-stats-cards";
import ProductFilters from "./product-filters";
import { ProductsDateRangePicker } from "./date-range-picker";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Products",
};

export default async function AdminProductPage(props: {
  searchParams: Promise<{
    page?: string;
    query?: string;
    category?: string;
    brand?: string;
    tag?: string;
    gender?: string;
    isPublished?: string;
    from?: string;
    to?: string;
    sort?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const {
    page = "1",
    query = "",
    category = "all",
    brand = "all",
    tag = "all",
    gender = "all",
    isPublished = "all",
    from,
    to,
    sort = "latest",
  } = searchParams;

  const [data, stats, categories, brands, tags] = await Promise.all([
    getAllProductsForAdmin({
      query,
      page: Number(page),
      category,
      brand,
      tag,
      gender,
      isPublished,
      from,
      to,
      sort,
    }),
    getProductAdminStats({
      query,
      category,
      brand,
      tag,
      from,
      to,
    }),
    getAllCategories(),
    getAllBrands(),
    getAllTags(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="h1-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your inventory, pricing and stock levels
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ProductsDateRangePicker />
          <Button asChild>
            <Link href="/admin/products/create">
              <Plus className="mr-2 h-4 w-4" />
              Create Product
            </Link>
          </Button>
        </div>
      </div>

      <ProductStatsCards stats={stats} currentStatus={isPublished} />

      <div className="rounded-md border bg-card p-4">
        <ProductFilters
          categories={categories}
          brands={brands}
          tags={tags}
        />
      </div>

      <ProductList
        data={data}
        page={Number(page)}
      />
    </div>
  );
}
