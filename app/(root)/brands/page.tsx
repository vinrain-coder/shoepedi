import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { getAllBrandsForStore } from "@/lib/actions/brand.actions";
import type { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import Breadcrumb from "@/components/shared/breadcrumb";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getSetting();

  return {
    title: `Shop by Brand | ${site.name}`,
    description:
      "Browse all brands available in our store. Find your favorite brands and shop with confidence.",
    alternates: {
      canonical: `${site.url}/brands`,
    },
    openGraph: {
      title: `Shop by Brand | ${site.name}`,
      description:
        "Explore products by brand and discover trusted names you love.",
      url: `${site.url}/brands`,
      siteName: site.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Shop by Brand | ${site.name}`,
      description:
        "Browse products by brand and discover quality brands you trust.",
    },
  };
}

export default async function BrandsPage() {
  const brands = await getAllBrandsForStore();
  const { site } = await getSetting();

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Product Brands",
    itemListElement: brands.map((brand: any, index: number) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${site.url}/brands/${brand.slug}`,
      name: brand.name,
    })),
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />

      <Breadcrumb />

      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Browse Brands
        </h1>
        <p className="text-muted-foreground">
          Discover products from your favorite brands
        </p>
        <p className="sr-only">
          Browse our full list of product brands including Nike, Adidas,
          Apple, Samsung, and more. Shop by brand to find products you
          trust.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {brands.map((brand: any) => (
          <Link
            key={brand._id}
            href={`/brands/${brand.slug}`}
            aria-label={`Browse ${brand.name} products`}
            className="group"
          >
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-none bg-secondary/20 h-full p-0">
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-white">
                {brand.image ? (
                  <Image
                    src={brand.image}
                    alt={`${brand.name} brand image`}
                    fill
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                    <span className="text-sm">No Image</span>
                  </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                  {brand.name} Products
                </h3>

                {brand.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {brand.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
