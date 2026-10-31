import { useEffect, useState, type ReactNode } from "react";
import { LOGO_PUBLIC_PATH } from "../lib/branding";

const REF = "EC-CTR-2026-CATARINA-01";
const TITRE =
  "CONTRAT CADRE DE PRESTATION DE SERVICES & DE COORDINATION DE PROJETS RÉNOVATION";
const TOTAL_PAGES = 4;

const LOGOS = [
  "/assets/energia-logo-arbres.png",
  LOGO_PUBLIC_PATH,
  "/assets/partners/_shared/energia-logo-arbres.png",
] as const;

const SOCIETE = {
  raison: "ENERGIA CONSEIL IA",
  forme: "SASU au capital de 100 €",
  siret: "941 819 427 00019",
  rcs: "RCS Lyon 941 819 427",
  ape: "71.12B",
  siege: "16 Rue Cuvier, 69006 Lyon",
  email: "contact@energia-conseil-ia.com",
} as const;

const PHOTOS: ReadonlyArray<readonly [string, string, string]> = [
  ["1", "Façade principale", "Identifier le bâtiment, les menuiseries visibles et l'état apparent de l'enveloppe."],
  ["2", "Séjour", "Décrire le volume principal habité, les émetteurs de chaleur et l'état intérieur."],
  ["3", "Combles", "Constater l'isolation existante ou son absence, l'accès et l'état de la toiture vu de l'intérieur."],
  ["4", "Tableau électrique", "Documenter l'installation apparente et la réserve utile au futur équipement de chauffage."],
  ["5", "Compteur", "Identifier l'énergie utilisée et le point de livraison."],
  ["6", "Pignons et façade arrière", "Relever les murs et les ouvertures qui n'apparaissent pas sur la façade principale."],
  ["7", "Chauffage ou chaudière", "Photographier le générateur existant, son énergie et son état apparent."],
  ["8", "Diagnostic de performance énergétique existant", "Rendre lisibles la classe, la date et l'adresse portées sur le document."],
  ["9", "Facture d'énergie", "Rendre lisibles la période, la consommation et l'énergie de chauffage."],
  ["10", "Avis d'imposition", "Rendre lisible le revenu fiscal de référence, aux seules fins de l'étude d'éligibilité aux aides."],
];

function Article({
  id,
  titre,
  children,
  licence = false,
}: {
  id: string;
  titre: string;
  children: ReactNode;
  licence?: boolean;
}) {
  return (
    <section id={id} className={licence ? "cc-art cc-licence" : "cc-art"} aria-labelledby={`${id}-titre`}>
      <h2 id={`${id}-titre`} className="cc-serif">
        {titre}
      </h2>
      {children}
    </section>
  );
}

function Feuille({
  numero,
  logoSrc,
  children,
}: {
  numero: number;
  logoSrc: string | null;
  children: ReactNode;
}) {
  return (
    <section className="cc-page" aria-label={`Page ${numero} sur ${TOTAL_PAGES}`}>
      {numero > 1 && (
        <header className="cc-runhead">
          {logoSrc ? (
            <img src={logoSrc} alt="" className="cc-runhead-logo" />
          ) : (
            <span className="cc-serif cc-runhead-mark">EC</span>
          )}
          <p>
            {SOCIETE.raison}
            <span> · </span>
            {REF}
          </p>
        </header>
      )}
      <div className="cc-page-body">{children}</div>
      <footer className="cc-page-foot">
        <div className="cc-rule" aria-hidden="true" />
        <p>
          {SOCIETE.raison} · {SOCIETE.siege} · Réf. {REF} · Page {numero} sur {TOTAL_PAGES}
        </p>
      </footer>
    </section>
  );
}

function CartoucheSignature({
  partie,
  nom,
  qualite,
}: {
  partie: string;
  nom: string;
  qualite: string;
}) {
  return (
    <article className="cc-sign-card">
      <p className="cc-label">{partie}</p>
      <h3 className="cc-serif">{nom}</h3>
      <p className="cc-sign-role">{qualite}</p>
      <p className="cc-sign-mention">Lu et approuvé, bon pour accord</p>
      <p className="cc-sign-field">
        Date
        <span className="cc-blank" />
      </p>
      <p className="cc-sign-field">
        Paraphe
        <span className="cc-blank" />
      </p>
      <p className="cc-sign-field">Signature</p>
      <div className="cc-sign-area" aria-hidden="true" />
    </article>
  );
}

export default function ContratCatarina() {
  const [logoIndex, setLogoIndex] = useState(0);
  const [logoPret, setLogoPret] = useState(false);
  const logoEpuise = logoIndex >= LOGOS.length;
  const logoSrc = logoEpuise ? null : LOGOS[logoIndex];

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${REF} — Contrat cadre Catarina Martins | ENERGIA CONSEIL IA`;

    const fontId = "contrat-catarina-fonts";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Outfit:wght@300;400;500;600&display=swap";
      document.head.appendChild(link);
    }

    return () => {
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="cc-desk">
      <style>{`
        .cc-desk, .cc-desk *, .cc-desk *::before, .cc-desk *::after { box-sizing: border-box; }
        .cc-desk {
          min-height: 100dvh;
          font-family: Outfit, "Segoe UI", sans-serif;
          color: #1c2430;
          background:
            radial-gradient(900px 420px at 50% -10%, rgba(198, 161, 91, 0.16), transparent 60%),
            linear-gradient(180deg, #07111d 0%, #0c1c31 42%, #081422 100%);
          padding: 28px 16px 72px;
        }
        .cc-serif { font-family: "Cormorant Garamond", Georgia, serif; }
        .cc-pages {
          display: flex;
          flex-direction: column;
          gap: 28px;
          width: min(210mm, 100%);
          margin: 0 auto;
        }
        .cc-page {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-height: 297mm;
          overflow: visible;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.55), transparent 90px),
            #f6f1e6;
          border: 1px solid rgba(198, 161, 91, 0.55);
          box-shadow: 0 30px 80px -36px rgba(0, 0, 0, 0.75);
          padding: 14mm 14mm 12mm;
        }
        .cc-page-body { flex: 1 0 auto; overflow: visible; }
        .cc-page-foot { margin-top: auto; padding-top: 16px; }
        .cc-page-foot p {
          margin: 10px 0 0;
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b6254;
        }
        .cc-rule {
          height: 1px;
          background: linear-gradient(90deg, transparent, #c6a15b 12%, #c6a15b 88%, transparent);
        }
        .cc-rule-double {
          height: 4px;
          border-top: 1px solid #c6a15b;
          border-bottom: 1px solid #c6a15b;
        }
        .cc-logo-plate {
          position: relative;
          display: grid;
          place-items: center;
          width: 168px;
          height: 96px;
          flex: 0 0 168px;
          background: #fff;
          border: 1px solid rgba(198, 161, 91, 0.65);
          box-shadow: inset 0 0 0 4px #f6f1e6;
          overflow: hidden;
        }
        .cc-logo-plate img {
          max-width: 150px;
          max-height: 82px;
          width: auto;
          height: auto;
          object-fit: contain;
        }
        .cc-logo-shimmer {
          width: 112px;
          height: 56px;
          position: absolute;
          background: linear-gradient(110deg, #efe6d2 8%, #f8f3e8 18%, #efe6d2 33%);
          background-size: 200% 100%;
          animation: cc-shimmer 1.1s linear infinite;
        }
        @keyframes cc-shimmer { to { background-position-x: -200%; } }
        .cc-cartouche {
          position: relative;
          margin-top: 18px;
          padding: 18px 18px 16px;
          text-align: center;
          color: #f4e7c8;
          background: linear-gradient(180deg, #143056 0%, #0b1c33 58%, #081628 100%);
          border: 1px solid #c6a15b;
          box-shadow: inset 0 0 0 1px rgba(198, 161, 91, 0.28);
        }
        .cc-cartouche::before {
          content: "";
          position: absolute;
          inset: 5px;
          border: 1px solid rgba(198, 161, 91, 0.42);
          pointer-events: none;
        }
        .cc-cartouche h1 {
          margin: 8px auto 0;
          max-width: 36rem;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-weight: 600;
          font-size: clamp(1.2rem, 2.2vw, 1.62rem);
          line-height: 1.18;
          letter-spacing: 0.035em;
          color: #f6e7c4;
        }
        .cc-kicker {
          margin: 0;
          font-size: 0.66rem;
          font-weight: 500;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #d4b56a;
        }
        .cc-ref {
          display: inline-block;
          margin: 12px 0 0;
          padding: 5px 12px;
          border: 1px solid rgba(212, 181, 106, 0.55);
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f6e7c4;
        }
        .cc-label {
          margin: 0;
          font-size: 0.66rem;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8c6a2f;
        }
        .cc-role {
          display: inline-block;
          margin-top: 10px;
          padding: 4px 10px;
          background: #0b1c33;
          color: #f6e7c4;
          font-size: 0.68rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .cc-parties { display: grid; gap: 12px; }
        @media (min-width: 760px) {
          .cc-parties { grid-template-columns: 1fr 1fr; }
        }
        .cc-party {
          background: rgba(255, 255, 255, 0.55);
          border: 1px solid rgba(11, 28, 51, 0.12);
          border-top: 3px solid #0b1c33;
          padding: 14px 14px 12px;
          box-shadow: inset 3px 0 0 #c6a15b;
        }
        .cc-runhead {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(198, 161, 91, 0.55);
        }
        .cc-runhead p {
          margin: 0;
          font-size: 0.72rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0b1c33;
        }
        .cc-runhead-logo { height: 36px; width: auto; object-fit: contain; }
        .cc-runhead-mark { font-size: 1.2rem; color: #0b1c33; }
        .cc-art { margin-top: 22px; overflow: visible; }
        .cc-art h2 {
          margin: 0 0 8px;
          font-size: 1.38rem;
          font-weight: 600;
          line-height: 1.15;
          color: #0b1c33;
        }
        .cc-art p, .cc-lead {
          margin: 0 0 8px;
          font-size: 0.9rem;
          line-height: 1.6;
          color: #243044;
        }
        .cc-art ol, .cc-art ul { margin: 0 0 8px; padding-left: 1.15rem; }
        .cc-art li { margin: 0 0 6px; font-size: 0.9rem; line-height: 1.55; color: #243044; }
        .cc-licence {
          margin-top: 22px;
          padding: 14px 14px 6px;
          background: linear-gradient(180deg, #fffaf0, rgba(255,255,255,0.72));
          border: 1px solid #c6a15b;
          box-shadow: inset 4px 0 0 #0b1c33;
        }
        .cc-licence h2 { color: #0b1c33; }
        .cc-table-wrap { overflow: visible; margin: 10px 0 12px; }
        .cc-table { width: 100%; border-collapse: collapse; font-size: 0.78rem; line-height: 1.4; }
        .cc-table th {
          background: #0b1c33;
          color: #f6e7c4;
          text-align: left;
          font-weight: 500;
          letter-spacing: 0.04em;
          padding: 7px 8px;
        }
        .cc-table td {
          padding: 7px 8px;
          border-bottom: 1px solid rgba(198, 161, 91, 0.4);
          vertical-align: top;
          color: #243044;
        }
        .cc-table tbody tr:nth-child(even) td { background: rgba(255,255,255,0.55); }
        .cc-table td:first-child { width: 2rem; font-weight: 600; color: #0b1c33; }
        .cc-sign-block { margin-top: auto; padding-top: 22px; overflow: visible; }
        .cc-signs { display: grid; gap: 14px; }
        @media (min-width: 760px) {
          .cc-signs { grid-template-columns: 1fr 1fr; }
        }
        .cc-sign-card {
          background: #fff;
          border: 1px solid #0b1c33;
          box-shadow: inset 0 0 0 1px rgba(198, 161, 91, 0.65);
          padding: 14px 14px 12px;
          min-height: 250px;
        }
        .cc-sign-card h3 { margin: 6px 0 0; font-size: 1.28rem; font-weight: 600; color: #0b1c33; }
        .cc-sign-role { margin: 4px 0 0; font-size: 0.82rem; color: #3d4a5c; }
        .cc-sign-mention {
          margin: 12px 0 8px;
          font-size: 0.86rem;
          font-style: italic;
          color: #0b1c33;
        }
        .cc-sign-field {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          margin: 8px 0 0;
          font-size: 0.78rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #6b6254;
        }
        .cc-blank {
          flex: 1;
          border-bottom: 1px solid #0b1c33;
          min-height: 1.1rem;
        }
        .cc-sign-area {
          margin-top: 8px;
          height: 72px;
          border: 1px dashed rgba(11, 28, 51, 0.35);
          background: repeating-linear-gradient(
            180deg,
            transparent,
            transparent 22px,
            rgba(11, 28, 51, 0.06) 23px
          );
        }
        .cc-print {
          display: flex;
          justify-content: flex-end;
          width: min(210mm, 100%);
          margin: 0 auto 14px;
        }
        .cc-print button {
          border: 1px solid rgba(198, 161, 91, 0.7);
          background: transparent;
          color: #f6e7c4;
          font: inherit;
          font-size: 0.78rem;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 8px 14px;
          cursor: pointer;
        }
        .cc-print button:hover { background: rgba(198, 161, 91, 0.14); }
        @media (max-width: 720px) {
          .cc-page { min-height: 0; padding: 18px 14px 20px; }
          .cc-entete { display: block !important; }
          .cc-logo-plate { margin-bottom: 14px; }
          .cc-ref { letter-spacing: 0.04em; font-size: 0.66rem; white-space: nowrap; }
          .cc-table { font-size: 0.74rem; }
        }
        @media print {
          .cc-desk { background: #fff !important; padding: 0 !important; }
          .cc-pages { gap: 0; width: auto; }
          .cc-page {
            min-height: 0;
            border: 0;
            box-shadow: none;
            break-after: page;
            page-break-after: always;
          }
          .cc-page:last-child { break-after: auto; page-break-after: auto; }
          .cc-print { display: none !important; }
          .cc-cartouche, .cc-role, .cc-party, .cc-table th, .cc-licence, .cc-sign-card {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="cc-print">
        <button type="button" onClick={() => window.print()}>
          Imprimer l&apos;acte
        </button>
      </div>

      <div className="cc-pages" id="contrat-catarina">
        <Feuille numero={1} logoSrc={logoSrc}>
          <header>
            <div className="cc-rule-double" aria-hidden="true" />
            <div className="cc-entete" style={{ display: "flex", gap: 22, alignItems: "center", padding: "16px 0 12px" }}>
              <div className="cc-logo-plate" aria-busy={!logoPret && !logoEpuise}>
                {logoEpuise ? (
                  <span className="cc-serif" style={{ color: "#0b1c33", fontSize: "1.35rem" }}>
                    EC
                  </span>
                ) : (
                  <img
                    id="logo-energia"
                    src={logoSrc ?? undefined}
                    alt="Logo officiel ENERGIA CONSEIL IA"
                    style={{ opacity: logoPret ? 1 : 0 }}
                    onLoad={() => setLogoPret(true)}
                    onError={() => {
                      setLogoPret(false);
                      setLogoIndex((index) => index + 1);
                    }}
                  />
                )}
                {!logoPret && !logoEpuise && <span className="cc-logo-shimmer" aria-hidden="true" />}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="cc-label">Société</p>
                <p className="cc-serif" style={{ margin: "2px 0 0", fontSize: "1.65rem", lineHeight: 1, color: "#0b1c33", fontWeight: 600 }}>
                  {SOCIETE.raison}
                </p>
                <p style={{ margin: "6px 0 0", fontSize: "0.86rem", color: "#3d4a5c" }}>{SOCIETE.forme}</p>
                <p style={{ margin: "8px 0 0", fontSize: "0.78rem", lineHeight: 1.5, color: "#243044" }}>
                  SIRET : {SOCIETE.siret}
                  <span style={{ color: "#c6a15b" }}> | </span>
                  {SOCIETE.rcs}
                  <span style={{ color: "#c6a15b" }}> | </span>
                  Code APE : {SOCIETE.ape}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "0.78rem", lineHeight: 1.5, color: "#243044" }}>
                  Siège social : {SOCIETE.siege}
                  <span style={{ color: "#c6a15b" }}> | </span>
                  <a href={`mailto:${SOCIETE.email}`} style={{ color: "#0b1c33" }}>
                    {SOCIETE.email}
                  </a>
                </p>
              </div>
            </div>
            <div className="cc-rule" aria-hidden="true" />
          </header>

          <div className="cc-cartouche" id="cartouche-titre">
            <p className="cc-kicker">Acte officiel · 2026</p>
            <h1>{TITRE}</h1>
            <p className="cc-ref">Réf : {REF}</p>
          </div>

          <section id="parties" aria-labelledby="parties-titre" style={{ marginTop: 22 }}>
            <p className="cc-label">Préambule</p>
            <h2 id="parties-titre" className="cc-serif" style={{ margin: "4px 0 8px", fontSize: "1.45rem", fontWeight: 600, color: "#0b1c33" }}>
              Les parties désignées
            </h2>
            <p className="cc-lead">Entre les soussignés, désignés ci-après :</p>
            <div className="cc-parties">
              <article className="cc-party">
                <p className="cc-label">D&apos;une part</p>
                <h3 className="cc-serif" style={{ margin: "6px 0 0", fontSize: "1.22rem", fontWeight: 600, color: "#0b1c33" }}>
                  {SOCIETE.raison}
                </h3>
                <p style={{ margin: "8px 0 0", fontSize: "0.84rem", lineHeight: 1.55, color: "#243044" }}>
                  La société {SOCIETE.raison}, {SOCIETE.forme}, dont le siège social est situé {SOCIETE.siege},
                  immatriculée sous le SIRET {SOCIETE.siret}, {SOCIETE.rcs}, code APE {SOCIETE.ape}, représentée par{" "}
                  <strong>Monsieur Sylvain LEMBELEMBE</strong>, en sa qualité de Président.
                </p>
                <span className="cc-role">Le Donneur d&apos;Ordre</span>
              </article>
              <article className="cc-party">
                <p className="cc-label">D&apos;autre part</p>
                <h3 className="cc-serif" style={{ margin: "6px 0 0", fontSize: "1.22rem", fontWeight: 600, color: "#0b1c33" }}>
                  Madame Catarina MARTINS
                </h3>
                <p style={{ margin: "8px 0 0", fontSize: "0.84rem", lineHeight: 1.55, color: "#243044" }}>
                  Exerçant sous le statut d&apos;entreprise individuelle, sous l&apos;enseigne « Maison Martins · Édition Privée »,
                  immatriculée au registre spécial des agents commerciaux de Dijon sous le numéro 819 244 328, demeurant à
                  71150 Chagny, joignable à l&apos;adresse{" "}
                  <a href="mailto:contact@catarinamartins-immobilier.fr" style={{ color: "#0b1c33" }}>
                    contact@catarinamartins-immobilier.fr
                  </a>
                  .
                </p>
                <span className="cc-role">La Prestataire Indépendante</span>
              </article>
            </div>
            <p className="cc-lead" style={{ marginTop: 12, fontStyle: "italic" }}>
              Ci-après dénommées ensemble « les Parties », et individuellement « la Partie ». Le Donneur d&apos;Ordre et la
              Prestataire Indépendante déclarent avoir la capacité juridique requise pour conclure le présent contrat cadre.
              Les Parties ont convenu ce qui suit.
            </p>
          </section>

          <Article id="article-1" titre="Article 1 — Objet du contrat">
            <p>
              Le présent contrat cadre a pour objet de définir les conditions dans lesquelles la Prestataire réalise, pour le
              compte du Donneur d&apos;Ordre, des missions de prospection, de relevés techniques sur site et de coordination de
              projets de rénovation énergétique.
            </p>
            <p>Au titre de la prospection, la Prestataire identifie des propriétaires ou des porteurs de projet, présente l&apos;offre du Donneur d&apos;Ordre et transmet les contacts qui acceptent d&apos;être mis en relation.</p>
            <p>Au titre des relevés, la Prestataire se rend sur place, recueille les photographies et les métrés prévus à l&apos;article 3, et les remet au Donneur d&apos;Ordre sous une forme exploitable.</p>
            <p>Au titre de la coordination, la Prestataire facilite le suivi du dossier qu&apos;elle a apporté, jusqu&apos;au procès-verbal de réception, sans se substituer au Donneur d&apos;Ordre dans la direction du chantier.</p>
            <p>
              La Prestataire ne signe aucun devis au nom du Donneur d&apos;Ordre, n&apos;engage pas la société, n&apos;encaisse aucun fonds
              pour son compte et ne garantit ni une aide, ni une économie d&apos;énergie, ni un financement, ni un gain de classe
              au diagnostic de performance énergétique.
            </p>
          </Article>
        </Feuille>

        <Feuille numero={2} logoSrc={logoSrc}>
          <Article id="article-2" titre="Article 2 — Périmètre territorial">
            <p>
              Les missions de prospection, de relevés et de coordination s&apos;exercent exclusivement dans les quatre départements
              suivants : la Saône-et-Loire (71), la Côte-d&apos;Or (21), le Rhône (69) et l&apos;Ain (01).
            </p>
            <p>
              Aucune mission n&apos;est confiée hors de ces quatre départements sans avenant écrit signé par les deux Parties.
              Le présent article ne vaut pas autorisation d&apos;usage de la marque. Cet usage demeure limité à la Saône-et-Loire
              et à la Côte-d&apos;Or, dans les conditions de l&apos;article 6.
            </p>
          </Article>

          <Article id="article-3" titre="Article 3 — Missions">
            <p>
              Pour chaque dossier, la Prestataire constitue un relevé complet. Ce relevé comprend les dix photographies
              énumérées ci-dessous, les métrés, et les éléments permettant d&apos;établir ensuite un procès-verbal de réception
              sans réserve. Les dix photographies sont obligatoires au titre du présent contrat. Elles servent la constitution
              du dossier d&apos;aides, notamment auprès de l&apos;Agence nationale de l&apos;habitat, et la traçabilité du chantier en cas de
              contrôle, y compris un contrôle conduit par un organisme accrédité par le Comité français d&apos;accréditation.
            </p>
            <div className="cc-table-wrap">
              <table className="cc-table">
                <caption className="cc-label" style={{ captionSide: "top", textAlign: "left", paddingBottom: 8 }}>
                  Dix photographies obligatoires
                </caption>
                <thead>
                  <tr>
                    <th scope="col">N°</th>
                    <th scope="col">Cliché</th>
                    <th scope="col">Objet</th>
                  </tr>
                </thead>
                <tbody>
                  {PHOTOS.map(([numero, cliche, objet]) => (
                    <tr key={numero}>
                      <td>{numero}</td>
                      <td>{cliche}</td>
                      <td>{objet}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              Chaque photographie est datée, nette, et rattachée au dossier concerné. Une photographie illisible, tronquée ou
              étrangère au bien est réputée non remise. La photographie de l&apos;avis d&apos;imposition n&apos;est utilisée que pour l&apos;étude
              d&apos;éligibilité et demeure couverte par l&apos;article 8.
            </p>
            <p>
              Les métrés accompagnent les photographies. La Prestataire relève, pour chaque bien, la surface habitable ou
              utile, les surfaces de murs, de combles et de planchers concernés par le projet, le nombre et les dimensions
              des menuiseries, ainsi que le type, l&apos;énergie et la puissance apparente du chauffage existant. Elle relève
              aussi toute cote que le Donneur d&apos;Ordre demande par écrit avant la visite. Les métrés sont transmis avec les
              photographies, avant qu&apos;un devis ne soit présenté au client comme définitif.
            </p>
            <p>
              La coordination de la Prestataire se poursuit jusqu&apos;au procès-verbal de réception sans réserve. Ce procès-verbal
              constate l&apos;achèvement des travaux du dossier et l&apos;absence de réserve. Tant qu&apos;une réserve demeure, le
              procès-verbal n&apos;est pas un procès-verbal sans réserve au sens de l&apos;article 4.
            </p>
          </Article>

          <Article id="article-4" titre="Article 4 — Rémunération">
            <p>En contrepartie des missions acceptées, la Prestataire perçoit exclusivement les deux rémunérations suivantes.</p>
            <ol>
              <li>
                Un forfait de coordination de mille cinq cents euros hors taxes (1 500 € hors taxes) par dossier. Ce forfait
                est versé lorsque l&apos;acompte du client est effectivement crédité sur le compte du Donneur d&apos;Ordre. La seule
                signature d&apos;un devis ne rend pas le forfait exigible.
              </li>
              <li>
                Une commission égale à dix pour cent (10 %) du montant hors taxes des travaux du dossier. Cette commission est
                versée lorsque le procès-verbal de réception sans réserve est signé. Elle n&apos;est pas due si des réserves
                subsistent, si les travaux ne sont pas réalisés, ou si les sommes correspondantes ne sont pas encaissées.
              </li>
            </ol>
            <p>
              Chaque somme est payée par virement, sur facture conforme de la Prestataire, dans les sept jours calendaires
              suivant la réunion du fait générateur et de la réception de la facture. La taxe sur la valeur ajoutée, si elle
              est due au regard du statut de la Prestataire, s&apos;ajoute au montant hors taxes. Aucun autre honoraire, frais ou
              avantage n&apos;est dû sans accord écrit distinct.
            </p>
          </Article>
        </Feuille>

        <Feuille numero={3} logoSrc={logoSrc}>
          <Article id="article-5" titre="Article 5 — Indépendance juridique">
            <p>
              La Prestataire exerce son activité en toute indépendance. Le présent contrat ne crée aucun lien de subordination
              entre elle et le Donneur d&apos;Ordre.
            </p>
            <p>
              La Prestataire n&apos;est pas salariée du Donneur d&apos;Ordre. Elle n&apos;est pas associée. Elle n&apos;est pas mandataire social.
              Elle n&apos;est pas placée sous un pouvoir disciplinaire. Elle organise elle-même ses journées, ses déplacements et
              ses moyens. Le Donneur d&apos;Ordre peut définir le résultat attendu d&apos;un dossier. Il ne dirige pas l&apos;exécution
              quotidienne du travail.
            </p>
            <p>
              La Prestataire établit ses propres factures. Elle assume seule ses obligations fiscales, sociales et
              professionnelles, notamment son immatriculation, ses assurances et ses déclarations. Elle ne représente le
              Donneur d&apos;Ordre qu&apos;à l&apos;intérieur des missions écrites au présent contrat.
            </p>
            <p>
              La réalité de la relation doit demeurer conforme à cette indépendance. Le contrat ne constitue ni un contrat de
              travail, ni une société créée de fait, ni un mandat social. La Prestataire peut servir d&apos;autres clients, dès
              lors qu&apos;elle respecte la licence de marque et l&apos;obligation de non-détournement.
            </p>
          </Article>

          <Article
            id="article-6"
            licence
            titre="Article 6 — Concession de licence d'exploitation de marque INPI n° 5213845"
          >
            <p>
              Le Donneur d&apos;Ordre est titulaire de la marque déposée à l&apos;Institut national de la propriété industrielle sous le
              numéro 5213845, « ENERGIA CONSEIL IA », ainsi que des signes distinctifs qui l&apos;accompagnent, notamment ses logos
              et ses chartes graphiques. L&apos;ensemble est désigné « la Marque ».
            </p>
            <p>
              Le Donneur d&apos;Ordre concède à la Prestataire, à titre personnel, non exclusif et strictement révocable, le droit
              d&apos;utiliser la Marque et ses signes distinctifs sur ses supports professionnels : cartes, flyers, courriels et
              réseaux sociaux.
            </p>
            <p>
              Cet usage est strictement limité à l&apos;exercice de ses missions de prospection, de relevés et de coordination en
              Saône-et-Loire (71) et en Côte-d&apos;Or (21). Tout usage hors de ces deux départements est interdit, y compris dans
              le Rhône et dans l&apos;Ain, sauf autorisation écrite, préalable et particulière du Donneur d&apos;Ordre. Le périmètre des
              missions fixé à l&apos;article 2 n&apos;élargit pas la présente licence.
            </p>
            <p>
              Il est fait interdiction absolue à la Prestataire de céder cette licence, de la sous-licencier, de modifier la
              Marque ou ses signes distinctifs, et de déposer, en France ou à l&apos;étranger, toute marque identique, similaire ou
              de nature à créer une confusion. Elle ne crée aucun nom de domaine, aucune page et aucune dénomination
              comportant « ENERGIA » ou « ENERGIA CONSEIL » sans l&apos;accord écrit du Donneur d&apos;Ordre.
            </p>
            <p>
              La Marque demeure la propriété exclusive du Donneur d&apos;Ordre. La concession ne transfère aucun droit de
              propriété. La Prestataire ne présente pas la Marque comme la sienne.
            </p>
            <p>
              En cas de résiliation du présent contrat pour quelque cause que ce soit, y compris l&apos;arrivée du terme, la
              résolution, la rupture pour manquement ou l&apos;accord des Parties, cette licence de marque prend fin immédiatement,
              de plein droit, sans préavis et sans indemnité. La Prestataire cesse alors tout usage de la Marque, retire les
              signes distinctifs de tous ses supports, y compris les supports numériques et les réseaux sociaux, et confirme
              cette cessation par écrit dans les huit jours. Le Donneur d&apos;Ordre peut exiger la restitution ou la destruction
              des supports physiques qui portent la Marque.
            </p>
          </Article>

          <Article id="article-7" titre="Article 7 — Condition résolutoire">
            <p>
              Pour chaque dossier, le forfait de coordination et la commission prévus à l&apos;article 4 sont convenus sous la
              condition résolutoire suivante : la remise des dix photographies obligatoires, complètes, datées et exploitables,
              et la conformité technique du relevé, constatée par écrit par Monsieur Sylvain LEMBELEMBE.
            </p>
            <p>
              Si l&apos;une de ces deux exigences fait défaut quinze jours après une mise en demeure écrite restée sans effet, la
              rémunération attachée à ce dossier est résolue de plein droit, sans indemnité. Les sommes déjà versées sans
              cause sont restituées dans les quinze jours. Cette résolution vise le dossier concerné. Elle ne met fin au
              contrat cadre que si le Donneur d&apos;Ordre prononce en outre la résiliation prévue à l&apos;article 9, notamment en cas
              de manquement répété.
            </p>
          </Article>
        </Feuille>

        <Feuille numero={4} logoSrc={logoSrc}>
          <Article id="article-8" titre="Article 8 — Confidentialité et non-détournement">
            <p>
              La Prestataire garde confidentiels, pendant toute la durée du contrat et pendant vingt-quatre mois après sa fin,
              les noms des clients et des prospects, les prix, les méthodes, les marges, le réseau d&apos;artisans, les documents
              techniques et toute information qui n&apos;est pas déjà publique et dont elle a connaissance à l&apos;occasion des missions.
            </p>
            <p>
              Elle ne les utilise que pour l&apos;exécution du présent contrat. Elle ne les communique pas à un tiers, sauf
              obligation légale ou accord écrit du Donneur d&apos;Ordre. Cette obligation survit à la fin du contrat pendant le
              délai de vingt-quatre mois.
            </p>
            <p>
              Pendant le contrat et pendant vingt-quatre mois après sa cessation, pour quelque cause que ce soit, la
              Prestataire s&apos;interdit de détourner, pour son propre compte ou pour celui d&apos;un tiers, les clients et les
              prospects présentés dans le cadre du contrat, ainsi que les artisans du réseau du Donneur d&apos;Ordre avec lesquels
              elle a été mise en relation pour ces missions, dès lors que ce détournement concerne une activité de
              coordination de rénovation concurrente.
            </p>
            <p>
              Cette interdiction ne prive pas la Prestataire de son activité immobilière sous l&apos;enseigne Maison Martins, lorsque
              cette activité ne détourne pas les missions de rénovation confiées par le présent contrat. Tout manquement
              engage la responsabilité de la Prestataire à hauteur du préjudice subi par le Donneur d&apos;Ordre.
            </p>
          </Article>

          <Article id="article-9" titre="Article 9 — Durée, résiliation et tribunal compétent">
            <p>
              Le présent contrat prend effet le 28 septembre 2026. Il est conclu pour une durée initiale de douze mois, soit
              jusqu&apos;au 27 septembre 2027 à minuit. Il ne se renouvelle que par un écrit signé des deux Parties.
            </p>
            <p>
              Chaque Partie peut résilier le contrat avant son terme, par lettre recommandée avec demande d&apos;avis de réception
              ou par courriel avec accusé de réception, en respectant un préavis de trente jours calendaires.
            </p>
            <p>
              Le Donneur d&apos;Ordre peut résilier le contrat sans préavis en cas de manquement grave, après une mise en demeure
              restée infructueuse pendant huit jours, ou immédiatement si le manquement ne peut être réparé. Constituent
              notamment un manquement grave l&apos;usage de la Marque hors de la licence, la cession ou la sous-licence de cette
              marque, le dépôt d&apos;une marque similaire, et le détournement d&apos;un client ou d&apos;un prospect.
            </p>
            <p>
              À la fin du contrat, la licence de l&apos;article 6 cesse immédiatement. Les rémunérations déjà exigibles au titre de
              l&apos;article 4, pour les dossiers dont le fait générateur est survenu avant la fin, demeurent dues. Aucune
              rémunération n&apos;est due pour une mission engagée après la date d&apos;effet de la résiliation.
            </p>
            <p>
              Le contrat est soumis au droit français. Les Parties cherchent d&apos;abord une solution amiable dans les quinze jours
              de la notification écrite du différend. À défaut d&apos;accord, le Tribunal de commerce de Lyon est seul compétent,
              y compris en référé et nonobstant pluralité de défendeurs ou appel en garantie.
            </p>
          </Article>

          <section className="cc-sign-block" id="signatures" aria-labelledby="signatures-titre">
            <p className="cc-label">Clôture</p>
            <h2 id="signatures-titre" className="cc-serif" style={{ margin: "4px 0 8px", fontSize: "1.45rem", color: "#0b1c33" }}>
              Signatures
            </h2>
            <p className="cc-lead">
              Fait en deux exemplaires originaux, dont un pour chaque Partie. Chaque signataire porte la mention manuscrite
              « Lu et approuvé, bon pour accord », la date, son paraphe et sa signature.
            </p>
            <p className="cc-lead">Fait à ________________________________, le ________________________________.</p>
            <div className="cc-signs">
              <CartoucheSignature
                partie="Le Donneur d'Ordre"
                nom="Sylvain LEMBELEMBE"
                qualite="Président — ENERGIA CONSEIL IA"
              />
              <CartoucheSignature
                partie="La Prestataire Indépendante"
                nom="Catarina MARTINS"
                qualite="Maison Martins · Édition Privée"
              />
            </div>
          </section>
        </Feuille>
      </div>
    </div>
  );
}
