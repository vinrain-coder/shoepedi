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

export async function generateMetadata({ params }: { params: any }) {
  const { slug } = await params; // ✅ destructure after awaiting
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

export default async function ProductDetails({
  params,
  searchParams,
}: {
  params: any;
  searchParams: any;
}) {
  const { slug } = await params; // ✅ await first
  const query = await searchParams; // ✅ await

  const session = await getServerSession();

  const product = await getProductBySlug(slug);
  if (!product) return <div>Product not found</div>;

  const relatedProducts = await getRelatedProductsByCategory({
    category: product.category,
    productId: product._id.toString(),
    page: Number(query.page || "1"),
  });

  const selectedColor = query.color || product.colors[0];
  const selectedSize = query.size || product.sizes[0];

  return (
    <div>
      <AddToBrowsingHistory
        id={product._id.toString()}
        category={product.category}
      />

      <section>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="col-span-2">
            <ProductGallery
              images={product.images}
              selectedColor={selectedColor}
              colors={product.colors}
            />
          </div>

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
                <ProductPrice
                  price={product.price}
                  listPrice={product.listPrice}
                  isDeal
                />
              </div>
            </div>

            <SelectVariant
              product={product}
              color={selectedColor}
              size={selectedSize}
            />

            <Separator className="my-2" />

            <div className="flex flex-col gap-2">
              <p className="p-bold-20 text-grey-600">Description:</p>
              <p className="p-medium-16 lg:p-regular-18">
                {product.description}
              </p>
            </div>
          </div>

          <div>
            <Card>
              <CardContent className="p-4 flex flex-col gap-4">
                <ProductPrice price={product.price} />

                {product.countInStock > 0 && product.countInStock <= 3 && (
                  <div className="text-destructive font-bold">
                    Only few left in stock - order soon
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
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2 my-2">
        <h3 className="font-semibold">Share this product</h3>
        <ShareProduct slug={product.slug} name={product.name} />
      </div>

      <section className="mt-10" id="reviews">
        <h2 className="h2-bold mb-2">Customer Reviews</h2>
        <ReviewList product={product} userId={session?.user.id} />
      </section>

      <section className="mt-10">
        <ProductSlider
          products={relatedProducts.data}
          title={`Best Sellers in ${product.category}`}
        />
      </section>

      <section>
        <BrowsingHistoryList className="mt-10" />
      </section>
    </div>
  );
}
