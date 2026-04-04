import { MetadataRoute } from "next";
import { getSetting } from "@/lib/actions/setting.actions";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { site } = await getSetting();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/checkout",
          "/account",
          "/cart",
          "/api",
          "/unauthorized",
          "/forbidden",
        ],
      },
    ],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
