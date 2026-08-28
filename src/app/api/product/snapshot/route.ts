import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { getSessionAccess } from "@/factory";
import { snapshot } from "@/lib/product-schema";

export const runtime = "nodejs";

function json(body: unknown, status = 200) {
  return Response.json(body, { status });
}

/** Baixa o snapshot do usuário logado. */
export async function GET() {
  const ctx = await getSessionAccess();
  if (!ctx) return json({ error: "unauthenticated" }, 401);

  const rows = await db()
    .select()
    .from(snapshot)
    .where(eq(snapshot.userId, ctx.user.id))
    .limit(1);

  const row = rows[0];
  return json({
    data: row?.data ?? null,
    device: row?.device ?? null,
    updatedAt: row?.updatedAt?.toISOString() ?? null,
  });
}

/**
 * Grava o snapshot. Só quem tem acesso liberado (trial ou pago) sincroniza —
 * o app free continua funcionando, mas guarda os dados só no aparelho.
 */
export async function POST(req: Request) {
  const ctx = await getSessionAccess();
  if (!ctx) return json({ error: "unauthenticated" }, 401);
  if (!ctx.access.allowed) {
    return json({ error: "A sincronização na nuvem é do Pro." }, 402);
  }

  let body: { data?: unknown; device?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "corpo inválido" }, 400);
  }

  const data = body?.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return json({ error: "snapshot inválido" }, 400);
  }

  const device = typeof body.device === "string" ? body.device.slice(0, 40) : null;

  await db()
    .insert(snapshot)
    .values({
      id: randomUUID(),
      userId: ctx.user.id,
      data: data as Record<string, unknown>,
      device,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: snapshot.userId,
      set: { data: data as Record<string, unknown>, device, updatedAt: new Date() },
    });

  return json({ ok: true });
}
