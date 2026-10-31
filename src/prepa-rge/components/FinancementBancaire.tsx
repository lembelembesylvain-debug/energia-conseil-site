import { useMemo, useState } from "react";
import { downloadPremiumPdf } from "../pdf/premiumDocument";

type Panel = "guide" | "droit" | "simu" | "qcm";

const DOSSIER = [
  { title: "Kbis de moins de 3 mois", detail: "Pièce demandée par le partenaire. Elle prouve l'existence de la société. Elle ne remplace pas l'ORIAS." },
  { title: "RC Pro avec extension financière", detail: "Assurance responsabilité civile professionnelle couvrant l'intermédiation en opérations de banque. La décennale chantier ne suffit pas." },
  { title: "Attestation de formation réglementaire", detail: "Capacité professionnelle de la catégorie demandée : diplôme, expérience reconnue, ou formation habilitée. Le volume d'heures dépend de la catégorie." },
  { title: "Deux derniers bilans", detail: "Ou un prévisionnel si la société est récente. Le partenaire regarde la solidité, pas seulement le volume de devis." },
];

const CATEGORIES = [
  { n: "1", title: "Courtier", text: "Il choisit plusieurs établissements et conseille en son nom. C'est la catégorie la plus large." },
  { n: "2", title: "Mandataire exclusif", text: "Il ne présente que les crédits d'un seul établissement, ou d'un seul groupe." },
  { n: "3", title: "Mandataire non exclusif", text: "Souvent appelé « niveau III » dans les réseaux. Il peut travailler avec plusieurs banques, sous leur mandat." },
  { n: "4", title: "Mandataire d'intermédiaire", text: "Il n'est pas mandaté par la banque. Il agit pour un IOBSP déjà immatriculé. C'est le schéma habituel du vendeur sous l'enseigne de la société." },
];

const RULES = [
  {
    n: "1",
    title: "Bordereau de rétractation détachable — 14 jours",
    text: "L'offre de crédit à la consommation emporte un délai de quatorze jours calendaires (Code de la consommation, article L.312-19). Le formulaire est détachable et remis avec l'offre. Une signature électronique ne raccourcit pas ce délai. Au domicile du client, le contrat hors établissement ajoute le délai de l'article L.221-18, lui aussi de 14 jours.",
  },
  {
    n: "2",
    title: "FIPEN et TAEG fixe",
    text: "La fiche d'information précontractuelle européenne normalisée (FIPEN, ou SECCI) se remet avant la signature, avec un exemple chiffré. Le TAEG est le taux annuel effectif global : intérêts, frais obligatoires et assurance exigée pour obtenir le crédit. Annoncer un taux nominal plus bas que le TAEG de l'offre est une pratique interdite.",
  },
  {
    n: "3",
    title: "Mise en garde et solvabilité",
    text: "Le prêteur apprécie la solvabilité sur les revenus, les charges et le fichier FICP. Le repère de 35 % d'endettement est celui des partenaires (norme HCSF du crédit immobilier, reprise en pratique sur les dossiers travaux). Ce n'est pas un article pénal qui se suffit à lui-même : un dossier tendu se refuse, il ne se « fait passer ».",
  },
  {
    n: "4",
    title: "Caducité si la banque refuse",
    text: "Dans un crédit affecté, le refus de prêt résout de plein droit le contrat de vente ou de travaux, sans indemnité pour le professionnel. La rétractation du crédit par le client emporte la même chute du contrat lié. Aucun acompte avant que le crédit soit définitivement formé. Le délai est de 14 jours. Une demande expresse d'exécution immédiate peut le ramener à 3 jours : elle s'écrit, elle ne se devine pas, et elle n'autorise pas un démarrage le soir de la signature.",
  },
];

type Choice = { label: string; correct: boolean; why: string };

const QUIZ: { prompt: string; choices: Choice[] }[] = [
  {
    prompt: "Que faut-il avant de présenter un crédit travaux dans le salon du client ?",
    choices: [
      { label: "Un Kbis récent suffit, l'ORIAS se demande après la première vente", correct: false, why: "Sans immatriculation ORIAS, l'intermédiation est illicite. Le Kbis est une pièce du dossier partenaire, pas l'autorisation d'exercer." },
      { label: "L'immatriculation ORIAS de l'intermédiaire, et un vendeur habilité sous ce mandat", correct: true, why: "On ne propose pas une opération de banque hors registre. Le vendeur agit dans la catégorie déclarée." },
      { label: "La décennale du chantier couvre aussi le crédit", correct: false, why: "La décennale assure les ouvrages. L'intermédiation exige une RC Pro adaptée." },
      { label: "L'accord oral de Franfinance ou de Domofinance", correct: false, why: "Un contact commercial ne remplace ni l'ORIAS ni l'agrément écrit du partenaire." },
    ],
  },
  {
    prompt: "Quelle est la catégorie du mandataire d'intermédiaire ?",
    choices: [
      { label: "Catégorie 3, dite niveau III", correct: false, why: "La catégorie 3 est le mandataire non exclusif. Le « niveau III » des réseaux désigne celle-là, pas le mandataire d'intermédiaire." },
      { label: "Catégorie 4 : il travaille pour un IOBSP déjà immatriculé, pas directement pour la banque", correct: true, why: "C'est le schéma du commercial sous l'enseigne : la société porte l'ORIAS, le vendeur agit pour elle." },
      { label: "Catégorie 1, comme un courtier", correct: false, why: "Le courtier conseille et met en relation en son nom. Ce n'est pas un mandataire d'intermédiaire." },
      { label: "Aucune catégorie : ce statut est libre", correct: false, why: "Les quatre catégories sont dans le Code monétaire et financier. Aucune n'est libre d'immatriculation." },
    ],
  },
  {
    prompt: "À quoi correspond vraiment le « niveau III » souvent cité en formation commerciale ?",
    choices: [
      { label: "Au mandataire non exclusif, qui peut présenter plusieurs établissements", correct: true, why: "Catégorie 3. Il est mandaté par les banques, et peut en avoir plusieurs. Ce n'est pas le mandataire d'intermédiaire." },
      { label: "Au MAR agréé Anah", correct: false, why: "Le MAR accompagne le parcours d'aides. Il n'est pas un statut IOBSP." },
      { label: "Au courtier exclusif d'une seule caisse", correct: false, why: "L'exclusivité d'un seul établissement est la catégorie 2, mandataire exclusif." },
      { label: "À l'inscription FICP du client", correct: false, why: "Le FICP est le fichier des incidents de crédit. Il ne désigne pas une catégorie d'intermédiaire." },
    ],
  },
  {
    prompt: "Quel est le délai de rétractation d'un crédit à la consommation, et sous quelle forme ?",
    choices: [
      { label: "7 jours depuis la loi Lagarde, par simple SMS", correct: false, why: "La loi Lagarde a porté le délai à 14 jours. Le formulaire est détachable et joint à l'offre." },
      { label: "14 jours calendaires, avec un bordereau détachable joint à l'offre", correct: true, why: "Article L.312-19 du Code de la consommation. La signature au salon ou en ligne ne supprime pas le bordereau." },
      { label: "14 jours ouvrés, uniquement si le montant dépasse 70 000 €", correct: false, why: "Le délai est en jours calendaires, et il ne dépend pas de ce seuil." },
      { label: "48 heures si le client a lui-même demandé le rendez-vous", correct: false, why: "L'initiative du rendez-vous ne raccourcit pas la protection." },
    ],
  },
  {
    prompt: "Quand remet-on la FIPEN, et que doit montrer le TAEG ?",
    choices: [
      { label: "Après le déblocage des fonds, le TAEG étant le seul taux nominal", correct: false, why: "La fiche est précontractuelle. Le TAEG agrège les frais obligatoires et l'assurance exigée, pas le seul nominal." },
      { label: "Avant la signature, avec un exemple chiffré. Le TAEG annoncé est celui de l'offre", correct: true, why: "Afficher au salon un taux plus flatteur que le TAEG de la FIPEN est une pratique que la DGCCRF sanctionne." },
      { label: "Uniquement au notaire, le jour de la réception", correct: false, why: "Le crédit affecté travaux n'attend pas le notaire. L'information précède l'engagement." },
      { label: "La FIPEN est facultative si le report est de 180 jours", correct: false, why: "Le report est une option de barème. Il ne dispense d'aucune information." },
    ],
  },
  {
    prompt: "Comment se vérifie la solvabilité ?",
    choices: [
      { label: "Le vendeur interroge lui-même le FICP et passe outre s'il « sent » le dossier", correct: false, why: "La consultation du FICP est celle du prêteur. Pousser un crédit inadapté viole le devoir de mise en garde." },
      { label: "Le prêteur examine revenus, charges et FICP. Le seuil de 35 % est le repère pratique des partenaires, pas un article automatique", correct: true, why: "La norme HCSF vise d'abord le crédit immobilier. Les banques de travaux s'en inspirent, puis jugent le reste à vivre." },
      { label: "35 % est un plafond pénal : à 36 %, la DGCCRF annule d'office", correct: false, why: "Le contrôle porte sur l'information, la rétractation et le caractère adapté du crédit. Le 35 % n'est pas ce mécanisme-là." },
      { label: "Aucun justificatif si le bien est déjà payé", correct: false, why: "Le patrimoine ne dispense pas des revenus et des charges pour un crédit à la consommation." },
    ],
  },
  {
    prompt: "La banque refuse le crédit affecté. Que devient le devis de travaux signé en même temps ?",
    choices: [
      { label: "Il reste dû, avec 500 € de frais de dossier", correct: false, why: "Le refus de prêt résout le contrat lié. Le professionnel ne facture pas une indemnité de dédit." },
      { label: "Il tombe de plein droit, sans frais pour le client", correct: true, why: "C'est la protection du crédit affecté, issue de la loi Scrivener et maintenue dans le Code de la consommation." },
      { label: "Le chantier démarre, le client paiera sur ses fonds", correct: false, why: "On ne transforme pas un refus de crédit en obligation de payer comptant." },
      { label: "Seul le prêt tombe. L'acompte de 30 % reste acquis", correct: false, why: "Aucun paiement ne doit être encaissé avant que le crédit soit définitivement formé." },
    ],
  },
  {
    prompt: "Le client se rétracte du seul crédit, dans le délai. Le marché de travaux, lui, est déjà signé.",
    choices: [
      { label: "Le marché de travaux survit, puisque la rétractation ne visait que la banque", correct: false, why: "La rétractation du crédit affecté emporte la caducité du contrat de travaux qui en dépend." },
      { label: "Le contrat de travaux lié devient caduc", correct: true, why: "Les deux engagements sont attachés. L'un ne survit pas à la chute de l'autre." },
      { label: "Le professionnel conserve l'acompte versé le jour de la signature", correct: false, why: "L'acompte n'aurait pas dû être encaissé. Il se restitue." },
      { label: "La rétractation ne vaut que si l'Anah a aussi refusé", correct: false, why: "Le délai de rétractation du crédit ne dépend pas de l'instruction des aides." },
    ],
  },
  {
    prompt: "Peut-on démarrer le chantier le soir de la signature, dans le salon, « en 1 clic » ?",
    choices: [
      { label: "Oui, si le report d'échéance est de 180 jours", correct: false, why: "Le report décale les mensualités. Il n'autorise ni l'acompte ni le début des travaux." },
      { label: "Non. On attend la fin du délai de rétractation et la formation définitive du crédit", correct: true, why: "Le 1 clic rassemble la commande et la demande de financement. Il ne brûle pas les 14 jours." },
      { label: "Oui, dès que le dossier Anah est déposé", correct: false, why: "L'Anah et le crédit obéissent à deux calendriers. Aucun des deux ne s'ouvre par le dépôt seul." },
      { label: "Oui, sous 1 000 € d'acompte symbolique", correct: false, why: "Sur un crédit affecté, le professionnel n'encaisse rien avant la conclusion définitive." },
    ],
  },
  {
    prompt: "La signature a lieu au domicile. Quel délai supplémentaire de protection du contrat hors établissement faut-il connaître ?",
    choices: [
      { label: "Aucun, le client ayant ouvert sa porte", correct: false, why: "Le hors établissement protège justement la signature au domicile." },
      { label: "14 jours, article L.221-18 du Code de la consommation", correct: true, why: "Ce délai coexiste avec celui du crédit. Le commercial explique les deux, il n'en choisit pas un." },
      { label: "7 jours, ancienne loi Scrivener, encore en vigueur au domicile", correct: false, why: "Le délai Scrivener d'origine a été porté à 14 jours. Le hors établissement est aussi de 14 jours." },
      { label: "48 heures si un bon de commande papier est signé", correct: false, why: "Le support papier ou électronique ne change pas la durée." },
    ],
  },
  {
    prompt: "Que signifie un report d'échéance de 180 jours chez un partenaire travaux ?",
    choices: [
      { label: "Une obligation légale dès qu'une aide Anah est estimée", correct: false, why: "C'est une option de barème, négociée avec la banque. Toutes les offres ne la portent pas." },
      { label: "Le client ne paie pas d'échéance pendant le différé. Les intérêts de ces mois dépendent du barème, et le prêt ne s'éteint pas au virement Anah", correct: true, why: "L'aide réduit le besoin à financer. Elle ne rembourse pas le crédit à la place du client." },
      { label: "Six mois toujours sans aucun intérêt, par la loi Lagarde", correct: false, why: "La loi ne pose pas un différé gratuit de 180 jours. Le partenaire décide de la franchise." },
      { label: "Le crédit est annulé si l'Anah verse les subventions", correct: false, why: "Le versement des aides ne résout pas le contrat de crédit." },
    ],
  },
  {
    prompt: "Quelle assurance accompagne la demande d'agrément bancaire ?",
    choices: [
      { label: "La seule assurance dommages-ouvrage du chantier témoin", correct: false, why: "La DO couvre l'ouvrage. Elle n'assure pas l'acte d'intermédiation." },
      { label: "Une RC Pro avec extension aux opérations de banque", correct: true, why: "C'est une condition d'exercice de l'IOBSP et une pièce type du dossier partenaire." },
      { label: "Aucune, sous 75 000 € de crédit", correct: false, why: "L'obligation d'assurance ne s'ouvre pas à partir d'un montant de devis." },
      { label: "L'assurance emprunteur du client", correct: false, why: "L'assurance emprunteur protège le prêt du ménage. Elle n'assure pas le mandataire." },
    ],
  },
  {
    prompt: "Comment se négocie un barème avec Franfinance, Domofinance, Cetelem ou Sofinco ?",
    choices: [
      { label: "On promet au client un TAEG inférieur à celui de l'offre, la commission compensera", correct: false, why: "Le TAEG du salon doit être celui de la FIPEN. La commission ne se cache pas dans un taux minoré." },
      { label: "Taux, durées, report et commission se discutent au partenariat. Le client voit le TAEG réel de son offre", correct: true, why: "Le volume et la qualité des dossiers pèsent. Ils ne donnent pas le droit d'afficher un autre prix que l'offre." },
      { label: "La commission se prélève sur l'aide Anah avant versement au client", correct: false, why: "L'aide n'est pas la rémunération de l'intermédiaire. La commission suit le contrat de partenariat." },
      { label: "Le barème est secret : le client signe sans exemple chiffré", correct: false, why: "L'exemple chiffré et le TAEG sont dus avant l'engagement." },
    ],
  },
  {
    prompt: "En quoi consiste le devoir de mise en garde ?",
    choices: [
      { label: "Faire signer vite, la banque triera ensuite", correct: false, why: "Transmettre un dossier manifestement inadapté engage l'intermédiaire, pas seulement la banque." },
      { label: "Expliquer durée, coût total et TAEG, et s'arrêter si les revenus ne portent pas l'échéance", correct: true, why: "La mise en garde est concrète. Elle se prouve par la FIPEN expliquée et par les pièces de revenus." },
      { label: "Un message automatique après la signature suffit", correct: false, why: "L'information est précontractuelle. Après la signature, le délai de rétractation court, mais l'explication aurait dû précéder." },
      { label: "Il ne concerne que le crédit immobilier devant notaire", correct: false, why: "Le crédit affecté travaux est un crédit à la consommation. La mise en garde s'y applique." },
    ],
  },
  {
    prompt: "L'Anah verse l'aide sur le compte du client. Que devient le crédit du reste à charge ?",
    choices: [
      { label: "Il s'éteint tout seul : la banque est payée par l'Anah", correct: false, why: "Le crédit finance le reste à charge. L'aide ne se substitue pas aux mensualités, sauf remboursement anticipé décidé et chiffré." },
      { label: "Le client reste débiteur des échéances. L'aide n'est pas un remboursement automatique du prêt", correct: true, why: "On peut prévoir un remboursement anticipé, avec les conditions du contrat. On ne le promet pas comme un automatisme." },
      { label: "Le commercial encaisse l'aide pour le compte de la banque", correct: false, why: "L'aide est versée au ménage selon le circuit Anah. L'intermédiaire n'en est pas le créancier." },
      { label: "Les mensualités s'arrêtent dès le dépôt du dossier, avant le versement", correct: false, why: "Le dépôt n'est pas le versement, et le versement n'efface pas le tableau d'amortissement." },
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

function mensualite(capital: number, taegPct: number, mois: number) {
  if (capital <= 0 || mois <= 0) return 0;
  const annuel = taegPct / 100;
  if (annuel <= 0) return capital / mois;
  const moisTaux = annuel / 12;
  const puissance = (1 + moisTaux) ** mois;
  return (capital * moisTaux * puissance) / (puissance - 1);
}

function euros(value: number) {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Math.round(value));
}

const CREDIT_NOTE = "Fiche pédagogique. Ce n'est pas une offre de crédit. Seul un intermédiaire immatriculé à l'ORIAS présente une offre, après FIPEN et étude de solvabilité. Les aides restent indicatives jusqu'à l'instruction.";

export default function FinancementBancaire() {
  const [panel, setPanel] = useState<Panel>("guide");
  const [openRule, setOpenRule] = useState("1");
  const [travaux, setTravaux] = useState(70000);
  const [aides, setAides] = useState(56000);
  const [mois, setMois] = useState(120);
  const [taeg, setTaeg] = useState(3.5);
  const [economies, setEconomies] = useState(280);
  const [report, setReport] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [doneQuiz, setDoneQuiz] = useState(false);
  const quiz = useMemo(() => QUIZ.map((item) => ({ ...item, choices: shuffle(item.choices) })), []);

  const aidesRetenues = Math.min(Math.max(aides, 0), Math.max(travaux, 0));
  const reste = Math.max(0, travaux - aidesRetenues);
  const capital = report && taeg > 0 ? reste * (1 + taeg / 100 / 12) ** 6 : reste;
  const echeance = mensualite(capital, taeg, mois);
  const ecart = economies - echeance;
  const current = quiz[quizIndex];
  const selected = picked === null ? null : current?.choices[picked];

  function answer(index: number) {
    if (picked !== null || !current) return;
    setPicked(index);
    if (current.choices[index]?.correct) setScore((value) => value + 1);
  }

  function loadExample() {
    setTravaux(70000);
    setAides(56000);
    setMois(120);
    setTaeg(3.5);
    setEconomies(280);
    setReport(true);
  }

  return (
    <section className="space-y-8">
      <header>
        <p className="text-xs font-semibold tracking-[0.22em] text-[#e8c872]">AGRÉMENTS BANCAIRES & FINANCEMENT BTP</p>
        <h2 className="mt-3 text-3xl font-semibold text-white">Le crédit affecté, sans perdre le chantier</h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
          ORIAS, lois Scrivener et Lagarde, simulateur de reste à charge. Module de formation : les taux affichés sont
          illustratifs. Une offre réelle passe par un intermédiaire immatriculé, une FIPEN et l&apos;étude du prêteur.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["guide", "Agréments partenaires"],
            ["droit", "4 règles d'or"],
            ["simu", "Simulateur reste à charge"],
            ["qcm", "QCM crédit travaux"],
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

      {panel === "guide" ? (
        <div className="space-y-4">
          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-xs tracking-[0.16em] text-[#e8c872]">ORIAS OBLIGATOIRE</p>
            <h3 className="mt-2 text-2xl font-semibold text-white">Mandataire d&apos;intermédiaire, et le piège du niveau III</h3>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Quatre catégories d&apos;intermédiaires en opérations de banque. Le vendeur au salon agit en général comme
              mandataire d&apos;intermédiaire : la société est à l&apos;ORIAS, lui présente le crédit sous son enseigne. Dans le
              langage des réseaux, « niveau III » désigne plutôt le mandataire non exclusif, catégorie 3. Confondre les
              deux fait rater le dossier d&apos;immatriculation.
            </p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {CATEGORIES.map((item) => (
                <li key={item.n} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="text-xs font-semibold text-[#e8c872]">Catégorie {item.n}</p>
                  <p className="mt-1 text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{item.text}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Dossier type demandé par les partenaires</h3>
              <button
                type="button"
                onClick={() =>
                  downloadPremiumPdf({
                    fileName: "dossier-agrement-partenaire.pdf",
                    title: "Dossier d'agrément partenaire — pièces types",
                    indicators: [
                      { label: "Public visé", value: "Entreprise candidate au partenariat" },
                      { label: "Durée officielle", value: "Fiche de séance" },
                      { label: "Tarif HT & TTC", value: "Sans offre de crédit" },
                      { label: "Modalité", value: "Formation 2026" },
                    ],
                    modules: DOSSIER.map((item) => ({ title: item.title, points: [item.detail] })),
                    footnote: CREDIT_NOTE,
                  })
                }
                className="rounded-full border border-[#e8c872]/40 px-3 py-1.5 text-xs text-[#e8c872]"
              >
                Imprimer la fiche
              </button>
            </div>
            <ul className="mt-4 grid gap-3 md:grid-cols-2">
              {DOSSIER.map((item) => (
                <li key={item.title} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{item.detail}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-lg font-semibold text-white">Partenaires de la rénovation</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Franfinance, Domofinance, Cetelem et Sofinco sont des prêteurs habituels du crédit affecté travaux. Le
              barème se négocie : taux, durées de 24 à 180 mois, report d&apos;échéance, commission, volume et qualité des
              dossiers. Aucun de ces noms n&apos;autorise à afficher un TAEG qui n&apos;est pas celui de l&apos;offre.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {["Franfinance", "Domofinance", "Cetelem", "Sofinco"].map((name) => (
                <p key={name} className="rounded-2xl border border-[#e8c872]/30 bg-[#e8c872]/10 px-3 py-4 text-center text-sm font-semibold text-[#f5e6b8]">
                  {name}
                </p>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-[#e8c872]/30 bg-[#120e08] p-5">
            <h3 className="text-lg font-semibold text-white">Signer dans le salon, sans brûler les délais</h3>
            <ol className="mt-3 space-y-2 text-sm leading-relaxed text-slate-200">
              <li>1. Expliquer la FIPEN et le TAEG, à voix haute, avant toute signature.</li>
              <li>2. Recueillir les justificatifs de revenus et de charges. Un dossier incomplet ne part pas.</li>
              <li>3. Faire signer électroniquement le bon de commande et la demande de crédit, et remettre le bordereau détachable.</li>
              <li>4. Ne rien encaisser avant la formation définitive du crédit. Le chantier attend la fin des 14 jours, ou des 3 jours si le client a demandé par écrit une exécution immédiate.</li>
            </ol>
          </article>
        </div>
      ) : null}

      {panel === "droit" ? (
        <div className="space-y-3">
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() =>
                downloadPremiumPdf({
                  fileName: "quatre-regles-credit-affecte.pdf",
                  title: "Quatre règles du crédit affecté travaux",
                  indicators: [
                    { label: "Public visé", value: "Commerciaux et mandataires en formation" },
                    { label: "Durée officielle", value: "Fiche de séance" },
                    { label: "Tarif HT & TTC", value: "Sans offre de crédit" },
                    { label: "Modalité", value: "Code de la consommation" },
                  ],
                  modules: RULES.map((rule) => ({ title: `${rule.n}. ${rule.title}`, points: [rule.text] })),
                  footnote: CREDIT_NOTE,
                })
              }
              className="rounded-full border border-[#e8c872]/40 px-3 py-1.5 text-xs text-[#e8c872]"
            >
              Imprimer les 4 règles
            </button>
          </div>
          {RULES.map((rule) => {
            const open = openRule === rule.n;
            return (
              <article key={rule.n} className="rounded-3xl border border-white/10 bg-white/[0.03]">
                <button type="button" onClick={() => setOpenRule(open ? "" : rule.n)} className="flex w-full items-center gap-3 px-4 py-4 text-left">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1a3c5e] text-sm font-semibold text-white">{rule.n}</span>
                  <span className="text-base font-semibold text-white">{rule.title}</span>
                </button>
                {open ? <p className="px-4 pb-4 text-sm leading-relaxed text-slate-300">{rule.text}</p> : null}
              </article>
            );
          })}
          <p className="text-xs leading-relaxed text-slate-500">
            Lois Scrivener (1978) puis Lagarde (2010), aujourd&apos;hui dans le Code de la consommation. La DGCCRF contrôle
            l&apos;information, le bordereau, les paiements anticipés et les pratiques trompeuses. Un chantier commencé trop
            tôt s&apos;annule avec le crédit, et peut en plus être sanctionné.
          </p>
        </div>
      ) : null}

      {panel === "simu" ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">Reste à charge à financer</h3>
              <button type="button" onClick={loadExample} className="rounded-full bg-[#e8c872] px-3 py-1.5 text-xs font-semibold text-[#1a1203]">
                Exemple 70 000 €
              </button>
            </div>
            <label className="block text-sm text-slate-300">
              Montant des travaux TTC
              <input type="number" min={0} value={travaux} onChange={(event) => setTravaux(Number(event.target.value) || 0)} className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-lg text-white" />
            </label>
            <label className="block text-sm text-slate-300">
              Subventions Anah et CEE (estimation)
              <input type="number" min={0} value={aides} onChange={(event) => setAides(Number(event.target.value) || 0)} className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-lg text-white" />
            </label>
            {aides > travaux ? <p className="text-sm text-amber-200">Les aides saisies dépassent les travaux. Le simulateur les plafonne au montant TTC. Le cumul réel ne peut pas excéder le coût des travaux.</p> : null}
            <label className="block text-sm text-slate-300">
              Durée : {mois} mois ({Math.round(mois / 12)} ans)
              <input type="range" min={24} max={180} step={6} value={mois} onChange={(event) => setMois(Number(event.target.value))} className="mt-2 w-full" />
            </label>
            <label className="block text-sm text-slate-300">
              TAEG illustratif : {taeg.toLocaleString("fr-FR")} %
              <input type="range" min={0} max={9.9} step={0.1} value={taeg} onChange={(event) => setTaeg(Number(event.target.value))} className="mt-2 w-full" />
            </label>
            <label className="block text-sm text-slate-300">
              Économies d&apos;énergie estimées par mois
              <input type="number" min={0} value={economies} onChange={(event) => setEconomies(Number(event.target.value) || 0)} className="mt-1 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-lg text-white" />
            </label>
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-slate-200">
              <input type="checkbox" className="mt-1" checked={report} onChange={() => setReport((value) => !value)} />
              <span>Report d&apos;échéance à 180 jours. Aucune mensualité pendant 6 mois. Si le TAEG n&apos;est pas nul, les intérêts du différé sont ajoutés au capital, comme dans une franchise partielle. Le barème du partenaire peut prévoir une franchise totale : il fait foi.</span>
            </label>
          </div>

          <aside className="rounded-3xl border border-[#e8c872]/40 bg-[#120e08] p-5">
            <p className="text-xs tracking-[0.16em] text-[#e8c872]">MENSUALITÉ ILLUSTRATIVE</p>
            <p className="mt-2 text-sm text-slate-400">Reste à charge</p>
            <p className="text-3xl font-semibold text-white">{euros(reste)}</p>
            {report ? <p className="mt-4 text-sm text-amber-200">6 premiers mois : 0 €</p> : null}
            <p className="mt-3 text-sm text-slate-400">{report ? "Puis" : "Échéance"}</p>
            <p className="text-4xl font-semibold text-[#f5e6b8]">{euros(echeance)}<span className="text-base font-medium text-slate-300"> / mois</span></p>
            <p className="mt-4 text-sm text-slate-300">Économies estimées : {euros(economies)} / mois</p>
            <p className={`mt-2 rounded-2xl px-3 py-2 text-sm font-semibold ${ecart >= 0 ? "bg-emerald-500/15 text-emerald-200" : "bg-red-500/15 text-red-100"}`}>
              Écart : {ecart >= 0 ? "+" : ""}{euros(ecart)} / mois {report ? "après le report" : "dès la première échéance"}
            </p>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              TAEG {taeg.toLocaleString("fr-FR")} % sur {mois} mois. Exemple pédagogique, pas une offre Franfinance, Domofinance, Cetelem ou Sofinco. Les économies ne sont pas un revenu garanti. L&apos;aide Anah ne rembourse pas le crédit toute seule.
            </p>
            <button
              type="button"
              onClick={() =>
                downloadPremiumPdf({
                  fileName: "simulation-reste-a-charge.pdf",
                  title: "Simulation pédagogique de reste à charge",
                  indicators: [
                    { label: "Public visé", value: "Exemple de formation" },
                    { label: "Durée officielle", value: `${mois} mois` },
                    { label: "Tarif HT & TTC", value: `RAC ${euros(reste)}` },
                    { label: "Modalité", value: `TAEG ${taeg} % illustratif` },
                  ],
                  lead: "Exemple chiffré pour s'entraîner à présenter un écart. Ce n'est pas une offre Franfinance, Domofinance, Cetelem ou Sofinco.",
                  modules: [
                    {
                      title: "Lecture du dossier",
                      points: [
                        `Travaux TTC : ${euros(travaux)}.`,
                        `Aides retenues dans l'exemple : ${euros(aidesRetenues)}.`,
                        `Reste à charge : ${euros(reste)}.`,
                        report
                          ? `Report 180 jours : 0 € pendant 6 mois, puis ${euros(echeance)} / mois. Les intérêts du différé sont intégrés au capital si le TAEG n'est pas nul.`
                          : `Mensualité : ${euros(echeance)} / mois.`,
                        `Économies estimées : ${euros(economies)} / mois. Écart : ${euros(ecart)} / mois ${report ? "après le report" : "dès la première échéance"}.`,
                      ],
                    },
                  ],
                  footnote: `${CREDIT_NOTE} Ne pas démarrer les travaux avant l'accord du prêteur et la fin du délai de rétractation.`,
                })
              }
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-[#f5e6b8] to-[#c8962e] px-4 py-3 text-sm font-semibold text-[#1a1203]"
            >
              Imprimer la fiche de synthèse
            </button>
          </aside>
        </div>
      ) : null}

      {panel === "qcm" ? (
        <section className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          {doneQuiz ? (
            <>
              <p className="text-xs tracking-[0.16em] text-[#e8c872]">RÉSULTAT</p>
              <h3 className="mt-2 text-3xl font-semibold text-white">{score}/15</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                {score >= 12
                  ? "Lecture solide. Le seuil pédagogique de l'académie est 12/15. Une offre réelle reste soumise à l'ORIAS et au prêteur."
                  : "Reprendre les quatre règles et la différence entre catégorie 3 et catégorie 4. Le délai, la FIPEN et la caducité font tomber les chantiers."}
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
              <p className="text-xs text-slate-500">Question {quizIndex + 1} / 15 · {score} bonne{score > 1 ? "s" : ""}</p>
              <h3 className="mt-3 text-xl font-semibold leading-snug text-white">{current?.prompt}</h3>
              <ul className="mt-4 space-y-2">
                {current?.choices.map((choice, index) => {
                  const show = picked !== null;
                  const tone = !show ? "border-white/10 bg-black/20" : choice.correct ? "border-emerald-400/50 bg-emerald-500/10" : index === picked ? "border-red-400/50 bg-red-500/10" : "border-white/10 opacity-60";
                  return (
                    <li key={choice.label}>
                      <button type="button" disabled={picked !== null} onClick={() => answer(index)} className={`w-full rounded-2xl border px-4 py-3 text-left text-sm text-slate-100 ${tone}`}>
                        {choice.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
              {selected ? (
                <div className="mt-4">
                  <p className="text-sm leading-relaxed text-slate-200">{selected.why}</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (quizIndex + 1 >= quiz.length) {
                        setDoneQuiz(true);
                        return;
                      }
                      setQuizIndex((value) => value + 1);
                      setPicked(null);
                    }}
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
