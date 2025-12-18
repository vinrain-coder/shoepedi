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
import { getCategoryBySlug } from "@/lib/actions/category.actions";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>; // Update type to Promise
    searchParams: Promise<any>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params; 
  const sp = await searchParams;
  const category = await getCategoryBySlug(categorySlug);
  const { site } = await getSetting();

  const titleBase = category?.name ?? categorySlug;
  const hasFilters = Object.keys(sp || {}).some(
    (k) => sp[k] && sp[k] !== "all"
  );

  return {
    title: hasFilters
      ? `${titleBase} Products | Filtered Results`
      : `${titleBase} Products | ${site.name}`,
    description:
      category?.description ??
      `Shop ${titleBase} products. Browse the best deals, top brands, and latest arrivals.`,
    alternates: {
      canonical: `${site.url}/categories/${categorySlug}`,
    },
    robots: hasFilters
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: `${titleBase} Products`,
      description:
        category?.description ??
        `Browse ${titleBase} products and find the best deals.`,
      url: `${site.url}/categories/${categorySlug}`,
      type: "website",
    },
  };
}

const sortOrders = [
  { value: "price-low-to-high", name: "Price: Low to high" },
  { value: "price-high-to-low", name: "Price: High to low" },
  { value: "newest-arrivals", name: "Newest arrivals" },
  { value: "avg-customer-review", name: "Avg. customer review" },
  { value: "best-selling", name: "Best selling" },
];

export default async function CategoryPage({
  params,
  searchParams,
}: {
params: Promise<{ category: string }>; // Update type to Promise
  searchParams: Promise<any>;
}) {
  const { category } = await params;
  const sp = await searchParams;
  const { site } = await getSetting();

  const {
    q = "all",
    tag = "all",
    brand = "all",
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
    tag,
    brand,
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
      query: q,
      category,
      tag,
      brand,
      color,
      size,
      price,
      rating,
      sort,
      page: Number(page),
    }),
  ]);

  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.replace("-", " "),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: data.totalProducts,
      itemListElement: data.products.map((p: IProduct, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${site.url}/product/${p.slug}`,
        name: p.name,
      })),
    },
  };

  return (
    <div className="space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
      />
      <Breadcrumb />
      {/* Header */}
      <div className="my-2 bg-card md:border-b flex-between flex-col md:flex-row items-start md:items-center py-3 gap-3">
        <div>
          <h1 className="text-xl font-bold capitalize">
            {category
              .split("-")
              .map((w) => w[0].toUpperCase() + w.slice(1))
              .join(" ")}
          </h1>
          <p className="sr-only">
            Shop {category.replace(/-/g, " ")} products from top brands. Filter
            by price, color, size, rating, and more to find the perfect item.
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

      <div className="bg-card grid md:grid-cols-5 md:gap-6 py-3">
        <FiltersClient
          initialParams={filterParams}
          categories={categories}
          tags={tags}
          brands={brands}
          colors={colors}
          sizes={sizes}
          basePath={`/categories/${category}`}
          lockCategory
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
  )
}
