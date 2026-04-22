import type { Metadata } from "next";
import Breadcrumb from "@/components/shared/breadcrumb";
import FiltersClient from "@/components/shared/search/filters-client";
import Pagination from "@/components/shared/pagination";
import ProductLayoutSwitcher from "@/components/shared/product/product-layout-switcher";
import ProductSortSelector from "@/components/shared/product/product-sort-selector";
import {
  getAllBrands,
  getAllCategories,
  getAllColors,
  getAllProducts,
  getAllSizes,
  getAllTags,
} from "@/lib/actions/product.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { IProduct } from "@/lib/db/models/product.model";


const sortOrders = [
  { value: "price-low-to-high", name: "Price: Low to high" },
  { value: "price-high-to-low", name: "Price: High to low" },
  { value: "newest-arrivals", name: "Newest arrivals" },
  { value: "avg-customer-review", name: "Avg. customer review" },
  { value: "best-selling", name: "Best selling" },
];

const baseDescription =
  "Browse all shoes and fashion essentials. Filter by category, brand, price, color, size, and rating.";

const normalizeSearchParams = (searchParams?: Record<string, string | string[]>) => {
  const getValue = (key: string, fallback: string) => {
    const value = searchParams?.[key];
    return typeof value === "string" && value.length > 0 ? value : fallback;
  };

  return {
    q: getValue("q", "all"),
    category: getValue("category", "all"),
    tag: getValue("tag", "all"),
    brand: getValue("brand", "all"),
    gender: getValue("gender", "all"),
    color: getValue("color", "all"),
    size: getValue("size", "all"),
    price: getValue("price", "all"),
    rating: getValue("rating", "all"),
    sort: getValue("sort", "best-selling"),
    page: getValue("page", "1"),
  };
};

const hasActiveFilters = (params: ReturnType<typeof normalizeSearchParams>) =>
  Object.entries(params).some(
    ([key, value]) => key !== "page" && key !== "sort" && value !== "all"
  );

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const resolvedParams = normalizeSearchParams(await searchParams);
  const { site } = await getSetting();

  const title = hasActiveFilters(resolvedParams)
    ? `Filtered Shop Results | ${site.name}`
    : `Shop | ${site.name}`;

  return {
    title,
    description: baseDescription,
    alternates: {
      canonical: `${site.url}/shop`,
    },
    openGraph: {
      title,
      description: baseDescription,
      url: `${site.url}/shop`,
      type: "website",
    },
  };
}

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = normalizeSearchParams(await searchParams);
  const [categories, tags, brands, colors, sizes, data, { site }] =
    await Promise.all([
      getAllCategories(),
      getAllTags(),
      getAllBrands(),
      getAllColors(),
      getAllSizes(),
      getAllProducts({
        category: params.category,
        tag: params.tag,
        brand: params.brand,
        gender: params.gender,
        color: params.color,
        size: params.size,
        query: params.q,
        price: params.price,
        rating: params.rating,
        sort: params.sort,
        page: Number(params.page),
      }),
      getSetting(),
    ]);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: data.totalProducts,
    itemListElement: data.products.map((product: IProduct, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        image: product.images?.[0],
        url: `${site.url}/product/${product.slug}`,
        description: product.description,
        offers: {
          "@type": "Offer",
          priceCurrency: "KES",
          price: product.price,
          availability:
            product.countInStock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        },
      },
    })),
  };

  return (
    <div className="space-y-2 md:space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <Breadcrumb />

      <div className="my-1 rounded-xl bg-card p-2.5 md:my-2 md:border-b md:rounded-none md:px-0 md:py-3 flex-between flex-col md:flex-row items-start md:items-center gap-2.5 md:gap-3">
        <div>
          <h1 className="text-xl font-bold">Shop</h1>
          <p className="text-sm text-muted-foreground">{baseDescription}</p>
          {data.totalProducts === 0
            ? "No results"
            : `${data.from}-${data.to} of ${data.totalProducts}`} products
        </div>
        <ProductSortSelector
          sortOrders={sortOrders}
          sort={params.sort}
          params={params}
          basePath="/shop"
        />
      </div>

      <div className="bg-card grid md:grid-cols-5 md:gap-6 py-2 md:py-3">
        <FiltersClient
          initialParams={params}
          categories={categories}
          tags={tags}
          brands={brands}
          colors={colors}
          sizes={sizes}
          basePath="/shop"
        />

        <div className="md:col-span-4 space-y-4">
          <ProductLayoutSwitcher products={data.products as IProduct[]} />
          {data.totalPages > 1 && (
            <Pagination page={params.page} totalPages={data.totalPages} />
          )}
        </div>
      </div>
    </div>
  );
}
