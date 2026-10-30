import { useEffect, useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { telechargerBookMaisonMartins } from "../../lib/crm/catalogueMaisonMartinsPdf";

/** Visuel officiel plein format — sans code-barres ni prix kiosque. */
const COUVERTURE = "/images/couverture_maison_martins.jpg";
const URL_VITRINE = "https://catarinamartins-immobilier.fr/valorisation";
const SERIF = '"Playfair Display", Palatino, "Palatino Linotype", serif';
const CINZEL = '"Cinzel", Palatino, serif';
const CORPS = '"Palatino Linotype", Palatino, Georgia, serif';

const ALT_COUVERTURE =
  "Couverture Maison Martins : cuisine d'exception en Bourgogne, pierre de taille, parquet en chevrons de chêne, îlot de marbre noir veiné d'or, ouverture sur les vignobles.";

const MANIFESTE = [
  "La pierre de Bourgogne n'a pas à choisir entre la mémoire et le dessin. Une demeure se juge à ce qu'elle conserve — la voûte, le parquet en chevrons, la lumière sur les vignes — et à ce qu'elle ose : un îlot de marbre, une cuisine tenue comme une pièce d'architecture, une technique qui reste invisible.",
  "Maison Martins réconcilie la passion des belles demeures bourguignonnes et l'exigence du design contemporain. L'approche est intime, confidentielle, et sans concession. Nous ouvrons un entretien : vendre en l'état, ou rénover pour révéler une valeur que le marché ne voit pas encore.",
  "Côte-d'Or et Saône-et-Loire. Domaines viticoles, hôtels particuliers, maisons de maître. Une signature pour la transaction, l'agencement et l'exécution.",
];

const PILIERS = [
  {
    num: "01",
    titre: "Transaction d'exception",
    texte:
      "Vente et acquisition de domaines viticoles, hôtels particuliers et propriétés de charme. Mandats discrets, sur la Côte-d'Or et la Saône-et-Loire.",
  },
  {
    num: "02",
    titre: "Architecture & cuisines italiennes",
    texte:
      "Cuisines direct usine italienne, marbrerie et menuiseries d'art. Marbre Marquina, chêne de Bourgogne, laiton brossé, verrières acier.",
  },
  {
    num: "03",
    titre: "Ingénierie & valorisation patrimoniale",
    texte:
      "Audit thermique, sortie des passoires F/G, optimisation de la valeur vénale et garantie décennale du Contractant Général.",
  },
] as const;

const MODELES = [
  {
    titre: "La Cuisine Monolithe",
    matiere: "Marbre Marquina",
    image: COUVERTURE,
    position: "center center",
    texte:
      "Îlot sculptural en marbre noir veiné d'or, façades laquées mates sans poignée, électroménager d'architecte. La cuisine se tient comme une pièce, face aux vignes.",
  },
  {
    titre: "La Suite Parentale Maître",
    matiere: "Chêne de Bourgogne",
    image: "/assets/maison-martins/sanctuaire-dressing-bronze.jpg",
    position: "center center",
    texte:
      "Dressing sur-mesure rétroéclairé, chêne massif, lumière basse. La suite s'ouvre avant même d'entrer dans la pièce.",
  },
  {
    titre: "La Salle d'eau pierre naturelle",
    matiere: "Laiton brossé",
    image: "/assets/maison-martins/sanctuaire-bain-monolithe.jpg",
    position: "center center",
    texte:
      "Pierre naturelle, vasque taillée, robinetterie de laiton brossé. L'eau reste dans la matière, le métal disparaît dans le mur.",
  },
  {
    titre: "La Verrière d'Art",
    matiere: "Verre et acier",
    image: "/images/verriere_art_martins.jpg",
    position: "center center",
    texte:
      "Séparations verre et acier, arcade noire ouverte sur le paysage. La verrière tient la lumière sans fermer la pièce.",
  },
] as const;

const GARANTIES = [
  {
    num: "01",
    titre: "Prix contractuel ferme",
    texte: "Le marché est tenu. Aucun dépassement imprévu une fois le prix signé.",
  },
  {
    num: "02",
    titre: "Garantie décennale 10 ans",
    texte: "Contractant Général. Police Calypso Assurances n° LUNPIB2604975.",
  },
  {
    num: "03",
    titre: "Interlocuteur unique dédié",
    texte: "Catarina Martins pour le bien et le dessin. Sylvain Lembelembe pour l'exécution. Un seul suivi.",
  },
  {
    num: "04",
    titre: "Engagement Zéro Réserve",
    texte: "Protocole Sûreté-6™ : traçabilité photographique et procès-verbal de réception sans réserve.",
  },
] as const;

const ORDRE = [
  "Isolation des combles",
  "Isolation des murs, biosourcée et perspirante",
  "Planchers, avec préparation du plancher chauffant sous tomettes",
  "Menuiseries",
  "VMC",
  "PAC haute température, dimensionnée après isolation",
  "Ballon thermodynamique, si le scénario le retient",
  "Photovoltaïque en dernier",
] as const;

const STYLE_LIVRE = `
.mm-livre { display: flex; flex-direction: column; align-items: center; gap: 10mm; padding: 8mm 0 18mm; background: #070b14; }
.mm-page {
  width: 210mm;
  height: 297mm;
  box-sizing: border-box;
  overflow: hidden;
  position: relative;
  background: #0A0F1D;
  color: #F4EDE0;
  font-family: "Palatino Linotype", Palatino, Georgia, serif;
  flex-shrink: 0;
}
.mm-couverture-photo {
  display: block;
  width: 210mm;
  height: 263.53mm;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  object-fit: fill;
  object-position: center;
}
.mm-couverture-bande {
  height: 16.735mm;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12mm;
  box-sizing: border-box;
}
.mm-couverture-kicker {
  margin: 0;
  font-family: Cinzel, Palatino, serif;
  font-size: 8pt;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #D4AF37;
}
.mm-couverture-titre {
  margin: 0;
  font-family: "Playfair Display", Palatino, serif;
  font-size: 13pt;
  font-weight: 600;
  color: #F6E7B2;
}
.mm-corps { position: absolute; left: 14mm; right: 14mm; top: 14mm; bottom: 16mm; }
.mm-corps-cas { display: flex; flex-direction: column; }
.mm-corps-cas .mm-cas-valeur { flex: 1; display: flex; flex-direction: column; justify-content: center; }
.mm-kicker {
  margin: 0 0 2mm;
  font-family: Cinzel, Palatino, serif;
  font-size: 8pt;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: #D4AF37;
}
.mm-titre {
  margin: 0 0 4mm;
  font-family: "Playfair Display", Palatino, serif;
  font-size: 22pt;
  line-height: 1.12;
  font-weight: 600;
  color: #F6E7B2;
}
.mm-texte { margin: 0 0 3mm; font-size: 11pt; line-height: 1.45; color: #E7E0D4; }
.mm-signature { margin: 4mm 0 0; font-family: "Playfair Display", Palatino, serif; font-style: italic; font-size: 13pt; color: #D4AF37; }
.mm-filet { border: 0; border-top: 0.35mm solid #D4AF37; margin: 4mm 0; }
.mm-table { display: table; width: 100%; border-spacing: 3mm 0; margin-top: 2mm; }
.mm-cell { display: table-cell; width: 33.33%; vertical-align: top; background: #12182A; border: 0.3mm solid rgba(212,175,55,0.55); padding: 4mm; }
.mm-num { margin: 0 0 2mm; font-family: Cinzel, Palatino, serif; font-size: 9pt; letter-spacing: 0.16em; color: #D4AF37; }
.mm-h3 { margin: 0 0 2mm; font-family: "Playfair Display", Palatino, serif; font-size: 13pt; line-height: 1.2; color: #F6E7B2; }
.mm-petit { margin: 0; font-size: 9.5pt; line-height: 1.4; color: #E7E0D4; }
.mm-bandeau { display: block; width: 100%; height: 118mm; object-fit: cover; border: 0; border-radius: 0; }
.mm-cas-photo {
  display: block;
  width: 100%;
  height: 148mm;
  margin: 2mm 0 4mm;
  object-fit: cover;
  object-position: center 42%;
  border: 0.45mm solid #D4AF37;
  border-radius: 3.5mm;
  box-sizing: border-box;
}
.mm-cas-valeur {
  background: #12182A;
  border: 0.35mm solid rgba(212,175,55,0.75);
  border-radius: 3.5mm;
  padding: 5mm 6mm 6mm;
}
.mm-sous { position: absolute; left: 14mm; right: 14mm; top: 126mm; bottom: 16mm; }
.mm-folio {
  position: absolute;
  left: 14mm;
  right: 14mm;
  bottom: 6mm;
  margin: 0;
  display: flex;
  justify-content: space-between;
  font-family: Cinzel, Palatino, serif;
  font-size: 7.5pt;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #D4AF37;
}
.mm-prix { margin: 0; font-family: "Playfair Display", Palatino, serif; font-size: 36pt; color: #D4AF37; line-height: 1; }
.mm-liste { margin: 0; padding: 0; list-style: none; }
.mm-liste li { margin: 0 0 1.6mm; font-size: 10.5pt; line-height: 1.35; color: #E7E0D4; }
.mm-liste li span { color: #D4AF37; margin-right: 2mm; }
.mm-note { margin: 3mm 0 0; font-size: 8.5pt; line-height: 1.35; color: #C4B8A4; }
.mm-sceau {
  width: 28mm;
  height: 28mm;
  border: 0.4mm solid #D4AF37;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: #D4AF37;
  font-family: Cinzel, Palatino, serif;
  font-size: 8pt;
  letter-spacing: 0.12em;
}
`;

function Folio({ n }: { n: number }) {
  return (
    <p className="mm-folio">
      <span>Maison Martins · Édition Privée</span>
      <span>{String(n).padStart(2, "0")} / 16</span>
    </p>
  );
}

function Livre({ innerRef }: { innerRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={innerRef} className="mm-livre" id="livre-maison-martins">
      <article className="mm-page">
        <div className="mm-couverture-bande">
          <p className="mm-couverture-kicker">Édition Privée</p>
          <p className="mm-couverture-titre">Maison Martins</p>
        </div>
        <img className="mm-couverture-photo" src={COUVERTURE} alt={ALT_COUVERTURE} />
        <div className="mm-couverture-bande">
          <p className="mm-couverture-kicker">L&apos;Art d&apos;Habiter l&apos;Exception</p>
          <p className="mm-couverture-kicker">01 / 16</p>
        </div>
      </article>

      <article className="mm-page">
        <div className="mm-corps">
          <p className="mm-kicker">Page 2 — L&apos;éditorial</p>
          <h2 className="mm-titre">Le mot de Catarina Martins</h2>
          {MANIFESTE.map((p) => (
            <p className="mm-texte" key={p}>
              {p}
            </p>
          ))}
          <p className="mm-signature">Catarina Martins</p>
        </div>
        <Folio n={2} />
      </article>

      <article className="mm-page">
        <div className="mm-corps">
          <p className="mm-kicker">Page 3 — Le triptyque</p>
          <h2 className="mm-titre">Trois projets en un</h2>
          <div className="mm-table">
            {PILIERS.map((pilier) => (
              <div className="mm-cell" key={pilier.num}>
                <p className="mm-num">{pilier.num}</p>
                <h3 className="mm-h3">{pilier.titre}</h3>
                <p className="mm-petit">{pilier.texte}</p>
              </div>
            ))}
          </div>
        </div>
        <Folio n={3} />
      </article>

      <article className="mm-page">
        <div className="mm-corps">
          <p className="mm-kicker">Page 4 — Consultation Duo</p>
          <h2 className="mm-titre">Vendre en l&apos;état, ou rénover</h2>
          <p className="mm-prix">390 €</p>
          <p className="mm-texte">Une heure trente sur site. Catarina Martins pour le dessin et l&apos;estimation. Sylvain Lembelembe pour l&apos;ingénierie et les travaux.</p>
          <p className="mm-texte">
            Les 390 € sont déduits à 100 % des honoraires de mandat ou du marché de travaux lorsque la mission se poursuit.
          </p>
          <hr className="mm-filet" />
          <p className="mm-texte">La question est simple : le bien vaut-il davantage en l&apos;état, ou après une rénovation qui révèle sa valeur vénale ?</p>
        </div>
        <Folio n={4} />
      </article>

      {MODELES.map((modele, index) => (
        <article className="mm-page" key={modele.titre}>
          <img
            className="mm-bandeau"
            src={modele.image}
            alt={modele.titre}
            style={{ objectPosition: modele.position }}
          />
          <div className="mm-sous">
            <p className="mm-kicker">Collection · {modele.matiere}</p>
            <h2 className="mm-titre">{modele.titre}</h2>
            <p className="mm-texte">{modele.texte}</p>
          </div>
          <Folio n={5 + index} />
        </article>
      ))}

      <article className="mm-page">
        <div className="mm-corps">
          <p className="mm-kicker">Page 9 — Métamorphose invisible</p>
          <h2 className="mm-titre">De la passoire au standing</h2>
          <p className="mm-texte">
            Une demeure classée F ou G peut devenir une résidence de standing visée en A ou B, sans dénaturer la pierre, les tomettes ni les menuiseries qui méritent de rester.
          </p>
          <p className="mm-texte">
            Isolation biosourcée dans le bâti ancien. Plancher chauffant glissé sous les tomettes. Pompe à chaleur haute température, discrète, dimensionnée seulement après l&apos;isolation.
          </p>
          <p className="mm-note">
            Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.
          </p>
        </div>
        <Folio n={9} />
      </article>

      <article className="mm-page">
        <div className="mm-corps">
          <p className="mm-kicker">Page 10 — L&apos;ordre des travaux</p>
          <h2 className="mm-titre">Le charme d&apos;abord, la machine ensuite</h2>
          <ol className="mm-liste">
            {ORDRE.map((ligne, index) => (
              <li key={ligne}>
                <span>{index + 1}.</span>
                {ligne}
              </li>
            ))}
          </ol>
          <p className="mm-note">La pompe à chaleur et la ventilation se dimensionnent après l&apos;isolation. Le photovoltaïque vient en dernier.</p>
        </div>
        <Folio n={10} />
      </article>

      <article className="mm-page">
        <div className="mm-corps mm-corps-cas">
          <p className="mm-kicker">Page 11 — Beaune</p>
          <h2 className="mm-titre">Maison bourgeoise</h2>
          <p className="mm-texte">
            Hôtel particulier en pierre de taille, cour pavée privée, balcons en fer forgé. Rénovation globale et cuisine d&apos;art.
          </p>
          <img
            className="mm-cas-photo"
            src="/images/maison_bourgeoise_beaune.jpg"
            alt="Hôtel particulier beaunois restauré : pierre de taille, balcons en fer forgé, cour pavée et topiaires."
          />
          <div className="mm-cas-valeur">
            <p className="mm-prix" style={{ fontSize: "28pt" }}>+180 000 €</p>
            <p className="mm-petit" style={{ marginTop: "2mm" }}>Valeur vénale constatée après rénovation.</p>
            <p className="mm-note">
              Constat sur ce dossier. La variation dépend du bien, de l&apos;état initial et du marché local. Elle ne constitue pas un prix de revente promis.
            </p>
          </div>
        </div>
        <Folio n={11} />
      </article>

      <article className="mm-page">
        <div className="mm-corps mm-corps-cas">
          <p className="mm-kicker">Page 12 — Chalon · Saône-et-Loire</p>
          <h2 className="mm-titre">Propriété viticole</h2>
          <p className="mm-texte">
            Bastide vigneronne en pierre dorée, toiture bourguignonne, rangs de vignes en coteaux et allée d&apos;honneur.
          </p>
          <img
            className="mm-cas-photo"
            src="/images/propriete_viticole_chalon.jpg"
            alt="Propriété viticole en Saône-et-Loire : bastide en pierre dorée, vignes en coteaux et allée d'honneur au soleil couchant."
          />
          <div className="mm-cas-valeur">
            <p className="mm-prix" style={{ fontSize: "26pt" }}>Clé en main</p>
            <p className="mm-petit" style={{ marginTop: "2mm" }}>
              Restauration du bâti et valorisation énergétique, sous la signature Maison Martins et l&apos;exécution ENERGIA CONSEIL IA®.
            </p>
          </div>
        </div>
        <Folio n={12} />
      </article>

      <article className="mm-page">
        <div className="mm-corps">
          <p className="mm-kicker">Page 13 — Charte souveraine</p>
          <h2 className="mm-titre">Quatre garanties</h2>
          <div className="mm-table" style={{ borderSpacing: "3mm 3mm" }}>
            {GARANTIES.map((item) => (
              <div className="mm-cell" key={item.num} style={{ width: "50%" }}>
                <p className="mm-num">{item.num}</p>
                <h3 className="mm-h3">{item.titre}</h3>
                <p className="mm-petit">{item.texte}</p>
              </div>
            ))}
          </div>
        </div>
        <Folio n={13} />
      </article>

      <article className="mm-page">
        <div className="mm-corps">
          <p className="mm-kicker">Page 14 — Partenaire d&apos;élite</p>
          <h2 className="mm-titre">ENERGIA CONSEIL IA®</h2>
          <p className="mm-texte">
            Bureau d&apos;études thermiques et Contractant Général. Marque déposée INPI n° 5213845. 16 Rue Cuvier, 69006 Lyon. SIRET 941 819 427 00019.
          </p>
          <p className="mm-texte">
            Catarina Martins porte le bien, le goût et la relation. Sylvain Lembelembe porte l&apos;étude, le prix ferme, la coordination et la décennale.
          </p>
          <p className="mm-note">Garantie décennale Calypso Assurances n° LUNPIB2604975. Protocole Sûreté-6™.</p>
        </div>
        <Folio n={14} />
      </article>

      <article className="mm-page">
        <div className="mm-corps">
          <p className="mm-kicker">Page 15 — Grille privilège</p>
          <h2 className="mm-titre">Modalités d&apos;intervention</h2>
          <p className="mm-texte">Consultation Duo — 390 € TTC — 1 h 30 sur site — déduite à 100 % si le mandat ou le chantier se poursuit.</p>
          <p className="mm-texte">Note d&apos;arbitrage vente ou rénovation : incluse dans la consultation.</p>
          <p className="mm-texte">Audit thermique et scénario de valorisation : forfait écrit à l&apos;issue de la visite, avant tout marché.</p>
          <p className="mm-texte">Cuisine, suite, verrière : chiffrage direct usine sur relevé et plan, prix ferme au marché.</p>
          <p className="mm-texte">Rénovation globale : prix contractuel ferme, Contractant Général, décennale 10 ans.</p>
          <p className="mm-note">
            Lorsque des aides sont visées, aucun devis définitif n&apos;est signé avant l&apos;accord écrit de l&apos;ANAH. Aides financières 2026 (estimation à titre indicatif). Montants définitifs après instruction ANAH et CEE.
          </p>
        </div>
        <Folio n={15} />
      </article>

      <article className="mm-page">
        <div className="mm-corps">
          <p className="mm-kicker">Page 16 — Discrétion</p>
          <h2 className="mm-titre">La vitrine privée</h2>
          <div className="mm-table">
            <div className="mm-cell" style={{ width: "62%" }}>
              <p className="mm-petit">Catarina Martins — 06 61 37 14 64</p>
              <p className="mm-petit">contact@catarinamartins-immobilier.fr</p>
              <p className="mm-petit" style={{ marginTop: "3mm" }}>
                Sylvain Lembelembe — ENERGIA CONSEIL IA® — 06 10 59 68 98
              </p>
              <p className="mm-petit">contact@energia-conseil-ia.com</p>
              <p className="mm-note">
                Partenaires d&apos;ingénierie &amp; financement : FABIEN (Vivons Courtier — Financement &amp; Gestion de patrimoine) · Julia (Conseil Juridique &amp; Actes Notariés) · Pôle Ingénierie &amp; Contractant Général ENERGIA CONSEIL IA®.
              </p>
            </div>
            <div className="mm-cell" style={{ width: "38%", textAlign: "center" }}>
              <QRCodeSVG value={URL_VITRINE} size={108} level="Q" includeMargin bgColor="#F6EFE4" fgColor="#0A0F1D" />
              <p className="mm-note">catarinamartins-immobilier.fr/valorisation</p>
            </div>
          </div>
          <p className="mm-note" style={{ marginTop: "6mm" }}>
            Document confidentiel, réservé aux clients reçus en consultation. Les biens, les études et les montants ne sont pas diffusés sans accord écrit.
          </p>
        </div>
        <Folio n={16} />
      </article>
    </div>
  );
}

function reserverConsultation() {
  const sujet = encodeURIComponent("Consultation Duo Maison Martins — 390 €");
  const corps = encodeURIComponent(
    "Bonjour Catarina, bonjour Sylvain,\n\nJe souhaite réserver la Consultation Duo (1 h 30 sur site, 390 € TTC).\n\nBien :\nCommune :\nDate souhaitée :\n\nCordialement",
  );
  window.location.href = `mailto:contact@catarinamartins-immobilier.fr?cc=contact@energia-conseil-ia.com&subject=${sujet}&body=${corps}`;
}

export default function CatalogueMaisonMartins() {
  const livreRef = useRef<HTMLDivElement>(null);
  const [pilier, setPilier] = useState(0);
  const [modele, setModele] = useState(0);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const choix = MODELES[modele];

  useEffect(() => {
    const id = "mm-book-fonts";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&display=swap";
    document.head.appendChild(link);
  }, []);

  const telecharger = async () => {
    if (!livreRef.current) return;
    setBusy(true);
    setMessage("");
    try {
      await telechargerBookMaisonMartins(livreRef.current);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Le PDF n'a pas pu être généré.");
    } finally {
      setBusy(false);
    }
  };

  const partager = async () => {
    const url = `${window.location.origin}${window.location.pathname}#maison-martins`;
    const texte = `MAISON MARTINS · Édition Privée — L'Art d'Habiter l'Exception\nConsultation Duo 390 € TTC · Catarina Martins & Sylvain Lembelembe\n${URL_VITRINE}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Maison Martins — Édition Privée", text: texte, url });
        return;
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(`${texte}\n${url}`);
      setMessage("Fiche privilège copiée.");
    } catch {
      setMessage(url);
    }
  };

  return (
    <div data-testid="catalogue-maison-martins" className="-mx-4 bg-[#0A0F1D] text-[#F4EDE0] sm:-mx-6 lg:-mx-8" style={{ fontFamily: CORPS }}>
      <style>{STYLE_LIVRE}</style>
      <header className="border-b border-[#D4AF37]/40 px-6 py-5 sm:px-10">
        <p className="text-[11px] uppercase tracking-[0.22em] text-[#D4AF37]" style={{ fontFamily: CINZEL }}>
          Maison Martins · Édition Privée
        </p>
        <h1 className="mt-2 max-w-4xl text-2xl leading-tight text-[#F6E7B2] sm:text-3xl" style={{ fontFamily: SERIF }}>
          La Signature Immobilière & Rénovation d&apos;Exception (Côte-d&apos;Or 21 & Saône-et-Loire 71)
        </h1>
        <p className="mt-3 text-sm text-[#E7E0D4]">
          En partenariat exclusif avec ENERGIA CONSEIL IA® — Contractant Général & bureau d&apos;études.
        </p>
      </header>

      <div className="sticky top-0 z-20 flex flex-col gap-3 border-b border-[#D4AF37]/30 bg-[#0A0F1D]/95 px-6 py-3 backdrop-blur sm:flex-row sm:px-10">
        <button
          type="button"
          data-testid="telecharger-book-maison-martins"
          onClick={() => void telecharger()}
          disabled={busy}
          className="bg-[#D4AF37] px-4 py-3 text-sm font-medium text-[#0A0F1D] disabled:opacity-60"
        >
          {busy ? "Préparation du book…" : "📥 Télécharger le Book Prestige PDF A4 (16 pages)"}
        </button>
        <button
          type="button"
          data-testid="partager-fiche-maison-martins"
          onClick={() => void partager()}
          className="border border-[#D4AF37] px-4 py-3 text-sm text-[#F6E7B2]"
        >
          📱 Partager la Fiche Privilège Client
        </button>
      </div>
      {message ? <p className="px-6 py-3 text-sm text-[#F6E7B2] sm:px-10">{message}</p> : null}

      <figure className="m-0">
        <img
          src={COUVERTURE}
          alt={ALT_COUVERTURE}
          data-testid="couverture-maison-martins"
          width={816}
          height={1024}
          draggable={false}
          className="block h-auto w-full max-w-none rounded-none border-0 shadow-none"
          style={{ imageRendering: "auto" }}
        />
      </figure>
      <p className="px-6 py-4 text-center text-sm tracking-[0.14em] text-[#D4AF37] uppercase sm:px-10" style={{ fontFamily: CINZEL }}>
        L&apos;Art d&apos;Habiter l&apos;Exception
      </p>

      <section className="mx-auto max-w-3xl px-6 py-10 sm:px-10" id="editorial">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF37]" style={{ fontFamily: CINZEL }}>
          L&apos;éditorial
        </p>
        <h2 className="mt-3 text-4xl text-[#F6E7B2]" style={{ fontFamily: SERIF }}>
          Le mot de Catarina Martins
        </h2>
        {MANIFESTE.map((p) => (
          <p className="mt-4 text-base leading-relaxed text-[#E7E0D4]" key={p}>
            {p}
          </p>
        ))}
        <p className="mt-6 text-xl text-[#D4AF37]" style={{ fontFamily: SERIF }}>
          Catarina Martins
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-6 sm:px-10" id="triptyque">
        <h2 className="text-4xl text-[#F6E7B2]" style={{ fontFamily: SERIF }}>
          Le triptyque, trois projets en un
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {PILIERS.map((item, index) => (
            <button
              key={item.num}
              type="button"
              aria-pressed={pilier === index}
              onClick={() => setPilier(index)}
              className={`border p-5 text-left ${pilier === index ? "border-[#D4AF37] bg-[#12182A]" : "border-[#D4AF37]/35 bg-[#0F172A]"}`}
            >
              <p className="text-xs tracking-[0.18em] text-[#D4AF37]" style={{ fontFamily: CINZEL }}>
                {item.num}
              </p>
              <h3 className="mt-3 text-2xl text-[#F6E7B2]" style={{ fontFamily: SERIF }}>
                {item.titre}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#E7E0D4]">{item.texte}</p>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-10 sm:px-10" id="consultation-duo">
        <div className="border border-[#D4AF37] bg-[#0F172A] p-6 sm:p-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF37]" style={{ fontFamily: CINZEL }}>
            Consultation Duo
          </p>
          <p className="mt-3 text-5xl text-[#D4AF37]" style={{ fontFamily: SERIF }}>
            390 €
          </p>
          <p className="mt-4 leading-relaxed text-[#E7E0D4]">
            1 h 30 sur site avec Catarina Martins (design et estimation) et Sylvain Lembelembe (ingénierie et travaux). Faut-il vendre en l&apos;état, ou rénover pour viser une plus-value supérieure ?
          </p>
          <p className="mt-3 text-sm text-[#C4B8A4]">
            Les 390 € sont déduits à 100 % des honoraires de mandat ou du marché de travaux lorsque la mission se poursuit.
          </p>
          <button type="button" onClick={reserverConsultation} className="mt-6 bg-[#D4AF37] px-4 py-3 text-sm font-medium text-[#0A0F1D]">
            Réserver une Consultation
          </button>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-6 sm:px-10" id="collections">
        <h2 className="text-4xl text-[#F6E7B2]" style={{ fontFamily: SERIF }}>
          Collections cuisines & suites de prestige
        </h2>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <img
            src={choix.image}
            alt={choix.titre}
            data-testid="visuel-collection-maison-martins"
            className="block h-[420px] w-full rounded-none border-0 object-cover"
            style={{ objectPosition: choix.position }}
          />
          <div>
            <p className="text-xs tracking-[0.18em] text-[#D4AF37] uppercase" style={{ fontFamily: CINZEL }}>
              {choix.matiere}
            </p>
            <h3 className="mt-2 text-3xl text-[#F6E7B2]" style={{ fontFamily: SERIF }}>
              {choix.titre}
            </h3>
            <p className="mt-4 leading-relaxed text-[#E7E0D4]">{choix.texte}</p>
            <div className="mt-6 grid gap-2">
              {MODELES.map((item, index) => (
                <button
                  key={item.titre}
                  type="button"
                  aria-pressed={modele === index}
                  onClick={() => setModele(index)}
                  className={`border px-3 py-2 text-left text-sm ${modele === index ? "border-[#D4AF37] text-[#F6E7B2]" : "border-[#D4AF37]/30 text-[#E7E0D4]"}`}
                >
                  {item.titre}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-10 sm:px-10">
        <h2 className="text-4xl text-[#F6E7B2]" style={{ fontFamily: SERIF }}>
          La métamorphose énergétique invisible
        </h2>
        <p className="mt-4 leading-relaxed text-[#E7E0D4]">
          Sortir une passoire F ou G vers une résidence de standing visée en A ou B, sans dénaturer la pierre. Plancher chauffant sous les tomettes, pompe à chaleur haute température discrète, isolation biosourcée. L&apos;isolation précède toujours le chauffage.
        </p>
        <p className="mt-4 text-xs leading-relaxed text-[#C4B8A4]">
          Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl items-start gap-4 px-6 py-6 md:grid-cols-2 sm:px-10">
        <article className="border border-[#D4AF37]/40 bg-[#0F172A] p-4">
          <img
            src="/images/maison_bourgeoise_beaune.jpg"
            alt="Hôtel particulier beaunois restauré : pierre de taille, balcons en fer forgé, cour pavée et topiaires."
            data-testid="visuel-beaune-maison-martins"
            className="block h-72 w-full rounded-2xl border border-[#D4AF37] object-cover object-[center_42%]"
          />
          <div className="px-2 pb-2 pt-5">
            <p className="text-xs tracking-[0.16em] text-[#D4AF37] uppercase" style={{ fontFamily: CINZEL }}>
              Beaune
            </p>
            <h3 className="mt-2 text-2xl text-[#F6E7B2]" style={{ fontFamily: SERIF }}>
              Maison bourgeoise
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#E7E0D4]">
              Rénovation globale et cuisine d&apos;art. Valeur vénale constatée : +180 000 €. Ce constat dépend du bien, de l&apos;état initial et du marché.
            </p>
          </div>
        </article>
        <article className="border border-[#D4AF37]/40 bg-[#0F172A] p-4">
          <img
            src="/images/propriete_viticole_chalon.jpg"
            alt="Propriété viticole en Saône-et-Loire : bastide en pierre dorée, vignes en coteaux et allée d'honneur au soleil couchant."
            data-testid="visuel-chalon-maison-martins"
            className="block h-72 w-full rounded-2xl border border-[#D4AF37] object-cover object-center"
          />
          <div className="px-2 pb-2 pt-5">
            <p className="text-xs tracking-[0.16em] text-[#D4AF37] uppercase" style={{ fontFamily: CINZEL }}>
              Chalon · Saône-et-Loire
            </p>
            <h3 className="mt-2 text-2xl text-[#F6E7B2]" style={{ fontFamily: SERIF }}>
              Propriété viticole
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-[#E7E0D4]">
              Restauration et valorisation énergétique clé en main, sous la signature Maison Martins et l&apos;exécution ENERGIA CONSEIL IA®.
            </p>
          </div>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-10 sm:px-10" id="garanties">
        <h2 className="text-4xl text-[#F6E7B2]" style={{ fontFamily: SERIF }}>
          Charte des quatre garanties
        </h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {GARANTIES.map((item) => (
            <article key={item.num} className="border border-[#D4AF37]/40 p-5">
              <p className="text-xs tracking-[0.16em] text-[#D4AF37]" style={{ fontFamily: CINZEL }}>
                {item.num}
              </p>
              <h3 className="mt-2 text-2xl text-[#F6E7B2]" style={{ fontFamily: SERIF }}>
                {item.titre}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#E7E0D4]">{item.texte}</p>
            </article>
          ))}
        </div>
      </section>

      <Livre innerRef={livreRef} />
    </div>
  );
}
