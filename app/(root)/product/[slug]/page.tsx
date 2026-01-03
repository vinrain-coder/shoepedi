import { Suspense } from "react";
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
import { Truck, ShieldCheck, rotateCcw } from "lucide-react"; // Common trust icons

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const { site } = await getSetting();
  if (!product) {
    return { title: "Product Not Found" };
  }
  const title = `${product.name} - ${product.brand} | Buy Online in Kenya`;
  const description = product.description 
    ? product.description.replace(/[#*]/g, "").slice(0, 160) 
    : `Shop the ${product.name} by ${product.brand} at ${site.name}. Authentic quality, KES ${product.price}, and fast delivery across Kenya.`;
  const ogImageUrl = product.images?.[0];
  return {
    title,
    description,
    alternates: { canonical: `${site.url}/product/${product.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: `${site.url}/product/${product.slug}`,
      siteName: site.name,
      type: "website",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: product.name }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImageUrl] },
  };
}

type Props = { params: any; searchParams: any };

function ReviewsLoading() {
  return (
    <div id="reviews-loading" className="p-4 bg-white rounded-lg shadow-sm">
      <div className="h-6 w-48 bg-gray-200 rounded mb-3 animate-pulse" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded animate-pulse" /><div className="h-4 bg-gray-200 rounded animate-pulse" /><div className="h-4 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

function RelatedLoading() {
  return (
    <div className="p-4">
      <div className="h-6 w-56 bg-gray-200 rounded mb-3 animate-pulse" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-32 bg-gray-200 rounded animate-pulse" /><div className="h-32 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default async function ProductDetails({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const { site } = await getSetting();
  const product = await getProductBySlug(slug);
  if (!product) return <div>Product not found</div>;

  const relatedProductsPromise = getRelatedProductsByCategory({
    category: product.category,
    productId: product._id.toString(),
    page: Number(query.page || "1"),
  });

  const selectedColor = query.color || product.colors?.[0];
  const selectedSize = query.size || product.sizes?.[0];

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${site.url}/product/${product.slug}`,
    "name": product.name,
    "image": product.images?.filter((img: string) => img && img !== ""),
    "description": product.description?.replace(/[#*]/g, ""),
    "sku": product._id.toString(),
    "brand": { "@type": "Brand", "name": product.brand || "ShoePedi" },
    "offers": {
      "@type": "Offer",
      "url": `${site.url}/product/${product.slug}`,
      "priceCurrency": "KES",
      "price": product.price,
      "priceValidUntil": "2026-12-31",
      "availability": product.countInStock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "itemCondition": "https://schema.org/NewCondition",
    },
    ...(product.numReviews > 0 ? {
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.avgRating,
        "reviewCount": product.numReviews,
        "bestRating": "5",
        "worstRating": "1"
      }
    } : {})
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }} />
      <AddToBrowsingHistory id={product._id.toString()} category={product.category} />
      
      <div className="my-4">
        <Breadcrumb />
      </div>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        {/* LEFT COLUMN: Gallery - Sticky on desktop */}
        <div className="md:col-span-7 lg:col-span-7">
          <div className="md:sticky md:top-24">
            <ProductGallery images={product.images?.filter((img: string) => img && img.trim() !== "") || []} />
            {product.videoLink && (
              <div className="mt-4 p-4 bg-secondary/20 rounded-lg">
                <h3 className="font-semibold mb-2">Watch Product Video</h3>
                <a href={product.videoLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-2">
                  Click to play video
                </a>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Selection & Buy Card */}
        <div className="md:col-span-5 lg:col-span-5 flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {product.brand} • {product.category}
            </p>
            <h1 className="font-bold text-2xl lg:text-3xl tracking-tight">{product.name}</h1>
            <RatingSummary avgRating={product.avgRating} numReviews={product.numReviews} asPopover ratingDistribution={product.ratingDistribution} />
            <ProductPrice price={product.price} listPrice={product.listPrice} isDeal={product.tags.includes("todays-deal")} forListing={false} />
          </div>

          <Separator />
          
          <SelectVariant product={product} color={selectedColor} size={selectedSize} />

          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status:</span>
                {product.countInStock > 0 ? (
                  <span className="text-green-700 font-semibold uppercase text-xs">In Stock</span>
                ) : (
                  <span className="text-destructive font-semibold uppercase text-xs">Out of Stock</span>
                )}
              </div>

              {product.countInStock > 0 && (
                <div className="flex flex-col gap-3">
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
                  <OrderViaWhatsApp productName={product.name} color={selectedColor} size={selectedSize} quantity={1} price={product.price} />
                  <div className="flex items-center justify-center gap-4 mt-2">
                     <WishlistButton productId={product._id.toString()} initialWishlist={[]} />
                     <ShareProduct slug={product.slug} name={product.name} />
                  </div>
                </div>
              )}

              {product.countInStock === 0 && <SubscribeButton productId={product._id.toString()} />}

              {/* TRUST BADGES SECTION */}
              <div className="bg-gray-50 -mx-6 -mb-6 p-4 border-t mt-4 grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center text-center gap-1">
                  <Truck className="h-5 w-5 text-primary" />
                  <span className="text-[10px] font-medium leading-tight">Fast KE Delivery</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-[10px] font-medium leading-tight">100% Authentic</span>
                </div>
                <div className="flex flex-col items-center text-center gap-1">
                  <rotateCcw className="h-5 w-5 text-primary" />
                  <span className="text-[10px] font-medium leading-tight">Easy Returns</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* DESCRIPTION SECTION: Full width below the main product view */}
      <section className="mt-16 pt-16 border-t max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-4">
             <h2 className="text-2xl font-bold">Product Description</h2>
             <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
               Find everything you need to know about the {product.name}. 
               Crafted with premium materials for the ultimate style and comfort.
             </p>
          </div>
          <div className="md:col-span-8">
            <MarkdownRenderer
              content={product.description}
              className="prose prose-slate max-w-none"
            />
          </div>
        </div>
      </section>

      <section className="mt-20" id="reviews">
        <div className="flex items-center justify-between mb-8">
            <h2 className="h2-bold">Customer Reviews</h2>
        </div>
        <Suspense fallback={<ReviewsLoading />}>
          <ReviewList product={product} />
        </Suspense>
      </section>

      <section className="mt-20">
        <Suspense fallback={<RelatedLoading />}>
          <RelatedBoundary relatedProductsPromise={relatedProductsPromise} category={product.category} />
        </Suspense>
      </section>

      <BrowsingHistoryList className="mt-20" />
    </div>
  );
}

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
      title={`Related ${category}`}
    />
  );
  }
