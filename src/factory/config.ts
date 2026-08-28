/**
 * Config da fábrica — o que muda por clone de SaaS.
 * Lovable/UI NÃO edita isso (só env + este arquivo se precisar de features).
 */

export type PlanId = "free" | "trial" | "pro" | "default";

export type PlanDef = {
  id: PlanId | string;
  label: string;
  /** Features liberadas. `*` = tudo. */
  features: string[];
  /** Product ID na Quack (se pago). */
  quackProductId?: string;
};

function num(v: string | undefined, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export const factoryConfig = {
  /** Slug estável do SaaS (analytics + multi-tenant no control). */
  slug: process.env.SAAS_SLUG ?? "saas-template",
  appName: process.env.APP_NAME ?? "SaaS Template",

  /** 0 = sem trial automático no signup. */
  trialDays: num(process.env.TRIAL_DAYS, 7),

  /** URL do checkout Quack (offer/produto) — CTA do paywall. */
  checkoutUrl: process.env.QUACK_CHECKOUT_URL ?? "",

  /** Product ID default (mapeia plan "pro"/"default"). */
  quackProductId: process.env.QUACK_PRODUCT_ID ?? "",

  /**
   * Rotas que exigem access (trial ativo OU pago).
   * Middleware + RequireAccess usam isto.
   */
  paywalledPrefixes: (process.env.PAYWALL_PREFIXES ?? "/dashboard,/app")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  /** Prefixos sempre públicos (além de assets). */
  publicPrefixes: [
    "/",
    "/login",
    "/pricing",
    "/paywall",
    "/api/auth",
    "/api/webhooks",
    "/api/factory",
  ],

  plans: {
    free: {
      id: "free",
      label: "Free",
      features: ["marketing"],
    } satisfies PlanDef,
    trial: {
      id: "trial",
      label: "Trial",
      features: ["*"],
    } satisfies PlanDef,
    pro: {
      id: "pro",
      label: "Pro",
      features: ["*"],
      quackProductId: process.env.QUACK_PRODUCT_ID,
    } satisfies PlanDef,
    default: {
      id: "default",
      label: "Default",
      features: ["*"],
      quackProductId: process.env.QUACK_PRODUCT_ID,
    } satisfies PlanDef,
  } as Record<string, PlanDef>,

  /** Control plane (admin multi-SaaS). */
  control: {
    url: process.env.FACTORY_CONTROL_URL ?? "",
    ingestKey: process.env.FACTORY_INGEST_KEY ?? "",
  },
} as const;

export function planFeatures(plan: string): string[] {
  return factoryConfig.plans[plan]?.features ?? factoryConfig.plans.default.features;
}

export function isPaywalledPath(pathname: string): boolean {
  if (pathname.startsWith("/api/")) {
    // APIs de produto sob /api/* (exceto factory/auth/webhooks) → quem chama decide
    return false;
  }
  return factoryConfig.paywalledPrefixes.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
}
