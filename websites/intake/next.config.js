/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for API routes
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
