import ReactMarkdown from "react-markdown";
import { notFound } from "next/navigation";
import { getWebPageBySlug } from "@/lib/actions/web-page.actions";
import remarkGfm from "remark-gfm";
import Breadcrumb from "@/components/shared/breadcrumb";
import { cacheLife } from "next/cache";

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
  "use cache";
  cacheLife("weeks");
  const { slug } = await params; // ✅ FIX — unwrap promise

  const webPage = await getWebPageBySlug(slug);

  if (!webPage) return notFound();

  return (
    <div className="p-1 sm:p-2 md:p-8 max-w-3xl mx-auto">
      <Breadcrumb />
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 pb-4">
        {webPage.title}
      </h1>

      <section className="text-lg space-y-4 leading-relaxed web-page-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold border-b border-gray-300 dark:border-gray-700 pb-2">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-semibold border-b border-gray-300 dark:border-gray-700 pb-1">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="leading-7 text-gray-800 dark:text-gray-300">
                {children}
              </p>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-4 italic text-gray-700 dark:text-gray-300">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-2 py-1 rounded-md font-mono text-sm">
                {children}
              </code>
            ),
            pre: ({ children }) => (
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm">
                {children}
              </pre>
            ),
            ul: ({ children }) => (
              <ul className="list-disc ml-6 space-y-2">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal ml-6 space-y-2">{children}</ol>
            ),
            li: ({ children }) => (
              <li className="text-gray-800 dark:text-gray-300">{children}</li>
            ),
            a: ({ href, children }) => (
              <a
                href={href ?? "#"}
                target="_self"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition"
              >
                {children}
              </a>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 dark:border-gray-700 text-left">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 px-3 py-2 font-semibold text-gray-900 dark:text-gray-100">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-800 dark:text-gray-300">
                {children}
              </td>
            ),
          }}
        >
          {webPage.content}
        </ReactMarkdown>
      </section>
    </div>
  );
}
