import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1).default("redis://127.0.0.1:6379"),
  REDIS_PREFIX: z.string().default("saas:"),
  BETTER_AUTH_SECRET: z.string().min(16),
  BETTER_AUTH_URL: z.string().url(),
  /** Segredo do endpoint de webhook na Quack (`whsec_...`). */
  QUACK_WEBHOOK_SECRET: z.string().min(1).optional(),
  /** Product ID principal (SKU) neste SaaS — opcional no bootstrap. */
  QUACK_PRODUCT_ID: z.string().optional(),
  /** Nome exibido no app (troque no clone). */
  APP_NAME: z.string().default("SaaS Template"),
});

export type ServerEnv = z.infer<typeof serverSchema>;

let cached: ServerEnv | null = null;

/** Valida env só no server. Em build sem env, retorna partial só onde for seguro. */
export function env(): ServerEnv {
  if (cached) return cached;
  const parsed = serverSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
    throw new Error(`Invalid env: ${msg}`);
  }
  cached = parsed.data;
  return cached;
}

export function envOptional() {
  return {
    APP_NAME: process.env.APP_NAME ?? "SaaS Template",
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  };
}
