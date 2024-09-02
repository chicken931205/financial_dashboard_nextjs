/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ['@radix-ui/react-progress'],
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@radix-ui/react-progress': require.resolve('@radix-ui/react-progress'),
    };
    return config;
  },
}

module.exports = nextConfig
