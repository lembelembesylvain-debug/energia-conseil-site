import assert from "node:assert/strict";
import {
  departementDepuisCodePostal,
  logementDepuisLigneAdeme,
  requetePassoiresAdeme,
  urlLignesAdeme,
} from "./ademeDpe.js";
import {
  estMaisonIndividuelle,
  retenirEntrepriseAdresse,
  urlAnnuairePublic,
} from "./rechercheEntreprises.js";

assert.equal(departementDepuisCodePostal("20000"), "2A");
assert.equal(departementDepuisCodePostal("20137"), "2A");
assert.equal(departementDepuisCodePostal("20200"), "2B");
assert.equal(departementDepuisCodePostal("71000"), "71");

const corse = requetePassoiresAdeme({ codeDepartement: "2A", typeBatiment: "individuel" });
assert.equal(corse.dataset, "dpe03existant");
assert.match(corse.qs, /etiquette_dpe:\(F OR G\)/);
assert.match(corse.qs, /code_departement_ban:"2A"/);
assert.match(corse.qs, /type_batiment:"maison"/);
assert.equal(corse.size, 50);

const ajaccio = requetePassoiresAdeme({ codeDepartement: "2A", codePostal: "20000", typeBatiment: "individuel" });
assert.match(ajaccio.qs, /code_postal_ban:20000/);
assert.doesNotMatch(ajaccio.qs, /code_departement_ban/);

const tertiaire = requetePassoiresAdeme({ codeDepartement: "2B", typeBatiment: "tertiaire" });
assert.equal(tertiaire.dataset, "dpe01tertiaire");
assert.doesNotMatch(tertiaire.qs, /type_batiment/);
assert.match(urlLignesAdeme(ajaccio), /datasets\/dpe03existant\/lines/);

const ligne = logementDepuisLigneAdeme({
  numero_dpe: "2620E2657758L",
  etiquette_dpe: "F",
  adresse_ban: "4 Stretta di a Caserna 20115 Piana",
  code_postal_ban: "20115",
  nom_commune_ban: "Piana",
  annee_construction: 1972,
  surface_habitable_logement: 58,
  conso_5_usages_par_m2_ep: 348,
  type_batiment: "maison",
  type_energie_principale_chauffage: "Électricité",
  date_etablissement_dpe: "2026-10-18",
  _geopoint: "42.23,8.63",
});
assert.equal(ligne.id, "2620E2657758L");
assert.equal(ligne.etiquette_dpe, "F");
assert.equal(ligne.conso_energie, 348);
assert.equal(ligne.annee_construction, 1972);

const societe = retenirEntrepriseAdresse(
  [
    {
      siren: "353523707",
      nom_complet: "SCI FLEURS D'AJACCIO",
      dirigeants: [{ nom: "FLORI", prenoms: "GUY ANTOINE", qualite: "Gérant", type_dirigeant: "personne physique" }],
      siege: {
        adresse: "9 RES DU PARC BELVEDERE 20000 AJACCIO",
        code_postal: "20000",
        numero_voie: "9",
        libelle_voie: "DU PARC BELVEDERE",
        libelle_commune: "AJACCIO",
      },
    },
    {
      siren: "111111111",
      nom_complet: "AUTRE SCI",
      dirigeants: [{ nom: "MARTIN", prenoms: "PAUL", type_dirigeant: "personne physique" }],
      siege: { adresse: "2 RUE DES MIMOSAS 20000 AJACCIO", code_postal: "20000", numero_voie: "2", libelle_voie: "DES MIMOSAS" },
    },
  ],
  { adresse: "9 Résidence du Parc Belvédère, 20000 Ajaccio", codePostal: "20000" },
);
assert.equal(societe.siren, "353523707");
assert.equal(societe.denomination, "SCI FLEURS D'AJACCIO");
assert.match(societe.dirigeant, /GUY ANTOINE FLORI/);

assert.equal(
  retenirEntrepriseAdresse(
    [{ siren: "222222222", nom_complet: "LOIN", siege: { adresse: "1 RUE X 69001 LYON", code_postal: "69001" } }],
    { adresse: "9 Résidence du Parc Belvédère, 20000 Ajaccio", codePostal: "20000" },
  ),
  null,
);

assert.equal(estMaisonIndividuelle("Maison individuelle"), true);
assert.equal(estMaisonIndividuelle("collectif"), false);
assert.match(urlAnnuairePublic("9 Résidence du Parc Belvédère, 20000 Ajaccio"), /pagesjaunes\.fr\/pagesblanches/);

console.log("verify-sources-etat: ok");
