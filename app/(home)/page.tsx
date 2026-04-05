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
} from "@/lib/actions/product.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { cacheLife } from "next/cache";
import { getAllCategoriesForStore } from "@/lib/actions/category.actions";
import { getAllBrandsForStore } from "@/lib/actions/brand.actions";
import { getAllTagsForStore } from "@/lib/actions/tag.actions";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const {
    site: { name, description, slogan },
  } = await getSetting();
  return {
    title: `${name} | ${slogan}`,
    description,
  };
}

// Async wrapper components for streaming
const AsyncHomeCarousel = async () => {
  "use cache";
  cacheLife("days");
  const { carousels } = await getSetting();
  return <HomeCarousel items={carousels} />;
};

const AsyncBestSellingProducts = async () => {
  "use cache";
  cacheLife("days");
  const bestSellingProducts = await getProductsByTag({ tag: "best-seller" });
  return (
    <ProductSlider
      title="Best Selling Products"
      products={bestSellingProducts}
      hideDetails
    />
  );
};

const AsyncTodaysDeals = async () => {
  "use cache";
  cacheLife("days");
  const todaysDeals = await getProductsByTag({ tag: "todays-deal" });
  return <ProductSlider title="Today's Deals" products={todaysDeals} />;
};

const AsyncNewArrivalsCards = async () => {
  "use cache";
  cacheLife("days");
  const [
    allCategories,
    allBrands,
    allTags,
    newArrivals,
    featureds,
    bestSellers,
  ] = await Promise.all([
    getAllCategoriesForStore(),
    getAllBrandsForStore(),
    getAllTagsForStore(),
    getProductsForCard({ tag: "new-arrival" }),
    getProductsForCard({ tag: "featured" }),
    getProductsForCard({ tag: "best-seller" }),
  ]);

  const categories = allCategories.slice(0, 4);
  const brands = allBrands.slice(0, 4);
  const tags = allTags.slice(0, 4);

  const cards = [
    {
      title: "Categories to explore",
      link: { text: "See More", href: "/categories" },
      items: categories.map((category: any) => ({
        name: category.name,
        image: category.image || "/images/not-found.png",
        href: `/categories/${category.slug}`,
      })),
    },
    {
      title: "Our Brands",
      link: { text: "Shop Brands", href: "/brands" },
      items: brands.map((brand: any) => ({
        name: brand.name,
        image: brand.logo || "/images/not-found.png",
        href: `/brands/${brand.slug}`,
      })),
    },
    {
      title: "Browse By Tags",
      link: { text: "View All", href: "/tags" },
      items: tags.map((tag: any) => ({
        name: tag.name,
        image: tag.image || "/images/not-found.png",
        href: `/tags/${tag.slug}`,
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
  "use cache";
  cacheLife("days");
  const { blogs } = await getPublishedBlogs({ limit: 5 });
  return <BlogSlider title="Our Latest Stories" blogs={blogs} />;
};

// Skeleton fallbacks
const SkeletonCarousel = () => <Skeleton className="aspect-[16/8] md:aspect-[16/6] w-full rounded-none" />;
const SkeletonCard = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
    {[1, 2, 3, 4].map((i) => (
      <Skeleton key={i} className="h-[400px] w-full rounded-2xl" />
    ))}
  </div>
);
const SkeletonProductSlider = () => (
  <Skeleton className="h-72 w-full rounded-2xl" />
);
const SkeletonBlogSlider = () => (
  <Skeleton className="h-64 w-full rounded-2xl" />
);

export default async function HomePage() {
  const { site } = await getSetting();
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: site.url,
    description: site.description,
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}${site.logo}`,
      },
    },
  };

  return (
    <div className="bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {/* Home Carousel */}
      <Suspense fallback={<SkeletonCarousel />}>
        <AsyncHomeCarousel />
      </Suspense>

      <div className="max-w-7xl mx-auto py-8 md:py-16 space-y-10 md:space-y-16 px-2 md:px-0">
        {/* Home Cards: New Arrivals / Categories / Featured / Best Sellers */}
        <section>
          <Suspense fallback={<SkeletonCard />}>
            <AsyncNewArrivalsCards />
          </Suspense>
        </section>

        {/* Today's Deals */}
        <section>
          <Card className="w-full rounded-2xl border-none shadow-md overflow-hidden bg-card">
            <CardContent className="p-4">
              <Suspense fallback={<SkeletonProductSlider />}>
                <AsyncTodaysDeals />
              </Suspense>
            </CardContent>
          </Card>
        </section>

        {/* Best Selling Products */}
        <section>
          <Card className="w-full rounded-2xl border-none shadow-md overflow-hidden bg-card">
            <CardContent className="p-4">
              <Suspense fallback={<SkeletonProductSlider />}>
                <AsyncBestSellingProducts />
              </Suspense>
            </CardContent>
          </Card>
        </section>

        {/* Browsing History */}
        <section className="bg-muted/30 rounded-3xl p-4 md:p-8">
          <BrowsingHistoryList />
        </section>

        {/* About Carousel */}
        <section>
          <Suspense fallback={<SkeletonCarousel />}>
            <AboutCarousel />
          </Suspense>
        </section>

        {/* Blog Slider */}
        <section className="flex justify-center">
          <Suspense fallback={<SkeletonBlogSlider />}>
            <AsyncBlogSlider />
          </Suspense>
        </section>
      </div>
    </div>
  );
}
