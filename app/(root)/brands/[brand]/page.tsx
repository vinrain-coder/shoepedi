// Note: Remove this if your components are already Server Components
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

  const titleBase = brandData?.seoTitle || brandData?.name || brandSlug.replace(/-/g, " ");
  const descriptionBase = brandData?.seoDescription || brandData?.description || `Shop ${titleBase} products at ${site.name}.`;

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

  const filterParams = { q, category, brand: brandSlug, tag, color, size, price, rating, sort, page };

  // Fetch all data
  const [categories, tags, brands, colors, sizes, data, brandData] = await Promise.all([
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
    "name": brandData?.name || brandSlug.replace(/-/g, " "),
    "description": brandData?.seoDescription || brandData?.description,
    "publisher": {
      "@type": "Organization",
      "name": site.name,
      "logo": site.logo,
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": data.totalProducts,
      "itemListElement": data.products.map((p: IProduct, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${site.url}/product/${p.slug}`,
        "name": p.name,
        "image": p.images[0],
      })),
    },
  };

  return (
    <div className="container mx-auto space-y-4 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />
      
      <Breadcrumb />

      {/* Header Section */}
      <div className="my-4 bg-card border-b py-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold capitalize">
              {brandData?.name || brandSlug.replace(/-/g, " ")}
            </h1>
            
            {brandData?.description && (
              <p className="text-muted-foreground max-w-3xl text-base leading-relaxed">
                {brandData.description}
              </p>
            )}
            
            <div className="text-sm font-medium text-muted-foreground">
              {data.totalProducts === 0
                ? "No products found"
                : `Showing ${data.from}-${data.to} of ${data.totalProducts} results`}
            </div>
          </div>
          
          <div className="min-w-[200px]">
            <ProductSortSelector 
              sortOrders={sortOrders} 
              sort={sort} 
              params={filterParams} 
            />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-5 md:gap-8 py-3">
        {/* Sidebar Filters */}
        <aside className="md:col-span-1">
          <FiltersClient
            initialParams={filterParams}
            categories={categories}
            tags={tags}
            brands={brands}
            colors={colors}
            sizes={sizes}
            basePath={`/brands/${brandSlug}`}
            lockBrand
          />
        </aside>

        {/* Product Listing */}
        <main className="md:col-span-4 space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {data.products.length === 0 ? (
              <div className="col-span-full py-20 text-center text-xl text-muted-foreground">
                No products found in this category.
              </div>
            ) : (
              data.products.map((p: IProduct) => (
                <ProductCard
                  key={p._id.toString()}
                  product={p}
                />
              ))
            )}
          </div>

          {/* Pagination */}
          {data.totalPages > 1 && (
            <div className="flex justify-center py-8">
              <Pagination
                page={page}
                totalPages={data.totalPages}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
                                         }
