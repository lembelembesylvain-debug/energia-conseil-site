import { useMemo, useState } from "react";
import { LOGO_ENERGIA_CANDIDATS, svgLogoEnergiaMaisonIa } from "../../lib/crm/logoEnergiaOfficiel.js";

/** Logo SVG officiel maison / toiture verte / ampoule IA. */
export function LogoEnergiaBlason({ className = "", width = 170, height = 60 }) {
  const html = useMemo(
    () => svgLogoEnergiaMaisonIa({ width, height, id: "crm-logo-maison-ia" }),
    [width, height],
  );
  return (
    <span
      className={className}
      style={{ display: "inline-block", lineHeight: 0, height }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Logo officiel CRM : tente les fichiers public/, sinon SVG maison / ampoule IA.
 */
export default function LogoEnergia({
  className = "h-12 w-auto object-contain",
  width = 170,
  height = 60,
  showCaption = false,
}) {
  const [index, setIndex] = useState(0);
  const epuise = index >= LOGO_ENERGIA_CANDIDATS.length;

  if (epuise) {
    return (
      <div className="inline-flex flex-col items-start gap-1">
        <LogoEnergiaBlason className={className} width={width} height={height} />
        {showCaption ? (
          <span className="text-[10px] font-medium tracking-wide text-amber-200/90">
            INPI n° 5213845
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <img
        src={LOGO_ENERGIA_CANDIDATS[index]}
        alt="ENERGIA CONSEIL IA®"
        width={width}
        height={height}
        className={className}
        loading="eager"
        decoding="async"
        onError={() => setIndex((i) => i + 1)}
      />
      {showCaption ? (
        <span className="text-[10px] font-medium tracking-wide text-slate-400">
          Marque déposée INPI n° 5213845
        </span>
      ) : null}
    </div>
  );
}
