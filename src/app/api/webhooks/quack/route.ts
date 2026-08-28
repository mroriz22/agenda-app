import { provisionFromQuack } from "@/factory/provision";
import {
  extractBuyer,
  parseQuackEnvelope,
  QUACK_SIGNATURE_HEADER,
  verifyQuackSignature,
} from "@/lib/quack";
import { redis, redisKey } from "@/lib/redis";
import { markCanceled, markPastDue } from "@/factory/billing";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const runtime = "nodejs";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

const PAID = new Set([
  "order.paid",
  "subscription.activated",
  "subscription.renewed",
]);

/**
 * Cadastre na Quack:
 *   URL: https://SEU_DOMINIO/api/webhooks/quack
 *   Events: order.paid, subscription.*, charge.* se quiser
 *   Secret → QUACK_WEBHOOK_SECRET
 */
export async function POST(req: Request) {
  const secret = process.env.QUACK_WEBHOOK_SECRET;
  if (!secret) {
    return json({ error: "QUACK_WEBHOOK_SECRET não configurado" }, 503);
  }

  const rawBody = await req.text();
  const sig = req.headers.get(QUACK_SIGNATURE_HEADER);
  if (!verifyQuackSignature(secret, rawBody, sig)) {
    return json({ error: "invalid signature" }, 401);
  }

  let envelope;
  try {
    envelope = parseQuackEnvelope(rawBody);
  } catch (e) {
    return json({ error: String(e) }, 400);
  }

  try {
    const r = redis();
    if (r.status !== "ready") await r.connect().catch(() => undefined);
    const key = redisKey(`quack:evt:${envelope.id}`);
    const set = await r.set(key, "1", "EX", 60 * 60 * 24 * 7, "NX");
    if (set === null) return json({ ok: true, duplicate: true });
  } catch {
    // redis optional
  }

  if (PAID.has(envelope.type)) {
    let buyer;
    try {
      buyer = extractBuyer(envelope);
    } catch (e) {
      return json({ error: String(e) }, 400);
    }
    try {
      const result = await provisionFromQuack({
        email: buyer.email,
        name: buyer.name,
        quackEventId: envelope.id,
        quackEventType: envelope.type,
        quackOrderId: buyer.orderId,
        quackProductId: buyer.productId ?? process.env.QUACK_PRODUCT_ID,
        totalCents: buyer.totalCents,
        periodEnd: buyer.periodEnd,
        plan: "pro",
      });
      return json({
        ok: true,
        userId: result.userId,
        already: result.already,
        createdUser: result.createdUser,
      });
    } catch (e) {
      return json({ error: `provision failed: ${String(e)}` }, 500);
    }
  }

  // lifecycle
  if (
    envelope.type === "subscription.past_due" ||
    envelope.type === "subscription.canceled"
  ) {
    try {
      const buyer = extractBuyer(envelope);
      const d = db();
      const u = await d.query.user.findFirst({
        where: eq(schema.user.email, buyer.email),
      });
      if (u) {
        if (envelope.type === "subscription.past_due") await markPastDue(u.id);
        if (envelope.type === "subscription.canceled") await markCanceled(u.id);
      }
      return json({ ok: true, handled: envelope.type });
    } catch {
      return json({ ok: true, ignored: envelope.type });
    }
  }

  return json({ ok: true, ignored: envelope.type });
}
