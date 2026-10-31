import { useMemo, useState, type FormEvent } from "react";
import {
  Wrench,
  ShieldCheck,
  Calendar,
  Plus,
  Search,
  FileText,
  UserCheck,
  MapPin,
  Phone,
  X,
} from "lucide-react";

type QualificationTechnicien =
  | "QualiPAC / Frigoriste F-Gaz"
  | "Plombier-Chauffagiste"
  | "Qualibois (Poêles & Granulés)"
  | "QualiPV / Électricien IRVE";

type TypeEquipement =
  | "PAC Air/Eau & Hybride"
  | "Poêle / Chaudière Granulés"
  | "Solaire Photovoltaïque & Tesla Powerwall"
  | "Ballon Thermo & Adoucisseur";

interface Equipement {
  id: string;
  client_nom: string;
  client_ville: string;
  client_telephone: string;
  type_equipement: TypeEquipement;
  familles: TypeEquipement[];
  qualifications: QualificationTechnicien[];
  marque: string;
  modele: string;
  numero_serie: string;
  prochaine_visite: string;
  formule: string;
  montant_mensuel_ttc: number;
  statut_contrat: "actif" | "en_retard" | "a_planifier";
  technicien_assigne: string;
  opportunites: {
    isolation: boolean;
    menuiseries: boolean;
    solaire: boolean;
  };
}

const FAMILLES: { type: TypeEquipement; qualif: QualificationTechnicien; badge: string }[] = [
  { type: "PAC Air/Eau & Hybride", qualif: "QualiPAC / Frigoriste F-Gaz", badge: "QualiPAC" },
  { type: "Poêle / Chaudière Granulés", qualif: "Qualibois (Poêles & Granulés)", badge: "Qualibois" },
  { type: "Solaire Photovoltaïque & Tesla Powerwall", qualif: "QualiPV / Électricien IRVE", badge: "QualiPV" },
  { type: "Ballon Thermo & Adoucisseur", qualif: "Plombier-Chauffagiste", badge: "Plombier" },
];

const PACKS = [
  {
    label: "Pack Sérénité PAC + Chauffage",
    montant: 19.9,
    detail: "Entretien PAC et désembouage du circuit (radiateurs, plancher chauffant) pour la garantie compresseur.",
  },
  {
    label: "Pack Sérénité Biomasse / Granulés",
    montant: 15.9,
    detail: "Ramonage et entretien annuel obligatoires. Terrain : 14,90 à 18,90 € TTC/mois, soit 180 à 220 €/an.",
  },
  {
    label: "Pack Global Autonomie",
    montant: 29.9,
    detail: "PAC + solaire QualiPV (onduleurs, coffrets AC/DC, Tesla Powerwall 3) + granulés, et borne IRVE.",
  },
] as const;

const FORMULES = PACKS;

function renderBadgeQualif(qualif: string) {
  switch (qualif) {
    case "Qualibois":
      return (
        <span className="rounded border border-amber-700/40 bg-amber-900/30 px-2 py-0.5 text-[10px] font-bold text-amber-300">
          🪵 Qualibois
        </span>
      );
    case "QualiPV":
      return (
        <span className="rounded border border-yellow-500/30 bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
          ⚡ QualiPV / Élec
        </span>
      );
    case "Plombier":
      return (
        <span className="rounded border border-blue-500/30 bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold text-blue-300">
          🔧 Plomberie/Chauffage
        </span>
      );
    default:
      return (
        <span className="rounded border border-cyan-500/30 bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
          ❄️ QualiPAC F-Gaz
        </span>
      );
  }
}

function cleBadge(qualif: string) {
  if (qualif.includes("Qualibois")) return "Qualibois";
  if (qualif.includes("QualiPV")) return "QualiPV";
  if (qualif.includes("Plombier")) return "Plombier";
  return "QualiPAC";
}

function obligationVisite(eq: Equipement) {
  const lignes: string[] = [];
  if (eq.qualifications.some((q) => q.includes("QualiPAC"))) {
    lignes.push("PAC : contrôle d'étanchéité décret 2020-912, CERFA signé par l'opérateur attesté F-Gaz.");
  }
  if (eq.qualifications.some((q) => q.includes("Qualibois"))) {
    lignes.push(
      "Granulés : ramonage et entretien annuel strictement obligatoires (Code de la santé publique et clauses d'assurance incendie).",
    );
  }
  if (eq.qualifications.some((q) => q.includes("Plombier"))) {
    lignes.push(
      "Hydraulique : désembouage du circuit tous les 5 ans (garantie compresseur). Adoucisseur, filtre magnétique anti-boue, vase d'expansion.",
    );
  }
  if (eq.qualifications.some((q) => q.includes("QualiPV"))) {
    lignes.push(
      "Solaire : contrôle annuel des onduleurs ou micro-onduleurs, coffrets AC/DC et Tesla Powerwall 3. Contrôle de la borne IRVE.",
    );
  }
  return lignes;
}

const mockEquipements: Equipement[] = [
  {
    id: "1",
    client_nom: "M. et Mme Oussara",
    client_ville: "Colombier-Saugnieu (69)",
    client_telephone: "06 12 34 56 78",
    type_equipement: "PAC Air/Eau & Hybride",
    familles: ["PAC Air/Eau & Hybride", "Ballon Thermo & Adoucisseur"],
    qualifications: ["QualiPAC / Frigoriste F-Gaz", "Plombier-Chauffagiste"],
    marque: "Atlantic",
    modele: "Alféa Excellia A.I. 11",
    numero_serie: "ATL-2026-9941",
    prochaine_visite: "2026-11-15",
    formule: "Pack Sérénité PAC + Chauffage",
    montant_mensuel_ttc: 19.9,
    statut_contrat: "a_planifier",
    technicien_assigne: "Fabrice REY",
    opportunites: { isolation: true, menuiseries: true, solaire: true },
  },
  {
    id: "2",
    client_nom: "M. Emrick Brunel",
    client_ville: "Bussières (42)",
    client_telephone: "06 98 76 54 32",
    type_equipement: "PAC Air/Eau & Hybride",
    familles: ["PAC Air/Eau & Hybride", "Ballon Thermo & Adoucisseur"],
    qualifications: ["QualiPAC / Frigoriste F-Gaz", "Plombier-Chauffagiste"],
    marque: "Daikin",
    modele: "Altherma 3 H HT 14kW",
    numero_serie: "DAI-42-8812",
    prochaine_visite: "2026-11-05",
    formule: "Pack Sérénité PAC + Chauffage",
    montant_mensuel_ttc: 19.9,
    statut_contrat: "actif",
    technicien_assigne: "Momo BENAOUDA",
    opportunites: { isolation: false, menuiseries: true, solaire: false },
  },
  {
    id: "3",
    client_nom: "M. David Pereira",
    client_ville: "Nervieux (42)",
    client_telephone: "06 55 44 33 22",
    type_equipement: "PAC Air/Eau & Hybride",
    familles: ["PAC Air/Eau & Hybride", "Ballon Thermo & Adoucisseur"],
    qualifications: ["QualiPAC / Frigoriste F-Gaz", "Plombier-Chauffagiste"],
    marque: "Mitsubishi",
    modele: "Ecodan Zubadan 12kW",
    numero_serie: "MIT-42-1090",
    prochaine_visite: "2026-10-20",
    formule: "Pack Sérénité PAC + Chauffage",
    montant_mensuel_ttc: 19.9,
    statut_contrat: "en_retard",
    technicien_assigne: "Non assigné",
    opportunites: { isolation: true, menuiseries: false, solaire: true },
  },
  {
    id: "4",
    client_nom: "Contrat type Qualibois (démo)",
    client_ville: "Loire (42)",
    client_telephone: "—",
    type_equipement: "Poêle / Chaudière Granulés",
    familles: ["Poêle / Chaudière Granulés"],
    qualifications: ["Qualibois (Poêles & Granulés)"],
    marque: "Palazzetti",
    modele: "Poêle granulés étanche",
    numero_serie: "QLB-42-DEMO",
    prochaine_visite: "2026-11-20",
    formule: "Pack Sérénité Biomasse / Granulés",
    montant_mensuel_ttc: 15.9,
    statut_contrat: "actif",
    technicien_assigne: "Ramonage local Qualibois",
    opportunites: { isolation: false, menuiseries: false, solaire: false },
  },
  {
    id: "5",
    client_nom: "Contrat type Pack Global (démo)",
    client_ville: "Rhône (69)",
    client_telephone: "—",
    type_equipement: "Solaire Photovoltaïque & Tesla Powerwall",
    familles: [
      "PAC Air/Eau & Hybride",
      "Poêle / Chaudière Granulés",
      "Solaire Photovoltaïque & Tesla Powerwall",
      "Ballon Thermo & Adoucisseur",
    ],
    qualifications: [
      "QualiPAC / Frigoriste F-Gaz",
      "Qualibois (Poêles & Granulés)",
      "QualiPV / Électricien IRVE",
      "Plombier-Chauffagiste",
    ],
    marque: "Tesla",
    modele: "Powerwall 3 + onduleur + borne IRVE",
    numero_serie: "PW3-69-DEMO",
    prochaine_visite: "2026-12-10",
    formule: "Pack Global Autonomie",
    montant_mensuel_ttc: 29.9,
    statut_contrat: "actif",
    technicien_assigne: "Électricien QualiPV",
    opportunites: { isolation: false, menuiseries: false, solaire: false },
  },
];

type NouveauClientForm = {
  client_nom: string;
  client_ville: string;
  client_telephone: string;
  type_equipement: TypeEquipement;
  marque: string;
  modele: string;
  numero_serie: string;
  formule: string;
  montant_mensuel_ttc: number;
  technicien_assigne: string;
};

const NEW_CLIENT_VIDE: NouveauClientForm = {
  client_nom: "",
  client_ville: "",
  client_telephone: "",
  type_equipement: "PAC Air/Eau & Hybride",
  marque: "Atlantic",
  modele: "",
  numero_serie: "",
  formule: "Pack Sérénité PAC + Chauffage",
  montant_mensuel_ttc: 19.9,
  technicien_assigne: "Fabrice REY",
};

function dateVisiteDecretDeuxAns() {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 2);
  return d.toISOString().slice(0, 10);
}

function metaDepuisFormule(montant: number): Pick<Equipement, "type_equipement" | "familles" | "qualifications" | "formule"> {
  if (montant === 15.9) {
    return {
      type_equipement: "Poêle / Chaudière Granulés",
      familles: ["Poêle / Chaudière Granulés"],
      qualifications: ["Qualibois (Poêles & Granulés)"],
      formule: "Pack Sérénité Biomasse / Granulés",
    };
  }
  if (montant === 29.9) {
    return {
      type_equipement: "Solaire Photovoltaïque & Tesla Powerwall",
      familles: [
        "PAC Air/Eau & Hybride",
        "Poêle / Chaudière Granulés",
        "Solaire Photovoltaïque & Tesla Powerwall",
        "Ballon Thermo & Adoucisseur",
      ],
      qualifications: [
        "QualiPAC / Frigoriste F-Gaz",
        "Qualibois (Poêles & Granulés)",
        "QualiPV / Électricien IRVE",
        "Plombier-Chauffagiste",
      ],
      formule: "Pack Global Autonomie",
    };
  }
  return {
    type_equipement: "PAC Air/Eau & Hybride",
    familles: ["PAC Air/Eau & Hybride"],
    qualifications: ["QualiPAC / Frigoriste F-Gaz"],
    formule: "Pack Sérénité PAC + Chauffage",
  };
}

function telechargerFicheVisite(eq: Equipement) {
  const contenu = [
    "ENERGIA-CONSEIL IA® — Fiche de préparation visite (document de travail)",
    ...obligationVisite(eq),
    "Le document réglementaire (CERFA F-Gaz, certificat de ramonage, rapport QualiPV) est établi par l'artisan qualifié, sur place.",
    "",
    `Client : ${eq.client_nom}`,
    `Ville : ${eq.client_ville}`,
    `Téléphone : ${eq.client_telephone}`,
    `Équipement : ${eq.type_equipement}`,
    `Familles couvertes : ${eq.familles.join(" · ")}`,
    `Qualifications : ${eq.qualifications.join(" · ")}`,
    `Marque / modèle : ${eq.marque} ${eq.modele}`,
    `N° de série : ${eq.numero_serie}`,
    `Prochaine visite : ${eq.prochaine_visite}`,
    `Technicien : ${eq.technicien_assigne}`,
    `Contrat : ${eq.formule} — ${eq.montant_mensuel_ttc.toFixed(2)} € TTC / mois`,
  ].join("\n");
  const blob = new Blob([contenu], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const lien = document.createElement("a");
  lien.href = url;
  lien.download = `fiche-visite-${eq.numero_serie || eq.id}.txt`;
  lien.click();
  URL.revokeObjectURL(url);
}

export function GmaoHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMarque, setFilterMarque] = useState("Toutes");
  const [filterFamille, setFilterFamille] = useState("Toutes");
  const [equipements, setEquipements] = useState<Equipement[]>(mockEquipements);
  const [selectedMachine, setSelectedMachine] = useState<Equipement | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newClient, setNewClient] = useState<NouveauClientForm>(NEW_CLIENT_VIDE);

  const totalAbonnes = equipements.length;
  const mrrMensuel = equipements.reduce((acc, eq) => acc + eq.montant_mensuel_ttc, 0);
  const visitesEnRetard = equipements.filter((e) => e.statut_contrat === "en_retard").length;
  const potentielChantiers = equipements.filter(
    (e) => e.opportunites.isolation || e.opportunites.menuiseries || e.opportunites.solaire,
  ).length;

  const marques = useMemo(() => {
    const jeu = new Set(equipements.map((e) => e.marque));
    return ["Toutes", ...jeu];
  }, [equipements]);

  const filteredEquipements = equipements.filter((e) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      e.client_nom.toLowerCase().includes(q) ||
      e.client_ville.toLowerCase().includes(q) ||
      e.marque.toLowerCase().includes(q) ||
      e.modele.toLowerCase().includes(q) ||
      e.type_equipement.toLowerCase().includes(q) ||
      e.formule.toLowerCase().includes(q);
    const matchMarque = filterMarque === "Toutes" || e.marque === filterMarque;
    const matchFamille = filterFamille === "Toutes" || e.familles.includes(filterFamille as TypeEquipement);
    return matchSearch && matchMarque && matchFamille;
  });

  const handleAddEquipement = (e: FormEvent) => {
    e.preventDefault();
    if (!newClient.client_nom.trim() || !newClient.client_ville.trim() || !newClient.modele.trim()) return;
    const meta = metaDepuisFormule(newClient.montant_mensuel_ttc);
    const nouvelItem: Equipement = {
      id: Date.now().toString(),
      client_nom: newClient.client_nom.trim(),
      client_ville: newClient.client_ville.trim(),
      client_telephone: newClient.client_telephone.trim() || "—",
      type_equipement: meta.type_equipement,
      familles: meta.familles,
      qualifications: meta.qualifications,
      marque: newClient.marque,
      modele: newClient.modele.trim(),
      numero_serie: newClient.numero_serie.trim() || `SN-${Date.now().toString().slice(-8)}`,
      formule: meta.formule,
      montant_mensuel_ttc: newClient.montant_mensuel_ttc,
      prochaine_visite: dateVisiteDecretDeuxAns(),
      statut_contrat: "actif",
      technicien_assigne: newClient.technicien_assigne || "Fabrice REY",
      opportunites: { isolation: false, menuiseries: false, solaire: false },
    };
    setEquipements((prev) => [nouvelItem, ...prev]);
    setNewClient(NEW_CLIENT_VIDE);
    setIsAddModalOpen(false);
    setSelectedMachine(nouvelItem);
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5">
            <Wrench className="h-6 w-6 text-amber-400" />
          </div>
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-white">
              GMAO & Maintenance
              <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-sm font-semibold text-amber-400">
                ENERGIA Sérénité
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              QualiPAC, Qualibois, plomberie-chauffage et QualiPV — entretien obligatoire et abonnement mensuel
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-600"
        >
          <Plus className="h-4 w-4" /> Nouvel Abonné PAC
        </button>
      </div>

      <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs font-medium uppercase text-slate-400">Abonnés Actifs</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">{totalAbonnes}</span>
            <span className="text-xs font-semibold text-emerald-400">parc local</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs font-medium uppercase text-slate-400">Rente Mensuelle (MRR)</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-amber-400">{mrrMensuel.toFixed(2)} €</span>
            <span className="text-xs text-slate-400">/ mois auto</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs font-medium uppercase text-slate-400">Alertes / Échéances Retard</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-rose-500">{visitesEnRetard}</span>
            <span className="text-xs font-medium text-rose-400">Action requise</span>
          </div>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
          <p className="text-xs font-medium uppercase text-slate-400">Potentiel Chantiers Détectés</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-cyan-400">{potentielChantiers}</span>
            <span className="text-xs text-cyan-300">Opportunités Rénov</span>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-3 md:grid-cols-3">
        {PACKS.map((pack) => (
          <article key={pack.label} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <p className="text-sm font-bold text-white">{pack.label}</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-400">{pack.montant.toFixed(2)} € <span className="text-xs font-medium text-slate-400">TTC / mois</span></p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">{pack.detail}</p>
          </article>
        ))}
      </div>

      <div className="mb-6 flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par client, ville, marque ou pack..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-9 pr-4 text-sm text-white focus:border-amber-400 focus:outline-none"
          />
        </div>
        <select
          value={filterMarque}
          onChange={(e) => setFilterMarque(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 focus:border-amber-400 focus:outline-none"
        >
          {marques.map((marque) => (
            <option key={marque} value={marque}>
              {marque === "Toutes" ? "Toutes les marques" : marque}
            </option>
          ))}
        </select>
        <select
          value={filterFamille}
          onChange={(e) => setFilterFamille(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-900 px-3 py-2 text-sm text-slate-300 focus:border-amber-400 focus:outline-none"
        >
          <option value="Toutes">Toutes les filières</option>
          {FAMILLES.map((famille) => (
            <option key={famille.type} value={famille.type}>
              {famille.type}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="border-b border-slate-700 bg-slate-800/60 text-xs font-semibold uppercase text-slate-400">
              <tr>
                <th className="p-4">Client & Ville</th>
                <th className="p-4">Équipement</th>
                <th className="p-4">Abonnement Stripe</th>
                <th className="p-4">Prochaine Échéance</th>
                <th className="p-4">Technicien RGE</th>
                <th className="p-4">Chantiers Détectés</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredEquipements.map((eq) => (
                <tr key={eq.id} className="transition hover:bg-slate-800/40">
                  <td className="p-4">
                    <p className="font-bold text-white">{eq.client_nom}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                      <MapPin className="h-3 w-3 text-amber-400" /> {eq.client_ville}
                    </p>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-slate-200">{eq.marque}</span> — {eq.modele}
                    <p className="mt-0.5 text-xs text-slate-400">{eq.type_equipement}</p>
                    <p className="mt-0.5 font-mono text-xs text-slate-500">S/N: {eq.numero_serie}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {eq.qualifications.map((qualif) => (
                        <span key={qualif}>{renderBadgeQualif(cleBadge(qualif))}</span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                      <ShieldCheck className="h-3 w-3" /> {eq.formule}
                    </span>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium ${
                        eq.statut_contrat === "en_retard"
                          ? "border border-rose-500/20 bg-rose-500/10 text-rose-400"
                          : eq.statut_contrat === "a_planifier"
                            ? "border border-amber-500/20 bg-amber-500/10 text-amber-300"
                            : "bg-slate-800 text-slate-300"
                      }`}
                    >
                      <Calendar className="h-3 w-3" /> {eq.prochaine_visite}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-1 text-slate-300">
                      <UserCheck className="h-3.5 w-3.5 text-cyan-400" /> {eq.technicien_assigne}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1.5">
                      {eq.opportunites.isolation ? (
                        <span className="rounded border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-400">
                          Combles
                        </span>
                      ) : null}
                      {eq.opportunites.menuiseries ? (
                        <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
                          Fenêtres
                        </span>
                      ) : null}
                      {eq.opportunites.solaire ? (
                        <span className="rounded border border-yellow-500/20 bg-yellow-500/10 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
                          Solaire
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        title="Télécharger la fiche de préparation de visite"
                        onClick={() => telechargerFicheVisite(eq)}
                        className="rounded-lg bg-slate-800 p-1.5 text-slate-300 transition hover:bg-slate-700"
                      >
                        <FileText className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedMachine(eq)}
                        className="rounded-lg border border-amber-500/30 bg-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-300 transition hover:bg-amber-500 hover:text-slate-950"
                      >
                        Gérer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEquipements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-sm text-slate-500">
                    Aucun équipement ne correspond à cette recherche.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Parc de démonstration en local. La table Supabase <code className="text-sky-300">equipements_maintenance</code>{" "}
        se branche après exécution de la migration. Les montants d&apos;abonnement sont hors aides MaPrimeRénov&apos;.
      </p>

      {selectedMachine ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70" onClick={() => setSelectedMachine(null)}>
          <aside
            className="h-full w-full max-w-md overflow-y-auto border-l border-slate-800 bg-slate-900 p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-400">Fiche machine</p>
                <h2 className="mt-1 text-xl font-bold text-white">{selectedMachine.client_nom}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMachine(null)}
                className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-slate-700"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="h-4 w-4 text-amber-400" /> {selectedMachine.client_ville}
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="h-4 w-4 text-amber-400" /> {selectedMachine.client_telephone}
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Équipement</dt>
                <dd className="text-white">
                  {selectedMachine.type_equipement} — {selectedMachine.marque} {selectedMachine.modele}
                </dd>
                <dd className="font-mono text-xs text-slate-500">S/N {selectedMachine.numero_serie}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Contrat</dt>
                <dd className="text-emerald-300">
                  {selectedMachine.formule} · {selectedMachine.montant_mensuel_ttc.toFixed(2)} € TTC / mois
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Prochaine visite</dt>
                <dd className="text-white">
                  {selectedMachine.prochaine_visite} · {selectedMachine.statut_contrat.replace("_", " ")}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase text-slate-500">Technicien</dt>
                <dd className="text-white">{selectedMachine.technicien_assigne}</dd>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedMachine.qualifications.map((qualif) => (
                  <span key={qualif}>{renderBadgeQualif(cleBadge(qualif))}</span>
                ))}
              </div>
            </dl>
            <ul className="mt-6 space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100">
              {obligationVisite(selectedMachine).map((ligne) => (
                <li key={ligne}>{ligne}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => telechargerFicheVisite(selectedMachine)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 font-bold text-slate-950 hover:bg-amber-600"
            >
              <FileText className="h-4 w-4" /> Télécharger la fiche de visite
            </button>
          </aside>
        </div>
      ) : null}

      {/* MODALE NOUVEL ABONNÉ */}
      {isAddModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-100 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                <Plus className="h-5 w-5 text-amber-400" /> Nouvel Abonné au Parc
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddEquipement} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase text-slate-400">Nom du Client</label>
                <input
                  required
                  placeholder="Ex : M. Thomas Laurent"
                  value={newClient.client_nom}
                  onChange={(e) => setNewClient({ ...newClient, client_nom: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">Ville (Dpt)</label>
                  <input
                    required
                    placeholder="Ex : Roanne (42)"
                    value={newClient.client_ville}
                    onChange={(e) => setNewClient({ ...newClient, client_ville: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">Téléphone</label>
                  <input
                    required
                    placeholder="06 00 00 00 00"
                    value={newClient.client_telephone}
                    onChange={(e) => setNewClient({ ...newClient, client_telephone: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">Marque</label>
                  <select
                    value={newClient.marque}
                    onChange={(e) => setNewClient({ ...newClient, marque: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-200"
                  >
                    <option value="Atlantic">Atlantic</option>
                    <option value="Daikin">Daikin</option>
                    <option value="Mitsubishi">Mitsubishi</option>
                    <option value="Palazzetti">Palazzetti (Granulés)</option>
                    <option value="Tesla">Tesla (Powerwall)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase text-slate-400">Modèle</label>
                  <input
                    required
                    placeholder="Ex : Alféa Excellia 14"
                    value={newClient.modele}
                    onChange={(e) => setNewClient({ ...newClient, modele: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase text-slate-400">Formule Stripe</label>
                <select
                  value={newClient.montant_mensuel_ttc}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    const meta = metaDepuisFormule(val);
                    setNewClient({
                      ...newClient,
                      montant_mensuel_ttc: val,
                      formule: meta.formule,
                      type_equipement: meta.type_equipement,
                    });
                  }}
                  className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm font-semibold text-amber-400"
                >
                  <option value={19.9}>Pack Sérénité PAC + Chauffage (19.90 €/m)</option>
                  <option value={15.9}>Pack Sérénité Granulés (15.90 €/m)</option>
                  <option value={29.9}>Pack Global Autonomie (29.90 €/m)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition hover:bg-amber-600"
                >
                  Enregistrer l&apos;Abonné
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default GmaoHub;
