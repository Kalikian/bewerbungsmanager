/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Add support for TypeScript path aliases
    config.resolve.extensionAlias = {
      ".js": [".ts", ".js"],
      ".mjs": [".mts", ".mjs"],
      ".cjs": [".cts", ".cjs"],
    };
    return config;
  },
  reactStrictMode: true,
  experimental: { externalDir: true },
  transpilePackages: ["@bewerbungsmanager/shared"],
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [{ source: "/api/:path*", destination: "http://localhost:3000/api/:path*" }];
  },
};

export default nextConfig;
