import type { CeeFicheTravaux } from "./ceeRadarTravaux";

export type DossierIngenierieCee = {
  argumentRoi: string;
  eligibilite: string;
  metrologie: string;
  typeSite: string;
  decideur: string;
  enjeu: string;
  schemaTitre: string;
  schemaEtapes: string[];
};

/**
 * Argument, éligibilité et métrologie COFRAC par fiche standardisée.
 * Textes courts : la note PDF tient sur une page A4.
 */
export const DOSSIERS_INGENIERIE_CEE: Record<string, DossierIngenierieCee> = {
  "BAR-TH-164": {
    typeSite: "Maisons individuelles en rénovation d'ampleur",
    decideur: "Propriétaire occupant ou bailleur",
    enjeu: "Gain de classes, aides cumulables, isolation avant le chauffage",
    schemaTitre: "Enveloppe puis systèmes",
    schemaEtapes: ["Enveloppe isolée", "Ventilation contrôlée", "Chauffage après isolation"],
    argumentRoi:
      "Prime visible dès le premier rendez-vous, sur une rénovation d'ampleur. Cumul possible avec MaPrimeRénov' selon le profil. L'isolation précède le chauffage : le reste à charge se finance à l'éco-PTZ.",
    eligibilite:
      "Maison individuelle existante. Bouquet d'enveloppe et de chauffage, gain énergétique et audit conformes à la fiche BAR-TH-164 en vigueur, entreprises RGE. Si MaPrimeRénov' est visé : ne pas signer les devis définitifs avant l'accord écrit de l'ANAH.",
    metrologie:
      "Contrôle COFRAC par échantillonnage : cohérence de l'audit, des factures et des surfaces, performances des générateurs, photos horodatées avant et après, attestations sur l'honneur.",
  },
  "BAR-TH-104": {
    typeSite: "Maisons chauffées au fioul ou au gaz",
    decideur: "Propriétaire occupant",
    enjeu: "Sortie de chaudière, PAC dimensionnée après isolation",
    schemaTitre: "PAC air / eau",
    schemaEtapes: ["Groupe extérieur", "Module hydraulique", "Ballon tampon", "Émetteurs"],
    argumentRoi:
      "Coup de pouce stable sur le remplacement d'une chaudière fioul ou gaz. La pompe à chaleur se dimensionne après isolation, pour éviter un surcoût de puissance de 4 000 à 6 000 €.",
    eligibilite:
      "Logement existant chauffé par chaudière individuelle. PAC air/eau ou eau/eau dont l'efficacité saisonnière respecte le seuil de la fiche BAR-TH-104, note de dimensionnement et installateur RGE.",
    metrologie:
      "Contrôle COFRAC : plaque signalétique, efficacité saisonnière, puissance retenue, photos de la dépose de l'ancien générateur, facture et attestation RGE.",
  },
  "BAR-TH-173": {
    typeSite: "Logements à chauffage individuel",
    decideur: "Propriétaire ou gestionnaire de parc",
    enjeu: "Régulation connectée, geste à prise en charge élevée",
    schemaTitre: "Régulation connectée",
    schemaEtapes: ["Têtes thermo connectées", "Passerelle IP", "Application de pilotage"],
    argumentRoi:
      "Prise en charge quasi totale du geste. Signal 2026/2027 : la régulation pièce par pièce baisse les consommations tout de suite, avec un dossier léger en complément.",
    eligibilite:
      "Chauffage individuel existant, logement de plus de 2 ans. Programmation horaire pièce par pièce et classe de régulation conformes à BAR-TH-173. Pose par un professionnel RGE.",
    metrologie:
      "Contrôle COFRAC : références des thermostats, schéma de programmation, photos des sondes, facture détaillée et preuve de mise en service.",
  },
  "BAR-TH-148": {
    typeSite: "Maisons avec chauffe-eau électrique",
    decideur: "Propriétaire occupant",
    enjeu: "Eau chaude thermodynamique, geste rapide en complément",
    schemaTitre: "Chauffe-eau thermodynamique",
    schemaEtapes: ["Air ambiant", "PAC du ballon", "Eau chaude sanitaire"],
    argumentRoi:
      "Geste rapide en complément de dossier. La prime est modeste ; le chauffe-eau thermodynamique réduit la facture d'eau chaude sans alourdir le chantier.",
    eligibilite:
      "Remplacement d'un chauffe-eau électrique à accumulation en maison individuelle de plus de 2 ans. COP et volume conformes à BAR-TH-148. Installation par un professionnel RGE.",
    metrologie:
      "Contrôle COFRAC : COP, volume du ballon, photos de l'appareil posé et de l'équipement déposé, facture et attestation.",
  },
  "BAT-TH-116": {
    typeSite: "Tertiaire de plus de 1 000 m², décret BACS",
    decideur: "Directeur immobilier, DAF ou property manager",
    enjeu: "Conformité BACS 2027, baisse de 20 à 35 % de la facture",
    schemaTitre: "GTB et décret BACS",
    schemaEtapes: ["Sondes et capteurs", "Automate central BACS", "Pilotage PAC, VMC et chauffage"],
    argumentRoi:
      "Conformité au décret BACS, échéance 2027. La GTB de classe B ou A peut couvrir une large part du coût et viser 20 % à 35 % de baisse sur la facture tertiaire.",
    eligibilite:
      "Bâtiment tertiaire existant, en pratique au-delà de 1 000 m². GTB de classe B minimum (NF EN ISO 52120-1) couvrant chauffage, eau chaude, refroidissement, éclairage et auxiliaires, selon BAT-TH-116.",
    metrologie:
      "Contrôle COFRAC : classe de GTB, liste des points pilotés, comptage énergétique, synoptique, facture et rapport de mise en service.",
  },
  "BAT-TH-104": {
    typeSite: "Tertiaire à chauffage collectif par radiateurs",
    decideur: "Gestionnaire d'immeuble ou DAF",
    enjeu: "Régulation terminale et baisse des surchauffes",
    schemaTitre: "Robinets thermostatiques",
    schemaEtapes: ["Radiateurs", "Robinets thermostatiques", "Régulation de zone"],
    argumentRoi:
      "Régulation terminale des radiateurs : moins de surchauffe, confort immédiat, geste complémentaire d'une GTB ou d'une chaufferie tertiaire.",
    eligibilite:
      "Bâtiment tertiaire existant à chauffage collectif par radiateurs. Robinets thermostatiques neufs sur les émetteurs, dans le décompte et les locaux exigés par la fiche BAT-TH-104.",
    metrologie:
      "Contrôle COFRAC : décompte des robinets, photos d'échantillonnage, plans des locaux traités, facture et attestation de pose.",
  },
  "BAT-EN-101": {
    typeSite: "Tertiaire de plus de 1 000 m², toiture accessible",
    decideur: "Directeur immobilier ou property manager",
    enjeu: "Toiture, premier poste de déperdition, avant la chaufferie",
    schemaTitre: "Isolation de toiture",
    schemaEtapes: ["Toiture ou combles", "Isolant certifié", "Ventilation contrôlée"],
    argumentRoi:
      "La toiture est le premier poste de déperdition. Isoler avant de remplacer la chaufferie sécurise le dimensionnement et le volume de certificats.",
    eligibilite:
      "Bâtiment tertiaire existant, combles ou toiture accessibles. Résistance thermique R au moins égale au seuil de BAT-EN-101, isolant certifié, mise en œuvre par une entreprise qualifiée.",
    metrologie:
      "Contrôle COFRAC : épaisseur, lambda, calcul de R, surface isolée, photos de la pose et facture détaillée.",
  },
  "BAT-TH-140": {
    typeSite: "Immeuble tertiaire à chaufferie collective fossile",
    decideur: "Directeur technique ou propriétaire bailleur",
    enjeu: "Sortie du fossile, puissance calée après isolation",
    schemaTitre: "PAC collective",
    schemaEtapes: ["Groupe extérieur", "Module hydraulique", "Ballon tampon", "Émetteurs"],
    argumentRoi:
      "Sortie du chauffage fossile collectif. La pompe à chaleur se dimensionne après isolation de l'enveloppe, pour limiter la puissance installée.",
    eligibilite:
      "Immeuble tertiaire à chaufferie collective. PAC respectant l'efficacité saisonnière de la fiche retenue, étude après réduction des besoins, entreprise qualifiée.",
    metrologie:
      "Contrôle COFRAC : puissance, efficacité saisonnière, schéma hydraulique, photos de chaufferie, dépose du générateur fossile et facture.",
  },
  "IND-UT-117": {
    typeSite: "Usines avec compresseurs ou rejets thermiques",
    decideur: "Directeur d'usine ou directeur technique",
    enjeu: "Chaleur fatale valorisée, baisse de 20 à 40 % du chauffage",
    schemaTitre: "Récupération de chaleur fatale",
    schemaEtapes: ["Compresseur / rejets", "Échangeur à plaques", "Réseau d'eau chaude"],
    argumentRoi:
      "Opération quasi blanche grâce aux CEE : la prime peut couvrir l'essentiel de la récupération de chaleur fatale, avec 20 % à 40 % de baisse estimée sur le chauffage de l'usine.",
    eligibilite:
      "Site industriel. Valorisation de chaleur fatale de process, échangeur, régulation anti-surchauffe et mesure de l'énergie thermique, selon IND-UT-117. La récupération dédiée au seul compresseur d'air relève de IND-UT-125.",
    metrologie:
      "Contrôle COFRAC : compteur d'énergie thermique, relevés de puissance, photos de l'échangeur et du circuit, schéma de principe et facture.",
  },
  "IND-UT-115": {
    typeSite: "Sites avec groupe de production de froid",
    decideur: "Directeur d'usine ou responsable utilités",
    enjeu: "Basse pression flottante, facture frigorifique en baisse",
    schemaTitre: "Froid à basse pression flottante",
    schemaEtapes: ["Groupe froid", "Régulation BP flottante", "Besoin réel du process"],
    argumentRoi:
      "Le groupe froid ne force plus une basse pression fixe : la régulation suit la demande réelle. Prime CEE et baisse durable de la facture frigorifique.",
    eligibilite:
      "Site industriel. Régulation permettant une basse pression flottante sur un groupe de production de froid, dans les conditions de la fiche IND-UT-115 en vigueur.",
    metrologie:
      "Contrôle COFRAC : description de la régulation, puissances frigorifiques, photos de l'armoire et des sondes, relevés et facture.",
  },
  "IND-UT-121": {
    typeSite: "Réseaux vapeur, eau surchauffée ou fluides process",
    decideur: "Directeur de maintenance ou directeur d'usine",
    enjeu: "Chantier court, pertes de réseau stoppées",
    schemaTitre: "Matelas de points singuliers",
    schemaEtapes: ["Réseau de fluide", "Matelas isolants", "Pertes stoppées"],
    argumentRoi:
      "Chantier court sur les réseaux, souvent posé en quelques jours. Le volume CEE accélère le retour, sans arrêt long de la production.",
    eligibilite:
      "Réseau industriel de vapeur, d'eau surchauffée ou de fluide process. Points singuliers (vannes, brides, coudes, collecteurs) isolés par matelas amovibles conformes à IND-UT-121.",
    metrologie:
      "Contrôle COFRAC : décompte des points, température du fluide, résistance des matelas, photos repérées et facture.",
  },
  "IND-UT-114": {
    typeSite: "Lignes de pompage, ventilation et compression",
    decideur: "Directeur industriel ou responsable énergie",
    enjeu: "Rendement permanent des moteurs et prime CEE",
    schemaTitre: "Moteurs haut rendement",
    schemaEtapes: ["Moteur en place", "IE4 ou moto-variateur", "Ligne process"],
    argumentRoi:
      "Moteurs et moto-variateurs haut rendement : le gain process est permanent, et la prime CEE s'ajoute sur le pompage, la ventilation et la compression.",
    eligibilite:
      "Site industriel. Moteur haut rendement ou moto-variateur synchrone dans les puissances de la fiche IND-UT-114, en remplacement d'un équipement moins efficient.",
    metrologie:
      "Contrôle COFRAC : plaques signalétiques, classe de rendement, puissances, photos des moteurs posés et facture.",
  },
  "IND-UT-102": {
    typeSite: "Moteurs asynchrones de pompage, air ou froid",
    decideur: "Directeur d'usine ou responsable maintenance",
    enjeu: "La puissance suit le besoin, facture process en baisse",
    schemaTitre: "Variation électronique de vitesse",
    schemaEtapes: ["Moteur asynchrone", "Variateur électronique", "Pompe, air ou compresseur"],
    argumentRoi:
      "La puissance appelée suit le besoin réel. Le variateur baisse la facture de pompage, de ventilation ou de compression, avec une prime CEE en appui.",
    eligibilite:
      "Site industriel. Variation électronique de vitesse sur moteur asynchrone, application et puissance nominale conformes à IND-UT-102, sur un équipement dépourvu de ce système.",
    metrologie:
      "Contrôle COFRAC : référence du variateur, puissance du moteur, application (pompe, ventilateur ou compresseur), photos et facture.",
  },
  "IND-UT-116": {
    typeSite: "Chambres froides, agroalimentaire et abattoirs",
    decideur: "Directeur d'usine ou responsable utilités",
    enjeu: "Haute pression flottante, facture frigorifique en baisse",
    schemaTitre: "Haute pression flottante",
    schemaEtapes: ["Groupe froid", "Régulation HP flottante", "Condensation selon l'air extérieur"],
    argumentRoi:
      "La haute pression suit la température extérieure au lieu d'une consigne fixe. Prime CEE sur les chambres froides, l'agroalimentaire et les abattoirs, et baisse durable de la facture frigo.",
    eligibilite:
      "Site industriel. Régulation de haute pression flottante sur un groupe de production de froid, dans les conditions de la fiche IND-UT-116 en vigueur.",
    metrologie:
      "Contrôle COFRAC : description de la régulation, puissances frigorifiques, photos de l'armoire et des sondes, relevés et facture.",
  },
  "IND-UT-125": {
    typeSite: "Ateliers mécaniques et usines de plasturgie",
    decideur: "Directeur technique ou responsable maintenance",
    enjeu: "Chaleur du compresseur d'air valorisée sur place",
    schemaTitre: "Récupération sur air comprimé",
    schemaEtapes: ["Compresseur d'air", "Échangeur de récupération", "Eau chaude ou chauffage d'atelier"],
    argumentRoi:
      "Le compresseur d'air chauffe déjà : la récupération transforme cette chaleur en eau chaude ou en chauffage d'atelier, avec une prime CEE en appui.",
    eligibilite:
      "Site industriel. Récupération de chaleur sur compresseur d'air comprimé, échangeur, régulation anti-surchauffe et mesure thermique, selon IND-UT-125.",
    metrologie:
      "Contrôle COFRAC : compteur d'énergie thermique, puissance du compresseur, photos de l'échangeur, schéma de principe et facture.",
  },
  "IND-UT-129": {
    typeSite: "Hangars et ateliers à grande hauteur",
    decideur: "Directeur de site ou responsable maintenance",
    enjeu: "Chaleur rabattue au sol, moins de chauffage en partie haute",
    schemaTitre: "Déstratification d'air",
    schemaEtapes: ["Volume haut de plafond", "Déstratificateur ou brasseur", "Air chaud ramené au sol"],
    argumentRoi:
      "Dans un hangar, la chaleur stagne au plafond. Le déstratificateur la ramène vers les postes de travail : chantier court et prime CEE.",
    eligibilite:
      "Local industriel de grande hauteur. Déstratificateur ou brasseur d'air conforme à IND-UT-129, asservi à la température, sur un volume chauffé.",
    metrologie:
      "Contrôle COFRAC : hauteur sous plafond, nombre d'appareils, photos d'implantation, facture et mise en service.",
  },
  "IND-UT-134": {
    typeSite: "Sites industriels en suivi énergétique",
    decideur: "Responsable énergie ou directeur industriel",
    enjeu: "IPÉ mesurés, porte d'entrée ISO 50001",
    schemaTitre: "Mesurage et indicateurs",
    schemaEtapes: ["Compteurs d'énergie", "Indicateurs de performance", "Pilotage ISO 50001"],
    argumentRoi:
      "Sans mesure, pas de pilotage. Le système d'IPÉ ouvre la prime CEE et donne au site les indicateurs d'une démarche ISO 50001.",
    eligibilite:
      "Site industriel. Système de mesurage d'indicateurs de performance énergétique conforme à IND-UT-134, avec plan de comptage et exploitation des IPÉ.",
    metrologie:
      "Contrôle COFRAC : plan de comptage, liste des IPÉ, photos des compteurs, facture et preuve de mise en exploitation.",
  },
  "BAT-TH-139": {
    typeSite: "Supermarchés, hypermarchés et cuisines centrales",
    decideur: "Directeur technique de l'enseigne ou property manager",
    enjeu: "Chaleur des groupes froids réinjectée en chauffage ou eau chaude",
    schemaTitre: "Récupération sur groupe froid",
    schemaEtapes: ["Groupe froid alimentaire", "Échangeur de récupération", "Chauffage ou eau chaude"],
    argumentRoi:
      "Les linéaires froids et les chambres rejettent de la chaleur en permanence. La récupération la transforme en chauffage ou en eau chaude, avec une prime CEE majeure en grande surface.",
    eligibilite:
      "Bâtiment tertiaire. Récupération de chaleur sur groupe de production de froid, selon BAT-TH-139, avec mesure de l'énergie thermique valorisée.",
    metrologie:
      "Contrôle COFRAC : puissance frigorifique, compteur thermique, photos de l'échangeur, schéma et facture.",
  },
  "BAT-TH-134": {
    typeSite: "Magasins alimentaires et cliniques",
    decideur: "Directeur technique ou gestionnaire du site",
    enjeu: "Haute pression flottante sur le froid tertiaire",
    schemaTitre: "HP flottante tertiaire",
    schemaEtapes: ["Groupe froid tertiaire", "Régulation HP flottante", "Condensation selon l'extérieur"],
    argumentRoi:
      "La condensation suit l'air extérieur au lieu d'une haute pression fixe. Prime CEE sur les magasins alimentaires et les cliniques, facture frigo en baisse.",
    eligibilite:
      "Bâtiment tertiaire avec groupe de production de froid. Régulation haute pression flottante conforme à BAT-TH-134.",
    metrologie:
      "Contrôle COFRAC : description de la régulation, sondes, photos de l'armoire, puissances et facture.",
  },
  "BAT-EQ-127": {
    typeSite: "Parkings couverts, surfaces de vente et entrepôts",
    decideur: "Directeur immobilier ou responsable exploitation",
    enjeu: "Relamping LED avec détection, éclairage plus sobre",
    schemaTitre: "LED et détection",
    schemaEtapes: ["Luminaires existants", "LED à détection", "Zones de circulation"],
    argumentRoi:
      "Le relamping LED avec détection coupe l'éclairage des zones vides. Prime CEE sur les parkings couverts, les surfaces de vente et les entrepôts.",
    eligibilite:
      "Bâtiment tertiaire existant. Luminaires LED d'éclairage général avec détection, selon BAT-EQ-127, en remplacement d'un éclairage moins efficient.",
    metrologie:
      "Contrôle COFRAC : décompte des luminaires, efficacité lumineuse, détection, photos d'échantillonnage et facture.",
  },
  "BAT-TH-157": {
    typeSite: "Mairies, écoles et gymnases",
    decideur: "Élu, DGS ou directeur des services techniques",
    enjeu: "Sortie du fioul ou du gaz vers une chaufferie biomasse",
    schemaTitre: "Chaudière biomasse collective",
    schemaEtapes: ["Chaufferie fossile", "Chaudière biomasse", "Réseau de chauffage"],
    argumentRoi:
      "La chaufferie fioul ou gaz d'une mairie, d'une école ou d'un gymnase passe au bois. Prime CEE collective et baisse de la facture fossile.",
    eligibilite:
      "Bâtiment tertiaire à chauffage collectif. Chaudière biomasse collective conforme à BAT-TH-157, en remplacement d'un générateur fossile, avec étude de dimensionnement.",
    metrologie:
      "Contrôle COFRAC : puissance, rendement, combustible, photos de chaufferie, dépose du fossile et facture.",
  },
  "BAR-TH-145": {
    typeSite: "Immeubles collectifs, bailleurs et copropriétés",
    decideur: "Bailleur, syndic ou conseil syndical",
    enjeu: "Rénovation globale d'immeuble, prime CEE par bâtiment",
    schemaTitre: "Rénovation globale collective",
    schemaEtapes: ["Enveloppe de l'immeuble", "Ventilation", "Chauffage après isolation"],
    argumentRoi:
      "Une copropriété ou un parc bailleur se traite à l'immeuble. La prime CEE de rénovation globale se compte par bâtiment, isolation avant chauffage.",
    eligibilite:
      "Bâtiment résidentiel collectif existant. Bouquet conforme à BAR-TH-145, gain énergétique et audit, entreprises RGE. Si MaPrimeRénov' est visé : ne pas signer les devis définitifs avant l'accord écrit de l'ANAH.",
    metrologie:
      "Contrôle COFRAC par échantillonnage : audit, factures, surfaces, performances, photos horodatées et attestations.",
  },
  "BAR-EN-101": {
    typeSite: "Maisons, combles perdus ou aménagés",
    decideur: "Propriétaire occupant ou bailleur",
    enjeu: "Combles, premier poste de déperdition, prime au m²",
    schemaTitre: "Isolation des combles",
    schemaEtapes: ["Combles perdus ou aménagés", "Isolant certifié", "Trappe et ventilation"],
    argumentRoi:
      "Les combles sont le premier poste de déperdition. La prise en charge CEE se calcule au m², avant tout remplacement de chaudière.",
    eligibilite:
      "Maison existante de plus de 2 ans. Isolation de combles ou de toiture, résistance thermique au moins égale au seuil de BAR-EN-101, isolant certifié, entreprise RGE.",
    metrologie:
      "Contrôle COFRAC : épaisseur, lambda, calcul de R, surface isolée, photos de la pose et facture.",
  },
  "BAR-EN-102": {
    typeSite: "Façades de maisons individuelles",
    decideur: "Propriétaire occupant ou bailleur",
    enjeu: "ITE ou ITI, enveloppe avant le chauffage",
    schemaTitre: "Isolation des murs",
    schemaEtapes: ["Façade existante", "ITE ou ITI", "Finition et tableaux"],
    argumentRoi:
      "La façade se traite avant la chaudière. ITE ou ITI : prise en charge CEE au m², générateur dimensionné ensuite sur des besoins réduits.",
    eligibilite:
      "Maison existante. Isolation des murs par l'extérieur ou par l'intérieur, R conforme à BAR-EN-102, mise en œuvre RGE. L'ITI en geste isolé reste exclue de MaPrimeRénov' 2026.",
    metrologie:
      "Contrôle COFRAC : épaisseur, lambda, R, surface de façade, photos des tableaux et facture.",
  },
  "BAR-EN-103": {
    typeSite: "Planchers bas sur sous-sol, cave ou vide sanitaire",
    decideur: "Propriétaire occupant ou bailleur",
    enjeu: "Plancher bas, geste d'enveloppe au m²",
    schemaTitre: "Isolation du plancher bas",
    schemaEtapes: ["Sous-sol, cave ou vide sanitaire", "Isolant en sous-face", "Continuité aux murs"],
    argumentRoi:
      "Le plancher bas sur cave ou vide sanitaire est souvent oublié. La prise en charge CEE se fait au m², en complément des combles et des murs.",
    eligibilite:
      "Maison existante. Isolation d'un plancher bas sur sous-sol, cave ou vide sanitaire, R conforme à BAR-EN-103, entreprise RGE.",
    metrologie:
      "Contrôle COFRAC : épaisseur, lambda, R, surface, photos de la sous-face et facture.",
  },
};

export function accrocheHero(estimationMaxEur: number) {
  if (estimationMaxEur >= 15000) return "Opération quasi-blanche / Reste à charge ultra-optimisé";
  return "Reste à charge optimisé selon le gisement CEE du site";
}

export function dossierIngenierieCee(fiche: Pick<CeeFicheTravaux, "code" | "argumentCle" | "cibles">): DossierIngenierieCee {
  return (
    DOSSIERS_INGENIERIE_CEE[fiche.code] ?? {
      argumentRoi: fiche.argumentCle,
      eligibilite: `Critères de la fiche standardisée ${fiche.code} en vigueur. Cibles : ${fiche.cibles}`,
      metrologie:
        "Contrôle par organisme accrédité COFRAC : échantillonnage, photos horodatées, factures et cohérence avec la fiche.",
      typeSite: fiche.cibles,
      decideur: "Décideur du site à identifier en rendez-vous",
      enjeu: fiche.argumentCle,
      schemaTitre: fiche.code,
      schemaEtapes: ["Existant", "Équipement éligible", "Usage valorisé"],
    }
  );
}
