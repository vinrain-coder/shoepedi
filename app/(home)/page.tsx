
import { Suspense } from "react";
import { HomeCarousel } from "@/components/shared/home/home-carousel";
import { AboutCarousel } from "@/components/shared/home/about-carousel";
import BlogSlider from "@/components/shared/blog/blog-slider";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import { HomeCard } from "@/components/shared/home/home-card";
import ProductSlider from "@/components/shared/product/product-slider";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublishedBlogs } from "@/lib/actions/blog.actions";
import {
  getProductsForCard,
  getProductsByTag,
  getAllCategories,
} from "@/lib/actions/product.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { toSlug } from "@/lib/utils";
import { cacheLife } from "next/cache";

// Async wrapper components for streaming
const AsyncHomeCarousel = async () => {
  "use cache"
  cacheLife("days")
  const { carousels } = await getSetting();
  return <HomeCarousel items={carousels} />;
};

const AsyncFeaturedProducts = async () => {
  "use cache"
  cacheLife("days")
  const featureds = await getProductsForCard({ tag: "featured" });
  return <ProductSlider title="Featured Products" products={featureds} />;
};

const AsyncBestSellingProducts = async () => {
  "use cache"
  cacheLife("days")
  const bestSellingProducts = await getProductsByTag({ tag: "best-seller" });
  return <ProductSlider title="Best Selling Products" products={bestSellingProducts} hideDetails />;
};

const AsyncTodaysDeals = async () => {
  "use cache"
  cacheLife("days")
  const todaysDeals = await getProductsByTag({ tag: "todays-deal" });
  return <ProductSlider title="Today's Deals" products={todaysDeals} />;
};

const AsyncNewArrivalsCards = async () => {
  "use cache"
  cacheLife("days")
  const [allCategories, newArrivals, featureds, bestSellers] = await Promise.all([
    getAllCategories(),
    getProductsForCard({ tag: "new-arrival" }),
    getProductsForCard({ tag: "featured" }),
    getProductsForCard({ tag: "best-seller" }),
  ]);

  const categories = allCategories.slice(0, 4);

  const cards = [
    {
      title: "Categories to explore",
      link: { text: "See More", href: "/search" },
      items: categories.map((category: string) => ({
        name: category,
        image: `/images/${toSlug(category)}.jpg`,
        href: `/search?category=${category}`,
      })),
    },
    {
      title: "Explore New Arrivals",
      items: newArrivals,
      link: { text: "View All", href: "/search?tag=new-arrival" },
    },
    {
      title: "Discover Best Sellers",
      items: bestSellers,
      link: { text: "View All", href: "/search?tag=best-seller" },
    },
    {
      title: "Featured Products",
      items: featureds,
      link: { text: "Shop Now", href: "/search?tag=featured" },
    },
  ];

  return <HomeCard cards={cards} />;
};

const AsyncBlogSlider = async () => {
  "use cache"
  cacheLife("days")
  const { blogs } = await getPublishedBlogs({ limit: 5 });
  return <BlogSlider title="Our Latest Stories" blogs={blogs} />;
};

// Skeleton fallbacks
const SkeletonCarousel = () => <Skeleton className="h-56 w-full rounded-lg" />;
const SkeletonCard = () => <Skeleton className="h-64 w-full rounded-lg" />;
const SkeletonProductSlider = () => <Skeleton className="h-72 w-full rounded-lg" />;
const SkeletonBlogSlider = () => <Skeleton className="h-64 w-full rounded-lg" />;
const SkeletonBrowsingHistory = () => <Skeleton className="h-32 w-full rounded-lg" />;

export default function HomePage() {
  return (
    <>
      {/* Home Carousel */}
      <Suspense fallback={<SkeletonCarousel />}>
        <AsyncHomeCarousel />
      </Suspense>

      <div className="md:p-4 md:space-y-4 bg-border">
        {/* Home Cards: New Arrivals / Categories / Featured / Best Sellers */}
        <Suspense fallback={<SkeletonCard />}>
          <AsyncNewArrivalsCards />
        </Suspense>

        {/* Today's Deals */}
        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            <Suspense fallback={<SkeletonProductSlider />}>
              <AsyncTodaysDeals />
            </Suspense>
          </CardContent>
        </Card>

        {/* Best Selling Products */}
        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            <Suspense fallback={<SkeletonProductSlider />}>
              <AsyncBestSellingProducts />
            </Suspense>
          </CardContent>
        </Card>

        {/* Featured Products */}
       {/* <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            <Suspense fallback={<SkeletonProductSlider />}>
              <AsyncFeaturedProducts />
            </Suspense>
          </CardContent>
        </Card> */}
      </div> 

      {/* Browsing History */}
      <div className="p-4 bg-background">
        <Suspense fallback={<SkeletonBrowsingHistory />}>
          <BrowsingHistoryList />
        <

      {/* About Carousel */}
      <div className="p-4 bg-background">
        <Suspense fallback={<SkeletonCarousel />}>
          <AboutCarousel />
        </Suspense>
      </div>

      {/* Blog Slider */}
      <div className="p-4 bg-background flex justify-center">
        <Suspense fallback={<SkeletonBlogSlider />}>
          <AsyncBlogSlider />
        </Suspense>
      </div>
    </>
  );
}
