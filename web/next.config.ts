import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/sign-up",
        destination: "/request-access",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
