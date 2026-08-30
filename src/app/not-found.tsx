import Link from "next/link";

export const metadata = { title: "Página não encontrada · SmartDayZ" };

export default function NaoEncontrada() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-5 px-6 py-24">
      <p className="text-sm font-medium uppercase tracking-widest text-mist">SmartDayZ</p>
      <h1 className="text-3xl font-semibold tracking-tight text-ink">
        Esta página não existe
      </h1>
      <p className="text-slate">
        O endereço pode ter mudado de lugar, ou o link que te trouxe até aqui está com um pedaço
        faltando. Abaixo estão os caminhos que funcionam.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-btn bg-signal px-4 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          Ir para a agenda
        </Link>
        <Link
          href="/pricing"
          className="rounded-btn border border-hairline px-4 py-2.5 text-sm font-medium hover:border-signal"
        >
          Ver os planos
        </Link>
        <Link
          href="/login"
          className="rounded-btn border border-hairline px-4 py-2.5 text-sm font-medium hover:border-signal"
        >
          Entrar na conta
        </Link>
      </div>
    </main>
  );
}
