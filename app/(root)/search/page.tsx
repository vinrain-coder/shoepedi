import ProductCard from "@/components/shared/product/product-card";
import ProductLayoutSelector from "@/components/shared/product/product-layout-selector";
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
import {
  DEFAULT_PRODUCT_CARD_LAYOUT,
} from "@/components/shared/product/product-card-layout";

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
    color = "all",
    size = "all",
    price = "all",
    rating = "all",
    sort = "best-selling",
    page = "1",
    layout = DEFAULT_PRODUCT_CARD_LAYOUT,
  } = searchParams;
  const selectedLayout = isProductCardLayout(layout)
    ? layout
    : DEFAULT_PRODUCT_CARD_LAYOUT;
  const params = {
    q,
    category,
    tag,
    brand,
    color,
    size,
    price,
    rating,
    sort,
    page,
    layout: selectedLayout,
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
    <div className="space-y-4">
      <Breadcrumb />
      <div className="my-2 bg-card md:border-b flex-between flex-col md:flex-row items-start md:items-center py-3 gap-3">
        <div>
          {data.totalProducts === 0
            ? "No results"
            : `${data.from}-${data.to} of ${data.totalProducts}`}{" "}
          results
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <ProductLayoutSelector layout={DEFAULT_PRODUCT_CARD_LAYOUT} />
          <ProductSortSelector
            sortOrders={sortOrders}
            sort={sort}
            params={params}
          />
        </div>
      </div>

      <div className="bg-card grid md:grid-cols-5 md:gap-6 py-3">
        <FiltersClient
          initialParams={params}
          categories={categories}
          tags={tags}
          brands={brands}
          colors={colors}
          sizes={sizes}
        />
        <div className="md:col-span-4 space-y-4">
          <div
            className="grid grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-4"
          >
            {data.products.length === 0 ? (
              <div>No product found</div>
            ) : (
              data.products.map((p: IProduct) => (
                <ProductCard
                  key={p._id.toString()}
                  product={p}
                />
              ))
            )}
          </div>
          {data.totalPages > 1 && (
            <Pagination page={page} totalPages={data.totalPages} />
          )}
        </div>
      </div>
    </div>
  );
}
