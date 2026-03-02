#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script de génération d'un fichier Excel à UN SEUL onglet pour l'import HubSpot CRM.
HubSpot n'accepte qu'une seule feuille par fichier.
Commercial rénovation énergétique - Damien
"""

import sys
import io

# Fix encodage console Windows pour les caractères accentués et emojis
if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

# =============================================================================
# DONNÉES DES 8 CLIENTS (Deals + Contacts + Statut + Notes)
# =============================================================================

CLIENTS = [
    {
        "nom_deal": "FONTANAY Stéphanie - Rénovation globale",
        "montant_ttc": 64063,
        "date_cloture": "2026-03-27",
        "profil": "BLEU",
        "aides": 39900,
        "reste_charge": 24163,
        "mensualite": "134 €/mois",
        "bilan_mensuel": "+41 €/mois (autofinancé)",
        "dpe_actuel": "F",
        "dpe_vise": "C",
        "gain_dpe": "+3 classes",
        "travaux": "ITE 103,8m², isolation plancher 46m², menuiseries, PAC Air/Eau 6kW, ballon thermo",
        "economies_an": 2100,
        "plus_value": 40000,
        "urgence": "HAUTE",
        "statut_particulier": "Devis expire 27/03",
        "prenom": "Stéphanie",
        "nom_contact": "FONTANAY",
        "email": "fontanay-stephanie@orange.fr",
        "telephone": "06 59 38 97 49",
        "adresse": "167 Rue des Acacias",
        "ville": "MONTROND-LES-BAINS",
        "code_postal": "42210",
        "notes": "Artisans: HB FACADIER, ECO SYSTÈME DURABLE",
    },
    {
        "nom_deal": "GUION Quentin & Romane - ITI écologique",
        "montant_ttc": 58000,
        "date_cloture": "2026-03-24",
        "profil": "ROSE",
        "aides": 20400,
        "reste_charge": 37600,
        "mensualite": "209 €/mois",
        "bilan_mensuel": "+41 €/mois (autofinancé)",
        "dpe_actuel": "F",
        "dpe_vise": "B",
        "gain_dpe": "+4 classes",
        "travaux": "ITI fibre bois/ouate 100m², plancher 80m², menuiseries, VMC double flux, PAC Air/Eau 8-10kW, ballon thermo",
        "economies_an": 3000,
        "plus_value": 40000,
        "urgence": "MOYENNE",
        "statut_particulier": "Acquisition en cours - Visite technique samedi 14h30",
        "prenom": "Quentin & Romane",
        "nom_contact": "GUION",
        "email": "quentin-guion@hotmail.fr",
        "telephone": "",
        "adresse": "",
        "ville": "",
        "code_postal": "",
        "notes": "Artisans: 2C ENERGIES, ECO SYSTÈME DURABLE - Bien en cours d'acquisition",
    },
    {
        "nom_deal": "ROYER Maixent - Rénovation toiture",
        "montant_ttc": 52000,
        "date_cloture": "2026-04-30",
        "profil": "JAUNE",
        "aides": 25550,
        "reste_charge": 26450,
        "mensualite": "",
        "bilan_mensuel": "N/A",
        "dpe_actuel": "G",
        "dpe_vise": "D",
        "gain_dpe": "+3 classes",
        "travaux": "Isolation toiture 80m² + couverture, PAC Air-Air 3 splits Daikin, ballon thermo 200L, 5 fenêtres + 2 portes, zinguerie",
        "economies_an": 0,
        "plus_value": 0,
        "urgence": "TRÈS HAUTE",
        "statut_particulier": "DEVIS EXPIRÉ (15/12/2025) - Mise à jour urgente",
        "prenom": "Maixent",
        "nom_contact": "ROYER",
        "email": "À compléter",
        "telephone": "À compléter",
        "adresse": "6 route de Marcilly",
        "ville": "CHALAIN D'UZOR",
        "code_postal": "42600",
        "notes": "Mettre à jour devis ECO SOLUTION - Compléter coordonnées - Consommation -68%",
    },
    {
        "nom_deal": "YANG Simiao & LIU Ke - Rénovation globale",
        "montant_ttc": 120743,
        "date_cloture": "2026-03-24",
        "profil": "BLEU",
        "aides": 67500,
        "reste_charge": 53243,
        "mensualite": "346 €/mois (2 ans) puis 208 €/mois",
        "bilan_mensuel": "-121 €/mois (2 ans) puis +17 €/mois",
        "dpe_actuel": "F/G",
        "dpe_vise": "B",
        "gain_dpe": "+5 classes",
        "travaux": "ITE 332m² (maison+garage), rampants 138m², plancher 75m², PAC Air/Eau 17kW, VMC hygro B, ballon 240L",
        "economies_an": 2650,
        "plus_value": 60000,
        "urgence": "HAUTE",
        "statut_particulier": "Devis expire 24/03 - VMC à sélectionner",
        "prenom": "Simiao & Ke",
        "nom_contact": "YANG-LIU",
        "email": "yespace2016@gmail.com",
        "telephone": "07 64 42 85 25",
        "adresse": "18 Parc des Chavannes",
        "ville": "COLLONGES-AU-MONT-D'OR",
        "code_postal": "69660",
        "notes": "Sélectionner artisan VMC (budget 2000€) - Adresse fiscale: 11A Rue Richelieu 69100 VILLEURBANNE - Artisans: HB FACADIER, CRYD'ZOLATION",
    },
    {
        "nom_deal": "SEUX Laurent - Rénovation globale",
        "montant_ttc": 70391,
        "date_cloture": "2026-03-27",
        "profil": "JAUNE",
        "aides": 39000,
        "reste_charge": 31391,
        "mensualite": "174 €/mois",
        "bilan_mensuel": "+6 €/mois (autofinancé)",
        "dpe_actuel": "F",
        "dpe_vise": "B",
        "gain_dpe": "+4 classes",
        "travaux": "ITE 78,25m², combles 56m², 6 fenêtres + 2 portes-fenêtres + 1 porte, PAC Air/Eau, VMC hygro B, désembouage, électricité",
        "economies_an": 1950,
        "plus_value": 25000,
        "urgence": "HAUTE",
        "statut_particulier": "Devis expire 27/03 - Artisans à finaliser",
        "prenom": "Laurent",
        "nom_contact": "SEUX",
        "email": "",
        "telephone": "",
        "adresse": "4 Rue Georges Laurent",
        "ville": "LA RICAMARIE",
        "code_postal": "42150",
        "notes": "Commercial: FABIEN 06 71 19 96 45 - Artisans: HB FACADIER, GABRIEL (RGE à vérifier), RICHARD NICOLAS (RGE à vérifier) - Audit MUTTA valable jusqu'au 06/08/2030",
    },
    {
        "nom_deal": "BRUNEL Emrick - Rénovation ITE (Indivision)",
        "montant_ttc": 71972,
        "date_cloture": "2026-04-25",
        "profil": "JAUNE",
        "aides": 39500,
        "reste_charge": 32472,
        "mensualite": "406 €/mois (10 ans)",
        "bilan_mensuel": "-256 €/mois",
        "dpe_actuel": "F",
        "dpe_vise": "D",
        "gain_dpe": "+2 classes",
        "travaux": "ITE 196m², combles 72m², plancher 48m², 1 porte-fenêtre + 4 fenêtres + volets solaires, VMC hygro, 5 splits PAC air/air, ballon thermo 200L",
        "economies_an": 1800,
        "plus_value": 30000,
        "urgence": "MOYENNE",
        "statut_particulier": "Indivision - Signatures de TOUS les copropriétaires requises",
        "prenom": "Emrick",
        "nom_contact": "BRUNEL",
        "email": "",
        "telephone": "",
        "adresse": "48 Impasse des Lagunes",
        "ville": "BUSSIÈRES",
        "code_postal": "42510",
        "notes": "Article 815 Code civil - Documents: attestation indivision, avis impôts tous indivisaires - Organiser réunion tous indivisaires - Zone H2a, altitude 523m - Artisan: HB FACADIER (ITE)",
    },
    {
        "nom_deal": "GRANGE Mathias - Rénovation ITI pisé",
        "montant_ttc": 52000,
        "date_cloture": "2026-04-30",
        "profil": "JAUNE",
        "aides": 27750,
        "reste_charge": 24250,
        "mensualite": "135 €/mois",
        "bilan_mensuel": "-27 €/mois (15 ans) puis +108 €/mois",
        "dpe_actuel": "G",
        "dpe_vise": "D/C",
        "gain_dpe": "+3/4 classes",
        "travaux": "Isolation combles 60m², ITI laine roche 100m² (murs pisé), 5 fenêtres + 5 volets solaires + porte, PAC Air-Air 5 splits, VMC hygro, ballon thermo 200L",
        "economies_an": 1300,
        "plus_value": 0,
        "urgence": "FAIBLE",
        "statut_particulier": "Rapport juridique validé par Julia (Juriste)",
        "prenom": "Mathias",
        "nom_contact": "GRANGE",
        "email": "",
        "telephone": "06 67 52 88 90",
        "adresse": "569 Chemin des Places",
        "ville": "MONTCHAL",
        "code_postal": "42360",
        "notes": "Zone H2c altitude 587m - Bâti ancien pisé/pierre 50cm - DPE N° ADEME 2442E2184253M (18/06/2024) - Incohérence DPE: combles suffisants mais travaux prévus / DPE recommande PAC Air/Eau mais projet Air/Air",
    },
    {
        "nom_deal": "RICHARD Paul - Reprise KAZEO",
        "montant_ttc": 56000,
        "date_cloture": "2026-08-21",
        "profil": "ROSE",
        "aides": 28606,
        "reste_charge": 27394,
        "mensualite": "272 €/mois (10 ans)",
        "bilan_mensuel": "272 €/mois (financement)",
        "dpe_actuel": "G",
        "dpe_vise": "A",
        "gain_dpe": "+6 classes",
        "travaux": "ITE 164m², combles 100m², PAC Air/Air 4 splits, ballon thermo 200L, VMC hygro B (menuiseries déjà posées par KAZEO fév 2025)",
        "economies_an": 2400,
        "plus_value": 80000,
        "urgence": "CRITIQUE",
        "statut_particulier": "Reprise KAZEO - KAZEO en redressement judiciaire",
        "prenom": "Paul",
        "nom_contact": "RICHARD",
        "email": "",
        "telephone": "",
        "adresse": "600 Route de la Goutte",
        "ville": "UNIAS",
        "code_postal": "42210",
        "notes": "Prime ANAH 28 606€ à sauver - Dossier MPR-2024-325139 - Deadline prime 21/08/2026 - Projet initial KAZEO devis #794 70 516€, acompte 20 577€ versé - Risque: perte 49 183€ si aucune action - Artisans: ECOM ENERGIE (ITE), ECO SYSTÈME DURABLE",
    },
]

# =============================================================================
# STYLES
# =============================================================================

THIN_BORDER = Border(
    left=Side(style="thin"),
    right=Side(style="thin"),
    top=Side(style="thin"),
    bottom=Side(style="thin"),
)

# Header bleu foncé #1F4E78
HEADER_FILL = PatternFill(start_color="1F4E78", end_color="1F4E78", fill_type="solid")

# Codes couleur Urgence (exactement comme demandé)
URGENCE_COLORS = {
    "CRITIQUE": PatternFill(start_color="FF0000", end_color="FF0000", fill_type="solid"),   # Rouge vif
    "TRÈS HAUTE": PatternFill(start_color="FF6B6B", end_color="FF6B6B", fill_type="solid"),  # Rouge
    "HAUTE": PatternFill(start_color="FFA500", end_color="FFA500", fill_type="solid"),       # Orange
    "MOYENNE": PatternFill(start_color="FFD700", end_color="FFD700", fill_type="solid"),     # Jaune
    "FAIBLE": PatternFill(start_color="90EE90", end_color="90EE90", fill_type="solid"),     # Vert clair
}


def apply_borders(ws, max_row, max_col):
    """Applique les bordures à une plage de cellules."""
    for row in range(1, max_row + 1):
        for col in range(1, max_col + 1):
            ws.cell(row=row, column=col).border = THIN_BORDER


def create_deals_sheet(wb):
    """Crée l'unique onglet DEALS avec toutes les colonnes HubSpot."""
    ws = wb.active
    ws.title = "Deals"

    # Ordre des colonnes exactement comme demandé
    headers = [
        "Nom du deal",
        "Montant TTC",
        "Date de clôture",
        "Étape du pipeline",
        "Profil MaPrimeRénov'",
        "Aides totales",
        "Reste à charge",
        "Mensualité",
        "Bilan mensuel",
        "DPE actuel",
        "DPE visé",
        "Gain DPE",
        "Travaux principaux",
        "Économies annuelles",
        "Plus-value estimée",
        "Urgence",
        "Statut particulier",
        "Prénom contact",
        "Nom contact",
        "Email contact",
        "Téléphone contact",
        "Adresse complète",
        "Ville",
        "Code postal",
        "Notes importantes",
    ]

    num_cols = len(headers)

    # Headers : gras, fond bleu foncé #1F4E78, texte blanc
    for col, header in enumerate(headers, 1):
        cell = ws.cell(row=1, column=col, value=header)
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = HEADER_FILL
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = THIN_BORDER

    # Colonnes montants (nombre pour HubSpot) : 2, 6, 7, 14, 15
    cols_montant = (2, 6, 7, 14, 15)

    for row_idx, c in enumerate(CLIENTS, 2):
        # Adresse complète = adresse + code postal + ville
        adresse_complete = " ".join(filter(None, [c["adresse"], c["code_postal"], c["ville"]])).strip()

        values = [
            c["nom_deal"],
            c["montant_ttc"],  # nombre pour import HubSpot
            c["date_cloture"],
            "presentationscheduled",
            c["profil"],
            c["aides"],
            c["reste_charge"],
            c["mensualite"],
            c["bilan_mensuel"],
            c["dpe_actuel"],
            c["dpe_vise"],
            c["gain_dpe"],
            c["travaux"],
            c["economies_an"],
            c["plus_value"],
            c["urgence"],
            c["statut_particulier"],
            c["prenom"],
            c["nom_contact"],
            c["email"],
            c["telephone"],
            adresse_complete,
            c["ville"],
            c["code_postal"],
            c["notes"],
        ]

        for col, val in enumerate(values, 1):
            cell = ws.cell(row=row_idx, column=col, value=val)
            if col in cols_montant and isinstance(val, (int, float)):
                cell.alignment = Alignment(horizontal="right")
                cell.number_format = '# ##0 €'  # séparateur de milliers + symbole €
            else:
                cell.alignment = Alignment(horizontal="left", wrap_text=True)

            # Colonne Urgence (col 16) : fond coloré
            if col == 16 and val in URGENCE_COLORS:
                cell.fill = URGENCE_COLORS[val]
                cell.alignment = Alignment(horizontal="center")

    # Bordures
    apply_borders(ws, len(CLIENTS) + 1, num_cols)

    # Largeurs de colonnes (auto-ajustées visuellement)
    widths = [
        38, 14, 14, 22, 10, 14, 14, 22, 28, 12, 10, 12, 50, 16, 16,
        12, 35, 18, 14, 28, 16, 38, 22, 10, 55
    ]
    for i, w in enumerate(widths, 1):
        if i <= num_cols:
            ws.column_dimensions[get_column_letter(i)].width = min(w, 55)


def main():
    """Point d'entrée principal."""
    print("Génération du fichier Excel HubSpot (1 onglet) en cours...")

    wb = Workbook()
    create_deals_sheet(wb)

    filename = "Damien_8_Clients_HubSpot_SIMPLE.xlsx"
    wb.save(filename)

    print()
    print("✅ Fichier créé : Damien_8_Clients_HubSpot_SIMPLE.xlsx")
    print("📊 8 clients prêts pour import HubSpot")
    print("📁 1 seul onglet - Compatible HubSpot ✓")


if __name__ == "__main__":
    main()
