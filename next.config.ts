import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        port: "",
        pathname: "/gh/hasaneyldrm/exercises-dataset@main/**",
      },
    ],
  },
};

export default nextConfig;

// Habilita bindings/vars de Cloudflare (wrangler.jsonc, .dev.vars) en
// `next dev`. No afecta al build/deploy real, solo al dev server.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
