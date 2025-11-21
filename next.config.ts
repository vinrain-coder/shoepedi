import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/product",
        destination: "/search",
        permanent: true, // 301 redirect
      },
      {
        source: "/search",
        has: [{ type: "query", key: "category" }],
        missing: [
          { type: "query", key: "tag" },
          { type: "query", key: "price" },
          { type: "query", key: "rating" },
          { type: "query", key: "q" },
          { type: "query", key: "sort" },
          { type: "query", key: "page" },
        ],
        destination: "/category/:category",
        permanent: true, // 301 redirect for SEO
      },
      {
        source: "/search",
        has: [{ type: "query", key: "tag" }],
        missing: [
          { type: "query", key: "category" },
          { type: "query", key: "price" },
          { type: "query", key: "rating" },
          { type: "query", key: "q" },
          { type: "query", key: "sort" },
          { type: "query", key: "page" },
        ],
        destination: "/tag/:tag",
        permanent: true, // 301 redirect for SEO
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  cacheComponents: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "utfs.io",
        port: "",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
      },
    ],
  },
  // typedRoutes: true,
};

export default nextConfig;
