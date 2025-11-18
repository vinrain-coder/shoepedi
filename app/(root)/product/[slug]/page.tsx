// app/product/[slug]/page.tsx
import React, { Suspense } from "react";
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
import { getServerSession } from "@/lib/get-session";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cacheLife } from "next/cache";

/**
 * Metadata generator remains async and uses your getProductBySlug/getSetting helpers.
 * It's okay for metadata to await data here.
 */
export async function generateMetadata({ params }: { params: any }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const { site } = await getSetting();

  if (!product) return { title: "Product not found" };

  const ogImageUrl = product.images?.[0];

  return {
    title: product.name,
    description: product.description || "Check out this amazing product at ShoePedi!",
    openGraph: {
      title: product.name,
      description: product.description || "Discover this product on ShoePedi!",
      url: `${site.url}/product/${product.slug}`,
      siteName: "ShoePedi",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: product.name }],
      price: { amount: product.price.toString(), currency: "KES" },
    },
    twitter: {
      card: "summary_large_image",
      site: "@ShoePedi",
      creator: "@ShoePedi",
      title: product.name,
      description: product.description || "Discover this product on ShoePedi!",
      images: [ogImageUrl],
    },
    additionalMetaTags: [
      { property: "product:price:amount", content: product.price.toString() },
      { property: "product:price:currency", content: "KES" },
    ],
    jsonLd: {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      image: ogImageUrl,
      description: product.description,
      brand: { "@type": "Brand", name: "ShoePedi" },
      offers: {
        "@type": "Offer",
        url: `${site.url}/product/${product.slug}`,
        priceCurrency: "KES",
        price: product.price.toString(),
      },
    },
  };
}

/**
 * Export route-level rendering hints if you want to force a behavior.
 * By default 'auto' lets Next choose the best approach; you can set to 'force-dynamic'
 * if you always need request-time rendering (not required here).
 */
// export const dynamic = 'auto';

type Props = {
  params: any;
  searchParams: any;
};

/**
 * Small cached helper component: it does not read request-specific context and
 * can be cached by Next.js's "use cache" directive. This demonstrates explicit caching.
 *
 * (If you have other pure helpers you can mark them similarly.)
 */
function CachedPrice({ price, listPrice }: { price: number; listPrice?: number }) {
  // Tell Next.js this component's render result can be cached.
  // This is optional — remove if the component reads request cookies/params, etc.
  // The directive must be at the top-level of the module or a component to have effect,
  // but using it inside a little helper component shows intent.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  "use cache";

  return <ProductPrice price={price} listPrice={listPrice} />;
}

/**
 * Loading fallbacks used for Suspense boundaries — keep them small and visually similar
 * to the real UI so the page doesn't jump when content streams in.
 */
function ReviewsLoading() {
  return (
    <div id="reviews-loading" className="p-4 bg-white rounded-lg shadow-sm">
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

/**
 * Main page component — split UI into an immediate shell and Suspense-wrapped dynamic parts.
 * The shell renders quickly; suspended parts stream (reviews, related products, browsing history).
 */
export default async function ProductDetails({ params, searchParams }: Props) {
  // IMPORTANT: don't mark the whole page as "use cache" if you need request-specific data
  // (params, cookies, session). Instead, wrap request-specific child components in <Suspense>.
  //
  // Example: we need `params.slug` to fetch the product — we await it here to get the shell
  // product data that is essential to build the initial UI (name, price, hero image).
  const { slug } = await params;
  const query = await searchParams;

  // small optimization: give the cache system a hint for long-lived static-like work
  // (you can tune this value or configure cacheLife in next.config).
  cacheLife("hours");

  // get session only when needed for user-specific parts (but we use it below to pass userId to reviews)
  const sessionPromise = getServerSession();

  // product itself is essential for the top-level shell (name, price, description overview).
  const product = await getProductBySlug(slug);
  if (!product) return <div>Product not found</div>;

  // related products can be fetched concurrently — we will await some here but render them inside Suspense
  const relatedProductsPromise = getRelatedProductsByCategory({
    category: product.category,
    productId: product._id.toString(),
    page: Number(query.page || "1"),
  });

  const selectedColor = query.color || product.colors?.[0];
  const selectedSize = query.size || product.sizes?.[0];

  return (
    <div>
      {/* Persist browsing history (client effect) — this is a client component; it should be OK to render here */}
      <AddToBrowsingHistory id={product._id.toString()} category={product.category} />

      <section>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* LEFT: Gallery & video — relatively static per product and fast to resolve */}
          <div className="col-span-2">
            <ProductGallery
              images={
                product.images?.filter((img: string) => img && img.trim() !== "") || []
              }
            />

            {product.videoLink && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Product Video</h3>
                <a
                  href={product.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Watch Here
                </a>
              </div>
            )}
          </div>

          {/* CENTER: Core product info — price, variant selection, description */}
          <div className="flex w-full flex-col gap-2 md:p-5 col-span-2">
            <div className="flex flex-col gap-3">
              <p className="p-medium-16 rounded-full bg-grey-500/10 text-grey-500">
                Brand: {product.brand} {product.category}
              </p>
              <h1 className="font-bold text-lg lg:text-xl">{product.name}</h1>

              <RatingSummary
                avgRating={product.avgRating}
                numReviews={product.numReviews}
                asPopover
                ratingDistribution={product.ratingDistribution}
              />

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* cached helper for price display */}
                <CachedPrice price={product.price} listPrice={product.listPrice} />
              </div>
            </div>

            <SelectVariant product={product} color={selectedColor} size={selectedSize} />

            <Separator className="my-2" />

            <div className="flex flex-col gap-2">
              <p className="p-bold-20 text-grey-600">Description:</p>
              <article className="prose prose-lg max-w-none mt-6">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: (props) => (
                      <h1
                        className="text-3xl font-bold mt-5 dark:text-gray-400 text-gray-900"
                        {...props}
                      />
                    ),
                    h2: (props) => (
                      <h2
                        className="text-2xl font-semibold mt-4 dark:text-gray-400 text-gray-800"
                        {...props}
                      />
                    ),
                    h3: (props) => (
                      <h3
                        className="text-xl font-medium mt-3 dark:text-gray-400 text-gray-700"
                        {...props}
                      />
                    ),
                    p: (props) => (
                      <p
                        className="leading-relaxed my-2 dark:text-gray-300 text-gray-800"
                        {...props}
                      />
                    ),
                    ul: (props) => (
                      <ul
                        className="list-disc pl-6 my-2 dark:text-gray-300 text-gray-800"
                        {...props}
                      />
                    ),
                    ol: (props) => (
                      <ol
                        className="list-decimal pl-6 my-2 dark:text-gray-300 text-gray-800"
                        {...props}
                      />
                    ),
                    li: (props) => (
                      <li className="mb-1 dark:text-gray-300 text-gray-800" {...props} />
                    ),
                    blockquote: (props) => (
                      <blockquote
                        className="border-l-4 border-gray-500 pl-4 italic dark:text-gray-400 text-gray-700 my-3"
                        {...props}
                      />
                    ),
                    a: (props) => (
                      <a
                        target="_self"
                        rel="noopener noreferrer"
                        className="text-blue-500 font-medium hover:underline dark:text-blue-400"
                        {...props}
                      />
                    ),
                    strong: (props) => (
                      <strong className="font-semibold dark:text-white text-gray-900" {...props} />
                    ),
                    pre: (props) => (
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4" {...props} />
                    ),
                    img: ({ src = "", alt = "" }) => {
                      if (!src) return null;
                      return (
                        <Image
                          src={src as string}
                          alt={alt}
                          width={800}
                          height={450}
                          className="rounded-xl object-contain"
                          unoptimized
                        />
                      );
                    },
                  }}
                >
                  {product.description}
                </ReactMarkdown>
              </article>
            </div>
          </div>

          {/* RIGHT: buy card (fast to show) */}
          <div>
            <Card>
              <CardContent className="p-4 flex flex-col gap-4">
                <ProductPrice price={product.price} />

                {product.countInStock > 0 && product.countInStock <= 3 && (
                  <div className="text-destructive font-bold">
                    Only {product.countInStock} left in stock - order soon
                  </div>
                )}

                {product.countInStock !== 0 ? (
                  <div className="text-green-700 text-xl">In Stock</div>
                ) : (
                  <div className="text-destructive text-xl">Out of Stock</div>
                )}

                {product.countInStock !== 0 && (
                  <div className="flex justify-center items-center">
                    <div className="flex flex-col gap-2 items-center">
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
                        variant={selectedColor}
                        size={selectedSize}
                        quantity={1}
                        price={product.price}
                      />
                      <WishlistButton
                        productId={product._id.toString()}
                        // @ts-expect-error
                        initialWishlist={[]}
                      />
                    </div>
                  </div>
                )}

                {product.countInStock === 0 && (
                  <div className="flex justify-center items-center mt-4">
                    <SubscribeButton productId={product._id.toString()} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2 my-2">
        <h3 className="font-semibold">Share this product</h3>
        <ShareProduct slug={product.slug} name={product.name} />
      </div>

      {/* REVIEWS - user-specific (session needed). Wrap in Suspense so shell shows immediately
          and reviews stream in as soon as getServerSession + review fetch complete. */}
      <section className="mt-10" id="reviews">
        <h2 className="h2-bold mb-2">Customer Reviews</h2>
        <Suspense fallback={<ReviewsLoading />}>
          {/* resolve session first, pass userId (if any) to the review list */}
          {/* We await session inside a small async wrapper to avoid leaking request data into the static shell */}
          <ReviewsBoundary sessionPromise={sessionPromise} product={product} />
        </Suspense>
      </section>

      {/* RELATED PRODUCTS - dynamic (depends on relatedProductsPromise). Wrap in Suspense so it streams in. */}
      <section className="mt-10">
        <Suspense fallback={<RelatedLoading />}>
          <RelatedBoundary relatedProductsPromise={relatedProductsPromise} category={product.category} />
        </Suspense>
      </section>

      {/* Browsing history - client component that may depend on localStorage / client state.
          We also show it inside a Suspense to ensure main shell renders fast. */}
      <section>
        <Suspense fallback={<div className="p-4">Loading...</div>}>
          <BrowsingHistoryList className="mt-10" />
        </Suspense>
      </section>
    </div>
  );
}

/**
 * Small async server component wrapper that awaits the session (request-specific)
 * and then renders ReviewList. Kept separate so the parent page shell can be pre-rendered.
 *
 * This component reads request-specific info (session) so it MUST NOT be 'use cache'.
 */
async function ReviewsBoundary({ sessionPromise, product }: { sessionPromise: Promise<any>; product: any }) {
  const session = await sessionPromise;
  // Render ReviewList (presumably server component or async component that fetches reviews)
  return <ReviewList product={product} userId={session?.user?.id} />;
}

/**
 * Related products wrapper: awaits the related products promise and renders the slider.
 * Keep it as an async server component wrapped in Suspense so it streams.
 *
 * If getRelatedProductsByCategory can be cached on your backend, you can consider
 * using 'use cache' inside that function (where data is fetched) instead of here.
 */
async function RelatedBoundary({ relatedProductsPromise, category }: { relatedProductsPromise: Promise<any>; category: string }) {
  const related = await relatedProductsPromise;
  return <ProductSlider products={related?.data || []} title={`Best Sellers in ${category}`} />;
}
  
