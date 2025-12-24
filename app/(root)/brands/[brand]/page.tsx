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
  const brandData = await getBrandBySlug(brandSlug);
  const { site } = await getSetting();

  const titleBase =
    brandData?.seoTitle || brandData?.name || brandSlug.replace(/-/g, " ");
  const descriptionBase =
    brandData?.seoDescription ||
    brandData?.description ||
    `Shop ${titleBase} products at ${site.name}.`;

  const hasFilters = Object.keys(sp || {}).some(
    (k) => sp[k] && sp[k] !== "all" && k !== "page"
  );

  return {
    title: hasFilters ? `${titleBase} - Page ${sp.page || 1}` : titleBase,
    description: descriptionBase,
    alternates: {
      canonical: `${site.url}/brands/${brandSlug}`,
    },
    robots: hasFilters
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: titleBase,
      description: descriptionBase,
      url: `${site.url}/brands/${brandSlug}`,
      images: brandData?.image ? [brandData.image] : [],
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
  const { brand: brandSlug } = await params;
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
    brand: brandSlug,
    tag,
    color,
    size,
    price,
    rating,
    sort,
    page,
  };

  // Fetch all data
  const [categories, tags, brands, colors, sizes, data, brandData] =
    await Promise.all([
      getAllCategories(),
      getAllTags(),
      getAllBrands(),
      getAllColors(),
      getAllSizes(),
      getAllProducts({
        query: q,
        brand: brandSlug,
        category,
        tag,
        color,
        size,
        price,
        rating,
        sort,
        page: Number(page),
      }),
      getBrandBySlug(brandSlug),
    ]);

  /* ---------------------- Schema ----------------------- */
  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: brandData?.name || brandSlug.replace(/-/g, " "),
    description: brandData?.seoDescription || brandData?.description,
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: site.logo,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: data.totalProducts,
      itemListElement: data.products.map((p: IProduct, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${site.url}/product/${p.slug}`,
        name: p.name,
        image: p.images[0],
      })),
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
            {brandData.name
              .split("-")
              .map((w) => w[0].toUpperCase() + w.slice(1))
              .join(" ")}
          </h1>
          <p className="">
            Shop products from {brandData.name.replace(/-/g, " ")}. Filter by
            category, price, color, size, rating, and more.
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
          basePath={`/brands/${brandData.slug}`}
          lockBrand
        />

        <div className="md:col-span-4 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
            {data.products.length === 0 ? (
              <div>No product found</div>
            ) : (
              data.products.map((p: IProduct) => (
                <ProductCard key={p._id.toString()} product={p} />
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
