import { useEffect, useState } from "react";
import { downloadPremiumPdf } from "../pdf/premiumDocument";

type CourseId = "closer" | "bouclier" | "passoire" | "amo" | "frigoriste" | "diagnostiqueur";

type QuizChoice = { label: string; correct: boolean; why: string };

type Course = {
  id: CourseId;
  title: string;
  priceHt: number;
  duration: string;
  audience: string;
  objective: string;
  skills: string[];
  modules: { title: string; points: string[] }[];
  lessons: { title: string; paragraphs: string[] }[];
  quiz: { prompt: string; choices: QuizChoice[] }[];
};

const COURSES: Course[] = [
  {
    id: "closer",
    title: "Closer d'Élite en Rénovation Globale & Financements Bancaires",
    priceHt: 490,
    duration: "7 heures",
    audience: "Commerciaux BTP, apporteurs d'affaires, mandataires immobiliers",
    objective: "Préparer un rendez-vous salon capable de poser deux à trois dossiers de rénovation globale dans le mois. C'est un objectif d'entraînement, pas un revenu garanti.",
    skills: [
      "Lire un reste à charge et le comparer à des économies estimées, sans promettre un reste à charge nul.",
      "Recueillir un dossier de solvabilité et expliquer la FIPEN.",
      "Faire signer le bon de commande et la demande de crédit au même rendez-vous, sans encaisser ni démarrer.",
    ],
    modules: [
      {
        title: "Diagnostic flash de solvabilité et aides Anah",
        points: [
          "Revenus, charges, et repère d'endettement utilisé par les partenaires.",
          "Aides 2026 indicatives : plafonds 30 000 € HT (2 classes) et 40 000 € HT (3 classes ou plus).",
          "Le dossier incomplet ne part pas.",
        ],
      },
      {
        title: "Présenter l'autofinancement par les économies",
        points: [
          "Mensualité illustrative contre économies estimées.",
          "L'écart positif n'est pas un reste à charge nul garanti.",
          "Les aides restent indicatives jusqu'à l'instruction.",
        ],
      },
      {
        title: "Financement au rendez-vous, sans brûler les délais",
        points: [
          "Demande Domofinance ou Franfinance et bon de commande au même rendez-vous.",
          "Bordereau de rétractation de 14 jours. Aucun acompte avant la formation définitive du crédit.",
          "Le report de 180 jours décale les échéances. Il n'autorise pas le chantier le soir même.",
        ],
      },
      {
        title: "Dix objections, et la réponse qui tient",
        points: [
          "« C'est trop cher », « je vais réfléchir », « mon neveu est moins cher ».",
          "« Je veux démarrer demain », « les aides sont sûres », « je signe sans ma conjointe ».",
          "Chaque réponse rappelle le délai, l'ORIAS et le caractère indicatif des aides.",
        ],
      },
    ],
    lessons: [
      {
        title: "Solvabilité et aides, en une visite",
        paragraphs: [
          "On note les revenus, les crédits en cours et la composition du ménage. Le seuil de 35 % est le repère des partenaires, pas un article qui valide seul le dossier.",
          "Les aides Anah et CEE se présentent comme une estimation 2026. Plafonds du parcours accompagné : 30 000 € HT pour 2 classes, 40 000 € HT pour 3 classes ou plus. On ne promet pas 63 000 €.",
        ],
      },
      {
        title: "L'écart mensualité / économies",
        paragraphs: [
          "Le discours tient si la mensualité illustrative est inférieure aux économies estimées. On montre le calcul. On dit que les économies ne sont pas un revenu, et que l'aide ne rembourse pas le crédit toute seule.",
          "Dire « reste à charge nul » comme une certitude est une pratique trompeuse. Le bon mot est : écart mensuel estimé, à confirmer par l'offre de crédit et par l'instruction des aides.",
        ],
      },
      {
        title: "Un rendez-vous, deux signatures, zéro démarrage",
        paragraphs: [
          "Le bon de commande et la demande de financement peuvent se signer ensemble, après la FIPEN lue à voix haute. Le bordereau détachable part avec le client.",
          "Aucun euro n'est encaissé tant que le crédit n'est pas définitivement formé. Le chantier attend la fin des 14 jours, ou des 3 jours si le client a demandé par écrit une exécution immédiate.",
        ],
      },
      {
        title: "Les objections qui font tomber le dossier",
        paragraphs: [
          "À « je démarre cette semaine », on répond que démarrer avant l'accord fait perdre le crédit affecté et, s'il y a MaPrimeRénov', l'aide.",
          "À « les aides sont acquises », on répond qu'elles sont indicatives. À « sans mon conjoint », on ne fait pas signer un crédit que le ménage n'a pas compris.",
        ],
      },
    ],
    quiz: [
      {
        prompt: "Peut-on promettre un reste à charge nul ?",
        choices: [
          { label: "Oui, si les économies dépassent la mensualité sur le papier", correct: false, why: "L'écart est une estimation. Il ne garantit ni les économies ni le montant instruit des aides." },
          { label: "Non. On montre un écart estimé, et on dit que les aides et les économies ne sont pas acquises", correct: true, why: "C'est la limite entre un argument chiffré et une pratique trompeuse." },
          { label: "Oui, dès que l'Anah est déposée", correct: false, why: "Le dépôt n'est pas l'accord, et l'accord n'éteint pas le crédit." },
          { label: "Oui, avec le report de 180 jours", correct: false, why: "Le report décale les échéances. Il ne met pas le coût des travaux à zéro." },
        ],
      },
      {
        prompt: "Le client veut signer et ouvrir le chantier le soir même.",
        choices: [
          { label: "On encaisse 30 % et les artisans passent le lendemain", correct: false, why: "Sur un crédit affecté, pas d'acompte ni de démarrage avant la formation définitive du crédit." },
          { label: "On signe la demande et le bon de commande, on remet le bordereau, on ne démarre pas", correct: true, why: "Le rendez-vous unique rassemble les pièces. Il ne brûle pas les 14 jours." },
          { label: "Le 1 clic supprime le délai si le partenaire est Domofinance", correct: false, why: "Aucun partenaire ne déroge au Code de la consommation." },
          { label: "On démarre seulement l'isolation, pas la PAC", correct: false, why: "Le marché lié ne se découpe pas pour contourner le délai." },
        ],
      },
      {
        prompt: "Quel plafond de travaux du parcours accompagné enseigne cette masterclass pour 2026 ?",
        choices: [
          { label: "70 000 € HT et 63 000 € d'aides systématiques", correct: false, why: "Ces chiffres sont un barème ancien. Les citer comme acquis induit le client en erreur." },
          { label: "30 000 € HT pour 2 classes, 40 000 € HT pour 3 classes ou plus", correct: true, why: "C'est le plafond du mode d'emploi Anah de mars 2026, déjà vu dans le module MAR." },
          { label: "15 000 €, comme un mono-geste", correct: false, why: "Le parcours accompagné n'est pas le forfait par geste." },
          { label: "Aucun plafond si le commercial est ORIAS", correct: false, why: "L'ORIAS autorise à présenter un crédit. Il ne relève pas les plafonds d'aides." },
        ],
      },
      {
        prompt: "Que fait-on d'une objection « les aides sont sûres à ce montant » ?",
        choices: [
          { label: "On confirme, pour ne pas perdre la signature", correct: false, why: "Confirmer un montant non instruit expose le dossier et le client." },
          { label: "On répète que le montant est indicatif jusqu'à l'instruction Anah et CEE", correct: true, why: "C'est la mise en garde. Elle se dit avant la signature." },
          { label: "On baisse le TAEG annoncé sous celui de la FIPEN", correct: false, why: "Le TAEG du salon est celui de l'offre. On ne l'arrange pas." },
          { label: "On fait signer le conjoint absent par délégation verbale", correct: false, why: "Un crédit se comprend par les personnes qui s'engagent." },
        ],
      },
    ],
  },
  {
    id: "bouclier",
    title: "Le Bouclier Anti-Contrôle Anah, CEE & COFRAC",
    priceHt: 390,
    duration: "7 heures",
    audience: "Artisans RGE, chefs de chantier, installateurs PAC et isolation",
    objective: "Tenir un dossier de chantier capable de répondre à un contrôle. L'objectif est d'éviter les rejets de prime par des pièces justes, pas de dissimuler un écart.",
    skills: [
      "Savoir ce que regardent l'Anah, un organisme de contrôle CEE et le COFRAC sur la qualification RGE.",
      "Constituer une trame photo datée et géolocalisée, avant, pendant et après.",
      "Répondre à une mise en demeure avec les pièces, sans antidater.",
    ],
    modules: [
      {
        title: "Cartographie des contrôles",
        points: [
          "Contrôle Anah sur pièces et sur place, y compris inopiné.",
          "Contrôle CEE par un organisme mandaté. Bureau Veritas en est un, pas le seul.",
          "COFRAC : il accrédite. Il ne « valide » pas un devis à la place de l'artisan.",
        ],
      },
      {
        title: "Trame photo de l'académie — 12 clichés",
        points: [
          "Avant : façades, chauffage, combles, menuiseries.",
          "Pendant : isolant nu avec repère d'épaisseur, réseau, groupe de sécurité, plaque machine.",
          "Après : mêmes cadrages. Horodatage et lieu réels. Une photo recadrée pour cacher un écart ne se défend pas.",
        ],
      },
      {
        title: "Devis et facture qui tiennent",
        points: [
          "RGE valide à la date du devis, R ACERMI, Uw de la menuiserie complète, ETAS, désembouage DTU 65.16.",
          "Dates réelles. Une date antidatée est un faux.",
          "Surfaces cohérentes avec le relevé, pas avec le barème qu'on voudrait atteindre.",
        ],
      },
      {
        title: "Répondre à une mise en demeure",
        points: [
          "Lire le délai. Répondre par écrit, avec les pièces demandées, sans inventer un fait.",
          "Ne pas « régulariser » en réécrivant un devis après coup.",
          "Si l'écart est réel, le traiter. Le silence et le faux dossier aggravent le rejet de prime.",
        ],
      },
    ],
    lessons: [
      {
        title: "Qui contrôle, et quoi",
        paragraphs: [
          "L'Anah peut demander les factures, les photos et la cohérence avec l'audit. Un organisme mandaté pour les CEE regarde la réalité des travaux éligibles. Le COFRAC accrédite des organismes : ce n'est pas un tampon magique sur la facture.",
          "Un contrôle inopiné se prépare tous les jours, pas la veille de la lettre.",
        ],
      },
      {
        title: "Douze clichés, aux vraies dates",
        paragraphs: [
          "La trame de l'académie : quatre vues avant, quatre pendant, quatre après, dont la plaque de la machine et un repère d'épaisseur d'isolant. Ce n'est pas un article qui fixe le nombre douze. C'est le minimum pour raconter le chantier.",
          "La géolocalisation et l'heure viennent de l'appareil, au moment de la prise. On ne déplace pas une épingle sur la carte pour « coller » à l'adresse du devis.",
        ],
      },
      {
        title: "Le devis dit ce qui a été vendu",
        paragraphs: [
          "RGE en cours, R certifié, Uw de la fenêtre entière, ETAS de la PAC, désembouage si le réseau est ancien. La facture reprend les mêmes quantités, pas une surface plus grande.",
          "Antidater pour entrer dans une campagne d'aides est un faux. La masterclass apprend à refuser cette demande, y compris si elle vient du client.",
        ],
      },
      {
        title: "La lettre de l'Anah",
        paragraphs: [
          "On répond dans le délai, on joint ce qui existe, on explique ce qui manque sans le fabriquer. Un devis réécrit après le contrôle ne répare pas un chantier non conforme.",
          "Le recours existe. Il part de pièces vraies. L'académie ne fournit pas un modèle pour contester un fait exact.",
        ],
      },
    ],
    quiz: [
      {
        prompt: "À quoi servent les douze clichés de la trame ?",
        choices: [
          { label: "À remplacer un chantier non fait par un dossier photo", correct: false, why: "La photo décrit le chantier. Elle ne le crée pas." },
          { label: "À montrer l'avant, le pendant et l'après, avec des dates et un lieu réels", correct: true, why: "C'est une trame d'académie, pas un quota légal à truquer." },
          { label: "À être géolocalisés à la main sur l'adresse du devis", correct: false, why: "Déplacer le lieu de la photo est un faux." },
          { label: "Douze est un article du Code de la consommation", correct: false, why: "Le nombre vient de la méthode de l'académie." },
        ],
      },
      {
        prompt: "Le client demande d'antidater le devis pour « rattraper » une campagne d'aides.",
        choices: [
          { label: "On le fait si les travaux sont bons", correct: false, why: "La qualité des travaux ne rend pas une fausse date licite." },
          { label: "On refuse. La date du devis est celle de son établissement", correct: true, why: "Une date fausse fait tomber la prime et expose l'artisan." },
          { label: "On antidate seulement la facture, pas le devis", correct: false, why: "Les deux pièces disent la vérité, ou le dossier est faux." },
          { label: "On antidate si le MAR est d'accord", correct: false, why: "Personne dans la chaîne n'a le droit de fabriquer une date." },
        ],
      },
      {
        prompt: "Que regarde un contrôle de cohérence sur une PAC ?",
        choices: [
          { label: "Uniquement le logo de la marque", correct: false, why: "La marque ne prouve ni l'ETAS, ni le désembouage, ni la qualification." },
          { label: "RGE à la date du devis, ETAS, désembouage DTU 65.16, quantités réelles", correct: true, why: "Ce sont les points qui font rejeter une ligne." },
          { label: "Le COFRAC signe la facture", correct: false, why: "Le COFRAC accrédite des organismes. Il n'est pas l'artisan." },
          { label: "La couleur du groupe extérieur", correct: false, why: "L'esthétique n'est pas le critère d'éligibilité." },
        ],
      },
      {
        prompt: "Une mise en demeure arrive. Le chantier a un écart réel.",
        choices: [
          { label: "On réécrit le devis du mois dernier", correct: false, why: "Réécrire le passé aggrave le dossier." },
          { label: "On répond dans le délai, avec les pièces qui existent, et on traite l'écart", correct: true, why: "La réponse utile est documentée et exacte." },
          { label: "On ne répond pas : le délai éteint la demande", correct: false, why: "Le silence laisse le rejet suivre son cours." },
          { label: "On envoie douze nouvelles photos prises aujourd'hui et datées d'hier", correct: false, why: "C'est un faux horodatage." },
        ],
      },
    ],
  },
  {
    id: "passoire",
    title: "Investisseur Passoire Thermique : De F/G à A/B avec Plus-Value Maximale",
    priceHt: 990,
    duration: "14 heures",
    audience: "Investisseurs, marchands de biens, propriétaires bailleurs",
    objective: "Lire une passoire F ou G, chiffrer les travaux et les aides réellement ouvertes, et ne pas confondre un objectif de négociation avec une plus-value garantie.",
    skills: [
      "Négocier un bien F ou G à partir des travaux et de l'interdiction progressive de location, sans prendre -30 % pour une règle.",
      "Distinguer le parcours accompagné de l'occupant des montages bailleur ou marchand de biens.",
      "Phaser les travaux qui comptent pour un futur acquéreur, et passer le fiscal au conseil compétent.",
    ],
    modules: [
      {
        title: "Négocier une passoire, sans chiffre magique",
        points: [
          "L'interdiction de louer les F et G pèse sur le prix. Elle ne fixe pas une décote de 30 %.",
          "On achète après audit, pas après une annonce.",
          "Le portage, le temps d'instruction et le refus d'aide font partie du prix de revient.",
        ],
      },
      {
        title: "MaPrimeRénov' 2026, sans le mythe des 70 000 €",
        points: [
          "Parcours accompagné : 30 000 € HT (2 classes) ou 40 000 € HT (3 classes ou plus).",
          "Les 63 000 € et les 70 000 € sont un barème ancien. Les enseigner comme acquis est une erreur.",
          "L'occupant, le bailleur et le marchand de biens n'ouvrent pas le même dossier. Pas de dépôt si le ménage n'est pas éligible.",
        ],
      },
      {
        title: "Travaux qui se voient à la revente",
        points: [
          "Enveloppe d'abord, générateur ensuite, finitions que l'acquéreur perçoit.",
          "Un DPE cible se prépare avec l'audit. Il ne se décrète pas.",
          "L'architecture ne remplace pas les mentions RGE du devis.",
        ],
      },
      {
        title: "Fiscal : trois régimes qui ne se mélangent pas",
        points: [
          "Déficit foncier : location nue, conditions et plafonds à vérifier avec un conseil.",
          "LMNP au réel : autre régime. On ne l'empile pas au déficit foncier par habitude.",
          "Marchand de biens : résultat commercial, pas la plus-value des particuliers. 50 000 € nets ne sont pas un résultat du cours.",
        ],
      },
    ],
    lessons: [
      {
        title: "Le prix d'une passoire",
        paragraphs: [
          "Un logement F ou G se négocie parce que la location se ferme et que les travaux sont lourds. La décote se calcule sur des devis, pas sur un slogan de -30 %.",
          "Acheter sans visite ni audit, c'est acheter le risque que le scénario à deux classes soit impossible.",
        ],
      },
      {
        title: "Qui a droit à l'aide",
        paragraphs: [
          "Le parcours accompagné 2026 plafonne les travaux à 30 000 ou 40 000 € HT selon le gain de classes. Annoncer 63 000 € d'aides ou un dossier à 70 000 € « sans blocage » reprend un barème qui n'est plus celui du mode d'emploi de mars 2026.",
          "Le propriétaire occupant, le bailleur et le marchand de biens ne déposent pas le même dossier. Monter une aide au nom d'une personne non éligible pour financer une revente est un dossier qui se fait rejeter.",
        ],
      },
      {
        title: "Ce qui augmente le prix de revente",
        paragraphs: [
          "L'acquéreur paie un DPE, des menuiseries, une façade et un chauffage dimensionné après isolation. Les finitions viennent après l'enveloppe.",
          "Viser A ou B est un scénario d'audit. Ce n'est pas une étiquette que le cours délivre.",
        ],
      },
      {
        title: "Le fiscal ne se devine pas",
        paragraphs: [
          "Le déficit foncier, le LMNP au réel et l'activité de marchand de biens sont trois mondes. Les mélanger dans une même promesse de « 50 000 € de plus-value nette » est une erreur de régime.",
          "La masterclass apprend à poser la question au conseil fiscal avant l'achat. Elle ne produit pas la plus-value.",
        ],
      },
    ],
    quiz: [
      {
        prompt: "D'où vient une décote de 30 % sur une passoire ?",
        choices: [
          { label: "D'un barème légal applicable à tout F ou G", correct: false, why: "Aucune règle ne fixe la négociation à -30 %." },
          { label: "D'un objectif de négociation, à recouper avec les devis et le temps de portage", correct: true, why: "Le prix se calcule. Il ne se récite pas." },
          { label: "De l'Anah, qui impose le prix d'achat", correct: false, why: "L'Anah instruit des aides. Elle ne fixe pas le prix du bien." },
          { label: "Du DPE seul, sans visite", correct: false, why: "L'étiquette sans audit ne dit pas si le scénario est faisable." },
        ],
      },
      {
        prompt: "Un investisseur veut « déclencher 63 000 € d'aides » sur un parcours à 70 000 €.",
        choices: [
          { label: "C'est le barème 2026 du parcours accompagné", correct: false, why: "Le mode d'emploi de mars 2026 retient 30 000 et 40 000 € HT." },
          { label: "C'est un chiffre ancien. Le dossier 2026 se calcule sur 30 000 ou 40 000 € HT, et seulement si la personne est éligible", correct: true, why: "Le cours sert à ne plus vendre ce mythe." },
          { label: "C'est ouvert à tout marchand de biens, sans occupant", correct: false, why: "Le marchand de biens n'est pas, par son activité, le bénéficiaire du parcours de l'occupant." },
          { label: "C'est automatique si le bien est en G", correct: false, why: "L'étiquette G ouvre une contrainte. Elle n'ouvre pas un chèque." },
        ],
      },
      {
        prompt: "Quel ordre de travaux sert aussi la revente ?",
        choices: [
          { label: "Finitions et cuisine, puis isolation si le budget reste", correct: false, why: "L'enveloppe précède le générateur et les finitions." },
          { label: "Isolation et menuiseries, puis chauffage dimensionné après, puis finitions visibles", correct: true, why: "C'est l'ordre technique, et c'est ce qu'un acquéreur peut lire sur le DPE." },
          { label: "PAC d'abord, pour montrer l'unité extérieure aux visites", correct: false, why: "Une PAC avant isolation est surdimensionnée et fragile pour les aides." },
          { label: "Peu importe, le DPE cible se choisit sur l'annonce", correct: false, why: "L'étiquette après travaux se démontre. Elle ne s'écrit pas." },
        ],
      },
      {
        prompt: "Comment traiter la promesse de 50 000 € de plus-value nette ?",
        choices: [
          { label: "Comme un résultat du cours, dû à l'élève", correct: false, why: "Aucune formation ne doit un gain immobilier." },
          { label: "Comme un slogan. Le régime fiscal (foncier, LMNP, marchand) se valide avec un conseil, avant l'achat", correct: true, why: "Trois régimes différents ne produisent pas le même net." },
          { label: "En empilant déficit foncier et LMNP au réel sur le même bien", correct: false, why: "Ces régimes ne se superposent pas par convenance." },
          { label: "En faisant porter l'aide Anah par un occupant fictif", correct: false, why: "Un dossier d'aide au nom d'une personne qui n'est pas la bonne est un dossier faux." },
        ],
      },
    ],
  },
  {
    id: "amo",
    title: "Devenir AMO de Terrain Indépendant & Relevés de Pathologies",
    priceHt: 690,
    duration: "14 heures",
    audience: "Gestionnaires de travaux, secrétaires indépendantes, reconversions",
    objective: "Poser un cadre d'AMO de terrain : relevé, pathologies, dossier préparé pour le MAR, et relation écrite avec le contractant général. Les honoraires cités sont la grille de l'académie, pas un tarif légal.",
    skills: [
      "Distinguer l'AMO, le MAR agréé et le contractant général.",
      "Relever un bâti ancien sans masquer une pathologie.",
      "Proposer une mission chiffrée, avec un écrit sur qui facture quoi.",
    ],
    modules: [
      {
        title: "Cadre et grille d'honoraires de l'académie",
        points: [
          "Mission courte de relevé : 1 100 € HT. Mission dossier complet : 2 300 € HT. Grille pédagogique, librement négociée.",
          "L'AMO ne signe pas l'audit réglementaire à la place du MAR, et ne vend pas les travaux.",
          "Le contrat d'AMO décrit le livrable : métrés, pathologies, pièces, pas une prime garantie.",
        ],
      },
      {
        title: "Relevé et bâti ancien",
        points: [
          "Métré sur place. Un laser ne voit pas l'humidité ni une charpente pourrie si on ne les regarde pas.",
          "Pisé : perspirance, chaux sans ciment, remontées capillaires avant d'isoler.",
          "Ventilation prévue en même temps que l'étanchéité.",
        ],
      },
      {
        title: "Dossier Anah et MAR",
        points: [
          "L'AMO prépare les pièces et les métrés. Le MAR agréé tient l'audit, le plan de financement et les jalons.",
          "Pas de devis définitif signé avant l'accord écrit lorsque le parcours est visé.",
          "Une pathologie tueuse se dit au MAR. Elle ne se gomme pas du rapport.",
        ],
      },
      {
        title: "Pack avec le contractant général",
        points: [
          "Le pack à 7 500 € HT est une hypothèse de répartition commerciale de l'académie, à écrire dans un contrat.",
          "Qui facture l'AMO, qui facture les travaux, qui porte l'ORIAS s'il y a un crédit : trois lignes distinctes.",
          "L'AMO indépendant ne devient pas artisan du chantier qu'il a chiffré.",
        ],
      },
    ],
    lessons: [
      {
        title: "Ce que l'AMO vend",
        paragraphs: [
          "Une mission de relevé à 1 100 € HT ou un dossier à 2 300 € HT, selon la grille de l'académie. Ce ne sont pas des prix imposés par l'Anah. Ils se contractualisent.",
          "Le livrable est un relevé et une liste de pathologies. Ce n'est ni l'agrément MAR, ni une promesse d'aide.",
        ],
      },
      {
        title: "Le terrain",
        paragraphs: [
          "Le laser donne des cotes. L'œil donne le salpêtre, le ciment sur le pisé, la ferme fatiguée, l'absence d'entrée d'air.",
          "Isoler un mur humide ou cimenter une terre, c'est créer le sinistre que le contrôle retrouvera.",
        ],
      },
      {
        title: "Avec le MAR",
        paragraphs: [
          "Le MAR agréé reste le tiers de confiance du parcours. L'AMO lui apporte des métrés justes et des photos datées.",
          "Si le mur ne peut pas recevoir l'isolant prévu, on le dit avant le dépôt. On ne « fait passer » le dossier.",
        ],
      },
      {
        title: "Le pack à 7 500 € HT",
        paragraphs: [
          "Sept mille cinq cents euros HT est une répartition d'étude entre AMO et contractant général. Elle n'existe que si un contrat la dit, avec la part de chacun.",
          "L'AMO ne touche pas une commission occulte sur les travaux. S'il présente un crédit, l'ORIAS s'applique en plus, et ce n'est plus la même mission.",
        ],
      },
    ],
    quiz: [
      {
        prompt: "Que sont 1 100 € et 2 300 € HT ?",
        choices: [
          { label: "Les honoraires légaux obligatoires de tout AMO en France", correct: false, why: "Aucun barème national n'impose ces deux montants." },
          { label: "La grille pédagogique de l'académie, à écrire dans le contrat de mission", correct: true, why: "Ce sont des prix de formation et de positionnement, pas un tarif d'État." },
          { label: "Le plafond de la prestation MAR", correct: false, why: "La prestation MAR du parcours est plafonnée à part, dans le mode d'emploi Anah." },
          { label: "Le prix du contractant général", correct: false, why: "Les travaux sont un autre contrat, un autre livrable." },
        ],
      },
      {
        prompt: "Sur un mur en pisé humide, que fait l'AMO ?",
        choices: [
          { label: "Il prescrit un ciment étanche pour aller vite", correct: false, why: "Le ciment bloque la terre et fabrique le désordre." },
          { label: "Il décrit les remontées, exige un traitement perspirant à la chaux, et le dit au MAR", correct: true, why: "La pathologie se traite avant l'isolant, et elle s'écrit." },
          { label: "Il retire la mention du rapport pour ne pas bloquer l'aide", correct: false, why: "Masquer une pathologie, c'est livrer un faux relevé." },
          { label: "Il isole quand même : le R suffit", correct: false, why: "Le R ne sèche pas un mur." },
        ],
      },
      {
        prompt: "Qui tient l'audit et les jalons du parcours accompagné ?",
        choices: [
          { label: "L'AMO, puisqu'il a fait le métré", correct: false, why: "Le métré prépare. Il ne remplace pas l'agrément MAR." },
          { label: "Le MAR agréé Anah. L'AMO lui fournit des pièces exactes", correct: true, why: "Les rôles restent séparés, comme dans la matrice MAR & AMO." },
          { label: "Le contractant général, parce qu'il signe le forfait", correct: false, why: "Le forfait travaux n'est pas l'audit réglementaire." },
          { label: "Le client, seul", correct: false, why: "Le client décide et signe. Il ne conduit pas les jalons techniques à la place du MAR." },
        ],
      },
      {
        prompt: "Le pack à 7 500 € HT est valable si...",
        choices: [
          { label: "Il est annoncé oralement sur le chantier", correct: false, why: "Une répartition d'honoraires s'écrit." },
          { label: "Un contrat distingue la mission AMO, les travaux, et, s'il y a crédit, le mandat ORIAS", correct: true, why: "Trois rôles, trois lignes. Pas de commission cachée dans les travaux." },
          { label: "L'AMO prend 7 500 € sur l'aide Anah", correct: false, why: "L'aide n'est pas la rémunération de l'AMO." },
          { label: "L'AMO réalise aussi une partie des travaux", correct: false, why: "Celui qui relève ne devient pas l'entreprise du même lot sans un autre contrat, et sans confusion des rôles." },
        ],
      },
    ],
  },
  {
    id: "frigoriste",
    title: "Prépa Frigoriste d'Élite : Attestation Fluides F-Gaz (Catégorie I) & Dépannage 3D",
    priceHt: 490,
    duration: "14 heures",
    audience: "Installateurs de pompes à chaleur, techniciens CVC, électriciens, chauffagistes",
    objective: "Réussir l'examen théorique et pratique de l'Attestation d'Aptitude Catégorie I (F-Gaz). Maîtriser le cycle frigorifique 4 organes, le calcul de surchauffe et sous-refroidissement sur manomètres, le tirage au vide normé et la traçabilité Cerfa 15497.",
    skills: [
      "Lire le cycle à 4 organes et les états du fluide, HP et BP comprises.",
      "Calculer la surchauffe et le sous-refroidissement à partir des pressions saturantes, pas d'un thermomètre seul.",
      "Conduire une mise en service : vide inférieur à 270 Pa, appoint au gramme, procès-verbal constructeur et Cerfa 15497.",
    ],
    modules: [
      {
        title: "Le Cycle Frigorifique 4 Organes en 3D",
        points: [
          "Compresseur, condenseur, détendeur et évaporateur.",
          "États du fluide : gaz surchauffé, liquide sous-refroidi, mélange diphasique.",
          "Rôle des pressions HP et BP. La température de saturation se lit sur la relation pression-température du fluide, pas au hasard.",
        ],
      },
      {
        title: "Diagramme Enthalpique de Mollier & Calculs Sans Faute",
        points: [
          "Surchauffe évaporateur : T surchauffe = T aspiration − T évaporation. T évaporation est la température saturante à la BP.",
          "Sous-refroidissement condenseur : T condensation (saturante HP) − T de la ligne liquide.",
          "Pannes types : manque de charge, échangeur encrassé, détendeur bloqué. On mesure avant de recharger.",
        ],
      },
      {
        title: "Protocole Officiel de Mise en Service (MES) & Épreuve Pratique",
        points: [
          "Checklist des contrôles préalables : serrage des dudgeons au couple, conformité électrique (terre, disjoncteur courbe D), puis épreuve d'étanchéité à l'azote sec. Sur banc, le repère souvent travaillé est 35 bar, sans dépasser la pression maximale de l'équipement.",
          "Tirage au vide profond, inférieur à 270 Pa (2,7 mbar), et calcul d'appoint de fluide frigorigène au-delà de la précharge usine, au gramme près à la balance.",
          "Mesure des températures et pressions réelles en régime établi : Delta T eau visé par la notice (souvent 5 °C) et surchauffe opérationnelle.",
          "Remplissage et signature du procès-verbal de mise en service constructeur (Daikin, Atlantic, Mitsubishi) et du Cerfa 15497. Récupération du fluide sans rejet à l'atmosphère. Ces pièces documentent la garantie et le dossier ; elles ne remplacent pas l'accord Anah.",
        ],
      },
      {
        title: "Réglementation F-Gaz, Cerfa 15497 & Traçabilité",
        points: [
          "Règlement européen F-Gaz en vigueur : la session d'octobre 2026 suit les textes applicables, sans inventer un seuil de PRP.",
          "Catégorie I : manipulations sans limite de charge, à condition d'avoir l'attestation d'aptitude et que l'entreprise détienne l'attestation de capacité.",
          "Bordereau de suivi des déchets pour le fluide récupéré, registre d'outillage contrôlé, et sanctions en cas de rejet ou d'intervention irrégulière. Les montants se vérifient dans les textes, ils ne s'improvisent pas.",
        ],
      },
    ],
    lessons: [
      {
        title: "Les quatre organes",
        paragraphs: [
          "Le compresseur élève la pression. Le condenseur cède la chaleur et le fluide devient liquide sous-refroidi. Le détendeur abaisse la pression. L'évaporateur capte la chaleur et le fluide ressort en gaz surchauffé.",
          "Entre détendeur et évaporateur, le mélange est diphasique. La HP et la BP ne se lisent pas l'une pour l'autre : une BP basse n'est pas, à elle seule, un manque de charge.",
        ],
      },
      {
        title: "Surchauffe et sous-refroidissement",
        paragraphs: [
          "T surchauffe = T aspiration − T évaporation. T évaporation se déduit de la pression BP et du fluide (R32, R410A, autre), via la courbe de saturation. Un thermomètre posé sur le tube sans la pression ne donne pas la surchauffe.",
          "Le sous-refroidissement est l'écart entre la température saturante HP et la température de la ligne liquide. Manque de charge, échangeur sale ou détendeur bloqué se distinguent par ces deux écarts, pas par une recharge au jugé.",
        ],
      },
      {
        title: "Mise en service et banc d'examen",
        paragraphs: [
          "Avant le vide : dudgeons au couple, terre, protection électrique adaptée, azote sec pour l'étanchéité. 35 bar est un repère de banc. Sur machine, on ne dépasse pas la pression maximale indiquée par le constructeur.",
          "Le vide se tient sous 270 Pa, soit 2,7 mbar. 2 mbar n'est pas l'équivalent de 270 Pa. L'appoint se calcule au-delà de la précharge usine et se pèse. En régime établi, on relève le Delta T eau demandé par la notice, souvent 5 °C, et la surchauffe réelle.",
          "Le procès-verbal Daikin, Atlantic ou Mitsubishi, et le Cerfa 15497, se remplissent et se signent. Récupérer le fluide sans le rejeter fait partie du geste. Ces documents n'obtiennent pas, à eux seuls, une aide Anah.",
        ],
      },
      {
        title: "F-Gaz et traçabilité",
        paragraphs: [
          "L'attestation de catégorie I autorise les manipulations de fluides fluorés sans plafond de charge. Elle ne dispense pas l'entreprise de son attestation de capacité, ni du matériel contrôlé.",
          "Le Cerfa 15497 trace l'intervention. Le fluide récupéré part avec un bordereau de suivi des déchets. Le rejet à l'atmosphère est interdit. Les seuils de PRP et les sanctions se lisent dans le règlement en vigueur, pas dans une fiche commerciale.",
        ],
      },
    ],
    quiz: [
      {
        prompt: "Comment calcule-t-on la surchauffe à l'évaporateur ?",
        choices: [
          { label: "Température d'aspiration moins température saturante à la BP", correct: true, why: "La température d'évaporation vient de la pression et du fluide. Le thermomètre seul ne suffit pas." },
          { label: "Température extérieure moins température d'eau", correct: false, why: "C'est un écart d'eau ou d'air, pas la surchauffe du fluide." },
          { label: "HP moins BP, en bar", correct: false, why: "Un écart de pressions n'est pas une surchauffe en kelvin." },
          { label: "On recharge jusqu'à ce que le manomètre « ait l'air bon »", correct: false, why: "Une recharge sans mesure de surchauffe et de sous-refroidissement masque la panne." },
        ],
      },
      {
        prompt: "Quel vide tient l'épreuve, et que vaut 270 Pa ?",
        choices: [
          { label: "Inférieur à 270 Pa, soit 2,7 mbar", correct: true, why: "270 Pa = 2,7 mbar. Le repère de 2 mbar est plus bas et ne se confond pas avec 270 Pa." },
          { label: "270 Pa, c'est exactement 2 mbar", correct: false, why: "2 mbar valent 200 Pa. L'écart suffit à rater une lecture de banc." },
          { label: "Un vide de 500 mbar suffit si la précharge est déjà dans le groupe", correct: false, why: "La précharge usine ne dispense pas du tirage au vide du circuit assemblé." },
          { label: "On tire au vide après avoir chargé, pour gagner du temps", correct: false, why: "Le vide précède la charge. On ne vide pas un circuit déjà chargé à l'atmosphère." },
        ],
      },
      {
        prompt: "Que signent le procès-verbal de mise en service et le Cerfa 15497 ?",
        choices: [
          { label: "La trace de l'intervention, utile à la garantie constructeur et au dossier. Ils ne valent pas l'accord Anah", correct: true, why: "Daikin, Atlantic ou Mitsubishi exigent leur PV. Le Cerfa trace le fluide. L'aide se décide ailleurs." },
          { label: "L'obtention automatique de MaPrimeRénov'", correct: false, why: "Une fiche d'intervention ne remplace pas l'instruction." },
          { label: "Le droit de rejeter le reste de fluide si la charge est petite", correct: false, why: "Le rejet à l'atmosphère est interdit, quelle que soit la quantité." },
          { label: "La dispense d'attestation de catégorie I", correct: false, why: "Le Cerfa suppose une intervention faite par une personne et une entreprise habilitées." },
        ],
      },
      {
        prompt: "Que permet la catégorie I, seule ?",
        choices: [
          { label: "Manipuler les fluides fluorés sans limite de charge, si l'aptitude est valide et si l'entreprise a son attestation de capacité", correct: true, why: "La catégorie I lève le plafond de charge. Elle ne remplace pas la capacité de l'entreprise ni le matériel suivi." },
          { label: "Travailler sans attestation dès lors qu'on a suivi cette masterclass", correct: false, why: "La masterclass prépare l'examen. Elle ne délivre pas l'attestation d'aptitude." },
          { label: "Recharger un circuit qui fuit, sans recherche de fuite", correct: false, why: "Une fuite se traite. Recharger pour compenser un rejet est interdit." },
          { label: "Facturer 500 € de mise en service comme tarif légal", correct: false, why: "Aucun texte ne fixe la mise en service à 500 €. Le prix se contractualise." },
        ],
      },
    ],
  },
  {
    id: "diagnostiqueur",
    title: "Diagnostiqueur Immobilier DDT & Auditeur Énergétique d'Élite",
    priceHt: 890,
    duration: "21 heures",
    audience: "Professionnels de l'immobilier, techniciens du bâtiment, profils en reconversion, diagnostiqueurs en recertification",
    objective: "Maîtriser le dossier de diagnostic technique (amiante, plomb CREP, électricité, gaz, termites) et l'audit énergétique réglementaire appuyé sur le moteur 3CL. La certification est délivrée par un organisme accrédité COFRAC. Un objectif de 8 000 à 15 000 € par mois est un cadrage commercial de l'académie, pas un chiffre d'affaires dû.",
    skills: [
      "Lire un DPE 3CL et poser deux scénarios de travaux de sortie de passoire, vers la classe B.",
      "Reconnaître un danger grave immédiat gaz, et les six exigences du diagnostic électrique.",
      "Séparer liste A et liste B de l'amiante, et appliquer le seuil CREP de 1 mg/cm².",
    ],
    modules: [
      {
        title: "Le DPE 3CL & l'Audit Énergétique Réglementaire",
        points: [
          "Moteur de calcul 3CL-2021 : le DPE classe le logement en énergie et en gaz à effet de serre.",
          "Repérage des ponts thermiques et des consommations en kWhep/m²/an. Une surface ou un système inventé fausse la classe.",
          "Audit réglementaire distinct du DPE : au moins deux scénarios de travaux pour sortir une passoire F ou G et viser la classe B. L'aide Anah, si elle est citée, reste indicative.",
        ],
      },
      {
        title: "Les Diagnostics Sécurité (Électricité NF C 16-600 & Gaz)",
        points: [
          "Six exigences électriques : appareil général de commande et de protection accessible ; au moins un différentiel 30 mA en tête ; prise de terre ; liaison équipotentielle des locaux contenant une baignoire ou une douche ; protection contre les surintensités ; absence de matériel vétuste ou de partie active nue.",
          "La terre se juge à la tension de contact : résistance × sensibilité du différentiel ≤ 50 V. Avec un 30 mA, l'anomalie se situe vers 1 667 Ω. 100 Ω est un objectif de bonne réalisation, pas le seuil de défaillance du diagnostic.",
          "Gaz : étanchéité, ventilation, combustion. Danger grave et immédiat : couper l'alimentation, informer, ne pas laisser le gaz ouvert pour « ne pas bloquer la vente ».",
        ],
      },
      {
        title: "Les Diagnostics Santé & Bâti (Amiante, Plomb CREP, Termites)",
        points: [
          "Liste A : flocages, calorifugeages, faux plafonds. Liste B : les autres matériaux et produits, dont les toitures en fibrociment. Le fibrociment n'est pas un flocage.",
          "CREP : fluorescence X, seuil légal 1 mg/cm². L'état de dégradation du revêtement se note. Un plomb au-dessus du seuil et dégradé crée des obligations pour le propriétaire. Il ne se tait pas.",
          "Termites : diagnostic réglementaire dans les zones délimitées par arrêté préfectoral. L'état parasitaire plus large (mérule, autres insectes) est souvent une demande du notaire, distincte du seul termite.",
        ],
      },
      {
        title: "Pratique Logicielle & Business Notaires / Agences Immobilières",
        points: [
          "Rapport : ce qui a été vu, ce qui ne l'a pas été, les réserves utiles. Une réserve n'efface pas une anomalie constatée. L'assurance de responsabilité civile professionnelle couvre l'activité déclarée, pas un faux.",
          "Indépendance : le diagnostiqueur est missionné pour constater. Il ne modifie pas un DGI, un CREP ou un DPE pour faire signer une vente.",
          "Partenariat écrit avec une agence ou un office notarial : délais, périmètre, choix du diagnostiqueur par le vendeur. Pas de commission occulte contre un rapport favorable.",
          "8 000 à 15 000 € par mois est une hypothèse de volume de l'académie. Ce n'est ni un tarif légal, ni un revenu garanti.",
        ],
      },
    ],
    lessons: [
      {
        title: "3CL et audit",
        paragraphs: [
          "Le DPE 3CL-2021 convertit le bâti, les systèmes et les usages conventionnels en kWhep/m²/an, puis en classe. Un pont thermique oublié ou une surface arrondie pour « améliorer » la lettre est un faux calcul.",
          "L'audit réglementaire ne se confond pas avec le DPE. Il propose au moins deux scénarios de travaux pour sortir une passoire F ou G et viser B. Les aides éventuellement chiffrées restent indicatives jusqu'à l'instruction.",
        ],
      },
      {
        title: "Électricité et gaz",
        paragraphs: [
          "Le référentiel NF C 16-600 organise le constat autour de six exigences : coupure générale accessible, différentiel 30 mA, terre, liaison équipotentielle des pièces d'eau, surintensités, et matériel ni vétuste ni dangereux au contact.",
          "On n'écrit pas « terre hors service » parce que la mesure dépasse 100 Ω. Le critère de l'anomalie est la tension de contact : résistance de terre multipliée par la sensibilité du différentiel, plafond 50 V. À 30 mA, cela situe le seuil vers 1 667 Ω. 100 Ω reste un objectif de chantier soigné.",
          "Sur le gaz, l'étanchéité et la ventilation se mesurent. Un danger grave et immédiat impose la coupure. Laisser le gaz ouvert pour ne pas fâcher l'agence, c'est quitter le métier.",
        ],
      },
      {
        title: "Amiante, plomb, termites",
        paragraphs: [
          "La liste A vise trois ouvrages : flocages, calorifugeages, faux plafonds. La liste B vise le reste, y compris une toiture en fibrociment. Classer le fibrociment en liste A, c'est se tromper de grille d'évaluation.",
          "Le CREP se mesure par fluorescence X. Le seuil est 1 mg/cm². En dessous, le revêtement n'est pas retenu comme plomb réglementaire. Au-dessus, l'état de dégradation décide de la suite : un revêtement dégradé ne se décrit pas comme sain.",
          "Le diagnostic termites suit la carte préfectorale. L'état parasitaire demandé par un notaire peut aller plus loin, mérule comprise. On écrit le périmètre de la mission, on n'en invente pas un autre.",
        ],
      },
      {
        title: "Rapport et partenariats",
        paragraphs: [
          "Le logiciel sort un rapport. La responsabilité reste sur ce qui a été vu, ce qui a été inaccessible, et les réserves. Une réserve ne sert pas à gommer une anomalie déjà constatée. La responsabilité civile professionnelle suit l'activité déclarée.",
          "Une agence ou un notaire peut recommander un diagnostiqueur. La convention se écrit : délais, zone, prix du rapport payé par le client. Le diagnostiqueur ne touche pas une commission pour adoucir un DPE, un CREP ou un danger gaz.",
          "Huit à quinze mille euros par mois est un ordre de grandeur commercial de l'académie, selon le nombre de missions réellement signées. Ce n'est pas un plancher légal, et cette masterclass ne délivre pas la certification. Celle-ci vient d'un organisme certificateur accrédité par le COFRAC.",
        ],
      },
    ],
    quiz: [
      {
        prompt: "À partir de quand la prise de terre est-elle en anomalie face à un différentiel 30 mA ?",
        choices: [
          { label: "Quand la résistance × 30 mA dépasse 50 V, soit vers 1 667 Ω", correct: true, why: "Le critère est la tension de contact. 100 Ω est un objectif de bonne réalisation, pas le seuil du diagnostic." },
          { label: "Dès que la mesure dépasse 100 Ω", correct: false, why: "100 Ω ne figure pas comme seuil de défaillance du constat électrique." },
          { label: "La terre ne se mesure pas si le différentiel déclenche au test", correct: false, why: "Le test du bouton ne remplace pas la mesure de terre ni la couverture 30 mA." },
          { label: "Uniquement si le client voit des fils nus", correct: false, why: "Les parties actives nues sont une exigence parmi les six, pas la seule." },
        ],
      },
      {
        prompt: "Que fait-on d'un danger grave et immédiat sur une installation de gaz ?",
        choices: [
          { label: "On coupe l'alimentation, on informe, on l'écrit", correct: true, why: "Le DGI ne se négocie pas avec l'agence pour garder la vente." },
          { label: "On le note en réserve et on laisse le gaz ouvert jusqu'à l'acte", correct: false, why: "Une réserve ne neutralise pas un danger immédiat." },
          { label: "On attend le notaire pour décider de la coupure", correct: false, why: "La coupure ne se délègue pas à la signature de l'acte." },
          { label: "On reclasse le logement en DPE C pour compenser", correct: false, why: "Le DPE et le diagnostic gaz ne se compensent pas." },
        ],
      },
      {
        prompt: "Où classe-t-on une toiture en fibrociment, et quel est le seuil CREP ?",
        choices: [
          { label: "Fibrociment en liste B. CREP : 1 mg/cm² par fluorescence X", correct: true, why: "La liste A est réservée aux flocages, calorifugeages et faux plafonds. Le seuil plomb est 1 mg/cm²." },
          { label: "Fibrociment en liste A, comme un flocage. CREP : 100 Ω", correct: false, why: "Le fibrociment n'est pas un flocage, et 100 Ω n'est pas une unité de plomb." },
          { label: "Pas de liste si la toiture est peinte. CREP : 10 mg/cm²", correct: false, why: "Une peinture ne sort pas un matériau de la liste B. Le seuil CREP est 1 mg/cm²." },
          { label: "Liste A dès qu'il y a des termites", correct: false, why: "Les termites relèvent d'un autre diagnostic, pas de la liste amiante." },
        ],
      },
      {
        prompt: "Que sont 8 000 à 15 000 € par mois, et qui délivre la certification ?",
        choices: [
          { label: "Une hypothèse commerciale de l'académie. La certification vient d'un organisme accrédité par le COFRAC", correct: true, why: "Le COFRAC accrédite le certificateur. Il ne signe pas la carte du diagnostiqueur, et le mois à 15 000 € n'est pas dû." },
          { label: "Un revenu légal minimum, versé par le COFRAC", correct: false, why: "Aucun texte ne garantit ce chiffre, et le COFRAC n'est pas l'employeur du diagnostiqueur." },
          { label: "Le prix obligatoire d'un DDT complet", correct: false, why: "Le prix du dossier se contractualise. Il n'est pas fixé à ce montant." },
          { label: "Une commission due par le notaire si le DPE est favorable", correct: false, why: "L'indépendance interdit d'acheter ou de vendre la conclusion d'un rapport." },
        ],
      },
    ],
  },
];

type Enrollment = {
  courseId: CourseId;
  name: string;
  email: string;
  quizBest: number;
  attested: boolean;
};

const STORAGE_KEY = "energia-prepa-formations-v1";
const WAITLIST_KEY = "energia-prepa-waitlist-v1";

type WaitEntry = {
  courseId: CourseId;
  name: string;
  company: string;
  email: string;
  phone: string;
};

function loadWaitlist(): WaitEntry[] {
  try {
    const raw = localStorage.getItem(WAITLIST_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WaitEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadEnrollments(): Enrollment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Enrollment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function ttc(ht: number) {
  return Math.round(ht * 1.2);
}

function euros(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function courseIndicators(course: Course) {
  return [
    { label: "Public visé", value: course.audience },
    { label: "Durée officielle", value: course.duration },
    { label: "Tarif HT & TTC", value: `${euros(course.priceHt)} HT · ${euros(ttc(course.priceHt))} TTC` },
    { label: "Modalité", value: "Session octobre 2026" },
  ];
}

export default function CatalogueFormations() {
  const [courseId, setCourseId] = useState<CourseId | null>(null);
  const [screen, setScreen] = useState<"catalogue" | "detail" | "learn">("catalogue");
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => loadEnrollments());
  const [waitlist, setWaitlist] = useState<WaitEntry[]>(() => loadWaitlist());
  const [waitOpen, setWaitOpen] = useState(false);
  const [waitName, setWaitName] = useState("");
  const [waitCompany, setWaitCompany] = useState("");
  const [waitEmail, setWaitEmail] = useState("");
  const [waitPhone, setWaitPhone] = useState("");
  const [waitDone, setWaitDone] = useState(false);
  const [waitError, setWaitError] = useState("");
  const [lesson, setLesson] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const course = COURSES.find((item) => item.id === courseId) ?? null;
  const enrollment = enrollments.find((item) => item.courseId === courseId) ?? null;
  const activeLesson = course?.lessons[lesson];
  const question = course?.quiz[quizIndex];
  const selected = picked === null ? null : question?.choices[picked];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem(WAITLIST_KEY, JSON.stringify(waitlist));
  }, [waitlist]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setProgress((value) => {
        if (value >= 100) {
          window.clearInterval(timer);
          return 100;
        }
        return value + 4;
      });
    }, 200);
    return () => window.clearInterval(timer);
  }, [playing]);

  const quizPassed = (enrollment?.quizBest ?? 0) >= 3;

  function openCourse(id: CourseId) {
    setCourseId(id);
    setScreen("detail");
    setLesson(0);
    setPlaying(false);
    setProgress(0);
    setQuizIndex(0);
    setPicked(null);
    setScore(0);
    setQuizDone(false);
  }

  function openWaitlist(id: CourseId) {
    setCourseId(id);
    const already = waitlist.some((item) => item.courseId === id);
    setWaitDone(already);
    setWaitError("");
    setWaitOpen(true);
  }

  function confirmWaitlist() {
    if (!course) return;
    const phoneDigits = waitPhone.replace(/\D/g, "");
    if (waitName.trim().length < 2 || waitCompany.trim().length < 2 || !waitEmail.includes("@") || phoneDigits.length < 8) {
      setWaitError("Indiquez le nom, l'entreprise ou le métier, un e-mail et un portable.");
      return;
    }
    setWaitError("");
    setWaitlist((current) => {
      const others = current.filter((item) => item.courseId !== course.id);
      return [...others, { courseId: course.id, name: waitName.trim(), company: waitCompany.trim(), email: waitEmail.trim(), phone: waitPhone.trim() }];
    });
    setWaitDone(true);
  }

  function answer(index: number) {
    if (picked !== null || !question) return;
    setPicked(index);
    if (question.choices[index]?.correct) setScore((value) => value + 1);
  }

  function nextQuestion() {
    if (!course) return;
    const nextScore = score;
    if (quizIndex + 1 >= course.quiz.length) {
      setQuizDone(true);
      setEnrollments((current) =>
        current.map((item) =>
          item.courseId === course.id ? { ...item, quizBest: Math.max(item.quizBest, nextScore) } : item,
        ),
      );
      return;
    }
    setQuizIndex((value) => value + 1);
    setPicked(null);
  }

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs font-semibold tracking-[0.22em] text-[#e8c872]">CATALOGUE DES FORMATIONS D&apos;ÉLITE</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Masterclass & métiers</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
          Les 6 masterclass d&apos;élite ouvrent en octobre 2026 : rejoignez la liste d&apos;attente prioritaire pour garantir votre place et bénéficier du tarif privilège de lancement.
        </p>
      </header>

      {screen === "catalogue" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {COURSES.map((item) => {
            const reserved = waitlist.some((entry) => entry.courseId === item.id);
            return (
            <article key={item.id} className="flex flex-col rounded-3xl border border-[#e8c872]/30 bg-gradient-to-br from-[#1a1408] to-[#0c1018] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <p className="rounded-full border border-[#e8c872]/50 bg-[#e8c872]/10 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#f5e6b8]">
                  <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#e8c872]" />
                  PROCHAINE SESSION : OCTOBRE 2026 · PLACES LIMITÉES
                </p>
                <p className="rounded-full bg-[#e8c872] px-3 py-1 text-sm font-semibold text-[#1a1203]">{euros(item.priceHt)} HT</p>
              </div>
              <p className="mt-3 text-xs tracking-[0.16em] text-[#e8c872]">{item.duration}</p>
              <h3 className="mt-2 text-xl font-semibold leading-snug text-white">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{item.objective}</p>
              <p className="mt-3 text-xs uppercase tracking-wide text-slate-500">Public</p>
              <p className="text-sm text-slate-200">{item.audience}</p>
              <div className="mt-5 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => openWaitlist(item.id)}
                  className="rounded-full bg-gradient-to-r from-[#f5e6b8] to-[#c8962e] px-4 py-2.5 text-sm font-semibold text-[#1a1203]"
                >
                  {reserved ? "Place prioritaire réservée" : "Rejoindre la liste d'attente prioritaire"}
                </button>
                <button type="button" onClick={() => openCourse(item.id)} className="text-sm text-[#e8c872] underline-offset-2 hover:underline">
                  Découvrir le programme
                </button>
              </div>
            </article>
            );
          })}
        </div>
      ) : null}

      {screen !== "catalogue" && course ? (
        <div className="space-y-4">
          <button type="button" onClick={() => setScreen("catalogue")} className="text-sm text-[#e8c872] underline-offset-2 hover:underline">
            Retour au catalogue
          </button>

          {screen === "detail" ? (
            <article className="rounded-3xl border border-[#e8c872]/30 bg-white/[0.03] p-5">
              <p className="inline-flex rounded-full border border-[#e8c872]/50 px-3 py-1 text-[11px] font-semibold tracking-wide text-[#f5e6b8]">
                PROCHAINE SESSION : OCTOBRE 2026 · PLACES LIMITÉES
              </p>
              <p className="mt-3 text-xs tracking-[0.16em] text-[#e8c872]">{euros(course.priceHt)} HT · {course.duration}</p>
              <h3 className="mt-2 text-2xl font-semibold text-white">{course.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">{course.objective}</p>
              <h4 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[#e8c872]">Compétences</h4>
              <ul className="mt-2 space-y-2">
                {course.skills.map((skill) => (
                  <li key={skill} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-slate-200">{skill}</li>
                ))}
              </ul>
              <h4 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[#e8c872]">Programme</h4>
              <ol className="mt-2 space-y-3">
                {course.modules.map((module, index) => (
                  <li key={module.title} className="rounded-2xl border border-white/10 p-3">
                    <p className="text-sm font-semibold text-white">{index + 1}. {module.title}</p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-400">
                      {module.points.map((point) => <li key={point}>{point}</li>)}
                    </ul>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex flex-wrap gap-2">
                <button type="button" onClick={() => openWaitlist(course.id)} className="rounded-full bg-gradient-to-r from-[#f5e6b8] to-[#c8962e] px-4 py-2.5 text-sm font-semibold text-[#1a1203]">
                  Réserver ma place sur la liste prioritaire
                </button>
                <button
                  type="button"
                  onClick={() =>
                    downloadPremiumPdf({
                      fileName: `programme-${course.id}.pdf`,
                      title: course.title,
                      indicators: courseIndicators(course),
                      lead: course.objective,
                      modules: course.modules,
                      footnote: "Objectif d'entraînement. Pas une promesse de chiffre d'affaires, d'aide ou de plus-value. Les aides financières, lorsqu'elles sont citées, restent une estimation à titre indicatif.",
                    })
                  }
                  className="rounded-full border border-white/15 px-4 py-2.5 text-sm text-white"
                >
                  Télécharger la fiche programme
                </button>
              </div>
            </article>
          ) : null}

          {screen === "learn" && enrollment && activeLesson ? (
            <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
              <aside className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                <p className="text-xs tracking-[0.14em] text-[#e8c872]">PLAN</p>
                <ul className="mt-3 space-y-2">
                  {course.lessons.map((item, index) => (
                    <li key={item.title}>
                      <button
                        type="button"
                        onClick={() => {
                          setLesson(index);
                          setPlaying(false);
                          setProgress(0);
                        }}
                        className={`w-full rounded-2xl px-3 py-2 text-left text-sm ${lesson === index ? "bg-[#e8c872] text-[#1a1203]" : "bg-black/20 text-slate-200"}`}
                      >
                        {index + 1}. {item.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </aside>
              <div className="space-y-4">
                <article className="rounded-3xl border border-white/10 bg-black/40 p-4">
                  <p className="text-xs text-slate-500">Lecteur démo · {enrollment.name}</p>
                  <h3 className="mt-1 text-xl font-semibold text-white">{activeLesson.title}</h3>
                  <button type="button" onClick={() => { setPlaying(true); setProgress(0); }} className="mt-3 rounded-full bg-[#e8c872] px-4 py-2 text-sm font-semibold text-[#1a1203]">
                    Lire le cours
                  </button>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full bg-[#e8c872]" style={{ width: `${progress}%` }} />
                  </div>
                  {playing ? (
                    <div className="mt-4 space-y-3">
                      {activeLesson.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="text-sm leading-relaxed text-slate-200">{paragraph}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-slate-400">Le texte du cours s&apos;affiche ici. Il n&apos;y a pas de flux vidéo externe.</p>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      downloadPremiumPdf({
                        fileName: `fiche-${course.id}-${lesson + 1}.pdf`,
                        title: activeLesson.title,
                        indicators: courseIndicators(course),
                        lead: course.title,
                        modules: [{ title: "Synthèse de séance", points: activeLesson.paragraphs }],
                        footnote: "Fiche de cours de l'académie. Elle prépare l'examen ou la pratique. Elle ne les remplace pas.",
                      })
                    }
                    className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm text-white"
                  >
                    Télécharger la fiche synthèse
                  </button>
                </article>

                <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                  <h3 className="text-lg font-semibold text-white">Quiz de validation</h3>
                  {quizDone ? (
                    <>
                      <p className="mt-2 text-2xl font-semibold text-white">{score}/4</p>
                      <p className="mt-2 text-sm text-slate-300">
                        {score >= 3 ? "Seuil atteint. L'attestation pédagogique peut être éditée." : "Trois bonnes réponses sur quatre ouvrent l'attestation. Relisez le module manqué."}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setQuizIndex(0);
                          setPicked(null);
                          setScore(0);
                          setQuizDone(false);
                        }}
                        className="mt-3 rounded-full border border-white/15 px-4 py-2 text-sm text-white"
                      >
                        Rejouer
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-xs text-slate-500">Question {quizIndex + 1} / 4</p>
                      <p className="mt-2 text-sm font-semibold text-white">{question?.prompt}</p>
                      <ul className="mt-3 space-y-2">
                        {question?.choices.map((choice, index) => {
                          const show = picked !== null;
                          const tone = !show ? "border-white/10" : choice.correct ? "border-emerald-400/50 bg-emerald-500/10" : index === picked ? "border-red-400/50 bg-red-500/10" : "border-white/10 opacity-60";
                          return (
                            <li key={choice.label}>
                              <button type="button" disabled={picked !== null} onClick={() => answer(index)} className={`w-full rounded-2xl border px-3 py-2 text-left text-sm text-slate-100 ${tone}`}>
                                {choice.label}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      {selected ? (
                        <div className="mt-3">
                          <p className="text-sm text-slate-300">{selected.why}</p>
                          <button type="button" onClick={nextQuestion} className="mt-3 rounded-full bg-[#e8c872] px-4 py-2 text-sm font-semibold text-[#1a1203]">
                            {quizIndex + 1 === 4 ? "Voir le score" : "Question suivante"}
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
                  <button
                    type="button"
                    disabled={!quizPassed && !(quizDone && score >= 3)}
                    onClick={() => {
                      const finalScore = Math.max(enrollment.quizBest, quizDone ? score : 0);
                      if (finalScore < 3) return;
                      setEnrollments((current) => current.map((item) => (item.courseId === course.id ? { ...item, attested: true, quizBest: finalScore } : item)));
                      downloadPremiumPdf({
                        fileName: `attestation-${course.id}.pdf`,
                        title: "Attestation pédagogique de réussite",
                        indicators: [
                          { label: "Public visé", value: enrollment.name },
                          { label: "Durée officielle", value: course.duration },
                          { label: "Tarif HT & TTC", value: `${euros(course.priceHt)} HT · ${euros(ttc(course.priceHt))} TTC` },
                          { label: "Modalité", value: new Date().toLocaleDateString("fr-FR") },
                        ],
                        lead: course.title,
                        modules: [
                          {
                            title: "Résultat retenu",
                            points: [`Score retenu : ${finalScore}/4.`, "Seuil de délivrance : 3 bonnes réponses sur 4."],
                          },
                        ],
                        footnote: "Document de l'Académie ENERGIA-CONSEIL IA. Ne vaut ni diplôme d'État, ni qualification RGE, ni agrément Anah, ni attestation d'aptitude F-Gaz, ni immatriculation ORIAS.",
                      });
                    }}
                    className="mt-4 rounded-full bg-gradient-to-r from-[#f5e6b8] to-[#c8962e] px-4 py-2.5 text-sm font-semibold text-[#1a1203] disabled:opacity-40"
                  >
                    Obtenir mon attestation de réussite
                  </button>
                </article>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {waitOpen && course ? (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/75 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-[#e8c872]/50 bg-[#100c08] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            {waitDone ? (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-500/15 text-2xl text-emerald-300">✓</div>
                <h3 className="mt-4 text-xl font-semibold text-white">Votre place prioritaire est confirmée !</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">Nous vous contacterons dès l&apos;ouverture de la session d&apos;octobre.</p>
                <p className="mt-3 text-xs text-[#e8c872]">{course.title}</p>
                <button type="button" onClick={() => setWaitOpen(false)} className="mt-5 rounded-full bg-[#e8c872] px-4 py-2 text-sm font-semibold text-[#1a1203]">
                  Fermer
                </button>
              </>
            ) : (
              <>
                <p className="text-xs tracking-[0.16em] text-[#e8c872]">LISTE D&apos;ATTENTE</p>
                <h3 className="mt-2 text-xl font-semibold leading-snug text-white">Inscrivez-vous sur la liste d&apos;attente prioritaire de la Masterclass</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">Bénéficiez d&apos;un tarif de lancement exclusif (-30%) et recevez votre invitation 48h avant l&apos;ouverture officielle.</p>
                <p className="mt-2 text-xs text-[#e8c872]">{course.title}</p>
                <label className="mt-4 block text-sm text-slate-300">
                  Nom & prénom
                  <input value={waitName} onChange={(event) => setWaitName(event.target.value)} className="mt-1 w-full rounded-2xl border border-[#e8c872]/30 bg-black/50 px-3 py-2 text-white" />
                </label>
                <label className="mt-3 block text-sm text-slate-300">
                  Entreprise / métier
                  <input value={waitCompany} onChange={(event) => setWaitCompany(event.target.value)} className="mt-1 w-full rounded-2xl border border-[#e8c872]/30 bg-black/50 px-3 py-2 text-white" />
                </label>
                <label className="mt-3 block text-sm text-slate-300">
                  Adresse e-mail
                  <input value={waitEmail} onChange={(event) => setWaitEmail(event.target.value)} type="email" className="mt-1 w-full rounded-2xl border border-[#e8c872]/30 bg-black/50 px-3 py-2 text-white" />
                </label>
                <label className="mt-3 block text-sm text-slate-300">
                  Numéro de portable
                  <input value={waitPhone} onChange={(event) => setWaitPhone(event.target.value)} type="tel" className="mt-1 w-full rounded-2xl border border-[#e8c872]/30 bg-black/50 px-3 py-2 text-white" />
                </label>
                {waitError ? <p className="mt-3 text-sm text-amber-200">{waitError}</p> : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <button type="button" onClick={confirmWaitlist} className="rounded-full bg-gradient-to-r from-[#f5e6b8] to-[#c8962e] px-4 py-2.5 text-sm font-semibold text-[#1a1203]">
                    Réserver ma place sur la liste prioritaire
                  </button>
                  <button type="button" onClick={() => setWaitOpen(false)} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white">
                    Fermer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}

    </section>
  );
}
