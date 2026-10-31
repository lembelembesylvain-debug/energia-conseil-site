/**
 * Plan Technique DAO Vectoriel — Avenant n°01 Brunel Gros Œuvre.
 * Blueprint bleu nuit inline (80,50 m²) — IPN, mur pierre, agglos, PVC.
 */

export default function PlanDaoBrunelSvg({ className = "" }) {
  return (
    <svg
      viewBox="0 0 800 650"
      className={`w-full h-auto rounded-lg bg-slate-900 p-2 text-white shadow-2xl ${className}`}
      role="img"
      aria-labelledby="planDaoBrunelTitre planDaoBrunelDesc"
      data-testid="plan-dao-brunel-svg-inline"
    >
      <title id="planDaoBrunelTitre">Plan Technique DAO Vectoriel — Gros Œuvre Brunel 80,50 m²</title>
      <desc id="planDaoBrunelDesc">
        Zones séjour, cuisine, cellier/WC — mur porteur pierre 60 cm — IPN 260×230 — dalle BA 15 cm
      </desc>

      <defs>
        <pattern id="grilleBlueprint" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="1" />
        </pattern>
        <pattern id="hachurePierreNuit" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
          <rect width="8" height="8" fill="#334155" />
          <line x1="0" y1="0" x2="0" y2="8" stroke="#94a3b8" strokeWidth="2.2" />
          <line x1="4" y1="0" x2="4" y2="8" stroke="#64748b" strokeWidth="1" />
        </pattern>
        <marker id="flecheJaune" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="#facc15" />
        </marker>
        <marker id="flecheJauneInv" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M7,0 L0,3.5 L7,7 Z" fill="#facc15" />
        </marker>
        <marker id="flecheCyan" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="#22d3ee" />
        </marker>
        <marker id="flecheCyanInv" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M7,0 L0,3.5 L7,7 Z" fill="#22d3ee" />
        </marker>
      </defs>

      {/* Fond blueprint */}
      <rect x="0" y="0" width="800" height="650" fill="#0f172a" />
      <rect x="0" y="0" width="800" height="650" fill="url(#grilleBlueprint)" />
      <rect x="8" y="8" width="784" height="634" fill="none" stroke="#38bdf8" strokeWidth="1.5" rx="6" opacity="0.45" />

      {/* En-tête */}
      <text x="400" y="28" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="800" fontFamily="Segoe UI, Arial, sans-serif">
        PLAN DE PRINCIPE GROS ŒUVRE &amp; NIVEAU 0 — 80,50 m²
      </text>
      <text x="400" y="42" textAnchor="middle" fill="#94a3b8" fontSize="9" fontWeight="600" fontFamily="Segoe UI, Arial, sans-serif">
        DAO VECTORIEL · ÉCHELLE INDICATIVE · RELEVÉ CONSTRUCTEUR
      </text>

      {/* ZONE 1 */}
      <rect x="200" y="50" width="400" height="180" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
      <text x="400" y="120" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="800" fontFamily="Segoe UI, Arial, sans-serif">
        ZONE 1 : SÉJOUR / PIÈCE DE VIE — 25,50 m²
      </text>
      <text x="400" y="140" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontWeight="600" fontFamily="Segoe UI, Arial, sans-serif">
        Largeur 4,50 m × Longueur 5,65 m
      </text>

      {/* MUR PORTEUR PIERRE 60 cm (y≈230, épaisseur visuelle ~14 px) */}
      <rect x="200" y="230" width="400" height="14" fill="url(#hachurePierreNuit)" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x="212" y="240" fill="#cbd5e1" fontSize="7" fontWeight="700" fontFamily="Segoe UI, Arial, sans-serif">
        MUR PORTEUR PIERRE — ÉP. 60 cm
      </text>

      {/* Ouverture centrale 2,60 m + IPN rouge vif */}
      <rect x="320" y="228" width="160" height="18" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
      {/* Profil IPN */}
      <rect x="328" y="231" width="144" height="3.5" fill="#ef4444" />
      <rect x="390" y="234.5" width="20" height="5" fill="#f87171" stroke="#ef4444" strokeWidth="0.8" />
      <rect x="328" y="239.5" width="144" height="3.5" fill="#ef4444" />
      <text x="400" y="225" textAnchor="middle" fill="#ef4444" fontSize="10" fontWeight="900" fontFamily="Segoe UI, Arial, sans-serif">
        IPN ACIER 260 × 230
      </text>
      <text x="400" y="256" textAnchor="middle" fill="#fca5a5" fontSize="8" fontWeight="700" fontFamily="Segoe UI, Arial, sans-serif">
        Ouverture 2,60 m × 2,30 m
      </text>

      {/* ZONE 2 */}
      <rect x="180" y="250" width="440" height="180" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
      <text x="420" y="320" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="800" fontFamily="Segoe UI, Arial, sans-serif">
        ZONE 2 : CUISINE / ESPACE REPAS — 33,00 m²
      </text>
      <text x="420" y="340" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontWeight="600" fontFamily="Segoe UI, Arial, sans-serif">
        4,80 m × 5,00 m
      </text>

      {/* Mur agglos banchés + semelle (orange) — 5 ml bord gauche Zone 2 */}
      <rect x="180" y="250" width="16" height="180" fill="#7c2d12" stroke="#f97316" strokeWidth="2" />
      <rect x="168" y="250" width="12" height="180" fill="#ea580c" stroke="#f97316" strokeWidth="1.2" opacity="0.9" />
      <text
        x="158"
        y="340"
        fill="#fdba74"
        fontSize="8"
        fontWeight="800"
        fontFamily="Segoe UI, Arial, sans-serif"
        transform="rotate(-90 158 340)"
      >
        AGGLOS BANCHER H=75 cm · SEMELLE 40×30 — 5,00 ml
      </text>

      {/* ZONE 3 — polygone pan coupé */}
      <polygon
        points="140,440 620,440 640,500 640,570 200,570 140,520"
        fill="#1e293b"
        stroke="#38bdf8"
        strokeWidth="2.5"
      />
      <text x="390" y="490" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="800" fontFamily="Segoe UI, Arial, sans-serif">
        ZONE 3 : CELLIER / WC / DÉGAGEMENT — 22,00 m²
      </text>
      <text x="390" y="508" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontWeight="600" fontFamily="Segoe UI, Arial, sans-serif">
        6,80 m × 4,00 m (pan coupé)
      </text>

      {/* WC + PVC cyan pointillés */}
      <rect x="540" y="520" width="48" height="32" rx="3" fill="#083344" stroke="#22d3ee" strokeWidth="1.8" />
      <ellipse cx="564" cy="536" rx="12" ry="8" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
      <text x="564" y="516" textAnchor="middle" fill="#22d3ee" fontSize="9" fontWeight="900" fontFamily="Segoe UI, Arial, sans-serif">
        WC
      </text>
      <path
        d="M588 536 C620 536 650 555 680 580"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2"
        strokeDasharray="6 4"
      />
      <circle cx="680" cy="580" r="6" fill="#0891b2" stroke="#22d3ee" strokeWidth="1.5" />
      <text x="690" y="584" fill="#67e8f9" fontSize="8" fontWeight="700" fontFamily="Segoe UI, Arial, sans-serif">
        PVC Ø125 mm vers regard
      </text>

      {/* Badge dalle central */}
      <rect x="220" y="400" width="360" height="36" rx="8" fill="#052e16" stroke="#34d399" strokeWidth="2" />
      <text x="400" y="415" textAnchor="middle" fill="#6ee7b7" fontSize="9" fontWeight="900" fontFamily="Segoe UI, Arial, sans-serif">
        NIVEAU 0.00 PARTOUT
      </text>
      <text x="400" y="428" textAnchor="middle" fill="#a7f3d0" fontSize="8" fontWeight="700" fontFamily="Segoe UI, Arial, sans-serif">
        DALLE BÉTON ARMÉ 15 CM (15 m³ avec City Pompe)
      </text>

      {/* ========== COTES JAUNE / CYAN ========== */}
      {/* 4,50 m Zone 1 haut */}
      <line x1="200" y1="48" x2="600" y2="48" stroke="#facc15" strokeWidth="1.2" markerStart="url(#flecheJauneInv)" markerEnd="url(#flecheJaune)" />
      <text x="400" y="44" textAnchor="middle" fill="#facc15" fontSize="10" fontWeight="800" fontFamily="Segoe UI, Arial, sans-serif">
        4,50 m
      </text>

      {/* 5,65 m Zone 1 gauche */}
      <line x1="188" y1="50" x2="188" y2="230" stroke="#22d3ee" strokeWidth="1.2" markerStart="url(#flecheCyanInv)" markerEnd="url(#flecheCyan)" />
      <text x="178" y="145" textAnchor="middle" fill="#22d3ee" fontSize="10" fontWeight="800" fontFamily="Segoe UI, Arial, sans-serif" transform="rotate(-90 178 145)">
        5,65 m
      </text>

      {/* mur 60 cm */}
      <line x1="608" y1="230" x2="608" y2="244" stroke="#facc15" strokeWidth="1.1" markerStart="url(#flecheJauneInv)" markerEnd="url(#flecheJaune)" />
      <text x="620" y="241" fill="#facc15" fontSize="8" fontWeight="800" fontFamily="Segoe UI, Arial, sans-serif">
        60 cm
      </text>

      {/* 4,80 m Zone 2 */}
      <line x1="180" y1="438" x2="620" y2="438" stroke="#facc15" strokeWidth="1.2" markerStart="url(#flecheJauneInv)" markerEnd="url(#flecheJaune)" />
      <text x="400" y="434" textAnchor="middle" fill="#facc15" fontSize="10" fontWeight="800" fontFamily="Segoe UI, Arial, sans-serif">
        4,80 m
      </text>

      {/* 5,00 m Zone 2 gauche */}
      <line x1="152" y1="250" x2="152" y2="430" stroke="#22d3ee" strokeWidth="1.2" markerStart="url(#flecheCyanInv)" markerEnd="url(#flecheCyan)" />
      <text x="142" y="345" textAnchor="middle" fill="#22d3ee" fontSize="10" fontWeight="800" fontFamily="Segoe UI, Arial, sans-serif" transform="rotate(-90 142 345)">
        5,00 m
      </text>

      {/* 6,80 m Zone 3 bas */}
      <line x1="140" y1="588" x2="640" y2="588" stroke="#facc15" strokeWidth="1.2" markerStart="url(#flecheJauneInv)" markerEnd="url(#flecheJaune)" />
      <text x="390" y="602" textAnchor="middle" fill="#facc15" fontSize="10" fontWeight="800" fontFamily="Segoe UI, Arial, sans-serif">
        6,80 m
      </text>

      {/* 4,00 m Zone 3 droite */}
      <line x1="655" y1="440" x2="655" y2="570" stroke="#22d3ee" strokeWidth="1.2" markerStart="url(#flecheCyanInv)" markerEnd="url(#flecheCyan)" />
      <text x="668" y="510" textAnchor="middle" fill="#22d3ee" fontSize="10" fontWeight="800" fontFamily="Segoe UI, Arial, sans-serif" transform="rotate(-90 668 510)">
        4,00 m
      </text>

      {/* Cartouche officiel */}
      <rect x="40" y="612" width="720" height="30" rx="4" fill="#020617" stroke="#38bdf8" strokeWidth="1.4" />
      <text x="400" y="624" textAnchor="middle" fill="#38bdf8" fontSize="9" fontWeight="900" fontFamily="Segoe UI, Arial, sans-serif">
        ENERGIA CONSEIL IA® — RELEVÉ TECHNIQUE GROS ŒUVRE BRUNEL
      </text>
      <text x="400" y="636" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="600" fontFamily="Segoe UI, Arial, sans-serif">
        Mustafa Hezen (Hezen Bâtiment) · Mohamed (Coordination) · Sylvain Lembelembe
      </text>
    </svg>
  );
}
