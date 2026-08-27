# Chiffrage rénovation d’ampleur — 2026

Module interne ENERGIA CONSEIL IA®. Il distingue le **coût entrant** (fournisseur / sous-traitant) du **prix sortant** (aléas, pilotage, structure, marge, TVA).

## Ne jamais inventer un tarif

Les fichiers de ce dossier ne contiennent **aucun prix fournisseur**. Tant qu’un devis ou une grille 2026 n’est pas collé dans `tarifs-fournisseurs.2026.json`, le coût unitaire reste `null` et le budget n’est pas présenté comme chiffrage de référence.

Sources autorisées :

| `sourcePrix` | Libellé |
|---|---|
| `tarif_fournisseur_verifie` | Tarif fournisseur vérifié |
| `devis_sous_traitant` | Devis sous-traitant |
| `estimation_marche` | Estimation de marché |
| `hypothese_provisoire` | Hypothèse provisoire |

Un budget de référence n’est affiché que s’il existe **au moins un** poste avec tarif fournisseur vérifié **ou** devis sous-traitant.

## Ajouter des tarifs 2026

1. Ouvrir `tarifs-fournisseurs.2026.json`.
2. Pour le poste concerné, renseigner :
   - `coutEntrantUnitaireHt` (nombre HT, pas TTC) ;
   - `sourcePrix` ;
   - `dateVerification` au format `AAAA-MM-JJ` ;
   - `commentaire` (référence devis, nom fournisseur, n° de grille).
3. Laisser `null` tout poste non vérifié.
4. Un tarif de plus de 12 mois déclenche un avertissement.

Exemple :

```json
"isolation_combles": {
  "coutEntrantUnitaireHt": 42.5,
  "sourcePrix": "devis_sous_traitant",
  "dateVerification": "2026-03-12",
  "commentaire": "Devis 2C ENERGIES — réf. D-2026-0312 — laine 300 mm R≥7"
}
```

## Formule de marge

La marge est un **pourcentage du prix de vente HT**, pas une majoration du coût.

```
coût_interne =
  coûts entrants artisans
  + déplacements artisans non inclus
  + fournitures complémentaires
  + aléas techniques
  + déplacements ENERGIA
  + frais administratifs / structure
  + pilotage et coordination

prix_sortant_HT = coût_interne / (1 - taux_marge)
```

- 10 % → diviser par 0,90
- 12 % → diviser par 0,88
- 15 % → diviser par 0,85

Ne jamais appliquer × 1,10 pour une marge de 10 %.

Taux par défaut : aléas 4 % (5 % complexe), pilotage 7 % (8 % complexe), marge 10 % (12 % complexe, fourchette 12–15 %).

## Déplacements (modèle mixte)

Deux origines distinctes :

1. **Artisans** : adresse de l’entreprise → adresse du chantier. Jamais l’adresse de Lyon par défaut.
2. **ENERGIA CONSEIL IA®** : base opérationnelle ENERGIA → chantier. Ligne commerciale : « Déplacements, visites et suivi ENERGIA CONSEIL IA® ».

Si le devis artisan indique « déplacement compris » (`deplacementDejaInclusDansDevis`), les frais estimés restent affichés mais **ne sont pas ajoutés** au coût interne.

Sans calcul cartographique, la distance est une **saisie manuelle** : avertissement, résultat non définitif. Aucun coût kilométrique n’est inventé (pas de 0,60 €/km implicite).

## Fichiers

| Fichier | Rôle |
|---|---|
| `types.ts` | Modèle de données |
| `constantes.ts` | Taux, mentions, barèmes déplacements (vides par défaut) |
| `catalogue-postes.ts` | 18 postes sans prix |
| `tarifs-fournisseurs.2026.json` | Grille éditable (vide par défaut) |
| `engine.ts` | Calculs globaux et marge |
| `deplacements.ts` | Distances artisans / ENERGIA, anti-double comptage |
| `devis-client.ts` | Lignes commerciales (sans coûts internes) |
| `scenarios.ts` | Essentiel / Performance / Excellence |
| `aides.ts` | Gabarits d’aides (montants vides) |
| `format.ts` | Affichage € / % / km |

Interface : `src/components/chiffrage/` — route Vite `/chiffrage`.
Vérifications : `npx tsx src/lib/chiffrage/verify-engine.ts`.
