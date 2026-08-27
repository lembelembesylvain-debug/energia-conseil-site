#!/usr/bin/env python3
"""Facture ENERGIA CONSEIL → SRD CONSEILS — EC-FAC-2026-005 (dossier GRANVILLE)."""

from pathlib import Path
import sys

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

SCRIPT_DIR = Path(__file__).resolve().parent
OUTPUT_PDF = SCRIPT_DIR / "facture_energie_conseil_srd_granville_3178.pdf"

# Chronologie vérifiée : 004 / 004-RECT existent → prochain numéro = 005
NUMERO_FACTURE = "EC-FAC-2026-005"

BLEU_NUIT = colors.HexColor("#102640")
VERT_STATUT = colors.HexColor("#166534")
VERT_FOND = colors.HexColor("#DCFCE7")
GRIS_TEXTE = colors.HexColor("#2A2A2A")
GRIS_CLAIR = colors.HexColor("#D0D0D0")
GRIS_FOND = colors.HexColor("#F5F6F8")
GRIS_LIGNE = colors.HexColor("#E8EAEF")
BLANC = colors.white

BANDEAU_H = 16 * mm
MARGIN = 2 * cm
PAGE_W, PAGE_H = A4
CONTENT_W = PAGE_W - 2 * MARGIN


def _styles():
    return {
        "section": ParagraphStyle(
            "Section",
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=BLEU_NUIT,
            alignment=TA_LEFT,
            leading=11,
            spaceBefore=2,
            spaceAfter=3,
        ),
        "corps": ParagraphStyle(
            "Corps",
            fontName="Helvetica",
            fontSize=8.5,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=11,
        ),
        "label": ParagraphStyle(
            "Label",
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=BLEU_NUIT,
            alignment=TA_LEFT,
            leading=10,
        ),
        "valeur": ParagraphStyle(
            "Valeur",
            fontName="Helvetica",
            fontSize=8.5,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=11,
        ),
        "th": ParagraphStyle(
            "TH",
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=BLANC,
            alignment=TA_CENTER,
            leading=10,
        ),
        "td_l": ParagraphStyle(
            "TDL",
            fontName="Helvetica",
            fontSize=8,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=10.5,
        ),
        "td_c": ParagraphStyle(
            "TDC",
            fontName="Helvetica",
            fontSize=8,
            textColor=GRIS_TEXTE,
            alignment=TA_CENTER,
            leading=10.5,
        ),
        "td_r": ParagraphStyle(
            "TDR",
            fontName="Helvetica",
            fontSize=8,
            textColor=GRIS_TEXTE,
            alignment=TA_RIGHT,
            leading=10.5,
        ),
        "tot_l": ParagraphStyle(
            "TotL",
            fontName="Helvetica",
            fontSize=9,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=12,
        ),
        "tot_r": ParagraphStyle(
            "TotR",
            fontName="Helvetica",
            fontSize=9,
            textColor=GRIS_TEXTE,
            alignment=TA_RIGHT,
            leading=12,
        ),
        "tot_b_l": ParagraphStyle(
            "TotBL",
            fontName="Helvetica-Bold",
            fontSize=10,
            textColor=BLEU_NUIT,
            alignment=TA_LEFT,
            leading=13,
        ),
        "tot_b_r": ParagraphStyle(
            "TotBR",
            fontName="Helvetica-Bold",
            fontSize=10,
            textColor=BLEU_NUIT,
            alignment=TA_RIGHT,
            leading=13,
        ),
        "statut": ParagraphStyle(
            "Statut",
            fontName="Helvetica-Bold",
            fontSize=10,
            textColor=VERT_STATUT,
            alignment=TA_CENTER,
            leading=13,
        ),
        "mention": ParagraphStyle(
            "Mention",
            fontName="Helvetica",
            fontSize=8,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=10.5,
        ),
        "mention_i": ParagraphStyle(
            "MentionI",
            fontName="Helvetica-Oblique",
            fontSize=8,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=10.5,
        ),
        "banque": ParagraphStyle(
            "Banque",
            fontName="Helvetica",
            fontSize=8,
            textColor=GRIS_TEXTE,
            alignment=TA_LEFT,
            leading=10.5,
        ),
    }


def _bandeau():
    gauche = Paragraph(
        '<font color="white"><b>ENERGIA CONSEIL IA®</b></font>',
        ParagraphStyle(
            "BandeauG",
            fontName="Helvetica-Bold",
            fontSize=12,
            textColor=BLANC,
            alignment=TA_LEFT,
            leading=14,
        ),
    )
    droite = Paragraph(
        '<font color="white"><b>FACTURE</b></font>',
        ParagraphStyle(
            "BandeauD",
            fontName="Helvetica-Bold",
            fontSize=16,
            textColor=BLANC,
            alignment=TA_RIGHT,
            leading=18,
        ),
    )
    t = Table(
        [[gauche, droite]],
        colWidths=[CONTENT_W * 0.55, CONTENT_W * 0.45],
        rowHeights=[BANDEAU_H],
    )
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), BLEU_NUIT),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (0, 0), 10),
                ("RIGHTPADDING", (1, 0), (1, 0), 10),
                ("LEFTPADDING", (1, 0), (1, 0), 4),
                ("RIGHTPADDING", (0, 0), (0, 0), 4),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return t


def _bloc_parties(s):
    emetteur = [
        Paragraph("ÉMETTEUR", s["section"]),
        Paragraph("<b>ENERGIA CONSEIL</b>", s["corps"]),
        Paragraph("SAS — Capital social : 100 €", s["corps"]),
        Paragraph("16 rue Cuvier, 69006 Lyon", s["corps"]),
        Paragraph("SIRET : 941 819 427 00019", s["corps"]),
        Paragraph("Président : Sylvain LEMBELEMBE", s["corps"]),
        Paragraph("Téléphone : 06 10 59 68 98", s["corps"]),
        Paragraph("Email : lembelembe.sylvain@gmail.com", s["corps"]),
    ]
    client = [
        Paragraph("CLIENT", s["section"]),
        Paragraph("<b>SRD CONSEILS</b>", s["corps"]),
        Paragraph("Damien RICHARD", s["corps"]),
        Paragraph("49 Hameau des Cipières", s["corps"]),
        Paragraph("42210 Montrond-les-Bains", s["corps"]),
        Paragraph("SIRET : 903 542 371 R.C.S. Saint-Étienne", s["corps"]),
        Paragraph("Email : damien.srdconseil@gmail.com", s["corps"]),
        Paragraph("Téléphone : 06 72 68 09 68", s["corps"]),
    ]
    left = Table([[c] for c in emetteur], colWidths=[CONTENT_W * 0.48])
    right = Table([[c] for c in client], colWidths=[CONTENT_W * 0.48])
    box_style = TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, -1), GRIS_FOND),
            ("BOX", (0, 0), (-1, -1), 0.6, GRIS_CLAIR),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, 0), 6),
            ("BOTTOMPADDING", (0, -1), (-1, -1), 6),
            ("TOPPADDING", (0, 1), (-1, -1), 1),
            ("BOTTOMPADDING", (0, 0), (-1, -2), 1),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]
    )
    left.setStyle(box_style)
    right.setStyle(box_style)
    wrap = Table([[left, right]], colWidths=[CONTENT_W * 0.5, CONTENT_W * 0.5])
    wrap.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (0, 0), 6),
                ("LEFTPADDING", (1, 0), (1, 0), 6),
                ("RIGHTPADDING", (1, 0), (1, 0), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    return wrap


def _bloc_details(s):
    rows = [
        [Paragraph("Numéro", s["label"]), Paragraph(NUMERO_FACTURE, s["valeur"])],
        [Paragraph("Date d'émission", s["label"]), Paragraph("22 juillet 2026", s["valeur"])],
        [
            Paragraph("Date de règlement", s["label"]),
            Paragraph("Déjà réglée par virement", s["valeur"]),
        ],
        [
            Paragraph("Objet", s["label"]),
            Paragraph(
                "Prestation commerciale — Mise en relation et qualification de prospects",
                s["valeur"],
            ),
        ],
    ]
    t = Table(rows, colWidths=[3.6 * cm, CONTENT_W - 3.6 * cm])
    t.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 2),
                ("RIGHTPADDING", (0, 0), (-1, -1), 2),
                ("TOPPADDING", (0, 0), (-1, -1), 3),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
                ("LINEBELOW", (0, 0), (-1, -2), 0.4, GRIS_LIGNE),
            ]
        )
    )
    return t


def _tableau_prestations(s):
    header = [
        Paragraph("Désignation", s["th"]),
        Paragraph("Quantité", s["th"]),
        Paragraph("Prix unitaire", s["th"]),
        Paragraph("Montant", s["th"]),
    ]
    ligne = [
        Paragraph(
            "Prestation de mise en relation commerciale et qualification de prospects "
            "— dossier Luc GRANVILLE",
            s["td_l"],
        ),
        Paragraph("1", s["td_c"]),
        Paragraph("3 178,00 €", s["td_r"]),
        Paragraph("3 178,00 €", s["td_r"]),
    ]
    col_w = [CONTENT_W * 0.52, CONTENT_W * 0.12, CONTENT_W * 0.18, CONTENT_W * 0.18]
    t = Table([header, ligne], colWidths=col_w)
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), BLEU_NUIT),
                ("BACKGROUND", (0, 1), (-1, 1), colors.white),
                ("BOX", (0, 0), (-1, -1), 0.7, BLEU_NUIT),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, GRIS_CLAIR),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, 0), 7),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 7),
                ("TOPPADDING", (0, 1), (-1, 1), 9),
                ("BOTTOMPADDING", (0, 1), (-1, 1), 9),
            ]
        )
    )
    return t


def _bloc_totaux(s):
    rows = [
        [Paragraph("Total HT", s["tot_l"]), Paragraph("3 178,00 €", s["tot_r"])],
        [Paragraph("TVA", s["tot_l"]), Paragraph("0,00 €", s["tot_r"])],
        [Paragraph("Total TTC", s["tot_b_l"]), Paragraph("3 178,00 €", s["tot_b_r"])],
        [Paragraph("Net à payer", s["tot_b_l"]), Paragraph("0,00 €", s["tot_b_r"])],
    ]
    t = Table(rows, colWidths=[CONTENT_W * 0.55, CONTENT_W * 0.45])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), GRIS_FOND),
                ("BOX", (0, 0), (-1, -1), 0.6, GRIS_CLAIR),
                ("LINEBELOW", (0, 0), (-1, 1), 0.4, GRIS_LIGNE),
                ("LINEBELOW", (0, 2), (-1, 2), 0.6, BLEU_NUIT),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
            ]
        )
    )
    statut = Table(
        [[Paragraph("STATUT : RÉGLÉ", s["statut"])]],
        colWidths=[CONTENT_W],
        rowHeights=[10 * mm],
    )
    statut.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), VERT_FOND),
                ("BOX", (0, 0), (-1, -1), 0.8, VERT_STATUT),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ]
        )
    )
    return t, statut


def _bloc_mentions(s):
    return [
        Paragraph("TVA non applicable, article 293 B du CGI.", s["mention_i"]),
        Spacer(1, 2 * mm),
        Paragraph(
            "Règlement reçu par virement bancaire sur le compte professionnel "
            "Tiime d'ENERGIA CONSEIL.",
            s["mention"],
        ),
        Spacer(1, 2 * mm),
        Paragraph(
            "En cas de retard de paiement, des pénalités de retard sont exigibles "
            "au taux de trois fois le taux d'intérêt légal, ainsi qu'une indemnité "
            "forfaitaire pour frais de recouvrement de 40 €.",
            s["mention"],
        ),
    ]


def _bloc_banque(s):
    rows = [
        [Paragraph("COORDONNÉES BANCAIRES", s["section"])],
        [Paragraph("<b>Titulaire :</b> ENERGIA CONSEIL", s["banque"])],
        [Paragraph("<b>IBAN :</b> FR76 1679 8000 0100 0197 1554 609", s["banque"])],
        [Paragraph("<b>BIC :</b> TRZOFR21XXX", s["banque"])],
    ]
    t = Table(rows, colWidths=[CONTENT_W])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), GRIS_FOND),
                ("BOX", (0, 0), (-1, -1), 0.6, GRIS_CLAIR),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, 0), 6),
                ("BOTTOMPADDING", (0, -1), (-1, -1), 6),
                ("TOPPADDING", (0, 1), (-1, -1), 2),
                ("BOTTOMPADDING", (0, 0), (-1, -2), 2),
            ]
        )
    )
    return t


def build_pdf():
    s = _styles()
    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=A4,
        leftMargin=MARGIN,
        rightMargin=MARGIN,
        topMargin=MARGIN,
        bottomMargin=MARGIN,
        title=f"Facture {NUMERO_FACTURE}",
        author="ENERGIA CONSEIL",
    )

    totaux, statut = _bloc_totaux(s)

    story = [
        _bandeau(),
        Spacer(1, 6 * mm),
        _bloc_parties(s),
        Spacer(1, 5 * mm),
        Paragraph("DÉTAILS DE LA FACTURE", s["section"]),
        _bloc_details(s),
        Spacer(1, 5 * mm),
        Paragraph("PRESTATION", s["section"]),
        _tableau_prestations(s),
        Spacer(1, 4 * mm),
        totaux,
        Spacer(1, 3 * mm),
        statut,
        Spacer(1, 5 * mm),
        Paragraph("MENTIONS", s["section"]),
        *_bloc_mentions(s),
        Spacer(1, 4 * mm),
        _bloc_banque(s),
    ]

    doc.build(story)


def main():
    build_pdf()
    if not OUTPUT_PDF.is_file():
        print(f"ERREUR : le PDF n'a pas été créé : {OUTPUT_PDF}", file=sys.stderr)
        sys.exit(1)
    print(f"OK — PDF généré : {OUTPUT_PDF.name} ({OUTPUT_PDF.stat().st_size} octets)")
    print(f"Numéro : {NUMERO_FACTURE}")
    print(f"Chemin : {OUTPUT_PDF}")


if __name__ == "__main__":
    main()
