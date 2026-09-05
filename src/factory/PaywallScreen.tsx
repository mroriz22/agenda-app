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
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {access?.status === "expired" || reason === "trial_expired"
            ? "Seu teste acabou"
            : "Assine para continuar"}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          {access?.status === "trial"
            ? "Seu teste está ativo. Se esta tela apareceu, recarregue a página."
            : "Assine para continuar com o produto completo."}
        </p>
      </div>

      {access?.trialEndsAt && (
        <p className="text-sm text-zinc-500">
          Teste até {access.trialEndsAt.toLocaleString?.() ?? String(access.trialEndsAt)}
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
        /* Sem link de checkout configurado: o cliente recebe um caminho,
           nunca um recado de configuração. */
        <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          A assinatura ainda não está aberta. Enquanto isso, a agenda continua
          funcionando na versão grátis.
        </p>
      )}

      <a href="/app" className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200">
        Voltar para a agenda →
      </a>
    </main>
  );
}
