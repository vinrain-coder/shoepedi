import { getProductBySlug } from "@/src/wix-api/products";
import { notFound } from "next/navigation";
import ProductDetails from "./ProductDetails";
import { Metadata } from "next";
import { delay } from "@/src/lib/utils";
import { getWixServerClient } from "@/src/lib/wix-client.server";

// Updated PageProps with Promise for params
interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  // Await the params since it's a Promise
  const { slug } = await params;
  
  const product = await getProductBySlug(getWixServerClient(), slug);

  if (!product) notFound();

  const mainImage = product.media?.mainMedia?.image;

  return {
    title: product.name,
    description: "Get this product on Shoepedi",
    openGraph: {
      images: mainImage?.url
        ? [
            {
              url: mainImage.url,
              width: mainImage.width,
              height: mainImage.height,
              alt: mainImage.altText || "",
            },
          ]
        : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  // Await the params since it's a Promise
  const { slug } = await params;
  
  await delay(5000);

  const product = await getProductBySlug(getWixServerClient(), slug);

  if (!product?._id) notFound();

  return (
    <main className="max-w-7xl mx-auto space-y-10 px-5 py-10">
      <ProductDetails product={product} />
    </main>
  );
}
