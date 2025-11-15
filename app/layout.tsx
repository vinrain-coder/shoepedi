import { Nunito } from "next/font/google";
import "./globals.css";
import RootInitializer from "@/components/shared/root-initializer";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const nunito = Nunito({
  subsets: ["latin"],
    weight: ["400", "500", "600", "700"],
    });

    export default function AppLayout({
      children,
      }: {
        children: React.ReactNode;
        }) {
          return (
              <html lang="en" suppressHydrationWarning>
                    <body
                            className={`min-h-screen ${nunito.className} antialiased leading-relaxed tracking-wide`}
                                  >
                                          <RootInitializer>{children}</RootInitializer>
                                                  <Analytics />
                                                          <SpeedInsights />
                                                                </body>
                                                                    </html>
                                                                      );
                                                                      }
                                                                      