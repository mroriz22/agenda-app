import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { getAccess, type AccessSnapshot } from "./billing";

export type SessionAccess = {
  user: { id: string; email: string; name: string };
  access: AccessSnapshot;
};

export async function getSessionAccess(): Promise<SessionAccess | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  const access = await getAccess(session.user.id);
  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    },
    access,
  };
}

/** Server Component / Route Handler: exige login + allowed. */
export async function requireAccess(feature?: string): Promise<SessionAccess | { error: "unauthenticated" | "paywalled" | "feature"; access?: AccessSnapshot }> {
  const ctx = await getSessionAccess();
  if (!ctx) return { error: "unauthenticated" };
  if (!ctx.access.allowed) return { error: "paywalled", access: ctx.access };
  if (feature) {
    const ok =
      ctx.access.features.includes("*") || ctx.access.features.includes(feature);
    if (!ok) return { error: "feature", access: ctx.access };
  }
  return ctx;
}
