# CAHIER DES CHARGES COMPLET – ENERGIA-CONSEIL IA®
## Plateforme SaaS : Rénovation Énergétique + Photovoltaïque + Visualisation 3D

**Version :** 2.0  
**Date :** 25 février 2026  
**Auteur :** Sylvain LEMBELEMBE (ENERGIA-CONSEIL IA®)  
**Assistance :** Charly (Limova AI)

---

## 1. VISION & POSITIONNEMENT

**NOM :** ENERGIA-CONSEIL IA®  
**Statut :** Marque déposée INPI  
**Baseline :** "Audit Énergétique Intelligence Artificielle"

### MISSION
Simplifier et démocratiser la rénovation énergétique et le photovoltaïque grâce à l'Intelligence Artificielle et la visualisation 3D photoréaliste.

### PROPOSITION DE VALEUR
"Auditez votre maison en 30 minutes avec l'IA, visualisez-la en 3D photoréaliste (qualité GTA 5), et obtenez votre devis optimisé avec les aides maximales."

### CIBLES
- Particuliers (propriétaires occupants)
- Bailleurs (investisseurs immobiliers)
- Collectivités locales
- Professionnels (MAR, artisans RGE)

### DIFFÉRENCIATION
- Audit IA en 30 min (vs 3 semaines concurrent)
- Visualisation 3D photoréaliste (unique marché)
- Rénovation + Photovoltaïque intégré (tout-en-un)
- Marketplace artisans RGE (3 devis comparatifs)
- Prix transparent (calculateur temps réel)

**Valorisation cible :** 500 k€ – 1 M€

---

## 2. ARCHITECTURE TECHNIQUE

### STACK TECHNOLOGIQUE

**FRONTEND**
- Next.js 14 (React, App Router)
- TypeScript (typage fort)
- Tailwind CSS (design system)
- Shadcn/ui (composants)
- Three.js (rendu 3D web)
- Framer Motion (animations)

**BACKEND**
- Next.js API Routes (serverless)
- Supabase (BDD PostgreSQL + Auth + Storage)
- Vercel (hébergement + edge functions)

**IA & ANALYSE**
- OpenAI GPT-4 Vision (analyse photos)
- OpenAI API (calculs, recommandations)
- Computer Vision (détection éléments)
- Algorithmes calcul aides (MaPrimeRénov', CEE)

**3D & RENDU**
- Twinmotion 2026 (rendu photoréaliste)
- Unreal Engine 5 (visite virtuelle – Phase 2)
- Three.js (visualisation web)
- Blender (modélisation si besoin)

**PAIEMENT**
- Stripe (audits IA 199€, commissions)
- Webhooks (mise à jour statuts)

**EMAILS**
- Resend (emails transactionnels)
- Templates (devis, confirmations, relances)

**STOCKAGE**
- Supabase Storage (photos clients, PDF)
- Vercel Blob (fichiers temporaires)

**MONITORING**
- Vercel Analytics (performance)
- Sentry (erreurs)
- PostHog (analytics utilisateurs)

---

## 3. BASE DE DONNÉES (SUPABASE)

### TABLES PRINCIPALES

1. **users** (Utilisateurs)  
   - id (UUID, PK), email (unique), password_hash  
   - role (client, artisan, admin)  
   - profile (nom, prénom, téléphone, adresse)  
   - created_at, updated_at  

2. **audits** (Audits Énergétiques)  
   - id (UUID, PK), user_id (FK → users)  
   - adresse, ville, cp, departement  
   - type_logement (maison, appartement), surface_habitable, annee_construction  
   - dpe_actuel, dpe_vise  
   - photos_urls (array), rapport_pdf_url  
   - statut (brouillon, payé, terminé), montant (199€)  
   - created_at  

3. **projets_renovation** (Projets Rénovation)  
   - id (UUID, PK), audit_id (FK → audits), user_id (FK → users)  
   - travaux (JSONB), montant_ht, montant_ttc  
   - aides_totales (JSONB), reste_a_charge  
   - devis_pdf_url, statut (devis, signé, travaux, terminé)  
   - created_at  

4. **projets_pv** (Projets Photovoltaïque)  
   - id (UUID, PK), user_id (FK → users)  
   - adresse, orientation_toiture, pente, surface_disponible  
   - puissance_kwc (3, 6, 9), nb_panneaux  
   - type_panneaux (DualSun 500Wc), type_micro (Enphase IQ8+, APsystems DS3)  
   - batterie (oui/non, capacité kWh)  
   - production_annuelle_kwh, montant_ht, montant_ttc  
   - prime_autoconso, reste_a_charge, devis_pdf_url, statut  
   - created_at  

5. **artisans** (Artisans RGE)  
   - id (UUID, PK), user_id (FK → users)  
   - raison_sociale, siret, certifications_rge (array), specialites, zone_intervention  
   - tarifs (JSONB), note_moyenne, nb_avis, portfolio_urls  
   - created_at  

6. **devis_artisans**  
   - id (UUID, PK), projet_id (FK), artisan_id (FK → artisans)  
   - montant_ht, montant_ttc, delai_realisation  
   - statut (envoyé, accepté, refusé), created_at  

7. **prix_materiaux_2026** (Tarifs Marché 2026)  
   - id (UUID, PK), categorie, type, unite  
   - prix_min_ht, prix_max_ht, prix_moyen_ht  
   - annee (2026), source, date_maj  

8. **aides_2026** (Barèmes Aides 2026)  
   - id (UUID, PK), type_aide, profil (BLEU, JAUNE, ROSE, VIOLET)  
   - conditions (JSONB), montant_formule (JSONB)  
   - date_debut, date_fin, source_officielle  

9. **rendus_3d** (Rendus 3D Photoréalistes)  
   - id (UUID, PK), projet_id (FK), type (renovation, pv)  
   - modele_3d_url, images_avant (array), images_apres (array)  
   - video_url (MP4 4K), lien_visite_virtuelle  
   - created_at  

10. **paiements** (Paiements Stripe)  
    - id (UUID, PK), user_id (FK)  
    - type (audit, commission_artisan), montant, stripe_payment_id  
    - statut (pending, succeeded, failed), created_at  

---

## 4. MODULE 1 : RÉNOVATION ÉNERGÉTIQUE

### 4.1 Calculateur Aides Gratuit (Lead Magnet)

- **Page publique** sans inscription  
- **Saisie :** Adresse (autocomplete Google Maps), type logement, surface, année, RFR, parts fiscales, travaux envisagés (ITE, combles, plancher, fenêtres, PAC Air/Eau, PAC Air/Air, ballon thermo, VMC, PV)  
- **Calcul auto :** Profil (BLEU/JAUNE/ROSE/VIOLET), MaPrimeRénov', CEE, aides régionales, total aides, coût travaux (prix_materiaux_2026), reste à charge, éligibilité Éco-PTZ  
- **Affichage :** Montant aides (gros chiffre vert), détail par aide, reste à charge, taux prise en charge, CTA "Obtenir mon audit IA complet (199€)"  
- **Lead :** Email requis pour résultat détaillé → CRM + email "Voici vos aides + Prochaines étapes"  

### 4.2 Audit IA à distance (199€ – Remboursé si travaux)

**Processus :**  
1. **Upload photos** (10–15) : façade, toiture, combles, chauffage, fenêtres, compteur, factures (optionnel)  
2. **Questionnaire** : type, surface, occupants, chauffage, facture, travaux déjà faits, budget, motivations  
3. **Analyse IA (OpenAI Vision)** : type murs, état isolation, fenêtres, toiture, chauffage, déperditions par poste  
4. **Calculs auto** : conso actuelle, DPE actuel/visé, déperditions, travaux recommandés, économies, aides, reste à charge, ROI  
5. **Rapport PDF 58 pages** : I. Synthèse (2 p.) – II. Diagnostic (10 p.) – III. Scénarios (15 p.) – IV. Aides 2026 (10 p.) – V. Financement (8 p.) – VI. Mise en œuvre (10 p.) – VII. Annexes (3 p.)  

**Paiement :** Stripe 199€ → email + lien PDF. Remboursé si travaux signés via plateforme.  

### 4.3 Visualisation 3D photoréaliste (qualité type GTA 5)

- **Outils :** Twinmotion 2026, Unreal Engine 5 (Phase 2), Three.js  
- **Process :** Modélisation maison (2–4 h) → Version AVANT (état actuel dégradé) → Version APRÈS (ITE, menuiseries, toiture, PV si applicable) → Comparaison slider avant/après → Visite virtuelle web (Phase 2, FPS WASD, popups infos, minimap, VR optionnel)  
- **Livrables :** 5–10 images 4K, vidéo MP4 4K 1–2 min, lien visite (Phase 2), intégration dans audit PDF  
- **Temps :** 4–6 h (2–3 h avec expérience)  

### 4.4 Génération devis automatique

- **Entrées :** Travaux sélectionnés, surfaces/quantités, profil client  
- **Calcul :** Prix (prix_materiaux_2026), aides (aides_2026), reste à charge, financement (Éco-PTZ, VIVONS)  
- **PDF :** Template ENERGIA-CONSEIL IA®, détail travaux, totaux, aides, financement, résultats, planning, mentions légales, images 3D  
- **Envoi :** Email + lien signature (Yousign), relance J+3  

### 4.5 Marketplace artisans RGE

- **Client :** Sélection travaux + localisation → 3 devis RGE → comparaison (prix, délais, avis) → choix → signature en ligne  
- **Artisan :** Profil (RGE, portfolio, avis), leads qualifiés, envoi devis, suivi, facturation (commission 10–15 %)  
- **Avis :** Note 1–5, calcul moyenne, classement  
- **Commission :** 10–15 % travaux, Stripe Connect, versement (montant − commission)  

---

## 5. MODULE 2 : PHOTOVOLTAÏQUE

### 5.1 Calculateur PV gratuit (Lead Magnet)

- **Saisie :** Adresse, type toiture, orientation, pente, ombrage, conso annuelle  
- **IA :** Orientation optimale, surface disponible, ombrage, production potentielle  
- **Calcul :** Puissance 3/6/9 kWc, panneaux DualSun 500Wc, production, autoconsommation, économies, prix, prime autoconso, reste à charge, ROI, gain 20 ans  
- **Lead :** Email pour devis détaillé  

### 5.2 Configurateur installation PV

- **Puissance :** 3 / 6 / 9 kWc ou custom  
- **Panneaux :** DualSun Flash 500Wc (obligatoire) – 450 € HT/u, PPE2-V2, TVA 5,5 %  
- **Micro-onduleurs :** APsystems DS3 (recommandé) 180 € HT/u ou Enphase IQ8+ (premium) 215 € HT/u  
- **Batterie :** Sans / Virtuelle / 5 kWh (2 800 €) / 10 kWh (5 200 €)  
- **Options :** EMS inclus, borne VE +1 500 €, garantie 30 ans +500 €  
- **Prix et aides en temps réel**  

### 5.3 Simulation financière PV

- Investissement, TVA 5,5 %, prime autoconso, coût net  
- Production, autoconsommation, surplus, économies (autoconso × 0,20 € + revente × 0,04 €)  
- ROI, gain 10/20/30 ans  
- Graphiques : courbe économies cumulées, camembert, évolution prix électricité  

### 5.4 Visualisation 3D panneaux PV

- Rendu Twinmotion/Unreal : toiture AVANT (vide) / APRÈS (12 panneaux DualSun, micros, coffret)  
- Animations optionnelles (soleil → panneaux → maison → réseau, compteur à l’envers)  
- Vues : drone, façade, jardin, zoom panneaux  
- Livrables : 5–8 images 4K, vidéo 1 min, intégration devis PV  

### 5.5 Devis PV instantané

- PDF : en-tête, client, config (DualSun, APsystems, structure, EMS, main d’œuvre), tableau prix, HT/TTC, prime autoconso, reste à charge, simulation, ROI, images 3D, garanties 25 ans, mentions légales, signature  
- Envoi email + Yousign, relance J+3, J+7  

### 5.6 Marketplace installateurs PV RGE

- Profils : RGE QUALIPV, Partenaire DualSun, zone, portfolio, avis, délai, tarifs ENERGIA  
- Client : puissance + localisation → 3 devis → comparaison → choix → signature  
- Commission 10–15 % (ex. 6 kWc 10 800 € → 1 080–1 620 €), Stripe Connect  

---

## 6. TARIFS & BARÈMES 2026

### 6.1 Photovoltaïque 2026

- **Panneaux :** DualSun Flash 500Wc 450–500 € HT/u  
- **Micros :** APsystems DS3 170–200 € HT/u ; Enphase IQ8+ 200–230 € HT/u  
- **Batteries :** 5 kWh 2 800–3 200 € ; 10 kWh 5 200–6 000 € ; 15 kWh 7 500–8 500 €  
- **Packs TTC (TVA 5,5 %) :** 3 kWc 5 950 € ; 6 kWc 10 800 € ; 9 kWc 16 200 €  
- **Aides T1 2026 :** Prime autoconso ≤ 9 kWc 80 €/kWc ; 9–36 kWc 140 €/kWc ; rachat surplus ≤ 9 kWc 0,04 €/kWh (20 ans)  

### 6.2 Rénovation énergétique 2026

- **Isolation :** ITE laine roche R=4 160–180 €/m² ; combles R=7 35–45 €/m² ; plancher R=3 45–55 €/m² ; sous-sol R=4 45–55 €/m²  
- **Chauffage :** PAC Air/Eau 6 kW 11–13 k€ ; PAC Air/Air 5 splits 8,5–10,5 k€ ; ballon thermo 200 L 2,2–2,8 k€ ; désembouage 800–1 000 €  
- **Menuiseries :** Fenêtre PVC 800–1 200 € ; porte-fenêtre 1,2–1,8 k€ ; porte entrée 2,5–3,5 k€ ; volet motorisé 600–900 € ; Velux 1,2–1,6 k€  
- **VMC :** Simple flux hygro 1,5–2 k€ ; double flux 3,5–5 k€  
- **MaPrimeRénov' Parcours :** BLEU 80 % (max 40 k€), JAUNE 70 %, ROSE 60 %, VIOLET 45 % ; bonus sortie passoire supprimé 2026  

---

## 7. PARCOURS UTILISATEUR

### 7.1 Tunnel Rénovation

1. Landing → Calculateur aides  
2. Email → Lead CRM  
3. CTA Audit IA 199 €  
4. Upload photos + questionnaire  
5. Paiement Stripe 199 €  
6. IA (5–10 min)  
7. Rapport PDF 58 p. (email)  
8. CTA "3 devis artisans RGE"  
9. Sélection travaux → 3 devis  
10. Comparaison → Choix artisan  
11. Signature électronique  
12. Travaux (suivi)  
13. Réception → Paiement artisan (− commission 10–15 %)  

### 7.2 Tunnel Photovoltaïque

1. Landing PV → Calculateur  
2. Adresse + conso → Simulation  
3. Email → Lead  
4. CTA "Devis PV gratuit"  
5. Configurateur (puissance, micros, batterie)  
6. Visualisation 3D toiture  
7. Devis PDF (email)  
8. CTA "3 devis installateurs"  
9. 3 devis RGE QUALIPV  
10. Comparaison → Choix  
11. Signature  
12. Installation (suivi)  
13. Mise en service → Paiement (− commission)  

### 7.3 Tunnel Combiné (Réno + PV)

1. Calculateur rénovation  
2. "Ajoutez du photovoltaïque ?"  
3. Calcul combiné (aides optimisées)  
4. Audit IA (réno + PV)  
5. 3D (ITE + panneaux PV)  
6. Devis global  
7. Marketplace (artisans réno + PV)  
8. Signature  
9. Coordination (réno puis PV)  
10. Réception  

---

## 8. MONÉTISATION

- **Revenus directs :** Audits IA 199 €/audit (remboursé si travaux), coordination 6 000–10 000 €/projet  
- **Récurrents :** Commissions artisans réno 10–15 %, installateurs PV 10–15 %, abonnements artisans 49–99 €/mois  
- **Projection 6 mois :** 20 audits × 199 € + 3 réno × 8 000 € + 5 PV × 2 500 € + commissions ≈ 45 480 €/mois  
- **CA annuel :** 545 760 € | Valorisation (×5–10) : 2,7 M€ – 5,5 M€  

---

## 9. PLANNING DÉVELOPPEMENT (8 SEMAINES)

**Timeline :** 25 février 2026 → 20 avril 2026 (8 semaines)  
**Engagement :** 6–8 h/jour (400 h total)  
**Méthodologie :** Agile (sprints hebdomadaires)

---

### SEMAINE 1 (25/02 → 02/03) : CLOSING + FORMATION 3D

**Objectif :** Sécuriser clients + Apprendre Twinmotion

| Jour | Actions |
|------|--------|
| **Lundi 25/02** | 10h ☎️ Appel M. RICHARD (closer prime 28 606€) • 11h Installation Twinmotion • 14h Tuto Twinmotion de base (3h) • 17h 📧 Email Mme FONTANAY (devis + audit) |
| **Mardi 26/02** | 9h Suivi M. RICHARD • 10h Pratique Twinmotion (modèle test) • 14h ☎️ Appel Mme FONTANAY • 16h Modélisation 3D maison test |
| **Mercredi 27/02** | 9h Signatures clients (RICHARD + FONTANAY) • 11h Modélisation 3D Mme FONTANAY (4h) • 15h Rendu avant/après |
| **Jeudi 28/02** | 9h Vidéo 3D Mme FONTANAY (2h) • 11h Test panneaux PV 3D (2h) • 14h Optimisation workflow 3D |
| **Vendredi 01/03** | 9h Portfolio 3D (3–4 exemples) • 14h Recherche partenaire PV RGE (Loire) |

**Fin semaine 1 :** ✅ RICHARD + FONTANAY signés (16 000€ marge) • ✅ Maîtrise Twinmotion basique • ✅ Premier rendu 3D photoréaliste • ✅ Test PV 3D

---

### SEMAINE 2 (03/03 → 09/03) : PARTENARIATS + 3D PRO

**Objectif :** Partenaire PV + Maîtrise 3D avancée

- **Lundi–Mardi :** Recherche installateurs PV RGE QUALIPV (Loire) • Appels/emails (5–10 entreprises) • Négociation tarifs (marge 30–40 %) • Signature partenariat
- **Mercredi–Vendredi :** Formation 3D avancée (matériaux, éclairage) • Rendu photoréaliste niveau PRO • Bibliothèque assets (ITE, fenêtres, PAC, PV) • Workflow optimisé (4h → 2h/projet)

**Fin semaine 2 :** ✅ Partenaire PV RGE signé • ✅ Rendu 3D niveau PRO (qualité GTA 5) • ✅ Templates 3D réutilisables

---

### SEMAINE 3 (10/03 → 16/03) : DEV SAAS – ARCHITECTURE + AUTH

**Objectif :** Base technique solide

- **Lundi :** Setup Supabase (compte, projet, BDD) • Création 10 tables • Configuration sécurité (RLS policies)
- **Mardi :** Setup Next.js 14 (TypeScript + Tailwind) • Configuration Supabase client • Variables environnement (.env.local)
- **Mercredi–Jeudi :** Auth (login/signup) • Pages /login, /signup, /dashboard • Middleware protection routes • Tests auth
- **Vendredi :** Dashboard client V1 (layout, navigation) • Liste audits • Profil utilisateur

**Fin semaine 3 :** ✅ Supabase opérationnel • ✅ Next.js configuré • ✅ Auth fonctionnelle • ✅ Dashboard basique • **AVANCEMENT : 20/20 ✅**

---

### SEMAINE 4 (17/03 → 23/03) : PAGES CORE + UPLOAD

**Objectif :** Fonctionnalités principales

- **Lundi–Mardi :** Page d’accueil (hero, features, CTA) • Design system (Shadcn/ui) • Responsive
- **Mercredi–Jeudi :** Upload photos (drag & drop) • Supabase Storage • Formulaire questionnaire détaillé • Validation données
- **Vendredi :** Paiement Stripe (audit 199€) • Webhook confirmation • Email confirmation

**Fin semaine 4 :** ✅ Page accueil • ✅ Upload photos opérationnel • ✅ Paiement Stripe fonctionnel • **AVANCEMENT : 21/20 ✅**

---

### SEMAINE 5 (24/03 → 30/03) : MODULE PV + IA ANALYSE

**Objectif :** Photovoltaïque + IA

- **Lundi–Mardi :** Calculateur PV (orientation, production, ROI) • Google Maps API • Algorithme dimensionnement (3/6/9 kWc) • Aides PV (prime 80€/kWc)
- **Mercredi :** Configurateur (puissance, DualSun 500Wc, micro APsystems DS3 ou Enphase IQ8+, batterie optionnelle) • Prix temps réel
- **Jeudi :** Simulation financière PV (production, autoconso 70 %, revente 0,04€/kWh, ROI, gain 20 ans) • Graphiques interactifs
- **Vendredi :** IA analyse photos (OpenAI Vision) : détection murs, fenêtres, toiture, déperditions, recommandations • Génération rapport basique

**Fin semaine 5 :** ✅ Module PV complet • ✅ IA analyse photos opérationnelle • **AVANCEMENT : 22/20 ✅**

---

### SEMAINE 6 (31/03 → 06/04) : MARKETPLACE + GÉNÉRATION PDF

**Objectif :** Marketplace artisans + Rapports PDF

- **Lundi–Mardi :** Espace artisan (signup, profil) • Liste artisans RGE (filtres, recherche) • Matching projet → 3 artisans locaux • Envoi leads
- **Mercredi :** Devis artisans (artisan reçoit lead, envoie devis via plateforme, client reçoit 3 devis) • Comparaison devis (tableau)
- **Jeudi :** Avis clients (note 1–5⭐, avis publics, note moyenne) • Ranking artisans
- **Vendredi :** Génération PDF (React-PDF ou Puppeteer) : template audit 58 p., devis réno, devis PV • Envoi auto (Resend)

**Fin semaine 6 :** ✅ Marketplace fonctionnelle • ✅ Système avis • ✅ Génération PDF auto • **AVANCEMENT : 23/20 ✅**

---

### SEMAINE 7 (07/04 → 13/04) : INTÉGRATION 3D + PAIEMENTS

**Objectif :** 3D web + Commissions

- **Lundi–Mardi :** Galerie rendus 3D (upload images Twinmotion, slider avant/après, zoom 4K) • Intégration vidéos MP4 • Player vidéo
- **Mercredi :** Visualisation 3D web (Three.js) : modèle 3D simple, rotation, zoom, annotations (prix, économies)
- **Jeudi :** Stripe Connect (onboarding artisans, split payment, dashboard artisan)
- **Vendredi :** Analytics (PostHog ou Vercel Analytics) : tracking, funnel, A/B testing

**Fin semaine 7 :** ✅ 3D intégré (galerie + vidéos) • ✅ Commissions automatiques • ✅ Analytics • **AVANCEMENT : 24/20 ✅**

---

### SEMAINE 8 (14/04 → 20/04) : TESTS + OPTIMISATION + LANCEMENT

**Objectif :** Finalisation + Mise en ligne

- **Lundi–Mardi :** Tests complets (parcours rénovation A→Z, parcours PV, paiements Stripe test, PDF, emails) • Corrections bugs
- **Mercredi :** Optimisations (Lighthouse > 90, SEO, images, sécurité)
- **Jeudi :** Déploiement Vercel (GitHub, variables prod, domaine energia-conseil.com/.fr, HTTPS, CDN)
- **Vendredi :** Tests production • Corrections finales • Documentation (README, guide utilisateur)
- **Samedi 19/04 :** Préparation lancement (LinkedIn, email base, Google Ads optionnel)
- **Dimanche 20/04 :** 🎉 **LANCEMENT PUBLIC** 🚀 • **PLATEFORME EN LIGNE** • **PREMIERS CLIENTS SAAS**

**Fin semaine 8 (20/04/2026) :**  
✅ Plateforme complète en ligne • ✅ Tous modules opérationnels (Réno + PV + 3D + Marketplace) • ✅ Tests validés • ✅ Performance optimale • **LANCEMENT RÉUSSI** 🏆🚀💎

**Valorisation :** 500 k€ – 1 M€

---

*Document de référence projet renov-optim / ENERGIA-CONSEIL IA®. Marque déposée INPI.*
