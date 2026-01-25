import type { NextConfig } from "next";

// Trigger rebuild

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: "standalone",
};

export default nextConfig;
