#!/usr/bin/env python3
"""
Génération plaquette ENERGIA-CONSEIL IA® - 8 pages
Usage: python generate_plaquette_energia.py
Output: ENERGIA_Presentation_Generale_2026.pdf (dans le dossier projet)
"""

from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak,
)
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

# Couleurs charte
VERT = colors.HexColor('#10b981')
VERT_FONCE = colors.HexColor('#047857')
GRIS = colors.HexColor('#1f2937')
GRIS_SEC = colors.HexColor('#6b7280')
GRIS_CLAIR = colors.HexColor('#f9fafb')
BLEU_CLAIR = colors.HexColor('#dbeafe')
ORANGE_CLAIR = colors.HexColor('#fed7aa')
JAUNE_CLAIR = colors.HexColor('#fef3c7')
JAUNE_SOLAIRE = colors.HexColor('#fbbf24')
ORANGE_FONCE = colors.HexColor('#ea580c')
BLANC = colors.white
VERT_FOND = colors.HexColor('#f0fdf4')
ORANGE_FOND = colors.HexColor('#fff7ed')
VERT_CLAIR = colors.HexColor('#ecfdf5')


def add_page_number(canvas, doc):
    """Numérotation des pages (sauf couverture) et fond vert page 8"""
    if doc.page == 8:
        w, h = A4
        canvas.saveState()
        canvas.setFillColor(VERT_FONCE)
        canvas.rect(0, 0, w, h, fill=1, stroke=0)
        canvas.restoreState()
    if doc.page > 1:
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(BLANC if doc.page == 8 else GRIS_SEC)
        canvas.drawRightString(195 * mm, 15 * mm, f"Page {doc.page}")
        canvas.restoreState()


def first_page(canvas, doc):
    """Dessin page couverture"""
    w, h = A4
    canvas.saveState()
    # Fond dégradé simulé (vert uni)
    canvas.setFillColor(VERT_FONCE)
    canvas.rect(0, 0, w, h, fill=1, stroke=0)
    # Zone verte claire en haut
    canvas.setFillColor(VERT)
    canvas.rect(0, h - 120, w, 120, fill=1, stroke=0)
    canvas.restoreState()


def create_styles():
    """Création des styles de paragraphe"""
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name='TitreVert',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=VERT_FONCE,
        fontName='Helvetica-Bold',
        spaceAfter=12,
    ))
    styles.add(ParagraphStyle(
        name='SousTitreVert',
        parent=styles['Heading2'],
        fontSize=18,
        textColor=VERT_FONCE,
        fontName='Helvetica-Bold',
        spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        name='EncadreTitre',
        parent=styles['Normal'],
        fontSize=14,
        textColor=VERT_FONCE,
        fontName='Helvetica-Bold',
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name='Corps',
        parent=styles['Normal'],
        fontSize=11,
        textColor=GRIS,
        alignment=TA_JUSTIFY,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        name='CorpsCourt',
        parent=styles['Normal'],
        fontSize=10,
        textColor=GRIS,
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        name='BlancCentre',
        parent=styles['Normal'],
        fontSize=16,
        textColor=BLANC,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold',
    ))
    return styles


def encadre(contenu, couleur_fond, padding=12):
    """Crée un encadré coloré"""
    return Table(
        [[contenu]],
        colWidths=[160 * mm],
        rowHeights=None,
    ).setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), couleur_fond),
        ('BOX', (0, 0), (-1, -1), 0.5, GRIS),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), padding),
        ('RIGHTPADDING', (0, 0), (-1, -1), padding),
        ('TOPPADDING', (0, 0), (-1, -1), padding),
        ('BOTTOMPADDING', (0, 0), (-1, -1), padding),
    ]))


def build_plaquette():
    """Construction du document"""
    output_path = Path(__file__).resolve().parent.parent / "ENERGIA_Presentation_Generale_2026.pdf"
    doc = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=20 * mm,
    )
    styles = create_styles()
    story = []

    # ========== PAGE 1 : COUVERTURE ==========
    story.append(Spacer(1, 80 * mm))
    story.append(Paragraph(
        "ENERGIA-CONSEIL IA®",
        ParagraphStyle('CoverTitle', fontSize=36, textColor=BLANC, fontName='Helvetica-Bold', alignment=TA_CENTER)
    ))
    story.append(Paragraph(
        "Audit Énergétique Intelligence Artificielle",
        ParagraphStyle('CoverSub', fontSize=18, textColor=BLANC, alignment=TA_CENTER, spaceAfter=4)
    ))
    story.append(Paragraph(
        "Marque déposée INPI",
        ParagraphStyle('CoverInpi', fontSize=11, textColor=BLANC, alignment=TA_CENTER, spaceAfter=40)
    ))
    story.append(Paragraph(
        "Votre partenaire expert en :",
        ParagraphStyle('CoverListTitle', fontSize=14, textColor=BLANC, fontName='Helvetica-Bold', alignment=TA_CENTER, spaceAfter=12)
    ))
    items = [
        "• Audits énergétiques réglementaires",
        "• Rénovation globale performante (MaPrimeRénov' + CEE)",
        "• Photovoltaïque 0-500 kWc (QUALIPV)",
        "• Assistance à Maîtrise d'Ouvrage (AMO)",
        "• Conseil technique & Études thermiques",
    ]
    for item in items:
        story.append(Paragraph(item, ParagraphStyle('CoverItem', fontSize=12, textColor=BLANC, alignment=TA_CENTER, spaceAfter=4)))
    story.append(Spacer(1, 60 * mm))
    story.append(Paragraph("www.energia-conseil.com", ParagraphStyle('CoverWeb', fontSize=12, textColor=BLANC, alignment=TA_CENTER)))
    story.append(Paragraph("06 10 59 68 98", ParagraphStyle('CoverTel', fontSize=12, textColor=BLANC, alignment=TA_CENTER)))

    story.append(PageBreak())

    # ========== PAGE 2 : QUI SOMMES-NOUS ==========
    story.append(Paragraph("Qui sommes-nous ?", styles['TitreVert']))
    story.append(Paragraph(
        "ENERGIA-CONSEIL IA® est un bureau d'études spécialisé en rénovation énergétique, "
        "audits énergétiques réglementaires et installations photovoltaïques.",
        styles['Corps']
    ))
    story.append(Paragraph(
        "Marque déposée INPI, nous accompagnons les particuliers, copropriétés, professionnels "
        "et industriels dans leurs projets de transition énergétique.",
        styles['Corps']
    ))
    story.append(Paragraph(
        "Notre expertise : Audits conformes Décret 2022-780, calculs thermiques RT2012/RE2020, "
        "dimensionnement photovoltaïque 0-500 kWc, optimisation cumul aides MaPrimeRénov' + CEE 2026, "
        "assistance technique, conseil sélection artisans RGE.",
        styles['Corps']
    ))

    amo_text = """
    <b>Notre positionnement : Bureau d'études & Assistance à Maîtrise d'Ouvrage (AMO)</b><br/><br/>
    Activité actuelle : Conseil technique, études, assistance<br/>
    Objectif 2026-2027 : RC PRO Maîtrise d'œuvre + Certification CERTIBAT
    """
    story.append(encadre(Paragraph(amo_text, styles['CorpsCourt']), BLEU_CLAIR))
    story.append(Spacer(1, 8))

    expertises = [
        ("Expertise technique", "Certifications FEEBAT, QUALIPV (0-500 kWc), Auditeur Énergétique. Calculs thermiques précis, conformité réglementaire. Études photovoltaïques résidentiel/tertiaire/industriel."),
        ("Innovation IA", "Audit énergétique Intelligence Artificielle (199€). Calculateur aides MaPrimeRénov' + CEE en ligne gratuit. Dimensionnement photovoltaïque optimisé. Rapports automatisés."),
        ("Photovoltaïque 0-500 kWc", "Résidentiel (3-9 kWc) : Autoconsommation + Revente surplus. Tertiaire (9-100 kWc) : Toitures commerces, bureaux. Industriel (100-500 kWc) : Hangars, entrepôts, ombrières. Certification QUALIPV."),
        ("Accompagnement complet", "Audit → Devis → Assistance administrative (aides) → Conseil artisans RGE. Assistance technique suivi de chantier. Cumul aides MaPrimeRénov' + CEE optimisé."),
        ("Résultats garantis", "Audits conformes (Décret 2022-780). Aides maximisées (cumul MaPrimeRénov' + CEE + Région). Production photovoltaïque garantie (25 ans)."),
    ]
    for titre, desc in expertises:
        story.append(Paragraph(f"<b>✓ {titre}</b>", styles['EncadreTitre']))
        story.append(Paragraph(desc, styles['CorpsCourt']))
        story.append(Spacer(1, 6))

    story.append(Spacer(1, 10))
    story.append(Paragraph("SIRET : 94181942700019 | Marque déposée INPI", ParagraphStyle('Footer', fontSize=8, textColor=GRIS_SEC)))
    story.append(PageBreak())

    # ========== PAGE 3 : NOS SERVICES ==========
    story.append(Paragraph("Nos services", styles['TitreVert']))
    story.append(Spacer(1, 6))

    # 4 encadrés
    audit_text = """
    <b>🏠 AUDITS ÉNERGÉTIQUES</b><br/><br/>
    <b>Audit réglementaire</b> (vente F/G/E/D) : Conforme Décret 2022-780, Rapport 30-40 pages, 2-3 scénarios travaux, Calculs aides personnalisés, Validité 5 ans, Délai 5-7 jours. <b>Prix : 199-600€</b><br/><br/>
    <b>Audit IA</b> (particuliers) : Intelligence Artificielle, Rapport instantané, 3-5 scénarios optimisés, Remboursé si travaux. <b>Prix : 199€</b><br/><br/>
    <b>Sous-traitance BET</b> : Audits en marque blanche, Délai 5-7 jours. <b>Prix : 400€ HT/audit</b>
    """
    story.append(encadre(Paragraph(audit_text, styles['CorpsCourt']), VERT_FOND))

    pv_text = """
    <b>☀️ PHOTOVOLTAÏQUE 0-500 kWc</b><br/><br/>
    <b>Résidentiel (3-9 kWc)</b> : Autoconsommation + Revente surplus. Prime autoconsommation. ROI 8-12 ans. <b>Prix : 1 800-3 000€/kWc TTC</b><br/><br/>
    <b>Tertiaire (9-100 kWc)</b> : Toitures commerces, bureaux. Obligation d'achat 20 ans. ROI 6-10 ans. <b>Prix : 1 200-1 800€/kWc HT</b><br/><br/>
    <b>Industriel (100-500 kWc)</b> : Hangars, entrepôts, ombrières. ROI 5-8 ans. <b>Prix : 1 000-1 400€/kWc HT</b>
    """
    story.append(encadre(Paragraph(pv_text, styles['CorpsCourt']), JAUNE_CLAIR))

    amo_serv_text = """
    <b>🔨 ASSISTANCE À MAÎTRISE D'OUVRAGE (AMO)</b><br/><br/>
    <b>Assistance technique projets</b> : Sélection artisans RGE, Conseil technique, Suivi chantier, Contrôle qualité. <b>Prix : 5 000-10 000€</b><br/><br/>
    <b>Coordination photovoltaïque</b> : Sélection installateurs QUALIPV, Suivi raccordement ENEDIS. <b>Prix : 5-10% du projet</b><br/><br/>
    <i>Évolution 2026 : Obtention RC PRO Maîtrise d'œuvre en cours → Offre clé en main complète à venir</i>
    """
    story.append(encadre(Paragraph(amo_serv_text, styles['CorpsCourt']), BLEU_CLAIR))

    aides_text = """
    <b>💰 OPTIMISATION AIDES 2026</b><br/><br/>
    <b>Calcul cumul aides</b> : MaPrimeRénov' Parcours Accompagné, CEE Précarité, Prime autoconsommation, Aides Région, Éco-PTZ. Cumul optimisé jusqu'à 90%. <b>Gratuit sur notre site</b><br/><br/>
    <b>Assistance dossiers aides</b> : Conseil constitution dossier, Calculs au centime près. Inclus dans AMO
    """
    story.append(encadre(Paragraph(aides_text, styles['CorpsCourt']), ORANGE_CLAIR))
    story.append(PageBreak())

    # ========== PAGE 4 : PHOTOVOLTAÏQUE ==========
    story.append(Paragraph("☀️ Photovoltaïque 0-500 kWc", ParagraphStyle('TitreJaune', fontSize=22, textColor=colors.HexColor('#f59e0b'), fontName='Helvetica-Bold')))
    story.append(Paragraph("Certification QUALIPV - Installations solaires tous secteurs", styles['SousTitreVert']))
    story.append(Spacer(1, 8))

    pv_resid = """
    <b>🏠 RÉSIDENTIEL (3-9 kWc)</b><br/>
    Configuration type 6 kWc : 12 panneaux 500Wc (30m²), Production 6 000-7 500 kWh/an. Prime autoconsommation 1 680€.<br/>
    <b>Prix : 12 000-18 000€ TTC | Reste : 10 320-16 320€ | ROI : 8-12 ans</b>
    """
    story.append(encadre(Paragraph(pv_resid, styles['CorpsCourt']), JAUNE_CLAIR))

    pv_tert = """
    <b>🏢 TERTIAIRE (9-100 kWc)</b><br/>
    Configuration type 36 kWc : 72 panneaux (180m²), Production 36 000-45 000 kWh/an. Prime 5 760€.<br/>
    <b>Prix : 45 000-65 000€ HT | ROI : 6-10 ans | Économies : 5 000-8 000€/an</b>
    """
    story.append(encadre(Paragraph(pv_tert, styles['CorpsCourt']), JAUNE_CLAIR))

    pv_ind = """
    <b>🏭 INDUSTRIEL (100-500 kWc)</b><br/>
    Configuration type 250 kWc : 500 panneaux (1 250m²), Production 250 000-300 000 kWh/an.<br/>
    <b>Prix : 200 000-300 000€ HT | ROI : 5-8 ans | Économies : 30 000-50 000€/an</b>
    """
    story.append(encadre(Paragraph(pv_ind, styles['CorpsCourt']), JAUNE_CLAIR))

    # Tableau comparatif
    data_pv = [
        ['Puissance', 'Surface', 'Production/an', 'Prix', 'ROI'],
        ['3 kWc', '15 m²', '3 000 kWh', '6 000 €', '10 ans'],
        ['6 kWc', '30 m²', '6 000 kWh', '12 000 €', '9 ans'],
        ['9 kWc', '45 m²', '9 000 kWh', '18 000 €', '8 ans'],
        ['36 kWc', '180 m²', '36 000 kWh', '55 000 €', '8 ans'],
        ['100 kWc', '500 m²', '100 000 kWh', '120 000 €', '7 ans'],
        ['250 kWc', '1 250 m²', '250 000 kWh', '250 000 €', '6 ans'],
    ]
    t_pv = Table(data_pv, colWidths=[28, 28, 40, 32, 28])
    t_pv.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), VERT_FONCE),
        ('TEXTCOLOR', (0, 0), (-1, 0), BLANC),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, GRIS),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [BLANC, GRIS_CLAIR]),
    ]))
    story.append(t_pv)
    story.append(PageBreak())

    # ========== PAGE 5 : POURQUOI NOUS CHOISIR ==========
    story.append(Paragraph("Pourquoi nous choisir ?", styles['TitreVert']))
    story.append(Spacer(1, 8))

    args_data = [
        ["✓ Certifications officielles", "✓ Photovoltaïque tous secteurs"],
        ["FEEBAT, QUALIPV, Auditeur Énergétique. Conformité garantie.", "Résidentiel, Tertiaire, Industriel. Dimensionnement optimisé."],
        ["✓ Technologie IA", "✓ Rapidité"],
        ["Audits IA, Calculateur aides gratuit. www.energia-conseil.com", "Audit 5-7 jours, Étude PV 48h, Devis 48h."],
        ["✓ Expertise aides 2026", "✓ Réseau partenaires RGE"],
        ["MaPrimeRénov' + CEE + Région. Cumul jusqu'à 90%.", "ECOM, HB FACADIER, ECO SYSTÈME DURABLE, C2L, QUALIPV."],
        ["✓ Transparence", "✓ Accompagnement complet"],
        ["Devis détaillés, pas de frais cachés, aides au centime.", "Étude → Devis → Aides → Conseil artisans → Assistance suivi."],
    ]
    t_args = Table(args_data, colWidths=[90 * mm, 90 * mm])
    t_args.setStyle(TableStyle([
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('TEXTCOLOR', (0, 0), (-1, -1), GRIS),
    ]))
    story.append(t_args)
    story.append(Spacer(1, 12))
    stats_text = "<b>95% taux de satisfaction</b> | <b>90% aides obtenues</b> | <b>100% installations conformes</b>"
    story.append(encadre(Paragraph(stats_text, ParagraphStyle('Stats', fontSize=12, textColor=VERT_FONCE, fontName='Helvetica-Bold', alignment=TA_CENTER)), VERT_FOND))
    story.append(PageBreak())

    # ========== PAGE 6 : TARIFS ==========
    story.append(Paragraph("Nos tarifs", styles['TitreVert']))
    story.append(Spacer(1, 8))

    tarifs_data = [
        ['PARTICULIERS', 'BET & ENTREPRISES', 'COPROPRIÉTÉS', 'TERTIAIRE / INDUSTRIEL'],
        ['Audit IA : 199€ TTC', 'Sous-traitance : 400€ HT/audit', 'Audit copro : 600-800€ HT', 'PV 9-100 kWc : 1 200-1 800€/kWc HT'],
        ['Audit réglementaire : 600€', 'Remises volume -10% à -20%', 'DTG + PPT : Sur devis', 'PV 100-500 kWc : 1 000-1 400€/kWc HT'],
        ['AMO : 5 000-10 000€', 'Partenariat sur mesure', 'PV collectif : Sur devis', 'Maintenance : 1-2% invest./an'],
        ['PV 3-9 kWc : 1 800-3 000€/kWc', '', '', ''],
    ]
    t_tarifs = Table(tarifs_data, colWidths=[45 * mm, 45 * mm, 45 * mm, 45 * mm])
    t_tarifs.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), VERT_FONCE),
        ('TEXTCOLOR', (0, 0), (-1, 0), BLANC),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, GRIS),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [BLANC, GRIS_CLAIR]),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t_tarifs)
    story.append(PageBreak())

    # ========== PAGE 7 : CUMUL AIDES ==========
    story.append(Paragraph("💰 Cumul Aides MaPrimeRénov' + CEE 2026", ParagraphStyle('TitreOrange', fontSize=22, textColor=ORANGE_FONCE, fontName='Helvetica-Bold')))
    story.append(Paragraph("Financez jusqu'à 90% de votre rénovation globale", styles['SousTitreVert']))
    story.append(Spacer(1, 8))

    story.append(Paragraph("<b>✅ TOUTES LES AIDES SONT CUMULABLES !</b> MaPrimeRénov' Parcours + CEE + Région + Éco-PTZ + TVA 5,5%", styles['Corps']))
    story.append(Spacer(1, 8))

    aides_data = [
        ['Aide', 'Profil BLEU', 'Profil JAUNE', 'Profil VIOLET'],
        ['MaPrimeRénov\' Parcours', '49 000€ (70%)', '35 000€ (50%)', '28 000€ (40%)'],
        ['CEE Précarité (bonifié)', '9 000€', '7 000€', '5 000€'],
        ['Aide Région', '2 000€', '1 500€', '1 000€'],
        ['TOTAL AIDES', '60 000€', '43 500€', '34 000€'],
        ['Reste à charge', '10 000€', '26 500€', '36 000€'],
        ['Taux financement', '86%', '62%', '49%'],
    ]
    t_aides = Table(aides_data, colWidths=[50, 35, 35, 35])
    t_aides.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), VERT_FONCE),
        ('BACKGROUND', (0, 4), (-1, 4), VERT_CLAIR),
        ('TEXTCOLOR', (0, 0), (-1, 0), BLANC),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (1, 0), (-1, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.5, GRIS),
    ]))
    story.append(t_aides)
    story.append(Spacer(1, 12))

    exemple_text = """
    <b>Exemple réel : M. Seux (Loire 42)</b><br/>
    Projet 70 391€ TTC (ITE + Combles + PAC + Menuiseries + VMC). Profil JAUNE.<br/>
    Aides : MaPrimeRénov' 31 000€ + CEE 6 500€ + Région 1 500€ = <b>39 000€ (55%)</b><br/>
    Reste 31 391€ | Éco-PTZ 174€/mois | Économies 180€/mois → <b>Gain net +6€/mois (autofinancé) ✓</b>
    """
    story.append(encadre(Paragraph(exemple_text, styles['CorpsCourt']), VERT_FOND))
    story.append(PageBreak())

    # ========== PAGE 8 : CONTACT ==========
    story.append(Spacer(1, 30 * mm))
    story.append(Paragraph("Contactez-nous", ParagraphStyle('ContactTitle', fontSize=28, textColor=BLANC, fontName='Helvetica-Bold', alignment=TA_CENTER)))
    story.append(Spacer(1, 8))
    story.append(Paragraph("ENERGIA-CONSEIL IA®", ParagraphStyle('ContactName', fontSize=16, textColor=BLANC, fontName='Helvetica-Bold', alignment=TA_CENTER)))
    story.append(Paragraph("Audit Énergétique Intelligence Artificielle", ParagraphStyle('ContactBase', fontSize=12, textColor=BLANC, alignment=TA_CENTER)))
    story.append(Spacer(1, 6))
    story.append(Paragraph("16 Rue Cuvier, 69006 Lyon", ParagraphStyle('ContactAddr', fontSize=12, textColor=BLANC, alignment=TA_CENTER)))
    story.append(Spacer(1, 12))
    story.append(Paragraph("📞 06 10 59 68 98", ParagraphStyle('ContactTel', fontSize=14, textColor=BLANC, fontName='Helvetica-Bold', alignment=TA_CENTER)))
    story.append(Paragraph("📧 contact@energia-conseil.com", ParagraphStyle('ContactMail', fontSize=12, textColor=BLANC, alignment=TA_CENTER)))
    story.append(Paragraph("🌐 www.energia-conseil.com", ParagraphStyle('ContactWeb', fontSize=12, textColor=BLANC, alignment=TA_CENTER)))
    story.append(Spacer(1, 20))

    zones_text = """
    <b>Interventions :</b> Auvergne-Rhône-Alpes (Lyon, Saint-Étienne, Loire 42) • Île-de-France • National (sur demande)<br/><br/>
    <b>Secteurs :</b> Résidentiel • Copropriétés • Tertiaire • Industriel<br/><br/>
    <b>Partenaires RGE :</b> ECOM ENERGIE, HB FACADIER (ITE) • ECO SYSTÈME DURABLE (PAC+VMC) • C2L (Toiture) • Installateurs QUALIPV • VIVONS COURTIER (Financement)
    """
    style_vert = ParagraphStyle('ContactEncadre', parent=styles['CorpsCourt'], textColor=VERT_FONCE)
    story.append(encadre(Paragraph(zones_text, style_vert), BLANC))
    story.append(Spacer(1, 15))
    story.append(Paragraph(
        "SIRET : 94181942700019 | RCS Lyon 941819427 | SASU Capital 100€ | Marque déposée INPI<br/>"
        "Certifications : FEEBAT | QUALIPV (0-500 kWc) | Auditeur Énergétique<br/>"
        "© 2026 ENERGIA-CONSEIL IA® - Tous droits réservés",
        ParagraphStyle('FooterContact', fontSize=8, textColor=BLANC, alignment=TA_CENTER)
    ))

    # Construction PDF
    doc.build(story, onFirstPage=first_page, onLaterPages=add_page_number)

    print(f"✓ PDF généré : {output_path}")


if __name__ == "__main__":
    build_plaquette()
