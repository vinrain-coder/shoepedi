import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
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
    <div className="space-y-10 animate-in fade-in duration-700">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />

      <Breadcrumb />

      <div className="text-center space-y-4 animate-in slide-in-from-bottom-4 duration-700 delay-100">
        <Badge
          variant="secondary"
          className="px-3 py-1 rounded-full uppercase tracking-wider text-xs font-bold"
        >
          Our Brands
        </Badge>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Browse Brands
        </h1>

        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our wide range of trusted brands curated just for you. From
          everyday favorites to premium labels.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {brands.map((brand: any, index: number) => (
          <Link
            key={brand._id}
            href={`/brands/${brand.slug}`}
            aria-label={`Browse ${brand.name} products`}
            className="group block animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Card className="overflow-hidden rounded-xl border-none shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full bg-card p-0">
              <div className="relative aspect-4/3 w-full overflow-hidden">
                {brand.logo ? (
                  <Image
                    src={brand.logo}
                    alt={`${brand.name} brand logo`}
                    fill
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-secondary/30 text-muted-foreground">
                    <span className="text-sm font-medium">No Logo</span>
                  </div>
                )}

                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <h3 className="font-bold text-lg mb-1 group-hover:text-primary transition-colors duration-300">
                    {brand.name}
                  </h3>

                  {brand.description && (
                    <p className="text-xs text-gray-200 line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {brand.description}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
