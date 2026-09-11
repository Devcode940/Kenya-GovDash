import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: true,
  // Allow cross-origin requests from preview URLs
  allowedDevOrigins: ["*.space-z.ai", "*.e2b.app"],
  // Security headers on all responses (all deployments, not just Vercel).
  async headers() {
    const globalHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ];
    // Frame denial in production only — dev/preview environments embed the
    // app in an iframe (live preview), which DENY would break.
    if (process.env.NODE_ENV === "production") {
      globalHeaders.push({ key: "X-Frame-Options", value: "DENY" });
    }
    return [{ source: "/:path*", headers: globalHeaders }];
  },
  // Keep native binaries out of Turbopack's bundler (Vercel production)
  serverExternalPackages: [
    "sqlite-vec",
    "sqlite-vec-linux-x64",
    "sqlite-vec-darwin-x64",
    "sqlite-vec-darwin-arm64",
    "sqlite-vec-linux-arm64",
    "sqlite-vec-windows-x64",
    "better-sqlite3",
    "@xenova/transformers",
    "@mistralai/mistralai",
    "resend",
  ],
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
