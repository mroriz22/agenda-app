import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // "/" é a landing (src/app/page.tsx). O produto, a agenda de arquivo
  // único, é servido em /app. O paywall e a sincronização continuam
  // checados no servidor, nas rotas /api.
  async rewrites() {
    return [{ source: "/app", destination: "/agenda.html" }];
  },
};

export default nextConfig;
