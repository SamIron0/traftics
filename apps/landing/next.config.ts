import type { NextConfig } from "next";

// Multi-zone setup: this landing app is proxied through the web app's domain
// (traftics.ironkwe.site). The asset prefix keeps its /_next/* assets from
// clashing with the web app's, and the rewrite below lets this app serve
// those prefixed requests itself.
const nextConfig: NextConfig = {
  assetPrefix: "/landing-static",
  images: {
    path: "/landing-static/_next/image",
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/landing-static/_next/:path+",
          destination: "/_next/:path+",
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
