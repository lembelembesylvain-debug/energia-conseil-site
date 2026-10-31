import { useEffect, useState } from "react";
import { Eye, EyeOff, Minus, Rocket, TrendingUp } from "lucide-react";
import { EMMY_CUMAC, FICHES_CEE_TRAVAUX, type CeeTrendTone } from "../../lib/crm/ceeRadarTravaux";

const STORAGE_KEY = "energia-crm-market-ticker-visible";

type TickerQuote = {
  id: string;
  emoji: string;
  title: string;
  value: string;
  signal: string;
  tone: CeeTrendTone;
  extra?: { value: string; signal: string; tone: CeeTrendTone };
};

const QUOTES: TickerQuote[] = [
  ...FICHES_CEE_TRAVAUX.map((fiche) => ({
    id: fiche.id,
    emoji: fiche.emoji,
    title: fiche.tickerTitre,
    value: `${fiche.primeLibelle} ${fiche.prime}`,
    signal: fiche.tendance,
    tone: fiche.tone,
  })),
  {
    id: "emmy",
    emoji: EMMY_CUMAC.emoji,
    title: EMMY_CUMAC.titre,
    value: `${EMMY_CUMAC.unite} Classique ${EMMY_CUMAC.classique}`,
    signal: "",
    tone: "fluo",
    extra: {
      value: `Précarité ${EMMY_CUMAC.precarite}`,
      signal: "",
      tone: "fluo",
    },
  },
];

const BADGE: Record<CeeTrendTone, string> = {
  up: "border-emerald-400/40 bg-emerald-500/15 text-emerald-300",
  boom: "border-fuchsia-400/60 bg-fuchsia-500/20 text-fuchsia-200 shadow-[0_0_10px_rgba(217,70,239,0.45)]",
  neutral: "border-sky-400/40 bg-sky-500/15 text-sky-200",
  fluo: "border-lime-300/50 bg-lime-400/10 text-lime-300 drop-shadow-[0_0_6px_rgba(190,242,100,0.45)]",
};

function lireVisibilite(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
}

function useHorlogeParis() {
  const [label, setLabel] = useState(() => formaterHeure(new Date()));

  useEffect(() => {
    const id = window.setInterval(() => setLabel(formaterHeure(new Date())), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return label;
}

function formaterHeure(date: Date) {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

function TrendMark({ tone }: { tone: CeeTrendTone }) {
  if (tone === "boom") return <Rocket className="size-3 shrink-0" aria-hidden />;
  if (tone === "neutral") return <Minus className="size-3 shrink-0" aria-hidden />;
  return <TrendingUp className="size-3 shrink-0" aria-hidden />;
}

function SignalBadge({
  tone,
  signal,
}: {
  tone: CeeTrendTone;
  signal: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-semibold ${BADGE[tone]}`}>
      <TrendMark tone={tone} />
      {signal ? <span>{signal}</span> : null}
    </span>
  );
}

function TickerQuoteItem({ quote }: { quote: TickerQuote }) {
  return (
    <span className="inline-flex items-center gap-2 px-4">
      <span className="text-slate-700" aria-hidden>
        |
      </span>
      <span aria-hidden>{quote.emoji}</span>
      <span className="text-slate-300">{quote.title}</span>
      <span className="text-slate-100">{quote.value}</span>
      <SignalBadge tone={quote.tone} signal={quote.signal} />
      {quote.extra ? (
        <>
          <span className="text-slate-600" aria-hidden>
            ·
          </span>
          <span className="text-slate-100">{quote.extra.value}</span>
          <SignalBadge tone={quote.extra.tone} signal={quote.extra.signal} />
        </>
      ) : null}
    </span>
  );
}

function Sequence({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={duplicate || undefined}>
      {QUOTES.map((quote) => (
        <TickerQuoteItem key={quote.id} quote={quote} />
      ))}
    </div>
  );
}

export default function MarketTickerBar() {
  const [visible, setVisible] = useState(lireVisibilite);
  const heure = useHorlogeParis();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, visible ? "1" : "0");
    } catch {
      /* préférence locale indisponible */
    }
  }, [visible]);

  if (!visible) {
    return (
      <div
        data-testid="market-ticker-bar"
        className="sticky top-0 z-50 flex h-8 items-center justify-between border-b border-slate-800 bg-slate-950 px-3"
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
          Primes CEE masquées
        </p>
        <button
          type="button"
          data-testid="market-ticker-toggle"
          onClick={() => setVisible(true)}
          className="inline-flex items-center gap-1.5 rounded border border-slate-700 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-300 hover:border-emerald-500/50 hover:text-emerald-200"
          aria-pressed={false}
          aria-label="Afficher le bandeau des primes CEE"
        >
          <Eye className="size-3" aria-hidden />
          Afficher
        </button>
      </div>
    );
  }

  return (
    <div
      data-testid="market-ticker-bar"
      className="sticky top-0 z-50 flex h-9 items-stretch border-b border-slate-800 bg-slate-950 text-[11px]"
    >
      <div className="flex shrink-0 items-center gap-2 border-r border-slate-800 px-3 font-mono">
        <span className="relative flex size-1.5" aria-hidden>
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-lime-400 opacity-70" />
          <span className="relative inline-flex size-1.5 rounded-full bg-lime-400" />
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-lime-300">CEE</span>
        <time className="tabular-nums text-slate-400" dateTime={heure}>
          {heure}
        </time>
      </div>

      <div className="energia-ticker relative min-w-0 flex-1 overflow-hidden font-mono">
        <ul className="sr-only">
          {QUOTES.map((quote) => (
            <li key={quote.id}>
              {quote.title} : {quote.value}
              {quote.signal ? `, ${quote.signal}` : ""}.
              {quote.extra ? ` ${quote.extra.value}.` : ""} Estimation à titre indicatif.
            </li>
          ))}
        </ul>
        <div className="energia-ticker-track flex h-full w-max items-center">
          <Sequence />
          <Sequence duplicate />
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-slate-950 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-slate-950 to-transparent" />
      </div>

      <button
        type="button"
        data-testid="market-ticker-toggle"
        onClick={() => setVisible(false)}
        className="inline-flex shrink-0 items-center gap-1.5 border-l border-slate-800 px-3 font-mono text-[10px] uppercase tracking-wider text-slate-400 hover:bg-slate-900 hover:text-white"
        aria-pressed
        aria-label="Masquer le bandeau des primes CEE"
      >
        <EyeOff className="size-3" aria-hidden />
        Masquer
      </button>
    </div>
  );
}
