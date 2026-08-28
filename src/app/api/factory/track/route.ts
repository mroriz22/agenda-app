import { track } from "@/factory/analytics";
import { getSessionAccess } from "@/factory/access";

export const runtime = "nodejs";

/** Client → server → control plane (não expõe FACTORY_INGEST_KEY no browser). */
export async function POST(req: Request) {
  let body: { name?: string; properties?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.name || typeof body.name !== "string") {
    return Response.json({ error: "name required" }, { status: 400 });
  }

  const ctx = await getSessionAccess();
  void track({
    name: body.name,
    userId: ctx?.user.id ?? null,
    properties: body.properties,
  });

  return Response.json({ ok: true });
}
