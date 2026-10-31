/**
 * Contrôles PropTech : cadastre, DVF, géorisques, tunnel, sauvegarde, projections.
 * Exécution : node src/lib/crm/verify-proptech.js
 */

import { aireGeojsonM2 } from "../proptech/aire.js";
import { choisirBatimentPrincipal, normaliserParcelle } from "../proptech/cadastre.js";
import { dansLesCinqDernieresAnnees, prixM2Mutation, selectionnerMutationsDvf } from "../proptech/dvf.js";
import { normaliserResumeGeorisques } from "../proptech/georisques.js";
import { pointValide } from "../proptech/sniper.js";
import { ROLE_ADMIN, ROLE_COMMERCIAL, ROLE_PARTENAIRE } from "./roles.js";
import {
  calculerPlusValueVenale,
  calculerRoiProprietaire,
  calculerTunnelProptech,
  ecoPtzAutomatique,
  extraireSurfaceTravaux,
} from "./tunnelProptech.js";
import { projectionWowPourDossier } from "./projectionsWow.js";
import { snapshotProptech } from "./sauvegardeProptech.js";
import { BRUNEL_DOSSIER_ID } from "./brunelWorkingBase.js";
import { CANAL_ECO_PTZ_ETAT, CANAL_PRET_TRAVAUX_FABIEN, editionVide } from "./editionDossier.js";

function assert(condition, message) {
  if (!condition) throw new Error(`ÉCHEC : ${message}`);
}

const carre = {
  type: "Polygon",
  coordinates: [
    [
      [4.75, 46.91],
      [4.751, 46.91],
      [4.751, 46.911],
      [4.75, 46.911],
      [4.75, 46.91],
    ],
  ],
};
const aire = aireGeojsonM2(carre);
assert(aire > 7000 && aire < 12000, `aire ~1 ha attendue, obtenu ${aire}`);

const parcelle = normaliserParcelle({
  geometry: carre,
  properties: { section: "AB", numero: "12", contenance: 850, code_insee: "71173", nom_com: "Chagny" },
});
assert(parcelle.section === "AB" && parcelle.numero === "0012", "section / n° parcelle");
assert(parcelle.surfaceTerrainM2 === 850, "surface terrain cadastrale");

const bati = choisirBatimentPrincipal(
  [{ geometry: carre, properties: { usage_1: "Résidentiel" } }],
  46.9105,
  4.7505,
);
assert(bati?.empriseSolM2 > 0, "emprise au sol bâtie");

const maintenant = new Date("2026-09-15");
assert(dansLesCinqDernieresAnnees({ date_mutation: "2023-04-01" }, maintenant), "DVF 2023 inclus");
assert(!dansLesCinqDernieresAnnees({ date_mutation: "2019-01-01" }, maintenant), "DVF 2019 exclu");
assert(prixM2Mutation({ valeur_fonciere: 185000, surface_reelle_bati: 100 }) === 1850, "prix/m² DVF");

const dvf = selectionnerMutationsDvf(
  [
    {
      date_mutation: "2024-06-01",
      valeur_fonciere: 200000,
      surface_reelle_bati: 100,
      type_local: "Maison",
      id_parcelle: "71173AB0012",
      adresse_nom_voie: "Rue des Tilleuls",
    },
    {
      date_mutation: "2018-06-01",
      valeur_fonciere: 90000,
      surface_reelle_bati: 100,
      type_local: "Maison",
      id_parcelle: "71173AB0012",
    },
  ],
  { idu: "71173AB0012" },
);
assert(dvf.mutations.length === 1, "une seule mutation sur 5 ans");
assert(dvf.perimetre === "parcelle", "périmètre parcelle");
assert(dvf.prixM2Median === 2000, "médiane 2000 €/m²");

const risques = normaliserResumeGeorisques({
  rga: { data: [{ exposition: "Moyen" }] },
  sismique: { data: [{ zone_sismicite: 2, libelle: "Zone 2" }] },
  radon: { data: [{ classe_potentiel: "3", libelle: "Potentiel fort" }] },
  gaspar: { data: [{ libelle_risque_long: "Inondation par une crue" }] },
});
assert(risques.rga.niveau === "Moyen", "RGA");
assert(risques.inondation.expose === true, "inondation");
assert(risques.sismicite.zone === 2, "sismicité");
assert(/fort/i.test(risques.radon.niveau), "radon");

assert(pointValide(46.91, 4.75), "Chagny valide");
assert(!pointValide(0, 0), "hors France rejeté");

const plusValue = calculerPlusValueVenale({
  surfaceHabitable: 164,
  prixM2Constate: 1850,
  gainClasses: 2,
  dpeActuel: "F",
});
assert(plusValue.montant >= 50000 && plusValue.montant <= 56000, `plus-value ~53 k€, obtenu ${plusValue.montant}`);
const roiEx = calculerRoiProprietaire(53000, 23767);
assert(roiEx.pourcentage >= 220 && roiEx.pourcentage <= 226, `ROI ~223 %, obtenu ${roiEx.pourcentage}`);

const edition = editionVide();
edition.client.surfaceHabitable = "164";
edition.valorisation.dpeActuel = "F";
edition.aides.profil = "violet";
edition.aides.gainClasses = 2;
edition.aides.region = "AURA";
edition.travaux = [
  {
    id: "c1",
    nom: "Isolation des combles perdus",
    familleId: "isolation",
    quantite: 60,
    unite: "m²",
    puHt: 50,
    tauxTva: 0.055,
  },
  {
    id: "p1",
    nom: "PAC air/eau",
    familleId: "chauffage",
    quantite: 1,
    unite: "u",
    puHt: 18000,
    tauxTva: 0.055,
  },
];
const surfaces = extraireSurfaceTravaux(edition);
assert(surfaces.surfaceHabitable === 164, "surface fiche client");
const tunnel = calculerTunnelProptech(edition, { prixM2Constate: 1850, dpeActuel: "F" });
assert(tunnel.totaux.totalTtc > tunnel.totaux.totalHt, "TTC > HT");
assert(tunnel.resteACharge === Math.round((tunnel.totaux.totalTtc - tunnel.aides.totalAides + Number.EPSILON) * 100) / 100, "RAC = TTC − aides");
assert(tunnel.ecoPtzAuto.montant <= 50000, "Éco-PTZ plafonné");
assert(tunnel.ecoPtzAuto.duree === 15 || tunnel.ecoPtzAuto.duree === 20, "durée 15 ou 20 ans");
assert(/indicatif/i.test(tunnel.mentionAides), "disclaimer aides");

const auto = ecoPtzAutomatique(12000);
assert(auto.montant === 12000 && auto.duree === 15, "Éco-PTZ 15 ans sous 25 k€");
assert(auto.mensualite === 66.67, `mensualité 0 % ${auto.mensualite}`);
assert(auto.canal === CANAL_ECO_PTZ_ETAT.id, "Éco-PTZ canal 1 État");
assert(!/FABIEN|VIVONS/i.test(tunnel.canauxFinancement.ecoPtz.rappel), "tunnel : Éco-PTZ sans courtier");
assert(tunnel.canauxFinancement.pretTravaux.id === CANAL_PRET_TRAVAUX_FABIEN.id, "tunnel : canal 2 Fabien");

const snapPart = snapshotProptech({
  dossierId: "demo-pereira",
  edition: { ...edition, finances: { coutMaterielHt: 8000, coutPoseRgeHt: 9000, tauxCommission: 10 } },
  role: ROLE_PARTENAIRE,
  tunnel,
});
assert(snapPart.edition.finances.coutClyveHt == null, "partenaire : pas de coût Clyve");
assert(snapPart.controles.financesInternesIncluses === false, "flag finances masqué partenaire");

const snapCom = snapshotProptech({
  dossierId: "demo-pereira",
  edition: { ...edition, finances: { coutMaterielHt: 8000, coutPoseRgeHt: 9000, tauxCommission: 10 } },
  role: ROLE_COMMERCIAL,
});
assert(snapCom.edition.finances.coutPoseRgeHt == null, "commercial : pas de pose RGE");

const snapAdmin = snapshotProptech({
  dossierId: "demo-pereira",
  edition: { ...edition, finances: { coutMaterielHt: 8000, coutPoseRgeHt: 9000, tauxCommission: 10 } },
  role: ROLE_ADMIN,
});
assert(snapAdmin.edition.finances.coutMaterielHt === 8000, "admin conserve les coûts");
assert(snapAdmin.controles.financesInternesIncluses === true, "flag admin");

const pereira = projectionWowPourDossier("demo-pereira");
assert(pereira.vues.length >= 2 && pereira.vues[0].avantSrc.includes("pereira"), "Pereira lié");
const brunel = projectionWowPourDossier(BRUNEL_DOSSIER_ID);
assert(brunel.dossierId === BRUNEL_DOSSIER_ID, "Brunel lié");

console.log("OK — PropTech : cadastre / DVF / géorisques / tunnel / sauvegarde / projections WOW.");
