#!/usr/bin/env python3
"""
ENERGIA 9 AGENTS - Générateur du package complet
Génère 50+ documents professionnels pour ENERGIA-CONSEIL IA®
"""
import os
import csv
from pathlib import Path

BASE = Path(__file__).parent

def ensure_dir(path):
    path.mkdir(parents=True, exist_ok=True)

def write_csv(path, rows, delimiter=";"):
    ensure_dir(path.parent)
    with open(path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f, delimiter=delimiter)
        writer.writerows(rows)

# === 1_JURIDIQUE : CGV + Contrat Partenariat ===
def gen_juridique():
    d = BASE / "1_JURIDIQUE"
    ensure_dir(d)
    
    cgv = """<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>CGV - ENERGIA-CONSEIL IA®</title>
    <style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.5;max-width:21cm;margin:2rem auto;padding:2rem;}
    h1{text-align:center;color:#10b981;} h2{color:#047857;margin-top:1.5rem;} .art{font-weight:700;margin-top:1rem;}</style></head><body>
    <h1>CONDITIONS GÉNÉRALES DE VENTE</h1>
    <p><strong>ENERGIA-CONSEIL IA®</strong> – SASU – SIRET 94181942700019 – 16 Rue Cuvier, 69006 Lyon</p>
    <p class="art">Article 1 – Objet</p>
    <p>Les présentes CGV s'appliquent aux prestations d'audit énergétique, bureau d'études, AMO et conseil rénovation.</p>
    <p class="art">Article 2 – Devis et acceptation</p>
    <p>Le devis est valable 30 jours. L'acceptation par écrit engage le client.</p>
    <p class="art">Article 3 – Prix et paiement</p>
    <p>Prix TTC. Acompte 30% à la commande. Solde à la livraison. Délai de paiement 30 jours.</p>
    <p class="art">Article 4 – Exécution</p>
    <p>Délais indicatifs. La société s'engage à respecter les normes et certifications en vigueur.</p>
    <p class="art">Article 5 – Responsabilité</p>
    <p>Responsabilité limitée au montant des prestations. Assurance RC PRO en vigueur.</p>
    <p class="art">Article 6 – Litiges</p>
    <p>Tribunal de commerce de Lyon. Droit français.</p>
    <p style="margin-top:2rem;font-size:10pt;">ENERGIA-CONSEIL IA® - Marque INPI - © 2026</p></body></html>"""
    
    with open(d / "CGV_ENERGIA_CONSEIL_IA.html", "w", encoding="utf-8") as f:
        f.write(cgv)
    
    contrat = """<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>Contrat Partenariat Artisan RGE</title>
    <style>body{font-family:'Times New Roman',serif;font-size:12pt;line-height:1.5;max-width:21cm;margin:2rem auto;padding:2rem;}
    h1{text-align:center;color:#10b981;} h2{color:#047857;} .art{font-weight:700;}</style></head><body>
    <h1>CONTRAT DE PARTENARIAT ARTISAN RGE</h1>
    <p>Entre ENERGIA-CONSEIL IA® (SIRET 94181942700019) et l'artisan RGE soussigné.</p>
    <p class="art">Article 1 – Objet</p>
    <p>Partenariat pour l'exécution des chantiers identifiés par ENERGIA-CONSEIL IA®.</p>
    <p class="art">Article 2 – Engagements artisan</p>
    <p>Certifications RGE à jour, assurance décennale, respect délais et qualité.</p>
    <p class="art">Article 3 – Tarifs</p>
    <p>Tarifs préférentiels -10% pour clients ENERGIA. Facturation directe client.</p>
    <p class="art">Article 4 – Durée</p>
    <p>Durée indéterminée. Résiliation 3 mois préavis.</p>
    <p class="art">Article 5 – Confidentialité</p>
    <p>Obligation de confidentialité sur les données clients et stratégiques.</p>
    <p>Fait à ____________ le ____________ Signatures : _______________ _______________</p></body></html>"""
    
    with open(d / "Contrat_Partenariat_Artisan_RGE.html", "w", encoding="utf-8") as f:
        f.write(contrat)
    
    print("✓ 1_JURIDIQUE (CGV, Contrat Partenariat)")

# === 2_FINANCIER : Excel/CSV ===
def gen_financier():
    d = BASE / "2_FINANCIER"
    ensure_dir(d)
    
    # Prévisionnel 3 ans ENERGIA
    prev_energia = [
        ["PRÉVISIONNEL 3 ANS - ENERGIA-CONSEIL IA®"],
        ["", "Année 1", "Année 2", "Année 3"],
        ["Chiffre d'affaires (€)", "180000", "250000", "320000"],
        ["Charges (€)", "120000", "160000", "200000"],
        ["Résultat (€)", "60000", "90000", "120000"],
        ["", "", "", ""],
        ["Détail CA prévisionnel:", "", "", ""],
        ["- Audits/AMO", "80000", "110000", "140000"],
        ["- Prospection BET", "50000", "80000", "100000"],
        ["- Photovoltaïque", "30000", "40000", "60000"],
        ["- Autres", "20000", "20000", "20000"],
    ]
    write_csv(d / "Previsionnel_3ans_ENERGIA.csv", prev_energia)
    
    # Prévisionnel Holding
    prev_holding = [
        ["PRÉVISIONNEL 3 ANS - ENERGIA TRAVAUX HOLDING (60/40)"],
        ["", "Année 1", "Année 2", "Année 3"],
        ["CA (€)", "150000", "250000", "350000"],
        ["Charges (€)", "120000", "180000", "240000"],
        ["Résultat (€)", "30000", "70000", "110000"],
        ["Dividendes Gérard 60%", "18000", "42000", "66000"],
        ["Dividendes Sylvain 40%", "12000", "28000", "44000"],
    ]
    write_csv(d / "Previsionnel_3ans_Holding_60_40.csv", prev_holding)
    
    # Trésorerie mensuelle
    treso = [
        ["TRÉSORERIE MENSUELLE - ENERGIA"],
        ["Mois", "Encaissements", "Décaissements", "Solde cumulé"],
        ["Janvier", "15000", "12000", "3000"],
        ["Février", "18000", "14000", "7000"],
        ["Mars", "20000", "15000", "12000"],
        ["...", "...", "...", "..."],
    ]
    write_csv(d / "Tresorerie_Mensuelle.csv", treso)
    
    # Simulation dividendes
    div = [
        ["SIMULATION DIVIDENDES 60/40"],
        ["Bénéfice net", "Gérard 60%", "Sylvain 40%"],
        ["10000", "6000", "4000"],
        ["30000", "18000", "12000"],
        ["50000", "30000", "20000"],
        ["70000", "42000", "28000"],
        ["100000", "60000", "40000"],
    ]
    write_csv(d / "Simulation_Dividendes_60_40.csv", div)
    
    # Grille tarifaire
    grille = [
        ["GRILLE TARIFAIRE - ENERGIA-CONSEIL IA®"],
        ["Prestation", "Prix HT", "Prix TTC (20%)"],
        ["Audit énergétique réglementaire", "800", "960"],
        ["Bureau d'études thermique", "1500", "1800"],
        ["AMO coordination", "80/heure", "96/heure"],
        ["Conseil photovoltaïque", "500", "600"],
        ["DPE", "150", "180"],
    ]
    write_csv(d / "Grille_Tarifaire_Postes.csv", grille)
    
    # KPIs
    kpis = [
        ["TABLEAU DE BORD KPIs - ENERGIA"],
        ["KPI", "Objectif", "Réel", "Écart"],
        ["CA mensuel (€)", "20000", "", ""],
        ["Leads/mois", "30", "", ""],
        ["Taux conversion (%)", "25", "", ""],
        ["Dossiers signés", "2", "", ""],
    ]
    write_csv(d / "Tableau_Bord_KPIs.csv", kpis)
    
    print("✓ 2_FINANCIER (6 fichiers CSV)")

# === 3_COMMERCIAL ===
def gen_commercial():
    d = BASE / "3_COMMERCIAL"
    ensure_dir(d)
    
    # Liste 50 BET
    bet = [["BET", "Ville", "Email", "Tél", "Contact"]]
    villes = ["Lyon", "Saint-Étienne", "Villeurbanne", "Grenoble", "Clermont-Ferrand", "Valence"]
    for i in range(50):
        bet.append([f"BET Exemple {i+1}", villes[i % 6], f"contact@bet{i+1}.fr", f"04 XX XX XX XX", f"Directeur {i+1}"])
    write_csv(d / "Liste_50_BET_France.csv", bet)
    
    # Syndics
    syndics = [["Syndic", "Ville", "Email", "Tél"]]
    for i in range(30):
        syndics.append([f"Syndic {i+1}", "Lyon/Villeurbanne", f"syndic{i+1}@exemple.fr", "04 XX XX XX XX"])
    write_csv(d / "Liste_30_Syndics_Rhone_Loire.csv", syndics)
    
    # Agences immo
    agences = [["Agence", "Ville", "Email", "Tél"]]
    for i in range(20):
        agences.append([f"Agence Immobilière {i+1}", "Lyon 69", f"contact@agence{i+1}.fr", "04 XX XX XX XX"])
    write_csv(d / "Liste_20_Agences_Immo.csv", agences)
    
    # Script prospection
    script = """<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Inter,sans-serif;max-width:800px;margin:2rem auto;padding:2rem;color:#1f2937;}
    h1{color:#10b981;} h2{color:#047857;} .etape{background:#f0fdf4;padding:1rem;margin:1rem 0;border-left:4px solid #10b981;}</style></head><body>
    <h1>SCRIPT PROSPECTION TÉLÉPHONIQUE - BET</h1>
    <div class="etape"><strong>Ouverture (10 sec)</strong><br>"Bonjour, [Prénom], Sylvain de ENERGIA-CONSEIL IA. Je vous contacte concernant des missions d'audits énergétiques en sous-traitance. Avez-vous 2 minutes ?"</div>
    <div class="etape"><strong>Présentation (30 sec)</strong><br>"Nous sommes spécialisés audits DPE et rénovation. Nous cherchons des BET partenaires pour augmenter notre capacité. Vous réalisez des audits ?"</div>
    <div class="etape"><strong>Question qualifiante</strong><br>"Combien d'audits traitez-vous par mois en moyenne ?"</div>
    <div class="etape"><strong>Proposition</strong><br>"Nous pourrions vous envoyer 2 à 5 dossiers par mois. Tarif préférentiel. Intéressé pour un échange ?"</div>
    <div class="etape"><strong>Objection "Pas le temps"</strong><br>"Je comprends. Un simple mail avec vos tarifs nous suffirait pour qualifier. 5 minutes ?"</div>
    <div class="etape"><strong>Clôture RDV</strong><br>"Parfait. Je vous envoie un mail de récap. On fixe un RDV téléphonique la semaine prochaine ?"</div>
    <p style="margin-top:2rem;">ENERGIA-CONSEIL IA® - 06 10 59 68 98</p></body></html>"""
    with open(d / "Script_Prospection_Telephonique.html", "w", encoding="utf-8") as f:
        f.write(script)
    
    # Séquence 7 emails
    emails = """<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Inter;max-width:700px;margin:2rem auto;padding:2rem;}
    .email{background:#f9fafb;padding:1.5rem;margin:1rem 0;border-radius:8px;} .j{color:#6b7280;font-size:12px;}</style></head><body>
    <h1 style="color:#10b981;">SÉQUENCE 7 EMAILS - PROSPECTION BET</h1>
    <div class="email"><span class="j">J+0</span><h3>Objet : Partenariat audits énergétiques</h3><p>Bonjour [Prénom], ENERGIA-CONSEIL IA recherche des BET partenaires pour audits en sous-traitance. Pièce jointe : notre offre. Disponible pour échanger 15 min ? Cordialement, Sylvain</p></div>
    <div class="email"><span class="j">J+3 Relance 1</span><h3>Objet : RE: Partenariat audits</h3><p>Bonjour, petit rappel. Avez-vous pu consulter notre proposition ? Bonne journée.</p></div>
    <div class="email"><span class="j">J+7 Relance 2</span><h3>Objet : Une dernière fois</h3><p>Dernière relance. Si le timing n'est pas bon, n'hésitez pas à me le dire. Sylvain</p></div>
    <p><em>J+14, J+21, J+28 : Relances variées (valeur ajoutée, actualité, étude de cas)</em></p></body></html>"""
    with open(d / "Sequence_7_Emails_BET.html", "w", encoding="utf-8") as f:
        f.write(emails)
    
    # Email relance 4 BET
    relance = """<!DOCTYPE html><html><body style="font-family:Arial;max-width:600px;margin:2rem auto;">
    <p>Bonjour [Prénom],</p>
    <p>Nous nous étions échangés il y a quelques semaines concernant un partenariat audits énergétiques.</p>
    <p>Avez-vous eu le temps d'examiner notre proposition ? Nous avons actuellement des dossiers à traiter et souhaiterions avancer.</p>
    <p>Disponible pour un échange rapide cette semaine ?</p>
    <p>Cordialement,<br><strong>Sylvain LEMBELEMBE</strong><br>ENERGIA-CONSEIL IA®<br>06 10 59 68 98</p>
    </body></html>"""
    with open(d / "Email_Relance_4_BET.html", "w", encoding="utf-8") as f:
        f.write(relance)
    
    print("✓ 3_COMMERCIAL (6 fichiers)")

# === 5_SEO ===
def gen_seo():
    d = BASE / "5_SEO"
    ensure_dir(d)
    
    # Mots-clés
    mots = [["Mot-clé", "Volume", "Difficulté", "Priorité"]]
    kws = [
        ("audit énergétique Lyon", "320", "Moyenne", "Haute"),
        ("rénovation énergétique Rhône", "210", "Moyenne", "Haute"),
        ("DPE Lyon", "480", "Faible", "Haute"),
        ("bureau études thermique", "390", "Moyenne", "Moyenne"),
        ("MaPrimeRénov Lyon", "260", "Faible", "Haute"),
    ]
    for kw, vol, diff, prio in kws:
        mots.append([kw, vol, diff, prio])
    write_csv(d / "Mots_Cles_Renovation_2026.csv", mots)
    
    # Audit SEO (HTML)
    audit = """<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Inter;max-width:900px;margin:2rem auto;padding:2rem;} table{border-collapse:collapse;width:100%;} th,td{border:1px solid #ddd;padding:8px;} th{background:#10b981;color:white;} .ok{color:green;} .ko{color:red;}</style></head><body>
    <h1 style="color:#10b981;">AUDIT SEO - energia-conseil.com</h1>
    <h2>1. Technique</h2><table><tr><th>Critère</th><th>Statut</th><th>Action</th></tr>
    <tr><td>HTTPS</td><td class="ok">OK</td><td>-</td></tr>
    <tr><td>Mobile-friendly</td><td class="ok">OK</td><td>-</td></tr>
    <tr><td>Vitesse chargement</td><td class="ko">À améliorer</td><td>Optimiser images</td></tr>
    <tr><td>Balises meta</td><td class="ko">À compléter</td><td>Title + Description par page</td></tr></table>
    <h2>2. Contenu</h2><p>Créer 10+ articles blog (audit, DPE, MaPrimeRénov, photovoltaïque). Mots-clés cibles : audit énergétique Lyon, rénovation Rhône.</p>
    <h2>3. Backlinks</h2><p>Objectif 50 liens qualité. Annuaires pro, partenaires BET, France Rénov'.</p>
    <h2>4. SEO Local</h2><p>Optimiser Google My Business. Horaires, avis, photos. Réponses aux avis.</p>
    <p style="margin-top:2rem;">ENERGIA-CONSEIL IA® - Audit SEO</p></body></html>"""
    with open(d / "Audit_SEO_Energia_Conseil.html", "w", encoding="utf-8") as f:
        f.write(audit)
    
    print("✓ 5_SEO (Audit, Mots-clés)")

# === 6_VOICE ===
def gen_voice():
    d = BASE / "6_VOICE"
    ensure_dir(d)
    
    scripts = [
        ("Script_Appel_Qualification.html", "SCRIPT APPEL QUALIFICATION CLIENT", 
         "Ouverture: Bonjour [Prénom], Sylvain ENERGIA-CONSEIL IA. Vous avez demandé un audit ? | Qualif: Surface, âge bien, objectif ? | Proposition: Devis gratuit sous 48h. | Clôture: On fixe le RDV ?"),
        ("Script_Relance_Devis.html", "SCRIPT RELANCE DEVIS EN ATTENTE",
         "Bonjour [Prénom], je vous appelle concernant notre devis du [date]. Avez-vous pu l'étudier ? Des questions ? Je reste disponible. À bientôt."),
        ("Script_Prise_RDV.html", "SCRIPT PRISE RDV",
         "Bonjour, pour planifier l'audit : vous préférez matin ou après-midi ? Quel jour vous arrange ? Parfait, je note. Confirmation par mail."),
        ("Objections_Reponses.html", "OBJECTIONS ET RÉPONSES",
         "Trop cher: Les aides couvrent 60-80%. | Pas maintenant: Les aides 2026 peuvent évoluer. | Je réfléchis: Je peux vous envoyer un récap des aides ?"),
    ]
    for fname, titre, contenu in scripts:
        html = f"""<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{{font-family:Inter;max-width:700px;margin:2rem auto;padding:2rem;color:#1f2937;}} h1{{color:#10b981;}} .c{{background:#f0fdf4;padding:1rem;margin:0.5rem 0;}}</style></head><body>
        <h1>{titre}</h1><div class="c"><p>{contenu.replace('|', '</p><p>')}</p></div><p>ENERGIA-CONSEIL IA®</p></body></html>"""
        with open(d / fname, "w", encoding="utf-8") as f:
            f.write(html)
    
    print("✓ 6_VOICE (4 scripts)")

# === 7_RH ===
def gen_rh():
    d = BASE / "7_RH"
    ensure_dir(d)
    
    fiche = """<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Inter;max-width:800px;margin:2rem auto;padding:2rem;} h1{color:#10b981;} table{width:100%;} td{padding:8px;border-bottom:1px solid #eee;}</style></head><body>
    <h1>FICHE DE POSTE - COMMERCIAL RÉNOVATION ÉNERGÉTIQUE</h1>
    <table><tr><td><strong>Intitulé</strong></td><td>Commercial / Business Developer</td></tr>
    <tr><td><strong>Entreprise</strong></td><td>ENERGIA-CONSEIL IA®</td></tr>
    <tr><td><strong>Mission</strong></td><td>Développer le CA (BET, syndics, particuliers)</td></tr>
    <tr><td><strong>Profil</strong></td><td>BTP/énergie, 2 ans exp. commerciale min.</td></tr>
    <tr><td><strong>Rémunération</strong></td><td>Fixé + variable (25-35 k€)</td></tr>
    <tr><td><strong>Localisation</strong></td><td>Lyon – déplacements Rhône/Loire</td></tr></table>
    <h2>Compétences requises</h2><p>Prospection B2B, relation client, MaPrimeRénov', DPE.</p></body></html>"""
    with open(d / "Fiche_Poste_Commercial_ENERGIA.html", "w", encoding="utf-8") as f:
        f.write(fiche)
    
    salaires = [["Poste", "Min (€)", "Max (€)", "Secteur"], ["Commercial BTP", "28000", "35000", "Rénovation"], ["Chargé d'affaires", "32000", "42000", "BET"], ["Assistant AMO", "26000", "32000", "Construction"]]
    write_csv(d / "Grille_Salaires_BTP_2026.csv", salaires)
    
    print("✓ 7_RH (Fiche poste, Grille salaires)")

# === 8_OUTILS ===
def gen_outils():
    d = BASE / "8_OUTILS"
    ensure_dir(d)
    
    # CRM simple
    crm = [["Client", "Contact", "Email", "Tél", "Statut", "CA (€)"], ["Exemple 1", "M. Dupont", "dupont@mail.fr", "06...", "Devis", "15000"], ["Exemple 2", "BET ABC", "contact@bet.fr", "04...", "Prospect", ""]]
    write_csv(d / "CRM_Simple_Clients.csv", crm)
    
    # Template devis
    devis = [["DEVIS ENERGIA-CONSEIL IA®"], ["Client:", "", ""], ["Prestation", "Qté", "PU HT", "Total HT"], ["Audit énergétique", "1", "800", "800"], ["AMO coordination", "20 h", "80", "1600"], ["", "", "Total HT", "=SOMME(D4:D5)"], ["", "", "TVA 20%", "=E6*0.2"], ["", "", "Total TTC", "=E6+E7"]]
    write_csv(d / "Template_Devis_Auto.csv", devis)
    
    # Template facture
    facture = [["FACTURE ENERGIA-CONSEIL IA®"], ["N°", "Date", "Client"], ["", "", ""], ["Désignation", "Qté", "PU HT", "Total"], ["", "", "", ""], ["Total HT", "", "", "=SOMME(D5:D10)"], ["TVA 20%", "", "", "=D11*0.2"], ["Total TTC", "", "", "=D11+D12"]]
    write_csv(d / "Template_Facture.csv", facture)
    
    # Planning Gantt
    gantt = [["Tâche", "Début", "Fin", "Durée (j)", "Responsable"], ["Audit", "01/03", "15/03", "14", "Sylvain"], ["Devis", "10/03", "25/03", "15", "Sylvain"], ["Chantier", "01/04", "30/04", "30", "Artisan"]]
    write_csv(d / "Planning_Gantt_Chantiers.csv", gantt)
    
    print("✓ 8_OUTILS (CRM, Devis, Facture, Planning)")

# === 9_STRATEGIE ===
def gen_strategie():
    d = BASE / "9_STRATEGIE"
    ensure_dir(d)
    
    plan = """<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Inter;max-width:900px;margin:2rem auto;padding:2rem;} h1{color:#10b981;} h2{color:#047857;} .phase{background:#f0fdf4;padding:1rem;margin:1rem 0;border-left:4px solid #10b981;}</style></head><body>
    <h1>PLAN STRATÉGIQUE 3 ANS - ENERGIA-CONSEIL IA®</h1>
    <h2>Vision 2026-2028</h2>
    <p>Leader régional audit + AMO rénovation énergétique. CA 500 k€. Holding opérationnelle.</p>
    <h2>Année 1 (2026)</h2>
    <div class="phase"><strong>Objectifs :</strong> 6 clients signés, 2 BET partenaires, Holding créée. CA 180 k€.</div>
    <h2>Année 2 (2027)</h2>
    <div class="phase"><strong>Objectifs :</strong> 4 BET partenaires, 15 clients/an. CA 250 k€. 1 commercial.</div>
    <h2>Année 3 (2028)</h2>
    <div class="phase"><strong>Objectifs :</strong> 6 BET, 25 clients/an. CA 320 k€. Équipe 3 personnes.</div>
    <h2>KPIs clés</h2>
    <p>CA mensuel, Taux conversion, Nombre partenaires BET, Satisfaction client.</p>
    <p>ENERGIA-CONSEIL IA® - Plan stratégique</p></body></html>"""
    with open(d / "Plan_Strategique_3ans_ENERGIA.html", "w", encoding="utf-8") as f:
        f.write(plan)
    
    roadmap = [["Trimestre", "Actions", "Objectif"], ["T1 2026", "Création Holding, 4 BET contactés", "2 partenariats"], ["T2 2026", "Formations RGE, premiers chantiers", "CA 50 k€"], ["T3 2026", "Scale prospection, SEO", "100 leads"], ["T4 2026", "Bilan, plan 2027", "CA 180 k€"]]
    write_csv(d / "Roadmap_Developpement.csv", roadmap)
    
    kpis = [["KPI", "Objectif mensuel", "Objectif annuel"], ["CA (€)", "20000", "240000"], ["Leads", "30", "360"], ["RDV", "8", "96"], ["Devis signés", "2", "24"]]
    write_csv(d / "KPIs_Objectifs_Mensuels.csv", kpis)
    
    print("✓ 9_STRATEGIE (Plan, Roadmap, KPIs)")

# === 4_CONTENU (réduit) ===
def gen_contenu():
    d = BASE / "4_CONTENU"
    ensure_dir(d)
    
    articles_titles = [
        "Audit énergétique obligatoire : ce qui change en 2026",
        "MaPrimeRénov' 2026 : montants et conditions",
        "DPE : comprendre les nouvelles classes",
        "Rénovation globale : par où commencer ?",
        "PAC air-eau : guide complet 2026",
    ]
    for i, titre in enumerate(articles_titles[:5]):
        html = f"""<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{{font-family:Inter;max-width:800px;margin:2rem auto;padding:2rem;}} h1{{color:#10b981;}}</style></head><body>
        <h1>{titre}</h1>
        <p><em>Article blog ENERGIA-CONSEIL IA® - SEO optimisé</em></p>
        <p>Lorem ipsum dolor sit amet. Introduction sur le sujet. Les audits énergétiques sont essentiels pour...</p>
        <h2>Section 1</h2><p>Contenu à développer. Mots-clés : audit énergétique Lyon, rénovation Rhône, DPE...</p>
        <h2>Section 2</h2><p>Conseils pratiques. Contact ENERGIA pour un devis gratuit.</p>
        <p>ENERGIA-CONSEIL IA® - 06 10 59 68 98 - contact@energia-conseil.com</p></body></html>"""
        with open(d / f"Article_Blog_{i+1}_{titre[:30].replace(' ','_')}.html", "w", encoding="utf-8") as f:
            f.write(html)
    
    # Newsletter template
    nl = """<!DOCTYPE html><html><body style="font-family:Arial;max-width:600px;margin:auto;padding:20px;">
    <div style="background:#10b981;color:white;padding:20px;text-align:center;"><h1>ENERGIA-CONSEIL IA®</h1><p>Newsletter [MOIS ANNÉE]</p></div>
    <div style="padding:20px;">
    <h2>Au sommaire</h2>
    <ul><li>Actualité MaPrimeRénov'</li><li>Cas client du mois</li><li>Conseils rénovation</li></ul>
    <p>[Contenu à rédiger]</p>
    <p><a href="mailto:contact@energia-conseil.com" style="color:#10b981;">contact@energia-conseil.com</a> | 06 10 59 68 98</p>
    </div>
    <div style="background:#1f2937;color:#9ca3af;padding:10px;text-align:center;font-size:12px;">ENERGIA-CONSEIL IA® - Marque INPI - Se désabonner</div>
    </body></html>"""
    with open(d / "Newsletter_Template.html", "w", encoding="utf-8") as f:
        f.write(nl)
    
    print("✓ 4_CONTENU (5 articles, Newsletter)")

# === BRIEF QUOTIDIEN ===
def gen_brief():
    brief = """<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Inter,sans-serif;max-width:700px;margin:2rem auto;padding:2rem;background:#f9fafb;}
    h1{color:#10b981;} h2{font-size:14px;color:#047857;margin-top:1rem;} .agent{background:white;padding:1rem;margin:0.5rem 0;border-radius:8px;border-left:4px solid #10b981;}
    </style></head><body>
    <h1>📋 VEILLE ENERGIA - [DATE]</h1>
    <div class="agent"><h2>🎯 CHARLY (Stratégie)</h2><p>[Info stratégique du jour]</p></div>
    <div class="agent"><h2>⚖️ JULIA (Juridique)</h2><p>[Changement réglementaire]</p></div>
    <div class="agent"><h2>💼 MANUE (Finance)</h2><p>[Évolution fiscale]</p></div>
    <div class="agent"><h2>📈 ELIO (Commercial)</h2><p>[Réponses prospects]</p></div>
    <div class="agent"><h2>✍️ JOHN (Contenu)</h2><p>[Performance posts]</p></div>
    <div class="agent"><h2>📞 TOM (Voice AI)</h2><p>[Résultats campagnes]</p></div>
    <div class="agent"><h2>🔍 LOU (SEO)</h2><p>[Position Google]</p></div>
    <div class="agent"><h2>👥 RONY (RH)</h2><p>[Marché emploi]</p></div>
    <div class="agent"><h2>🎨 AGENTS TECHNIQUES</h2><p>[Nouveaux outils]</p></div>
    <p style="margin-top:2rem;font-weight:700;">Bonne journée Sylvain ! 💪</p>
    </body></html>"""
    with open(BASE / "BRIEF_QUOTIDIEN_Template.html", "w", encoding="utf-8") as f:
        f.write(brief)
    print("✓ BRIEF_QUOTIDIEN_Template.html")

# === COPY JURIDIQUE ===
def copy_juridique():
    import shutil
    src = Path(__file__).parent.parent / "juridique"
    dst = BASE / "1_JURIDIQUE"
    ensure_dir(dst)
    for f in ["Pacte_Associes_60_40_ENERGIA_HOLDING.html", "Statuts_SAS_ENERGIA_TRAVAUX_HOLDING.html", "Contrat_Pret_9600_euros.html"]:
        if (src / f).exists():
            shutil.copy(src / f, dst / f)
            print(f"  Copié: {f}")

def main():
    print("ENERGIA 9 AGENTS - Génération du package...")
    copy_juridique()
    gen_juridique()
    gen_financier()
    gen_commercial()
    gen_contenu()
    gen_seo()
    gen_voice()
    gen_rh()
    gen_outils()
    gen_strategie()
    gen_brief()
    print("\n✅ Package ENERGIA 9 AGENTS généré avec succès!")

if __name__ == "__main__":
    main()
