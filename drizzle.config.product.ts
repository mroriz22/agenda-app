import "dotenv/config";
import { defineConfig } from "drizzle-kit";

/**
 * Schema do produto (tabelas fora do núcleo da fábrica).
 * `drizzle.config.ts` é da fábrica e não se mexe — este cuida só do SmartDayZ.
 */
export default defineConfig({
  schema: "./src/lib/product-schema.ts",
  out: "./drizzle-product",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
