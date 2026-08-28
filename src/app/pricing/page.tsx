import Link from "next/link";
import { factoryConfig } from "@/factory/config";

export default function PricingPage() {
  const url = factoryConfig.checkoutUrl;
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-6 px-6 py-16">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← home
      </Link>
      <h1 className="text-3xl font-semibold tracking-tight">Pricing</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Trial de {factoryConfig.trialDays} dias no signup. Depois, checkout Quack.
      </p>
      <div className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">Pro</h2>
        <p className="mt-2 text-sm text-zinc-500">Acesso completo ao produto</p>
        {url ? (
          <a
            href={url}
            className="mt-4 inline-flex rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Assinar
          </a>
        ) : (
          <p className="mt-4 text-sm text-amber-700 dark:text-amber-300">
            Configure QUACK_CHECKOUT_URL
          </p>
        )}
      </div>
    </main>
  );
}
