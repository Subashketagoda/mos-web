import type { NextConfig } from 'next';

const isGithubPages = process.env.GITHUB_PAGES === 'true' || process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  compress: true,
  output: process.env.GITHUB_PAGES === 'true' ? 'export' : undefined,
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  serverExternalPackages: ['sqlite3', 'bcryptjs', 'googleapis'],
  images: {
    unoptimized: process.env.GITHUB_PAGES === 'true',
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      }
    ],
  },
  ...(process.env.GITHUB_PAGES === 'true'
    ? {}
    : {
        async headers() {
          return [
            {
              source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|mp4|woff2)',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=31536000, immutable',
                },
              ],
            },
            {
              source: '/_next/static/:path*',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=31536000, immutable',
                },
              ],
            },
          ];
        },
      }),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
