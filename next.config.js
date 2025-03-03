/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Specify output directory for next export
  distDir: 'dist',
  // Ensures static HTML export works correctly
  output: 'export',
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Handle trailing slashes consistently
  trailingSlash: true,
  // Static assets will be in the public folder
  assetPrefix: './',
  // This is for static deployment - important for file paths
  basePath: '',
}

module.exports = nextConfig
