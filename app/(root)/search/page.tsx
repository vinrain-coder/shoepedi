import Pagination from "@/components/shared/pagination";
import ProductSortSelector from "@/components/shared/product/product-sort-selector";
import {
  getAllProducts,
  getAllCategories,
  getAllTags,
  getAllBrands,
  getAllColors,
  getAllSizes,
} from "@/lib/actions/product.actions";
import { IProduct } from "@/lib/db/models/product.model";
import FiltersClient from "@/components/shared/search/filters-client";
import Breadcrumb from "@/components/shared/breadcrumb";
import { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import ProductLayoutSwitcher from "@/components/shared/product/product-layout-switcher";
import SearchProductsClient from "@/components/shared/search/search-products-client";

export async function generateMetadata(props: {
  searchParams: Promise<any>;
}): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const { q = "all", category = "all", brand = "all" } = searchParams;
  const { site } = await getSetting();

  if (q !== "all") {
    return {
      title: `Search results for "${q}" | ${site.name}`,
      robots: { index: false, follow: true },
    };
  }
  if (category !== "all" || brand !== "all") {
    const title =
      category !== "all"
        ? category.charAt(0).toUpperCase() + category.slice(1)
        : brand.charAt(0).toUpperCase() + brand.slice(1);
    return {
      title: `${title} | ${site.name}`,
      robots: { index: false, follow: true },
    };
  }

  return {
    title: `Search | ${site.name}`,
    robots: { index: false, follow: true },
  };
}

const sortOrders = [
  { value: "price-low-to-high", name: "Price: Low to high" },
  { value: "price-high-to-low", name: "Price: High to low" },
  { value: "newest-arrivals", name: "Newest arrivals" },
  { value: "avg-customer-review", name: "Avg. customer review" },
  { value: "best-selling", name: "Best selling" },
];

export default async function SearchPage(props: {
  searchParams: Promise<any>;
}) {
  const searchParams = await props.searchParams;
  const {
    q = "all",
    category = "all",
    tag = "all",
    brand = "all",
    gender = "all",
    color = "all",
    size = "all",
    price = "all",
    rating = "all",
    sort = "best-selling",
    page = "1",
  } = searchParams;
  const params = {
    q,
    category,
    tag,
    brand,
    gender,
    color,
    size,
    price,
    rating,
    sort,
    page,
  };

  const [categories, tags, brands, colors, sizes, data] = await Promise.all([
    getAllCategories(),
    getAllTags(),
    getAllBrands(),
    getAllColors(),
    getAllSizes(),
    getAllProducts({
      category,
      tag,
      brand,
      gender,
      color,
      size,
      query: q,
      price,
      rating,
      sort,
      page: Number(page),
    }),
  ]);

  return (
    <div className="space-y-1 md:space-y-2">
      <Breadcrumb />
      <div className="my-1 rounded-xl bg-card md:border-b md:rounded-none flex flex-col md:flex-row md:items-center justify-between gap-2.5 md:gap-3">
        <div className="text-sm text-muted-foreground">
          {data.totalProducts === 0
            ? "No results"
            : `${data.from}-${data.to} of ${data.totalProducts}`}{" "}
          results
        </div>

        <div className="w-full md:w-auto md:ml-auto mb-1">
          <ProductSortSelector
            sortOrders={sortOrders}
            sort={sort}
            params={params}
            basePath="/search"
          />
        </div>
      </div>

      <div className="bg-card grid md:grid-cols-5 py-1 md:py-2 md:gap-6">
        <FiltersClient
          initialParams={params}
          categories={categories}
          tags={tags}
          brands={brands}
          colors={colors}
          sizes={sizes}
          basePath="/search"
        />
        <div className="md:col-span-4 space-y-4">
          <SearchProductsClient products={data?.products ?? []} />
          {data.totalPages > 1 && (
            <Pagination page={page} totalPages={data.totalPages} />
          )}
        </div>
      </div>
    </div>
  );
}

