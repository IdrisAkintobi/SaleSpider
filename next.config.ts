import type { NextConfig } from "next";

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
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE === "true" && !isServer) {
      const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: "server",
          analyzerPort: 8890,
          openAnalyzer: true,
        })
      );
    }
    return config;
  },
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
};

export default nextConfig;
