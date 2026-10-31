import { useEffect, type ReactNode } from "react";

const REF = "EC-CTR-2026-CATARINA-01";
const TOTAL_PAGES = 3;
const LOGO_ENERGIA = "/assets/energia-logo-arbres.png";
const LOGO_MAISON = "/assets/maison-martins/logo-maison-martins.jpg";

/**
 * Ancres Yousign (texte blanc, conservé dans le calque PDF).
 * Signataire 1 : Sylvain LEMBELEMBE. Signataire 2 : Catarina MARTINS.
 * Mention à paramétrer dans Yousign : « Bon pour accord ».
 */
function Ancre({ valeur }: { valeur: string }) {
  return (
    <span className="mm-ancre" aria-hidden="true">
      {valeur}
    </span>
  );
}

function Filet() {
  return <div className="mm-filet" aria-hidden="true" />;
}

function Pied({ numero }: { numero: number }) {
  return (
    <footer className="mm-foot">
      <div className="mm-paraphes">
        <div className="mm-paraphe">
          <span>Paraphe ENERGIA</span>
          <div className="mm-paraphe-zone">
            <Ancre valeur={`{{s1|signature|85|37}}`} />
          </div>
        </div>
        <div className="mm-paraphe">
          <span>Paraphe MARTINS</span>
          <div className="mm-paraphe-zone">
            <Ancre valeur={`{{s2|signature|85|37}}`} />
          </div>
        </div>
      </div>
      <Filet />
      <p>
        MAISON MARTINS · ÉDITION PRIVÉE · {REF} · Page {numero} sur {TOTAL_PAGES} · Chaque page est paraphée par les deux Parties
      </p>
    </footer>
  );
}

function Page({ numero, children }: { numero: number; children: ReactNode }) {
  return (
    <section className="mm-page" aria-label={`Page ${numero} sur ${TOTAL_PAGES}`}>
      <div className="mm-page-body">{children}</div>
      <Pied numero={numero} />
    </section>
  );
}

function TeteCourante() {
  return (
    <header className="mm-runhead">
      <img src={LOGO_ENERGIA} alt="" className="mm-run-logo" />
      <p>
        ENERGIA CONSEIL IA®
        <span> · </span>
        {REF}
      </p>
      <img src={LOGO_MAISON} alt="" className="mm-run-blason" />
    </header>
  );
}

function Article({ numero, titre, children }: { numero: string; titre: string; children: ReactNode }) {
  return (
    <section className="mm-art" aria-labelledby={`art-${numero}`}>
      <h2 id={`art-${numero}`}>
        <span>Article {numero}</span>
        {titre}
      </h2>
      {children}
    </section>
  );
}

function CartoucheSignature({
  pour,
  nom,
  qualite,
  ancreMention,
  ancreSignature,
}: {
  pour: string;
  nom: string;
  qualite: string;
  ancreMention: string;
  ancreSignature: string;
}) {
  return (
    <article className="mm-sign">
      <p className="mm-kicker">{pour}</p>
      <h3>{nom}</h3>
      <p className="mm-role">{qualite}</p>
      <p className="mm-mention-label">Mention manuscrite « Bon pour accord »</p>
      <div className="mm-mention-zone">
        <Ancre valeur={ancreMention} />
      </div>
      <p className="mm-mention-label">Signature électronique / manuscrite</p>
      <div className="mm-sign-zone">
        <Ancre valeur={ancreSignature} />
      </div>
    </article>
  );
}

export default function MaisonMartinsContract() {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${REF} — Convention cadre Maison Martins | ENERGIA CONSEIL IA`;

    const fontId = "convention-maison-martins-fonts";
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
    <div className="mm-desk">
      <style>{`
        .mm-desk, .mm-desk *, .mm-desk *::before, .mm-desk *::after { box-sizing: border-box; }
        .mm-desk {
          min-height: 100dvh;
          font-family: Outfit, "Segoe UI", sans-serif;
          color: #243044;
          background:
            radial-gradient(900px 420px at 50% -10%, rgba(212, 175, 55, 0.16), transparent 60%),
            linear-gradient(180deg, #070b12 0%, #101820 48%, #070b12 100%);
          padding: 28px 16px 72px;
        }
        .mm-serif { font-family: "Cormorant Garamond", Georgia, serif; }
        .mm-tools {
          width: min(210mm, 100%);
          margin: 0 auto 14px;
          display: flex;
          gap: 16px;
          align-items: flex-start;
          justify-content: space-between;
        }
        .mm-note {
          margin: 0;
          max-width: 42rem;
          color: #f6e7c4;
          font-size: 0.78rem;
          line-height: 1.45;
        }
        .mm-note strong { color: #fff; font-weight: 600; }
        .mm-tools button {
          flex: 0 0 auto;
          border: 1px solid rgba(212, 175, 55, 0.75);
          background: transparent;
          color: #f6e7c4;
          font: inherit;
          font-size: 0.72rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 10px 14px;
          cursor: pointer;
        }
        .mm-tools button:hover { background: rgba(212, 175, 55, 0.14); }
        .mm-doc {
          display: flex;
          flex-direction: column;
          gap: 28px;
          width: min(210mm, 100%);
          margin: 0 auto;
        }
        .mm-page {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-height: 297mm;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.45), transparent 80px),
            #f7f1e6;
          border: 1px solid rgba(212, 175, 55, 0.55);
          box-shadow: 0 30px 80px -36px rgba(0, 0, 0, 0.75);
          padding: 11mm 13mm 9mm;
        }
        .mm-page-body { flex: 1 0 auto; }
        .mm-filet {
          height: 1px;
          background: linear-gradient(90deg, transparent, #c6a15b 10%, #c6a15b 90%, transparent);
        }
        .mm-mast {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-bottom: 8px;
        }
        .mm-logo-energia {
          width: 108px;
          height: 48px;
          object-fit: contain;
          background: #fff;
          padding: 4px 6px;
          border: 1px solid rgba(198, 161, 91, 0.45);
        }
        .mm-blason {
          width: 72px;
          height: 72px;
          object-fit: cover;
          background: #000;
          border: 1px solid rgba(212, 175, 55, 0.7);
        }
        .mm-cartouche {
          margin: 8px 0 10px;
          padding: 12px 16px 11px;
          text-align: center;
          color: #f6e7c4;
          background: linear-gradient(180deg, #143056 0%, #0b1c33 62%, #081628 100%);
          border: 1px solid #c6a15b;
        }
        .mm-cartouche p {
          margin: 0;
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #d4b56a;
        }
        .mm-cartouche h1 {
          margin: 6px auto 0;
          max-width: 38rem;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-weight: 600;
          font-size: 1.28rem;
          line-height: 1.15;
          letter-spacing: 0.03em;
          color: #f6e7c4;
        }
        .mm-ref {
          display: inline-block;
          margin-top: 8px;
          padding: 3px 10px;
          border: 1px solid rgba(212, 181, 106, 0.55);
          font-family: Outfit, "Segoe UI", sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #f6e7c4;
        }
        .mm-lieu {
          margin: 0 0 8px;
          text-align: center;
          font-size: 0.78rem;
          letter-spacing: 0.02em;
          color: #3d4a5c;
        }
        .mm-kicker {
          margin: 0 0 4px;
          font-size: 0.62rem;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #8c6a2f;
        }
        .mm-partie {
          margin: 0 0 7px;
          padding: 7px 10px 6px;
          background: rgba(255, 255, 255, 0.55);
          border-top: 2px solid #0b1c33;
          box-shadow: inset 3px 0 0 #c6a15b;
        }
        .mm-partie h2 {
          margin: 0 0 3px;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 1.12rem;
          font-weight: 600;
          line-height: 1.15;
          color: #0b1c33;
        }
        .mm-partie p, .mm-preambule p, .mm-art p, .mm-art li {
          margin: 0 0 3px;
          font-size: 0.78rem;
          line-height: 1.42;
          color: #243044;
        }
        .mm-partie p:last-child, .mm-art p:last-child, .mm-art li:last-child { margin-bottom: 0; }
        .mm-et {
          margin: 0 0 7px;
          text-align: center;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 1rem;
          letter-spacing: 0.18em;
          color: #0b1c33;
        }
        .mm-preambule { margin-top: 2px; }
        .mm-preambule h2, .mm-signes > .mm-kicker {
          margin: 0 0 4px;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 1.15rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0b1c33;
        }
        .mm-preambule ul, .mm-art ul, .mm-art ol {
          margin: 2px 0 0;
          padding-left: 1.05rem;
        }
        .mm-preambule li {
          margin: 0 0 3px;
          font-size: 0.78rem;
          line-height: 1.42;
        }
        .mm-runhead {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 8px;
          padding-bottom: 6px;
          border-bottom: 1px solid rgba(198, 161, 91, 0.55);
        }
        .mm-runhead p {
          flex: 1;
          margin: 0;
          font-size: 0.66rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #0b1c33;
        }
        .mm-run-logo { height: 28px; width: auto; object-fit: contain; background: #fff; }
        .mm-run-blason { width: 28px; height: 28px; object-fit: cover; background: #000; }
        .mm-art { margin-top: 9px; }
        .mm-art h2 {
          margin: 0 0 3px;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 1.08rem;
          font-weight: 600;
          line-height: 1.15;
          color: #0b1c33;
        }
        .mm-art h2 span {
          display: block;
          font-family: Outfit, "Segoe UI", sans-serif;
          font-size: 0.6rem;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #8c6a2f;
        }
        .mm-art ul { margin-top: 3px; }
        .mm-art li { margin: 0 0 2px; }
        .mm-sous {
          margin: 5px 0 2px !important;
          font-weight: 600;
          color: #0b1c33 !important;
        }
        .mm-signes { margin-top: 12px; }
        .mm-signes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 6px;
        }
        .mm-sign {
          background: #fff;
          border: 1px solid #0b1c33;
          box-shadow: inset 0 0 0 1px rgba(198, 161, 91, 0.65);
          padding: 8px 10px 10px;
          min-height: 78mm;
        }
        .mm-sign h3 {
          margin: 2px 0 0;
          font-family: "Cormorant Garamond", Georgia, serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: #0b1c33;
        }
        .mm-role { margin: 1px 0 6px !important; font-size: 0.74rem !important; color: #3d4a5c; }
        .mm-mention-label {
          margin: 6px 0 2px !important;
          font-size: 0.66rem !important;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #6b6254 !important;
        }
        .mm-mention-zone, .mm-sign-zone, .mm-paraphe-zone {
          position: relative;
          background: #fff;
          border: 1px dashed rgba(11, 28, 51, 0.35);
        }
        .mm-mention-zone { min-height: 12mm; }
        .mm-sign-zone { min-height: 24mm; }
        .mm-ancre {
          color: #fff;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 11px;
          line-height: 1;
          letter-spacing: 0;
        }
        .mm-foot { margin-top: auto; padding-top: 8px; }
        .mm-paraphes {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-bottom: 6px;
        }
        .mm-paraphe {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.58rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b6254;
        }
        .mm-paraphe-zone { width: 28mm; height: 10mm; }
        .mm-foot p {
          margin: 5px 0 0;
          font-size: 0.58rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #6b6254;
        }
        @page { size: A4 portrait; margin: 0; }
        @media print {
          .mm-desk { background: #fff !important; padding: 0 !important; }
          .mm-tools { display: none !important; }
          .mm-doc { gap: 0; width: auto; }
          .mm-page {
            min-height: 297mm;
            height: 297mm;
            border: 0;
            box-shadow: none;
            break-after: page;
            page-break-after: always;
            overflow: hidden;
          }
          .mm-page:last-child { break-after: auto; page-break-after: auto; }
          .mm-cartouche, .mm-partie, .mm-sign, .mm-logo-energia, .mm-blason, .mm-run-logo, .mm-run-blason {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .mm-ancre { color: #fff !important; }
        }
      `}</style>

      <div className="mm-tools">
        <p className="mm-note">
          <strong>Export PDF.</strong> Imprimer, puis « Enregistrer au format PDF », format A4, marges aucune, graphiques d’arrière-plan activés.
          Yousign : signataire 1 = Sylvain LEMBELEMBE, signataire 2 = Catarina MARTINS. Régler la mention sur « Bon pour accord ».
          Les ancres sont déjà dans les cartouches et les paraphes.
          <strong> Texte source incomplet :</strong> les attributions d’ENERGIA à l’article 2, ainsi que les articles 3 et 4, n’étaient pas dans le texte collé. Ils n’ont pas été rédigés à leur place. La numérotation d’origine est conservée.
        </p>
        <button type="button" onClick={() => window.print()}>
          Enregistrer en PDF
        </button>
      </div>

      <article className="mm-doc" id="convention-maison-martins">
        <Page numero={1}>
          <header className="mm-mast">
            <img className="mm-logo-energia" src={LOGO_ENERGIA} alt="ENERGIA CONSEIL IA" />
            <img className="mm-blason" src={LOGO_MAISON} alt="Maison Martins · Édition Privée" />
          </header>
          <Filet />
          <div className="mm-cartouche">
            <p>Convention cadre</p>
            <h1>
              Convention cadre de partenariat stratégique, d’apport d’affaires et de concession de marque
            </h1>
            <span className="mm-ref">Référence {REF}</span>
          </div>
          <p className="mm-lieu">
            Fait à Chalon-sur-Saône, le mardi 10 novembre 2026, en deux (2) exemplaires originaux.
          </p>

          <p className="mm-kicker">Entre les soussignés</p>

          <section className="mm-partie">
            <h2>1. La société ENERGIA CONSEIL IA®</h2>
            <p>
              Société par Actions Simplifiée Unipersonnelle (SASU) au capital de 100 €, immatriculée au Registre du Commerce et des Sociétés de Lyon sous le numéro 941 819 427 R.C.S. Lyon, numéro SIRET : 941 819 427 00019 — n° TVA intracommunautaire : FR01941819427, marque déposée à l’INPI sous le numéro 5213845, titulaire de la qualification de Référent Technique Rénovation Globale Certibat / Réno-Perf (évaluation QCM : 28/30), dont le siège social est situé au 16 Rue Cuvier, 69006 Lyon, représentée légalement par son Président-Fondateur, Monsieur Sylvain LEMBELEMBE.
            </p>
            <p>
              Ci-après dénommée « ENERGIA CONSEIL IA® » ou « Le Contractant Général », d’une part.
            </p>
          </section>

          <p className="mm-et">ET</p>

          <section className="mm-partie">
            <h2>2. Madame Catarina MARTINS</h2>
            <p>
              Conseillère Immobilière Indépendante &amp; Designer d’Espaces, exerçant sous statut d’Entreprise Individuelle (EI), immatriculée au Registre Spécial des Agents Commerciaux (RSAC) de Dijon sous le numéro 819 244 328, domiciliée professionnellement en région Bourgogne-Franche-Comté.
            </p>
            <p>
              Ci-après dénommée « Catarina MARTINS » ou « La Directrice Artistique », d’autre part.
            </p>
          </section>

          <p className="mm-lieu" style={{ marginTop: 8 }}>
            Les Parties étant ci-après individuellement désignées « La Partie » et conjointement désignées « Les Parties ».
          </p>

          <section className="mm-preambule">
            <h2>Préambule</h2>
            <p>Considérant que :</p>
            <ul>
              <li>
                Madame Catarina MARTINS bénéficie d’une réputation reconnue dans la transaction immobilière, la valorisation d’actifs de caractère et la mise en scène d’intérieurs en Bourgogne ;
              </li>
              <li>
                la société ENERGIA CONSEIL IA®, dirigée par Sylvain LEMBELEMBE, dispose d’une expertise certifiée en ingénierie thermique, audit énergétique réglementaire, optimisation des subventions publiques (Anah / MaPrimeRénov’), centrale d’achats de mobilier d’exception en direct usine et maîtrise d’œuvre en Contractant Général avec garantie décennale ;
              </li>
              <li>
                les Parties ont convenu d’unir leurs forces au sein d’une alliance stratégique exclusive dénommée « MAISON MARTINS · ÉDITION PRIVÉE », triptyque intégrant transaction immobilière de prestige, architecture d’intérieur et rénovation clé en main.
              </li>
            </ul>
          </section>
        </Page>

        <Page numero={2}>
          <TeteCourante />
          <Article numero="1" titre="Objet du contrat">
            <p>
              La présente convention a pour objet de fixer les conditions juridiques, opérationnelles et financières du partenariat liant les Parties, comprenant :
            </p>
            <ol>
              <li>l’apport d’affaires réciproque sur les projets immobiliers et chantiers de rénovation ;</li>
              <li>
                la concession d’exploitation de la marque « MAISON MARTINS · ÉDITION PRIVÉE » et son dépôt officiel à l’INPI ;
              </li>
              <li>le déploiement de l’offre commune d’arbitrage patrimonial dénommée « Consultation Duo Privée ».</li>
            </ol>
          </Article>

          <Article numero="2" titre="Répartition opérationnelle des rôles">
            <p>Les Parties conviennent d’une stricte séparation des compétences.</p>
            <p className="mm-sous">Attributions de Catarina MARTINS (Direction Artistique &amp; Transaction)</p>
            <ul>
              <li>Prospection, captation et négociation des mandats de vente immobilière de prestige ;</li>
              <li>Direction artistique esthétique, agencement d’ambiances et choix des finitions décoratives ;</li>
              <li>Accueil des acquéreurs et présentation des opportunités de rénovation intégrée.</li>
            </ul>
          </Article>

          <Article numero="5" titre="Exclusivité territoriale et non-détournement">
            <p>
              <strong>Exclusivité réciproque.</strong> Les Parties s’accordent une exclusivité de partenariat sur les départements de Saône-et-Loire (71) et de Côte-d’Or (21) pour toute opération combinant immobilier de prestige et rénovation globale.
            </p>
            <p>
              <strong>Clause de non-détournement (24 mois).</strong> Chacune des Parties s’interdit formellement de démarcher directement, détourner ou contracter avec un client, artisan ou partenaire présenté par l’autre Partie pendant toute la durée de la convention et pour une période de vingt-quatre (24) mois suivant sa cessation.
            </p>
          </Article>

          <Article numero="6" titre="Assurances et garanties légales">
            <p>
              La société ENERGIA CONSEIL IA® déclare et garantit être titulaire d’un contrat d’assurance Responsabilité Civile Professionnelle et d’une garantie décennale en cours de validité couvrant l’ensemble de ses activités de Contractant Général.
            </p>
            <p>
              Madame Catarina MARTINS est expressément déchargée de toute responsabilité civile ou pénale relative à l’exécution technique des chantiers et à la sûreté des ouvriers.
            </p>
          </Article>
        </Page>

        <Page numero={3}>
          <TeteCourante />
          <Article numero="7" titre="Entrée en vigueur et durée">
            <p>
              La présente convention entre en vigueur à compter de sa signature le 10 novembre 2026 pour une durée initiale d’un (1) an, renouvelable par tacite reconduction par périodes annuelles successives.
            </p>
          </Article>

          <Article numero="8" titre="Loi applicable et juridiction compétente">
            <p>
              La présente convention est soumise au droit français. Tout litige relatif à sa validité, son interprétation ou son exécution sera soumis, à défaut de résolution amiable sous 30 jours, à la compétence exclusive du Tribunal de Commerce de Lyon.
            </p>
          </Article>

          <section className="mm-signes">
            <p className="mm-kicker">Signatures officielles et mentions manuscrites</p>
            <p>
              Chaque page doit être paraphée par les deux Parties. La mention manuscrite « Bon pour accord » précède la signature.
            </p>
            <div className="mm-signes-grid">
              <CartoucheSignature
                pour="Pour ENERGIA CONSEIL IA®"
                nom="Monsieur Sylvain LEMBELEMBE"
                qualite="Président & Fondateur"
                ancreMention="{{s1|mention|180|40}}"
                ancreSignature="{{s1|signature|200|80}}"
              />
              <CartoucheSignature
                pour="Pour Madame Catarina MARTINS"
                nom="Madame Catarina MARTINS"
                qualite="Directrice Artistique & Conseillère Immobilière"
                ancreMention="{{s2|mention|180|40}}"
                ancreSignature="{{s2|signature|200|80}}"
              />
            </div>
          </section>
        </Page>
      </article>
    </div>
  );
}
