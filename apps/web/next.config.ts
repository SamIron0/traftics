import type { NextConfig } from "next";

// The standalone landing (marketing) deployment. The web app proxies the
// homepage and marketing pages to it so both live on the same domain.
// Override locally with LANDING_URL=http://localhost:3001 when running both apps.
const LANDING_URL =
  process.env.LANDING_URL ?? "https://traftic-landing.vercel.app";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Landing app build assets (js/css/fonts/optimized images).
      {
        source: "/landing-static/:path*",
        destination: `${LANDING_URL}/landing-static/:path*`,
      },
      // Marketing pages served by the landing app.
      { source: "/pricing", destination: `${LANDING_URL}/pricing` },
      { source: "/contact", destination: `${LANDING_URL}/contact` },
      { source: "/privacy", destination: `${LANDING_URL}/privacy` },
      { source: "/terms", destination: `${LANDING_URL}/terms` },
      // Public assets that only exist in the landing app.
      {
        source: "/homepage-:asset",
        destination: `${LANDING_URL}/homepage-:asset`,
      },
      {
        source: "/integrations/:path*",
        destination: `${LANDING_URL}/integrations/:path*`,
      },
    ];
  },
};

export default nextConfig;
