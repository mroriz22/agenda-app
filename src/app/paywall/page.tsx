import { getSessionAccess } from "@/factory/access";
import { PaywallScreen } from "@/factory/PaywallScreen";
import { redirect } from "next/navigation";

export default async function PaywallPage() {
  const ctx = await getSessionAccess();
  if (!ctx) redirect("/login");
  if (ctx.access.allowed) redirect("/dashboard");
  return <PaywallScreen access={ctx.access} userId={ctx.user.id} />;
}
