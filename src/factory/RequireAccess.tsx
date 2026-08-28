import { redirect } from "next/navigation";
import { getSessionAccess } from "./access";
import { PaywallScreen } from "./PaywallScreen";

type Props = {
  children: React.ReactNode;
  /** Feature flag opcional (ex: "api", "exports"). */
  feature?: string;
  /** Se true, mostra paywall inline em vez de redirect /paywall. */
  inline?: boolean;
};

/**
 * Server Component wrapper — cole em qualquer layout Lovable:
 *
 *   <RequireAccess>
 *     {children}
 *   </RequireAccess>
 */
export async function RequireAccess({ children, feature, inline = true }: Props) {
  const ctx = await getSessionAccess();
  if (!ctx) redirect("/login");

  if (!ctx.access.allowed) {
    if (inline) {
      return <PaywallScreen access={ctx.access} userId={ctx.user.id} />;
    }
    redirect(`/paywall?reason=${encodeURIComponent(ctx.access.reason ?? "blocked")}`);
  }

  if (feature) {
    const ok =
      ctx.access.features.includes("*") || ctx.access.features.includes(feature);
    if (!ok) {
      if (inline) {
        return <PaywallScreen access={ctx.access} userId={ctx.user.id} />;
      }
      redirect("/paywall?reason=feature");
    }
  }

  return <>{children}</>;
}
