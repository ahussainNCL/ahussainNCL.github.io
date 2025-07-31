/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: true,
  },
  images: {
    domains: ['opengraph.githubassets.com', 'avatars.githubusercontent.com'],
  },
}

module.exports = nextConfig 