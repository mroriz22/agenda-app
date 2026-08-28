"use client";

import { analytics } from "./analytics";
import { factoryConfig } from "./config";
import type { AccessSnapshot } from "./billing";
import { useEffect } from "react";

type Props = {
  access?: AccessSnapshot | null;
  userId?: string | null;
};

export function PaywallScreen({ access, userId }: Props) {
  const checkoutUrl = access?.checkoutUrl || factoryConfig.checkoutUrl;
  const reason = access?.reason ?? "no_access";

  useEffect(() => {
    void analytics.paywallViewed(userId ?? null, reason);
  }, [userId, reason]);

  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-2">
        <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase">
          paywall
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {access?.status === "expired" || reason === "trial_expired"
            ? "Seu trial acabou"
            : "Assine para continuar"}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {access?.status === "trial"
            ? "Trial ativo — se você está vendo isso, algo está inconsistente."
            : "Desbloqueie o produto completo via Quack Checkout."}
        </p>
      </div>

      {access?.trialEndsAt && (
        <p className="text-sm text-zinc-500">
          Trial até {access.trialEndsAt.toLocaleString?.() ?? String(access.trialEndsAt)}
        </p>
      )}

      {checkoutUrl ? (
        <a
          href={checkoutUrl}
          onClick={() => void analytics.checkoutClicked(userId ?? null)}
          className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Assinar agora
        </a>
      ) : (
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          Defina <code>QUACK_CHECKOUT_URL</code> no env (link do produto/offer na Quack).
        </p>
      )}

      <a href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
        Tentar de novo →
      </a>
    </main>
  );
}
