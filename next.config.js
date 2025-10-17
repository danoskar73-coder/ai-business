/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  // If type errors ever block builds, you can also enable this, but try to keep it off:
  // typescript: { ignoreBuildErrors: true },
};
module.exports = nextConfig;
