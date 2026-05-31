import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  basePath: "/botolaty",
  trailingSlash: true,
};

export default nextConfig;
