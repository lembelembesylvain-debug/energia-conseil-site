/** Extraíts du test local Maison Clyve — uniquement documents joints. */

export type Origine = "photo" | "plan" | "devis" | "hypothèse";
export type Statut =
  | "EXTRAIT"
  | "À VÉRIFIER"
  | "INCOHÉRENCE"
  | "DONNÉE MANQUANTE"
  | "PRÊT POUR VALIDATION HUMAINE";

export type Confiance = "élevé" | "moyen" | "faible" | "illisible";

export type DocumentAnalyse = {
  nom: string;
  type: string;
  extraits: string[];
  confiance: Confiance;
  origine: Origine;
  statut: Statut;
  imageSrc?: string;
};

export type DonneeLogement = {
  libelle: string;
  valeur: string;
  origine: Origine | "—";
  statut: Statut;
  note?: string;
};

export type DevisAnalyse = {
  fichier: string;
  entreprise: string;
  poste: string;
  ht: string;
  tva: string;
  ttc: string;
  date: string;
  validite: string;
  nonLisible: string[];
  lignes: { ref: string; designation: string; montantHt: string }[];
  notes: string[];
  statut: Statut;
};

export const DISCLAIMER =
  "Document de préparation interne — non constitutif d’un audit réglementaire. Validation humaine nécessaire.";

export const MANQUANT = "Non communiqué — à confirmer.";

export const DOCUMENTS: DocumentAnalyse[] = [
  {
    nom: "FACADE_ARRIERE.png",
    type: "Photo extérieure — façade / pignon (filigrane NEYRAT IMMOBILIER)",
    extraits: [
      "Longère traditionnelle, toiture tuiles terre cuite, faîtage irrégulier",
      "Enduit beige dégradé, traces d’humidité en soubassement",
      "Souche de cheminée visible ; antenne sur toiture",
      "Menuiseries anciennes apparentes ; une porte claire à droite",
      "Auvent / galerie sur poteaux bois",
    ],
    confiance: "moyen",
    origine: "photo",
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/facade-arriere.png",
  },
  {
    nom: "FACADE_AVANT.png",
    type: "Photo extérieure — façade principale (vue panoramique)",
    extraits: [
      "Bâtiment allongé type longère, un niveau apparent",
      "Enduit clair en décollement, maçonnerie / brique apparente par endroits",
      "Toiture tuiles canal, faîtage affaissé, tuiles déplacées, mousse",
      "Plusieurs souches de cheminée",
      "Ouvertures hétérogènes : porte de grange, fenêtres, volets bois rouges",
      "Puits en pierre au premier plan ; véhicule sous auvent à droite",
    ],
    confiance: "moyen",
    origine: "photo",
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/facade-avant.png",
  },
  {
    nom: "PHOTO-2026-07-28-21-27-52.png",
    type: "Photo extérieure — façade occupée / travaux en cours",
    extraits: [
      "Enduit largement manquant, terre / maçonnerie apparente",
      "Dalle béton récente devant la façade",
      "Poutres bois neuves empilées sur la dalle",
      "Menuiseries mixtes : châssis blanc récent + volets bois rouges ; porte bois ancienne",
      "Ouverture occultée par un rideau ; écran de canisse sur un pan de mur",
      "Mobilier de terrasse présent (occupation ou usage en cours)",
    ],
    confiance: "moyen",
    origine: "photo",
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/facade-terrasse.png",
  },
  {
    nom: "PHOTO-2026-07-28-21-36-39.png",
    type: "Photo extérieure — pignon / rive de toiture",
    extraits: [
      "Rive de toiture endommagée, tuiles manquantes",
      "Enduit taché / réparé (zone rectangulaire d’aspect différent)",
      "Végétation grimpante sur le pan droit",
    ],
    confiance: "moyen",
    origine: "photo",
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/pignon.png",
  },
  {
    nom: "PHOTO-2026-07-28-22-05-52.png",
    type: "Photo intérieure — sous-face de toiture",
    extraits: [
      "Charpente et liteaux exposés, pas d’isolant visible",
      "Jour visible à travers la couverture (tuiles manquantes ou disjointes)",
      "Mur en matériau traditionnel rugueux ; fissure verticale visible",
      "Niche en arc dans le mur",
    ],
    confiance: "élevé",
    origine: "photo",
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/interieur-toiture.png",
  },
  {
    nom: "PHOTO-2026-07-28-22-18-11.png",
    type: "Photo extérieure — mur pierre / menuiserie",
    extraits: [
      "Mur en pierre apparente, enduit supérieur dégradé",
      "Fenêtre à cadre blanc + volets bois rouge-brun ouverts",
      "Portes de grange bois anciennes en arrière-plan",
      "Palettes au sol ; tube PVC gris en pied de mur",
    ],
    confiance: "moyen",
    origine: "photo",
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/facade-pierre.png",
  },
  {
    nom: "PHOTO-2026-07-28-21-10-34.png",
    type: "Photo intérieure — combles / étage en travaux",
    extraits: [
      "Charpente et liteaux exposés, jour traversant",
      "Murs bruts, une baie sans menuiserie visible",
      "Panneaux de plancher partiellement posés ; trémies ouvertes",
    ],
    confiance: "élevé",
    origine: "photo",
    statut: "EXTRAIT",
    imageSrc: "/test-maison-clyve/combles.png",
  },
  {
    nom: "PHOTO-2026-07-28-21-03-21.png",
    type: "Plan d’aménagement meublé (pièces cotées)",
    extraits: [
      "Intitulé visuel du plan : MAISON CLYVE (lecture image)",
      "Pièces intérieures chiffrées : somme 153,00 m² (voir détail logement)",
      "Terrasse 1 : 28,97 m² ; Terrasse 2 : 52,02 m² ; Allée privée 1 : 105,51 m²",
      "Couloir et salles d’eau communes : surfaces non indiquées sur le plan",
      "QR code « Scannez-moi » présent — contenu non lu",
    ],
    confiance: "élevé",
    origine: "plan",
    statut: "À VÉRIFIER",
    imageSrc: "/test-maison-clyve/plan-maison-clyve.png",
  },
  {
    nom: "devis toiture valid 150922.pdf",
    type: "Devis couverture / réfection de toiture",
    extraits: [
      "SARL FAIVRE — devis n° 508-v1 du 15/03/2022",
      "Client : Mme ANDRIOT Clyve — 654 RD 975, 71290 LA GENETE",
      "HT 48 879,20 € ; TVA 10 % 4 887,92 € ; TTC 53 767,12 €",
      "Couverture neuve indiquée : 360 m² tuiles oméga 10 vieux toit",
      "Découverture indiquée : 505 m²",
    ],
    confiance: "élevé",
    origine: "devis",
    statut: "PRÊT POUR VALIDATION HUMAINE",
  },
  {
    nom: "devis macon.pdf",
    type: "Devis maçonnerie / dalles et ouvertures",
    extraits: [
      "MTL MACONNERIE — devis n° I-22-04-4 du 14/04/2022",
      "Client : MME CLYVE ANDRIOT — 654 route départementale 975, 71290 LA GENÊTE",
      "HT 25 239,00 € ; TVA 10 % 2 523,90 € ; TTC 27 762,90 €",
      "Postes : dalle grange 66 m² + 4 dalles habitation (40 / 33 / 36 / 36 m²)",
    ],
    confiance: "élevé",
    origine: "devis",
    statut: "PRÊT POUR VALIDATION HUMAINE",
  },
  {
    nom: "devis toiture madinier.pdf",
    type: "Devis rénovation de toiture",
    extraits: [
      "Madinier entreprise — devis EST0001 du 25/10/2021",
      "Client : Mme ANDRIOT clyve — 654 route départementale 975, 71290 la genete",
      "Total indiqué : 57 850,00 € (HT / TTC non distingués)",
      "Superficie de toiture indiquée : 450 m²",
    ],
    confiance: "moyen",
    origine: "devis",
    statut: "À VÉRIFIER",
  },
];

export const PIECES_PLAN: { nom: string; surface: string }[] = [
  { nom: "Bureau", surface: "10,93 m²" },
  { nom: "Lingerie", surface: "16,47 m²" },
  { nom: "Entrée", surface: "3,77 m²" },
  { nom: "WC", surface: "2,46 m²" },
  { nom: "Salon", surface: "18,67 m²" },
  { nom: "Cuisine", surface: "20,55 m²" },
  { nom: "Ch GG", surface: "12,91 m²" },
  { nom: "Ch Flavio", surface: "11,3 m²" },
  { nom: "Ch Lorenzo", surface: "13,65 m²" },
  { nom: "Ch Alexia", surface: "12,39 m²" },
  { nom: "Ch Parents", surface: "15,82 m²" },
  { nom: "Dressing Parents", surface: "6,01 m²" },
  { nom: "SDB Parent", surface: "6,16 m²" },
  { nom: "WC2", surface: "1,91 m²" },
];

export const DONNEES_LOGEMENT: DonneeLogement[] = [
  {
    libelle: "Identité dossier (test)",
    valeur: "Maison Clyve — Mme ANDRIOT Clyve (noms lus sur devis et plan)",
    origine: "devis",
    statut: "EXTRAIT",
  },
  {
    libelle: "Adresse",
    valeur:
      "654 route départementale 975 / 654 RD 975, 71290 — graphie LA GENETE / LA GENÊTE selon le devis",
    origine: "devis",
    statut: "À VÉRIFIER",
    note: "Même localité sur les 3 devis ; orthographe du nom de commune non unifiée.",
  },
  {
    libelle: "Surface habitable totale",
    valeur: MANQUANT,
    origine: "—",
    statut: "DONNÉE MANQUANTE",
    note: "Aucun total « surface habitable » n’est écrit sur le plan. Un audit réglementaire n’a pas été joint à ce test.",
  },
  {
    libelle: "Somme des pièces chiffrées sur le plan",
    valeur: "153,00 m²",
    origine: "plan",
    statut: "EXTRAIT",
    note: "Addition des 14 pièces portant une surface. Hors couloir et salles d’eau communes non cotées.",
  },
  {
    libelle: "Couloir",
    valeur: MANQUANT,
    origine: "plan",
    statut: "DONNÉE MANQUANTE",
    note: "Présent sur le plan, surface non indiquée.",
  },
  {
    libelle: "Salles d’eau communes (entre chambres)",
    valeur: MANQUANT,
    origine: "plan",
    statut: "DONNÉE MANQUANTE",
    note: "Deux volumes avec icônes sanitaires, sans surface écrite.",
  },
  {
    libelle: "Terrasses (hors SHAB)",
    valeur: "Terrasse 1 : 28,97 m² — Terrasse 2 : 52,02 m²",
    origine: "plan",
    statut: "EXTRAIT",
  },
  {
    libelle: "Allée privée 1 (hors SHAB)",
    valeur: "105,51 m²",
    origine: "plan",
    statut: "EXTRAIT",
  },
  {
    libelle: "Type de construction",
    valeur:
      "Longère traditionnelle, murs maçonnés (pierre / brique / terre apparente selon les vues), enduit dégradé",
    origine: "photo",
    statut: "À VÉRIFIER",
    note: "Le matériau porteur exact (pisé, pierre, brique, mixte) n’est pas nommé sur un devis joint. Hypothèse « pisé » non retenue.",
  },
  {
    libelle: "État de la toiture",
    valeur:
      "Tuiles terre cuite / canal ; faîtage irrégulier ; tuiles manquantes ou disjointes ; jour visible depuis l’intérieur ; pas d’isolant visible en sous-face",
    origine: "photo",
    statut: "EXTRAIT",
  },
  {
    libelle: "Surface de toiture (devis)",
    valeur:
      "Faivre : 360 m² (couverture neuve) et 505 m² (découverture) — Madinier : 450 m²",
    origine: "devis",
    statut: "INCOHÉRENCE",
    note: "Trois chiffres différents pour un même lot toiture. Aucune surface toiture n’est écrite sur le plan.",
  },
  {
    libelle: "État des murs",
    valeur:
      "Enduit largement dégradé ou manquant ; humidité / taches ; fissure intérieure visible ; végétation grimpante sur un pignon",
    origine: "photo",
    statut: "EXTRAIT",
  },
  {
    libelle: "État des menuiseries",
    valeur:
      "Mixte : châssis blancs d’aspect récent + volets bois ; portes bois anciennes ; baie de comble sans menuiserie visible",
    origine: "photo",
    statut: "À VÉRIFIER",
    note: "Nombre d’ouvrants, Uw, simple/double vitrage : non lus sur un document joint.",
  },
  {
    libelle: "Chauffage",
    valeur: "Souche(s) de cheminée visibles en toiture",
    origine: "photo",
    statut: "À VÉRIFIER",
    note: `Émetteur / générateur (foyer, insert, chaudière, PAC, etc.) : ${MANQUANT}`,
  },
  {
    libelle: "Ventilation",
    valeur: MANQUANT,
    origine: "—",
    statut: "DONNÉE MANQUANTE",
    note: "Aucune grille VMC identifiable sur les photos. L’absence de vue ne prouve pas l’absence d’équipement.",
  },
  {
    libelle: "Année de construction",
    valeur: MANQUANT,
    origine: "—",
    statut: "DONNÉE MANQUANTE",
  },
  {
    libelle: "DPE / audit réglementaire",
    valeur: MANQUANT,
    origine: "—",
    statut: "DONNÉE MANQUANTE",
    note: "Aucun DPE ni audit réglementaire n’est joint à ce test local.",
  },
  {
    libelle: "Occupation / statut",
    valeur: MANQUANT,
    origine: "—",
    statut: "DONNÉE MANQUANTE",
    note: "Mobilier visible sur photo : ne permet pas de conclure au statut d’occupation.",
  },
];

export const DEVIS: DevisAnalyse[] = [
  {
    fichier: "devis toiture valid 150922.pdf",
    entreprise: "SARL FAIVRE (affaire suivie par FAIVRE Geoffrey)",
    poste: "Réfection de toiture",
    ht: "48 879,20 €",
    tva: "4 887,92 € (10 %)",
    ttc: "53 767,12 €",
    date: "15/03/2022 (devis n° 508 - v 1)",
    validite:
      "Page totaux : « Validité : 6 mois ». CGV p.3 : signature dans un délai maximum de 3 mois à compter de la date d’émission.",
    nonLisible: [
      "En-tête / logo entreprise hors pied de page : partiellement absent de l’extraction texte",
      "Numéro d’agrément RGE : mention « Agrémént RGE » sans numéro de certificat lu",
    ],
    lignes: [
      { ref: "1", designation: "Échafaudage 203,000 m²", montantHt: "2 131,50 €" },
      { ref: "2", designation: "Grue (1 ENS)", montantHt: "600,00 €" },
      { ref: "3", designation: "Démolition scellements 18,000 ml", montantHt: "81,00 €" },
      { ref: "4", designation: "Démolition de cheminée 2 UN", montantHt: "450,00 €" },
      { ref: "5", designation: "Découverture tuiles / liteaux 505,000 m²", montantHt: "4 040,00 €" },
      { ref: "6", designation: "Dépose voliges (1 ENS)", montantHt: "1 350,00 €" },
      { ref: "7", designation: "Démolition avancés de toiture (1 ENS)", montantHt: "1 800,00 €" },
      { ref: "8", designation: "Dépose chevrons 360,000 m²", montantHt: "2 808,00 €" },
      {
        ref: "9",
        designation: "Changement pannes 12x24 — 30,000 ml (mention « estimation »)",
        montantHt: "1 260,00 €",
      },
      { ref: "10", designation: "Rabotage chevrons en débord (1 ENS)", montantHt: "580,00 €" },
      { ref: "11", designation: "Chevrons 6x8 — 750,000 ml", montantHt: "7 125,00 €" },
      { ref: "12", designation: "Chevrons de rive 25,000 ml", montantHt: "500,00 €" },
      { ref: "13", designation: "Frisette débord 29,200 m²", montantHt: "700,80 €" },
      { ref: "14", designation: "Garnissage béton bas de pente 58,500 ml", montantHt: "1 989,00 €" },
      { ref: "15", designation: "Garnissage pignons béton moulé 68,000 ml", montantHt: "2 312,00 €" },
      { ref: "16", designation: "Sous-toiture R3 + contre-lattage 360,000 m²", montantHt: "3 060,00 €" },
      { ref: "17", designation: "Tuiles oméga 10 vieux toit 360,000 m²", montantHt: "12 600,00 €" },
      { ref: "18", designation: "Tuiles de ventilation 14 UN", montantHt: "490,00 €" },
      { ref: "19", designation: "Faîtières / arêtiers 29,200 ml", montantHt: "1 314,00 €" },
      { ref: "20", designation: "Rives en pignon 26,700 ml", montantHt: "774,30 €" },
      { ref: "21", designation: "Chéneaux zinc 33 — 58,400 ml", montantHt: "1 985,60 €" },
      { ref: "22", designation: "Soudures de dilatation 4 UN", montantHt: "168,00 €" },
      { ref: "23", designation: "Fonds de chéneaux 4 UN", montantHt: "52,00 €" },
      { ref: "24", designation: "Naissances et coudes Ø100 — 12 UN", montantHt: "192,00 €" },
      { ref: "25", designation: "Descentes zinc Ø100 — 12,000 ml", montantHt: "336,00 €" },
      { ref: "26", designation: "Dauphins fonte 4 UN", montantHt: "180,00 €" },
    ],
    notes: [
      "Addition des 26 lignes HT = 48 879,20 € : cohérent avec le total du devis.",
      "Nom de fichier « 150922 » ≠ date du document 15/03/2022.",
      "Devis sans délai d’intervention (mention du devis).",
      "À la date du test (16/08/2026), la validité 3 ou 6 mois à compter de 2022 est échue.",
    ],
    statut: "PRÊT POUR VALIDATION HUMAINE",
  },
  {
    fichier: "devis macon.pdf",
    entreprise: "MTL MACONNERIE — Le Nuzeret, 71440 SAINT-VINCENT-EN-BRESSE",
    poste: "Dalles + ouvertures (grange et partie habitation)",
    ht: "25 239,00 €",
    tva: "2 523,90 € (10 %)",
    ttc: "27 762,90 €",
    date: "jeudi 14 avril 2022 (devis n° I-22-04-4)",
    validite: "2 mois",
    nonLisible: [
      "Images associées aux lignes : non exploitables dans l’extraction texte",
    ],
    lignes: [
      {
        ref: "GRANGE",
        designation: "Dalle 66 m² + décaissement + agrandissement d’une ouverture existante",
        montantHt: "6 239,00 €",
      },
      {
        ref: "Dalle 1",
        designation: "40 m² + création d’ouverture 240/215 + rehaussement d’ouverture existante",
        montantHt: "5 500,00 €",
      },
      {
        ref: "Dalle 2",
        designation: "33 m² + création ouverture 1/2.15",
        montantHt: "4 800,00 €",
      },
      {
        ref: "Dalle 3",
        designation: "36 m² + décaissement + création ouverture 1/2.15",
        montantHt: "4 600,00 €",
      },
      {
        ref: "Dalle 4",
        designation: "36 m² + décaissement",
        montantHt: "4 100,00 €",
      },
    ],
    notes: [
      "Addition des 5 postes HT = 25 239,00 € : cohérent avec le total.",
      "SIRET lu : 53109556000029. Assurance ENTORIA CRCD01-032559.",
      "E-mail client lu sur le devis : clyve.andriot@gmail.com.",
      "À la date du test (16/08/2026), validité 2 mois à compter du 14/04/2022 échue.",
    ],
    statut: "PRÊT POUR VALIDATION HUMAINE",
  },
  {
    fichier: "devis toiture madinier.pdf",
    entreprise: "Madinier entreprise — 1495 route des 4 Vents (commune non indiquée)",
    poste: "Rénovation d’une toiture — superficie indiquée 450 m²",
    ht: MANQUANT,
    tva: MANQUANT,
    ttc: MANQUANT,
    date: "25/10/2021 (devis EST0001)",
    validite: MANQUANT,
    nonLisible: [
      "Distinction HT / TVA / TTC : un seul « TOTAL EUR 57 850,00 € »",
      "Commune de l’adresse entreprise : absente",
      "Champ « n° TVA 405 035 734 000 20 » : format proche d’un SIRET, à vérifier",
      "Ligne 3 écrite « (5000\"00€) en réserve »",
    ],
    lignes: [
      { ref: "1", designation: "Évacuation des tuiles + déchets", montantHt: "6 750,00 €" },
      { ref: "2", designation: "Évacuation boiseries (lattage, chevrons, poutres à changer)", montantHt: "5 300,00 €" },
      { ref: "3", designation: "Réserve boiseries (poutres porteuses et solives)", montantHt: "5 000,00 €" },
      { ref: "4", designation: "Changement poutre porteuse + chevrons + piliers / poutrelles", montantHt: "11 000,00 €" },
      { ref: "5", designation: "Écran delta vent", montantHt: "5 800,00 €" },
      { ref: "6", designation: "Lattage et contre-lattage", montantHt: "8 100,00 €" },
      { ref: "7", designation: "Tuile plate Delta 10 rouge + faîtage 35 ml + tuiles de rive", montantHt: "15 900,00 €" },
    ],
    notes: [
      "Somme des 7 lignes (réserve incluse) = 57 850,00 € : cohérent avec le total unique du document.",
      "Le total unique n’est pas libellé HT ni TTC — montants de lignes repris tels quels, sans les qualifier de HT ou TTC.",
      "Acompte : 30 % à la signature, 35 % en cours, reste à la fin.",
      "Mention « Tous les travaux sont garantie 10 ans » — nature (décennale / commerciale) non précisée.",
    ],
    statut: "À VÉRIFIER",
  },
];

export type Controle = {
  titre: string;
  statut: Statut;
  detail: string;
};

export const CONTROLES: Controle[] = [
  {
    titre: "Photos ↔ devis toiture",
    statut: "EXTRAIT",
    detail:
      "Les photos montrent une couverture dégradée, un jour en sous-face et une rive endommagée. Cela justifie un lot toiture. Cela ne permet pas de choisir entre Faivre et Madinier, ni de valider les surfaces 360 / 450 / 505 m².",
  },
  {
    titre: "Photos ↔ devis maçonnerie",
    statut: "À VÉRIFIER",
    detail:
      "Dalle béton récente et poutres neuves visibles (photo 21-27-52) : compatible avec un chantier dalles / gros œuvre. Le devis MTL décrit 5 dalles (66+40+33+36+36 m² = 211 m²) et des ouvertures. Aucune cote de dalle n’est écrite sur le plan joint. Correspondance pièce par pièce : non établie.",
  },
  {
    titre: "Plan ↔ surfaces",
    statut: "INCOHÉRENCE",
    detail:
      "Somme des 14 pièces cotées = 153,00 m². Le couloir et au moins deux salles d’eau communes n’ont pas de surface. Aucun total SHAB n’est inscrit. Les surfaces de toiture des devis (360 / 450 / 505 m²) ne figurent pas sur le plan.",
  },
  {
    titre: "Doublons de devis toiture",
    statut: "À VÉRIFIER",
    detail:
      "Deux devis distincts pour un lot toiture : Faivre (15/03/2022, TTC 53 767,12 €, 360 m² de couverture, tuile oméga 10) et Madinier (25/10/2021, total 57 850,00 € non ventilé HT/TTC, 450 m², tuile plate Delta 10). Ce n’est pas un double comptage automatique, mais deux offres non comparables en l’état.",
  },
  {
    titre: "Montants — contrôle arithmétique",
    statut: "EXTRAIT",
    detail:
      "Faivre : 26 lignes = 48 879,20 € HT ; TVA 10 % = 4 887,92 € ; TTC = 53 767,12 €. MTL : 5 postes = 25 239,00 € HT ; TVA 10 % = 2 523,90 € ; TTC = 27 762,90 €. Madinier : 7 lignes = 57 850,00 € = total unique (sans TVA affichée).",
  },
  {
    titre: "Validité des devis",
    statut: "INCOHÉRENCE",
    detail:
      "Faivre : contradiction interne 6 mois (totaux) vs 3 mois (CGV), et date 2022. MTL : 2 mois à compter du 14/04/2022. Madinier : durée de validité absente, date 25/10/2021. Aucun des trois n’est en cours de validité à la date du test.",
  },
  {
    titre: "Nom de fichier Faivre",
    statut: "INCOHÉRENCE",
    detail:
      "Fichier « devis toiture valid 150922.pdf » vs date interne 15/03/2022. « 150922 » n’est pas repris dans le corps du devis.",
  },
  {
    titre: "Données absentes du corpus joint",
    statut: "DONNÉE MANQUANTE",
    detail:
      "SHAB totale, année de construction, DPE, audit réglementaire, chauffage (hors souches visibles), ventilation, isolation des murs, RFR, occupants, statut (RP/RS). Aucun de ces champs n’est lu sur photo, plan ou devis joints.",
  },
  {
    titre: "Travaux non justifiés par un document joint",
    statut: "DONNÉE MANQUANTE",
    detail:
      "Pas de devis menuiseries, isolation murs, VMC, chauffage, électricité, plomberie. Les photos de combles / plancher OSB et de poutres neuves montrent des travaux, sans devis correspondant dans le corpus.",
  },
  {
    titre: "Documents hors corpus — non utilisés",
    statut: "EXTRAIT",
    detail:
      "Aucun autre fichier du dépôt (audit FIL ROUGE, rapport BAO, devis Yoann Suchet 2023, rapports déjà générés) n’a été utilisé pour ce test, conformément à la consigne d’analyser uniquement les documents joints.",
  },
];

export const SCENARIOS = [
  {
    id: "A",
    titre: "Toiture — offre Faivre",
    statut: "À VÉRIFIER" as Statut,
    contenu:
      "Réfection de toiture selon devis n° 508-v1 du 15/03/2022 : 48 879,20 € HT / 53 767,12 € TTC. Validité échue. Surfaces 360 m² (couverture) vs 505 m² (découverture) à faire expliquer.",
  },
  {
    id: "B",
    titre: "Toiture — offre Madinier",
    statut: "À VÉRIFIER" as Statut,
    contenu:
      "Rénovation toiture 450 m² selon EST0001 du 25/10/2021 : total unique 57 850,00 € (HT/TTC non distingués, réserve 5 000,00 € incluse). Validité non indiquée. Non comparable arithmétiquement à l’offre Faivre.",
  },
  {
    id: "C",
    titre: "Maçonnerie — offre MTL",
    statut: "À VÉRIFIER" as Statut,
    contenu:
      "Dalles et ouvertures selon I-22-04-4 du 14/04/2022 : 25 239,00 € HT / 27 762,90 € TTC. Validité échue. Lien avec la dalle vue en photo : possible, non démontré pièce par pièce.",
  },
  {
    id: "D",
    titre: "Scénario global rénovation énergétique",
    statut: "DONNÉE MANQUANTE" as Statut,
    contenu:
      "Non constructible à partir du corpus joint : pas d’audit, pas de DPE, pas de devis enveloppe / systèmes. Aucun chiffrage global n’est additionné ici (les deux toitures ne se cumulent pas).",
  },
];
