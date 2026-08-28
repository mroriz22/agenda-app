import { getSessionAccess } from "@/factory/access";

export const runtime = "nodejs";

/** Snapshot de acesso pro front (Lovable client components). */
export async function GET() {
  const ctx = await getSessionAccess();
  if (!ctx) {
    return Response.json({ authenticated: false }, { status: 401 });
  }
  return Response.json({
    authenticated: true,
    user: ctx.user,
    access: {
      ...ctx.access,
      trialEndsAt: ctx.access.trialEndsAt?.toISOString() ?? null,
      currentPeriodEnd: ctx.access.currentPeriodEnd?.toISOString() ?? null,
    },
  });
}
