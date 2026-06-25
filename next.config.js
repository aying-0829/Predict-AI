/** @type {import('next').NextConfig} */
const nextConfig = {
  compress: true,
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    instrumentationHook: true,
    optimizePackageImports: ['recharts', 'html2canvas'],
  },
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
}

module.exports = nextConfig
