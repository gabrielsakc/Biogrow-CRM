/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@biogrow/ui",
    "@biogrow/auth",
    "@biogrow/crm-core",
    "@biogrow/erp-core",
    "@biogrow/holding-core",
    "@biogrow/database",
    "@biogrow/permissions",
    "@biogrow/shared-types"
  ],
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
};

module.exports = nextConfig;