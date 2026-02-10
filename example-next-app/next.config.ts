import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/.ory/kratos/:path*",
        destination: process.env.KRATOS_PUBLIC_BASE_URL + "/:path*" // kratos public API server
      },
      {
        source: "/api/.ory/hydra/:path*",
        destination: process.env.HYDRA_PUBLIC_BASE_URL + "/:path*" // hydra public API server
      }
    ];
  }
};


export default nextConfig;
