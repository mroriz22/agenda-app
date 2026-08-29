function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[16px] bg-paper p-6 shadow-[var(--shadow-card)]">
      {children}
    </div>
  );
}

/* ── 01 · janelas de foco ── */

const WINDOWS = [
  { name: "Foco profundo", hours: "08h — 11h", level: 92, hint: "Melhor janela" },
  { name: "Execução", hours: "11h — 13h", level: 68, hint: "Boa pra tarefa média" },
  { name: "Vale", hours: "14h — 15h", level: 31, hint: "Reunião cai aqui" },
  { name: "Retomada", hours: "16h — 18h", level: 57, hint: "Tarefa mecânica" },
];

export function FocusPanel() {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate">
        Janelas de hoje
      </p>
      <div className="mt-5 flex flex-col gap-5">
        {WINDOWS.map((w) => (
          <div key={w.name}>
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[15px] font-semibold text-ink">{w.name}</p>
              <p className="text-[13px] font-medium text-slate">{w.hours}</p>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-pebble">
              <div
                className={`h-full rounded-full ${
                  w.level > 60 ? "bg-signal" : "bg-mist"
                }`}
                style={{ width: `${w.level}%` }}
              />
            </div>
            <p className="mt-1.5 text-[13px] text-slate">{w.hint}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ── 02 · IA ── */

export function AiPanel() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate">
          Tarefa travada
        </p>
        <span className="rounded-full bg-badge px-3 py-1 text-xs font-medium text-cobalt">
          Pro
        </span>
      </div>

      <p className="mt-4 text-[17px] font-semibold text-ink">
        Responder o fornecedor sobre o atraso
      </p>

      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        className="mt-4 inline-flex items-center gap-2 rounded-[8px] bg-signal px-4 py-2.5 text-sm font-semibold text-paper"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M10 1.5l1.9 4.9 4.9 1.9-4.9 1.9L10 15.1 8.1 10.2 3.2 8.3l4.9-1.9L10 1.5z" />
        </svg>
        Resolver com IA
      </button>

      <div className="mt-5 rounded-[12px] border border-hairline bg-pebble p-4">
        <p className="text-[13px] font-semibold text-slate">Resposta pronta</p>
        <p className="mt-2 text-[15px] leading-relaxed text-ink">
          Oi Marcelo, recebi o aviso do atraso. Consigo remanejar a entrega para
          sexta se o lote sair até quarta. Confirma se essa data fecha do seu
          lado?
        </p>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-hairline p-4">
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-cyan" />
        <p className="text-[14px] leading-relaxed text-slate">
          Dica do dia: você empilhou três reuniões no seu pico de foco. Puxe uma
          delas para depois das 14h.
        </p>
      </div>
    </Card>
  );
}

/* ── 03 · sync ── */

export function SyncPanel() {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate">
        Seus aparelhos
      </p>

      <div className="mt-5 flex flex-col divide-y divide-hairline">
        {[
          { d: "iPhone", s: "Sincronizado agora", on: true },
          { d: "MacBook", s: "Sincronizado há 2 min", on: true },
          { d: "iPad", s: "Offline · 4 alterações guardadas", on: false },
        ].map((x) => (
          <div key={x.d} className="flex items-center gap-4 py-4">
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-[8px] ${
                x.on ? "bg-badge text-cobalt" : "bg-pebble text-mist"
              }`}
            >
              <svg
                viewBox="0 0 20 20"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="4" y="2.5" width="12" height="15" rx="2.5" />
                <path d="M9 15h2" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-ink">{x.d}</p>
              <p className="mt-0.5 text-[13px] text-slate">{x.s}</p>
            </div>
            <span
              className={`h-2 w-2 shrink-0 rounded-full ${
                x.on ? "bg-signal" : "bg-mist"
              }`}
            />
          </div>
        ))}
      </div>

      <div className="mt-2 rounded-[12px] bg-pebble p-4">
        <p className="text-[14px] leading-relaxed text-slate">
          Sem internet o app continua funcionando. Quando a conexão volta, tudo
          sobe sozinho.
        </p>
      </div>
    </Card>
  );
}
