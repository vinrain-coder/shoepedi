
import "./globals.css";
import ClientProviders from "@/components/shared/client-providers";
import { getSetting } from "@/lib/actions/setting.actions";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";

export async function generateMetadata() {
  const {
    site: { slogan, name, description, url },
  } = await getSetting();

  const title = `${name} | ${slogan}`;
  const imageUrl = `${url}/opengraph-image.jpg`;

  return {
    title: { template: `%s | ${name}`, default: title },
    description,
    metadataBase: new URL(url),
    openGraph: {
      title,
      description,
      url,
      siteName: name,
      images: [
        { url: imageUrl, width: 1200, height: 630, alt: `${name} - ${slogan}` },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
    alternates: { canonical: url },
    robots: { index: true, follow: true },
  };
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const setting = await getSetting();

  const currency = "KES";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen font-sans antialiased leading-relaxed tracking-wide"
      >
        <Suspense fallback={null}>
          
          <ClientProviders setting={{ ...setting, currency }}>
            {children}
          </ClientProviders>
          
        </Suspense>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
