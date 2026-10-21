/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'ublctyddhtbgaersvxxb.supabase.co' },
    ],
  },
};
export default nextConfig;
