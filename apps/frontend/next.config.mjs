/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Workspace-Pakete kompilieren
  transpilePackages: ['@bewerbungsmanager/shared'],
};

export default nextConfig;
