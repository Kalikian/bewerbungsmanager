/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { externalDir: true },
  transpilePackages: ['@bewerbungsmanager/shared'],
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:3000/api/:path*' },
    ];
  },
};
