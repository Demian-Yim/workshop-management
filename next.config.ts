import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Disable Turbopack for build (Korean path issue)
  experimental: {},
};

export default nextConfig;
