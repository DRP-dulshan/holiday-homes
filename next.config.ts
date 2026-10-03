import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "dubairapidproperties.com",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
