/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@luminae/types', '@luminae/mistral-client'],
  images: {
    domains: ['api.mistral.ai'],
  },
}

module.exports = nextConfig
