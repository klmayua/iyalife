import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel/serverless";

export default defineConfig({
  integrations: [
    react(),
    tailwind({ applyBaseStyles: true }),
  ],
  output: "hybrid",       // SSR for dynamic routes, static for marketing pages
  adapter: vercel(),      // Vercel deployment
  site: "https://iyalife.com",

  // PWA-friendly: no trailing slash
  trailingSlash: "never",

  // Vite config for monorepo
  vite: {
    ssr: { noExternal: ["@iyalife/ui"] },
  },
});
