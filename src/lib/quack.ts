import { createHmac, timingSafeEqual } from "node:crypto";

export const QUACK_SIGNATURE_HEADER = "x-quack-signature";

/** Envelope outbound da Quack Checkout. */
export type QuackEnvelope = {
  id: string;
  type: string;
  created: number;
  data: Record<string, unknown>;
  organization: { id: string; slug: string };
};

export type QuackCustomer = {
  id?: string;
  email?: string;
  name?: string;
};

export type QuackOrder = {
  id?: string;
  status?: string;
  totalCents?: number;
  productId?: string;
  customer?: QuackCustomer;
};

/**
 * Verifica `x-quack-signature: t=<unix>,v1=<hmac_sha256_hex>`
 * assinado sobre `{t}.{rawBody}` com o secret do endpoint (`whsec_...`).
 */
export function verifyQuackSignature(
  secret: string,
  rawBody: string,
  header: string | null,
  toleranceSec = 300,
  nowSec = Math.floor(Date.now() / 1000),
): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const i = kv.indexOf("=");
      if (i < 0) return [kv, ""];
      return [kv.slice(0, i), kv.slice(i + 1)];
    }),
  );
  const t = Number(parts.t);
  if (!Number.isFinite(t) || Math.abs(nowSec - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1 ?? "");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function parseQuackEnvelope(raw: string): QuackEnvelope {
  const body = JSON.parse(raw) as QuackEnvelope;
  if (!body?.id || !body?.type) {
    throw new Error("envelope inválido: falta id/type");
  }
  return body;
}

/** Extrai email/nome/order de order.paid | subscription.activated | subscription.renewed. */
export function extractBuyer(envelope: QuackEnvelope): {
  email: string;
  name: string;
  orderId?: string;
  productId?: string;
  totalCents?: number;
  periodEnd?: Date | null;
} {
  const data = envelope.data ?? {};
  const order = (data.order ?? {}) as QuackOrder;
  const sub = (data.subscription ?? {}) as {
    productId?: string;
    customer?: QuackCustomer;
    currentPeriodEnd?: string;
  };
  const customer = order.customer ?? sub.customer ?? {};
  const email = String(customer.email ?? "").trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("email ausente no payload");
  }
  const name = String(customer.name ?? email.split("@")[0] ?? "buyer");
  const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null;
  return {
    email,
    name,
    orderId: order.id,
    productId: order.productId ?? sub.productId,
    totalCents: order.totalCents,
    periodEnd,
  };
}
