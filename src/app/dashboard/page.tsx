import { RequireAccess } from "@/factory/RequireAccess";
import { factoryConfig } from "@/factory/config";
import { getSessionAccess } from "@/factory/access";
import { SignOutButton } from "./sign-out-button";
import Link from "next/link";

export default async function DashboardPage() {
  return (
    <RequireAccess>
      <DashboardInner />
    </RequireAccess>
  );
}

async function DashboardInner() {
  const ctx = await getSessionAccess();
  if (!ctx) return null;

  return (
    <main className="mx-auto flex min-h-full w-full max-w-3xl flex-col gap-8 px-6 py-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500">{factoryConfig.appName}</p>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {ctx.user.email}
          </p>
        </div>
        <SignOutButton />
      </header>

      <section className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-sm font-semibold">Access</h2>
        <dl className="mt-4 grid gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <Row k="status" v={ctx.access.status} />
          <Row k="plan" v={ctx.access.plan} />
          <Row k="allowed" v={String(ctx.access.allowed)} />
          <Row k="reason" v={ctx.access.reason ?? "—"} />
          <Row
            k="trial ends"
            v={
              ctx.access.trialEndsAt
                ? ctx.access.trialEndsAt.toISOString()
                : "—"
            }
          />
          <Row
            k="period end"
            v={
              ctx.access.currentPeriodEnd
                ? ctx.access.currentPeriodEnd.toISOString()
                : "—"
            }
          />
        </dl>
      </section>

      <p className="text-sm text-zinc-500">
        Cole UI do Lovable aqui dentro de{" "}
        <code className="text-zinc-800 dark:text-zinc-200">&lt;RequireAccess&gt;</code>.
        Ver <code className="text-zinc-800 dark:text-zinc-200">LOVABLE.md</code>.
      </p>

      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← home
      </Link>
    </main>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{k}</dt>
      <dd className="font-medium text-zinc-900 dark:text-zinc-100">{v}</dd>
    </div>
  );
}
