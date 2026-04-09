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
import { Badge } from "@/components/ui/badge";

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
    (k) => sp[k] && sp[k] !== "all" && k !== "page"
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
    color = "all",
    size = "all",
    price = "all",
    rating = "all",
    sort = "best-selling",
    page = "1",
  } = sp;

  const filterParams = {
    q,
    category: categorySlug,
    brand,
    tag,
    color,
    size,
    price,
    rating,
    sort,
    page,
  };

  const [categories, tags, brands, colors, sizes, data, categoryData] =
    await Promise.all([
      getAllCategories(),
      getAllTags(),
      getAllBrands(),
      getAllColors(),
      getAllSizes(),
      getAllProducts({
        query: q,
        category: categorySlug,
        brand,
        tag,
        color,
        size,
        price,
        rating,
        sort,
        page: Number(page),
      }),
      getCategoryBySlug(categorySlug),
    ]);

  /* ---------------------- Schema ----------------------- */
  const categorySchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: categoryData?.name || categorySlug.replace(/-/g, " "),
    description: categoryData?.seoDescription || categoryData?.description,
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
    <div className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
      />

      <Breadcrumb />

      {/* Modern Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-secondary/10 p-8 md:p-12">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider">
              Category
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight capitalize">
              {categoryData.name.replace(/-/g, " ")}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {categoryData.description || `Explore our premium collection of ${categoryData.name.replace(/-/g, " ")} products. Find the best deals and latest styles.`}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="bg-background/80 backdrop-blur-sm border rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm">
              {data.totalProducts} Products Available
            </div>
            <ProductSortSelector
              sortOrders={sortOrders}
              sort={sort}
              params={filterParams}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <aside className="md:col-span-1">
          <div className="sticky top-20">
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
          </div>
        </aside>

        <main className="md:col-span-4 space-y-8">
          <div className="rounded-2xl border bg-card p-1">
            <ProductLayoutSwitcher products={data.products as IProduct[]} />
          </div>

          {data.totalPages > 1 && (
            <div className="flex justify-center pt-4">
              <Pagination page={page} totalPages={data.totalPages} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
