import ProductCard from "@/components/shared/product/product-card";
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

import FiltersClient from "@/components/shared/search/filters-client";
import { IProduct } from "@/lib/db/models/product.model";
import Breadcrumb from "@/components/shared/breadcrumb";

import type { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import { getBrandBySlug } from "@/lib/actions/brand.actions";

/* ------------------------- Metadata ------------------------- */

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>;
  searchParams: Promise<any>;
}): Promise<Metadata> {
  const { brand: brandSlug } = await params;
  const sp = await searchParams;

  const brand = await getBrandBySlug(brandSlug);
  const { site } = await getSetting();

  const titleBase = brand?.name ?? brandSlug;

  const hasFilters = Object.keys(sp || {}).some(
    (k) => sp[k] && sp[k] !== "all"
  );

  return {
    title: hasFilters
      ? `${titleBase} Products | Filtered Results`
      : `${titleBase} Products | ${site.name}`,

    description:
      brand?.description ??
      `Shop ${titleBase} products. Browse the latest arrivals and best deals.`,

    alternates: {
      canonical: `${site.url}/brands/${brandSlug}`,
    },

    robots: hasFilters
      ? { index: false, follow: true }
      : { index: true, follow: true },

    openGraph: {
      title: `${titleBase} Products`,
      description:
        brand?.description ??
        `Browse ${titleBase} products and discover the best offers.`,
      url: `${site.url}/brands/${brandSlug}`,
      type: "website",
    },
  };
}

/* ------------------------- Sorting -------------------------- */

const sortOrders = [
  { value: "price-low-to-high", name: "Price: Low to high" },
  { value: "price-high-to-low", name: "Price: High to low" },
  { value: "newest-arrivals", name: "Newest arrivals" },
  { value: "avg-customer-review", name: "Avg. customer review" },
  { value: "best-selling", name: "Best selling" },
];

/* ------------------------- Page ----------------------------- */

export default async function BrandPage({
  params,
  searchParams,
}: {
  params: Promise<{ brand: string }>;
  searchParams: Promise<any>;
}) {
  const { brand } = await params;
  const sp = await searchParams;

  const { site } = await getSetting();

  const {
    q = "all",
    category = "all",
    tag = "all",
    color = "all",
    size = "all",
    price = "all",
    rating = "all",
    sort = "best-selling",
    page = "1",
  } = sp;

  const filterParams = {
    q,
    category,
    brand,
    tag,
    color,
    size,
    price,
    rating,
    sort,
    page,
  };

  const [categories, tags, brands, colors, sizes, data] =
    await Promise.all([
      getAllCategories(),
      getAllTags(),
      getAllBrands(),
      getAllColors(),
      getAllSizes(),
      getAllProducts({
        query: q,
        brand,
        category,
        tag,
        color,
        size,
        price,
        rating,
        sort,
        page: Number(page),
      }),
    ]);

  /* ---------------------- Schema ----------------------- */

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: brand.replace("-", " "),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: data.totalProducts,
      itemListElement: data.products.map(
        (p: IProduct, index: number) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${site.url}/product/${p.slug}`,
          name: p.name,
        })
      ),
    },
  };

  return (
    <div className="space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />

      <Breadcrumb />

      {/* Header */}
      <div className="my-2 bg-card md:border-b flex-between flex-col md:flex-row items-start md:items-center py-3 gap-3">
        <div>
          <h1 className="text-xl font-bold capitalize">
            {brand
              .split("-")
              .map((w) => w[0].toUpperCase() + w.slice(1))
              .join(" ")}
          </h1>

          <p className="sr-only">
            Shop {brand.replace(/-/g, " ")} products. Filter by category,
            price, color, size, rating, and more.
          </p>

          {data.totalProducts === 0
            ? "No results"
            : `${data.from}-${data.to} of ${data.totalProducts}`}{" "}
          products
        </div>

        <ProductSortSelector
          sortOrders={sortOrders}
          sort={sort}
          params={filterParams}
        />
      </div>

      {/* Content */}
      <div className="bg-card grid md:grid-cols-5 md:gap-6 py-3">
        <FiltersClient
          initialParams={filterParams}
          categories={categories}
          tags={tags}
          brands={brands}
          colors={colors}
          sizes={sizes}
          basePath={`/brands/${brand}`}
          lockBrand
        />

        <div className="md:col-span-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
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
            <Pagination
              page={page}
              totalPages={data.totalPages}
            />
          )}
        </div>
      </div>
    </div>
  );
  }
  
