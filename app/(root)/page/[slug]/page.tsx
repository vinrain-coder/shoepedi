import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import { getWebPageBySlug } from "@/lib/actions/web-page.actions";
import remarkGfm from "remark-gfm";
import Breadcrumb from "@/components/shared/breadcrumb";
import { cacheLife } from "next/cache";
import MarkdownRenderer from "@/components/shared/markdown-renderer";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const webPage = await getWebPageBySlug(slug);

  return {
    title: webPage?.title || "Web page not found",
  };
}

export default async function WebPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // ✅ FIX — unwrap promise

  const webPage = await getWebPageBySlug(slug);

  if (!webPage) return notFound();

  return (
    <div className="p-1 sm:p-2 md:p-8 max-w-3xl mx-auto">
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
