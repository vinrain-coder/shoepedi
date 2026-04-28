import Pagination from "@/components/shared/pagination";
import ProductSortSelector from "@/components/shared/product/product-sort-selector";
import ProductLayoutSwitcher from "@/components/shared/product/product-layout-switcher";
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
import { getSetting } from "@/lib/actions/setting.actions";
import { getCategoryBySlug } from "@/lib/actions/category.actions";
import { Metadata } from "next";

/* ------------------------- Metadata ------------------------- */
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<any>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const sp = await searchParams;

  const categoryData = await getCategoryBySlug(categorySlug);
  const { site } = await getSetting();

  const titleBase =
    categoryData?.seoTitle ||
    categoryData?.name ||
    categorySlug.replace(/-/g, " ");

  const descriptionBase =
    categoryData?.seoDescription ||
    categoryData?.description ||
    `Shop ${titleBase} products at ${site.name}.`;

  const hasFilters = Object.keys(sp || {}).some(
    (k) => sp[k] && sp[k] !== "all" && k !== "page",
  );

  return {
    title: hasFilters ? `${titleBase} - Page ${sp.page || 1}` : titleBase,
    description: descriptionBase,
    alternates: {
      canonical: `${site.url}/categories/${categorySlug}`,
    },
    robots: hasFilters
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: titleBase,
      description: descriptionBase,
      url: `${site.url}/categories/${categorySlug}`,
      images: categoryData?.image ? [categoryData.image] : [],
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
export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<any>;
}) {
  const { category: categorySlug } = await params;
  const sp = await searchParams;

  const { site } = await getSetting();

  const {
    q = "all",
    brand = "all",
    tag = "all",
    gender = "all",
    color = "all",
    size = "all",
    price = "all",
    rating = "all",
    sort = "best-selling",
    page = "1",
  } = sp;

  /* ---------------- Get category once ---------------- */
  const categoryData = await getCategoryBySlug(categorySlug);

  if (!categoryData) {
    return (
      <div className="py-10 text-center">
        <h1 className="text-xl font-bold">Category not found</h1>
      </div>
    );
  }

  const filterParams = {
    q,
    category: categoryData.name,
    brand,
    tag,
    gender,
    color,
    size,
    price,
    rating,
    sort,
    page,
  };

  /* ---------------- Fetch page data ---------------- */
  const [categories, tags, brands, colors, sizes, data] = await Promise.all([
    getAllCategories(),
    getAllTags(),
    getAllBrands(),
    getAllColors(),
    getAllSizes(),
    getAllProducts({
      query: q,
      category: categoryData.name, // FIXED
      brand,
      tag,
      gender,
      color,
      size,
      price,
      rating,
      sort,
      page: Number(page),
    }),
  ]);

  /* ---------------------- Schema ----------------------- */
  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryData.name,
    description: categoryData.seoDescription || categoryData.description,
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
        image: p.images?.[0],
      })),
    },
  };

  return (
    <div className="space-y-2 md:space-y-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(categorySchema),
        }}
      />

      <Breadcrumb />

      {/* Header */}
      <div className="my-1 rounded-xl bg-card p-2.5 md:my-2 md:border-b md:rounded-none md:px-0 md:py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-2.5 md:gap-3">
        <div>
          <h1 className="text-xl font-bold capitalize">{categoryData.name}</h1>
          <p>
            Shop products in {categoryData.name}. Filter by brand, price, color,
            size, rating, and more.
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
      <div className="bg-card grid md:grid-cols-5 md:gap-6 py-2 md:py-3">
        <FiltersClient
          initialParams={filterParams}
          categories={categories}
          tags={tags}
          brands={brands}
          colors={colors}
          sizes={sizes}
          basePath={`/categories/${categoryData.slug}`}
          lockCategory
        />

        <div className="md:col-span-4 space-y-4">
          <ProductLayoutSwitcher products={data.products as IProduct[]} />

          {data.totalPages > 1 && (
            <Pagination page={page} totalPages={data.totalPages} />
          )}
        </div>
      </div>
    </div>
  );
}
