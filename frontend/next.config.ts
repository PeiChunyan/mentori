import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🚀 OPTIMIZATION: Enable compression
  compress: true,

  // 🚀 OPTIMIZATION: Image optimization settings
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // 🚀 OPTIMIZATION: Bundle analyzer (only in development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any, { isServer }: { isServer: boolean }) => {
      if (!isServer) {
        // Add bundle analyzer for client-side bundles
        // Note: Requires @next/bundle-analyzer package
      }
      return config;
    },
  }),

  // 🚀 OPTIMIZATION: Experimental features for performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    // Enable React Compiler in future versions
  },

  // 🚀 OPTIMIZATION: Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // 🚀 OPTIMIZATION: Build optimization
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // 🚀 OPTIMIZATION: Output settings
  output: 'standalone', // For Docker deployment

  // 🚀 OPTIMIZATION: Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
};

export default nextConfig;
