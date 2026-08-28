import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // O produto é o app da agenda (arquivo único). A home serve ele direto;
  // o paywall e a sincronização são checados no servidor, nas rotas /api.
  async rewrites() {
    return [{ source: "/", destination: "/agenda.html" }];
  },
};

export default nextConfig;
