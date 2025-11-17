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
import { Skeleton } from "@/components/ui/skeleton";

export async function generateMetadata({ params }: { params: any }) {
  const { slug } = params; // FIXED — ❌ no await
  const product = await getProductBySlug(slug);
  const { site } = await getSetting();

  if (!product) return { title: "Product not found" };

  const ogImageUrl = product.images[0];

  return {
    title: product.name,
    description:
      product.description || "Check out this amazing product at ShoePedi!",
    openGraph: {
      title: product.name,
      description: product.description || "Discover this product on ShoePedi!",
      url: `${site.url}/product/${product.slug}`,
      siteName: "ShoePedi",
      images: [
        { url: ogImageUrl, width: 1200, height: 630, alt: product.name },
      ],
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
  };
}

/* -------------------------------------------------------
   Cached wrappers
------------------------------------------------------- */
const cachedGetProduct = async (slug: string) => {
  "use cache";
  return await getProductBySlug(slug);
};

const cachedGetRelated = async (payload: any) => {
  "use cache";
  return await getRelatedProductsByCategory(payload);
};

const cachedGetSetting = async () => {
  "use cache";
  return await getSetting();
};

/* -------------------------------------------------------
   SHADCN SKELETONS
------------------------------------------------------- */

function GallerySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-64 w-full rounded-xl" />
      <div className="grid grid-cols-4 gap-2">
        <Skeleton className="h-20 w-full rounded" />
        <Skeleton className="h-20 w-full rounded" />
        <Skeleton className="h-20 w-full rounded" />
        <Skeleton className="h-20 w-full rounded" />
      </div>
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="p-4 border rounded bg-white dark:bg-neutral-900">
      <Skeleton className="h-6 w-32 mb-3" />
      <Skeleton className="h-10 w-full mb-2" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

/* -------------------------------------------------------
   Async server streamed sections
------------------------------------------------------- */

async function GallerySection({ product }: any) {
  const images = product.images.filter(Boolean);
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
            className="text-primary"
          >
            Watch Here
          </a>
        </div>
      )}
    </div>
  );
}

async function DetailsSection({ product, selectedColor, selectedSize, session }: any) {
  return (
    <div className="col-span-2 flex flex-col gap-4 md:p-4">
      <p className="rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-gray-600 dark:text-gray-300">
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

      <SelectVariant product={product} color={selectedColor} size={selectedSize} />

      <Separator />

      <article className="prose prose-lg mt-4 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {product.description}
        </ReactMarkdown>
      </article>
    </div>
  );
}

async function SidebarCard({ product, selectedColor, selectedSize }: any) {
  return (
    <div>
      <Card>
        <CardContent className="p-4 flex flex-col gap-4">
          <ProductPrice price={product.price} />

          {product.countInStock > 0 && product.countInStock <= 3 && (
            <div className="text-red-600 font-bold">
              Only {product.countInStock} left – order soon
            </div>
          )}

          {product.countInStock !== 0 ? (
            <div className="text-green-700 text-xl">In Stock</div>
          ) : (
            <div className="text-red-600 text-xl">Out of Stock</div>
          )}

          {product.countInStock !== 0 ? (
            <div className="flex justify-center">
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
          ) : (
            <SubscribeButton productId={product._id.toString()} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

async function ReviewsSection({ product, userId }: any) {
  return (
    <section className="mt-10">
      <h2 className="h2-bold mb-2">Customer Reviews</h2>
      <ReviewList product={product} userId={userId} />
    </section>
  );
}

async function RelatedSection({ related, category }: any) {
  return (
    <section className="mt-10">
      <ProductSlider products={related.data} title={`Best Sellers in ${category}`} />
    </section>
  );
}

async function BrowsingHistorySection() {
  return <BrowsingHistoryList className="mt-10" />;
}

/* -------------------------------------------------------
   MAIN PAGE
------------------------------------------------------- */
export default async function ProductDetails({ params, searchParams }: any) {
  const { slug } = params; // FIXED — ❌ no await
  const query = searchParams ?? {};

  const product = await cachedGetProduct(slug);
  if (!product) return notFound();

  const session = await getServerSession();

  const related = await cachedGetRelated({
    category: product.category,
    productId: product._id.toString(),
    page: Number(query.page || "1"),
  });

  const selectedColor = query.color || product.colors?.[0];
  const selectedSize = query.size || product.sizes?.[0];

  return (
    <div>
      <AddToBrowsingHistory id={product._id.toString()} category={product.category} />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <Suspense fallback={<GallerySkeleton />}>
          {/* @ts-expect-error */}
          <GallerySection product={product} />
        </Suspense>

        <Suspense fallback={<DetailsSkeleton />}>
          {/* @ts-expect-error */}
          <DetailsSection
            product={product}
            session={session}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
          />
        </Suspense>

        <Suspense fallback={<SidebarSkeleton />}>
          {/* @ts-expect-error */}
          <SidebarCard
            product={product}
            selectedColor={selectedColor}
            selectedSize={selectedSize}
          />
        </Suspense>
      </section>

      {/* Share */}
      <div className="my-4">
        <h3 className="font-semibold">Share this product</h3>
        <ShareProduct slug={product.slug} name={product.name} />
      </div>

      {/* Reviews */}
      <Suspense fallback={<Skeleton className="h-40 w-full mt-10" />}>
        {/* @ts-expect-error */}
        <ReviewsSection product={product} userId={session?.user?.id} />
      </Suspense>

      {/* Related */}
      <Suspense fallback={<Skeleton className="h-40 w-full mt-10" />}>
        {/* @ts-expect-error */}
        <RelatedSection related={related} category={product.category} />
      </Suspense>

      {/* Browsing history */}
      <Suspense fallback={<Skeleton className="h-40 w-full mt-10" />}>
        {/* @ts-expect-error */}
        <BrowsingHistorySection />
      </Suspense>
    </div>
  );
  }
  
