import Link from "next/link";
import { factoryConfig } from "@/factory/config";

export const metadata = {
  title: "Planos · SmartDayZ",
  description:
    "SmartDayZ Pro: agenda, matriz do dia e aproveitamento do seu pico de energia, com sincronia entre aparelhos. 7 dias de teste, sem cartão.",
};

const INCLUI = [
  "Agenda e tarefas ilimitadas, com a matriz de cada dia",
  "Aproveitamento do pico de energia das 15h às 22h",
  "Relatório do dia, da semana e dos últimos 30 dias",
  "Sincronia entre computador e celular",
  "Agendas separadas: pessoal e trabalho",
];

export default function PricingPage() {
  const url = factoryConfig.checkoutUrl;
  return (
    <main className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-6 px-6 py-16">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">
        ← voltar
      </Link>

      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Um plano, o dia inteiro no lugar</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          São {factoryConfig.trialDays} dias de teste sem cartão. Se não fizer sentido, é só não continuar.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
        <h2 className="text-lg font-semibold">SmartDayZ Pro</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Grátis por {factoryConfig.trialDays} dias, depois assinatura mensal.
        </p>

        <ul className="mt-5 space-y-2.5">
          {INCLUI.map((item) => (
            <li key={item} className="flex gap-2.5 text-sm text-zinc-700 dark:text-zinc-300">
              <span aria-hidden="true" className="mt-0.5 text-zinc-400">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {url ? (
          <a
            href={url}
            className="mt-6 inline-flex w-full justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Assinar o Pro
          </a>
        ) : (
          /* Sem link de checkout configurado: o visitante ainda tem um caminho,
             em vez de ver um recado de configuração. */
          <Link
            href="/login"
            className="mt-6 inline-flex w-full justify-center rounded-lg bg-zinc-900 px-4 py-3 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Começar o teste de {factoryConfig.trialDays} dias
          </Link>
        )}

        <p className="mt-3 text-center text-xs text-zinc-500">
          Cancele quando quiser, direto na sua conta.
        </p>
      </div>

      <p className="text-sm text-zinc-500">
        Já usa o SmartDayZ?{" "}
        <Link href="/login" className="underline hover:text-zinc-800 dark:hover:text-zinc-200">
          Entrar na sua conta
        </Link>
      </p>
    </main>
  );
}
