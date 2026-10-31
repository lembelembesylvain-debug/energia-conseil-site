import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { UMAFI } from '../data/umafi';

type FlyerView = 'both' | 'recto' | 'verso';
type PaperSize = 'A4' | 'A5';
const CATARINA_RESERVATION_URL = 'https://catarinamartins-immobilier.fr/valorisation';

const PHOTOS = {
  hero: '/la%20total.jpg',
  pump: '/projects/brunel/unite-exterieure-daikin-sur-mur-de-pierre-anthracite.jpg',
  facade: '/isolation%20thermique.jpg',
  solar: '/photovoltaique.jpg',
  home: '/projects/brunel/renovation-architecturale-contemporaine-anthracite.jpg',
};

const WORKS = [
  { number: '01', title: 'Pompe à chaleur', caption: 'Intégration extérieure anthracite • confort quatre saisons', photo: PHOTOS.pump, alt: 'Unité extérieure Daikin anthracite installée contre un mur de pierre, près d’une fenêtre' },
  { number: '02', title: 'Façade & isolation', caption: 'Enveloppe rénovée • isolation thermique par l’extérieur', photo: PHOTOS.facade, alt: 'Technicien appliquant un enduit d’isolation thermique par l’extérieur sur une façade' },
  { number: '03', title: 'Solaire photovoltaïque', caption: 'Production locale • étude de votre toiture', photo: PHOTOS.solar, alt: 'Maison équipée de panneaux photovoltaïques en toiture' },
  { number: '04', title: 'Rénovation globale', caption: 'Un projet cohérent, adapté à votre logement', photo: PHOTOS.home, alt: 'Maison rénovée avec pompe à chaleur et enveloppe améliorée' },
];

function Emblem({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-[58px] w-[112px] shrink-0 items-center justify-center rounded-sm border border-[#C5A880]/70 px-2 py-1">
        <img src="/assets/energia-logo-arbres.png" alt="Logo officiel ENERGIA CONSEIL IA — arbres" className="h-full w-full object-contain" />
      </div>
      <div>
        <p className={`font-serif text-[16px] font-bold leading-tight tracking-[.07em] ${light ? 'text-[#0B192C]' : 'text-white'}`}>ENERGIA CONSEIL IA®</p>
        <p className={`mt-1 text-[9px] font-semibold uppercase tracking-[.24em] ${light ? 'text-[#765E3F]' : 'text-[#C5A880]'}`}>RÉNOVATION ÉNERGÉTIQUE</p>
      </div>
    </div>
  );
}

function PageMark({ label, light = false }: { label: string; light?: boolean }) {
  return <span className={`border-l pl-3 text-[9px] font-medium uppercase tracking-[.2em] ${light ? 'border-[#9A7952]/60 text-[#765E3F]' : 'border-[#C5A880]/60 text-[#C5A880]'}`}>{label}</span>;
}

export const FlyerEnergia: React.FC = () => {
  const [view, setView] = useState<FlyerView>('both');
  const [paper, setPaper] = useState<PaperSize>('A4');

  return (
    <div className={`energia-flyer min-h-screen bg-[#071321] px-4 py-8 font-sans text-slate-100 print:min-h-0 print:p-0 ${paper === 'A5' ? 'paper-a5' : 'paper-a4'}`}>
      <style>{`
        @page { size: A4 portrait; margin: 0; }
        @media print {
          html, body, #root { margin: 0 !important; padding: 0 !important; background: #fff !important; }
          *, *::before, *::after { print-color-adjust: exact !important; -webkit-print-color-adjust: exact !important; }
          .flyer-toolbar { display: none !important; }
          .flyer-pages { display: block !important; width: 210mm !important; max-width: none !important; margin: 0 !important; }
          .flyer-print-page { box-sizing: border-box !important; display: block !important; width: 210mm !important; height: 100vh !important; max-height: 296mm !important; overflow: hidden !important; break-inside: avoid !important; page-break-inside: avoid !important; }
          .flyer-print-recto { break-after: page !important; page-break-after: always !important; }
          .flyer-print-verso { break-before: auto !important; page-break-before: auto !important; }
          .flyer-sheet { box-sizing: border-box !important; width: 100% !important; max-width: none !important; height: 100% !important; min-height: 0 !important; max-height: 100% !important; overflow: hidden !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; break-inside: avoid !important; page-break-inside: avoid !important; }
          .flyer-content { box-sizing: border-box !important; height: 100% !important; max-height: 100% !important; overflow: hidden !important; }
          a { color: inherit !important; text-decoration: none !important; }
        }
      `}</style>

      <div className="flyer-toolbar mx-auto mb-7 flex max-w-5xl flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#C5A880]/25 bg-[#0B192C] p-4 shadow-xl print:hidden">
        <div>
          <p className="font-serif text-lg font-semibold tracking-wide text-white">ENERGIA <span className="text-[#C5A880]">PRESTIGE</span></p>
          <p className="mt-1 text-xs text-slate-400">Flyer institutionnel · choisissez votre format et vos faces</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex rounded-lg border border-white/10 bg-[#071321] p-1" aria-label="Faces à afficher">
            {([['both', 'Recto + verso'], ['recto', 'Recto'], ['verso', 'Verso']] as const).map(([value, label]) => (
              <button key={value} type="button" onClick={() => setView(value)} aria-pressed={view === value} className={`rounded-md px-3 py-2 text-xs transition ${view === value ? 'bg-[#C5A880] font-bold text-[#0B192C]' : 'text-slate-300 hover:text-white'}`}>
                {label}
              </button>
            ))}
          </div>
          <div className="flex rounded-lg border border-white/10 bg-[#071321] p-1" aria-label="Format d’impression">
            {(['A4', 'A5'] as const).map((size) => (
              <button key={size} type="button" onClick={() => setPaper(size)} aria-pressed={paper === size} className={`rounded-md px-3 py-2 text-xs transition ${paper === size ? 'bg-white font-bold text-[#0B192C]' : 'text-slate-300 hover:text-white'}`}>{size}</button>
            ))}
          </div>
          <button type="button" onClick={() => window.print()} className="rounded-lg bg-[#C5A880] px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0B192C] shadow-lg transition hover:bg-[#d7bd99]">
            Imprimer {paper} · haute définition
          </button>
        </div>
      </div>

      <div className="flyer-pages mx-auto flex max-w-5xl flex-col items-center gap-8 print:block">
        {(view === 'both' || view === 'recto') && (
          <div className="flyer-print-page flyer-print-recto">
          <article className="flyer-sheet relative flex min-h-[1100px] w-full max-w-[800px] flex-col overflow-hidden border border-[#C5A880]/25 bg-[#0B192C] shadow-[0_28px_80px_rgba(0,0,0,.45)] print:w-[210mm]">
            <div className="flyer-content print-compact flex flex-1 flex-col px-8 py-7 sm:px-10 sm:py-9 print:px-[10mm] print:py-[9mm]">
              <header className="flex items-center justify-between border-b border-[#C5A880]/35 pb-4">
                <Emblem />
                <PageMark label="Conseil · maîtrise · rénovation" />
              </header>

              <section className="relative mt-5 h-[330px] overflow-hidden rounded-sm border border-[#C5A880]/30 sm:h-[360px] print:mt-4 print:h-[76mm]">
                <img
                  src={PHOTOS.hero}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = '/projects/brunel/facade-sud-panneaux-solaires-gris-anthracite.jpg';
                  }}
                  alt="Vue d’ensemble de la maison rénovée avec photovoltaïque, borne de recharge, pompe à chaleur et solaire thermique"
                  className="absolute inset-0 h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#071321]/90 via-[#071321]/55 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#071321]/75 to-transparent" />
                <div className="relative flex h-full max-w-[70%] flex-col justify-center p-6 sm:p-8 print:p-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[.32em] text-[#D6BD98]">L’excellence énergétique, avec vision</p>
                  <h1 className="mt-4 font-serif text-4xl font-medium leading-[1.05] text-white sm:text-5xl print:text-4xl">Révélez le<br /><em className="font-normal text-[#D6BD98]">potentiel de votre maison.</em></h1>
                  <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-100/90">Une rénovation conçue dans son ensemble : confort, performance et valorisation de votre patrimoine.</p>
                  <div className="mt-4 flex max-w-lg flex-wrap gap-1.5" aria-label="Équipements à étudier pour le projet">
                    {['Photovoltaïque', 'Pompe à chaleur', 'Borne IRVE', 'Eau chaude solaire'].map((equipment) => (
                      <span key={equipment} className="border border-[#C5A880]/80 bg-[#0D5B3F]/90 px-2 py-1 text-[8px] font-semibold uppercase tracking-wider text-white">{equipment}</span>
                    ))}
                  </div>
                </div>
                <span className="absolute bottom-3 right-4 max-w-[45%] text-right text-[8px] leading-relaxed text-white/85">Photovoltaïque visible sur la photo. PAC, IRVE et eau chaude solaire : équipements à étudier selon le projet.</span>
              </section>

              <div className="mt-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[.26em] text-[#C5A880]">Nos expertises</p>
                  <h2 className="mt-1 font-serif text-2xl text-white">Une approche, quatre savoir-faire</h2>
                </div>
                <span className="hidden text-[9px] uppercase tracking-[.14em] text-slate-400 sm:block">Étude · coordination · accompagnement</span>
              </div>

              <section className="mt-3 grid flex-1 grid-cols-2 gap-3 print:grid-cols-2" aria-label="Travaux accompagnés">
                {WORKS.map((work) => (
                  <article key={work.number} className="photo-card relative min-h-[145px] overflow-hidden border border-[#C5A880]/20 sm:min-h-[165px] print:min-h-0">
                    <img src={work.photo} alt={work.alt} className="absolute inset-0 h-full w-full object-cover transition duration-500 hover:scale-[1.03]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#071321]/95 via-[#071321]/25 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4">
                      <p className="text-[8px] font-semibold tracking-[.2em] text-[#D6BD98]">{work.number} / ÉNERGIE & HABITAT</p>
                      <h3 className="mt-1 font-serif text-lg leading-tight text-white sm:text-xl">{work.title}</h3>
                      <p className="mt-1 text-[9px] text-white/80 sm:text-[10px]">{work.caption}</p>
                    </div>
                  </article>
                ))}
              </section>

              <footer className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#C5A880]/35 pt-4">
                <div>
                  <p className="text-[8px] uppercase tracking-[.25em] text-[#C5A880]">Président · Contractant Général Digital</p>
                  <p className="mt-1 font-serif text-lg text-white">Sylvain LEMBELEMBE</p>
                </div>
                <a href="tel:+33610596898" className="text-xl font-semibold tracking-wide text-[#D6BD98] no-underline sm:text-2xl">06 10 59 68 98</a>
              </footer>
              <p className="mt-2 text-[8px] leading-relaxed text-slate-400">Photos et projections d’illustration de projets de rénovation. Chaque logement, étude et résultat est spécifique.</p>
            </div>
          </article>
          </div>
        )}

        {(view === 'both' || view === 'verso') && (
          <div className="flyer-print-page flyer-print-verso">
          <article className="flyer-sheet relative flex min-h-[1100px] w-full max-w-[800px] flex-col overflow-hidden border border-[#C5A880]/25 bg-[#F7F5F0] text-[#0B192C] shadow-[0_28px_80px_rgba(0,0,0,.45)] print:w-[210mm]">
            <div className="flyer-content flyer-back-content print-compact flex flex-1 flex-col px-8 py-7 sm:px-10 sm:py-9 print:px-[9mm] print:py-[6mm]">
              <header className="flex items-center justify-between border-b border-[#0B192C]/15 pb-4">
                <Emblem light />
                <PageMark label="Repères financement" light />
              </header>

              <section className="mt-5" aria-labelledby="funding-pillars-title">
                <p className="text-[9px] font-bold uppercase tracking-[.25em] text-[#9A7952]">Un parcours de financement à construire</p>
                <h2 id="funding-pillars-title" className="mt-1 font-serif text-3xl leading-tight">Quatre leviers complémentaires</h2>
                <p className="mt-1 text-[10px] leading-relaxed text-slate-600">Les solutions se combinent au cas par cas après étude du logement, du ménage et des offres disponibles.</p>

                <div className="mt-3 grid grid-cols-2 gap-2.5 print:gap-2">
                  <article className="border border-[#C5A880] bg-white p-3 print:p-2.5">
                    <p className="text-[8px] font-bold uppercase tracking-[.15em] text-[#0D5B3F]">Pilier 01 · Aides publiques</p>
                    <h3 className="mt-1 font-serif text-sm font-semibold leading-tight">MaPrimeRénov’ &amp; CEE</h3>
                    <p className="mt-1 text-[9px] leading-snug text-slate-600">Jusqu’à 90 % de financement public estimatif dans certaines situations, selon profil, travaux éligibles et cumul. Montant soumis à instruction ; jamais garanti ni automatiquement déduit du devis.</p>
                  </article>
                  <article className="border border-[#C5A880] bg-white p-3 print:p-2.5">
                    <p className="text-[8px] font-bold uppercase tracking-[.15em] text-[#0D5B3F]">Pilier 02 · Avance de trésorerie</p>
                    <h3 className="mt-1 font-serif text-sm font-semibold leading-tight">Avance Anah · jusqu’à 70 %</h3>
                    <p className="mt-1 text-[9px] leading-snug text-slate-600">Une avance peut être mobilisable pour certains ménages et dossiers afin de limiter l’effort de trésorerie. Conditions, calendrier et montant à confirmer par l’Anah.</p>
                  </article>
                  <article className="border border-[#C5A880] bg-white p-3 print:p-2.5">
                    <p className="text-[8px] font-bold uppercase tracking-[.15em] text-[#0D5B3F]">Pilier 03 · Prêt réglementé</p>
                    <h3 className="mt-1 font-serif text-sm font-semibold leading-tight">Éco-PTZ · jusqu’à 50 000 €</h3>
                    <p className="mt-1 text-[9px] leading-snug text-slate-600">Prêt à taux zéro pouvant aller jusqu’à 20 ans pour certains bouquets de travaux. Sous conditions d’éligibilité et accord bancaire ; il ne garantit pas des mensualités neutralisées.</p>
                  </article>
                  <article className="border border-[#C5A880] bg-[#0B192C] p-3 text-white print:p-2.5">
                    <p className="text-[8px] font-bold uppercase tracking-[.15em] text-[#C5A880]">Pilier 04 · Partenaire UMAFI</p>
                    <h3 className="mt-1 font-serif text-sm font-semibold leading-tight">Financer le reste à charge</h3>
                    <p className="mt-1 text-[9px] leading-snug text-slate-200">Étude de 6 000 € à 75 000 €, financement travaux ou regroupement. Délai indicatif annoncé : jusqu’à 8 jours après dossier complet. Mandataire IOBSP · ORIAS {UMAFI.orias}. Accord et délai non garantis.</p>
                  </article>
                </div>
                <p className="mt-2 text-[8px] leading-relaxed text-slate-500">Repères indicatifs uniquement. Règles, avances et plafonds évoluent ; vérification du barème en vigueur et décision des organismes financeurs indispensables.</p>
              </section>

              <p className="mt-3 border-l-2 border-[#C5A880] bg-white px-3 py-2 text-[9px] font-medium leading-relaxed text-[#0B192C] print:mt-2 print:py-1.5">
                Les barèmes de subventions évoluent régulièrement : scannez le QR code de Catarina pour demander une étude personnalisée de vos aides selon les règles en vigueur.
              </p>

              <section className="mt-3 border border-[#C5A880] bg-white p-4 shadow-[0_8px_24px_rgba(11,25,44,.08)] print:mt-2 print:p-3" aria-labelledby="catarina-vip-title">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="h-[76px] w-[76px] shrink-0 overflow-hidden rounded-full border-2 border-[#C5A880] p-1">
                    <img src="/assets/catarina-martins.png" alt="Catarina Martins, coordinatrice de travaux" className="h-full w-full rounded-full object-cover object-top" />
                  </div>
                  <div className="min-w-[180px] flex-1">
                    <p className="text-[8px] font-bold uppercase tracking-[.22em] text-[#9A7952]">Accompagnement privilégié</p>
                    <h3 id="catarina-vip-title" className="mt-1 font-serif text-lg font-semibold text-[#0B192C]">Catarina MARTINS</h3>
                    <p className="text-[9px] font-semibold text-[#0D5B3F]">Coordinatrice de travaux</p>
                    <p className="mt-1 text-[9px] leading-relaxed text-slate-600">Planifiez votre visite technique sur site &amp; étude d’aides personnalisée.</p>
                  </div>
                  <a href="/catarina" aria-label="Réserver une visite technique avec Catarina via le QR code" className="ml-auto flex flex-col items-center gap-1 rounded-lg border border-[#C5A880]/70 bg-[#FBFAF7] p-2 no-underline">
                    <QRCodeSVG value={CATARINA_RESERVATION_URL} size={76} level="Q" includeMargin bgColor="#FBFAF7" fgColor="#0B192C" />
                    <span className="text-[7px] font-bold uppercase tracking-wider text-[#765E3F]">Scanner · RDV</span>
                  </a>
                </div>
                <p className="mt-3 border-l-2 border-[#C5A880] bg-[#F7F5F0] px-3 py-2 text-[9px] leading-relaxed text-[#0B192C]">
                  <strong className="text-[#765E3F]">Règle d’or :</strong> Étude d’ingénierie préalable (390 € TTC, 100 % déduits de votre marché de travaux dès signature).
                </p>
              </section>

              <section className="mt-4 flex flex-wrap items-center justify-between gap-3 border border-[#C5A880] bg-[#0B192C] px-4 py-3 text-white">
                <div>
                  <p className="text-[8px] font-semibold uppercase tracking-[.2em] text-[#C5A880]">Signature officielle</p>
                  <p className="mt-1 font-serif text-lg font-semibold">Sylvain LEMBELEMBE</p>
                  <p className="text-[9px] text-slate-300">Président · Contractant Général</p>
                </div>
                <div className="text-right">
                  <a href="tel:+33610596898" className="whitespace-nowrap font-semibold tracking-wide text-[#E0C8A4] no-underline">06 10 59 68 98</a>
                  <p className="mt-1 text-[8px] uppercase tracking-wider text-slate-300">Marque déposée INPI n° 5213845</p>
                </div>
              </section>

              <footer className="mt-auto pt-3 text-[8px] leading-relaxed text-slate-500">
                Informations de cadrage uniquement. Les aides dépendent des règles en vigueur, de l’éligibilité du ménage et de l’instruction des organismes compétents ; elles ne sont jamais acquises ou garanties. Financements sous réserve d’étude et d’acceptation par le prêteur. Sources : <a href="https://www.anah.gouv.fr" className="underline">Anah.gouv.fr</a> · <a href="https://umafi.fr/" className="underline">umafi.fr</a>.
              </footer>
            </div>
          </article>
          </div>
        )}
      </div>
    </div>
  );
};