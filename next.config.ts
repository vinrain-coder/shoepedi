import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/product",
        destination: "/search",
        permanent: true, // 301 redirect
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
