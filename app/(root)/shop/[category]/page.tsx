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
import { getCategoryBySlug } from "@/lib/actions/category.actions";
import { IProduct } from "@/lib/db/models/product.model";

const sortOrders = [
  { value: "price-low-to-high", name: "Price: Low to high" },
  { value: "price-high-to-low", name: "Price: High to low" },
  { value: "newest-arrivals", name: "Newest arrivals" },
  { value: "avg-customer-review", name: "Avg. customer review" },
  { value: "best-selling", name: "Best selling" },
];

const normalizeSearchParams = (
  searchParams?: Record<string, string | string[]>
) => {
  const getValue = (key: string, fallback: string) => {
    const value = searchParams?.[key];
    return typeof value === "string" && value.length > 0 ? value : fallback;
  };

  return {
    q: getValue("q", "all"),
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

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getCategoryBySlug(categorySlug);
  const { site } = await getSetting();
  const search = normalizeSearchParams(await searchParams);

  const titleBase = category?.seoTitle || category?.name || categorySlug;
  const description =
    category?.seoDescription ||
    category?.description ||
    `Browse ${titleBase} products on ${site.name}.`;

  const hasFilters = Object.entries(search).some(
    ([key, value]) => key !== "page" && key !== "sort" && value !== "all"
  );

  return {
    title: hasFilters ? `${titleBase} | Filtered Results` : `${titleBase} | Shop`,
    description,
    alternates: {
      canonical: `${site.url}/shop/${categorySlug}`,
    },
    openGraph: {
      title: titleBase,
      description,
      url: `${site.url}/shop/${categorySlug}`,
      type: "website",
      images: category?.image ? [category.image] : [],
    },
  };
}

export default async function ShopCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { category: categorySlug } = await params;
  const search = normalizeSearchParams(await searchParams);
  const pageNum = Math.max(1, Number.parseInt(search.page, 10) || 1);
  const category = await getCategoryBySlug(categorySlug);

  const [categories, tags, brands, colors, sizes, data, { site }] =
    await Promise.all([
      getAllCategories(),
      getAllTags(),
      getAllBrands(),
      getAllColors(),
      getAllSizes(),
      getAllProducts({
        category: category.name,
        tag: search.tag,
        brand: search.brand,
        gender: search.gender,
        color: search.color,
        size: search.size,
        query: search.q,
        price: search.price,
        rating: search.rating,
        sort: search.sort,
        page: pageNum,
      }),
      getSetting(),
    ]);

  const pageTitle = category?.name || categorySlug;
  const basePath = `/shop/${categorySlug}`;

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: data.totalProducts,
      itemListElement: data.products.map((product: IProduct, index: number) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "Product",
          name: product.name,
          image: product.images?.[0],
          url: `${site.url}/product/${product.slug}`,
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
    },
  };

  return (
    <div className="space-y-2 md:space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schema).replace(/<\//g, "<\\/"),
        }}
      />

      <Breadcrumb />

      <div className="my-1 rounded-xl bg-card p-2.5 md:my-2 md:border-b md:rounded-none md:px-0 md:py-3 flex-between flex-col md:flex-row items-start md:items-center gap-2.5 md:gap-3">
        <div>
          <h1 className="text-xl font-bold capitalize">{pageTitle}</h1>
          {data.totalProducts === 0
            ? "No results"
            : `${data.from}-${data.to} of ${data.totalProducts} products`}
        </div>

        <ProductSortSelector
          sortOrders={sortOrders}
          sort={search.sort}
          params={{ ...search, category: categorySlug }}
          basePath={basePath}
        />
      </div>

      <div className="bg-card grid md:grid-cols-5 md:gap-6 py-2 md:py-3">
        <FiltersClient
          initialParams={{ ...search, category: categorySlug }}
          categories={categories}
          tags={tags}
          brands={brands}
          colors={colors}
          sizes={sizes}
          basePath={basePath}
          lockCategory
        />

        <div className="md:col-span-4 space-y-4">
          <ProductLayoutSwitcher products={data.products as IProduct[]} />

          {data.totalPages > 1 && (
            <Pagination page={pageNum} totalPages={data.totalPages} />
          )}
        </div>
      </div>
    </div>
  );
}
