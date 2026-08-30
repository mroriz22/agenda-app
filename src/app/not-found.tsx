import Link from "next/link";

export const metadata = { title: "Página não encontrada · SmartDayZ" };

export default function NaoEncontrada() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-5 px-6 py-24">
      <p className="text-sm font-medium uppercase tracking-widest text-zinc-400">SmartDayZ</p>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Esta página não existe
      </h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        O endereço pode ter mudado de lugar, ou o link que te trouxe até aqui está com um pedaço
        faltando. Abaixo estão os caminhos que funcionam.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Ir para a agenda
        </Link>
        <Link
          href="/pricing"
          className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium hover:border-zinc-500 dark:border-zinc-700"
        >
          Ver os planos
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium hover:border-zinc-500 dark:border-zinc-700"
        >
          Entrar na conta
        </Link>
      </div>
    </main>
  );
}
