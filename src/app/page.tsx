import Link from "next/link";
import { factoryConfig } from "@/factory/config";
import { DayCard } from "@/components/product/marketing/day-card";
import { FocusPanel, AiPanel, SyncPanel } from "@/components/product/marketing/panels";
import { OnboardingVenda } from "@/components/onboarding-venda";

const appName = factoryConfig.appName === "SaaS Template" ? "SmartDayZ" : factoryConfig.appName;

export default function HomePage() {
  const trial = factoryConfig.trialDays;

  return (
    <>
      <OnboardingVenda />
      <SiteNav />

      <main className="flex flex-col">
        {/* ── Hero ── */}
        <section className="mx-auto grid w-full max-w-[1200px] grid-cols-1 items-center gap-16 px-6 pt-16 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:pt-24">
          <div>
            {trial > 0 ? (
              <span className="inline-flex rounded-full bg-badge px-3 py-1 text-xs font-medium text-cobalt">
                {trial} dias grátis, sem cartão
              </span>
            ) : null}

            <h1 className="mt-6 max-w-[11ch] text-[44px] font-bold leading-[1.1] tracking-[-0.02em] text-balance text-ink sm:text-[56px] lg:text-[64px]">
              Sua agenda no seu melhor horário
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate">
              O {appName} lê o seu ritmo de energia ao longo do dia e coloca a
              tarefa difícil no pico, a tarefa leve na queda. Você para de brigar
              com o próprio corpo pra render.
            </p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-[8px] bg-signal px-6 py-3.5 text-[17px] font-semibold text-paper shadow-[var(--shadow-btn)] transition hover:brightness-110"
              >
                Começar grátis
              </Link>
              <Link
                href="#como-funciona"
                className="inline-flex items-center justify-center rounded-[8px] bg-deep px-6 py-3.5 text-[17px] font-semibold text-paper transition hover:brightness-125"
              >
                Ver como funciona
              </Link>
            </div>

            <p className="mt-5 text-sm text-slate">
              Funciona offline no seu aparelho. A nuvem e a IA entram no Pro.
            </p>
          </div>

          <div className="relative">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-12 left-0 h-64 w-64 rounded-full bg-blob-a opacity-25 blur-3xl lg:-left-10"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-14 right-0 h-64 w-64 rounded-full bg-blob-b opacity-20 blur-3xl lg:-right-6"
            />
            <DayCard />
          </div>
        </section>

        {/* ── Faixa de princípios ── */}
        <section className="border-y border-hairline bg-paper">
          <div className="mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-8 px-6 py-12 sm:grid-cols-3">
            <Stat n="3 picos" t="de energia mapeados no seu dia" />
            <Stat n="1 toque" t="pra IA resolver a tarefa por você" />
            <Stat n="Todos" t="os aparelhos com a mesma agenda" />
          </div>
        </section>

        {/* ── Como funciona ── */}
        <section id="como-funciona" className="mx-auto w-full max-w-[1200px] px-6 py-24">
          <div className="mx-auto max-w-[640px] text-center">
            <h2 className="text-[38px] font-bold leading-[1.2] tracking-[-0.02em] text-ink sm:text-[50px]">
              Nem toda hora do dia serve pra tudo
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-slate">
              Sua atenção sobe e cai em ciclos previsíveis. O {appName} usa isso
              pra montar o dia em vez de empilhar tarefa em cima de tarefa.
            </p>
          </div>

          <div className="mt-20 flex flex-col gap-24">
            <Feature
              step="01"
              title="O dia dividido por energia, não por hora vaga"
              body="Manhã de foco profundo, tarde de reunião, fim de dia de tarefa mecânica. Cada tarefa entra na janela onde você consegue fazer ela bem."
              bullets={[
                "Tarefa difícil vai pro pico de atenção",
                "Reunião cai no vale, onde ela custa menos",
                "Sobrou tarefa leve? Encaixa no fim do dia",
              ]}
              visual={<FocusPanel />}
              blob="a"
            />
            <Feature
              step="02"
              title="A IA não organiza a tarefa. Ela faz."
              body="Travou num e-mail difícil, numa decisão ou numa pesquisa? Um toque e o SmartDayZ devolve a resposta pronta pra usar, no contexto da tarefa."
              bullets={[
                "E-mail escrito, não sugerido",
                "Decisão com recomendação clara",
                "Dica de ritmo lendo o seu dia inteiro",
              ]}
              visual={<AiPanel />}
              blob="b"
              flip
            />
            <Feature
              step="03"
              title="Começou no celular, continua no computador"
              body="Sua agenda vive no aparelho e funciona sem internet. Com o Pro, ela sincroniza sozinha entre tudo que você usa."
              bullets={[
                "Offline por padrão, nada trava",
                "Sincroniza em segundo plano",
                "Seus dados saem quando você quiser",
              ]}
              visual={<SyncPanel />}
              blob="a"
            />
          </div>
        </section>

        {/* ── CTA final ── */}
        <section className="mx-auto w-full max-w-[1200px] px-6 pb-24">
          <div className="rounded-[24px] bg-deep px-8 py-16 text-center sm:px-16">
            <h2 className="text-[32px] font-bold leading-[1.2] tracking-[-0.02em] text-paper sm:text-[44px]">
              Comece o próximo dia no ritmo certo
            </h2>
            <p className="mx-auto mt-5 max-w-[520px] text-lg leading-relaxed text-mist">
              {trial > 0
                ? `${trial} dias com tudo liberado. Sem cartão pra entrar.`
                : "Crie sua conta e monte o primeiro dia em minutos."}
            </p>
            <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-[8px] bg-signal px-6 py-3.5 text-[17px] font-semibold text-paper transition hover:brightness-110"
              >
                Criar minha conta
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-[8px] border border-paper/30 px-6 py-3.5 text-[17px] font-semibold text-paper transition hover:bg-paper/10"
              >
                Ver planos
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter appName={appName} />
    </>
  );
}

/* ───────────────────────── partes ───────────────────────── */

function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-hairline/70 bg-cloud/85 backdrop-blur">
      <nav className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/icon.svg" alt="" className="h-8 w-8" />
          <span className="text-[17px] font-bold tracking-[-0.01em] text-ink">
            SmartDayZ
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="#como-funciona" className="text-sm font-medium text-ink hover:text-signal">
            Como funciona
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-ink hover:text-signal">
            Preço
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-[8px] px-3 py-2 text-sm font-semibold text-ink hover:bg-pebble sm:inline-flex"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="inline-flex rounded-[8px] bg-signal px-4 py-2.5 text-sm font-semibold text-paper transition hover:brightness-110"
          >
            Começar grátis
          </Link>
        </div>
      </nav>
    </header>
  );
}

function Stat({ n, t }: { n: string; t: string }) {
  return (
    <div className="text-center sm:text-left">
      <p className="text-[28px] font-bold tracking-[-0.01em] text-ink">{n}</p>
      <p className="mt-1 text-[15px] text-slate">{t}</p>
    </div>
  );
}

function Feature({
  step,
  title,
  body,
  bullets,
  visual,
  blob,
  flip,
}: {
  step: string;
  title: string;
  body: string;
  bullets: string[];
  visual: React.ReactNode;
  blob: "a" | "b";
  flip?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-20">
      <div className={flip ? "lg:order-2" : undefined}>
        <span className="text-sm font-semibold tracking-[0.14em] text-mist">
          {step}
        </span>
        <h3 className="mt-3 text-[28px] font-bold leading-[1.25] tracking-[-0.01em] text-ink sm:text-[38px]">
          {title}
        </h3>
        <p className="mt-5 text-lg leading-relaxed text-slate">{body}</p>
        <ul className="mt-8 flex flex-col divide-y divide-hairline border-t border-hairline">
          {bullets.map((b) => (
            <li key={b} className="flex items-start gap-3 py-4">
              <svg
                viewBox="0 0 20 20"
                className="mt-0.5 h-5 w-5 shrink-0 text-signal"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="10" cy="10" r="8" />
                <path d="m6.5 10.2 2.4 2.3 4.6-4.8" />
              </svg>
              <span className="text-[17px] font-medium text-ink">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`relative ${flip ? "lg:order-1" : ""}`}>
        <div
          aria-hidden
          className={`pointer-events-none absolute -top-10 ${
            flip ? "right-0 lg:-right-8" : "left-0 lg:-left-8"
          } h-56 w-56 rounded-full blur-3xl ${
            blob === "a" ? "bg-blob-a opacity-20" : "bg-blob-b opacity-20"
          }`}
        />
        {visual}
      </div>
    </div>
  );
}

function SiteFooter({ appName }: { appName: string }) {
  return (
    <footer className="border-t border-hairline bg-cloud">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-10 px-6 py-14 sm:flex-row sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="" className="h-8 w-8" />
            <span className="text-[17px] font-bold text-ink">{appName}</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate">
            Agenda que respeita o seu ritmo de energia em vez de ignorar ele.
          </p>
        </div>

        <div className="flex gap-16">
          <FooterCol
            head="Produto"
            links={[
              { label: "Como funciona", href: "#como-funciona" },
              { label: "Preço", href: "/pricing" },
              { label: "Entrar", href: "/login" },
            ]}
          />
          <FooterCol
            head="Conta"
            links={[
              { label: "Criar conta", href: "/login" },
              { label: "Meu dia", href: "/app" },
            ]}
          />
        </div>
      </div>
      <div className="border-t border-hairline">
        <p className="mx-auto w-full max-w-[1200px] px-6 py-6 text-sm text-slate">
          © {new Date().getFullYear()} {appName}
        </p>
      </div>
    </footer>
  );
}

function FooterCol({
  head,
  links,
}: {
  head: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate">
        {head}
      </p>
      <ul className="mt-4 flex flex-col gap-3">
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className="text-sm font-medium text-ink hover:text-signal">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
