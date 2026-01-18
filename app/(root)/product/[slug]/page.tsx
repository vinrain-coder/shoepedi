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
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import { Factory, Layers, Tag } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: any;
}): Promise<Metadata> {
  const { slug } = await params;

  const [product, { site }] = await Promise.all([
    getProductBySlug(slug),
    getSetting(),
  ]);

  if (!product) {
    return {
      title: "Product Not Found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${product.name} - ${product.brand} | Buy Online in Kenya`;

  const description = product.description
    ? product.description.replace(/[#*]/g, "").slice(0, 160) // Clean markdown and trim
    : `Shop the ${product.name} by ${product.brand} at ${site.name}. Authentic quality, KES ${product.price}, and fast delivery across Kenya.`;

  const ogImageUrl = product.images?.[0];

  return {
    title,

    description,

    alternates: {
      canonical: `${site.url}/product/${product.slug}`,
    },

    robots: {
      index: true,

      follow: true,

      googleBot: {
        index: true,

        follow: true,

        "max-video-preview": -1,

        "max-image-preview": "large",

        "max-snippet": -1,
      },
    },

    openGraph: {
      title,

      description,

      url: `${site.url}/product/${product.slug}`,

      siteName: site.name,

      type: "website", // Use "website" or "og:product" if supported by your provider

      images: [
        {
          url: ogImageUrl,

          width: 1200,

          height: 630,

          alt: product.name,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",

      title,

      description,

      images: [ogImageUrl],
    },
  };
}

type Props = {
  params: any;

  searchParams: any;
};

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

export default async function ProductDetails({ params, searchParams }: Props) {
  const { slug } = await params;

  const query = await searchParams;

  const [product, { site }] = await Promise.all([
    getProductBySlug(slug),
    getSetting(),
  ]);

  if (!product) {
    notFound();
  }

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

    name: product.name,

    image: product.images?.filter((img: string) => img && img !== ""),

    description: product.description?.replace(/[#*]/g, ""),

    sku: product._id.toString(),

    brand: {
      "@type": "Brand",

      name: product.brand || "ShoePedi",
    },

    offers: {
      "@type": "Offer",

      url: `${site.url}/product/${product.slug}`,

      priceCurrency: "KES",

      price: product.price,

      priceValidUntil: "2026-12-31", // Keeps the price relevant in search

      availability:
        product.countInStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",

      itemCondition: "https://schema.org/NewCondition",

      shippingDetails: {
        "@type": "OfferShippingDetails",

        shippingRate: {
          "@type": "MonetaryAmount",

          value: "0", // Change if you have shipping costs

          currency: "KES",
        },

        deliveryTime: {
          "@type": "ShippingDeliveryTime",

          businessDays: {
            minValue: 1,

            maxValue: 3,
          },
        },
      },

      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",

        applicableCountry: "KE",

        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnPeriod",

        merchantReturnDays: 7,

        returnMethod: "https://schema.org/ReturnByMail",

        returnFees: "https://schema.org/FreeReturn",
      },
    },

    // This enables Star Ratings in Google

    ...(product.numReviews > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",

            ratingValue: product.avgRating,

            reviewCount: product.numReviews,

            bestRating: "5",

            worstRating: "1",
          },
        }
      : {}),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />

      <AddToBrowsingHistory
        id={product._id.toString()}
        category={product.category}
      />

      <div className="my-1">
        <Breadcrumb />
      </div>

      <section>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* LEFT: Gallery & video — relatively static per product and fast to resolve */}

          <div className="col-span-2 md:sticky md:top-24">
            <ProductGallery
              images={
                product.images?.filter(
                  (img: string) => img && img.trim() !== ""
                ) || []
              }
            />

            {product.videoLink && (
              <div className="mt-2">
                <h3 className="font-semibold mb-2">Product Video</h3>

                <a
                  href={product.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Watch here
                </a>
              </div>
            )}
          </div>

          {/* CENTER: Core product info — price, variant selection, description */}

          <div className="flex w-full flex-col gap-2 md:p-5 col-span-2">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                {product.brand && (
                  <Link
                    href={`/brands/${product.brand}`}
                    className="rounded-full bg-gray-500/10 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-500/20 transition"
                  >
                    <Factory className="h-3 w-3" /> {product.brand}
                  </Link>
                )}

                {product.category && (
                  <Link
                    href={`/categories/${product.category}`}
                    className="rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-700 hover:bg-blue-500/20 transition"
                  >
                    <Layers className="h-3 w-3" /> {product.category}
                  </Link>
                )}

                {product.tags?.[0] && (
                  <Link
                    href={`/tags/${product.tags[0]}`}
                    className="rounded-full bg-gray-500/10 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-500/20 transition"
                  >
                    <Tag className="h-3 w-3" /> #{product.tags[0]}
                  </Link>
                )}
              </div>

              <h1 className="font-bold text-lg lg:text-xl">
                {product.name}{" "}
                <span className="sr-only">Buy Online in Kenya</span>
              </h1>

              <p className="sr-only">
                Buy {product.name} online in Kenya at {site.name}. Price: KES{" "}
                {product.price}. Available in {product.colors?.join(", ")}{" "}
                colors and sizes.
              </p>

              <RatingSummary
                avgRating={product.avgRating}
                numReviews={product.numReviews}
                asPopover
                ratingDistribution={product.ratingDistribution}
              />

              <Separator />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <ProductPrice
                  price={product.price}
                  listPrice={product.listPrice}
                  isDeal={product.tags.includes("todays-deal")}
                  forListing={false}
                />
              </div>
            </div>

            <Separator className="my-2" />

            <SelectVariant
              product={product}
              color={selectedColor}
              size={selectedSize}
            />
          </div>

          {/* RIGHT: buy card (fast to show) */}

          <div className="md:sticky md:top-24">
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
                    </div>
                  </div>
                )}

                {product.countInStock === 0 && (
                  <div className="flex justify-center items-center mt-4">
                    <SubscribeButton productId={product._id.toString()} />
                  </div>
                )}
                <ul className="text-sm text-gray-600 space-y-1 mt">
                  <li>✓ Free delivery in Nairobi</li>
                  <li>✓ 7-day return policy</li>
                  <li>✓ Pay on deliveryhin Nairobi</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mt-10 max-w-5xl mx-auto">
        <h2 className="font-bold text-lg mb-2">Product Description</h2>
        <MarkdownRenderer
          content={product.description}
          className="prose prose-lg max-w-none"
        />
      </section>

      <div className="flex flex-col gap-2 my-2">
        <h3 className="font-semibold">Share this product</h3>

        <ShareProduct slug={product.slug} name={product.name} />
      </div>

      <section className="mt-10" id="reviews">
        <h2 className="h2-bold mb-2">Customer Reviews</h2>

        <Suspense fallback={<ReviewsLoading />}>
          <ReviewList product={product} />
        </Suspense>
      </section>

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
