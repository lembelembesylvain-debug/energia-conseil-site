import { useRef, useState } from "react";
import { BRANDING } from "../../lib/branding";
import {
  BADGES_QUATRIEME,
  BADGE_TESLA,
  CONTACTS_QUATRIEME,
  LOGO_COUVERTURE,
  MENTIONS_COUVERTURE,
  SLOGAN_INSTITUTIONNEL,
  MENTION_AIDES_CATALOGUE,
  MOT_FONDATEUR,
  PLANCHE_TRAME,
  PROFILS_CLIENTS,
  PLANCHES_B2B,
  PLANCHES_GARANTIES,
  PLANCHES_RESIDENTIEL,
  POLICE_DECENNALE,
  QUALIFICATION_CERTIBAT,
  SECTIONS_BOOK,
  type BlocCatalogue,
  type PlancheCatalogue,
} from "../../lib/crm/catalogueCommercial";
import { telechargerCatalogueCommercialPdf } from "../../lib/crm/catalogueCommercialPdf";

const STYLE_PAGES = `
.catalogue-livre { display: flex; flex-direction: column; align-items: center; gap: 8mm; }
.catalogue-page {
  width: 210mm;
  height: 297mm;
  box-sizing: border-box;
  padding: 12mm 15mm 12mm 15mm;
  overflow: hidden;
  position: relative;
  background: #FFFFFF;
  color: #0B1F3A;
  font-family: Helvetica, Arial, sans-serif;
  flex-shrink: 0;
  margin: 0;
}
.catalogue-pied {
  position: absolute;
  left: 15mm;
  right: 15mm;
  bottom: 10mm;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 4mm;
  border-top: 0.3mm solid #D4AF37;
  padding-top: 1.2mm;
  font-size: 7.5pt;
  line-height: 1.2;
  color: #0B1F3A;
}
.catalogue-entete {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 4mm;
  border-bottom: 0.35mm solid #D4AF37;
  padding-bottom: 1.4mm;
  margin-bottom: 2.5mm;
}
.catalogue-logo { height: 11mm; width: auto; display: block; background: #FFFFFF; }
.catalogue-rappel { margin: 0; font-size: 7.5pt; line-height: 1.25; color: #8A6A2F; text-align: right; }
.catalogue-titre { margin: 0 0 1.5mm; font-size: 13pt; line-height: 1.15; font-weight: 700; color: #0B1F3A; }
.catalogue-kicker { margin: 0 0 2mm; font-size: 8pt; letter-spacing: 0.06em; text-transform: uppercase; color: #8A6A2F; }
.catalogue-figure { margin: 0 0 2mm; }
.catalogue-schema {
  display: block;
  width: 100%;
  height: 170px;
  object-fit: cover;
  border: 0.35mm solid #D4AF37;
  background: #F8F4EA;
}
.catalogue-legende { margin: 1mm 0 0; font-size: 7.5pt; line-height: 1.2; color: #0B1F3A; font-style: italic; }
.catalogue-corps { padding-bottom: 8mm; }
.catalogue-blocs { display: block; }
.catalogue-bloc { margin: 0 0 1.4mm; }
.catalogue-bloc h3 { margin: 0 0 0.3mm; font-size: 9.5pt; line-height: 1.2; font-weight: 700; color: #0B1F3A; }
.catalogue-bloc p, .catalogue-bloc li { margin: 0; font-size: 9.5pt; line-height: 1.22; color: #0B1F3A; }
.catalogue-bloc ul { margin: 0; padding-left: 4mm; }
.catalogue-duo { display: flex; gap: 5mm; align-items: flex-start; }
.catalogue-duo .catalogue-bloc { flex: 1; min-width: 0; }
.catalogue-intro { margin: 0 0 2mm; font-size: 9.5pt; line-height: 1.25; }
.catalogue-table { width: 100%; border-collapse: collapse; margin: 1mm 0 2.5mm; font-size: 9.5pt; }
.catalogue-table th, .catalogue-table td { border: 0.2mm solid #D4AF37; padding: 1mm 1.5mm; text-align: left; vertical-align: top; }
.catalogue-table th { background: #0B1F3A; color: #FFFFFF; font-weight: 700; }
.catalogue-sceau { border: 0.4mm solid #D4AF37; background: #0B1F3A; color: #FFFFFF; padding: 2mm 3mm; margin: 0 0 2.5mm; }
.catalogue-sceau strong { display: block; color: #D4AF37; font-size: 9.5pt; margin-bottom: 0.6mm; }
.catalogue-sceau p { margin: 0; font-size: 9.5pt; line-height: 1.22; }
.catalogue-blasons { display: flex; gap: 4mm; }
.catalogue-blason { flex: 1; border: 0.35mm solid #D4AF37; background: #F8F4EA; padding: 2mm; }
.catalogue-blason h3 { margin: 0 0 1mm; font-size: 9.5pt; color: #0B1F3A; }
.catalogue-blason p { margin: 0; font-size: 9.5pt; line-height: 1.25; }
.catalogue-frise { display: flex; gap: 3mm; margin: 0 0 3mm; }
.catalogue-station { flex: 1; border: 0.35mm solid #D4AF37; min-height: 28mm; }
.catalogue-station strong { display: block; background: #0B1F3A; color: #D4AF37; font-size: 8pt; padding: 1mm 2mm; }
.catalogue-station p { margin: 0; padding: 1.5mm 2mm 0; font-size: 9.5pt; line-height: 1.22; }
.catalogue-profil { border-left: 0.8mm solid #D4AF37; padding: 0 0 1.5mm 2.5mm; margin: 0 0 1.8mm; }
.catalogue-profil h3 { margin: 0 0 0.4mm; font-size: 9.5pt; }
.catalogue-profil p { margin: 0; font-size: 9.5pt; line-height: 1.22; }
`;

function Pied({ page, total }: { page: number; total: number }) {
  return (
    <footer className="catalogue-pied">
      <span>© ENERGIA CONSEIL IA®</span>
      <span>Document officiel confidentiel</span>
      <strong>
        Page {page} / {total}
      </strong>
    </footer>
  );
}

function Entete({ kicker }: { kicker: string }) {
  return (
    <header>
      <div className="catalogue-entete">
        <img className="catalogue-logo" src={LOGO_COUVERTURE} alt="Logo ENERGIA CONSEIL IA" crossOrigin="anonymous" />
        <p className="catalogue-rappel">
          INPI n° {BRANDING.inpi}
          <br />
          Calipso Assurances · Damien 06 72 68 09 68
        </p>
      </div>
      <p className="catalogue-kicker">{kicker}</p>
    </header>
  );
}

function Bloc({ bloc }: { bloc: BlocCatalogue }) {
  return (
    <section className="catalogue-bloc">
      <h3>{bloc.titre}</h3>
      {bloc.texte ? <p>{bloc.texte}</p> : null}
      {bloc.puces ? (
        <ul>
          {bloc.puces.map((puce) => (
            <li key={puce}>{puce}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

function rangsFiche(blocs: BlocCatalogue[]) {
  const rangs: BlocCatalogue[][] = [];
  let paires: BlocCatalogue[] = [];
  const pousserPaires = () => {
    if (paires.length === 0) return;
    rangs.push(paires);
    paires = [];
  };
  for (const bloc of blocs) {
    if (bloc.puces && !bloc.texte) {
      paires.push(bloc);
      if (paires.length === 2) pousserPaires();
    } else {
      pousserPaires();
      rangs.push([bloc]);
    }
  }
  pousserPaires();
  return rangs;
}

function PageFiche({ planche, page, total }: { planche: PlancheCatalogue; page: number; total: number }) {
  const rangs = rangsFiche(planche.blocs);
  return (
    <article className="catalogue-page" id={`book-${planche.id}`}>
      <Entete kicker={planche.kicker} />
      <div className="catalogue-corps">
        <h2 className="catalogue-titre">{planche.titre}</h2>
        {planche.image ? (
          <figure className="catalogue-figure">
            <img className="catalogue-schema" src={planche.image} alt={planche.alt ?? planche.titre} crossOrigin="anonymous" />
            <figcaption className="catalogue-legende">
              Schéma technique d&apos;ingénierie certifié — Modélisation ENERGIA CONSEIL IA®
            </figcaption>
          </figure>
        ) : null}
        {rangs.map((rang) =>
          rang.length === 2 ? (
            <div className="catalogue-duo" key={rang.map((item) => item.titre).join("|")}>
              {rang.map((bloc) => (
                <Bloc key={bloc.titre} bloc={bloc} />
              ))}
            </div>
          ) : (
            <Bloc key={rang[0].titre} bloc={rang[0]} />
          ),
        )}
      </div>
      <Pied page={page} total={total} />
    </article>
  );
}

export default function CatalogueCommercial() {
  const livreRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  const fiches = [...PLANCHES_RESIDENTIEL, ...PLANCHES_B2B].filter((planche) => planche.blocs.length > 0);
  const total = 5 + fiches.length;
  let curseur = 1;
  const pageCouverture = curseur++;
  const pageGaranties = curseur++;
  const pagesFiches = fiches.map((planche) => ({ planche, page: curseur++ }));
  const pageProfils = curseur++;
  const pageTrame = curseur++;
  const pageDos = curseur++;

  const telecharger = async () => {
    if (!livreRef.current) return;
    setBusy(true);
    setErreur("");
    try {
      await telechargerCatalogueCommercialPdf(livreRef.current);
    } catch (error) {
      setErreur(error instanceof Error ? error.message : "Le PDF n'a pas pu être généré.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <style>{STYLE_PAGES}</style>
      <div className="flex flex-col gap-3 rounded-2xl border border-amber-400/30 bg-slate-950 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300">Book de vente Damien</p>
          <p className="mt-1 text-sm text-slate-300">Catalogue officiel 2026 — une feuille A4 par page, puis impression.</p>
        </div>
        <button
          type="button"
          data-testid="telecharger-catalogue-commercial"
          onClick={() => void telecharger()}
          disabled={busy}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
        >
          {busy ? "Préparation du PDF…" : "📥 Télécharger le Catalogue Complet de Vente (PDF A4)"}
        </button>
      </div>
      {erreur ? <p className="text-sm text-rose-300">{erreur}</p> : null}

      <nav className="flex flex-wrap gap-2" aria-label="Sections du catalogue">
        {SECTIONS_BOOK.map((section) => (
          <a
            key={section.id}
            href={`#${section.ancre}`}
            className="rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-amber-400/60 hover:text-amber-100"
          >
            {section.label}
          </a>
        ))}
      </nav>

      <div ref={livreRef} className="catalogue-livre" data-testid="catalogue-pages">
        <article className="catalogue-page" id="book-couverture">
          <Entete kicker="Catalogue officiel 2026" />
          <div className="catalogue-corps">
            <h2 className="catalogue-titre">ENERGIA CONSEIL IA®</h2>
            <p className="catalogue-intro">Bureau d&apos;Études Thermiques &amp; Contractant Général Digital</p>
            <p className="catalogue-intro">
              Catalogue officiel des solutions énergétiques 2026 — rénovation globale, écosystème solaire Tesla, tertiaire et industrie.
            </p>
            <ul className="catalogue-bloc">
              {MENTIONS_COUVERTURE.map((ligne) => (
                <li key={ligne}>{ligne}</li>
              ))}
              <li>{BADGE_TESLA}</li>
            </ul>
            <h3 className="catalogue-titre" style={{ fontSize: "11pt", marginTop: "3mm" }}>
              Le mot de Sylvain LEMBELEMBE, Fondateur &amp; CEO
            </h3>
            <p className="catalogue-intro" style={{ whiteSpace: "pre-line" }}>
              {MOT_FONDATEUR}
            </p>
            <p className="catalogue-intro">{MENTION_AIDES_CATALOGUE}</p>
          </div>
          <Pied page={pageCouverture} total={total} />
        </article>

        <article className="catalogue-page" id="book-garanties">
          <Entete kicker="Bouclier juridique" />
          <div className="catalogue-corps">
            <h2 className="catalogue-titre">Charte des 4 protections ENERGIA</h2>
            <p className="catalogue-intro">
              La décennale couvre les travaux du marché. Elle n&apos;est pas une garantie de rentabilité. Police {POLICE_DECENNALE}.
            </p>
            {PLANCHES_GARANTIES.blocs
              .filter((bloc) => bloc.titre !== "Avis")
              .map((bloc) => (
                <Bloc key={bloc.titre} bloc={bloc} />
              ))}
            <table className="catalogue-table">
              <thead>
                <tr>
                  <th>Garantie</th>
                  <th>Durée</th>
                  <th>Portée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Décennale</td>
                  <td>10 ans</td>
                  <td>Travaux objets du marché</td>
                </tr>
                <tr>
                  <td>Constructeur</td>
                  <td>Jusqu&apos;à 10 ans</td>
                  <td>Équipements et Powerwall 3</td>
                </tr>
                <tr>
                  <td>Biennale</td>
                  <td>2 ans</td>
                  <td>Éléments dissociables</td>
                </tr>
                <tr>
                  <td>Parfait achèvement</td>
                  <td>1 an</td>
                  <td>Désordres dès la réception</td>
                </tr>
              </tbody>
            </table>
            <div className="catalogue-sceau">
              <strong>Sceau d&apos;Excellence &amp; Contrôle Sûreté-6 (TM)</strong>
              <p>
                Marque de contrôle interne ENERGIA : relecture du dossier, de l&apos;ordre des travaux et des pièces d&apos;assurance
                avant émission. Ce sceau n&apos;est pas un agrément d&apos;État.
              </p>
            </div>
            <div className="catalogue-blasons">
              <section className="catalogue-blason">
                <h3>Calipso Assurances</h3>
                <p>{POLICE_DECENNALE}</p>
                <p>Décennale et RC Pro — travaux du contrat uniquement.</p>
              </section>
              <section className="catalogue-blason">
                <h3>Certibat Réno-Perf</h3>
                <p>{QUALIFICATION_CERTIBAT}</p>
                <p>Qualification, pas un agrément d&apos;État.</p>
              </section>
            </div>
          </div>
          <Pied page={pageGaranties} total={total} />
        </article>

        {pagesFiches.map(({ planche, page }) => (
          <PageFiche key={planche.id} planche={planche} page={page} total={total} />
        ))}

        <article className="catalogue-page" id="book-profils">
          <Entete kicker="Guide Damien" />
          <div className="catalogue-corps">
            <h2 className="catalogue-titre">Profils clients et postures commerciales</h2>
            {PROFILS_CLIENTS.map((profil, index) => (
              <section className="catalogue-profil" key={profil.id}>
                <h3>
                  Profil {index + 1} — {profil.titre}
                </h3>
                <p>
                  <strong>Psychologie. </strong>
                  {profil.psychologie}
                </p>
                <p>
                  <strong>Posture. </strong>
                  {profil.posture}
                </p>
                <p>
                  <strong>Argument. </strong>
                  {profil.argument}
                </p>
                <p>
                  <strong>Levier. </strong>
                  {profil.levier}
                </p>
              </section>
            ))}
            <p className="catalogue-intro">{MENTION_AIDES_CATALOGUE}</p>
          </div>
          <Pied page={pageProfils} total={total} />
        </article>

        <article className="catalogue-page" id="book-trame">
          <Entete kicker="Méthode Damien" />
          <div className="catalogue-corps">
            <h2 className="catalogue-titre">La trame en 2 temps</h2>
            <div className="catalogue-frise">
              <section className="catalogue-station">
                <strong>J+0 — Diagnostic</strong>
                <p>Visite, déperditions, DPE de départ. Aucun marché ferme à ce rendez-vous.</p>
              </section>
              <section className="catalogue-station">
                <strong>48 h — Bureau d&apos;études CRM</strong>
                <p>Modélisation, ordre des travaux, aides à titre indicatif.</p>
              </section>
              <section className="catalogue-station">
                <strong>J+2 — Devis &amp; financement</strong>
                <p>Restitution du devis officiel. Vivons Courtier, Fabien, 06 71 19 96 45.</p>
              </section>
            </div>
            {PLANCHE_TRAME.blocs.map((bloc) => (
              <Bloc key={bloc.titre} bloc={bloc} />
            ))}
          </div>
          <Pied page={pageTrame} total={total} />
        </article>

        <article className="catalogue-page" id="book-quatrieme">
          <div className="catalogue-corps">
            <img className="catalogue-logo" src={LOGO_COUVERTURE} alt="Logo ENERGIA CONSEIL IA aux trois arbres" crossOrigin="anonymous" style={{ height: "22mm", marginBottom: "4mm" }} />
            <h2 className="catalogue-titre">ENERGIA CONSEIL IA®</h2>
            <p className="catalogue-intro" style={{ fontStyle: "italic" }}>
              {SLOGAN_INSTITUTIONNEL}
            </p>
            {CONTACTS_QUATRIEME.map((contact) => (
              <p className="catalogue-intro" key={contact.role}>
                <strong>{contact.role}. </strong>
                {contact.valeur}
              </p>
            ))}
            <ul className="catalogue-bloc">
              {BADGES_QUATRIEME.map((badge) => (
                <li key={badge}>{badge}</li>
              ))}
            </ul>
            <p className="catalogue-intro">{MENTION_AIDES_CATALOGUE}</p>
            <p className="catalogue-intro">
              Aucun devis définitif de parcours MaPrimeRénov&apos; ne se signe avant l&apos;accord écrit de l&apos;ANAH. Clause Julia :
              responsabilité ENERGIA plafonnée à 2 000 € si l&apos;écart d&apos;aides est imputable à une erreur prouvée.
            </p>
          </div>
          <Pied page={pageDos} total={total} />
        </article>
      </div>
    </div>
  );
}
