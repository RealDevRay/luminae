/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@luminae/types', '@luminae/mistral-client'],
  images: {
    domains: ['api.mistral.ai'],
  },
}

module.exports = nextConfig
