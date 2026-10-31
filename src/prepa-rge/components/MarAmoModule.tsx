import { useMemo, useState } from "react";

type Panel = "matrice" | "jalons" | "outils" | "qcm";

type ActorId = "moa" | "mar" | "amo" | "cg";

const ACTORS: {
  id: ActorId;
  badge: string;
  title: string;
  short: string;
  role: string;
  aides: string;
  travaux: string;
  responsabilite: string;
  interdit: string;
}[] = [
  {
    id: "moa",
    badge: "CLIENT",
    title: "Maître d'ouvrage",
    short: "Propriétaire",
    role: "Décideur du projet. Il choisit le scénario, signe les marchés et reste bénéficiaire des aides.",
    aides: "Titulaire du dossier Anah. Il certifie ses revenus et ses pièces. Les aides lui sont versées.",
    travaux: "Donne l'ordre de démarrer uniquement après l'accord écrit. Il réceptionne avec l'AMO et le MAR.",
    responsabilite: "Exactitude des informations déclarées. Une fausse déclaration de revenus lui incombe.",
    interdit: "Signer les devis définitifs avant l'accord Anah s'il veut conserver MaPrimeRénov'.",
  },
  {
    id: "mar",
    badge: "AGRÉÉ ANAH",
    title: "MAR agréé Anah",
    short: "Tiers de confiance",
    role: "Mon Accompagnateur Rénov', agréé par l'État. Il tient l'audit, le plan de financement et le fil du parcours.",
    aides: "Garrot du dossier : scénarios, plafonds, et cohérence entre audit, devis et factures.",
    travaux: "Il ne vend pas les travaux. Il constate, à la visite finale, l'écart entre le prévu et le réalisé.",
    responsabilite: "Indépendance stricte. Son agrément tombe si le conseil est intéressé.",
    interdit: "Réaliser les travaux, ou percevoir une commission sur les chantiers qu'il accompagne.",
  },
  {
    id: "amo",
    badge: "HUB ADMIN",
    title: "AMO technique et administrative",
    short: "Cabinet de relevé",
    role: "Relevés métriques, pathologies du bâti ancien, phasage urgence hivernale ou bouquet global, suivi des dossiers.",
    aides: "Prépare les pièces techniques que le MAR et le maître d'ouvrage déposent. Il ne se substitue pas à l'agrément MAR.",
    travaux: "Ordonne les postes : toiture qui fuit d'abord, isolation avant le générateur, ventilation après l'étanchéité.",
    responsabilite: "Justesse des métrés, des R, des Uw et de l'état du bâti (pisé, humidité, charpente).",
    interdit: "Présenter un métré de bureau comme une visite, ou masquer une pathologie pour faire passer un devis.",
  },
  {
    id: "cg",
    badge: "RGE",
    title: "Contractant général",
    short: "ENERGIA CONSEIL IA",
    role: "Prix global et forfaitaire ferme. Direction de tous les corps d'état, sélection des artisans RGE, livraison.",
    aides: "Coordonne les devis RGE que le dossier consomme. Les aides restent une estimation jusqu'à l'instruction.",
    travaux: "Pilotage, ordre des travaux, déblocage 40 % seulement après validation du coordinateur.",
    responsabilite: "Garantie décennale des entreprises, responsabilité de la livraison du forfait signé.",
    interdit: "Démarrer le chantier MaPrimeRénov' avant l'accord écrit, ou faire signer un geste isolé exclu en 2026.",
  },
];

const JALONS: { n: number; title: string; points: string[] }[] = [
  {
    n: 1,
    title: "Visite initiale sur site",
    points: [
      "La visite est obligatoire. Un dossier monté sans voir le logement ne tient pas.",
      "Analyse thermique, acoustique et confort d'été, pas seulement la facture de chauffage.",
      "Situation du ménage : précarité, adaptation à la perte d'autonomie, urgence d'habitat.",
      "Le rendez-vous France Rénov' oriente vers le MAR. Il précède le dépôt sur monprojet.anah.gouv.fr.",
    ],
  },
  {
    n: 2,
    title: "Audit énergétique réglementaire",
    points: [
      "Scénarios chiffrés avec un gain d'au moins 2 étiquettes DPE.",
      "Un logement F ou G doit sortir de la passoire dans le scénario retenu. Rester en F ou G n'ouvre pas le parcours.",
      "Au moins deux gestes d'isolation : murs, menuiseries, sols ou toiture.",
      "Pas de chaudière gaz neuve, pas de maintien d'un chauffage au fioul.",
    ],
  },
  {
    n: 3,
    title: "Plan de financement",
    points: [
      "Plafonds de travaux du mode d'emploi Anah (mars 2026) : 30 000 € HT pour 2 classes, 40 000 € HT pour 3 classes ou plus.",
      "Taux : Bleu 80 %, Jaune 60 %, Violet 45 %, Rose 10 %.",
      "Prestation MAR dans un plafond de 2 000 € TTC : Bleu 100 %, Jaune 80 %, Violet 40 %, Rose 20 %.",
      "Écrêtement TTC du parcours : Bleu 100 %, Jaune 90 %, Violet 80 %, Rose 50 %.",
      "L'avance existe sous conditions. Le guide ne fixe pas 70 % sur le parcours accompagné. L'avance jusqu'à 50 % est écrite pour le parcours par geste.",
      "Les montants restent indicatifs jusqu'à l'instruction. Ne jamais signer les devis définitifs avant l'accord écrit.",
    ],
  },
  {
    n: 4,
    title: "Visite post-travaux sur site",
    points: [
      "Comparer devis initiaux, travaux réellement exécutés et factures des artisans RGE.",
      "Un poste absent, une surface réduite ou un équipement différent se signale. On ne « rattrape » pas la pièce au paiement.",
      "Photos, métrés et PV de réception alimentent le dossier de solde.",
    ],
  },
  {
    n: 5,
    title: "Clôture et solde des subventions",
    points: [
      "Le MAR assiste le dépôt des factures et le versement du solde.",
      "Le délai de versement Anah n'est pas un acompte artisan. Le financement du montant des travaux se monte à part.",
      "Écart entre l'estimation et le montant instruit : le client assume l'écart, sauf erreur prouvée dans la limite prévue au devis.",
    ],
  },
];

const PROFILES = [
  { color: "Bleu", taux: "80 %", mar: "100 %", ecretement: "100 % TTC", tone: "bg-sky-500/20 text-sky-100" },
  { color: "Jaune", taux: "60 %", mar: "80 %", ecretement: "90 % TTC", tone: "bg-amber-400/20 text-amber-100" },
  { color: "Violet", taux: "45 %", mar: "40 %", ecretement: "80 % TTC", tone: "bg-violet-500/20 text-violet-100" },
  { color: "Rose", taux: "10 %", mar: "20 %", ecretement: "50 % TTC", tone: "bg-rose-500/20 text-rose-100" },
];

const PATHOLOGIES: { title: string; detail: string }[] = [
  {
    title: "Remontées capillaires",
    detail: "Repérer le front d'humidité avant d'isoler. Un complexe étanche sur un mur mouillé enferme l'eau et fait cloquer l'enduit.",
  },
  {
    title: "Perspirance du pisé",
    detail: "Le mur en terre doit sécher vers l'extérieur et l'intérieur. On ne le traite pas comme un parpaing.",
  },
  {
    title: "Chaux, sans ciment",
    detail: "Enduit et joints à la chaux. Le ciment bloque la vapeur, casse le pisé et crée des poches d'humidité.",
  },
  {
    title: "Charpente avant sarking",
    detail: "Insectes, pourriture et charges se voient avant de poser l'isolant au-dessus des chevrons. Un sarking ne répare pas une ferme morte.",
  },
  {
    title: "Ventilation adaptée",
    detail: "Après étanchéité, la VMC Hygro B assure les débits. Elle ne remplace pas l'air comburant d'un poêle, ni le test d'étanchéité.",
  },
  {
    title: "Urgence hivernale ou bouquet",
    detail: "Une toiture qui fuit se traite tout de suite. Ce geste d'urgence ne se déguise pas en rénovation d'ampleur, et un geste isolé d'ITI est exclu de MaPrimeRénov' 2026.",
  },
];

const DEVIS_POINTS: { title: string; fail: string }[] = [
  { title: "Qualification RGE valide à la date du devis", fail: "Un RGE expiré ou hors domaine à la date du devis est éliminatoire." },
  { title: "SIRET, date, client et adresse de chantier", fail: "Un devis sans identité d'entreprise ou de chantier ne s'instruit pas." },
  { title: "Résistance R certifiée ACERMI", fail: "Un isolant sans R justifié et sans certification ne porte pas la fiche." },
  { title: "Uw de la menuiserie complète", fail: "L'Ug du vitrage seul ne vaut pas le Uw. Le bouquet vise Uw ≤ 1,3." },
  { title: "ETAS de la PAC", fail: "Une PAC sans ETAS conforme à la fiche et à la température de départ sort du dossier." },
  { title: "Désembouage DTU 65.16", fail: "Remplacer le générateur sur un réseau ancien sans désembouage ni filtre à boues est éliminatoire." },
  { title: "Quantités cohérentes avec le relevé", fail: "Une surface supérieure au métré AMO, ou une unité fantôme, fait rejeter la ligne." },
  { title: "HT, TVA et TTC lisibles", fail: "TVA 5,5 % seulement si les conditions sont réunies. Un taux erroné fausse le reste à charge." },
  { title: "Accord Anah avant démarrage", fail: "Démarrer avant l'accord écrit fait perdre MaPrimeRénov' sur le parcours." },
  { title: "Isolation avant chauffage", fail: "PAC ou chaudière dimensionnée avant isolation, ou ITI en geste isolé : dossier fragile ou exclu." },
];

type Choice = { label: string; correct: boolean; why: string };

const QUIZ: { prompt: string; choices: Choice[] }[] = [
  {
    prompt: "Que peut faire un MAR agréé sur le chantier qu'il accompagne ?",
    choices: [
      { label: "Réaliser une partie des travaux s'il est aussi artisan", correct: false, why: "L'agrément impose une indépendance stricte. Le MAR ne réalise pas les travaux du dossier." },
      { label: "Tenir l'audit et le plan de financement, sans commission sur les travaux", correct: true, why: "Il est le tiers de confiance. Vendre le chantier ou toucher une commission rompt l'agrément." },
      { label: "Choisir l'artisan et prélever 5 % du marché", correct: false, why: "La sélection intéressée est interdite. Le contractant général coordonne les RGE, le MAR ne se rémunère pas sur le lot." },
      { label: "Signer le marché à la place du propriétaire", correct: false, why: "Le maître d'ouvrage signe. Le MAR assiste, il n'est pas le client." },
    ],
  },
  {
    prompt: "Quels plafonds de travaux HT retient le mode d'emploi Anah de mars 2026 pour le parcours accompagné ?",
    choices: [
      { label: "40 000, 55 000 et 70 000 € selon 2, 3 et 4 classes", correct: false, why: "Cette grille circule encore. Elle n'est plus celle du guide de mars 2026." },
      { label: "30 000 € pour 2 classes, 40 000 € pour 3 classes ou plus", correct: true, why: "C'est le plafond écrit pour les quatre couleurs dans le mode d'emploi de mars 2026." },
      { label: "70 000 € HT quel que soit le gain", correct: false, why: "Le plafond dépend du nombre d'étiquettes gagnées, et il s'arrête à 40 000 € HT en 2026." },
      { label: "15 000 €, comme un mono-geste", correct: false, why: "Le parcours accompagné n'est pas le forfait par geste." },
    ],
  },
  {
    prompt: "Quel taux de travaux s'applique au profil Rose en parcours accompagné 2026 ?",
    choices: [
      { label: "30 %", correct: false, why: "30 % est un taux ancien encore cité en formation. Le guide 2026 retient 10 %." },
      { label: "45 %", correct: false, why: "45 % est le taux Violet, pas Rose." },
      { label: "10 %", correct: true, why: "Rose : 10 % dans le plafond de 30 000 ou 40 000 € HT, écrêtement à 50 % TTC." },
      { label: "0 %, le Rose est exclu du parcours", correct: false, why: "Le Rose reste éligible, à un taux bas. Il n'est pas sorti du parcours accompagné." },
    ],
  },
  {
    prompt: "Comment est financée la prestation MAR ?",
    choices: [
      { label: "100 % pour toutes les couleurs, sans plafond", correct: false, why: "Le plafond est de 2 000 € TTC, et le taux baisse avec la couleur." },
      { label: "Plafond 2 000 € TTC : 100 % Bleu, 80 % Jaune, 40 % Violet, 20 % Rose", correct: true, why: "C'est la prise en charge écrite dans le mode d'emploi de mars 2026. Le surplus de facture reste au ménage." },
      { label: "Forfait unique de 4 000 € versé à l'artisan", correct: false, why: "Le plafond du guide est 2 000 € TTC, versé dans le parcours, pas à l'artisan des travaux." },
      { label: "Uniquement si le gain atteint 4 classes", correct: false, why: "L'accompagnement est dû dès la rénovation d'ampleur, dès 2 classes." },
    ],
  },
  {
    prompt: "Un ménage Bleu demande une avance de 70 % dès la signature du devis. Que répond le MAR ?",
    choices: [
      { label: "C'est automatique sur le parcours accompagné", correct: false, why: "Le guide de mars 2026 dit « avance sous conditions » sur le parcours. Il ne grave pas 70 %." },
      { label: "L'avance n'est pas un droit à 70 %. Le dossier se dépose après le rendez-vous France Rénov', et les travaux attendent l'accord", correct: true, why: "L'avance jusqu'à 50 % est décrite pour le parcours par geste. Sur le parcours, elle reste conditionnée. Signer avant l'accord fait perdre l'aide." },
      { label: "70 % du TTC des travaux, versés à l'artisan le jour du devis", correct: false, why: "Confondre avance d'aide et acompte travaux. L'Anah n'est pas le banquier du chantier." },
      { label: "Refuser toute avance, le dispositif a disparu", correct: false, why: "L'avance existe encore, sous conditions. Elle n'a pas le taux de 70 % demandé ici." },
    ],
  },
  {
    prompt: "Quel programme passe le filtre d'une rénovation d'ampleur ?",
    choices: [
      { label: "Une PAC seule, sans isolation", correct: false, why: "Il faut au moins deux gestes d'isolation et deux étiquettes gagnées." },
      { label: "Deux gestes d'isolation, +2 étiquettes, sans chaudière gaz ni maintien du fioul", correct: true, why: "C'est le programme minimal du mode d'emploi. Une passoire doit en sortir." },
      { label: "ITI en geste isolé sur un pisé cimenté", correct: false, why: "L'ITI isolée est exclue de MaPrimeRénov' 2026, et le ciment est incompatible avec le pisé." },
      { label: "Changement de chaudière fioul à fioul avec un peu de laine", correct: false, why: "Le maintien du fioul est exclu du parcours." },
    ],
  },
  {
    prompt: "Un devis PAC est daté d'un RGE échu le mois précédent. Le reste du chiffrage est propre. Décision ?",
    choices: [
      { label: "On dépose, l'Anah régularisera", correct: false, why: "La qualification se juge à la date du devis et pendant les travaux. Ce n'est pas une pièce à compléter après coup." },
      { label: "Éliminatoire : refaire le devis avec une qualification en cours de validité", correct: true, why: "C'est le premier point de la grille de conformité. Un RGE mort tue la ligne." },
      { label: "Acceptable si l'artisan promet de se requalifier", correct: false, why: "Une promesse ne remplace pas l'attestation en vigueur." },
      { label: "Valable uniquement pour le profil Rose", correct: false, why: "La règle RGE ne dépend pas de la couleur du ménage." },
    ],
  },
  {
    prompt: "Sur un mur en pisé humide, quelle préconisation tient ?",
    choices: [
      { label: "Enduit ciment et isolant étanche pour bloquer l'eau", correct: false, why: "Le ciment et l'isolant étanche enferment l'humidité et dégradent la terre." },
      { label: "Traiter les remontées, rester perspirant, enduit à la chaux sans ciment, ventiler après étanchéité", correct: true, why: "C'est la séquence AMO : pathologie d'abord, matériau compatible ensuite, air ensuite." },
      { label: "ITE polystyrène collé directement, le R suffit", correct: false, why: "Le R ne traite pas une pathologie. Coller un complexe étanche sur terre humide est une malfaçon." },
      { label: "Aucun diagnostic : le DPE remplace la visite", correct: false, why: "Le DPE donne une étiquette. Il ne voit pas le salpêtre ni la charpente." },
    ],
  },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    const current = copy[index];
    copy[index] = copy[swap];
    copy[swap] = current;
  }
  return copy;
}

export default function MarAmoModule() {
  const [panel, setPanel] = useState<Panel>("matrice");
  const [actor, setActor] = useState<ActorId>("mar");
  const [jalon, setJalon] = useState(1);
  const [pathology, setPathology] = useState<Record<string, boolean>>({});
  const [devis, setDevis] = useState<Record<number, boolean>>({});
  const [quizIndex, setQuizIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [doneQuiz, setDoneQuiz] = useState(false);
  const quiz = useMemo(() => QUIZ.map((item) => ({ ...item, choices: shuffle(item.choices) })), []);

  const active = ACTORS.find((item) => item.id === actor) ?? ACTORS[1];
  const pathologyDone = PATHOLOGIES.filter((item) => pathology[item.title]).length;
  const missing = DEVIS_POINTS.filter((_, index) => !devis[index]);
  const current = quiz[quizIndex];
  const selectedChoice = picked === null ? null : current?.choices[picked];

  function answer(index: number) {
    if (picked !== null || !current) return;
    setPicked(index);
    if (current.choices[index]?.correct) setScore((value) => value + 1);
  }

  function nextQuestion() {
    if (quizIndex + 1 >= quiz.length) {
      setDoneQuiz(true);
      return;
    }
    setQuizIndex((value) => value + 1);
    setPicked(null);
  }

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs font-semibold tracking-[0.22em] text-[#e8c872]">MAR & AMO · PARCOURS ACCOMPAGNÉ</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Qui fait quoi dans la rénovation globale</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
          Quatre acteurs, cinq jalons, la grille des devis et les pièges d&apos;instruction. Simulateur de formation :
          les aides 2026 sont indicatives, le dossier instruit par l&apos;Anah fait foi. Source des taux : mode d&apos;emploi
          MaPrimeRénov&apos;, mars 2026.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["matrice", "Matrice des acteurs"],
            ["jalons", "5 jalons du MAR"],
            ["outils", "Boîte à outils AMO"],
            ["qcm", "QCM MAR & AMO"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setPanel(id)}
            className={`rounded-full px-3 py-1.5 text-sm ${panel === id ? "bg-[#e8c872] text-[#1a1203]" : "bg-white/5 text-slate-200"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {panel === "matrice" ? (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {ACTORS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActor(item.id)}
                className={`rounded-3xl border p-4 text-left ${actor === item.id ? "border-[#e8c872] bg-[#e8c872]/10" : "border-white/10 bg-white/[0.03]"}`}
              >
                <span className="rounded-full border border-[#e8c872]/40 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#e8c872]">
                  {item.badge}
                </span>
                <span className="mt-3 block text-base font-semibold text-white">{item.title}</span>
                <span className="mt-1 block text-sm text-slate-400">{item.short}</span>
              </button>
            ))}
          </div>

          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs tracking-[0.16em] text-[#e8c872]">{active.badge}</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{active.title}</h3>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              {(
                [
                  ["Rôle", active.role],
                  ["Aides", active.aides],
                  ["Travaux", active.travaux],
                  ["Responsabilité", active.responsabilite],
                ] as const
              ).map(([label, text]) => (
                <div key={label} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <dt className="text-xs text-slate-500">{label}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-slate-200">{text}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-3 text-sm leading-relaxed text-red-100">
              Interdit : {active.interdit}
            </p>
          </article>

          <div className="overflow-x-auto rounded-3xl border border-white/10">
            <table className="min-w-[720px] w-full text-left text-sm">
              <thead className="bg-[#1a3c5e] text-white">
                <tr>
                  <th className="px-3 py-3 font-medium">Acteur</th>
                  <th className="px-3 py-3 font-medium">Décide</th>
                  <th className="px-3 py-3 font-medium">Tient les aides</th>
                  <th className="px-3 py-3 font-medium">Touche aux travaux</th>
                </tr>
              </thead>
              <tbody>
                {ACTORS.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => setActor(item.id)}
                    className={`cursor-pointer border-t border-white/10 ${actor === item.id ? "bg-[#e8c872]/10" : "bg-white/[0.02]"}`}
                  >
                    <td className="px-3 py-3 font-medium text-white">{item.title}</td>
                    <td className="px-3 py-3 text-slate-300">{item.id === "moa" ? "Oui, scénario et signature" : "Non"}</td>
                    <td className="px-3 py-3 text-slate-300">{item.id === "mar" || item.id === "moa" ? "Oui" : "Prépare ou exécute"}</td>
                    <td className="px-3 py-3 text-slate-300">{item.id === "cg" ? "Oui, forfait et pilotage" : item.id === "amo" ? "Phasage, pas d'exécution" : "Non"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {panel === "jalons" ? (
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <ol className="space-y-2">
            {JALONS.map((item) => (
              <li key={item.n}>
                <button
                  type="button"
                  onClick={() => setJalon(item.n)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left ${jalon === item.n ? "border-[#e8c872] bg-[#e8c872]/10" : "border-white/10 bg-white/[0.03]"}`}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1a3c5e] text-sm font-semibold text-white">
                    {item.n}
                  </span>
                  <span className="text-sm font-medium text-white">{item.title}</span>
                </button>
              </li>
            ))}
          </ol>
          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs tracking-[0.16em] text-[#e8c872]">JALON {jalon} / 5</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">{JALONS[jalon - 1]?.title}</h3>
            <ul className="mt-4 space-y-3">
              {JALONS[jalon - 1]?.points.map((point) => (
                <li key={point} className="rounded-2xl border border-white/10 bg-black/20 p-3 text-sm leading-relaxed text-slate-200">
                  {point}
                </li>
              ))}
            </ul>
            {jalon === 3 ? (
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-[640px] w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#1a3c5e] text-white">
                      <th className="px-3 py-2 font-medium">Profil</th>
                      <th className="px-3 py-2 font-medium">Taux travaux</th>
                      <th className="px-3 py-2 font-medium">MAR / 2 000 € TTC</th>
                      <th className="px-3 py-2 font-medium">Écrêtement</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PROFILES.map((row) => (
                      <tr key={row.color} className="border-t border-white/10">
                        <td className="px-3 py-2">
                          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${row.tone}`}>{row.color}</span>
                        </td>
                        <td className="px-3 py-2 text-slate-200">{row.taux}</td>
                        <td className="px-3 py-2 text-slate-200">{row.mar}</td>
                        <td className="px-3 py-2 text-slate-200">{row.ecretement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="mt-3 text-xs leading-relaxed text-slate-500">
                  Plafond travaux : 30 000 € HT (2 classes) ou 40 000 € HT (3 classes ou plus). Les grilles 40 / 55 / 70 k€
                  et le Rose à 30 % sont un barème antérieur : elles servent de piège dans le QCM, pas de base de dépôt.
                </p>
              </div>
            ) : null}
          </article>
        </div>
      ) : null}

      {panel === "outils" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Pathologies du bâti ancien</h3>
              <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">
                {pathologyDone}/{PATHOLOGIES.length}
              </span>
            </div>
            <ul className="mt-4 space-y-3">
              {PATHOLOGIES.map((item) => (
                <li key={item.title}>
                  <label className="flex cursor-pointer gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={Boolean(pathology[item.title])}
                      onChange={() => setPathology((current) => ({ ...current, [item.title]: !current[item.title] }))}
                    />
                    <span>
                      <span className="block text-sm font-semibold text-white">{item.title}</span>
                      <span className="mt-1 block text-sm leading-relaxed text-slate-400">{item.detail}</span>
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-lg font-semibold text-white">Conformité des devis · 10 points</h3>
            <p className="mt-1 text-sm text-slate-400">Cochez ce qui figure vraiment sur le devis. Un seul manque élimine la pièce.</p>
            <ul className="mt-4 space-y-2">
              {DEVIS_POINTS.map((item, index) => (
                <li key={item.title}>
                  <label className="flex cursor-pointer gap-3 rounded-2xl border border-white/10 bg-black/20 px-3 py-2">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={Boolean(devis[index])}
                      onChange={() => setDevis((current) => ({ ...current, [index]: !current[index] }))}
                    />
                    <span className="text-sm text-slate-200">{item.title}</span>
                  </label>
                </li>
              ))}
            </ul>
            <div className={`mt-4 rounded-2xl border p-3 text-sm leading-relaxed ${missing.length === 0 ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-100" : "border-red-400/40 bg-red-500/10 text-red-100"}`}>
              {missing.length === 0
                ? "Devis recevable sur cette grille. Il reste à croiser les métrés AMO et l'audit MAR."
                : missing[0]?.fail}
            </div>
          </section>
        </div>
      ) : null}

      {panel === "qcm" ? (
        <section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          {doneQuiz ? (
            <>
              <p className="text-xs tracking-[0.16em] text-[#e8c872]">RÉSULTAT</p>
              <h3 className="mt-2 text-3xl font-semibold text-white">
                {score}/{quiz.length}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {score >= 6
                  ? "Lecture solide du parcours. Revenez sur les jalons si un taux ou un plafond a coincé."
                  : "Reprendre le jalon 3 et la matrice : les pièges portent sur les vieux plafonds, le Rose et l'indépendance du MAR."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuizIndex(0);
                  setPicked(null);
                  setScore(0);
                  setDoneQuiz(false);
                }}
                className="mt-5 rounded-full bg-gradient-to-r from-[#f5e6b8] to-[#c8962e] px-5 py-2.5 text-sm font-semibold text-[#1a1203]"
              >
                Rejouer la série
              </button>
            </>
          ) : (
            <>
              <p className="text-xs text-slate-500">
                Question {quizIndex + 1} / {quiz.length} · {score} bonne{score > 1 ? "s" : ""}
              </p>
              <h3 className="mt-3 text-xl font-semibold leading-snug text-white">{current?.prompt}</h3>
              <ul className="mt-4 space-y-2">
                {current?.choices.map((choice, index) => {
                  const show = picked !== null;
                  const tone = !show
                    ? "border-white/10 bg-black/20"
                    : choice.correct
                      ? "border-emerald-400/50 bg-emerald-500/10"
                      : index === picked
                        ? "border-red-400/50 bg-red-500/10"
                        : "border-white/10 opacity-60";
                  return (
                    <li key={choice.label}>
                      <button
                        type="button"
                        disabled={picked !== null}
                        onClick={() => answer(index)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm text-slate-100 ${tone}`}
                      >
                        {choice.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {selectedChoice ? (
                <div className="mt-4">
                  <p className="text-sm leading-relaxed text-slate-200">{selectedChoice.why}</p>
                  <button
                    type="button"
                    onClick={nextQuestion}
                    className="mt-4 rounded-full bg-[#e8c872] px-4 py-2 text-sm font-semibold text-[#1a1203]"
                  >
                    {quizIndex + 1 === quiz.length ? "Voir le score" : "Question suivante"}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </section>
      ) : null}
    </section>
  );
}
