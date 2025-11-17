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
import { notFound } from "next/navigation";

/* -------------------------------------------------------
   Cached wrappers - use 'use cache' inside each wrapper
   (keeps your DB/API calls memoized per Next.js 16)
   ------------------------------------------------------- */
const cachedGetProduct = async (slug: string) => {
  "use cache";
  return await getProductBySlug(slug);
};

const cachedGetRelatedProducts = async (payload: {
  category: string;
  productId: string;
  page: number;
}) => {
  "use cache";
  return await getRelatedProductsByCategory(payload);
};

const cachedGetSetting = async () => {
  "use cache";
  return await getSetting();
};

/* -------------------------
   Small skeleton components
   ------------------------- */
function GallerySkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-64 rounded-xl bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-4 gap-2 mt-2">
        <div className="h-20 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-20 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-20 rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-20 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 w-1/3 bg-gray-200 rounded" />
      <div className="h-8 w-2/3 bg-gray-200 rounded" />
      <div className="h-4 w-1/2 bg-gray-200 rounded" />
      <div className="h-40 bg-gray-200 rounded" />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="p-4 border rounded animate-pulse bg-white/50 dark:bg-gray-800/50">
      <div className="h-6 w-1/2 bg-gray-200 rounded mb-3" />
      <div className="h-10 w-full bg-gray-200 rounded mb-2" />
      <div className="h-10 w-full bg-gray-200 rounded" />
    </div>
  );
}

/* -----------------------------------------
   Async server subcomponents (they return Promises)
   These will stream when they resolve.
   ----------------------------------------- */

async function GallerySection({ product }: { product: any }) {
  // no caching or runtime APIs here — purely renderable from product
  const images = (product.images || []).filter((img: string) => img && img.trim() !== "");
  return (
    <div className="col-span-2">
      <ProductGallery images={images} />
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
  );
}

async function DetailsSection({
  product,
  selectedColor,
  selectedSize,
  session,
}: {
  product: any;
  selectedColor: string;
  selectedSize: string;
  session: any;
}) {
  return (
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

        <ProductPrice price={product.price} listPrice={product.listPrice} isDeal />
      </div>

      <SelectVariant product={product} color={selectedColor} size={selectedSize} />

      <Separator className="my-2" />

      <div className="flex flex-col gap-2">
        <p className="p-bold-20 text-grey-600">Description:</p>

        <article className="prose prose-lg max-w-none mt-6">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: (props) => <h1 className="text-3xl font-bold mt-5 dark:text-gray-400 text-gray-900" {...props} />,
              h2: (props) => <h2 className="text-2xl font-semibold mt-4 dark:text-gray-400 text-gray-800" {...props} />,
              h3: (props) => <h3 className="text-xl font-medium mt-3 dark:text-gray-400 text-gray-700" {...props} />,
              p: (props) => <p className="leading-relaxed my-2 dark:text-gray-300 text-gray-800" {...props} />,
              ul: (props) => <ul className="list-disc pl-6 my-2 dark:text-gray-300 text-gray-800" {...props} />,
              ol: (props) => <ol className="list-decimal pl-6 my-2 dark:text-gray-300 text-gray-800" {...props} />,
              li: (props) => <li className="mb-1 dark:text-gray-300 text-gray-800" {...props} />,
              blockquote: (props) => <blockquote className="border-l-4 border-gray-500 pl-4 italic dark:text-gray-400 text-gray-700 my-3" {...props} />,
              a: (props) => <a target="_self" rel="noopener noreferrer" className="text-blue-500 font-medium hover:underline dark:text-blue-400" {...props} />,
              strong: (props) => <strong className="font-semibold dark:text-white text-gray-900" {...props} />,
              pre: (props) => <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto my-4" {...props} />,
              img: ({ src = "", alt = "" }) =>
                src ? (
                  <Image src={src} alt={alt} width={800} height={450} className="rounded-xl object-contain" unoptimized />
                ) : null,
            }}
          >
            {product.description}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}

async function SidebarCard({ product, selectedColor, selectedSize }: { product: any; selectedColor: string; selectedSize: string }) {
  return (
    <div>
      <Card>
        <CardContent className="p-4 flex flex-col gap-4">
          <ProductPrice price={product.price} />

          {product.countInStock > 0 && product.countInStock <= 3 && (
            <div className="text-destructive font-bold">Only {product.countInStock} left – order soon</div>
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
                    image: product.images[0],
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

                <WishlistButton productId={product._id.toString()} initialWishlist={[]} />
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
  );
}

async function ReviewsSection({ product, userId }: { product: any; userId?: string }) {
  // ReviewList is likely a client/server component. We keep it as-is.
  return (
    <section className="mt-10" id="reviews">
      <h2 className="h2-bold mb-2">Customer Reviews</h2>
      {/* ReviewList may use session/userId for actions */}
      <ReviewList product={product} userId={userId} />
    </section>
  );
}

async function RelatedSection({ product }: { product: any }) {
  // This component expects related products data; we'll fetch inside main and pass it in.
  return (
    <section className="mt-10">
      {/* ProductSlider expects products and a title */}
      <ProductSlider products={product._related?.data ?? []} title={`Best Sellers in ${product.category}`} />
    </section>
  );
}

async function BrowsingHistorySection() {
  return (
    <section>
      <BrowsingHistoryList className="mt-10" />
    </section>
  );
}

/* -----------------------------------------
   Main page component — wires everything up
   ----------------------------------------- */
export default async function ProductDetails({ params, searchParams }: { params: any; searchParams: any }) {
  const { slug } = params;
  const query = searchParams ?? {};

  // Kick off required async work in parallel
  const sessionPromise = getServerSession(); // user-specific, not cached
  const productPromise = cachedGetProduct(slug); // cached
  const settingsPromise = cachedGetSetting(); // cached

  const [session, product, settings] = await Promise.all([sessionPromise, productPromise, settingsPromise]);

  if (!product) return notFound();

  // get related products (cached) — start fetching but don't await yet
  const relatedPromise = cachedGetRelatedProducts({
    category: product.category,
    productId: product._id.toString(),
    page: Number(query.page || "1"),
  });

  // await related but attach it to product for easier passing to RelatedSection (so RelatedSection can stream quickly)
  const relatedProducts = await relatedPromise;
  // attach a small _related field so RelatedSection can use it without extra fetch
  product._related = relatedProducts;

  const selectedColor = query.color || product.colors?.[0] || "";
  const selectedSize = query.size || product.sizes?.[0] || "";

  return (
    <div>
      {/* action to record browsing history (client/server component) */}
      <AddToBrowsingHistory id={product._id.toString()} category={product.category} />

      <section>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Gallery — stream first */}
          <Suspense fallback={<GallerySkeleton />}>
            {/* GallerySection is async server component */}
            {/* @ts-expect-error Async Server Component */}
            <GallerySection product={product} />
          </Suspense>

          {/* Details — stream independently */}
          <Suspense fallback={<DetailsSkeleton />}>
            {/* @ts-expect-error Async Server Component */}
            <DetailsSection product={product} selectedColor={selectedColor} selectedSize={selectedSize} session={session} />
          </Suspense>

          {/* Sidebar — stream independently */}
          <Suspense fallback={<SidebarSkeleton />}>
            {/* @ts-expect-error Async Server Component */}
            <SidebarCard product={product} selectedColor={selectedColor} selectedSize={selectedSize} />
          </Suspense>
        </div>
      </section>

      {/* Share area (lightweight) */}
      <div className="flex flex-col gap-2 my-2">
        <h3 className="font-semibold">Share this product</h3>
        <ShareProduct slug={product.slug} name={product.name} />
      </div>

      {/* Reviews — stream as soon as ReviewList is ready */}
      <Suspense fallback={<div className="mt-10"><div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-3" /><div className="h-40 bg-gray-100 rounded animate-pulse" /></div>}>
        {/* @ts-expect-error Async Server Component */}
        <ReviewsSection product={product} userId={session?.user?.id} />
      </Suspense>

      {/* Related products — stream independently */}
      <Suspense fallback={<div className="mt-10"><div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-3" /><div className="h-40 bg-gray-100 rounded animate-pulse" /></div>}>
        {/* @ts-expect-error Async Server Component */}
        <RelatedSection product={product} />
      </Suspense>

      {/* Browsing history — least important, stream last */}
      <Suspense fallback={<div className="mt-6 h-40 bg-gray-100 rounded animate-pulse" />}>
        {/* @ts-expect-error Async Server Component */}
        <BrowsingHistorySection />
      </Suspense>
    </div>
  );
}
