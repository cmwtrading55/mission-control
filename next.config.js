/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  images: { unoptimized: true },
  reactStrictMode: true,
  // Disable static generation for dynamic pages that use Convex
  // They will be client-side rendered
  trailingSlash: true,
};

module.exports = nextConfig;
