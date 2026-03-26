/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    BACKEND_URL: "http://localhost:4000",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "sacaturno-server-production.up.railway.app",
        pathname: "/api/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
};

export default nextConfig;
