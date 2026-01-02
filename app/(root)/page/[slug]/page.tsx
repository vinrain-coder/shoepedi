import Breadcrumb from "@/components/shared/breadcrumb";
import MarkdownRenderer from "@/components/shared/markdown-renderer";
import { getSetting } from "@/lib/actions/setting.actions";
import { getWebPageBySlug } from "@/lib/actions/web-page.actions";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const webPage = await getWebPageBySlug(slug);

  if (!webPage) {
    return { title: "Page Not Found" };
  }

  const { site } = await getSetting();

  return {
    title: webPage.title,
    description: webPage.excerpt || webPage.content.substring(0, 160), // Use an excerpt or slice content
    alternates: {
      canonical: `${site.url}/page/${slug}`,
    },
    openGraph: {
      title: webPage.title,
      description: webPage.excerpt,
      url: `${site.url}/page/${slug}`,
      type: "article",
      images: [
        {
          url: webPage.image || "/default-og-image.jpg",
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: webPage.title,
      description: webPage.excerpt,
      images: [webPage.image || "/default-og-image.jpg"],
    },
  };
}

export default async function WebPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const webPage = await getWebPageBySlug(slug);

  if (!webPage) return notFound();
  const { site } = await getSetting();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: webPage.title,
    image: webPage.image,
    author: {
      "@type": "Organization",
      name: site.name,
    },
    datePublished: webPage.createdAt,
    description: webPage.excerpt,
  };

  return (
    <div className="p-1 sm:p-2 md:p-8 max-w-3xl mx-auto">
      {/* Add JSON-LD to the head */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Breadcrumb />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 pb-4">
        {webPage.title}
      </h1>
      <section>
        <MarkdownRenderer content={webPage.content} />
      </section>
    </div>
  );
}
