import type { NextConfig } from "next";

const loaderPath = require.resolve('@ideavo/webpack-tagger');

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  allowedDevOrigins: ['*.e2b.app', '*.ideavo.app', '*.ideavo.ai'],
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": { loaders: [loaderPath] }
    }
  }
} as NextConfig;

export default nextConfig;
