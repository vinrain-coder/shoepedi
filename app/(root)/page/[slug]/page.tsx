import { Metadata } from "next";
import { notFound } from "next/navigation";
import Breadcrumb from "@/components/shared/breadcrumb";
import MarkdownRenderer from "@/components/shared/markdown-renderer";
import { getSetting } from "@/lib/actions/setting.actions";
import { getWebPageBySlug } from "@/lib/actions/web-page.actions";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * SEO METADATA GENERATION
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  // Fetch data in parallel for better performance
  const [webPage, { site }] = await Promise.all([
    getWebPageBySlug(slug),
    getSetting(),
  ]);

  if (!webPage) {
    return { title: "Page Not Found" };
  }

  // Clean the description: Use excerpt or strip markdown from content
  const description =
    webPage.excerpt || webPage.content.substring(0, 160).replace(/[#*`_]/g, "");

  return {
    title: `${webPage.title} | ${site.name}`,
    description: description,
    alternates: {
      canonical: `${site.url}/page/${slug}`,
    },
    openGraph: {
      title: webPage.title,
      description: description,
      url: `${site.url}/page/${slug}`,
      type: "article",
      publishedTime: webPage.createdAt,
      images: [
        {
          url: webPage.image || "/default-og-image.jpg",
          width: 1200,
          height: 630,
          alt: webPage.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: webPage.title,
      description: description,
      images: [webPage.image || "/default-og-image.jpg"],
    },
  };
}

/**
 * MAIN PAGE COMPONENT
 */
export default async function WebPage({ params }: PageProps) {
  const { slug } = await params;

  // Parallel fetching to avoid waterfall delays
  const [webPage, { site }] = await Promise.all([
    getWebPageBySlug(slug),
    getSetting(),
  ]);

  if (!webPage) return notFound();

  // Enhanced JSON-LD for Search Engines
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: webPage.title,
    description: webPage.excerpt || webPage.content.substring(0, 160),
    image: webPage.image || `${site.url}/default-og-image.jpg`,
    datePublished: webPage.createdAt,
    dateModified: webPage.updatedAt || webPage.createdAt,
    author: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: {
        "@type": "ImageObject",
        url: `${site.url}/logo.png`, // Ensure this path exists
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${site.url}/page/${slug}`,
    },
  };

  return (
    <main className="min-h-screen">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-3xl mx-auto">
        {/* Navigation & Header */}
        <header className="mb-8">
          <Breadcrumb />
          <h1 className="mt-6 text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            {webPage.title}
          </h1>

          {webPage.excerpt && (
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
              {webPage.excerpt}
            </p>
          )}

          {/* Optional: Add a separator or metadata line */}
          <div className="mt-6 border-b border-gray-200 dark:border-gray-800 pb-6 text-sm text-gray-500">
            Updated on{" "}
            {new Date(webPage.updatedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </header>

        {/* Markdown Content with Typography styling */}
        <section className="prose prose-slate dark:prose-invert max-w-none">
          <MarkdownRenderer content={webPage.content} />
        </section>

        {/* Footer for Page Freshness */}
        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-sm text-gray-500 italic">
            Thank you for reading about {webPage.title}. Check back for more
            updates on our latest collections.
          </p>
        </footer>
      </article>
    </main>
  );
}
