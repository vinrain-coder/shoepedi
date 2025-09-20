import dynamic from "next/dynamic";
import BlogSlider from "@/components/shared/blog/blog-slider";
import BrowsingHistoryList from "@/components/shared/browsing-history-list";
import { HomeCard } from "@/components/shared/home/home-card";
import ProductSlider from "@/components/shared/product/product-slider";
import { Card, CardContent } from "@/components/ui/card";
import { fetchLatestBlogs } from "@/lib/actions/blog.actions";

const HomeCarousel = dynamic(
  () =>
    import("@/components/shared/home/home-carousel").then(
      (m) => m.HomeCarousel
    ),
  { ssr: false }
);

const AboutCarousel = dynamic(
  () =>
    import("@/components/shared/home/about-carousel").then(
      (m) => m.AboutCarousel
    ),
  { ssr: false }
);

import {
  getProductsForCard,
  getProductsByTag,
  getAllCategories,
} from "@/lib/actions/product.actions";
import { getSetting } from "@/lib/actions/setting.actions";
import { toSlug } from "@/lib/utils";

export default async function HomePage() {
  // Fetch all data in parallel for speed
  const [
    settingResult,
    todaysDeals,
    bestSellingProducts,
    allCategories,
    newArrivals,
    featureds,
    bestSellers,
  ] = await Promise.all([
    getSetting(),
    getProductsByTag({ tag: "todays-deal" }),
    getProductsByTag({ tag: "best-seller" }),
    getAllCategories(),
    getProductsForCard({ tag: "new-arrival" }),
    getProductsForCard({ tag: "featured" }),
    getProductsForCard({ tag: "best-seller" }),
  ]);
  const blogs = await fetchLatestBlogs({ limit: 5 });

  const { carousels } = settingResult;
  const categories = allCategories.slice(0, 4);

  const cards = [
    {
      title: "Categories to explore",
      link: { text: "See More", href: "/search" },
      items: categories.map((category) => ({
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
      link: { text: "View All", href: "/search?tag=new-arrival" },
    },
    {
      title: "Featured Products",
      items: featureds,
      link: { text: "Shop Now", href: "/search?tag=new-arrival" },
    },
  ];

  return (
    <>
      <HomeCarousel items={carousels} />

      <div className="md:p-4 md:space-y-4 bg-border">
        <HomeCard cards={cards} />

        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            <ProductSlider title="Today's Deals" products={todaysDeals} />
          </CardContent>
        </Card>

        <Card className="w-full rounded-none">
          <CardContent className="p-4 items-center gap-3">
            <ProductSlider
              title="Best Selling Products"
              products={bestSellingProducts}
              hideDetails
            />
          </CardContent>
        </Card>
      </div>

      <div className="p-4 bg-background">
        <BrowsingHistoryList />
      </div>

      <div className="p-4 bg-background">
        <AboutCarousel />
      </div>

      <div className="p-4 bg-background">
        <BlogSlider title="Our Latest Stories" blogs={blogs} />
      </div>
    </>
  );
}
