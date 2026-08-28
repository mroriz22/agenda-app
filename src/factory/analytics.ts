import { factoryConfig } from "./config";

export type AnalyticsEvent = {
  name: string;
  userId?: string | null;
  anonymousId?: string | null;
  properties?: Record<string, unknown>;
  ts?: number;
};

/**
 * Fire-and-forget pro control plane.
 * Nunca joga erro pro request do user — analytics é best-effort.
 */
export async function track(event: AnalyticsEvent | AnalyticsEvent[]): Promise<void> {
  const { url, ingestKey } = factoryConfig.control;
  if (!url || !ingestKey) return;

  const events = (Array.isArray(event) ? event : [event]).map((e) => ({
    name: e.name,
    userId: e.userId ?? null,
    anonymousId: e.anonymousId ?? null,
    properties: e.properties ?? {},
    ts: e.ts ?? Date.now(),
  }));

  const body = JSON.stringify({
    saasSlug: factoryConfig.slug,
    appName: factoryConfig.appName,
    events,
  });

  try {
    const endpoint = url.replace(/\/$/, "") + "/api/v1/ingest";
    // timeout curto — não bloqueia webhook/request
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 2500);
    await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${ingestKey}`,
      },
      body,
      signal: ac.signal,
    });
    clearTimeout(t);
  } catch {
    // swallow
  }
}

/** Atalhos semânticos — use no app/Lovable. */
export const analytics = {
  signedUp: (userId: string, props?: Record<string, unknown>) =>
    track({ name: "user_signed_up", userId, properties: props }),
  signedIn: (userId: string) => track({ name: "user_signed_in", userId }),
  trialStarted: (userId: string, trialEndsAt: Date) =>
    track({
      name: "trial_started",
      userId,
      properties: { trialEndsAt: trialEndsAt.toISOString(), days: factoryConfig.trialDays },
    }),
  trialExpired: (userId: string) => track({ name: "trial_expired", userId }),
  paywallViewed: (userId: string | null, reason?: string) =>
    track({ name: "paywall_viewed", userId, properties: { reason } }),
  checkoutClicked: (userId: string | null) =>
    track({ name: "checkout_clicked", userId }),
  purchase: (userId: string, props: Record<string, unknown>) =>
    track({ name: "purchase", userId, properties: props }),
  featureBlocked: (userId: string, feature: string) =>
    track({ name: "feature_blocked", userId, properties: { feature } }),
  page: (userId: string | null, path: string) =>
    track({ name: "page_view", userId, properties: { path } }),
};
