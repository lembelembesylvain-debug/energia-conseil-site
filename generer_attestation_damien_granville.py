#!/usr/bin/env python3
"""Note de rapprochement — Encaissement ENERGIA et règlement SRD CONSEILS (GRANVILLE)."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    KeepTogether,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_PDF = SCRIPT_DIR / "attestation_reglement_damien_granville_corrigee.pdf"

BLEU_NUIT = colors.HexColor("#102640")
VERT_CLAIR = colors.HexColor("#DFF5EC")
VERT_BORDURE = colors.HexColor("#A8D5C4")
ORANGE_CLAIR = colors.HexColor("#FFF4E5")
ORANGE_BORDURE = colors.HexColor("#E8A54B")
GRIS_TEXTE = colors.HexColor("#2A2A2A")
GRIS_CLAIR = colors.HexColor("#D0D0D0")
GRIS_FOND = colors.HexColor("#F5F6F8")
BLANC = colors.white

BANDEAU_H = 14 * mm
MARGIN = 2 * cm


def _styles():
    return {
        "titre": ParagraphStyle(
            "Titre",
            fontName="Helvetica-Bold",
            fontSize=13,
            textColor=BLEU_NUIT,
            alignment=TA_CENTER,
            leading=16,
            spaceAfter=3,
        ),
        "sous_titre": ParagraphStyle(
            "SousTitre",
            fontName="Helvetica",
            fontSize=9.5,
            textColor=GRIS_TEXTE,
            alignment=TA_CENTER,
            leading=11.5,
            spaceAfter=5,
        ),
        "objet": ParagraphStyle(
            "Objet",
            fontName="Helvetica",
            fontSize=9,
            textColor=GRIS_TEXTE,
            alignment=TA_JUSTIFY,
            leading=12,
        ),
        "section": ParagraphStyle(
            "Section",
            fontName="Helvetica-Bold",
            fontSize=10.5,
            textColor=BLEU_NUIT,
            alignment=TA_LEFT,
            leading=13,
            spaceBefore=4,
            spaceAfter=2,
        ),
        "partie_titre": ParagraphStyle(
            "PartieTitre",
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=BLEU_NUIT,
            alignment=TA_LEFT,
            leading=11,
            spaceAfter=2,
        ),
        "partie_corps": ParagraphStyle(
            "PartieCorps",
            fontName="Helvetica",
            fontSize=8,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=10.5,
        ),
        "cell_l": ParagraphStyle(
            "CellL",
            fontName="Helvetica",
            fontSize=9,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=12,
        ),
        "cell_l_b": ParagraphStyle(
            "CellLB",
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=BLEU_NUIT,
            alignment=TA_LEFT,
            leading=12,
        ),
        "cell_r": ParagraphStyle(
            "CellR",
            fontName="Helvetica",
            fontSize=9,
            textColor=GRIS_TEXTE,
            alignment=TA_RIGHT,
            leading=12,
        ),
        "cell_r_b": ParagraphStyle(
            "CellRB",
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=GRIS_TEXTE,
            alignment=TA_RIGHT,
            leading=12,
        ),
        "entete": ParagraphStyle(
            "Entete",
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=BLEU_NUIT,
            alignment=TA_LEFT,
            leading=12,
        ),
        "entete_r": ParagraphStyle(
            "EnteteR",
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=BLEU_NUIT,
            alignment=TA_RIGHT,
            leading=12,
        ),
        "meta": ParagraphStyle(
            "Meta",
            fontName="Helvetica",
            fontSize=8.5,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=11.5,
            spaceAfter=2,
        ),
        "vigilance": ParagraphStyle(
            "Vigilance",
            fontName="Helvetica",
            fontSize=8.5,
            textColor=GRIS_TEXTE,
            alignment=TA_JUSTIFY,
            leading=11.5,
        ),
        "puce": ParagraphStyle(
            "Puce",
            fontName="Helvetica",
            fontSize=8.5,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=11.5,
            leftIndent=10,
            firstLineIndent=-10,
            spaceAfter=1.5,
        ),
        "attestation": ParagraphStyle(
            "Attestation",
            fontName="Helvetica",
            fontSize=9,
            textColor=GRIS_TEXTE,
            alignment=TA_JUSTIFY,
            leading=12,
        ),
        "lieu_date": ParagraphStyle(
            "LieuDate",
            fontName="Helvetica",
            fontSize=9,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=11,
            spaceBefore=4,
            spaceAfter=4,
        ),
        "sig_titre": ParagraphStyle(
            "SigTitre",
            fontName="Helvetica-Bold",
            fontSize=8.5,
            textColor=BLEU_NUIT,
            alignment=TA_CENTER,
            leading=10.5,
        ),
        "sig_nom": ParagraphStyle(
            "SigNom",
            fontName="Helvetica-Bold",
            fontSize=8.5,
            textColor=GRIS_TEXTE,
            alignment=TA_CENTER,
            leading=10.5,
            spaceBefore=3,
        ),
        "sig_qual": ParagraphStyle(
            "SigQual",
            fontName="Helvetica",
            fontSize=8,
            textColor=GRIS_TEXTE,
            alignment=TA_CENTER,
            leading=10.5,
        ),
        "sig_ligne": ParagraphStyle(
            "SigLigne",
            fontName="Helvetica",
            fontSize=8.5,
            textColor=GRIS_TEXTE,
            alignment=TA_CENTER,
            leading=10.5,
            spaceBefore=8,
        ),
    }


def _draw_bandeau(canvas, _doc):
    """Bandeau bleu nuit pleine largeur."""
    page_w, page_h = A4
    canvas.saveState()
    canvas.setFillColor(BLEU_NUIT)
    canvas.rect(0, page_h - BANDEAU_H, page_w, BANDEAU_H, fill=1, stroke=0)
    canvas.setFillColor(BLANC)
    canvas.setFont("Helvetica-Bold", 9)
    canvas.drawString(MARGIN, page_h - BANDEAU_H / 2 - 3, "ENERGIA CONSEIL IA®")
    titre = "NOTE DE RAPPROCHEMENT"
    canvas.setFont("Helvetica-Bold", 10)
    tw = canvas.stringWidth(titre, "Helvetica-Bold", 10)
    canvas.drawString(page_w - MARGIN - tw, page_h - BANDEAU_H / 2 - 3.5, titre)
    canvas.restoreState()


def _encadre(contenu, style, fond, bordure, largeur):
    t = Table([[Paragraph(contenu, style)]], colWidths=[largeur])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), fond),
                ("BOX", (0, 0), (-1, -1), 0.6, bordure),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
            ]
        )
    )
    return t


def _build_story(usable, styles):
    story = []

    story.append(
        Paragraph(
            "Note de rapprochement — Encaissement ENERGIA et règlement SRD CONSEILS",
            styles["titre"],
        )
    )
    story.append(
        Paragraph(
            "Dossier Luc GRANVILLE — Référence EC-FAC-2026-004",
            styles["sous_titre"],
        )
    )

    story.append(
        _encadre(
            "<b>Objet :</b> présenter le rapprochement entre l’encaissement de "
            "3 178,00 € TTC reçu par ENERGIA CONSEIL et le règlement de "
            "2 123,00 € TTC effectué au bénéfice de Damien RICHARD / SRD CONSEILS, "
            "au titre du dossier photovoltaïque de M. Luc GRANVILLE.",
            styles["objet"],
            VERT_CLAIR,
            VERT_BORDURE,
            usable,
        )
    )

    # --- Section 1 ---
    story.append(Paragraph("1. Identification des parties", styles["section"]))

    energia = [
        Paragraph("ENERGIA CONSEIL", styles["partie_titre"]),
        Paragraph("SAS — Capital social : 100 €", styles["partie_corps"]),
        Paragraph("16 rue Cuvier, 69006 Lyon", styles["partie_corps"]),
        Paragraph("SIRET : 941 819 427 00019", styles["partie_corps"]),
        Paragraph(
            "Représentée par M. Sylvain LEMBELEMBE, Président",
            styles["partie_corps"],
        ),
    ]
    srd = [
        Paragraph("SRD CONSEILS", styles["partie_titre"]),
        Paragraph("Représentée par M. Damien RICHARD", styles["partie_corps"]),
        Paragraph("49 Hameau des Cipières", styles["partie_corps"]),
        Paragraph("42210 Montrond-les-Bains", styles["partie_corps"]),
        Paragraph(
            "SIRET : 903 542 371 R.C.S. Saint-Étienne",
            styles["partie_corps"],
        ),
    ]
    half = (usable - 4 * mm) / 2
    t_e = Table([[x] for x in energia], colWidths=[half])
    t_s = Table([[x] for x in srd], colWidths=[half])
    for t in (t_e, t_s):
        t.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), GRIS_FOND),
                    ("BOX", (0, 0), (-1, -1), 0.5, GRIS_CLAIR),
                    ("LEFTPADDING", (0, 0), (-1, -1), 5),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                    ("TOPPADDING", (0, 0), (0, 0), 4),
                    ("BOTTOMPADDING", (0, -1), (0, -1), 4),
                    ("TOPPADDING", (0, 1), (0, -1), 0.5),
                    ("BOTTOMPADDING", (0, 0), (0, -2), 0.5),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ]
            )
        )
    parties = Table([[t_e, t_s]], colWidths=[half + 2 * mm, half + 2 * mm])
    parties.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (0, 0), 0),
                ("RIGHTPADDING", (0, 0), (0, 0), 2 * mm),
                ("LEFTPADDING", (1, 0), (1, 0), 2 * mm),
                ("RIGHTPADDING", (1, 0), (1, 0), 0),
            ]
        )
    )
    story.append(parties)

    # --- Section 2 ---
    story.append(Paragraph("2. Détail du règlement", styles["section"]))

    detail_rows = [
        (
            Paragraph("Libellé", styles["entete"]),
            Paragraph("Montant TTC", styles["entete_r"]),
            False,
        ),
        (
            Paragraph(
                "Montant encaissé par ENERGIA CONSEIL",
                styles["cell_l_b"],
            ),
            Paragraph("3 178,00 €", styles["cell_r_b"]),
            True,
        ),
        (
            Paragraph(
                "Montant versé à Damien RICHARD / SRD CONSEILS",
                styles["cell_l_b"],
            ),
            Paragraph("- 2 123,00 €", styles["cell_r_b"]),
            True,
        ),
        (
            Paragraph("Solde conservé par ENERGIA CONSEIL", styles["cell_l"]),
            Paragraph("1 055,00 €", styles["cell_r"]),
            False,
        ),
        (
            Paragraph(
                "Écart d’arrondi / régularisation par rapport à la facture",
                styles["cell_l"],
            ),
            Paragraph("0,20 €", styles["cell_r"]),
            False,
        ),
    ]
    detail_data = [[a, b] for a, b, _ in detail_rows]
    detail = Table(detail_data, colWidths=[usable * 0.72, usable * 0.28])
    cmds = [
        ("BACKGROUND", (0, 0), (-1, 0), GRIS_FOND),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 2.5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("BOX", (0, 0), (-1, -1), 0.5, GRIS_CLAIR),
        ("INNERGRID", (0, 0), (-1, -1), 0.4, GRIS_CLAIR),
    ]
    for i, (_, _, hl) in enumerate(detail_rows):
        if hl:
            cmds.append(("BACKGROUND", (0, i), (-1, i), VERT_CLAIR))
    detail.setStyle(TableStyle(cmds))
    story.append(detail)
    story.append(Spacer(1, 1.5 * mm))

    story.append(
        Paragraph(
            "Le montant de 3 178,00 € TTC a été encaissé par ENERGIA CONSEIL sur son "
            "compte professionnel. Après règlement de 2 123,00 € TTC à Damien RICHARD "
            "/ SRD CONSEILS au titre de sa quote-part commerciale, le solde conservé "
            "par ENERGIA CONSEIL s’élève à 1 055,00 € TTC.",
            styles["vigilance"],
        )
    )
    story.append(Spacer(1, 1 * mm))

    story.append(
        Paragraph(
            "<b>Mode de règlement :</b> virement bancaire depuis le compte "
            "professionnel Tiime d’ENERGIA CONSEIL.",
            styles["meta"],
        )
    )
    story.append(
        Paragraph(
            "<b>Bénéficiaire :</b> Damien RICHARD / SRD CONSEILS.",
            styles["meta"],
        )
    )
    story.append(
        Paragraph(
            "<b>Dossier concerné :</b> Projet photovoltaïque de M. Luc GRANVILLE — "
            "installation 6 kWc avec batterie ATMOCE 7 kWh — Diou (03).",
            styles["meta"],
        )
    )

    # --- Section 3 ---
    story.append(Paragraph("3. Rapprochement comptable", styles["section"]))
    story.append(
        _encadre(
            "La facture ENERGIA CONSEIL n° EC-FAC-2026-004 fait apparaître une part "
            "de 1 055,20 € TTC pour ENERGIA CONSEIL et une quote-part de 2 122,80 € TTC "
            "pour SRD CONSEILS, soit un total de 3 178,00 € TTC.<br/>"
            "Le règlement de 2 123,00 € effectué à Damien RICHARD correspond à la "
            "quote-part SRD CONSEILS, majorée d’un ajustement de 0,20 € à qualifier "
            "comptablement comme arrondi ou régularisation.<br/>"
            "Le solde effectivement conservé par ENERGIA CONSEIL après ce règlement "
            "est de 1 055,00 € TTC. L’écart de 0,20 € doit être rapproché et validé "
            "comptablement.",
            styles["vigilance"],
            ORANGE_CLAIR,
            ORANGE_BORDURE,
            usable,
        )
    )

    # --- Section 4 ---
    story.append(Paragraph("4. Pièces à conserver", styles["section"]))
    for item in (
        "Facture ENERGIA CONSEIL n° EC-FAC-2026-004 ;",
        "Justificatif d’encaissement de 3 178,00 € TTC sur le compte ENERGIA CONSEIL ;",
        "Justificatif du virement de 2 123,00 € à Damien RICHARD / SRD CONSEILS ;",
        "Facture ou note d’honoraires de SRD CONSEILS, si applicable ;",
        "Présente note de rapprochement.",
    ):
        story.append(Paragraph(f"• {item}", styles["puce"]))

    # --- Section 5 ---
    story.append(Paragraph("5. Attestation", styles["section"]))
    story.append(
        _encadre(
            "ENERGIA CONSEIL atteste avoir encaissé la somme de <b>3 178,00 € TTC</b> "
            "sur son compte professionnel au titre de la répartition de marge du "
            "dossier Luc GRANVILLE, et avoir versé la somme de <b>2 123,00 € TTC</b> "
            "à M. Damien RICHARD / SRD CONSEILS au titre de sa quote-part commerciale, "
            "soit un solde conservé de <b>1 055,00 € TTC</b>.",
            styles["attestation"],
            GRIS_FOND,
            GRIS_CLAIR,
            usable,
        )
    )

    story.append(Paragraph("Fait à Lyon, le 20 juillet 2026.", styles["lieu_date"]))

    # Signatures
    sig_w = (usable - 6 * mm) / 2
    sig_style = TableStyle(
        [
            ("BOX", (0, 0), (-1, -1), 0.5, GRIS_CLAIR),
            ("BACKGROUND", (0, 0), (-1, -1), BLANC),
            ("TOPPADDING", (0, 0), (-1, -1), 1),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (0, 0), 4),
            ("BOTTOMPADDING", (0, -1), (0, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]
    )
    sig_left = Table(
        [
            [Paragraph("Pour ENERGIA CONSEIL", styles["sig_titre"])],
            [Paragraph("Sylvain LEMBELEMBE", styles["sig_nom"])],
            [Paragraph("Président", styles["sig_qual"])],
            [Paragraph("Signature : ______________________", styles["sig_ligne"])],
        ],
        colWidths=[sig_w],
    )
    sig_right = Table(
        [
            [Paragraph("Pour SRD CONSEILS", styles["sig_titre"])],
            [Paragraph("Damien RICHARD", styles["sig_nom"])],
            [Paragraph("Président", styles["sig_qual"])],
            [Paragraph("Signature : ______________________", styles["sig_ligne"])],
        ],
        colWidths=[sig_w],
    )
    sig_left.setStyle(sig_style)
    sig_right.setStyle(sig_style)

    sig_row = Table(
        [[sig_left, sig_right]],
        colWidths=[sig_w + 3 * mm, sig_w + 3 * mm],
    )
    sig_row.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (0, 0), 0),
                ("RIGHTPADDING", (0, 0), (0, 0), 3 * mm),
                ("LEFTPADDING", (1, 0), (1, 0), 3 * mm),
                ("RIGHTPADDING", (1, 0), (1, 0), 0),
            ]
        )
    )
    story.append(KeepTogether([sig_row]))

    return story


def generer_pdf():
    """Génère la note de rapprochement A4 portrait."""
    page_w, _page_h = A4
    usable = page_w - 2 * MARGIN

    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=BANDEAU_H + 3 * mm,
        bottomMargin=1.2 * cm,
        title="Note de rapprochement — Encaissement ENERGIA et règlement SRD CONSEILS",
        author="ENERGIA CONSEIL",
    )
    styles = _styles()
    doc.build(
        _build_story(usable, styles),
        onFirstPage=_draw_bandeau,
        onLaterPages=_draw_bandeau,
    )
    return OUTPUT_PDF


if __name__ == "__main__":
    chemin = generer_pdf()
    if not chemin.is_file() or chemin.stat().st_size == 0:
        raise SystemExit(f"Échec : le PDF n'a pas été créé correctement ({chemin})")
    print(f"PDF créé avec succès : {chemin}")
    print(f"Taille : {chemin.stat().st_size} octets")
