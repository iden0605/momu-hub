import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Keep visited and prefetched pages in the client cache, live refresh keeps them current
    staleTimes: { dynamic: 300, static: 300 },
  },
};

export default nextConfig;
