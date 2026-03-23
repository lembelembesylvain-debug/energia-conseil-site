# PLAN DE SPRINTS AGILE/SCRUM
## LES ARCHANGES vs LES DÉMONS

**Périmètre :** 16 sprints (2 semaines chacun)  
**Timeline :** 32 semaines (base), extension 12-18 mois avec post-alpha  
**Équipe :** 15-18 personnes  
**Méthode :** Scrum (sprint planning, daily, review, retro)

---

## 1) Organisation projet

### 1.1 Rôles recommandés
- Producteur / Product Owner
- Scrum Master
- Lead Tech
- Lead Game Design
- Dev gameplay (4)
- Dev backend (2)
- UI/UX (1)
- Art 3D/VFX/animation (4)
- QA (2)
- DevOps/SRE (1)
- Narrative designer / writer (1)

### 1.2 Outils
- Gestion projet: Jira
- Repo: GitHub
- CI/CD: GitHub Actions
- Confluence/Notion pour docs
- Monitoring: Grafana + Prometheus
- Communication: Slack/Discord interne

---

## 2) Tableau récapitulatif 16 sprints

| Sprint | Semaines | Focus | Livrable principal |
|---|---|---|---|
| 1 | 1-2 | Infra + setup | Environnements prêts |
| 2 | 3-4 | Auth + personnage | API auth + create char |
| 3 | 5-6 | Combat fondation | Boucle combat locale |
| 4 | 7-8 | Skills/ressources | Skills + cooldowns |
| 5 | 9-10 | Progression | XP/level 1-60 |
| 6 | 11-12 | Loot/crafting | Boucle équipement |
| 7 | 13-14 | Quêtes | Pipeline narratif |
| 8 | 15-16 | Zones + Karma | Zone 1 jouable |
| 9 | 17-18 | Chat/social | Chat + amis |
| 10 | 19-20 | Guildes/mariage | Social complet |
| 11 | 21-22 | PvP arènes | 5v5 / 10v10 jouables |
| 12 | 23-24 | PvP large + ELO | BG + classement |
| 13 | 25-26 | Raids | Boss AI v1 |
| 14 | 27-28 | Endgame/saisons | Boucle endgame |
| 15 | 29-30 | Polish/QA | Stabilisation alpha |
| 16 | 31-32 | Perf/stress | 15k CCU test + alpha fermée |

---

## 3) Gantt ASCII global

```text
S1  [#####]
S2       [#####]
S3             [#####]
S4                   [#####]
S5                         [#####]
S6                               [#####]
S7                                     [#####]
S8                                           [#####]
S9                                                 [#####]
S10                                                      [#####]
S11                                                            [#####]
S12                                                                  [#####]
S13                                                                        [#####]
S14                                                                              [#####]
S15                                                                                    [#####]
S16                                                                                          [#####]
```

---

## 4) Détail sprint par sprint

## Sprint 1 (Semaines 1-2) — Fondations infra
**Objectifs mesurables**
- Environnements dev/staging opérationnels.
- MongoDB cluster initial + monitoring.

**Tâches**
- Setup cloud (AWS/DO), VPC, IAM.
- CI/CD pipeline minimal.
- MongoDB + backups.
- Skeleton API Express.

**DoD**
- Déploiement automatique OK.
- Endpoint `/health` opérationnel.
- Alertes uptime configurées.

**Risques / mitigation**
- Mauvaise config réseau -> revue sécurité + IaC.

**Budget sprint (estimé)**
- Salaires: 70k-95k EUR
- Infra: 6k-10k EUR

**KPIs**
- Build success rate > 90%
- MTTR infra < 2h

## Sprint 2 (Semaines 3-4) — Auth + création personnage
**Objectifs**
- Register/login/logout/refresh.
- Création personnage basique.

**DoD**
- JWT flow complet.
- Endpoint create character validé tests.

**KPIs**
- p95 auth < 120ms
- 0 fail critique sécurité

## Sprint 3 (Semaines 5-6) — Combat core v1
**Objectifs**
- Attack/cast/use-item fonctionnels localement.
- Calcul dégâts serveur autoritaire.

**DoD**
- 3 classes testables en duel local.
- Cooldowns respectés côté serveur.

## Sprint 4 (Semaines 7-8) — Skills + ressources
**Objectifs**
- Mana, Rage, Énergie, Foi intégrées.
- 20 skills prototype sur 2 classes.

**DoD**
- Rotation complète jouable.
- Logs télémétrie combat disponibles.

## Sprint 5 (Semaines 9-10) — Progression
**Objectifs**
- Niveaux 1-60 + formules XP.
- Stats et équipement de base.

**DoD**
- Gain XP fiable.
- Recalcul stats sur équipement.

## Sprint 6 (Semaines 11-12) — Loot + crafting
**Objectifs**
- Système de rareté 6 niveaux.
- Crafting initial + enchant +0 à +15.

**DoD**
- Drop table active.
- Craft transactionnel.

## Sprint 7 (Semaines 13-14) — Quêtes
**Objectifs**
- Pipeline quêtes scriptées.
- Premières 40 quêtes intégrées.

**DoD**
- Accept/progress/complete stable.
- Récompenses cohérentes.

## Sprint 8 (Semaines 15-16) — Zones + Karma
**Objectifs**
- 2 zones jouables.
- Karma impactant quêtes/réputation.

**DoD**
- Zone 1 complète jouable.
- Transformations visuelles Karma v1.

## Sprint 9 (Semaines 17-18) — Chat + amis
**Objectifs**
- Chat WebSocket.
- Amis/blocages.

**DoD**
- Canaux global/guilde/privé.
- Modération de base active.

## Sprint 10 (Semaines 19-20) — Guildes + mariage
**Objectifs**
- Guildes, rangs, permissions.
- Système mariage social.

**DoD**
- Création/join/quit guilde.
- Permissions testées.

## Sprint 11 (Semaines 21-22) — PvP Arènes
**Objectifs**
- Arènes 5v5/10v10.
- Matchmaking v1.

**DoD**
- Match complet de bout en bout.
- Détection exploit basique.

## Sprint 12 (Semaines 23-24) — BG + ranking
**Objectifs**
- Battlegrounds 20v20/30v30.
- Ranking ELO/MMR.

**DoD**
- Leaderboard saisonnier.
- Ajustement MMR correct.

## Sprint 13 (Semaines 25-26) — Raids
**Objectifs**
- Boss AI (Jésus, Lucifer, Cavaliers) v1.
- Raids instanciés.

**DoD**
- 1 raid complet jouable.
- Loot raid validé.

## Sprint 14 (Semaines 27-28) — Endgame
**Objectifs**
- Système de saisons.
- Boucle endgame complète.

**DoD**
- S1 simulation complète.
- Récompenses saison intégrées.

## Sprint 15 (Semaines 29-30) — Polish QA
**Objectifs**
- Réduction bugs bloquants.
- UX/combat lisibilité.

**DoD**
- 0 blocker P0 ouvert.
- Crash rate < 1%

## Sprint 16 (Semaines 31-32) — Perf + stress + alpha
**Objectifs**
- Stress test 15k CCU.
- Alpha fermée prête.

**DoD**
- p95 API cible atteinte.
- Checklist launch validée.

---

## 5) Checklists standard par sprint

### 5.1 Checklist delivery
- [ ] Backlog sprint validé
- [ ] Démo sprint review faite
- [ ] Tests auto verts
- [ ] Documentation mise à jour
- [ ] Post-mortem incidents si besoin

### 5.2 Checklist qualité
- [ ] Security checks
- [ ] Perf baseline comparée
- [ ] Régression gameplay validée
- [ ] Télémétrie fonctionnelle

---

## 6) Budget prévisionnel (32 semaines)

| Poste | Fourchette |
|---|---|
| Salaires équipe | 1,6 à 2,3 M EUR |
| Infra cloud + outils | 140k à 280k EUR |
| QA externe / playtests | 60k à 120k EUR |
| Marketing pré-alpha | 120k à 260k EUR |
| **Total 16 sprints** | **1,92 à 2,96 M EUR** |

---

## 7) KPIs de suivi projet

### 7.1 Delivery
- Sprint predictability (% stories terminées)
- Lead time moyen
- Defect leakage

### 7.2 Tech
- p95 API latency
- Crash-free sessions
- MTTR incidents

### 7.3 Gameplay/business
- D1/D7 retention (alpha)
- Match completion rate
- Conversion onboarding -> niveau 20

---

## 8) Risques globaux et mitigation

| Risque | Probabilité | Impact | Mitigation |
|---|---|---|---|
| Scope creep | Élevée | Élevé | Freeze scope + change board |
| Dette technique | Moyenne | Élevé | Sprint hardening dédié |
| Déséquilibre PvP | Élevée | Élevé | Data-driven balancing |
| Retard contenu | Moyenne | Élevé | Outsourcing ciblé |
| Charge 15k CCU non tenue | Moyenne | Critique | Tests de charge progressifs |

---

## 9) Cadence cérémonies Scrum

- Sprint planning: 4h
- Daily: 15 min
- Backlog refinement: 2h/sem
- Sprint review: 2h
- Retrospective: 1h30

---

## 10) Extension post-sprint 16 (12-18 mois)

Après alpha fermée:
- 2 à 4 sprints correctifs
- bêta ouverte
- lancement progressif par régions
- cadence saison 12 semaines

---

## 11) Conclusion

Ce plan de 16 sprints structure un chemin réaliste vers une alpha fermée solide, avec un équilibre entre fondations techniques, gameplay, contenu narratif, PvP compétitif et préparation opérationnelle.
