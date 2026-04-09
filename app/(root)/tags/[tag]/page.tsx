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
import { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import { getTagBySlug } from "@/lib/actions/tag.actions";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";

/* Metadata */
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<any>;
}): Promise<Metadata> {
  const { tag: tagSlug } = await params;
  const sp = await searchParams;

  const [tagData, { site }] = await Promise.all([
    getTagBySlug(tagSlug),
    getSetting(),
  ]);

  if (!tagData) return {};

  const titleBase = tagData.name || tagSlug.replace(/-/g, " ");
  const descriptionBase =
    tagData.description || `Shop ${titleBase} products at ${site.name}.`;

  const hasFilters = Object.keys(sp || {}).some(
    (k) => sp[k] && sp[k] !== "all" && k !== "page"
  );

  return {
    title: hasFilters ? `${titleBase} - Page ${sp.page || 1}` : titleBase,
    description: descriptionBase,
    alternates: {
      canonical: `${site.url}/tags/${tagData.slug}`,
    },
    robots: hasFilters
      ? { index: false, follow: true }
      : { index: true, follow: true },
    openGraph: {
      title: titleBase,
      description: descriptionBase,
      url: `${site.url}/tags/${tagData.slug}`,
      images: tagData.image ? [tagData.image] : [],
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
export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ tag: string }>;
  searchParams: Promise<any>;
}) {
  const { tag: tagSlug } = await params;
  const sp = await searchParams;

  const tagData = await getTagBySlug(tagSlug);
  if (!tagData) notFound();

  // 🔥 Enforce canonical slug from DB
  if (tagData.slug !== tagSlug) {
    redirect(`/tags/${tagData.slug}`);
  }

  const {
    q = "all",
    category = "all",
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
    brand,
    tag: tagData.slug,
    color,
    size,
    price,
    rating,
    sort,
    page,
  };

  const [categories, tags, brands, colors, sizes, data, { site }] =
    await Promise.all([
      getAllCategories(),
      getAllTags(),
      getAllBrands(),
      getAllColors(),
      getAllSizes(),
      getAllProducts({
        query: q,
        tag: tagData.slug,
        category,
        brand,
        color,
        size,
        price,
        rating,
        sort,
        page: Number(page),
      }),
      getSetting(),
    ]);

  /* ---------------------- Schema ----------------------- */
  const tagSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: tagData.name,
    description: tagData.description,
    url: `${site.url}/tags/${tagData.slug}`,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(tagSchema) }}
      />

      <Breadcrumb />

      {/* Modern Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-secondary/10 p-8 md:p-12">
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider">
              Tag Collection
            </Badge>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight capitalize">
              {tagData.name}
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              {tagData.description || `Browse our curated collection of products tagged with ${tagData.name}. Find unique items and great deals.`}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <div className="bg-background/80 backdrop-blur-sm border rounded-full px-4 py-1.5 text-sm font-semibold shadow-sm">
              {data.totalProducts} Tagged Products
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
              basePath={`/tags/${tagData.slug}`}
              lockTag
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
