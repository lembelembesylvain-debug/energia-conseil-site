import { useMemo, useState } from "react";
import {
  formatEuroOuPlaceholder,
  getSousCategorieMetier,
  listerPrestationsCatalogue,
  LIBELLES_UNITE,
  sousCategoriesDe,
  type PrestationCatalogue,
} from "../../lib/crm/catalogue";
import { round2, type ProfilConsoPv } from "../../lib/calculators/photovoltaique-2026";
import { ALERTE_DONNEES_NON_VALIDEES, lireReglementairePv } from "../../lib/calculators/photovoltaique-reglementaire";
import {
  ALERTE_ONDULEUR_CENTRAL,
  analyserPuissancePv,
  batterieIndicativeProche,
  estPrestationPvInterne,
  ID_CABLES_FIXE,
  ID_CABLES_VARIABLE,
  ID_COORDINATION,
  ID_CROCHETS,
  ID_POSE_FIXE,
  ID_POSE_VARIABLE,
  kwhDepuisNomBatterie,
  lignesOntArchitecture,
  MENTION_BATTERIE_DIMENSIONNEMENT,
  MENTION_ESTIMATION_PV,
  MENTION_POSE_NON_CUMUL,
  MENTION_STRUCTURE_NON_CUMUL,
  prixPlancherHt,
  PUISSANCES_TEST_PV_KWC,
  quantiteCablesPartFixe,
  quantiteCablesPartVariable,
  quantiteCrochetsSupports,
  quantiteForfaitPv,
  quantiteMicroOnduleurs,
  quantiteOnduleurCentralise,
  quantitePoseFixe,
  quantitePoseVariable,
  quantiteRailsFixations,
  tauxTvaLignePv,
  type ArchitecturePv,
} from "../../lib/calculators/photovoltaique-installation";

const inputClass =
  "mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none";
const labelClass = "block text-xs font-medium uppercase tracking-wide text-slate-400";

export type BrouillonLignePv = {
  cataloguePrestationId: string;
  quantite: number;
  tauxTva: number;
};

type Props = {
  lignesExistantes: Array<{ sousCategorieId?: string; nom?: string }>;
  onAjouterLignes: (lignes: BrouillonLignePv[]) => void;
  voirCoutsInternes?: boolean;
  coutClyveHt?: number;
};

const IDS_FORFAITS_DEFAUT = [
  "pv-coffret-ac-dc",
  "pv-mise-a-la-terre",
  "pv-calepinage",
  "pv-raccordement-enedis-consuel",
  "pv-consuel",
  "pv-mise-en-service",
  "pv-monitoring-production",
  ID_CABLES_FIXE,
] as const;

const SOUS_REQUISES = [
  "Installation photovoltaïque",
  "Micro-onduleurs",
  "Onduleur centralisé",
  "Batterie de stockage",
  "Coffret de protection",
  "Structure et fixations",
  "Crochets et supports",
  "Câbles et connectique",
  "Pose photovoltaïque",
  "Mise à la terre",
  "Protections complémentaires",
  "Calepinage",
  "Raccordement",
  "Démarches administratives",
  "Consuel",
  "Mise en service",
  "Monitoring",
  "Maintenance",
  "Coordination ENERGIA",
  "Frais administratifs Clyve",
];

const PROFILS_CONSO: { value: ProfilConsoPv; label: string }[] = [
  { value: "inconnu", label: "Profil non précisé" },
  { value: "residentiel_jour", label: "Résidentiel — conso plutôt diurne" },
  { value: "residentiel_soir", label: "Résidentiel — conso plutôt soir / nuit" },
  { value: "professionnel", label: "Professionnel" },
];

function prestationsPv(): PrestationCatalogue[] {
  return listerPrestationsCatalogue().filter(
    (item) => item.categorieId === "photovoltaique" && item.actif && !item.demo,
  );
}

function parId(id: string): PrestationCatalogue | undefined {
  return prestationsPv().find((item) => item.id === id);
}

function tarifPresent(prestation: PrestationCatalogue): boolean {
  return (
    (prestation.prixVenteHt != null && prestation.prixVenteHt > 0) ||
    (prestation.coutMaterielHt != null && prestation.coutMaterielHt > 0) ||
    (prestation.coutMainOeuvreHt != null && prestation.coutMainOeuvreHt > 0)
  );
}

export default function ChiffragePhotovoltaiqueAssistant({
  lignesExistantes,
  onAjouterLignes,
  voirCoutsInternes = false,
  coutClyveHt = 500,
}: Props) {
  const [puissanceKwc, setPuissanceKwc] = useState(9);
  const [panneauId, setPanneauId] = useState("pv-dualsun-flash-500");
  const [architecture, setArchitecture] = useState<ArchitecturePv>("micro");
  const [microId, setMicroId] = useState("pv-enphase-iq8plus");
  const [centralId, setCentralId] = useState("pv-huawei-sun2000-3-6");
  const [batterieId, setBatterieId] = useState("");
  const [consoAnnuelleKwh, setConsoAnnuelleKwh] = useState(0);
  const [profilConso, setProfilConso] = useState<ProfilConsoPv>("inconnu");
  const [puissanceDispoKwc, setPuissanceDispoKwc] = useState(0);
  const [tauxAutoconsoCible, setTauxAutoconsoCible] = useState(0);
  const [forfaits, setForfaits] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {
      "pv-rails-fixations": true,
      [ID_CABLES_VARIABLE]: true,
      [ID_CROCHETS]: false,
      [ID_POSE_FIXE]: false,
      [ID_POSE_VARIABLE]: false,
      "pv-protections-complementaires": true,
      "pv-demarches-administratives": true,
      [ID_COORDINATION]: true,
      "pv-maintenance-annuelle": false,
      "pv-deplacement": false,
    };
    for (const id of IDS_FORFAITS_DEFAUT) init[id] = true;
    return init;
  });
  const [erreur, setErreur] = useState<string | null>(null);

  const catalogue = useMemo(() => prestationsPv(), []);
  const sousPv = useMemo(() => sousCategoriesDe("photovoltaique"), []);

  const panneaux = catalogue.filter(
    (item) =>
      item.unite === "panneau" ||
      getSousCategorieMetier(item.sousCategorieId)?.nom === "Installation photovoltaïque" ||
      getSousCategorieMetier(item.sousCategorieId)?.nom === "Panneaux photovoltaïques",
  ).filter((item) => item.id !== ID_POSE_VARIABLE);
  const micros = catalogue.filter(
    (item) => getSousCategorieMetier(item.sousCategorieId)?.nom === "Micro-onduleurs",
  );
  const centrals = catalogue.filter(
    (item) => getSousCategorieMetier(item.sousCategorieId)?.nom === "Onduleur centralisé",
  );
  const batteries = catalogue.filter(
    (item) => getSousCategorieMetier(item.sousCategorieId)?.nom === "Batterie de stockage",
  );

  const manquantes = SOUS_REQUISES.filter((nom) => {
    const sous = sousPv.find((item) => item.nom === nom);
    if (!sous) return true;
    return !catalogue.some((item) => item.sousCategorieId === sous.id);
  });

  const analyse = analyserPuissancePv(puissanceKwc);
  const capacites = batteries
    .map((item) => kwhDepuisNomBatterie(item.nom))
    .filter((n): n is number => n != null);
  const recoBatterie = batterieIndicativeProche(
    analyse.ok ? analyse.puissanceKwc : 0,
    capacites,
    consoAnnuelleKwh > 0 ? consoAnnuelleKwh : undefined,
    {
      profilConso,
      puissanceDispoKwc: puissanceDispoKwc > 0 ? puissanceDispoKwc : undefined,
      tauxAutoconsoCible: tauxAutoconsoCible > 0 ? tauxAutoconsoCible : undefined,
    },
  );
  const conflit =
    (architecture === "micro" && lignesOntArchitecture(lignesExistantes, "central")) ||
    (architecture === "central" && lignesOntArchitecture(lignesExistantes, "micro"));
  const lectureReglementaire = lireReglementairePv(analyse.ok ? analyse.puissanceKwc : 0);

  const lignesProposees = useMemo((): Array<BrouillonLignePv & { prestation: PrestationCatalogue }> => {
    if (!analyse.ok) return [];
    const n = analyse.nombrePanneaux;
    const tvaEquip = tauxTvaLignePv({ puissanceKwc: analyse.puissanceKwc });
    const out: Array<BrouillonLignePv & { prestation: PrestationCatalogue }> = [];
    const push = (id: string, quantite: number, tva?: number) => {
      const prestation = parId(id);
      if (!prestation || !(quantite > 0) || estPrestationPvInterne(id)) return;
      const sousNom = getSousCategorieMetier(prestation.sousCategorieId)?.nom;
      out.push({
        cataloguePrestationId: id,
        quantite,
        tauxTva: tva ?? tauxTvaLignePv({ puissanceKwc: analyse.puissanceKwc, sousCategorieNom: sousNom, tauxCatalogue: prestation.tauxTva }),
        prestation,
      });
    };

    push(panneauId, n, tvaEquip);
    if (architecture === "micro") push(microId, quantiteMicroOnduleurs(n), tvaEquip);
    if (architecture === "central") push(centralId, quantiteOnduleurCentralise(), tvaEquip);
    if (forfaits["pv-rails-fixations"]) push("pv-rails-fixations", quantiteRailsFixations(n), tvaEquip);
    if (forfaits[ID_CROCHETS]) push(ID_CROCHETS, quantiteCrochetsSupports(n), tvaEquip);
    if (forfaits[ID_CABLES_FIXE]) push(ID_CABLES_FIXE, quantiteCablesPartFixe(n), tvaEquip);
    if (forfaits[ID_CABLES_VARIABLE]) push(ID_CABLES_VARIABLE, quantiteCablesPartVariable(n), tvaEquip);
    if (forfaits[ID_POSE_FIXE]) push(ID_POSE_FIXE, quantitePoseFixe(n), tvaEquip);
    if (forfaits[ID_POSE_VARIABLE]) push(ID_POSE_VARIABLE, quantitePoseVariable(n), tvaEquip);
    for (const id of IDS_FORFAITS_DEFAUT) {
      if (id === ID_CABLES_FIXE) continue;
      if (forfaits[id]) push(id, quantiteForfaitPv(), tvaEquip);
    }
    if (forfaits["pv-protections-complementaires"]) push("pv-protections-complementaires", 1, tvaEquip);
    if (forfaits["pv-demarches-administratives"]) push("pv-demarches-administratives", 1, tvaEquip);
    if (forfaits[ID_COORDINATION]) push(ID_COORDINATION, 1, tvaEquip);
    if (forfaits["pv-deplacement"]) push("pv-deplacement", 1, tvaEquip);
    if (batterieId) push(batterieId, 1, tvaEquip);
    if (forfaits["pv-maintenance-annuelle"]) push("pv-maintenance-annuelle", 1, 0.2);
    return out;
  }, [analyse, architecture, panneauId, microId, centralId, batterieId, forfaits]);

  const totaux = useMemo(() => {
    return lignesProposees.reduce(
      (acc, ligne) => {
        const vente = (ligne.prestation.prixVenteHt ?? 0) * ligne.quantite;
        const revient =
          ((ligne.prestation.coutMaterielHt ?? 0) + (ligne.prestation.coutMainOeuvreHt ?? 0)) *
          ligne.quantite;
        const tva = vente * ligne.tauxTva;
        acc.ht += vente;
        acc.revient += revient;
        acc.tva += tva;
        acc.ttc += vente + tva;
        acc.marge += vente - revient;
        return acc;
      },
      { ht: 0, tva: 0, ttc: 0, revient: 0, marge: 0 },
    );
  }, [lignesProposees]);

  const sansTarif = lignesProposees.filter((ligne) => !tarifPresent(ligne.prestation));
  const aZero = lignesProposees.filter(
    (ligne) =>
      (ligne.prestation.prixVenteHt ?? 0) <= 0 &&
      (ligne.prestation.coutMaterielHt ?? 0) <= 0 &&
      (ligne.prestation.coutMainOeuvreHt ?? 0) <= 0,
  );
  const plancher = prixPlancherHt(totaux.revient);
  const venteSousPlancher = voirCoutsInternes && totaux.ht > 0 && totaux.ht < plancher;

  function toggleForfait(id: string) {
    setForfaits((actuel) => ({ ...actuel, [id]: !actuel[id] }));
  }

  function valider() {
    if (!analyse.ok) {
      setErreur(analyse.alerte ?? "Puissance invalide.");
      return;
    }
    if (conflit) {
      setErreur(
        "Micro-onduleurs et onduleur centralisé ne peuvent pas être sélectionnés ensemble. Retirez l’une des deux architectures.",
      );
      return;
    }
    if (architecture === "micro" && !parId(microId)) {
      setErreur("Aucun micro-onduleur du catalogue n’est sélectionné.");
      return;
    }
    if (architecture === "central" && !parId(centralId)) {
      setErreur("Aucun onduleur centralisé du catalogue n’est sélectionné.");
      return;
    }
    if (!parId(panneauId)) {
      setErreur("Sélectionnez un panneau du catalogue.");
      return;
    }
    const aAjouter = lignesProposees.filter((ligne) => tarifPresent(ligne.prestation));
    if (aAjouter.length === 0) {
      setErreur("Aucune prestation chiffrée à ajouter. Complétez le catalogue ou retirez les postes à 0 €.");
      return;
    }
    setErreur(
      sansTarif.length > 0
        ? `${sansTarif.length} poste(s) sans tarif non ajoutés : ${sansTarif.map((l) => l.prestation.nom).join(", ")}.`
        : null,
    );
    onAjouterLignes(
      aAjouter.map((ligne) => ({
        cataloguePrestationId: ligne.cataloguePrestationId,
        quantite: ligne.quantite,
        tauxTva: ligne.tauxTva,
      })),
    );
  }

  const euro = (n: number) =>
    n.toLocaleString("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 });

  const libelleUnite = (prestation: PrestationCatalogue) =>
    prestation.unite === "forfait" ? "forfait" : LIBELLES_UNITE[prestation.unite].toLowerCase();

  return (
    <section className="space-y-4 rounded-2xl border border-sky-500/30 bg-sky-500/[0.07] p-4 sm:p-5">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-sky-200">
          Assistant photovoltaïque 500 Wc → 100 kWc
        </p>
        <h3 className="mt-1 text-base font-semibold text-white">
          Chiffrage structuré — estimation, pas un devis réel
        </h3>
        <p className="mt-1 text-xs text-slate-400">{MENTION_ESTIMATION_PV}</p>
      </div>

      {lectureReglementaire.alerte ? (
        <p role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {lectureReglementaire.alerte ?? ALERTE_DONNEES_NON_VALIDEES}
        </p>
      ) : null}

      {manquantes.length > 0 ? (
        <p role="alert" className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          Prestations catalogue manquantes : {manquantes.join(", ")}. Ajoutez-les dans le
          catalogue métiers avant de finaliser.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Puissance (kWc)
          <input
            type="number"
            min={0.5}
            max={100}
            step={0.5}
            value={puissanceKwc}
            onChange={(event) => setPuissanceKwc(Number(event.target.value))}
            className={inputClass}
          />
        </label>
        <div className="rounded-lg border border-slate-800 bg-slate-950/70 px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-slate-500">Panneaux 500 Wc</p>
          <p className="text-lg font-semibold text-white">
            {analyse.ok ? analyse.nombrePanneaux : "—"}{" "}
            <span className="text-sm font-normal text-slate-400">panneaux</span>
          </p>
          <p className="text-xs text-slate-400">
            {analyse.ok ? analyse.correspondance : analyse.alerte}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1">
        {PUISSANCES_TEST_PV_KWC.map((kwc) => (
          <button
            key={kwc}
            type="button"
            onClick={() => setPuissanceKwc(kwc)}
            className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
              puissanceKwc === kwc
                ? "border-sky-400 bg-sky-500/20 text-sky-100"
                : "border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            {kwc === 0.5 ? "500 Wc" : `${kwc} kWc`}
          </button>
        ))}
      </div>

      {analyse.alerte ? (
        <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {analyse.alerte}
        </p>
      ) : null}

      <label className={labelClass}>
        Panneaux (catalogue uniquement)
        <select
          value={panneauId}
          onChange={(event) => setPanneauId(event.target.value)}
          className={inputClass}
        >
          {panneaux.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nom}
            </option>
          ))}
        </select>
      </label>

      <fieldset className="space-y-2">
        <legend className="text-xs font-medium uppercase tracking-wide text-slate-400">
          Architecture onduleur
        </legend>
        <label className="flex items-start gap-2 text-sm text-slate-200">
          <input
            type="radio"
            name="arch-pv"
            checked={architecture === "micro"}
            onChange={() => setArchitecture("micro")}
          />
          Micro-onduleurs — {analyse.ok ? `${quantiteMicroOnduleurs(analyse.nombrePanneaux)} unités` : "1 par panneau"}
        </label>
        <label className="flex items-start gap-2 text-sm text-slate-200">
          <input
            type="radio"
            name="arch-pv"
            checked={architecture === "central"}
            onChange={() => setArchitecture("central")}
          />
          Onduleur centralisé — quantité 1 (jamais de micro-onduleurs en même temps)
        </label>
      </fieldset>

      {architecture === "micro" ? (
        <label className={labelClass}>
          Micro-onduleur
          <select value={microId} onChange={(event) => setMicroId(event.target.value)} className={inputClass}>
            {micros.length === 0 ? <option value="">Aucun modèle au catalogue</option> : null}
            {micros.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nom}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <div className="space-y-2">
          <p role="status" className="rounded-lg border border-orange-500/40 bg-orange-500/10 px-3 py-2 text-xs text-orange-100">
            {ALERTE_ONDULEUR_CENTRAL}
          </p>
          <label className={labelClass}>
            Onduleur centralisé
            <select
              value={centralId}
              onChange={(event) => setCentralId(event.target.value)}
              className={inputClass}
            >
              {centrals.length === 0 ? <option value="">Aucun modèle au catalogue</option> : null}
              {centrals.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nom}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {conflit ? (
        <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          Le projet contient déjà l’autre architecture. Micro-onduleurs et onduleur centralisé sont
          exclusifs.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={labelClass}>
          Consommation annuelle (kWh) — optionnelle
          <input
            type="number"
            min={0}
            step={100}
            value={consoAnnuelleKwh || ""}
            onChange={(event) => setConsoAnnuelleKwh(Number(event.target.value) || 0)}
            className={inputClass}
            placeholder="Ex. 4500"
          />
        </label>
        <label className={labelClass}>
          Profil de consommation
          <select
            value={profilConso}
            onChange={(event) => setProfilConso(event.target.value as ProfilConsoPv)}
            className={inputClass}
          >
            {PROFILS_CONSO.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Puissance dispo raccordement (kVA / kWc) — optionnelle
          <input
            type="number"
            min={0}
            step={0.5}
            value={puissanceDispoKwc || ""}
            onChange={(event) => setPuissanceDispoKwc(Number(event.target.value) || 0)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Autoconsommation visée (%) — optionnelle
          <input
            type="number"
            min={0}
            max={100}
            step={5}
            value={tauxAutoconsoCible ? round2(tauxAutoconsoCible * 100) : ""}
            onChange={(event) => setTauxAutoconsoCible((Number(event.target.value) || 0) / 100)}
            className={inputClass}
          />
        </label>
      </div>

      <label className={labelClass}>
        Batterie de stockage (optionnelle, jamais obligatoire)
        <select
          value={batterieId}
          onChange={(event) => setBatterieId(event.target.value)}
          className={inputClass}
        >
          <option value="">Sans batterie</option>
          {batteries.map((item) => (
            <option key={item.id} value={item.id}>
              {item.nom}
            </option>
          ))}
        </select>
      </label>
      <p className="text-xs text-slate-400">
        Recommandation indicative
        {recoBatterie.recommandeeKwh > 0
          ? ` : ${recoBatterie.recommandeeKwh.toLocaleString("fr-FR")} kWh`
          : ""}
        {recoBatterie.catalogueProcheKwh
          ? ` (plus proche catalogue : ${recoBatterie.catalogueProcheKwh.toLocaleString("fr-FR")} kWh)`
          : ""}
        . Non obligatoire. {MENTION_BATTERIE_DIMENSIONNEMENT}
      </p>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">
          Forfaits (quantité 1) et éléments proportionnels
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ["pv-coffret-ac-dc", "Coffret AC/DC — 1 forfait (non × panneaux)"],
            ["pv-rails-fixations", `Rails/fixations — ${analyse.ok ? quantiteRailsFixations(analyse.nombrePanneaux) : "min. 4"} unités`],
            [ID_CROCHETS, `Crochets/supports — ${analyse.ok ? quantiteCrochetsSupports(analyse.nombrePanneaux) : "min. 4"} unités (option)`],
            [ID_CABLES_FIXE, "Câbles — part fixe — 1 forfait"],
            [ID_CABLES_VARIABLE, `Câbles — part variable — ${analyse.ok ? quantiteCablesPartVariable(analyse.nombrePanneaux) : "0"} lot(s)`],
            [ID_POSE_FIXE, "Pose — part fixe — 1 forfait (option)"],
            [ID_POSE_VARIABLE, `Pose — part variable — ${analyse.ok ? quantitePoseVariable(analyse.nombrePanneaux) : "n"} panneaux (option)`],
            ["pv-mise-a-la-terre", "Mise à la terre — 1 forfait"],
            ["pv-protections-complementaires", "Protections complémentaires — 1 forfait"],
            ["pv-calepinage", "Calepinage — 1 forfait"],
            ["pv-raccordement-enedis-consuel", "Raccordement — 1 forfait"],
            ["pv-demarches-administratives", "Démarches administratives — 1 forfait"],
            ["pv-consuel", "Consuel — 1 forfait"],
            ["pv-mise-en-service", "Mise en service — 1 forfait"],
            ["pv-monitoring-production", "Monitoring — 1 forfait"],
            ["pv-deplacement", "Déplacement — 1 forfait"],
            ["pv-maintenance-annuelle", "Maintenance annuelle — 1 forfait"],
            [ID_COORDINATION, "Coordination ENERGIA — 1 forfait"],
          ].map(([id, label]) => (
            <label key={id} className="flex items-start gap-2 text-xs text-slate-200">
              <input
                type="checkbox"
                checked={Boolean(forfaits[id])}
                onChange={() => toggleForfait(id)}
              />
              {label}
            </label>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-slate-500">{MENTION_POSE_NON_CUMUL}</p>
        <p className="text-[11px] text-slate-500">{MENTION_STRUCTURE_NON_CUMUL}</p>
      </div>

      {analyse.ok ? (
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
            Synthèse avant ajout — {analyse.correspondance}
          </p>
          <ul className="space-y-1 text-xs text-slate-300">
            {lignesProposees.map((ligne) => (
              <li key={ligne.cataloguePrestationId} className="flex justify-between gap-3">
                <span>
                  {ligne.prestation.nom}{" "}
                  <span className="text-slate-500">
                    × {ligne.quantite.toLocaleString("fr-FR")} {libelleUnite(ligne.prestation)}
                  </span>
                  {!tarifPresent(ligne.prestation) ? (
                    <span className="ml-1 text-amber-200">— tarif à renseigner</span>
                  ) : ligne.prestation.statut === "estimation" ? (
                    <span className="ml-1 text-amber-200/80">— estimation</span>
                  ) : null}
                </span>
                <span>
                  {formatEuroOuPlaceholder(
                    round2((ligne.prestation.prixVenteHt ?? 0) * ligne.quantite),
                    "—",
                  )}
                </span>
              </li>
            ))}
            {voirCoutsInternes ? (
              <li className="flex justify-between gap-3 text-slate-400">
                <span>Frais Clyve (interne, non facturé au client) × 1 forfait</span>
                <span>{euro(coutClyveHt)} HT</span>
              </li>
            ) : null}
          </ul>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <div>
              <dt className="text-slate-500">Vente HT</dt>
              <dd className="font-semibold text-white">{euro(round2(totaux.ht))}</dd>
            </div>
            <div>
              <dt className="text-slate-500">TVA</dt>
              <dd>{euro(round2(totaux.tva))}</dd>
            </div>
            <div>
              <dt className="text-slate-500">TTC</dt>
              <dd className="font-semibold text-emerald-300">{euro(round2(totaux.ttc))}</dd>
            </div>
            {voirCoutsInternes ? (
              <div>
                <dt className="text-slate-500">Marge brute HT</dt>
                <dd className={totaux.marge < 0 ? "text-red-300" : "text-emerald-300"}>
                  {euro(round2(totaux.marge))}
                </dd>
              </div>
            ) : null}
          </dl>
          {voirCoutsInternes ? (
            <p className="mt-2 text-[11px] text-slate-500">
              Coût de revient HT {euro(round2(totaux.revient))}. Prix plancher HT {euro(plancher)}.{" "}
              {MENTION_ESTIMATION_PV} Architecture :{" "}
              {architecture === "micro"
                ? `${analyse.nombrePanneaux} micro-onduleurs`
                : "1 onduleur centralisé"}
              , jamais les deux. Coffret AC/DC : 1 forfait. Frais Clyve et coordination ENERGIA
              séparés.
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-slate-500">
              {MENTION_ESTIMATION_PV} Architecture :{" "}
              {architecture === "micro"
                ? `${analyse.nombrePanneaux} micro-onduleurs`
                : "1 onduleur centralisé"}
              , jamais les deux. Coffret AC/DC : 1 forfait.
            </p>
          )}
          {venteSousPlancher ? (
            <p role="alert" className="mt-2 text-xs font-semibold text-red-300">
              Prix de vente HT sous le prix plancher administrateur.
            </p>
          ) : null}
          {aZero.length > 0 ? (
            <p role="alert" className="mt-2 text-xs text-amber-200">
              Montant 0 € : {aZero.map((l) => l.prestation.nom).join(", ")}. {MENTION_ESTIMATION_PV}{" "}
              Ces postes ne seront pas ajoutés tant que le tarif catalogue n’est pas renseigné.
            </p>
          ) : null}
        </div>
      ) : null}

      {erreur ? (
        <p role="alert" className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {erreur}
        </p>
      ) : null}

      <button
        type="button"
        onClick={valider}
        disabled={!analyse.ok || conflit}
        className="rounded-xl bg-gradient-to-r from-sky-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Ajouter ce chiffrage structuré au projet
      </button>
    </section>
  );
}
