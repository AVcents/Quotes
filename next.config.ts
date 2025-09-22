import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },  // ← bypass lint en build
};

export default nextConfig;