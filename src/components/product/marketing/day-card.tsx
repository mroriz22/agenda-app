const BLOCKS = [
  {
    time: "08:30",
    label: "Pico de foco",
    task: "Escrever a proposta do cliente",
    tone: "peak" as const,
    meta: "90 min · sem interrupção",
  },
  {
    time: "11:00",
    label: "Ainda alto",
    task: "Revisar os números do trimestre",
    tone: "peak" as const,
    meta: "45 min",
  },
  {
    time: "14:00",
    label: "Queda natural",
    task: "Reunião de alinhamento",
    tone: "dip" as const,
    meta: "30 min",
  },
  {
    time: "16:30",
    label: "Retomada leve",
    task: "Responder e-mails pendentes",
    tone: "low" as const,
    meta: "25 min",
  },
];

const DOT = {
  peak: "bg-signal",
  dip: "bg-mist",
  low: "bg-cyan",
};

export function DayCard() {
  return (
    <div className="relative rounded-[16px] bg-paper shadow-[var(--shadow-card)]">
      {/* topo */}
      <div className="flex items-center justify-between border-b border-hairline px-6 py-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate">
            Quinta-feira
          </p>
          <p className="mt-1 text-lg font-bold text-ink">Seu dia</p>
        </div>
        <span className="rounded-full bg-badge px-3 py-1 text-xs font-medium text-cobalt">
          4 blocos
        </span>
      </div>

      {/* curva de energia */}
      <div className="px-6 pt-5">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate">
          Energia ao longo do dia
        </p>
        <svg viewBox="0 0 320 72" className="mt-3 h-[72px] w-full" aria-hidden>
          <defs>
            <linearGradient id="energyFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#006bff" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#006bff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0 52 C 26 46, 40 12, 74 14 C 108 16, 118 40, 150 52 C 178 62, 190 60, 212 46 C 236 31, 252 26, 276 32 C 296 37, 308 46, 320 50"
            fill="none"
            stroke="#006bff"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M0 52 C 26 46, 40 12, 74 14 C 108 16, 118 40, 150 52 C 178 62, 190 60, 212 46 C 236 31, 252 26, 276 32 C 296 37, 308 46, 320 50 L320 72 L0 72 Z"
            fill="url(#energyFill)"
          />
          <circle cx="74" cy="14" r="4.5" fill="#006bff" />
          <circle cx="74" cy="14" r="9" fill="#006bff" opacity="0.15" />
        </svg>
        <div className="flex justify-between pb-1 text-[11px] font-medium text-mist">
          <span>07h</span>
          <span>12h</span>
          <span>17h</span>
          <span>22h</span>
        </div>
      </div>

      {/* blocos */}
      <div className="flex flex-col divide-y divide-hairline px-6 pb-6">
        {BLOCKS.map((b) => (
          <div key={b.time} className="flex items-start gap-4 py-4">
            <span className="w-11 shrink-0 pt-0.5 text-sm font-semibold text-slate">
              {b.time}
            </span>
            <span className={`mt-2 h-2 w-2 shrink-0 rounded-full ${DOT[b.tone]}`} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold text-ink">{b.task}</p>
              <p className="mt-0.5 text-[13px] text-slate">
                {b.label} · {b.meta}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
