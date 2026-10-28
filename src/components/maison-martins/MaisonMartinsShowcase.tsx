import { useEffect, useId, useState, type FormEvent, type ReactNode } from "react";
import {
  CONSULTATION_DUO_CATARINA,
  MONTANT_CONSULTATION_DUO_TTC,
  SOURCE_APPORTEUR_CATARINA,
  libelleSourceApporteur,
} from "../../lib/crm/operationnelCrm.js";

const OR = "#D4AF37";
const LOGO_MAISON = "/assets/maison-martins/logo-maison-martins.jpg";

function Blason({ className = "h-12 w-12" }: { className?: string }) {
  return (
    <span className={`relative inline-block shrink-0 overflow-hidden rounded-md border border-[#D4AF37]/50 bg-black ${className}`}>
      <img
        src={LOGO_MAISON}
        alt=""
        className="absolute left-1/2 top-[-42%] h-[230%] w-[230%] max-w-none -translate-x-1/2"
      />
    </span>
  );
}

const DEPARTEMENTS = [
  {
    numero: "I",
    titre: "Belles Demeures & Propriétés Viticoles",
    texte:
      "Transactions discrètes et biens d'exception off-market sur Beaune, Chagny, Côte de Nuits et Saône-et-Loire.",
    ancre: "#domaine",
  },
  {
    numero: "II",
    titre: "L'Atelier d'Intérieur & Cuisines Haute Couture",
    texte:
      "Mobilier exclusif direct usine d'Italie, plans Dekton & Silestone, profils gorge noir mat, verre fumé rétroéclairé.",
    ancre: "#cuisines",
  },
  {
    numero: "III",
    titre: "Haute Rénovation & Contractant Général",
    texte:
      "Ingénierie thermique, conformité DPE, gros œuvre et exécution clé en main sous garantie décennale.",
    ancre: "#consultation",
  },
] as const;

const RUBRIQUES = [
  {
    id: "cuisines",
    index: "01",
    titre: "Cuisines Monolithes & Lignes Minérales",
    image: "/assets/maison-martins/maison-martins-cuisine.jpg",
    alt: "Cuisine monolithe en marbre blanc, gorge noir mat et laiton brossé",
    chapeau:
      "Un bloc de pierre, une ligne noire, un éclat de laiton. La cuisine se tient comme une pièce d'architecture, pas comme un équipement.",
    details: [
      "Plans Dekton marbre blanc Carrara",
      "Profil gorge noir mat",
      "Laiton brossé",
      "Électroménager haut de gamme Bora et Gaggenau",
    ],
  },
  {
    id: "salons",
    index: "02",
    titre: "Salons de Réception & Matières Nobles",
    image: "/assets/maison-martins/maison-martins-salon.jpg",
    alt: "Salon de réception avec cheminée suspendue, claustra de chêne et velours nuit",
    chapeau:
      "Le salon reçoit. Le feu est suspendu, le chêne filtre la lumière, le velours absorbe la voix.",
    details: [
      "Cheminées suspendues",
      "Claustras chêne texturé",
      "Velours nuit",
      "Acoustique feutrée",
    ],
  },
  {
    id: "suites",
    index: "03",
    titre: "Suites Parentales & Bains Privés",
    image: "/assets/maison-martins/maison-martins-suite.jpg",
    alt: "Suite parentale avec dressing rétroéclairé et vasque en pierre taillée",
    chapeau:
      "Une suite se traverse en silence : le dressing s'allume avant la pièce, la pierre tient l'eau, le laiton disparaît dans le mur.",
    details: [
      "Dressings cathédrale rétroéclairés LED",
      "Vasques pierre taillée",
      "Robinetterie encastrée laiton",
    ],
  },
  {
    id: "bureaux",
    index: "04",
    titre: "Bureaux Prestige & Salons Dirigeants",
    image: "/assets/maison-martins/maison-martins-bureau.jpg",
    alt: "Bureau de direction en boiseries de noyer et bibliothèque rétroéclairée",
    chapeau:
      "Le bureau d'un dirigeant ne montre pas la technique. Le noyer porte la pièce, la bibliothèque éclaire, la domotique reste invisible.",
    details: [
      "Boiseries noyer sur-mesure",
      "Bibliothèques rétroéclairées",
      "Domotique invisible",
    ],
  },
  {
    id: "domaine",
    index: "05",
    titre: "Domaines & Maisons de Maître",
    image: "/assets/maison-martins/maison-martins-domaine.jpg",
    alt: "Maison de maître en pierre de Bourgogne, cour et vignoble au soleil couchant",
    chapeau:
      "La pierre reste la pierre. La rénovation thermique se glisse dans le bâti, et la valeur du domaine suit.",
    details: [
      "Patrimoine en pierre de Bourgogne",
      "Rénovation thermique invisible",
      "Valorisation patrimoniale",
    ],
  },
] as const;

const INTENTIONS = [
  "Arbitrage Vente VS Rénovation",
  "Mise en vente discrète",
  "Haute rénovation clé en main",
] as const;

const NATURES_PROJET = [
  "Belles Demeures & Propriétés Viticoles",
  "Atelier d'Intérieur & Cuisines Haute Couture",
  "Haute Rénovation & Contractant Général",
] as const;

type Modale = "duo" | "projet" | null;
type NoteLegale = "mentions" | "confidentialite" | null;

type FormDuo = {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  ville: string;
  codePostal: string;
  adresse: string;
  date: string;
  intention: (typeof INTENTIONS)[number];
  consentement: boolean;
};

type FormProjet = {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  ville: string;
  codePostal: string;
  adresse: string;
  nature: (typeof NATURES_PROJET)[number];
  message: string;
  consentement: boolean;
};

type Succes = { titre: string; detail: string };

const DUO_VIDE: FormDuo = {
  prenom: "",
  nom: "",
  telephone: "",
  email: "",
  ville: "",
  codePostal: "",
  adresse: "",
  date: "",
  intention: INTENTIONS[0],
  consentement: false,
};

const PROJET_VIDE: FormProjet = {
  prenom: "",
  nom: "",
  telephone: "",
  email: "",
  ville: "",
  codePostal: "",
  adresse: "",
  nature: NATURES_PROJET[2],
  message: "",
  consentement: false,
};

function aujourdhuiIso() {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function telephoneValide(valeur: string) {
  const chiffres = valeur.replace(/\D/g, "");
  return (chiffres.length === 10 && chiffres.startsWith("0")) || (chiffres.length === 11 && chiffres.startsWith("33"));
}

function emailValide(valeur: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur.trim());
}

function messageErreur(erreurs: Record<string, string> | undefined) {
  if (!erreurs) return "Le dossier n'a pas pu être créé.";
  return Object.values(erreurs).find(Boolean) || "Le dossier n'a pas pu être créé.";
}

const STORAGE_LEADS = "energia-crm-projets-manuels-v1";

function nomCompare(valeur: string) {
  return valeur
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function deposerLead(entree: {
  prenom: string;
  nom: string;
  telephone: string;
  email: string;
  ville: string;
  codePostal: string;
  adresse: string;
  typeProjet: string;
  description: string;
  montantEstimeTtc?: number;
  consultationDuo?: boolean;
  dateVisiteTechnique?: string;
}) {
  const nom = entree.nom.trim();
  const prenom = entree.prenom.trim();
  const ville = entree.ville.trim();
  const codePostal = entree.codePostal.trim();
  const erreurs: Record<string, string> = {};
  if (nom.length < 2) erreurs.nom = "Nom du client requis.";
  if (ville.length < 2) erreurs.ville = "Ville requise.";
  if (!/^\d{5}$/.test(codePostal)) erreurs.codePostal = "Code postal à 5 chiffres.";
  if (Object.keys(erreurs).length > 0) return { ok: false as const, erreurs, projet: undefined };

  let liste: Array<Record<string, unknown>> = [];
  try {
    const brut = localStorage.getItem(STORAGE_LEADS);
    const lu = brut ? JSON.parse(brut) : [];
    if (Array.isArray(lu)) liste = lu;
  } catch {
    liste = [];
  }

  const doublon = liste.some((item) => {
    return (
      nomCompare(String(item.nom ?? "")) === nomCompare(nom) &&
      nomCompare(String(item.ville ?? "")) === nomCompare(ville) &&
      String(item.codePostal ?? "") === codePostal
    );
  });
  if (doublon) {
    return {
      ok: false as const,
      erreurs: { nom: "Un dossier existe déjà pour ce client et cette localisation." },
      projet: undefined,
    };
  }

  const montantEstimeTtc = entree.montantEstimeTtc ?? null;
  const projet = {
    id: `projet-manuel-${Date.now()}`,
    nom,
    prenom,
    ville,
    codePostal,
    rfr: null,
    statut: "Nouveau Lead — À Contacter",
    typeProjet: entree.typeProjet,
    description: entree.description,
    montantEstimeTtc,
    montantHt: montantEstimeTtc == null ? null : Math.round((montantEstimeTtc / 1.1) * 100) / 100,
    equipe: {
      direction: "Sylvain LEMBELEMBE",
      commercial: "Damien",
      design: "Catarina Martins",
      coordination: "Mohamed",
    },
    apporteurId: SOURCE_APPORTEUR_CATARINA,
    apporteurNom: libelleSourceApporteur(SOURCE_APPORTEUR_CATARINA, { select: true }),
    consultationDuo: entree.consultationDuo === true,
    dateVisiteTechnique: entree.dateVisiteTechnique || "",
    source: "manuel",
    createdAt: new Date().toISOString().slice(0, 10),
    adresse: entree.adresse.trim(),
    telephone: entree.telephone.trim(),
    email: entree.email.trim(),
    archive: false,
    jalonsValides: [],
    travaux: [],
  };
  liste.push(projet);
  localStorage.setItem(STORAGE_LEADS, JSON.stringify(liste));
  return { ok: true as const, erreurs: undefined, projet };
}

function Champ({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#C4B48A]">
      {label}
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

const inputClass =
  "w-full border border-[#D4AF37]/30 bg-[#0B0F17] px-3 py-3 text-sm normal-case tracking-normal text-[#F4EFE6] outline-none transition placeholder:text-[#8C8272] focus:border-[#D4AF37]";

const LIBELLE_CARNET = "[ 📖 Consulter le Carnet de Tendances & Matières 2026 ]";
const LIBELLE_ATELIER_SALONS = "[ 🛋️ Explorer l'Atelier Boiseries, Cheminées & Salons Privés ]";
const LIBELLE_ATELIER_SUITES = "[ 🛁 Découvrir l'Atelier Bains Privés & Dressings d'Exception ]";
const LIBELLE_ATELIER_BUREAUX = "[ 🏛️ Découvrir l'Atelier Bureaux Prestige & Espaces Dirigeants ]";
const LIBELLE_ATELIER_DOMAINES = "[ 🏰 Découvrir l'Atelier Domaines, Châteaux & Rénovation Patrimoniale ]";

const COLLECTIONS = [
  {
    index: "01",
    titre: "Minérale & Chêne Texturé",
    ambiance: "L'élégance brute contemporaine.",
    image: "/assets/maison-martins/collection-minerale.jpg",
    alt: "Cuisine en chêne brossé foncé, plan Dekton noir mat et vitrines en verre fumé",
    specs: [
      "Façades en chêne brossé texturé foncé",
      "Plan de travail monolithique en Dekton noir mat texturé",
      "Profils gorge invisibles noir mat",
      "Vitrines suspendues en verre fumé avec rétroéclairage LED chaud 2700K",
    ],
  },
  {
    index: "02",
    titre: "Manoir Contemporain & Pierre de Bourgogne",
    ambiance: "L'esprit bastide et domaine viticole revisité.",
    image: "/assets/maison-martins/collection-manoir.jpg",
    alt: "Cuisine de manoir en pierre de Bourgogne, piano de cuisson et laiton brossé",
    specs: [
      "Cadres moulurés fins laqués lin doux",
      "Plan de travail en pierre naturelle de Bourgogne / Dekton marbré chaud",
      "Piano de cuisson d'apparat en fonte émaillée",
      "Poignées bijou en laiton brossé",
    ],
  },
  {
    index: "03",
    titre: "Vert Sauge Poudré & Laiton Brossé",
    ambiance: "La grande tendance organique et lumineuse des beaux appartements et maisons de maître.",
    image: "/assets/maison-martins/collection-sauge.jpg",
    alt: "Cuisine vert sauge mat, îlot de marbre doré et suspensions en laiton brossé",
    specs: [
      "Façades vert sauge mat anti-traces",
      "Îlot central en Silestone blanc pur marbré doré",
      "Robinetterie encastrée en laiton brossé véritable",
      "Suspensions en laiton brossé véritable",
    ],
  },
  {
    index: "04",
    titre: "Monolithe Blanc & Verre Fumé Bronze",
    ambiance: "Minimalisme architectural radical italien.",
    image: "/assets/maison-martins/collection-monolithe.jpg",
    alt: "Bloc central en Dekton blanc Carrara, verre fumé bronze et cave de dégustation",
    specs: [
      "Bloc central sculpté en Dekton blanc Carrara sans aucun joint visible",
      "Portes d'armoires en verre fumé bronze rétroéclairé",
      "Caves à vin de dégustation intégrées",
      "Aspiration descendante Bora invisible",
    ],
  },
] as const;

const NUANCIER = [
  {
    famille: "Surfaces Minérales",
    teintes: [
      { id: "entzo", nom: "Dekton Entzo", note: "Blanc veiné or.", fond: "linear-gradient(125deg,#f7f3ea 0%,#f4ecda 27%,#d4af37 28.2%,#fbf7ef 30%,#efe4cc 54%,#c6a15a 55.2%,#faf6ee 57%,#e7dcc4 100%)" },
      { id: "laurent", nom: "Dekton Laurent", note: "Noir impérial veiné or.", fond: "linear-gradient(128deg,#101114 0%,#1c1c1f 33%,#d4af37 34.2%,#121316 36.5%,#2a2418 61%,#b8922e 62.2%,#0c0d10 64%,#1a1b1e 100%)" },
      { id: "calacatta", nom: "Silestone Calacatta Gold", note: "Blanc pur, veines d'or.", fond: "linear-gradient(118deg,#fbf8f2 0%,#f3eee4 38%,#e2c57a 39.4%,#fffdf8 42%,#f6efe2 68%,#c9a24e 69.3%,#faf6ee 100%)" },
    ],
  },
  {
    famille: "Bois d'Atelier",
    teintes: [
      { id: "chene", nom: "Chêne de Bourgogne brossé", note: "Grain ouvert, ton miel sombre.", fond: "repeating-linear-gradient(90deg,#6b4a2e 0 7px,#5a3d26 7px 9px,#7a5534 9px 16px,#4a3120 16px 18px)" },
      { id: "noyer", nom: "Noyer d'Amérique huilé", note: "Brun profond, satiné.", fond: "linear-gradient(180deg,#4a2e1c 0%,#6a4630 42%,#2c1a10 100%)" },
      { id: "frene", nom: "Frêne teinté noir charbon", note: "Pore clair sur fond charbon.", fond: "repeating-linear-gradient(90deg,#2a2a28 0 6px,#3a3a36 6px 8px,#1c1c1a 8px 14px,#32322e 14px 16px)" },
    ],
  },
  {
    famille: "Métaux Précieux",
    teintes: [
      { id: "laiton", nom: "Laiton brossé satiné", note: "Or pâle, brossé dans le sens.", fond: "linear-gradient(160deg,#f6e7b2 0%,#d4af37 42%,#8c7340 72%,#f3e5ab 100%)" },
      { id: "noir-mat", nom: "Noir mat poudré", note: "Poudre fine, sans reflet.", fond: "radial-gradient(circle at 30% 28%,#3a3a3a,#141414 62%)" },
      { id: "bronze", nom: "Bronze vieilli", note: "Patine chaude, irrégulière.", fond: "linear-gradient(145deg,#c4925a 0%,#6e4b2a 46%,#d4af37 72%,#5c3d22 100%)" },
    ],
  },
  {
    famille: "Verres d'Exception",
    teintes: [
      { id: "fume", nom: "Verre fumé anthracite", note: "Transparence sombre.", fond: "linear-gradient(160deg,rgba(210,210,214,.45),rgba(14,16,20,.92)),linear-gradient(#2a2e33,#0e1014)" },
      { id: "cannele", nom: "Verre cannelé atelier rétroéclairé", note: "Cannelures, lumière 2700K.", fond: "repeating-linear-gradient(90deg,rgba(255,214,150,.72) 0 3px,rgba(42,32,18,.82) 3px 11px)" },
    ],
  },
] as const;

type Teinte = (typeof NUANCIER)[number]["teintes"][number];

const AMBIANCES_SALONS = [
  {
    index: "01",
    titre: "Le Grand Salon Contemporain & Foyer Suspendu",
    image: "/assets/maison-martins/ambiance-salon-foyer.jpg",
    alt: "Foyer suspendu en acier noir, canapé de velours nuit et table en marbre Nero Marquina",
    specs: [
      "Foyer d'architecte suspendu en acier noir sablé pivotant 360°.",
      "Canapés d'éditeurs italiens modulaires en velours nuit profond et cuir pleine fleur.",
      "Table basse sculpturale en marbre Nero Marquina et piètement laiton brossé.",
    ],
  },
  {
    index: "02",
    titre: "L'Atelier Boiseries & Acoustique Feutrée",
    image: "/assets/maison-martins/ambiance-salon-boiseries.jpg",
    alt: "Panneaux de noyer rainurés et bibliothèque rétroéclairée d'ambre",
    specs: [
      "Panneaux muraux monumentaux en Noyer Canaletto texturé avec rainurage acoustique.",
      "Bibliothèques ouvertes sur-mesure avec rétroéclairage vertical ambré invisible.",
      "Domotique scénarisée (mode « Réception », mode « Feu de cheminée », mode « Soirée privée »).",
    ],
  },
  {
    index: "03",
    titre: "Le Fumoir Privé & Salon Dégustation Grands Crus",
    image: "/assets/maison-martins/ambiance-salon-fumoir.jpg",
    alt: "Cave monumentale en verre fumé, laiton vieilli et fauteuils de cuir havane",
    specs: [
      "Vitrine cave à vin monumentale climatisée intégrée en verre fumé et montants laiton vieilli.",
      "Fauteuils lounge tapissés cuir havane aniline et assises feutrées.",
      "Isolation acoustique renforcée pour une discrétion absolue des échanges.",
    ],
  },
] as const;

const SANCTUAIRES_SUITES = [
  {
    index: "01",
    titre: "Le Bain Monolithe & Pierre de Bourgogne",
    image: "/assets/maison-martins/sanctuaire-bain-monolithe.jpg",
    alt: "Baignoire îlot en pierre, robinetterie laiton brossé et douche cathédrale sans seuil",
    specs: [
      "Baignoire îlot sculpturale posée sur sol en pierre calcaire adoucie avec drainage invisible.",
      "Robinetterie murale encastrée en laiton brossé biseauté (esprit haute joaillerie italienne).",
      "Douche cathédrale à l'italienne sans seuil avec ciel de pluie affleurant et banc maçonné chauffant.",
    ],
  },
  {
    index: "02",
    titre: "Le Dressing Haute Couture & Miroirs Bronze",
    image: "/assets/maison-martins/sanctuaire-dressing-bronze.jpg",
    alt: "Dressing en noyer foncé, portes de verre fumé bronze et îlot gainé de suédine",
    specs: [
      "Armoires et dressings ouverts sur-mesure réalisés en direct usine Italie en noyer foncé ou chêne fumé.",
      "Portes vitrées en verre trempé fumé bronze avec profils aluminium ultra-fins et éclairage LED vertical 2700K à allumage silencieux.",
      "Îlot central avec tiroirs gainés de suédine pour horlogerie et joaillerie.",
    ],
  },
  {
    index: "03",
    titre: "La Suite Spa Privative & Hammam Intégré",
    image: "/assets/maison-martins/sanctuaire-suite-spa.jpg",
    alt: "Hammam maçonné, banquettes chauffantes et lumière basse",
    specs: [
      "Hammam maçonné avec générateur de vapeur dissimulé, aromathérapie et banquettes ergonomiques chauffantes.",
      "Cloisons acoustiques haute performance préservant le silence absolu de la chambre.",
      "Scénarios d'éclairage circadien synchronisés sur les rythmes naturels du jour et de la nuit.",
    ],
  },
] as const;

const ESPACES_BUREAUX = [
  {
    index: "01",
    titre: "Le Bureau Monumental & Cuir Sellier",
    image: "/assets/maison-martins/espace-bureau-sellier.jpg",
    alt: "Bureau en Noyer Canaletto, sous-main de cuir cousu main et fauteuil de direction",
    specs: [
      "Bureau d'apparat en Noyer Canaletto texturé avec sous-main en cuir pleine fleur cousu main.",
      "Connectique escamotable et chargeurs par induction intégrés dans la masse du bois (zéro câble visible).",
      "Fauteuil de direction ergonomique gainé de cuir italien et éclairage de travail scénarisé.",
    ],
  },
  {
    index: "02",
    titre: "La Bibliothèque Murale Rétroéclairée & Boiseries Confidentielles",
    image: "/assets/maison-martins/espace-bibliotheque-boiseries.jpg",
    alt: "Boiserie toute hauteur, étagères rétroéclairées et laiton bruni",
    specs: [
      "Habillage mural complet toute hauteur avec montants laiton bruni et étagères rétroéclairées LED 2700K.",
      "Panneau secret intégré sous boiserie dissimulant un coffre-fort biométrique et rangements confidentiels.",
      "Isolation et baffles acoustiques invisibles assurant une confidentialité phonique absolue des échanges.",
    ],
  },
  {
    index: "03",
    titre: "Le Salon de Négociation Privé & Cave Escamotable",
    image: "/assets/maison-martins/espace-negociation-cave.jpg",
    alt: "Fauteuils club cuir havane, table en pierre de Bourgogne et bar secret",
    specs: [
      "Espace lounge confidentiel avec fauteuils club cuir havane et table basse sculptée en pierre de Bourgogne.",
      "Meuble bar secret intégré avec ouverture motorisée invisible pour la dégustation de millésimes d'exception.",
      "Domotique invisible (scénarios « Travail de fond », « Entretien privé », « Signature de contrat »).",
    ],
  },
] as const;

const PILIERS_DOMAINES = [
  {
    index: "01",
    titre: "La Rénovation Thermique Invisible & Conforme ABF",
    image: "/assets/maison-martins/pilier-thermique-abf.jpg",
    alt: "Intérieur de maison de maître en pierre calcaire, menuiseries bois et lumière douce",
    specs: [
      "Isolation perspirante biosourcée en chaux-chanvre et laine de bois respectant l'hygrométrie de la pierre calcaire de Bourgogne.",
      "Chauffage thermodynamique haute température dissimulé en dépendance avec planchers chauffants sous dallages anciens.",
      "Menuiseries traditionnelles bois sur-mesure à mouton et gueule-de-loup avec verres thermiques invisibles conformes aux Architectes des Bâtiments de France.",
    ],
  },
  {
    index: "02",
    titre: "La Restauration des Caves Voûtées & Matières d'Époque",
    image: "/assets/maison-martins/pilier-caves-voutees.jpg",
    alt: "Cave voûtée restaurée en salle de dégustation, pierre et chêne",
    specs: [
      "Réhabilitation des caves séculaires en espaces de dégustation d'exception avec régulation hygrométrique de précision.",
      "Rénovation des charpentes monumentales en chêne de Bourgogne, toitures en tuiles plates et cheminées d'apparat.",
      "Réemploi et taille de pierre de taille locale pour des extensions contemporaines parfaitement intégrées au bâti historique.",
    ],
  },
  {
    index: "03",
    titre: "Valorisation Foncière & Sortie de Passoire Thermique",
    image: "/assets/maison-martins/pilier-valorisation-domaine.jpg",
    alt: "Domaine de pierre restauré au crépuscule, vignes et toiture en tuiles plates",
    specs: [
      "Saut de 2 à 4 classes énergétiques (passage de F/G à B/C) sans altérer l'âme patrimoniale du domaine.",
      "Augmentation immédiate de la valeur vénale de +20 % à +35 % validée par expertise notariale.",
      "Ingénierie administrative complète, mobilisation des subventions de l'État (MaPrimeRénov' Parcours Accompagné) et défiscalisation patrimoniale.",
    ],
  },
] as const;

const ATELIERS = {
  salons: {
    libelle: LIBELLE_ATELIER_SALONS,
    bandeau: "Maison Martins · Salons de réception",
    rubrique: "Rubrique 02",
    titre: "Atelier Boiseries, Cheminées & Salons Privés",
    intro: "Trois ambiances pour recevoir. Le feu, le noyer, le grand cru. Chaque salon se compose comme une pièce d'apparat, puis se vit dans le silence.",
    hero: "/assets/maison-martins/maison-martins-salon.jpg",
    heroAlt: "Salon de réception avec cheminée suspendue, claustra de chêne et velours nuit",
    prefixe: "Ambiance",
    unites: AMBIANCES_SALONS,
    cloture:
      "Menuiseries d'agencement et mobiliers réalisés en direct d'ateliers d'ébénisterie italiens. Études acoustiques, thermiques et réalisation clé en main par ENERGIA CONSEIL IA®.",
    action: "Intégrer un Salon de Réception",
    mentionAides: false,
  },
  suites: {
    libelle: LIBELLE_ATELIER_SUITES,
    bandeau: "Maison Martins · Suites parentales",
    rubrique: "Rubrique 03",
    titre: "Atelier Bains Privés & Dressings d'Exception",
    intro: "Trois sanctuaires. La pierre tient l'eau, le bronze habille le vêtement, le hammam reste de l'autre côté du silence.",
    hero: "/assets/maison-martins/maison-martins-suite.jpg",
    heroAlt: "Suite parentale avec dressing rétroéclairé et vasque en pierre taillée",
    prefixe: "Sanctuaire",
    unites: SANCTUAIRES_SUITES,
    cloture:
      "Conception sur-mesure Italie, étanchéité sous carrelage certifiée CSTB et coordination tout corps d'état sous la garantie décennale d'ENERGIA CONSEIL IA® (Contractant Général).",
    action: "Concevoir votre Suite Parentale",
    mentionAides: false,
  },
  bureaux: {
    libelle: LIBELLE_ATELIER_BUREAUX,
    bandeau: "Maison Martins · Espaces dirigeants",
    rubrique: "Rubrique 04",
    titre: "Atelier Bureaux Prestige & Espaces Dirigeants",
    intro: "Trois espaces pour décider. Le bois porte le bureau, la boiserie garde le secret, le salon ne montre rien de la technique.",
    hero: "/assets/maison-martins/maison-martins-bureau.jpg",
    heroAlt: "Bureau de direction en boiseries de noyer et bibliothèque rétroéclairée",
    prefixe: "Espace",
    unites: ESPACES_BUREAUX,
    cloture:
      "Ébénisterie d'art et agencements de direction réalisés sur-mesure en direct usine Italie. Réseau sécurisé, isolation phonique et réalisation clé en main par ENERGIA CONSEIL IA® (Contractant Général).",
    action: "Aménager votre Espace Dirigeant",
    mentionAides: false,
  },
  domaine: {
    libelle: LIBELLE_ATELIER_DOMAINES,
    bandeau: "Maison Martins · Domaines & maisons de maître",
    rubrique: "Rubrique 05",
    titre: "Atelier Domaines, Châteaux & Rénovation Patrimoniale",
    intro: "Trois piliers. La pierre respire, la cave redevient un lieu de dégustation, la valeur du domaine suit le saut de classe.",
    hero: "/assets/maison-martins/maison-martins-domaine.jpg",
    heroAlt: "Maison de maître en pierre de Bourgogne, cour et vignoble au soleil couchant",
    prefixe: "Pilier",
    unites: PILIERS_DOMAINES,
    cloture:
      "Ingénierie climatique patrimoniale, respect scrupuleux du bâti ancien et pilotage tout corps d'état sous la garantie décennale d'ENERGIA CONSEIL IA® (Contractant Général certifié).",
    action: "Arbitrer la Rénovation de votre Domaine",
    mentionAides: true,
  },
} as const;

type AtelierId = keyof typeof ATELIERS;

function BoutonOr({ libelle, onClick }: { libelle: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="border border-[#D4AF37] bg-transparent px-4 py-3 text-left text-[11px] normal-case tracking-[0.06em] text-[#F6E7B2] transition hover:bg-[#D4AF37] hover:text-[#0B0F17] sm:text-xs"
    >
      {libelle}
    </button>
  );
}

function CarnetInspirations({ onFermer, onConsultation }: { onFermer: () => void; onConsultation: () => void }) {
  const titre = useId();
  const premiere = NUANCIER[0].teintes[0];
  const [actif, setActif] = useState<Teinte>(premiere);
  const familleActive = NUANCIER.find((groupe) => groupe.teintes.some((teinte) => teinte.id === actif.id))?.famille ?? "";

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B0F17] text-[#F4EFE6]" role="dialog" aria-modal="true" aria-labelledby={titre}>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#D4AF37]/25 bg-[#0B0F17]/90 px-5 py-4 backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#D4AF37] sm:text-[11px]">Maison Martins · 2026-2027</p>
        <button type="button" className="border border-[#D4AF37]/50 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-[#F6E7B2]" onClick={onFermer}>
          Fermer
        </button>
      </div>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <h2 id={titre} className="mm-serif max-w-4xl text-4xl leading-tight text-[#F6E7B2] sm:text-6xl">
          Carnet d&apos;Inspirations &amp; Nuancier de Matières 2026-2027
        </h2>
        <div className="mt-16 space-y-16">
          {COLLECTIONS.map((collection, index) => (
            <article key={collection.index} className="grid items-center gap-8 border-t border-[#D4AF37]/15 pt-12 lg:grid-cols-2 lg:gap-12">
              <img
                src={collection.image}
                alt={collection.alt}
                className={`aspect-[16/10] w-full border border-[#D4AF37]/20 object-cover ${index % 2 === 1 ? "lg:order-2" : ""}`}
              />
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <p className="text-[11px] tracking-[0.32em] text-[#D4AF37]">Collection {collection.index}</p>
                <h3 className="mm-serif mt-3 text-4xl leading-tight text-[#F6E7B2]">{collection.titre}</h3>
                <p className="mt-4 text-sm italic text-[#C4B48A]">{collection.ambiance}</p>
                <ul className="mt-5 space-y-2 text-sm text-[#E7E0D4]">
                  {collection.specs.map((spec) => (
                    <li key={spec} className="flex gap-3">
                      <span className="mt-[0.55em] h-px w-6 shrink-0 bg-[#D4AF37]" aria-hidden />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-20 border-t border-[#D4AF37]/20 pt-14">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[#D4AF37]">Atelier</p>
          <h3 className="mm-serif mt-3 text-4xl text-[#F6E7B2]">Nuancier des matières</h3>
          <p className="mt-3 max-w-xl text-sm text-[#C9C0B2]">Survolez un échantillon. La matière se nomme.</p>
          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_.8fr]">
            <div className="space-y-7">
              {NUANCIER.map((groupe) => (
                <div key={groupe.famille}>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#C4B48A]">{groupe.famille}</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {groupe.teintes.map((teinte) => (
                      <button
                        key={teinte.id}
                        type="button"
                        aria-label={teinte.nom}
                        aria-pressed={actif.id === teinte.id}
                        onMouseEnter={() => setActif(teinte)}
                        onFocus={() => setActif(teinte)}
                        onClick={() => setActif(teinte)}
                        className="h-16 w-16 border border-[#D4AF37]/25 transition hover:-translate-y-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37] sm:h-20 sm:w-20"
                        style={{
                          background: teinte.fond,
                          boxShadow: actif.id === teinte.id ? "0 0 0 1px #D4AF37, 0 12px 30px rgba(0,0,0,.35)" : undefined,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <aside className="border border-[#D4AF37]/30 bg-[#121824] p-6">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#D4AF37]">{familleActive}</p>
              <div className="mt-5 h-28 w-full border border-[#D4AF37]/20" style={{ background: actif.fond }} />
              <h4 className="mm-serif mt-5 text-3xl text-[#F6E7B2]">{actif.nom}</h4>
              <p className="mt-2 text-sm text-[#C9C0B2]">{actif.note}</p>
            </aside>
          </div>
        </section>

        <section className="mt-16 border border-[#D4AF37]/35 bg-[#121824] px-6 py-8 sm:px-10">
          <p className="mm-serif text-2xl leading-snug text-[#F6E7B2] sm:text-3xl">
            Tous nos modèles sont réalisés sur-mesure en direct usine Italie et posés sous la garantie décennale d&apos;ENERGIA CONSEIL IA® (Contractant Général).
          </p>
          <button
            type="button"
            onClick={onConsultation}
            className="mt-8 bg-[#D4AF37] px-5 py-4 text-left text-sm font-medium text-[#0B0F17] transition hover:bg-[#F6E7B2]"
          >
            {`[ Découvrir les échantillons physiques lors de la Consultation Duo (${MONTANT_CONSULTATION_DUO_TTC} €) ]`}
          </button>
        </section>
      </div>
    </div>
  );
}

function AtelierModale({
  fiche,
  onFermer,
  onConsultation,
}: {
  fiche: (typeof ATELIERS)[AtelierId];
  onFermer: () => void;
  onConsultation: () => void;
}) {
  const titre = useId();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0B0F17] text-[#F4EFE6]" role="dialog" aria-modal="true" aria-labelledby={titre}>
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-[#D4AF37]/25 bg-[#0B0F17]/90 px-5 py-4 backdrop-blur-md">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#D4AF37] sm:text-[11px]">{fiche.bandeau}</p>
        <button type="button" className="border border-[#D4AF37]/50 px-3 py-2 text-[11px] uppercase tracking-[0.16em] text-[#F6E7B2]" onClick={onFermer}>
          Fermer
        </button>
      </div>
      <div className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <p className="text-[11px] uppercase tracking-[0.32em] text-[#D4AF37]">{fiche.rubrique}</p>
        <h2 id={titre} className="mm-serif mt-3 max-w-4xl text-4xl leading-tight text-[#F6E7B2] sm:text-6xl">
          {fiche.titre}
        </h2>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-[#C9C0B2] sm:text-base">{fiche.intro}</p>
        <img src={fiche.hero} alt={fiche.heroAlt} className="mt-12 aspect-[16/8] w-full border border-[#D4AF37]/20 object-cover" />
        <div className="mt-16 space-y-16">
          {fiche.unites.map((unite, index) => (
            <article key={unite.index} className="grid items-center gap-8 border-t border-[#D4AF37]/15 pt-12 lg:grid-cols-2 lg:gap-12">
              <img
                src={unite.image}
                alt={unite.alt}
                className={`aspect-[16/10] w-full border border-[#D4AF37]/20 object-cover ${index % 2 === 1 ? "lg:order-2" : ""}`}
              />
              <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                <p className="text-[11px] tracking-[0.32em] text-[#D4AF37]">
                  {fiche.prefixe} {unite.index}
                </p>
                <h3 className="mm-serif mt-3 text-4xl leading-tight text-[#F6E7B2]">{unite.titre}</h3>
                <ul className="mt-5 space-y-2 text-sm text-[#E7E0D4]">
                  {unite.specs.map((spec) => (
                    <li key={spec} className="flex gap-3">
                      <span className="mt-[0.55em] h-px w-6 shrink-0 bg-[#D4AF37]" aria-hidden />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
        <section className="mt-16 border border-[#D4AF37]/35 bg-[#121824] px-6 py-8 sm:px-10">
          <p className="mm-serif text-2xl leading-snug text-[#F6E7B2] sm:text-3xl">{fiche.cloture}</p>
          {fiche.mentionAides ? (
            <p className="mt-4 text-xs leading-relaxed text-[#A89B8C]">
              Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE. La variation de valeur vénale dépend du bien, du marché et de l&apos;expertise.
            </p>
          ) : null}
          <button
            type="button"
            onClick={onConsultation}
            className="mt-8 bg-[#D4AF37] px-5 py-4 text-left text-sm font-medium text-[#0B0F17] transition hover:bg-[#F6E7B2]"
          >
            {`[ ${fiche.action} lors de la Consultation Duo (${MONTANT_CONSULTATION_DUO_TTC} €) ]`}
          </button>
        </section>
      </div>
    </div>
  );
}

export default function MaisonMartinsShowcase() {
  const titreModale = useId();
  const [modale, setModale] = useState<Modale>(null);
  const [departementActif, setDepartementActif] = useState(-1);
  const [rendu, setRendu] = useState<(typeof RUBRIQUES)[number] | null>(null);
  const [duo, setDuo] = useState<FormDuo>(DUO_VIDE);
  const [projet, setProjet] = useState<FormProjet>(PROJET_VIDE);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState<Succes | null>(null);
  const [noteLegale, setNoteLegale] = useState<NoteLegale>(null);
  const [carnet, setCarnet] = useState(false);
  const [atelier, setAtelier] = useState<AtelierId | null>(null);

  useEffect(() => {
    const id = "mm-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Outfit:wght@300;400;500;600&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    const ouvert = Boolean(modale || rendu || noteLegale || carnet || atelier);
    document.body.style.overflow = ouvert ? "hidden" : "";
    if (!ouvert) return undefined;
    const fermer = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !envoi) {
        setModale(null);
        setRendu(null);
        setNoteLegale(null);
        setCarnet(false);
        setAtelier(null);
        setErreur("");
        setSucces(null);
      }
    };
    window.addEventListener("keydown", fermer);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", fermer);
    };
  }, [modale, rendu, noteLegale, carnet, atelier, envoi]);

  const ouvrir = (cible: Modale) => {
    setErreur("");
    setSucces(null);
    setNoteLegale(null);
    setModale(cible);
  };

  const fermerModale = () => {
    if (envoi) return;
    setModale(null);
    setErreur("");
    setSucces(null);
  };

  const envoyerDuo = (event: FormEvent) => {
    event.preventDefault();
    setErreur("");
    if (!telephoneValide(duo.telephone)) {
      setErreur("Indiquez un téléphone français valide.");
      return;
    }
    if (!emailValide(duo.email)) {
      setErreur("Indiquez une adresse e-mail valide.");
      return;
    }
    if (!/^\d{5}$/.test(duo.codePostal.trim())) {
      setErreur("Le code postal doit comporter 5 chiffres.");
      return;
    }
    if (duo.date < aujourdhuiIso()) {
      setErreur("Choisissez une date à partir d'aujourd'hui.");
      return;
    }

    setEnvoi(true);
    const description = [
      "Vitrine Maison Martins — Édition Privée.",
      `Consultation Duo Privée : ${MONTANT_CONSULTATION_DUO_TTC} € TTC.`,
      "Rendez-vous Catarina Martins & Sylvain Lembelembe.",
      `Intention : ${duo.intention}.`,
      "Note d'arbitrage : trancher entre une vente discrète et une haute rénovation avant tout mandat et avant tout marché de travaux.",
      duo.adresse.trim() ? `Bien : ${duo.adresse.trim()}.` : "",
      `Téléphone : ${duo.telephone.trim()}.`,
      `E-mail : ${duo.email.trim()}.`,
      `Date souhaitée : ${duo.date}.`,
    ]
      .filter(Boolean)
      .join(" ");

    const resultat = deposerLead({
      ...duo,
      typeProjet: "Maison Martins — Consultation Duo Privée",
      description,
      montantEstimeTtc: MONTANT_CONSULTATION_DUO_TTC,
      consultationDuo: true,
      dateVisiteTechnique: duo.date,
    });
    setEnvoi(false);

    if (!resultat.ok) {
      setErreur(messageErreur(resultat.erreurs));
      return;
    }
    setDuo(DUO_VIDE);
    setSucces({
      titre: "Votre consultation est reçue.",
      detail: "Catarina Martins et Sylvain Lembelembe vous recontactent personnellement pour confirmer ce rendez-vous.",
    });
  };

  const envoyerProjet = (event: FormEvent) => {
    event.preventDefault();
    setErreur("");
    if (!telephoneValide(projet.telephone)) {
      setErreur("Indiquez un téléphone français valide.");
      return;
    }
    if (!emailValide(projet.email)) {
      setErreur("Indiquez une adresse e-mail valide.");
      return;
    }
    if (!/^\d{5}$/.test(projet.codePostal.trim())) {
      setErreur("Le code postal doit comporter 5 chiffres.");
      return;
    }
    if (projet.message.trim().length < 20) {
      setErreur("Décrivez le bien et l'intention en quelques lignes.");
      return;
    }

    setEnvoi(true);
    const description = [
      "Vitrine Maison Martins — Édition Privée.",
      "Demande d'aménagement & haute rénovation.",
      `Département : ${projet.nature}.`,
      projet.message.trim(),
      projet.adresse.trim() ? `Adresse : ${projet.adresse.trim()}.` : "",
      `Téléphone : ${projet.telephone.trim()}.`,
      `E-mail : ${projet.email.trim()}.`,
    ]
      .filter(Boolean)
      .join(" ");

    const resultat = deposerLead({
      ...projet,
      typeProjet: "Maison Martins — Aménagement & Haute Rénovation",
      description,
    });
    setEnvoi(false);

    if (!resultat.ok) {
      setErreur(messageErreur(resultat.erreurs));
      return;
    }
    setProjet(PROJET_VIDE);
    setSucces({
      titre: "Votre projet est confié.",
      detail: "Catarina Martins et Sylvain Lembelembe prennent le relais, et vous répondent en privé.",
    });
  };

  return (
    <div className="mm min-h-screen bg-[#0B0F17] text-[#F4EFE6]" style={{ fontFamily: 'Outfit, "Segoe UI", sans-serif' }}>
      <style>{`
        .mm-serif { font-family: "Cormorant Garamond", Palatino, "Palatino Linotype", Georgia, serif; }
        .mm-or {
          background: linear-gradient(115deg, #F6E7B2 0%, #D4AF37 46%, #8C7340 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .mm-card { transition: border-color .35s ease, transform .35s ease, box-shadow .35s ease; }
        .mm-card:hover, .mm-card[aria-pressed="true"] {
          border-color: ${OR};
          transform: translateY(-6px);
          box-shadow: 0 28px 70px rgba(0,0,0,.45), 0 0 0 1px rgba(212,175,55,.45);
        }
        @media (prefers-reduced-motion: reduce) {
          .mm-card, .mm-card:hover { transition: none; transform: none; }
        }
      `}</style>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-[#D4AF37]/20 bg-[#0B0F17]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <a href="#haut" className="flex shrink-0 items-center gap-3">
            <Blason className="h-12 w-12" />
            <span className="flex flex-col justify-center">
              <span className="mm-serif whitespace-nowrap text-sm tracking-[0.28em] text-[#F6E7B2] sm:text-base">MAISON MARTINS</span>
              <span className="mt-1 text-[9px] uppercase tracking-[0.28em] text-[#C4B48A]">Édition privée · Bourgogne</span>
            </span>
          </a>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[10px] uppercase tracking-[0.2em] text-[#C4B48A] sm:gap-6 sm:text-[11px]" aria-label="Navigation Maison Martins">
            <a className="shrink-0 hover:text-[#F6E7B2]" href="#departements">Départements</a>
            <a className="shrink-0 hover:text-[#F6E7B2]" href="#magazine">Magazine</a>
            <a className="shrink-0 hover:text-[#F6E7B2]" href="#consultation">Consultation</a>
            <BoutonOr libelle={LIBELLE_CARNET} onClick={() => setCarnet(true)} />
          </nav>
        </div>
      </header>

      <main id="haut">
        <section className="relative flex min-h-[100svh] items-end overflow-hidden">
          <img
            src="/assets/maison-martins/maison-martins-hero.jpg"
            alt="Demeure de pierre en Bourgogne au crépuscule, vignes au premier plan"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17]/75 to-[#0B0F17]/25" />
          <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-36 sm:pb-20">
            <Blason className="h-16 w-16 sm:h-20 sm:w-20" />
            <p className="mt-5 text-[11px] uppercase tracking-[0.42em] text-[#D4AF37]">Maison Martins · Édition Privée</p>
            <h1 className="mm-serif mm-or mt-5 max-w-4xl text-4xl leading-[1.05] font-medium sm:text-6xl lg:text-7xl">
              L&apos;Art de Vivre &amp; La Signature Immobilière d&apos;Exception en Bourgogne
            </h1>
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-[#E7E0D4] sm:text-base">
              Architecture d&apos;intérieur · Cuisines Haute Couture Direct Usine Italie · Belles Demeures &amp; Terroirs de Bourgogne · Rénovation d&apos;Ingénierie Clé en Main
            </p>
            <p className="mt-8 inline-block max-w-3xl border border-[#D4AF37]/50 bg-[#0B0F17]/70 px-4 py-3 text-[11px] leading-relaxed tracking-wide text-[#F6E7B2] sm:text-xs">
              Direction Artistique : Catarina Martins &nbsp;|&nbsp; Direction Ingénierie &amp; Contractant Général : ENERGIA CONSEIL IA®
            </p>
          </div>
        </section>

        <section id="departements" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <p className="text-[11px] uppercase tracking-[0.36em] text-[#D4AF37]">La Maison</p>
          <h2 className="mm-serif mt-3 text-4xl text-[#F6E7B2] sm:text-5xl">Trois départements</h2>
          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {DEPARTEMENTS.map((item, index) => (
              <article key={item.numero}>
                <button
                  type="button"
                  className="mm-card group flex h-full w-full flex-col border border-[#D4AF37]/25 bg-[#121824] p-7 text-left"
                  aria-pressed={departementActif === index}
                  onClick={() => {
                    setDepartementActif(index);
                    document.querySelector(item.ancre)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                >
                  <span className="mm-serif text-3xl text-[#D4AF37]">{item.numero}</span>
                  <h3 className="mm-serif mt-6 text-3xl leading-tight text-[#F6E7B2]">{item.titre}</h3>
                  <p className="mt-4 flex-1 text-sm leading-relaxed text-[#C9C0B2]">{item.texte}</p>
                  <span className="mt-8 text-[11px] uppercase tracking-[0.22em] text-[#D4AF37] opacity-70 transition group-hover:opacity-100">
                    Entrer
                  </span>
                </button>
              </article>
            ))}
          </div>
        </section>

        <section id="magazine" className="scroll-mt-24 border-y border-[#D4AF37]/15 bg-[#090D14] py-20 sm:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-[11px] uppercase tracking-[0.36em] text-[#D4AF37]">Magazine</p>
            <h2 className="mm-serif mt-3 max-w-3xl text-4xl text-[#F6E7B2] sm:text-5xl">Cinq rubriques d&apos;art de vivre</h2>
            <div className="mt-16 space-y-20">
              {RUBRIQUES.map((rubrique, index) => (
                <article id={rubrique.id} key={rubrique.id} className="scroll-mt-28 grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
                  <button
                    type="button"
                    className={`group relative overflow-hidden border border-[#D4AF37]/20 ${index % 2 === 1 ? "lg:order-2" : ""}`}
                    aria-label={`Voir le rendu — ${rubrique.titre}`}
                    onClick={() => setRendu(rubrique)}
                  >
                    <img src={rubrique.image} alt={rubrique.alt} className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
                    <span className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.24em] text-[#F6E7B2]">Voir le rendu</span>
                  </button>
                  <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                    <p className="text-[11px] tracking-[0.32em] text-[#D4AF37]">{rubrique.index}</p>
                    <h3 className="mm-serif mt-3 text-4xl leading-tight text-[#F6E7B2]">{rubrique.titre}</h3>
                    <p className="mt-5 text-sm leading-relaxed text-[#C9C0B2] sm:text-base">{rubrique.chapeau}</p>
                    <ul className="mt-6 space-y-2 text-sm text-[#E7E0D4]">
                      {rubrique.details.map((detail) => (
                        <li key={detail} className="flex gap-3">
                          <span className="mt-[0.55em] h-px w-6 shrink-0 bg-[#D4AF37]" aria-hidden />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                    {rubrique.id === "cuisines" ? (
                      <div className="mt-8">
                        <BoutonOr libelle={LIBELLE_CARNET} onClick={() => setCarnet(true)} />
                      </div>
                    ) : null}
                    {rubrique.id in ATELIERS ? (
                      <div className="mt-8">
                        <BoutonOr
                          libelle={ATELIERS[rubrique.id as AtelierId].libelle}
                          onClick={() => setAtelier(rubrique.id as AtelierId)}
                        />
                      </div>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="consultation" className="scroll-mt-24 mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <p className="text-[11px] uppercase tracking-[0.36em] text-[#D4AF37]">Recevoir</p>
          <h2 className="mm-serif mt-3 max-w-3xl text-4xl text-[#F6E7B2] sm:text-5xl">Une maison, deux signatures</h2>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#C9C0B2] sm:text-base">
            Catarina Martins tient la direction artistique et la lecture du bien. Sylvain Lembelembe tient l&apos;ingénierie et l&apos;exécution. La consultation duo sert d&apos;abord à arbitrer : vendre, ou rénover.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => ouvrir("duo")}
              className="bg-[#D4AF37] px-6 py-4 text-left text-sm font-medium tracking-wide text-[#0B0F17] transition hover:bg-[#F6E7B2]"
            >
              [ Réserver une Consultation Duo Privée · {MONTANT_CONSULTATION_DUO_TTC} € ]
            </button>
            <button
              type="button"
              onClick={() => ouvrir("projet")}
              className="border border-[#D4AF37] px-6 py-4 text-left text-sm font-medium tracking-wide text-[#F6E7B2] transition hover:bg-[#D4AF37]/10"
            >
              [ Confier un Projet d&apos;Aménagement &amp; Haute Rénovation ]
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#D4AF37]/20 bg-[#0B0F17] px-5 py-14">
        <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3 md:items-start md:gap-8">
          <div>
            <Blason className="h-14 w-14" />
            <p className="mm-serif mt-4 text-lg tracking-[0.16em] text-[#F6E7B2]">MAISON MARTINS · ÉDITION PRIVÉE</p>
            <p className="mt-3 text-xs leading-relaxed text-[#C4B48A]">Direction Artistique : Catarina Martins</p>
          </div>
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] uppercase tracking-[0.18em] text-[#C4B48A] md:justify-center" aria-label="Informations">
            <button type="button" className="hover:text-[#F6E7B2]" onClick={() => setNoteLegale("mentions")}>Mentions Légales</button>
            <span aria-hidden className="text-[#D4AF37]/40">|</span>
            <button type="button" className="hover:text-[#F6E7B2]" onClick={() => setNoteLegale("confidentialite")}>Confidentialité</button>
            <span aria-hidden className="text-[#D4AF37]/40">|</span>
            <button type="button" className="hover:text-[#F6E7B2]" onClick={() => ouvrir("projet")}>Contact Privé</button>
          </nav>
          <div className="md:text-right">
            <p className="text-xs leading-relaxed text-[#C4B48A]">Ingénierie &amp; Direction de Travaux : ENERGIA CONSEIL IA® (Contractant Général)</p>
            <p className="mt-3 text-xs leading-relaxed text-[#A89B8C]">Marque déposée INPI n° 5213845 — 16 Rue Cuvier, 69006 Lyon</p>
          </div>
        </div>
      </footer>

      {carnet ? (
        <CarnetInspirations
          onFermer={() => setCarnet(false)}
          onConsultation={() => {
            setCarnet(false);
            ouvrir("duo");
          }}
        />
      ) : null}

      {atelier ? (
        <AtelierModale
          fiche={ATELIERS[atelier]}
          onFermer={() => setAtelier(null)}
          onConsultation={() => {
            setAtelier(null);
            ouvrir("duo");
          }}
        />
      ) : null}

      {noteLegale ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0B0F17]/80 p-0 sm:items-center sm:p-6">
          <button type="button" className="absolute inset-0" aria-label="Fermer" onClick={() => setNoteLegale(null)} />
          <div role="dialog" aria-modal="true" aria-labelledby={titreModale} className="relative z-10 w-full border border-[#D4AF37]/40 bg-[#121824] p-6 sm:max-w-lg sm:p-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#D4AF37]">Maison Martins</p>
            <h2 id={titreModale} className="mm-serif mt-3 text-4xl text-[#F6E7B2]">
              {noteLegale === "mentions" ? "Mentions légales" : "Confidentialité"}
            </h2>
            {noteLegale === "mentions" ? (
              <p className="mt-4 text-sm leading-relaxed text-[#C9C0B2]">
                Direction artistique : Catarina Martins. Ingénierie et direction de travaux : ENERGIA CONSEIL IA®, contractant général, SASU au capital de 100 €, SIRET 941 819 427 00019. 16 Rue Cuvier, 69006 Lyon. Marque déposée INPI n° 5213845.
              </p>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-[#C9C0B2]">
                Les demandes adressées à la Maison servent uniquement à vous recontacter au sujet de votre bien. Elles ne sont ni publiées, ni cédées. Pour toute question : contact@energia-conseil-ia.com.
              </p>
            )}
            <button type="button" className="mt-8 border border-[#D4AF37]/50 px-4 py-3 text-sm text-[#F6E7B2]" onClick={() => setNoteLegale(null)}>
              Fermer
            </button>
          </div>
        </div>
      ) : null}

      {rendu ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B0F17]/88 p-4" role="dialog" aria-modal="true" aria-label={rendu.titre}>
          <button type="button" className="absolute inset-0" aria-label="Fermer le rendu" onClick={() => setRendu(null)} />
          <figure className="relative z-10 w-full max-w-5xl">
            <img src={rendu.image} alt={rendu.alt} className="max-h-[78svh] w-full object-contain" />
            <figcaption className="mt-4 flex items-end justify-between gap-4">
              <div>
                <p className="mm-serif text-2xl text-[#F6E7B2]">{rendu.titre}</p>
                <p className="mt-1 text-xs text-[#C4B48A]">{rendu.details.join(" · ")}</p>
              </div>
              <button type="button" className="border border-[#D4AF37]/50 px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-[#F6E7B2]" onClick={() => setRendu(null)}>
                Fermer
              </button>
            </figcaption>
          </figure>
        </div>
      ) : null}

      {modale ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#0B0F17]/80 p-0 sm:items-center sm:p-6">
          <button type="button" className="absolute inset-0" aria-label="Fermer" onClick={fermerModale} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titreModale}
            className="relative z-10 max-h-[100svh] w-full overflow-y-auto border border-[#D4AF37]/40 bg-[#121824] p-6 sm:max-h-[90svh] sm:max-w-xl sm:p-8"
          >
            {succes ? (
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#D4AF37]">Maison Martins</p>
                <h2 id={titreModale} className="mm-serif mt-3 text-4xl text-[#F6E7B2]">{succes.titre}</h2>
                <p className="mt-4 text-sm leading-relaxed text-[#C9C0B2]">{succes.detail}</p>
                <button type="button" className="mt-8 border border-[#D4AF37]/50 px-4 py-3 text-sm text-[#F6E7B2]" onClick={fermerModale}>
                  Fermer
                </button>
              </div>
            ) : modale === "duo" ? (
              <form onSubmit={envoyerDuo}>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#D4AF37]">Consultation privée · {MONTANT_CONSULTATION_DUO_TTC} €</p>
                <h2 id={titreModale} className="mm-serif mt-3 text-4xl leading-tight text-[#F6E7B2]">
                  Catarina Martins &amp; Sylvain Lembelembe
                </h2>
                <p className="mt-4 border-l border-[#D4AF37] pl-4 text-sm leading-relaxed text-[#C9C0B2]">
                  Note d&apos;arbitrage — Vente VS Rénovation. Ce rendez-vous tranche avant tout mandat de vente et avant tout marché de travaux : céder le bien dans la discrétion, ou le révéler par une haute rénovation. {CONSULTATION_DUO_CATARINA.deductibilite}
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Champ label="Prénom">
                    <input className={inputClass} required minLength={2} autoComplete="given-name" value={duo.prenom} onChange={(event) => setDuo({ ...duo, prenom: event.target.value })} />
                  </Champ>
                  <Champ label="Nom">
                    <input className={inputClass} required minLength={2} autoComplete="family-name" value={duo.nom} onChange={(event) => setDuo({ ...duo, nom: event.target.value })} />
                  </Champ>
                  <Champ label="Téléphone">
                    <input className={inputClass} required type="tel" autoComplete="tel" value={duo.telephone} onChange={(event) => setDuo({ ...duo, telephone: event.target.value })} />
                  </Champ>
                  <Champ label="E-mail">
                    <input className={inputClass} required type="email" autoComplete="email" value={duo.email} onChange={(event) => setDuo({ ...duo, email: event.target.value })} />
                  </Champ>
                  <Champ label="Ville du bien">
                    <input className={inputClass} required minLength={2} value={duo.ville} onChange={(event) => setDuo({ ...duo, ville: event.target.value })} />
                  </Champ>
                  <Champ label="Code postal">
                    <input className={inputClass} required inputMode="numeric" pattern="\d{5}" value={duo.codePostal} onChange={(event) => setDuo({ ...duo, codePostal: event.target.value })} />
                  </Champ>
                </div>
                <div className="mt-4 space-y-4">
                  <Champ label="Adresse ou nom du bien">
                    <input className={inputClass} value={duo.adresse} onChange={(event) => setDuo({ ...duo, adresse: event.target.value })} />
                  </Champ>
                  <Champ label="Date souhaitée">
                    <input className={inputClass} required type="date" min={aujourdhuiIso()} value={duo.date} onChange={(event) => setDuo({ ...duo, date: event.target.value })} />
                  </Champ>
                  <Champ label="Intention">
                    <select className={inputClass} value={duo.intention} onChange={(event) => setDuo({ ...duo, intention: event.target.value as FormDuo["intention"] })}>
                      {INTENTIONS.map((intention) => (
                        <option key={intention} value={intention}>{intention}</option>
                      ))}
                    </select>
                  </Champ>
                  <label className="flex items-start gap-3 text-xs leading-relaxed text-[#C9C0B2]">
                    <input className="mt-0.5 accent-[#D4AF37]" type="checkbox" required checked={duo.consentement} onChange={(event) => setDuo({ ...duo, consentement: event.target.checked })} />
                    <span>J&apos;accepte que ces informations servent à organiser ce rendez-vous et à être recontacté(e) par Catarina Martins et Sylvain Lembelembe. Elles ne sont pas publiées.</span>
                  </label>
                </div>
                {erreur ? <p role="alert" className="mt-4 text-sm text-[#F0C9A0]">{erreur}</p> : null}
                <button type="submit" disabled={envoi} className="mt-6 w-full bg-[#D4AF37] py-4 text-sm font-medium text-[#0B0F17] disabled:opacity-60">
                  {envoi ? "Enregistrement…" : `Confirmer la consultation · ${MONTANT_CONSULTATION_DUO_TTC} €`}
                </button>
              </form>
            ) : (
              <form onSubmit={envoyerProjet}>
                <p className="text-[11px] uppercase tracking-[0.28em] text-[#D4AF37]">Projet qualifié</p>
                <h2 id={titreModale} className="mm-serif mt-3 text-4xl leading-tight text-[#F6E7B2]">
                  Aménagement &amp; haute rénovation
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-[#C9C0B2]">
                  La demande reste privée. Catarina Martins et Sylvain Lembelembe en prennent connaissance ensemble.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Champ label="Prénom">
                    <input className={inputClass} required minLength={2} autoComplete="given-name" value={projet.prenom} onChange={(event) => setProjet({ ...projet, prenom: event.target.value })} />
                  </Champ>
                  <Champ label="Nom">
                    <input className={inputClass} required minLength={2} autoComplete="family-name" value={projet.nom} onChange={(event) => setProjet({ ...projet, nom: event.target.value })} />
                  </Champ>
                  <Champ label="Téléphone">
                    <input className={inputClass} required type="tel" autoComplete="tel" value={projet.telephone} onChange={(event) => setProjet({ ...projet, telephone: event.target.value })} />
                  </Champ>
                  <Champ label="E-mail">
                    <input className={inputClass} required type="email" autoComplete="email" value={projet.email} onChange={(event) => setProjet({ ...projet, email: event.target.value })} />
                  </Champ>
                  <Champ label="Ville">
                    <input className={inputClass} required minLength={2} value={projet.ville} onChange={(event) => setProjet({ ...projet, ville: event.target.value })} />
                  </Champ>
                  <Champ label="Code postal">
                    <input className={inputClass} required inputMode="numeric" pattern="\d{5}" value={projet.codePostal} onChange={(event) => setProjet({ ...projet, codePostal: event.target.value })} />
                  </Champ>
                </div>
                <div className="mt-4 space-y-4">
                  <Champ label="Adresse du bien">
                    <input className={inputClass} value={projet.adresse} onChange={(event) => setProjet({ ...projet, adresse: event.target.value })} />
                  </Champ>
                  <Champ label="Département">
                    <select className={inputClass} value={projet.nature} onChange={(event) => setProjet({ ...projet, nature: event.target.value as FormProjet["nature"] })}>
                      {NATURES_PROJET.map((nature) => (
                        <option key={nature} value={nature}>{nature}</option>
                      ))}
                    </select>
                  </Champ>
                  <Champ label="Le bien, le geste, le délai">
                    <textarea className={`${inputClass} min-h-28 resize-y`} required minLength={20} value={projet.message} onChange={(event) => setProjet({ ...projet, message: event.target.value })} />
                  </Champ>
                  <label className="flex items-start gap-3 text-xs leading-relaxed text-[#C9C0B2]">
                    <input className="mt-0.5 accent-[#D4AF37]" type="checkbox" required checked={projet.consentement} onChange={(event) => setProjet({ ...projet, consentement: event.target.checked })} />
                    <span>J&apos;accepte que cette demande soit traitée en privé par Catarina Martins et Sylvain Lembelembe.</span>
                  </label>
                </div>
                {erreur ? <p role="alert" className="mt-4 text-sm text-[#F0C9A0]">{erreur}</p> : null}
                <button type="submit" disabled={envoi} className="mt-6 w-full border border-[#D4AF37] py-4 text-sm font-medium text-[#F6E7B2] disabled:opacity-60">
                  {envoi ? "Enregistrement…" : "Confier le projet"}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
