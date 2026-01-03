import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import AddToCart from "@/components/shared/product/add-to-cart";
import { Card, CardContent } from "@/components/ui/card";
import {
  getProductBySlug,
  getRelatedProductsByCategory,
} from "@/lib/actions/product.actions";
import ReviewList from "./review-list";
import { generateId, round2 } from "@/lib/utils";
import SelectVariant from "@/components/shared/product/select-variant";
import ProductPrice from "@/components/shared/product/product-price";
import ProductGallery from "@/components/shared/product/product-gallery";
import AddToBrowsingHistory from "@/components/shared/product/add-to-browsing-history";
import { Separator } from "@/components/ui/separator";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import RatingSummary from "@/components/shared/product/rating-summary";
import ProductSlider from "@/components/shared/product/product-slider";
import { getSetting } from "@/lib/actions/setting.actions";
import ShareProduct from "@/components/shared/product/share-product";
import SubscribeButton from "@/components/shared/product/stock-subscription-button";
import OrderViaWhatsApp from "@/components/shared/product/order-via-whatsapp";
import WishlistButton from "@/components/shared/product/wishlist-button";
import { cacheLife } from "next/cache";
import Breadcrumb from "@/components/shared/breadcrumb";
import MarkdownRenderer from "@/components/shared/markdown-renderer";

/* -------------------------------------------------------------------------- */
/*                                   METADATA                                 */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { slug } = params;

  const [product, { site }] = await Promise.all([
    getProductBySlug(slug),
    getSetting(),
  ]);

  if (!product) {
    return {
      title: "Product Not Found",
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.name} - ${product.brand} | Buy Online in Kenya`;

  const description = product.description
    ? product.description.replace(/[#*]/g, "").slice(0, 160)
    : `Shop ${product.name} by ${product.brand} at ${site.name}. Authentic quality, KES ${product.price}, fast delivery across Kenya.`;

  const ogImageUrl = product.images?.[0];

  return {
    title,
    description,
    alternates: {
      canonical: `${site.url}/product/${product.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${site.url}/product/${product.slug}`,
      siteName: site.name,
      type: "website",
      images: ogImageUrl
        ? [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: product.name,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                    */
/* -------------------------------------------------------------------------- */

type Props = {
  params: { slug: string };
  searchParams: {
    page?: string;
    color?: string;
    size?: string;
  };
};

/* -------------------------------------------------------------------------- */
/*                                   LOADERS                                  */
/* -------------------------------------------------------------------------- */

function ReviewsLoading() {
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="h-6 w-48 bg-gray-200 rounded mb-3 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

function RelatedLoading() {
  return (
    <div className="p-4">
      <div className="h-6 w-56 bg-gray-200 rounded mb-3 animate-pulse" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                    PAGE                                    */
/* -------------------------------------------------------------------------- */

export default async function ProductDetails({
  params,
  searchParams,
}: Props) {
  const { slug } = params;

  /* ✅ Parallel fetch (safe in Next.js 16) */
  const [product, { site }] = await Promise.all([
    getProductBySlug(slug),
    getSetting(),
  ]);

  if (!product) notFound();

  const selectedColor = searchParams.color ?? product.colors?.[0];
  const selectedSize = searchParams.size ?? product.sizes?.[0];

  const relatedProductsPromise = getRelatedProductsByCategory({
    category: product.category,
    productId: product._id.toString(),
    page: Number(searchParams.page ?? "1"),
  });

  /* ------------------------------- JSON-LD -------------------------------- */

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${site.url}/product/${product.slug}`,
    name: product.name,
    image: product.images?.filter(Boolean),
    description: product.description?.replace(/[#*]/g, ""),
    sku: product._id.toString(),
    brand: {
      "@type": "Brand",
      name: product.brand || site.name,
    },
    offers: {
      "@type": "Offer",
      url: `${site.url}/product/${product.slug}`,
      priceCurrency: "KES",
      price: product.price,
      availability:
        product.countInStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.numReviews > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.avgRating,
        reviewCount: product.numReviews,
      },
    }),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <AddToBrowsingHistory
        id={product._id.toString()}
        category={product.category}
      />

      <Breadcrumb />

      {/* ========================== TOP GRID ========================== */}
      <section className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-2">
        {/* LEFT */}
        <div className="md:col-span-2">
          <ProductGallery images={product.images || []} />
        </div>

        {/* CENTER */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <h1 className="text-xl font-bold">{product.name}</h1>

          <RatingSummary
            avgRating={product.avgRating}
            numReviews={product.numReviews}
            ratingDistribution={product.ratingDistribution}
            asPopover
          />

          <ProductPrice
            price={product.price}
            listPrice={product.listPrice}
            isDeal={product.tags.includes("todays-deal")}
          />

          <SelectVariant
            product={product}
            color={selectedColor}
            size={selectedSize}
          />

          <Separator />

          {/* ✅ Share placed near CTA */}
          <ShareProduct slug={product.slug} name={product.name} />
        </div>

        {/* RIGHT */}
        <div>
          <Card>
            <CardContent className="p-4 flex flex-col gap-4">
              <ProductPrice price={product.price} />

              {product.countInStock > 0 ? (
                <>
                  <AddToCart
                    item={{
                      clientId: generateId(),
                      product: product._id.toString(),
                      countInStock: product.countInStock,
                      name: product.name,
                      slug: product.slug,
                      category: product.category,
                      price: round2(product.price),
                      quantity: 1,
                      image: product.images?.[0],
                      size: selectedSize,
                      color: selectedColor,
                    }}
                  />

                  <OrderViaWhatsApp
                    productName={product.name}
                    color={selectedColor}
                    size={selectedSize}
                    quantity={1}
                    price={product.price}
                  />

                  <WishlistButton
                    productId={product._id.toString()}
                    //@ts-expect-error
                    initialWishlist={[]}
                  />
                </>
              ) : (
                <SubscribeButton productId={product._id.toString()} />
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ===================== FULL-WIDTH DESCRIPTION ===================== */}
      <section className="mt-10 max-w-5xl mx-auto">
        <h2 className="font-bold text-lg mb-2">Product Description</h2>
        <MarkdownRenderer
          content={product.description}
          className="prose prose-lg max-w-none"
        />
      </section>

      {/* =========================== REVIEWS =========================== */}
      <section className="mt-10">
        <h2 className="h2-bold mb-2">Customer Reviews</h2>
        <Suspense fallback={<ReviewsLoading />}>
          <ReviewList product={product} />
        </Suspense>
      </section>

      {/* =========================== RELATED =========================== */}
      <section className="mt-10">
        <Suspense fallback={<RelatedLoading />}>
          <RelatedBoundary
            relatedProductsPromise={relatedProductsPromise}
            category={product.category}
          />
        </Suspense>
      </section>

      <BrowsingHistoryList className="mt-10" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               RELATED BOUNDARY                              */
/* -------------------------------------------------------------------------- */

async function RelatedBoundary({
  relatedProductsPromise,
  category,
}: {
  relatedProductsPromise: Promise<any>;
  category: string;
}) {
  "use cache";
  cacheLife("days");

  const related = await relatedProductsPromise;

  return (
    <ProductSlider
      products={related?.data || []}
      title={`Best Sellers in ${category}`}
    />
  );
    }
    
