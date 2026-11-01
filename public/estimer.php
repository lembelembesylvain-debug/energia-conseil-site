<?php
/**
 * Notification leads — catarinamartins-immobilier.fr
 * Email public : contact@catarinamartins-immobilier.fr
 * Redirection automatique des alertes : lembelembe.sylvain@gmail.com
 */
header("Content-Type: application/json; charset=utf-8");
header("X-Content-Type-Options: nosniff");

if (($_SERVER["REQUEST_METHOD"] ?? "") !== "POST") {
  http_response_code(405);
  echo json_encode(["ok" => false, "error" => "Méthode non autorisée."]);
  exit;
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);
if (!is_array($data) || $data === []) {
  $data = $_POST;
}

function champ($data, $cle) {
  $valeur = isset($data[$cle]) ? $data[$cle] : "";
  return is_string($valeur) ? trim($valeur) : (is_numeric($valeur) ? (string) $valeur : "");
}

function propre($valeur) {
  return str_replace(["\r", "\n", "\0"], " ", $valeur);
}

function taille($valeur) {
  return function_exists("mb_strlen") ? mb_strlen($valeur) : strlen($valeur);
}

$prenom = propre(champ($data, "prenom"));
$nom = propre(champ($data, "nom"));
$email = strtolower(propre(champ($data, "email")));
$telephone = propre(champ($data, "telephone"));
$adresse = propre(champ($data, "adresse"));
$jour = propre(champ($data, "jour"));
$creneau = propre(champ($data, "creneau"));
$typeBien = propre(champ($data, "typeBien"));
$dpe = propre(champ($data, "dpe"));
$chauffage = propre(champ($data, "chauffage"));
$commune = propre(champ($data, "commune"));
$surface = (int) champ($data, "surface");
$scenarios = champ($data, "scenariosResume");
$consentement = !empty($data["consentement"]);
$souhaitAudit = !empty($data["souhaitAudit"]);
$formule = propre(champ($data, "formule"));
$formuleLabel = propre(champ($data, "formuleLabel"));
$projet = propre(champ($data, "projet"));
$dateIso = propre(champ($data, "dateIso"));
$dpeActuel = propre(champ($data, "dpeActuel"));
$dpeCible = propre(champ($data, "dpeCible"));
$energieDepart = propre(champ($data, "energieDepart"));
$aidesAnahLabel = propre(champ($data, "aidesAnahLabel"));
$calendarUrl = propre(champ($data, "calendarUrl"));

if (taille($prenom) < 2 || taille($nom) < 2 || !filter_var($email, FILTER_VALIDATE_EMAIL) || taille($adresse) < 8 || !$consentement) {
  http_response_code(400);
  echo json_encode(["ok" => false, "error" => "Données incomplètes."]);
  exit;
}

$destinataire = "lembelembe.sylvain@gmail.com";
$creneauLib = $creneau === "apres-midi" ? "Après-midi" : ($creneau === "matin" ? "Matin" : str_replace(":", "h", $creneau));
$auditLigne = $souhaitAudit ? "oui (dès 990 € TTC, MaPrimeRénov’ jusqu’à 500 € à titre indicatif)" : "non";
$classe = ($dpeActuel !== "" && $dpeCible !== "") ? ($dpeActuel . " → " . $dpeCible) : $dpe;
$energie = $energieDepart !== "" ? $energieDepart : $chauffage;
$aides = $aidesAnahLabel !== "" ? $aidesAnahLabel : "non calculées";
if ($calendarUrl === "") {
  $calendarUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" . rawurlencode("RDV Pré-qualification Catarina et Sylvain — " . $prenom . " " . $nom) . "&ctz=Europe/Paris";
}

$sujet = "[NOUVEAU RDV VITRINE CHAGNY] - Consultation Duo 390 € - " . $prenom . " " . $nom;
$formuleLigne = $formuleLabel !== "" ? $formuleLabel : $formule;
$corps = "NOUVEAU RDV VITRINE CHAGNY\n"
  . "Consultation Duo 390 € TTC — pré-qualification 15 min d’abord\n\n"
  . "DATE ET HEURE\n"
  . "Date : {$jour}\n"
  . "Heure : {$creneauLib}\n\n"
  . "COORDONNÉES DU PROPRIÉTAIRE\n"
  . "Nom : {$nom}\n"
  . "Prénom : {$prenom}\n"
  . "Téléphone : {$telephone}\n"
  . "E-mail : {$email}\n"
  . "Adresse du bien : {$adresse}\n"
  . "Formule : {$formuleLigne}\n"
  . "Projet : {$projet}\n"
  . "Audit réglementaire souhaité : {$auditLigne}\n\n"
  . "COCKPIT\n"
  . "Énergie de départ : {$energie}\n"
  . "Classe visée : {$classe}\n"
  . "Aides Anah estimées : {$aides}\n"
  . "Type : {$typeBien} · {$surface} m²\n\n"
  . "AGENDA\n"
  . $calendarUrl . "\n\n"
  . "SCÉNARIOS (simulation illustrative)\n"
  . $scenarios . "\n\n"
  . "Aides financières 2026 (estimation à titre indicatif). Aides à valider selon revenus réels du client et éligibilité en vigueur. Montants définitifs après instruction ANAH et CEE.\n";

$entetes = "MIME-Version: 1.0\r\n"
  . "Content-Type: text/plain; charset=UTF-8\r\n"
  . "From: Vitrine catarinamartins-immobilier.fr <noreply@immobilier-chagny.fr>\r\n"
  . "Reply-To: {$email}\r\n"
  . "X-Mailer: catarinamartins-immobilier.fr\r\n";

$ok = @mail($destinataire, "=?UTF-8?B?" . base64_encode($sujet) . "?=", $corps, $entetes);

if (!$ok) {
  http_response_code(202);
  echo json_encode(["ok" => true, "delivered" => false, "reason" => "mail() indisponible"]);
  exit;
}

echo json_encode(["ok" => true, "delivered" => true]);
