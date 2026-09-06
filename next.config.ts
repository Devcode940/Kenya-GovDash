import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  // Allow cross-origin requests from the preview URL
  allowedDevOrigins: ["*.space-z.ai"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.parliament.go.ke",
        pathname: "/sites/default/files/**",
      },
      {
        protocol: "https",
        hostname: "img.youtube.com",
        pathname: "/vi/**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "/vi/**",
      },
    ],
  },
};

export default nextConfig;
