import type { NextConfig } from "next";

// Conditionally load bundle analyzer only when needed
let withBundleAnalyzer: (config: NextConfig) => NextConfig = config => config;
if (process.env.ANALYZE === "true") {
  try {
    withBundleAnalyzer = require("@next/bundle-analyzer")({
      enabled: true,
    });
  } catch (error) {
    console.warn(
      "Bundle analyzer not available, skipping...",
      error instanceof Error ? error.message : error
    );
  }
}

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Ensure middleware is included in standalone build
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
    domains: ["localhost", "127.0.0.1", "salespider.local"],
    // Enable image optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true,
  },
  allowedDevOrigins: [
    "local-origin.dev",
    "*.local-origin.dev",
    "localhost",
    "127.0.0.1",
    "salespider.local",
    ...(process.env.DEV_ORIGINS ? process.env.DEV_ORIGINS.split(",") : []),
  ],
  // Compression
  compress: true,
  // Power off x-powered-by header
  poweredByHeader: false,
  // Generate etags
  generateEtags: true,
  // Security headers
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
