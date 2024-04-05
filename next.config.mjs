/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BACKEND_URL: "http://localhost:4000",
  },
  images: {
    domains: ["localhost"],
  },
};

export default nextConfig;
