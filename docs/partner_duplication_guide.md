# Guide de duplication partenaire — ENERGIA CONSEIL IA®

Ce guide décrit comment dupliquer le **modèle partenaire** pour un nouvel apporteur, sans recoder le moteur Quantum et **sans modifier le prototype Catarina**.

## Ce que le modèle génère

Pour chaque partenaire validé :

- une page `/partenaire/:partnerId`
- une carte de visite (avec photo / sans photo)
- un flyer A5 recto-verso (avec photo / sans photo)
- un QR code **unique**
- un parcours diagnostic (moteur existant)
- un accès CRM limité aux leads de **ce** partenaire

## Ce qu’il ne faut jamais faire

- recoder Quantum (`calculerPreQualification`, upload photos, 3D, PDF Phase 2)
- modifier `/diagnostic-rapide`, les HTML/PDF Catarina, son QR ou son contrat
- copier la photo, les coordonnées, le site ou le QR de Catarina
- publier un partenaire avec des champs non validés (utiliser `[À COMPLÉTER]`)
- exposer les prospects d’un partenaire à un autre

## 1. Ajouter la configuration

Fichier unique : `src/config/partners.js`.

```js
{
  id: "prenom-nom",
  firstName: "",
  lastName: "",
  displayName: "",
  network: "",
  title: "",
  phone: "",
  email: "",
  website: "",
  sector: "",
  photo: "",
  logoPartner: "",
  logoTechnicalPartner: "/assets/partners/_shared/energia-logo-arbres.png",
  qrTarget: "https://www.energia-conseil-ia.com/partenaire/prenom-nom",
  crmPartnerId: "prenom-nom",
  sourceLabel: "Prénom Nom / QR partenaire",
  status: "draft",       // draft | demo | published
  legalMention: "[À COMPLÉTER]",
  brandColor: "#0b1f3a"
}
```

1. Copier `createEmptyPartner("prenom-nom")`.
2. Remplir **uniquement** les données validées par le partenaire.
3. Laisser `[À COMPLÉTER]` si une information manque.
4. `photo` et `logoPartner` restent vides tant que les visuels n’ont pas été fournis.
5. `status: "draft"` tant que la page ne doit pas être publique.
6. Passer à `"published"` seulement après validation (visuels, mentions légales, QR).

Le partenaire fictif `demo-alexandre-morel` sert de test. Ne pas s’en servir en production.

## 2. Générer les assets

```bash
node scripts/generate_partner_assets.js prenom-nom
node scripts/generate_partner_assets.js prenom-nom --pdf
```

Sortie : `public/assets/partners/<id>/`

- `qr.svg` — QR unique vers `qrTarget`
- `carte_visite.html` / `carte_visite_sans_photo.html`
- `flyer_A5.html` / `flyer_A5_sans_photo.html`
- PDF si `--pdf` et Chrome/Edge disponibles
- `manifest.json`

Le script **refuse** de générer si le profil contient des données Catarina (photo, QR immobilier-chagny, téléphone, etc.).

## 3. Page et parcours diagnostic

Route dynamique : `/partenaire/:partnerId`

Le parcours réutilise le moteur existant :

1. accueil partenaire
2. formulaire + consentement (recontact obligatoire, email facultatif)
3. résultat **indicatif** (aucun montant d’aides ni plus-value garantie)
4. création du lead (`enregistrerLeadDiagnostic`)
5. attribution `partenaire_id` + `source`
6. notification CRM locale
7. bouton **Audit Énergétique IA — 199 € TTC**

Le prototype Catarina reste sur `/diagnostic-rapide`.

## 4. CRM et isolation

- Chaque lead porte `partenaire_id` et `source`.
- Rôle `partenaire_apporteur` : uniquement les prospects / dossiers / commissions rattachés à l’ID connecté.
- Un partenaire ne voit pas Catarina, ni les autres apporteurs.
- L’API `POST /api/diagnostic-rapide` n’expose jamais la liste des prospects.
- Un `partenaire_id` inconnu est rejeté. Sans id, le prototype Catarina reste le défaut (rétrocompatibilité).

Dans le CRM local (`/test-dashboard-crm`) : rôle Partenaire + champ **ID partenaire connecté**.

## 5. Mentions et design

Conservés pour tous les partenaires :

- partenaire en première ligne (nom, réseau, logo s’il existe)
- Energia Conseil IA® = partenaire technique (badge vert)
- même structure carte / flyer / page
- résultats indicatifs + besoin de 4 photos pour l’audit
- consentement obligatoire de recontact, email facultatif
- aides 2026 à titre indicatif lorsqu’un montant apparaît

## 6. Checklist avant duplication réelle

- [ ] Données validées par le partenaire (pas de copier-coller Catarina)
- [ ] Photo fournie **ou** version sans photo
- [ ] Mentions légales renseignées ou `[À COMPLÉTER]`
- [ ] QR unique vers `/partenaire/<id>`
- [ ] `node scripts/test_partner_model.js` OK
- [ ] `node scripts/generate_partner_assets.js <id>` OK
- [ ] Test page + formulaire + lead visible seulement pour cet ID
- [ ] `status: "published"` seulement après validation
- [ ] Contrat propre au partenaire (ne pas réutiliser le contrat Catarina)

## 7. Test actuel (obligatoire avant un vrai partenaire)

```bash
node scripts/test_partner_model.js
node scripts/generate_partner_assets.js demo-alexandre-morel
```

Puis ouvrir :

- `/partenaire/demo-alexandre-morel`
- `/test-dashboard-crm` → rôle Partenaire → ID `demo-alexandre-morel`
- `/diagnostic-rapide` (Catarina) pour vérifier qu’il est inchangé
