import { eq } from "drizzle-orm";
import { randomBytes } from "node:crypto";
import { db, schema } from "@/lib/db";
import type { Entitlement } from "@/lib/schema";
import { factoryConfig, planFeatures } from "./config";

export type AccessStatus =
  | "anonymous"
  | "none"
  | "trial"
  | "active"
  | "past_due"
  | "canceled"
  | "expired";

export type AccessSnapshot = {
  status: AccessStatus;
  plan: string;
  features: string[];
  /** true se pode usar área paga (trial válido ou active). */
  allowed: boolean;
  trialEndsAt: Date | null;
  currentPeriodEnd: Date | null;
  reason?: string;
  checkoutUrl: string;
};

function stillValid(ends: Date | null | undefined): boolean {
  if (!ends) return true;
  return ends.getTime() > Date.now();
}

/** Resolve se o user pode passar do paywall. */
export function resolveAccess(row: Entitlement | null | undefined): AccessSnapshot {
  const checkoutUrl = factoryConfig.checkoutUrl;
  if (!row) {
    return {
      status: "none",
      plan: "free",
      features: planFeatures("free"),
      allowed: false,
      trialEndsAt: null,
      currentPeriodEnd: null,
      reason: "no_entitlement",
      checkoutUrl,
    };
  }

  const trialEndsAt = row.trialEndsAt ?? null;
  const currentPeriodEnd = row.currentPeriodEnd ?? null;
  const plan = row.plan ?? "free";
  const features = planFeatures(plan);

  if (row.status === "trial") {
    const ok = stillValid(trialEndsAt);
    return {
      status: ok ? "trial" : "expired",
      plan: ok ? plan : "free",
      features: ok ? features : planFeatures("free"),
      allowed: ok,
      trialEndsAt,
      currentPeriodEnd,
      reason: ok ? "trial_active" : "trial_expired",
      checkoutUrl,
    };
  }

  if (row.status === "active") {
    const ok = stillValid(currentPeriodEnd);
    return {
      status: ok ? "active" : "expired",
      plan: ok ? plan : "free",
      features: ok ? features : planFeatures("free"),
      allowed: ok,
      trialEndsAt,
      currentPeriodEnd,
      reason: ok ? "paid_active" : "period_ended",
      checkoutUrl,
    };
  }

  if (row.status === "past_due") {
    // grace: ainda deixa passar (ajuste se quiser bloquear)
    return {
      status: "past_due",
      plan,
      features,
      allowed: true,
      trialEndsAt,
      currentPeriodEnd,
      reason: "past_due_grace",
      checkoutUrl,
    };
  }

  return {
    status: (row.status as AccessStatus) || "none",
    plan,
    features: planFeatures("free"),
    allowed: false,
    trialEndsAt,
    currentPeriodEnd,
    reason: `status_${row.status}`,
    checkoutUrl,
  };
}

export function hasFeature(access: AccessSnapshot, feature: string): boolean {
  if (!access.allowed) return false;
  if (access.features.includes("*")) return true;
  return access.features.includes(feature);
}

export async function getEntitlement(userId: string): Promise<Entitlement | null> {
  const d = db();
  const row = await d.query.entitlement.findFirst({
    where: eq(schema.entitlement.userId, userId),
  });
  return row ?? null;
}

export async function getAccess(userId: string): Promise<AccessSnapshot> {
  const row = await getEntitlement(userId);
  const access = resolveAccess(row);
  // side-effect: marca expired se trial/period acabou
  if (row && !access.allowed && (row.status === "trial" || row.status === "active")) {
    if (access.status === "expired") {
      await dUpdateStatus(userId, "expired");
    }
  }
  return access;
}

async function dUpdateStatus(userId: string, status: string) {
  const d = db();
  await d
    .update(schema.entitlement)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.entitlement.userId, userId));
}

/** Inicia trial se elegível (1x). Idempotente. */
export async function startTrial(userId: string): Promise<Entitlement | null> {
  const days = factoryConfig.trialDays;
  if (days <= 0) return getEntitlement(userId);

  const existing = await getEntitlement(userId);
  if (existing) {
    // já teve trial/pago — não reinicia
    return existing;
  }

  const now = new Date();
  const trialEndsAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  const id = randomBytes(16).toString("hex");
  const d = db();
  await d.insert(schema.entitlement).values({
    id,
    userId,
    status: "trial",
    plan: "trial",
    trialStartedAt: now,
    trialEndsAt,
    createdAt: now,
    updatedAt: now,
  });
  return getEntitlement(userId);
}

/** Aplica pagamento Quack → active. */
export async function activatePaid(opts: {
  userId: string;
  plan?: string;
  quackEventId: string;
  quackOrderId?: string;
  quackProductId?: string;
  totalCents?: number;
  periodEnd?: Date | null;
}): Promise<void> {
  const d = db();
  const now = new Date();
  const existing = await getEntitlement(opts.userId);
  const plan = opts.plan ?? "pro";

  if (existing) {
    await d
      .update(schema.entitlement)
      .set({
        status: "active",
        plan,
        quackProductId: opts.quackProductId ?? existing.quackProductId,
        quackOrderId: opts.quackOrderId ?? existing.quackOrderId,
        lastQuackEventId: opts.quackEventId,
        totalCents: opts.totalCents ?? existing.totalCents,
        currentPeriodEnd: opts.periodEnd ?? existing.currentPeriodEnd,
        updatedAt: now,
      })
      .where(eq(schema.entitlement.userId, opts.userId));
  } else {
    await d.insert(schema.entitlement).values({
      id: randomBytes(16).toString("hex"),
      userId: opts.userId,
      status: "active",
      plan,
      quackProductId: opts.quackProductId,
      quackOrderId: opts.quackOrderId,
      lastQuackEventId: opts.quackEventId,
      totalCents: opts.totalCents,
      currentPeriodEnd: opts.periodEnd ?? null,
      createdAt: now,
      updatedAt: now,
    });
  }
}

export async function markPastDue(userId: string): Promise<void> {
  await dUpdateStatus(userId, "past_due");
}

export async function markCanceled(userId: string): Promise<void> {
  await dUpdateStatus(userId, "canceled");
}
