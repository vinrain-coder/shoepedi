import Link from "next/link";
import Image from "next/image";
import * as motion from "framer-motion/client";
import { Card, CardContent } from "@/components/ui/card";
import { getAllBrandsForStore } from "@/lib/actions/brand.actions";
import { Metadata } from "next";
import { getSetting } from "@/lib/actions/setting.actions";
import Breadcrumb from "@/components/shared/breadcrumb";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />

      <Breadcrumb />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <Badge variant="secondary" className="px-3 py-1 rounded-full uppercase tracking-wider text-xs font-bold">
          Trusted Brands
        </Badge>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Shop by Brands
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover a world of quality from the world&apos;s most renowned brands. Excellence in every stitch.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
      >
        {brands.map((brand: any, index: number) => (
          <motion.div
            key={brand._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
          >
            <Link
              href={`/brands/${brand.slug}`}
              aria-label={`Browse ${brand.name} products`}
              className="group block"
            >
              <Card className="overflow-hidden rounded-2xl border border-border shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full bg-white">
                <div className="relative aspect-square w-full overflow-hidden p-6 flex items-center justify-center bg-white">
                  {brand.logo ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={brand.logo}
                        alt={`${brand.name} brand logo`}
                        fill
                        className="object-contain transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                      />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-secondary/30 text-muted-foreground">
                      <span className="text-sm font-medium">No Logo</span>
                    </div>
                  )}

                  {/* Overlay Gradient on hover */}
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                <CardContent className="p-4 text-center border-t">
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors duration-300 truncate">
                    {brand.name}
                  </h3>
                  {brand.description && (
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {brand.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
