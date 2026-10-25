import { bannieresOpportunite, type MarcheDpe } from "../../lib/proptech/statutMarcheDpe";

const STYLE: Record<"vente" | "bailleur" | "solaire", string> = {
  vente: "border-amber-300/70 bg-amber-950/80 text-amber-50",
  bailleur: "border-rose-400/80 bg-rose-950/85 text-rose-50",
  solaire: "border-amber-400/70 bg-amber-900/70 text-amber-50",
};

const ICONE: Record<"vente" | "bailleur" | "solaire", string> = {
  vente: "🏷️",
  bailleur: "🔑",
  solaire: "⚡",
};

interface BannieresOpportuniteProps {
  bien: MarcheDpe;
  valeurVenale?: number | null;
}

export default function BannieresOpportunite({ bien, valeurVenale = null }: BannieresOpportuniteProps) {
  const lignes = bannieresOpportunite(bien, valeurVenale);
  if (!lignes.length) return null;
  return (
    <div className="mt-3 space-y-1.5">
      {lignes.map((ligne) => (
        <div key={ligne.id} className={`rounded-lg border px-2.5 py-1.5 ${STYLE[ligne.id]}`}>
          <p className="text-[11px] font-semibold leading-snug">
            {ICONE[ligne.id]} {ligne.titre}
          </p>
          <p className="mt-0.5 text-[10px] leading-snug opacity-90">{ligne.detail}</p>
        </div>
      ))}
    </div>
  );
}
