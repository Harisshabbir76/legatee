import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 31536000, // 1 year
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      // allow backend uploads (local dev + production)
      { protocol: "http", hostname: "localhost" },
      { protocol: "https", hostname: "**" },
    ],
    deviceSizes: [390, 640, 828, 1080, 1280, 1920],
    imageSizes: [16, 32, 64, 128, 256],
    contentDispositionType: "attachment",
  },
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["react", "react-dom"],
  },
  async headers() {
    const securityHeaders = [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          ...(process.env.NODE_ENV === "production"
            ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }]
            : []),
        ],
      },
    ];

    // Long-lived immutable caching is only safe in production, where
    // /_next/static chunks are content-hashed per build. In dev, Turbopack
    // can reuse the same chunk URL across restarts (HMR, fast refresh), and
    // an `immutable` Cache-Control tells the browser to *never* revalidate —
    // so a rebuilt file keeps serving the old cached JS/CSS forever, which
    // looks exactly like a phantom "my changes aren't showing up" bug.
    // Next.js's own dev server warns about this; only apply it when built
    // for production.
    if (process.env.NODE_ENV !== "production") {
      return securityHeaders;
    }

    return [
      ...securityHeaders,
      {
        // Next.js hashed static chunks — safe to cache forever in production
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/_next/image(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/images/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path*\\.(ico|png|jpg|jpeg|webp|avif|svg|woff|woff2|ttf|otf)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
