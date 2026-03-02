#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GÉNÉRATEUR AUTOMATIQUE DE PACK COMPLET CLIENT - ENERGIA-CONSEIL IA®
Génère 3 documents PDF : Audit Énergétique | Rapport Technique | Devis Chiffré
"""

import sys
import io
import os
import argparse
from datetime import datetime

if sys.platform == "win32":
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    Image, Frame, PageTemplate
)
from reportlab.pdfgen import canvas

# =============================================================================
# CHARTE GRAPHIQUE ENERGIA-CONSEIL IA®
# =============================================================================

C = {
    "bleu_fonce": colors.HexColor("#1F4E78"),
    "bleu_clair": colors.HexColor("#4472C4"),
    "orange": colors.HexColor("#ED7D31"),
    "vert": colors.HexColor("#70AD47"),
    "rouge": colors.HexColor("#C00000"),
    "jaune": colors.HexColor("#FFC000"),
    "gris": colors.HexColor("#595959"),
    "blanc": colors.HexColor("#FFFFFF"),
    "rouge_vif": colors.HexColor("#FF0000"),
    "rouge_clair": colors.HexColor("#FF6B6B"),
    "orange_clair": colors.HexColor("#FFA500"),
    "jaune_clair": colors.HexColor("#FFD700"),
    "vert_clair": colors.HexColor("#90EE90"),
}

PROFIL_COLORS = {
    "BLEU": C["bleu_clair"],
    "JAUNE": C["jaune"],
    "VIOLET": colors.HexColor("#7030A0"),
    "ROSE": colors.HexColor("#FF66CC"),
}

URGENCE_COLORS = {
    "CRITIQUE": C["rouge_vif"],
    "TRÈS HAUTE": C["rouge_clair"],
    "HAUTE": C["orange_clair"],
    "MOYENNE": C["jaune_clair"],
    "FAIBLE": C["vert_clair"],
}

ENTREPRISE = {
    "nom": "ENERGIA-CONSEIL IA®",
    "adresse": "16 Rue Cuvier, 69006 Lyon",
    "telephone": "06 10 59 68 98",
    "email": "contact@energia-conseil.com",
    "siret": "94181942700019",
}

TAUX_MAPR = {"BLEU": 80, "JAUNE": 60, "VIOLET": 45, "ROSE": 30}
PLAFOND_MAPR = {"BLEU": 70000, "JAUNE": 52500, "VIOLET": 42000, "ROSE": 21000}
TVA_REDUITE = 0.055


def format_euro(val):
    return f"{int(val):,} €".replace(",", " ")


def calculer_profil(rfr, parts):
    """Détermine le profil MaPrimeRénov' selon plafonds 2026 (hors IDF)."""
    plafonds = {
        (1,): {"BLEU": 17363, "JAUNE": 22259, "VIOLET": 31185},
        (2,): {"BLEU": 25393, "JAUNE": 32553, "VIOLET": 45842},
        (3,): {"BLEU": 30540, "JAUNE": 39148, "VIOLET": 55196},
        (4,): {"BLEU": 35676, "JAUNE": 45735, "VIOLET": 64550},
        (5,): {"BLEU": 40835, "JAUNE": 52348, "VIOLET": 73907},
    }
    p = min(int(parts), 5)
    pc = plafonds.get((p,), plafonds[(5,)])
    if rfr <= pc["BLEU"]:
        return "BLEU", "Très modestes", 80
    if rfr <= pc["JAUNE"]:
        return "JAUNE", "Modestes", 60
    if rfr <= pc["VIOLET"]:
        return "VIOLET", "Intermédiaires", 45
    return "ROSE", "Aisés", 30


def calculer_aides(profil, total_ht, aides_custom=None):
    if aides_custom:
        return aides_custom
    taux = TAUX_MAPR.get(profil, 60)
    plafond = PLAFOND_MAPR.get(profil, 52500)
    mapr = min(total_ht * taux / 100, plafond)
    cee = 6500 if profil in ("BLEU", "JAUNE") else 3500
    region = 1500
    total = mapr + cee + region
    return {"mapr": mapr, "cee": cee, "region": region, "total": total}


# =============================================================================
# FOOTER CANVAS
# =============================================================================

def add_footer(canvas, doc, footer_band_color=None):
    canvas.saveState()
    page_num = getattr(doc, "page", 0) or 0
    if footer_band_color:
        canvas.setFillColor(footer_band_color)
        canvas.rect(0, 0, A4[0], 30, fill=1, stroke=0)
    canvas.setFillColor(C["blanc"] if footer_band_color else C["gris"])
    canvas.setFont("Helvetica", 8)
    canvas.drawString(50, 12, f"{ENTREPRISE['nom']} | SIRET {ENTREPRISE['siret']} | {ENTREPRISE['telephone']}")
    canvas.drawRightString(A4[0] - 50, 12, f"Page {page_num}")
    canvas.drawCentredString(A4[0] / 2, 12, "© 2026 ENERGIA-CONSEIL IA - Tous droits réservés")
    canvas.restoreState()


# =============================================================================
# DOCUMENT 1 : AUDIT ÉNERGÉTIQUE
# =============================================================================

def create_audit_pdf(client, output_path):
    story = []
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="TitreAudit", fontName="Helvetica-Bold", fontSize=18, textColor=C["blanc"], alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="SousTitre", fontName="Helvetica-Bold", fontSize=14, textColor=C["blanc"], alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="TexteBlanc", fontName="Helvetica", fontSize=11, textColor=C["blanc"], alignment=TA_CENTER))
    styles.add(ParagraphStyle(name="Section", fontName="Helvetica-Bold", fontSize=14, textColor=C["bleu_fonce"]))
    styles.add(ParagraphStyle(name="NormalGris", fontName="Helvetica", fontSize=10, textColor=C["gris"]))

    postes = client.get("postes", [])
    total_ttc = sum(p.get("montant_ttc", 0) for p in postes)
    total_ht = total_ttc / (1 + TVA_REDUITE)
    profil, categorie, pct = calculer_profil(client.get("rfr", 25000), client.get("parts", 2))
    if client.get("profil"):
        profil = client["profil"]
        categorie = client.get("categorie", "")
        pct = client.get("pct_aides", 80)
    aides = calculer_aides(profil, total_ht, client.get("aides_custom"))
    reste = total_ttc - aides["total"]
    mensualite = reste / 180 if reste > 0 else 0
    economies_mois = client.get("economies_mois", 150)
    gain_net = economies_mois - mensualite

    # PAGE 1 - COUVERTURE (simulée avec tableau plein)
    cover_data = [
        ["ENERGIA-CONSEIL IA®", ""],
        ["AUDIT ÉNERGÉTIQUE", ""],
        ["RÉNOVATION GLOBALE PERFORMANTE", ""],
        ["", ""],
        [client.get("nom_complet", "Client"), ""],
        [client.get("adresse_bien", ""), ""],
        [f"Profil MaPrimeRénov' : {profil} ({categorie})", ""],
        [datetime.now().strftime("%d/%m/%Y"), ""],
        [f"DPE {client.get('dpe_actuel','F')} → {client.get('dpe_vise','C')} | Reste à charge {format_euro(reste)} | Gain {format_euro(gain_net)}/mois", ""],
    ]
    t_cover = Table(cover_data, colWidths=[15*cm, 5*cm])
    t_cover.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["bleu_fonce"]),
        ("TEXTCOLOR", (0, 0), (-1, -1), C["blanc"]),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (0, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (0, 0), 12),
        ("FONTNAME", (0, 1), (0, 2), "Helvetica-Bold"),
        ("FONTSIZE", (0, 1), (0, 2), 16),
        ("FONTSIZE", (0, 4), (0, 4), 14),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 12),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
    ]))
    story.append(t_cover)
    story.append(PageBreak())

    # PAGE 2 - SOMMAIRE
    story.append(Paragraph("SOMMAIRE", styles["Section"]))
    story.append(Spacer(1, 0.5*cm))
    somm = [
        "I. Synthèse exécutive",
        "II. Contexte et situation actuelle",
        "III. Diagnostic actuel détaillé",
        "IV. Scénario de travaux retenu",
        "V. Aides financières",
        "VI. Financement",
        "VII. Résultats attendus",
        "VIII. Planning",
        "IX. Artisans RGE",
        "X. Méthodologie & limites",
    ]
    for s in somm:
        story.append(Paragraph(s, styles["NormalGris"]))
        story.append(Spacer(1, 0.2*cm))
    story.append(PageBreak())

    # PAGE 3 - SYNTHÈSE
    story.append(Paragraph("I. SYNTHÈSE EXÉCUTIVE", styles["Section"]))
    story.append(Spacer(1, 0.3*cm))

    ctx_data = [["Contexte", client.get("contexte", "Projet de rénovation énergétique")]]
    t_ctx = Table(ctx_data, colWidths=[19*cm])
    t_ctx.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["bleu_clair"]),
        ("TEXTCOLOR", (0, 0), (-1, -1), C["blanc"]),
        ("FONTNAME", (0, 0), (0, 0), "Helvetica-Bold"),
        ("BOX", (0, 0), (-1, -1), 0.5, C["bleu_fonce"]),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t_ctx)
    story.append(Spacer(1, 0.5*cm))

    sit_data = [
        ["Élément", "Valeur"],
        ["Surface habitable", f"{client.get('surface', 100)} m²"],
        ["DPE actuel", client.get("dpe_actuel", "F")],
        ["Consommation actuelle", f"{client.get('conso_avant', 280)} kWh/m²/an"],
        ["Facture énergie", f"{format_euro(client.get('facture_avant', 2800))}/an"],
    ]
    t_sit = Table(sit_data, colWidths=[6*cm, 8*cm])
    t_sit.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C["bleu_fonce"]),
        ("TEXTCOLOR", (0, 0), (-1, 0), C["blanc"]),
        ("BACKGROUND", (0, 1), (-1, -1), C["blanc"]),
        ("GRID", (0, 0), (-1, -1), 0.5, C["gris"]),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
    ]))
    story.append(t_sit)
    story.append(Spacer(1, 0.5*cm))

    rec_data = [["Recommandation ENERGIA-CONSEIL", f"Rénovation globale pour atteindre DPE {client.get('dpe_vise','C')}. Total travaux {format_euro(total_ttc)} TTC. Reste à charge estimé {format_euro(reste)}."]]
    t_rec = Table(rec_data, colWidths=[19*cm])
    t_rec.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["vert"]),
        ("TEXTCOLOR", (0, 0), (-1, -1), C["blanc"]),
        ("BOX", (0, 0), (-1, -1), 0.5, C["bleu_fonce"]),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t_rec)
    story.append(PageBreak())

    # PAGE 4 - DIAGNOSTIC
    story.append(Paragraph("DIAGNOSTIC ACTUEL DÉTAILLÉ", styles["Section"]))
    story.append(Spacer(1, 0.3*cm))
    diag_data = [
        ["Paroi", "Surface", "État", "Isolation actuelle"],
        ["Murs", f"{client.get('surface_ite', 100)} m²", "À améliorer", "Faible ou absente"],
        ["Combles", "Variable", "À améliorer", "Souvent insuffisante"],
        ["Plancher bas", f"{client.get('surface_plancher', 50)} m²", "À améliorer", "Absente"],
        ["Menuiseries", "6-8 ouvertures", "À remplacer", "Simple vitrage"],
    ]
    t_diag = Table(diag_data, colWidths=[4*cm, 4*cm, 5*cm, 6*cm])
    t_diag.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C["bleu_fonce"]),
        ("TEXTCOLOR", (0, 0), (-1, 0), C["blanc"]),
        ("BACKGROUND", (2, 1), (2, -1), C["jaune"]),
        ("GRID", (0, 0), (-1, -1), 0.5, C["gris"]),
    ]))
    story.append(t_diag)
    story.append(PageBreak())

    # PAGE 5 - SCÉNARIO
    story.append(Paragraph("SCÉNARIO DE TRAVAUX RETENU", styles["Section"]))
    poste_rows = [["N°", "Poste", "Montant HT"]]
    for p in postes:
        ht = p.get("montant_ttc", 0) / (1 + TVA_REDUITE)
        poste_rows.append([str(p.get("numero", 0)), p.get("nom", ""), format_euro(ht)])
    poste_rows.append(["", "TOTAL HT", format_euro(total_ht)])
    poste_rows.append(["", "TOTAL TTC", format_euro(total_ttc)])
    t_postes = Table(poste_rows, colWidths=[2*cm, 12*cm, 5*cm])
    t_postes.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C["bleu_fonce"]),
        ("TEXTCOLOR", (0, 0), (-1, 0), C["blanc"]),
        ("BACKGROUND", (0, -2), (-1, -1), C["bleu_clair"]),
        ("TEXTCOLOR", (0, -2), (-1, -1), C["blanc"]),
        ("FONTNAME", (0, -2), (-1, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, C["gris"]),
    ]))
    story.append(t_postes)
    story.append(PageBreak())

    # PAGE 6 - AIDES
    story.append(Paragraph("AIDES FINANCIÈRES", styles["Section"]))
    aides_rows = [
        ["Aide", "Montant"],
        ["MaPrimeRénov' Parcours Accompagné", format_euro(aides["mapr"])],
        ["CEE", format_euro(aides["cee"])],
        ["Région Auvergne-Rhône-Alpes", format_euro(aides["region"])],
        ["TOTAL AIDES", format_euro(aides["total"])],
    ]
    t_aides = Table(aides_rows, colWidths=[12*cm, 5*cm])
    t_aides.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C["bleu_fonce"]),
        ("TEXTCOLOR", (0, 0), (-1, 0), C["blanc"]),
        ("BACKGROUND", (0, -1), (-1, -1), C["vert"]),
        ("TEXTCOLOR", (0, -1), (-1, -1), C["blanc"]),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, C["gris"]),
    ]))
    story.append(t_aides)
    story.append(Spacer(1, 0.5*cm))

    clause = (
        "⚠️ CLAUSE JURIDIQUE - Les montants d'aides indiqués sont des ESTIMATIONS à titre INDICATIF. "
        "Ils devront être validés par le MAR et l'ANAH. ENERGIA-CONSEIL s'engage à maximiser les aides "
        "mais ne peut garantir les montants avant validation officielle."
    )
    clause_data = [[clause]]
    t_clause = Table(clause_data, colWidths=[19*cm])
    t_clause.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["orange"]),
        ("TEXTCOLOR", (0, 0), (-1, -1), C["blanc"]),
        ("BOX", (0, 0), (-1, -1), 0.5, C["rouge"]),
        ("FONTNAME", (0, 0), (0, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (0, 0), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(t_clause)
    story.append(Paragraph(f"<b>RESTE À CHARGE : {format_euro(reste)}</b>", styles["NormalGris"]))
    story.append(PageBreak())

    # PAGE 7 - FINANCEMENT
    story.append(Paragraph("FINANCEMENT - Éco-PTZ", styles["Section"]))
    fin_data = [[
        f"Éco-PTZ 0% - Montant : {format_euro(reste)} - Durée : 15 ans - Mensualité : {format_euro(mensualite)}/mois\n"
        f"Bilan : Économies {format_euro(economies_mois)}/mois - Mensualité {format_euro(mensualite)}/mois = "
        f"Gain net {'+' if gain_net >= 0 else ''}{format_euro(gain_net)}/mois"
    ]]
    t_fin = Table(fin_data, colWidths=[19*cm])
    t_fin.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["bleu_clair"]),
        ("TEXTCOLOR", (0, 0), (-1, -1), C["blanc"]),
        ("BOX", (0, 0), (-1, -1), 0.5, C["bleu_fonce"]),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(t_fin)
    if gain_net < 0:
        story.append(Spacer(1, 0.3*cm))
        comp = f"Bilan négatif compensé par plus-value {format_euro(client.get('plus_value', 0))} et DPE {client.get('dpe_vise','C')}"
        story.append(Paragraph(comp, styles["NormalGris"]))
    story.append(PageBreak())

    # PAGE 8 - RÉSULTATS
    story.append(Paragraph("RÉSULTATS ATTENDUS", styles["Section"]))
    res_data = [
        ["Indicateur", "Avant", "Après"],
        ["DPE", client.get("dpe_actuel", "F"), client.get("dpe_vise", "C")],
        ["Consommation kWh/m²/an", str(client.get("conso_avant", 280)), str(client.get("conso_apres", 110))],
        ["Facture annuelle", format_euro(client.get("facture_avant", 2800)), format_euro(client.get("facture_apres", 700))],
        ["Économies", "-", f"{format_euro(client.get('economies_an', 2100))}/an"],
        ["Plus-value", "-", f"+{format_euro(client.get('plus_value', 40000))}"],
    ]
    t_res = Table(res_data, colWidths=[6*cm, 5*cm, 5*cm])
    t_res.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C["bleu_fonce"]),
        ("TEXTCOLOR", (0, 0), (-1, 0), C["blanc"]),
        ("BACKGROUND", (0, 1), (0, 1), C["rouge_clair"]),
        ("BACKGROUND", (0, 2), (0, 2), C["vert_clair"]),
        ("GRID", (0, 0), (-1, -1), 0.5, C["gris"]),
    ]))
    story.append(t_res)
    story.append(PageBreak())

    # PAGE 9 - PLANNING
    story.append(Paragraph("PLANNING", styles["Section"]))
    plan_data = [
        ["Phase", "Durée", "Activité"],
        ["Phase 1", "2 sem.", "Administrative - Dossier MPR, Éco-PTZ"],
        ["Phase 2", "6 sem.", "Travaux d'enveloppe (ITE, menuiseries)"],
        ["Phase 3", "4 sem.", "Chauffage, ventilation, finitions"],
        ["Phase finale", "1 j", "Réception + PV + DPE post-travaux"],
    ]
    t_plan = Table(plan_data, colWidths=[4*cm, 4*cm, 11*cm])
    t_plan.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C["bleu_fonce"]),
        ("TEXTCOLOR", (0, 0), (-1, 0), C["blanc"]),
        ("GRID", (0, 0), (-1, -1), 0.5, C["gris"]),
    ]))
    story.append(t_plan)
    story.append(PageBreak())

    # PAGE 10 - ARTISANS
    story.append(Paragraph("ARTISANS RGE", styles["Section"]))
    art_rows = [["Entreprise", "Contact", "Certification"]]
    for p in postes:
        a = p.get("artisan", "")
        if a and a != "ENERGIA-CONSEIL IA®":
            art_rows.append([a, p.get("contact", ""), p.get("certification", "RGE")])
    if len(art_rows) == 1:
        art_rows.append(["HB FACADIER", "07 68 05 74 26", "RGE E-E 109538"])
        art_rows.append(["ECO SYSTÈME DURABLE", "01 70 93 97 15", "RGE QualiPAC"])
    t_art = Table(art_rows, colWidths=[6*cm, 6*cm, 7*cm])
    t_art.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C["bleu_fonce"]),
        ("TEXTCOLOR", (0, 0), (-1, 0), C["blanc"]),
        ("GRID", (0, 0), (-1, -1), 0.5, C["gris"]),
    ]))
    story.append(t_art)
    story.append(PageBreak())

    # PAGE 11 - MÉTHODOLOGIE
    story.append(Paragraph("MÉTHODOLOGIE & LIMITES", styles["Section"]))
    story.append(Paragraph(
        "Méthode : Audit basé sur les données fournies, DPE existant et estimation des travaux selon barèmes MaPrimeRénov' 2026. "
        "Calcul des aides selon profil fiscal (RFR, parts).",
        styles["NormalGris"]
    ))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph(
        "Limites : Les montants d'aides sont indicatifs. La consommation réelle dépend du comportement des occupants. "
        "Les performances des équipements sont celles annoncées par les fabricants.",
        styles["NormalGris"]
    ))

    doc = SimpleDocTemplate(
        output_path, pagesize=A4,
        leftMargin=50, rightMargin=50, topMargin=60, bottomMargin=50
    )
    doc.build(story, onFirstPage=lambda c, d: add_footer(c, d, C["bleu_fonce"]),
              onLaterPages=lambda c, d: add_footer(c, d, C["bleu_fonce"]))


# =============================================================================
# DOCUMENT 2 : RAPPORT TECHNIQUE
# =============================================================================

def create_rapport_pdf(client, output_path):
    story = []
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Section", fontName="Helvetica-Bold", fontSize=14, textColor=C["bleu_fonce"]))
    styles.add(ParagraphStyle(name="Poste", fontName="Helvetica-Bold", fontSize=12, textColor=C["blanc"], backColor=C["bleu_clair"]))

    postes = client.get("postes", [])
    total_ttc = sum(p.get("montant_ttc", 0) for p in postes)
    profil = client.get("profil", "BLEU")
    total_ht = total_ttc / (1 + TVA_REDUITE)
    aides = calculer_aides(profil, total_ht, client.get("aides_custom"))
    reste = total_ttc - aides["total"]

    # PAGE 1 - COUVERTURE
    cov_data = [
        ["ENERGIA-CONSEIL IA®", ""],
        ["RAPPORT TECHNIQUE", ""],
        ["RÉNOVATION GLOBALE", ""],
        [client.get("nom_complet", "Client"), ""],
        [client.get("adresse_bien", ""), ""],
        [datetime.now().strftime("%d/%m/%Y"), ""],
    ]
    t = Table(cov_data, colWidths=[15*cm, 5*cm])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["orange"]),
        ("TEXTCOLOR", (0, 0), (-1, -1), C["blanc"]),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 1), (0, 2), "Helvetica-Bold"),
        ("FONTSIZE", (0, 1), (0, 2), 16),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 15),
    ]))
    story.append(t)
    story.append(PageBreak())

    # PAGE 2 - SOMMAIRE
    story.append(Paragraph("SOMMAIRE", styles["Section"]))
    story.append(Spacer(1, 0.5*cm))
    for i, p in enumerate(postes, 1):
        story.append(Paragraph(f"{i}. {p.get('nom', '')}", styles["Normal"]))
    story.append(PageBreak())

    # PAGE 3 - SYNTHÈSE
    story.append(Paragraph("SYNTHÈSE EXÉCUTIVE", styles["Section"]))
    story.append(Paragraph(client.get("contexte", "Projet de rénovation"), styles["Normal"]))
    story.append(Spacer(1, 0.3*cm))
    chiffres = [
        ["Total TTC", format_euro(total_ttc)],
        ["Aides estimées", format_euro(aides["total"])],
        ["Reste à charge", format_euro(reste)],
    ]
    t_ch = Table(chiffres, colWidths=[6*cm, 6*cm])
    t_ch.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["bleu_clair"]),
        ("TEXTCOLOR", (0, 0), (-1, -1), C["blanc"]),
        ("GRID", (0, 0), (-1, -1), 0.5, C["gris"]),
    ]))
    story.append(t_ch)
    story.append(PageBreak())

    # PAGES - DÉTAIL POSTES
    for p in postes:
        story.append(Paragraph(f"{p.get('numero', 0)}. {p.get('nom', '')}", styles["Poste"]))
        story.append(Spacer(1, 0.2*cm))
        story.append(Paragraph(p.get("description", ""), styles["Normal"]))
        story.append(Paragraph(f"✅ Artisan RGE : {p.get('artisan', '')} - {p.get('contact', '')}", styles["Normal"]))
        story.append(Paragraph(f"<b>Montant TTC : {format_euro(p.get('montant_ttc', 0))}</b>", styles["Normal"]))
        story.append(Spacer(1, 0.5*cm))
    story.append(PageBreak())

    # RÉCAP FINANCIER
    story.append(Paragraph("RÉCAPITULATIF FINANCIER", styles["Section"]))
    recap_rows = [["Poste", "Montant TTC"]]
    for p in postes:
        recap_rows.append([p.get("nom", ""), format_euro(p.get("montant_ttc", 0))])
    recap_rows.append(["TOTAL TTC", format_euro(total_ttc)])
    t_recap = Table(recap_rows, colWidths=[14*cm, 5*cm])
    t_recap.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C["bleu_fonce"]),
        ("TEXTCOLOR", (0, 0), (-1, 0), C["blanc"]),
        ("BACKGROUND", (0, -1), (-1, -1), C["bleu_fonce"]),
        ("TEXTCOLOR", (0, -1), (-1, -1), C["blanc"]),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, -1), (-1, -1), 12),
        ("GRID", (0, 0), (-1, -1), 0.5, C["gris"]),
    ]))
    story.append(t_recap)
    story.append(PageBreak())

    # CLAUSE + PLANNING
    clause_data = [["⚠️ Les aides sont indicatives. Validation MAR/ANAH obligatoire."]]
    t_cl = Table(clause_data, colWidths=[19*cm])
    t_cl.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["orange"]),
        ("TEXTCOLOR", (0, 0), (-1, -1), C["blanc"]),
        ("TOPPADDING", (0, 0), (-1, -1), 8),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
    ]))
    story.append(t_cl)
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("Planning prévisionnel : 12 semaines", styles["Normal"]))

    doc = SimpleDocTemplate(output_path, pagesize=A4, leftMargin=50, rightMargin=50, topMargin=60, bottomMargin=50)
    doc.build(story, onFirstPage=lambda c, d: add_footer(c, d, C["orange"]),
              onLaterPages=lambda c, d: add_footer(c, d, C["orange"]))


# =============================================================================
# DOCUMENT 3 : DEVIS CHIFFRÉ
# =============================================================================

def create_devis_pdf(client, output_path):
    story = []
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="Section", fontName="Helvetica-Bold", fontSize=14, textColor=C["bleu_fonce"]))

    postes = client.get("postes", [])
    total_ttc = sum(p.get("montant_ttc", 0) for p in postes)
    total_ht = total_ttc / (1 + TVA_REDUITE)
    tva = total_ttc - total_ht
    profil = client.get("profil", "BLEU")
    aides = calculer_aides(profil, total_ht, client.get("aides_custom"))
    reste = total_ttc - aides["total"]

    nom_ref = client.get("nom_complet", "CLIENT").split()[-1].upper()
    ref_devis = f"I-26-03-{nom_ref}-RENOV"

    # PAGE 1 - EN-TÊTE
    story.append(Paragraph(ENTREPRISE["nom"], ParagraphStyle(name="Ent", fontName="Helvetica-Bold", fontSize=14, textColor=C["bleu_fonce"])))
    story.append(Paragraph(f"{ENTREPRISE['adresse']} | {ENTREPRISE['telephone']}", styles["Normal"]))
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph(f"DEVIS N° {ref_devis}", ParagraphStyle(name="Devis", fontName="Helvetica-Bold", fontSize=18, textColor=C["bleu_fonce"])))
    story.append(Paragraph(f"Date : {datetime.now().strftime('%d/%m/%Y')} | Validité : 30 jours", styles["Normal"]))
    story.append(Spacer(1, 0.5*cm))

    client_data = [
        ["Client", client.get("nom_complet", "")],
        ["Adresse", client.get("adresse_bien", "")],
        ["Contact", f"{client.get('email', '')} | {client.get('telephone', '')}"],
    ]
    t_client = Table(client_data, colWidths=[4*cm, 15*cm])
    t_client.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["bleu_clair"]),
        ("TEXTCOLOR", (0, 0), (-1, -1), C["blanc"]),
        ("GRID", (0, 0), (-1, -1), 0.5, C["gris"]),
    ]))
    story.append(t_client)
    story.append(PageBreak())

    # PAGE 2 - CONTEXTE
    story.append(Paragraph("CONTEXTE", styles["Section"]))
    story.append(Paragraph(client.get("contexte", "Projet de rénovation énergétique"), styles["Normal"]))
    story.append(PageBreak())

    # PAGES - DÉTAIL TRAVAUX
    story.append(Paragraph("DÉTAIL DES TRAVAUX", styles["Section"]))
    devis_rows = [["N°", "Désignation", "Détail", "Total HT", "Total TTC"]]
    for p in postes:
        ht = p.get("montant_ttc", 0) / (1 + TVA_REDUITE)
        devis_rows.append([
            str(p.get("numero", "")),
            p.get("nom", ""),
            (p.get("description", ""))[:80] + "..." if len(p.get("description", "")) > 80 else p.get("description", ""),
            format_euro(ht),
            format_euro(p.get("montant_ttc", 0)),
        ])
    t_devis = Table(devis_rows, colWidths=[1.5*cm, 5*cm, 8*cm, 3*cm, 3*cm])
    t_devis.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C["bleu_fonce"]),
        ("TEXTCOLOR", (0, 0), (-1, 0), C["blanc"]),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, 0), 9),
        ("GRID", (0, 0), (-1, -1), 0.5, C["gris"]),
    ]))
    story.append(t_devis)
    story.append(Spacer(1, 0.5*cm))

    # TOTAUX
    tot_rows = [
        ["Total HT", format_euro(total_ht)],
        ["TVA 5,5%", format_euro(tva)],
        ["TOTAL TTC", format_euro(total_ttc)],
    ]
    t_tot = Table(tot_rows, colWidths=[6*cm, 5*cm])
    t_tot.setStyle(TableStyle([
        ("BACKGROUND", (0, -1), (-1, -1), C["bleu_fonce"]),
        ("TEXTCOLOR", (0, -1), (-1, -1), C["blanc"]),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, -1), (-1, -1), 12),
        ("GRID", (0, 0), (-1, -1), 0.5, C["gris"]),
    ]))
    story.append(t_tot)
    story.append(PageBreak())

    # AIDES
    story.append(Paragraph("AIDES FINANCIÈRES", styles["Section"]))
    story.append(Paragraph(f"Profil MaPrimeRénov' : {profil}", styles["Normal"]))
    aides_rows = [
        ["MaPrimeRénov'", format_euro(aides["mapr"])],
        ["CEE", format_euro(aides["cee"])],
        ["Région", format_euro(aides["region"])],
        ["TOTAL AIDES", format_euro(aides["total"])],
    ]
    t_aides = Table(aides_rows, colWidths=[8*cm, 5*cm])
    t_aides.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C["bleu_fonce"]),
        ("TEXTCOLOR", (0, 0), (-1, 0), C["blanc"]),
        ("BACKGROUND", (0, -1), (-1, -1), C["vert"]),
        ("TEXTCOLOR", (0, -1), (-1, -1), C["blanc"]),
        ("FONTNAME", (0, -1), (-1, -1), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, C["gris"]),
    ]))
    story.append(t_aides)
    story.append(Spacer(1, 0.3*cm))

    clause = (
        "Les montants d'aides (MaPrimeRénov', CEE, Région) sont des ESTIMATIONS à titre INDICATIF. "
        "Validation par le MAR et l'ANAH obligatoire. ENERGIA-CONSEIL maximise les aides mais ne garantit pas les montants."
    )
    t_clause = Table([[clause]], colWidths=[19*cm])
    t_clause.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), C["orange"]),
        ("TEXTCOLOR", (0, 0), (-1, -1), C["blanc"]),
        ("BOX", (0, 0), (-1, -1), 0.5, C["rouge"]),
        ("FONTSIZE", (0, 0), (0, 0), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 10),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(t_clause)
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph(f"<b>RESTE À CHARGE : {format_euro(reste)}</b>", styles["Normal"]))
    story.append(PageBreak())

    # FINANCEMENT
    story.append(Paragraph("FINANCEMENT", styles["Section"]))
    mensualite = reste / 180 if reste > 0 else 0
    story.append(Paragraph(f"Éco-PTZ 0% - Montant {format_euro(reste)} - 15 ans - Mensualité {format_euro(mensualite)}/mois", styles["Normal"]))
    story.append(Paragraph("Alternative : VIVONS COURTIER - FABIEN - 06 71 19 96 45", styles["Normal"]))
    story.append(PageBreak())

    # RÉSULTATS + PLANNING
    story.append(Paragraph("RÉSULTATS ATTENDUS", styles["Section"]))
    story.append(Paragraph(f"DPE {client.get('dpe_actuel','F')} → {client.get('dpe_vise','C')} | Économies {format_euro(client.get('economies_an',2100))}/an", styles["Normal"]))
    story.append(Spacer(1, 0.3*cm))
    story.append(Paragraph("PLANNING : 12 semaines", styles["Section"]))
    story.append(PageBreak())

    # MENTIONS + BON POUR ACCORD
    story.append(Paragraph("MENTIONS LÉGALES", styles["Section"]))
    story.append(Paragraph("Paiement : 30% / 40% / 30%. RGPD : contact@energia-conseil.com. Médiation : MEDICYS.", styles["Normal"]))
    story.append(Spacer(1, 0.5*cm))
    story.append(Paragraph("BON POUR ACCORD", styles["Section"]))
    story.append(Paragraph(f"Je soussigné(e) {client.get('nom_complet','')} accepte ce devis pour {format_euro(total_ttc)} TTC.", styles["Normal"]))
    story.append(Paragraph("Fait à ________________ , le ________________", styles["Normal"]))
    story.append(Paragraph("Signature : _________________________________", styles["Normal"]))

    doc = SimpleDocTemplate(output_path, pagesize=A4, leftMargin=50, rightMargin=50, topMargin=60, bottomMargin=50)
    doc.build(story, onFirstPage=lambda c, d: add_footer(c, d, C["bleu_fonce"]),
              onLaterPages=lambda c, d: add_footer(c, d, C["bleu_fonce"]))


# =============================================================================
# DONNÉES CLIENT PAR DÉFAUT + MAIN
# =============================================================================

CLIENT_DEFAUT = {
    "nom_complet": "Mme FONTANAY Stéphanie",
    "adresse_bien": "167 Rue des Acacias, 42210 MONTROND-LES-BAINS",
    "email": "fontanay-stephanie@orange.fr",
    "telephone": "06 59 38 97 49",
    "rfr": 24000,
    "parts": 2,
    "profil": "BLEU",
    "categorie": "Très modestes",
    "pct_aides": 80,
    "surface": 104,
    "contexte": "Maison individuelle, DPE F, surface 103,8 m² ITE + 46 m² plancher. Année construction années 80. Rénovation globale pour DPE C.",
    "dpe_actuel": "F",
    "dpe_vise": "C",
    "conso_avant": 280,
    "conso_apres": 110,
    "facture_avant": 2800,
    "facture_apres": 700,
    "economies_an": 2100,
    "economies_mois": 175,
    "plus_value": 40000,
    "surface_ite": 103.8,
    "surface_plancher": 46,
    "aides_custom": {"mapr": 31900, "cee": 6500, "region": 1500, "total": 39900},
    "postes": [
        {"numero": 1, "nom": "ITE 103,8 m² - Laine de roche", "montant_ttc": 18500, "description": "ITE laine de roche 140 mm, enduit. Échafaudage inclus.", "artisan": "HB FACADIER", "certification": "RGE E-E 109538", "contact": "07 68 05 74 26", "adresse_artisan": "ANDRÉZIEUX-BOUTHÉON"},
        {"numero": 2, "nom": "Isolation plancher bas 46 m²", "montant_ttc": 4200, "description": "Isolation plancher bas, polystyrène ou laine minérale.", "artisan": "ECO SYSTÈME DURABLE", "certification": "RGE", "contact": "01 70 93 97 15", "adresse_artisan": ""},
        {"numero": 3, "nom": "Menuiseries double vitrage", "montant_ttc": 9500, "description": "6 fenêtres + 1 porte-fenêtre double vitrage argon.", "artisan": "HB FACADIER / C2L", "certification": "RGE Menuiseries", "contact": "", "adresse_artisan": ""},
        {"numero": 4, "nom": "PAC Air/Eau 6 kW", "montant_ttc": 14000, "description": "PAC Air/Eau 6 kW, plancher chauffant ou radiateurs basse température.", "artisan": "ECO SYSTÈME DURABLE", "certification": "RGE QualiPAC", "contact": "01 70 93 97 15", "adresse_artisan": ""},
        {"numero": 5, "nom": "Ballon thermodynamique 200 L", "montant_ttc": 3500, "description": "Ballon thermo 200 L ECS, raccordement PAC.", "artisan": "ECO SYSTÈME DURABLE", "certification": "RGE", "contact": "01 70 93 97 15", "adresse_artisan": ""},
        {"numero": 6, "nom": "Coordination & MAR", "montant_ttc": 14363, "description": "Coordination projet, dossier MaPrimeRénov', suivi, réception.", "artisan": "ENERGIA-CONSEIL IA®", "certification": "AMO", "contact": "06 10 59 68 98", "adresse_artisan": "Lyon"},
    ],
}


def build_client_from_args(args):
    """Construit le dictionnaire client depuis les arguments CLI."""
    client = CLIENT_DEFAUT.copy()
    if args.nom:
        client["nom_complet"] = args.nom
    if args.rfr is not None:
        client["rfr"] = args.rfr
    if args.parts is not None:
        client["parts"] = args.parts
    if args.surface is not None:
        client["surface"] = args.surface
        client["surface_ite"] = args.surface * 0.7
        client["surface_plancher"] = args.surface * 0.45
    if args.dpe_actuel:
        client["dpe_actuel"] = args.dpe_actuel
    if args.adresse:
        client["adresse_bien"] = args.adresse
    if args.email:
        client["email"] = args.email
    if args.telephone:
        client["telephone"] = args.telephone
    if args.rfr is not None and args.parts is not None:
        profil, cat, pct = calculer_profil(args.rfr, args.parts)
        client["profil"] = profil
        client["categorie"] = cat
        client["pct_aides"] = pct
    return client


def main():
    parser = argparse.ArgumentParser(description="Pack client ENERGIA-CONSEIL IA® : Audit, Rapport, Devis")
    parser.add_argument("--nom", type=str, help="Nom complet du client")
    parser.add_argument("--adresse", type=str, help="Adresse du bien")
    parser.add_argument("--email", type=str, help="Email")
    parser.add_argument("--telephone", type=str, help="Téléphone")
    parser.add_argument("--rfr", type=float, help="RFR 2024 ( revenu fiscal de référence )")
    parser.add_argument("--parts", type=float, help="Nombre de parts fiscales")
    parser.add_argument("--surface", type=float, help="Surface habitable m²")
    parser.add_argument("--dpe_actuel", type=str, help="DPE actuel (A à G)")
    parser.add_argument("--travaux", type=str, help="Liste postes (ex: ITE,PAC,Ballon)")
    parser.add_argument("--output-dir", type=str, default=".", help="Dossier de sortie des PDF")
    args = parser.parse_args()

    client = build_client_from_args(args)

    nom_fichier = client["nom_complet"].replace(" ", "_").replace("M.", "").replace("Mme", "").strip("_").strip()
    base = os.path.join(args.output_dir, nom_fichier)

    audit_path = f"{base}_audit.pdf"
    rapport_path = f"{base}_rapport.pdf"
    devis_path = f"{base}_devis.pdf"

    print("Génération du pack client ENERGIA-CONSEIL IA®...")
    create_audit_pdf(client, audit_path)
    print(f"  ✅ Audit : {audit_path}")
    create_rapport_pdf(client, rapport_path)
    print(f"  ✅ Rapport : {rapport_path}")
    create_devis_pdf(client, devis_path)
    print(f"  ✅ Devis : {devis_path}")
    print("\nPack complet généré avec succès.")


if __name__ == "__main__":
    main()
