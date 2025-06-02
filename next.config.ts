import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
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
  },
  allowedDevOrigins: [
    "local-origin.dev",
    "*.local-origin.dev",
    "localhost",
    "127.0.0.1",
    "192.168.0.107",
  ],
};

export default nextConfig;
