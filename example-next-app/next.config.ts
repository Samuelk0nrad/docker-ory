import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/.ory/kratos/:path*",
        destination: "http://localhost:5545/:path*"
      },
      {
        source: "/api/.ory/hydra/:path*",
        destination: "http://localhost:5545/:path*"
      }
    ];
  }
};


export default nextConfig;
