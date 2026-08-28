import { getSessionAccess } from "@/factory/access";

/** @deprecated use getSessionAccess from @/factory */
export async function getSession() {
  const ctx = await getSessionAccess();
  if (!ctx) return null;
  return { user: ctx.user };
}

export async function requireSession() {
  return getSessionAccess();
}
