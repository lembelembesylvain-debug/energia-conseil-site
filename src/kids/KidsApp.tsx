import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PHRASE_COURAGE =
  "Tu y es presque ! Réessaie, se tromper c'est comme ça qu'on apprend !";
const PHRASE_TEMPS = "Prends tout ton temps, chaque essai te rend plus fort !";

const CLE_ETOILES = "energia-kids-etoiles";
const CLE_JOUR = "energia-kids-etoiles-jour";
const CLE_DYS = "energia-kids-dys";
const MOT_NOA =
  "Bonjour mon jeune aventurier ! Je m'appelle Noa. Bienvenue sur nos îles magiques. Ici, tu as tout ton temps, il n'y a aucune note, et chaque essai te rend plus fort. Choisis ton monde pour commencer l'aventure !";
const PHRASE_COFFRE = "Rappelle-toi : se tromper, c'est juste la première étape pour réussir !";
const COULEURS_SYL = ["#5c78c9", "#d17b8e", "#3e9474", "#c48a3a", "#8b6bb5"];
const PAILLETTES = ["#e2b657", "#f3d48a", "#f0c2a8", "#b7dfc8", "#d7c4ec", "#f6e7c4"];

type MondeId = "curieux" | "royaume" | "labo";
type JeuId =
  | "sons"
  | "espace"
  | "nombres"
  | "emotions"
  | "labo"
  | "grammaire"
  | "maths"
  | "horloge"
  | "enquetes"
  | "orthographe"
  | "fractions"
  | "passeport";
type Ecran =
  | { vue: "accueil" }
  | { vue: "monde"; monde: MondeId }
  | { vue: "jeu"; monde: MondeId; jeu: JeuId };
type Activite = "iles" | "histoire" | "trace" | "bd" | "gardiens" | "duo";
type Bandeau = { type: "joie" | "courage"; texte: string; id: number } | null;
type FormeId = "rond" | "carre" | "triangle" | "etoile";
type EtapeEau = "soleil" | "nuage" | "pluie" | "riviere";

type Animal = { id: string; emoji: string; nom: string; cri: string };
type MotPont = { mot: string; syllabes: string[]; emoji: string; indice: string };
type AmbiancePorte = "prairie" | "lagon" | "etoile";
type Monde = {
  id: MondeId;
  titre: string;
  ages: string;
  emoji: string;
  intro: string;
  accueil: string;
  bouton: string;
  ambiance: AmbiancePorte;
  jeux: { id: JeuId; emoji: string; titre: string; consigne: string; bouton: string }[];
};

const ANIMAUX: Animal[] = [
  { id: "chat", emoji: "🐱", nom: "chat", cri: "miaou" },
  { id: "chien", emoji: "🐶", nom: "chien", cri: "ouaf ouaf" },
  { id: "vache", emoji: "🐮", nom: "vache", cri: "meuh" },
  { id: "canard", emoji: "🦆", nom: "canard", cri: "coin coin" },
  { id: "lion", emoji: "🦁", nom: "lion", cri: "roaaaar" },
  { id: "grenouille", emoji: "🐸", nom: "grenouille", cri: "croac croac" },
  { id: "oiseau", emoji: "🐦", nom: "oiseau", cri: "cui cui" },
  { id: "vent", emoji: "🌬️", nom: "vent", cri: "le vent souffle doucement" },
];

const FORMES: { id: FormeId; nom: string; couleur: string }[] = [
  { id: "rond", nom: "cercle bleu", couleur: "#7eb6e0" },
  { id: "carre", nom: "carré vanille", couleur: "#e2b657" },
  { id: "triangle", nom: "triangle menthe", couleur: "#7dcaa4" },
  { id: "etoile", nom: "étoile rose", couleur: "#e7a3b8" },
];

const MOTS_PONT: MotPont[] = [
  { mot: "CHATON", syllabes: ["CHA", "TON"], emoji: "🐱", indice: "C'est un bébé chat." },
  { mot: "RENARD", syllabes: ["RE", "NARD"], emoji: "🦊", indice: "C'est un animal roux, avec une grande queue." },
  { mot: "SOLEIL", syllabes: ["SO", "LEIL"], emoji: "☀️", indice: "Il brille dans le ciel et réchauffe la terre." },
  { mot: "BATEAU", syllabes: ["BA", "TEAU"], emoji: "⛵", indice: "Il flotte sur l'eau." },
];

const MONDES: Monde[] = [
  {
    id: "curieux",
    titre: "L'Île aux Sons & aux Animaux",
    ages: "Petite enfance & Maternelle",
    emoji: "🌿",
    intro:
      "Viens écouter le chant des oiseaux, imiter les animaux de la forêt et jouer avec les formes douces qui s'emboîtent sans stress.",
    accueil:
      "Bienvenue sur l'île aux sons et aux animaux. Quatre missions t'attendent. Tu peux écouter, toucher, et prendre tout ton temps. Choisis celle qui te fait envie.",
    bouton: "🎈 Partir en balade avec Noa",
    ambiance: "prairie",
    jeux: [
      {
        id: "sons",
        emoji: "🐦",
        titre: "L'Atelier des Sons & Animaux",
        consigne: "Écoute le chant des oiseaux, le vent et les animaux, puis touche celui qui chante.",
        bouton: "Écouter la forêt",
      },
      {
        id: "espace",
        emoji: "🔷",
        titre: "Les Formes & l'Espace en 3D",
        consigne: "Touche le cube, la sphère ou la pyramide, puis dis si la balle est devant, derrière ou dessus.",
        bouton: "Toucher les formes",
      },
      {
        id: "nombres",
        emoji: "🍎",
        titre: "Les Nombres Gourmands",
        consigne: "Compte les fruits et les étoiles, de un jusqu'à dix. Regarde où il y en a plus, ou autant.",
        bouton: "Compter les fruits",
      },
      {
        id: "emotions",
        emoji: "🌤️",
        titre: "La Météo des Émotions",
        consigne: "Nomme la joie, la colère, la tristesse et la peur. Tous les ressentis sont les bienvenus.",
        bouton: "Nommer le ressenti",
      },
    ],
  },
  {
    id: "royaume",
    titre: "Le Village des Mots & des Nombres Magiques",
    ages: "CP, CE1, CE2 · Spécial Confiance & Dyslexie",
    emoji: "🏰",
    intro:
      "Aide les petits renards à traverser le pont en associant les syllabes colorées, et pèse des pommes d'or sur la balance magique pour comprendre les calculs en t'amusant !",
    accueil:
      "Bienvenue au village des mots et des nombres magiques. Les lettres miroirs ne font pas peur. Les phrases se touchent, et les nombres se racontent avec des pommes et des bonbons. Choisis ta mission.",
    bouton: "📖 Ouvrir le grimoire des mots",
    ambiance: "lagon",
    jeux: [
      {
        id: "labo",
        emoji: "🔤",
        titre: "Le Labo des Sons & Syllabes DYS",
        consigne: "Apprivoise les lettres miroirs b, d, p et q, puis assemble les syllabes colorées.",
        bouton: "Apprivoiser les lettres",
      },
      {
        id: "grammaire",
        emoji: "🔺",
        titre: "La Grammaire en 3D Montessori",
        consigne: "Le verbe est une boule rouge d'action. Le nom est une pyramide solide. L'adjectif est un triangle bleu. Touche la phrase avec le doigt.",
        bouton: "Toucher la phrase",
      },
      {
        id: "maths",
        emoji: "🍬",
        titre: "Les Maths Vivantes de Singapour",
        consigne: "Pèse des pommes, compte une barre de dix, puis des paquets de bonbons.",
        bouton: "Jouer avec les nombres",
      },
      {
        id: "horloge",
        emoji: "🕐",
        titre: "L'Horloge Magique",
        consigne: "Fais tourner les aiguilles pour montrer l'heure. Il n'y a pas de retard, seulement de la curiosité.",
        bouton: "Tourner les aiguilles",
      },
    ],
  },
  {
    id: "labo",
    titre: "La Cabane des Petits Détectives",
    ages: "CM1, CM2 · Cap sur le Collège en toute sérénité",
    emoji: "🧭",
    intro:
      "Résous des énigmes mystérieuses, découvre les secrets de la nature et prépare ta rentrée au collège avec fierté et autonomie.",
    accueil:
      "Bienvenue dans la cabane des petits détectives. Tu vas mener l'enquête, apprivoiser l'orthographe, partager des gâteaux, et préparer ton cartable pour le collège, tout en douceur.",
    bouton: "🔬 Commencer l'enquête secrète",
    ambiance: "etoile",
    jeux: [
      {
        id: "enquetes",
        emoji: "🔍",
        titre: "Les Enquêtes de Lecture & Déduction",
        consigne: "Lis ou écoute les indices cachés, puis trouve la bonne cachette. Ensuite, suis le secret d'une goutte d'eau.",
        bouton: "Ouvrir l'enquête",
      },
      {
        id: "orthographe",
        emoji: "🧲",
        titre: "L'Orthographe Intelligente",
        consigne: "Les accords sont des aimants. Le sujet attire le bon verbe, et le pluriel attire la lettre s. Ici, aucune dictée punitive.",
        bouton: "Approcher les aimants",
      },
      {
        id: "fractions",
        emoji: "🍰",
        titre: "Les Fractions Gourmandes & la Vie Réelle",
        consigne: "Découpe un gâteau en moitiés et en quarts, puis compose une somme avec des euros et des centimes.",
        bouton: "Partager le gâteau",
      },
      {
        id: "passeport",
        emoji: "🎒",
        titre: "Passeport Cap Collège",
        consigne: "Range ton cartable, note la piscine dans l'agenda, puis respire avec Noa, à ton rythme.",
        bouton: "Préparer le cartable",
      },
    ],
  },
];

const EXPLICATIONS_EAU: Record<EtapeEau, string> = {
  soleil:
    "Le soleil réchauffe la mer. La goutte devient vapeur et monte. C'est l'évaporation.",
  nuage:
    "Dans le nuage, la vapeur refroidit et redevient de toutes petites gouttes. C'est la condensation.",
  pluie: "La goutte tombe du nuage. C'est la pluie, une précipitation.",
  riviere:
    "La goutte glisse dans la rivière et retourne à la mer. C'est le ruissellement. Le voyage peut recommencer.",
};

const SUITE_EAU: EtapeEau[] = ["soleil", "nuage", "pluie", "riviere"];

const CSS_KIDS = `
@font-face {
  font-family: "OpenDyslexic";
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url("https://cdn.jsdelivr.net/gh/antijingoist/opendyslexic@master/compiled/OpenDyslexic-Regular.otf") format("opentype");
}
@font-face {
  font-family: "OpenDyslexic";
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url("https://cdn.jsdelivr.net/gh/antijingoist/opendyslexic@master/compiled/OpenDyslexic-Bold.otf") format("opentype");
}
.kids-app {
  min-height: 100vh;
  color: #2c4554;
  background:
    radial-gradient(920px 440px at 6% -8%, rgba(246, 231, 184, 0.96), transparent 62%),
    radial-gradient(820px 500px at 108% 0%, rgba(198, 230, 212, 0.92), transparent 56%),
    radial-gradient(740px 520px at 70% 110%, rgba(176, 214, 238, 0.95), transparent 52%),
    linear-gradient(165deg, #b7d8f2 0%, #f3e6bc 46%, #c7ead9 100%);
  font-family: "Nunito", "Lexend", "Segoe UI", sans-serif;
  overflow-x: hidden;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.kids-app * { box-sizing: border-box; }
.kids-app button, .kids-app a { font-family: inherit; }
.kids-app button {
  cursor: pointer;
  touch-action: manipulation;
}
.kids-app button:focus-visible, .kids-app a:focus-visible {
  outline: 3px solid #e2b657;
  outline-offset: 3px;
}
.kids-app.dys .kids-text,
.kids-app.dys .lettre,
.kids-app.dys h1,
.kids-app.dys h2,
.kids-app.dys p,
.kids-app.dys .gros,
.kids-app.dys .hesite,
.kids-app.dys .carte,
.kids-app.dys .choix {
  font-family: "OpenDyslexic", "Lexend", sans-serif;
  letter-spacing: 0.12em;
  word-spacing: 0.38em;
  line-height: 2.15;
}
.kids-app.dys .kids-dys,
.kids-app.dys .coffre,
.kids-app.dys .coffre .kids-text,
.kids-app.dys .barre-magique,
.kids-app.dys .pilule {
  letter-spacing: 0.02em;
  word-spacing: normal;
  line-height: 1.25;
}
.kids-nuages {
  pointer-events: none;
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}
.kids-nuages span {
  position: absolute;
  border-radius: 999px;
  background: rgba(232, 214, 176, 0.45);
  filter: blur(2px);
  animation: kids-derive 28s linear infinite;
}
.kids-header {
  position: sticky;
  top: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px 16px;
  padding: 14px 18px 12px;
  background: rgba(247, 236, 214, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(196, 146, 78, 0.25);
}
.kids-dys { justify-self: end; width: auto; max-width: 100%; }
.kids-header-ligne {
  grid-column: 1 / -1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}
.kids-retour {
  color: #3d5c70;
  font-size: 0.82rem;
  text-decoration: underline;
  text-underline-offset: 3px;
  opacity: 0.8;
  padding: 6px 2px;
}
.kids-retour:hover { opacity: 1; }
.coffre-bloc { justify-self: start; min-width: 0; }
.coffre {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 64px;
  padding: 8px 16px 8px 8px;
  border-radius: 22px;
  background: linear-gradient(180deg, #f6e2bc, #e4bc78);
  border: 3px solid #c4924e;
  box-shadow: inset 0 2px 0 rgba(255, 248, 230, 0.7), 0 6px 0 #c4924e;
  font-weight: 800;
  color: #5c4328;
}
.coffre svg { width: 54px; height: 42px; flex: 0 0 auto; }
.coffre span { line-height: 1.25; }
.rappel {
  grid-column: 1 / -1;
  margin: 0;
  color: #6d5340;
  font-size: 1.02rem;
  line-height: 1.45;
}
.kids-dys {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-height: 64px;
  padding: 8px 18px 8px 8px;
  border-radius: 999px;
  border: 3px solid #e2b657;
  background: linear-gradient(180deg, #f8efc8, #f0d48a);
  color: #3d4a34;
  font-weight: 800;
  font-size: 1.02rem;
  line-height: 1.25;
  text-align: left;
  white-space: normal;
  max-width: min(460px, 100%);
  box-shadow: 0 6px 0 #d7b15d;
}
.kids-dys.actif {
  background: linear-gradient(180deg, #d9f3e4, #b7e4c8);
  border-color: #7dba96;
  box-shadow: 0 6px 0 #8fbf9e;
}
.interrupteur {
  width: 58px;
  height: 34px;
  border-radius: 999px;
  background: rgba(255, 248, 232, 0.8);
  padding: 3px;
  display: inline-flex;
  align-items: center;
}
.kids-dys.actif .interrupteur { justify-content: flex-end; }
.boule {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e2b657;
  box-shadow: 0 2px 0 rgba(120, 90, 30, 0.2);
}
.kids-dys.actif .boule { background: #3e9474; }
.kids-main {
  position: relative;
  z-index: 1;
  width: min(1180px, 100%);
  margin: 0 auto;
  padding: 18px 16px 72px;
}
.bandeau {
  position: relative;
  z-index: 2;
  width: min(1040px, calc(100% - 24px));
  margin: 12px auto 0;
  padding: 14px 18px;
  border-radius: 22px;
  font-weight: 800;
  line-height: 1.45;
}
.bandeau.courage {
  background: #fde8c8;
  border: 3px solid #e7b86a;
  color: #5c4630;
}
.bandeau.joie {
  background: #e5f6ea;
  border: 3px solid #8fbf9e;
  color: #24543c;
}
.hero h1 {
  margin: 8px 0 6px;
  font-size: clamp(1.8rem, 4vw, 2.7rem);
  line-height: 1.25;
  color: #243e50;
}
.hero p.chuchote {
  margin: 0 0 18px;
  font-size: 1.08rem;
  max-width: 40rem;
}
.grille {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}
.carte {
  background: rgba(247, 241, 228, 0.82);
  border: 3px solid rgba(226, 182, 87, 0.55);
  border-radius: 32px;
  padding: 18px 18px 16px;
  box-shadow: 0 12px 28px rgba(80, 110, 130, 0.12);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 250px;
}
.carte .gros { margin-top: auto; }
.emoji-xl { font-size: 3.2rem; line-height: 1; }
.pastille {
  align-self: flex-start;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(183, 216, 242, 0.7);
  font-weight: 800;
  font-size: 0.92rem;
}
.gros, .hesite, .doux {
  min-height: 72px;
  padding: 14px 22px;
  border-radius: 999px;
  border: 0;
  font-weight: 800;
  font-size: 1.18rem;
}
.gros {
  background: linear-gradient(180deg, #f6d98a, #e2b657);
  color: #3e4a32;
  box-shadow: 0 7px 0 #d1a64c;
}
.gros:active { transform: translateY(2px); box-shadow: 0 4px 0 #d1a64c; }
.hesite {
  background: #f8e2c4;
  color: #6a4b32;
  box-shadow: 0 7px 0 #e3c39a;
}
.doux {
  background: #d5efe4;
  color: #24543c;
  box-shadow: 0 7px 0 #b7d8c8;
}
.rang {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.bloc-parlant {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 8px 0;
}
.ligne-mots {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 8px;
}
.puce-mot {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 2px;
  padding: 2px 8px 2px 2px;
  border-radius: 999px;
  background: rgba(247, 241, 228, 0.72);
}
.oreille {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 0;
  background: #f3d48a;
  font-size: 1.2rem;
  flex: 0 0 auto;
}
.oreille.phrase {
  width: 64px;
  height: 64px;
  font-size: 1.55rem;
  box-shadow: 0 4px 0 #e2b657;
}
.oreille.mini {
  width: 36px;
  height: 36px;
  font-size: 0.95rem;
  background: #f7e7c0;
}
.kids-app.dys .syl { padding: 0 0.15em; }
.lettre {
  background: transparent;
  border: 0;
  color: #2c4554;
  font: inherit;
  font-weight: 800;
  min-height: 44px;
  padding: 0 0.03em;
}
.syl {
  display: inline-flex;
  align-items: center;
  border-radius: 12px;
}
.kids-app.dys .syl {
  background: rgba(255, 246, 230, 0.72);
  margin: 0 2px;
  padding: 0 2px;
}
.jeu-titre {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.jeu-titre h2 { margin: 0; font-size: clamp(1.4rem, 3vw, 2rem); }
.choix-animaux, .choix-formes, .briques, .choix-detective {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 16px;
}
.choix {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.gros:disabled, .choix:disabled, .animal:disabled {
  opacity: 0.55;
  cursor: default;
}
.animal, .piece, .maison, .brique, .choix {
  border: 3px solid rgba(226, 182, 87, 0.65);
  background: rgba(247, 241, 228, 0.88);
  border-radius: 28px;
  min-width: 112px;
  min-height: 112px;
  padding: 12px;
  font-weight: 800;
  font-size: 1.15rem;
  color: #2c4554;
}
.animal { font-size: 3.4rem; width: 140px; }
.animal.danse { animation: kids-danse 0.7s ease; }
.animal.berce, .maison.berce, .choix.berce, .etape-eau.berce { animation: kids-berce 0.45s ease; }
.piece, .maison { width: 132px; height: 132px; display: grid; place-items: center; position: relative; }
.piece.choisie { border-color: #3e9474; box-shadow: 0 0 0 4px rgba(62, 148, 116, 0.25); }
.forme-svg { width: 92px; height: 92px; }
.etincelles { position: absolute; inset: 0; pointer-events: none; }
.etincelles i {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e2b657;
  top: 50%;
  left: 50%;
  animation: kids-etincelle 0.8s ease forwards;
}
.etincelles i:nth-child(1) { --dx: -36px; --dy: -28px; }
.etincelles i:nth-child(2) { --dx: 34px; --dy: -24px; }
.etincelles i:nth-child(3) { --dx: -28px; --dy: 30px; }
.etincelles i:nth-child(4) { --dx: 32px; --dy: 26px; }
.etincelles i:nth-child(5) { --dx: 0px; --dy: -40px; }
.etincelles i:nth-child(6) { --dx: 8px; --dy: 38px; }
.riviere {
  position: relative;
  height: 150px;
  margin: 8px 0 18px;
  border-radius: 28px;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(183, 216, 242, 0.3), rgba(126, 182, 196, 0.55));
}
.eau {
  position: absolute;
  left: -10%;
  right: -10%;
  bottom: 0;
  height: 78px;
  background: radial-gradient(circle at 20px 10px, rgba(232, 246, 250, 0.7) 8px, transparent 9px) 0 0 / 40px 20px repeat-x, #8ec4d4;
}
.renard {
  position: absolute;
  top: 18px;
  font-size: 3rem;
  z-index: 2;
  filter: drop-shadow(0 6px 0 rgba(80, 110, 130, 0.15));
}
.berge {
  position: absolute;
  bottom: 52px;
  width: 18%;
  height: 28px;
  border-radius: 16px;
  background: #d7c094;
}
.berge.gauche { left: 4%; }
.berge.droite { right: 4%; }
.brique { min-width: 92px; font-size: 1.35rem; letter-spacing: 0.04em; }
.brique:disabled { opacity: 0.35; }
.slot {
  min-width: 96px;
  min-height: 76px;
  border-radius: 18px;
  border: 3px dashed #c4a15a;
  background: rgba(247, 241, 228, 0.55);
  font-size: 1.35rem;
  font-weight: 800;
  color: #2c4554;
}
.mot-revele {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-top: 12px;
}
.perle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 0;
  background: #f6e7c4;
  font-weight: 800;
  font-size: 1.2rem;
  color: #2c4554;
}
.balance {
  position: relative;
  height: 300px;
  max-width: 540px;
  margin: 10px auto 0;
}
.socle {
  position: absolute;
  left: 50%;
  top: 92px;
  width: 16px;
  height: 86px;
  transform: translateX(-50%);
  background: #c4924e;
  border-radius: 8px;
}
.balancier {
  position: absolute;
  left: 6%;
  right: 6%;
  top: 86px;
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(180deg, #f0d7a0, #c4924e);
  transform-origin: 50% 50%;
  transition: transform 0.45s ease;
  z-index: 1;
}
.panier {
  position: absolute;
  top: 22px;
  width: 46%;
  min-height: 132px;
  padding: 8px;
  border-radius: 8px 8px 26px 26px;
  background: rgba(244, 228, 190, 0.92);
  border: 3px solid #e2b657;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-content: flex-start;
  gap: 4px;
}
.panier.gauche { left: 0; }
.panier.droit { right: 0; }
.panier strong {
  width: 100%;
  text-align: center;
  font-size: 0.85rem;
}
.pomme {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #f8e7a8, #e2b14a 62%, #c48a2e);
  box-shadow: inset -4px -3px 0 rgba(140, 90, 20, 0.18);
  position: relative;
}
.pomme::after {
  content: "";
  position: absolute;
  width: 8px;
  height: 10px;
  border-radius: 0 8px 0 8px;
  background: #6aaa78;
  top: -4px;
  left: 16px;
}
.pomme.nouvelle { outline: 3px solid rgba(62, 148, 116, 0.35); }
.labo-scene {
  position: relative;
  height: 340px;
  border-radius: 32px;
  overflow: hidden;
  background: linear-gradient(180deg, #c5e2f6 0%, #d7edc8 68%, #8ec4d4 68%, #7eb6c8 100%);
  border: 3px solid rgba(226, 182, 87, 0.4);
}
.soleil-dessin {
  position: absolute;
  left: 8%;
  top: 12%;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: #f6d98a;
  box-shadow: 0 0 0 12px rgba(246, 217, 138, 0.45);
}
.nuage-dessin {
  position: absolute;
  right: 12%;
  top: 14%;
  width: 120px;
  height: 46px;
  border-radius: 999px;
  background: #d5e6f2;
}
.nuage-dessin::before, .nuage-dessin::after {
  content: "";
  position: absolute;
  background: #d5e6f2;
  border-radius: 50%;
}
.nuage-dessin::before { width: 48px; height: 48px; left: 16px; top: -22px; }
.nuage-dessin::after { width: 64px; height: 64px; left: 46px; top: -30px; }
.pluie-dessin {
  position: absolute;
  left: 58%;
  top: 38%;
  width: 70px;
  height: 54px;
}
.pluie-dessin i {
  position: absolute;
  width: 4px;
  height: 16px;
  border-radius: 4px;
  background: #7eb6e0;
}
.pluie-dessin i:nth-child(1) { left: 6px; }
.pluie-dessin i:nth-child(2) { left: 26px; top: 8px; }
.pluie-dessin i:nth-child(3) { left: 46px; }
.goutte {
  position: absolute;
  width: 28px;
  height: 36px;
  margin-left: -14px;
  margin-top: -18px;
  border-radius: 50% 50% 50% 50% / 40% 40% 60% 60%;
  background: linear-gradient(180deg, #d7f0f8, #6eb0d4);
  z-index: 3;
  box-shadow: 0 6px 0 rgba(80, 120, 140, 0.12);
}
.etape-eau { min-width: 140px; }
.confettis {
  pointer-events: none;
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: 50;
}
.confetti {
  position: absolute;
  top: 0;
  width: 12px;
  height: 18px;
  border-radius: 3px;
}
.retour-jeu {
  min-height: 56px;
  padding: 8px 16px;
  border-radius: 999px;
  border: 0;
  background: rgba(247, 241, 228, 0.85);
  color: #2c4554;
  font-weight: 800;
}
.accueil-noa {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  margin: 8px 0 18px;
}
.noa-avatar {
  flex: 0 0 auto;
  width: 148px;
  height: 168px;
  padding: 0;
  border: 0;
  background: transparent;
  border-radius: 40px;
}
.noa-avatar svg { width: 100%; height: 100%; }
.hibou.parle { transform-origin: 50% 80%; animation: kids-hibou 1.1s ease-in-out infinite; }
.nom-noa {
  display: block;
  margin-top: -8px;
  text-align: center;
  font-weight: 800;
  color: #6d5340;
}
.bulle-noa {
  flex: 1;
  margin: 0;
  padding: 18px 20px 16px;
  text-align: left;
  border: 3px solid rgba(226, 182, 87, 0.55);
  border-radius: 32px 32px 32px 14px;
  background: rgba(255, 248, 236, 0.94);
  box-shadow: 0 12px 28px rgba(120, 90, 40, 0.1);
  color: #3e4a3a;
  font: inherit;
  font-size: 1.18rem;
  line-height: 1.55;
  cursor: pointer;
}
.phrase-noa { margin: 8px 0 12px; }
.phrase-noa .recit, .bulle-noa .recit {
  margin: 0 0 12px;
  font-size: 1.12rem;
  line-height: 1.6;
}
.phrase-noa.grand .recit, .bulle-noa .recit { font-size: 1.22rem; }
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
.mot-livre.allume {
  background: #ffe08a;
  box-shadow: 0 0 0 3px rgba(255, 214, 120, 0.55);
}
.ecouter-noa, .partir {
  min-height: 68px;
  padding: 12px 22px;
  border: 0;
  border-radius: 999px;
  font-weight: 800;
  font-size: 1.12rem;
  color: #5c4630;
}
.ecouter-noa {
  background: linear-gradient(180deg, #f8efc8, #f0d48a);
  box-shadow: 0 6px 0 #e0b86a;
}
.ecouter-noa.grande {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 78px;
  font-size: 1.22rem;
  padding: 14px 28px;
  margin: 4px auto 26px;
}
.partir {
  width: 100%;
  margin-top: auto;
  background: linear-gradient(180deg, #fff6dc, #f0c56e);
  box-shadow: 0 7px 0 #e0b15a;
}
.partir:active, .ecouter-noa:active { transform: translateY(2px); }
.portes {
  display: grid;
  grid-template-columns: 1fr;
  gap: 22px;
}
.porte {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  border-radius: 36px;
  overflow: hidden;
  box-shadow: 0 16px 34px rgba(90, 70, 40, 0.12);
  border: 3px solid rgba(255, 248, 236, 0.7);
}
.porte-prairie { background: linear-gradient(165deg, #e4f3c6 0%, #f8e7b2 58%, #f4f7df 100%); }
.porte-lagon { background: linear-gradient(165deg, #c9e6f8 0%, #f7e7c2 68%, #e7f4ea 100%); }
.porte-etoile { background: linear-gradient(165deg, #f6d7b4 0%, #e6d6f4 58%, #f8e8cf 100%); }
.paysage { display: block; width: 100%; height: 148px; }
.porte-corps {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 6px 18px 18px;
  flex: 1;
}
.porte h2 {
  margin: 0;
  font-size: 1.45rem;
  line-height: 1.3;
  color: #3d4a38;
}
.sous-titre {
  margin: 0;
  font-weight: 800;
  color: #6d5340;
  font-size: 0.98rem;
}
.porte .recit { color: #3e4e46; }
.missions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
.mission {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 250px;
  padding: 18px;
  border-radius: 32px;
  background: rgba(255, 248, 236, 0.92);
  border: 3px solid rgba(226, 182, 87, 0.4);
  box-shadow: 0 12px 28px rgba(90, 70, 40, 0.08);
}
.mission h3 {
  margin: 0;
  font-size: 1.28rem;
  line-height: 1.3;
  color: #3d4a38;
}
.mission .partir, .mission .ecouter-noa { width: 100%; }
.accueil-noa.compact { align-items: center; margin-bottom: 8px; }
.accueil-noa.compact .noa-avatar { width: 108px; height: 124px; }
.chapitres { margin-bottom: 12px; }
.solide, .lettre-miroir, .visage, .piece {
  min-width: 108px;
  min-height: 108px;
  border: 0;
  border-radius: 28px;
  background: #fff8ee;
  box-shadow: 0 8px 0 #ead7b0;
  font-weight: 800;
}
.lettre-miroir { font-size: 3.2rem; width: 108px; }
.visage { width: 124px; padding: 8px; }
.visage svg { width: 84px; height: 84px; display: block; margin: 0 auto; }
.cadran { width: min(280px, 78vw); height: auto; }
.gateau-grille {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: min(240px, 70vw);
  margin: 8px auto;
}
.part {
  min-height: 88px;
  border: 0;
  border-radius: 18px;
  background: #f6e7c4;
  font-size: 2rem;
  box-shadow: 0 6px 0 #e2b657;
}
.part.prise { background: #f0c2a8; }
.panier {
  min-width: 140px;
  min-height: 110px;
  padding: 12px;
  border-radius: 24px;
  background: rgba(255, 248, 236, 0.95);
  text-align: center;
  font-size: 1.7rem;
}
.magnet {
  min-height: 72px;
  padding: 12px 18px;
  border-radius: 22px;
  border: 3px dashed #c48a3a;
  background: #fff8ee;
  font-weight: 800;
  font-size: 1.15rem;
}
.magnet.attire {
  border-style: solid;
  background: #e5f6ea;
}
.souffle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  margin: 12px auto;
  background: radial-gradient(circle, #f6e7c4, #b7d8f2);
  transition: transform 0.8s ease;
}
.souffle.grand { transform: scale(1.35); }
.souffle.petit { transform: scale(0.72); }
.barre-dix {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  max-width: 280px;
  margin: 8px auto;
  padding: 10px;
  border-radius: 18px;
  background: rgba(255, 248, 236, 0.8);
}
.perle-compte {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e2b657;
}
.animal { position: relative; overflow: visible; }
.animal.flotte { animation: kids-flotte 2.6s ease-in-out infinite; }
.animal.flotte.danse { animation: kids-danse 0.7s ease; }
.animal.flotte.berce { animation: kids-berce 0.45s ease; }
.animal.flotte:nth-child(2) { animation-delay: -0.7s; }
.animal.flotte:nth-child(3) { animation-delay: -1.3s; }
.animal.flotte:nth-child(4) { animation-delay: -1.9s; }
.nom-animal { display: block; margin-top: 4px; font-size: 0.95rem; font-weight: 800; color: #5c4630; }
.pont-lumiere { display: flex; gap: 10px; justify-content: center; margin: 14px 0; }
.planche {
  width: 64px;
  height: 18px;
  border-radius: 9px;
  background: #eadcc4;
  transition: background 0.45s ease, box-shadow 0.45s ease, transform 0.45s ease;
}
.planche.allumee {
  background: #ffe08a;
  box-shadow: 0 0 18px #f0c56e;
  transform: translateY(-3px);
}
.maisons-bd { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; }
.maison-lettre {
  min-width: 180px;
  min-height: 150px;
  padding: 12px;
  border-radius: 28px;
  border: 3px dashed;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.maison-b { background: #e7f4fb; border-color: #7eb6e0; }
.maison-d { background: #fff4e6; border-color: #e2a85a; }
.carte-mot {
  min-width: 132px;
  min-height: 108px;
  border: 0;
  border-radius: 24px;
  background: #fff8ee;
  box-shadow: 0 8px 0 #ead7b0;
  font-weight: 800;
  font-size: 1.05rem;
}
.carte-mot.choisie { outline: 3px solid #e2b657; transform: translateY(-6px); }
.carte-mot.secoue { animation: kids-berce 0.45s ease; }
.glyphe {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 78px;
  height: 88px;
  font-size: 3.6rem;
  font-weight: 800;
  line-height: 1;
}
.glyphe-b { color: #3d6ea8; }
.glyphe-d { color: #c47a28; }
.ventre, .dos {
  position: absolute;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  bottom: 16px;
}
.ventre { right: 4px; background: #7eb6e0; }
.dos { left: 2px; background: #f0b56a; }
.gateau-rond { width: min(280px, 78vw); height: auto; display: block; margin: 8px auto; }
.part-svg { cursor: pointer; }
.bulle-etoile {
  width: 190px;
  height: 190px;
  margin: 12px auto;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: radial-gradient(circle, #fff8e4 0%, #f3d48a 58%, #e4d4f2 100%);
  box-shadow: 0 0 0 10px rgba(255, 224, 138, 0.35);
  transition: transform 1s ease;
  font-size: 2.4rem;
  text-align: center;
}
.bulle-etoile.inspire { transform: scale(1.22); }
.bulle-etoile.souffle { transform: scale(0.78); }
.compte-souffle { font-size: 2.2rem; font-weight: 800; color: #5c4630; }
.totem-bande {
  margin: 0 0 16px;
  padding: 14px 16px;
  border-radius: 28px;
  background: rgba(255, 248, 236, 0.92);
  border: 3px solid rgba(226, 182, 87, 0.45);
}
.totem-bande input {
  min-height: 52px;
  border-radius: 16px;
  border: 2px solid #e2b657;
  padding: 8px 12px;
  font: inherit;
  font-weight: 800;
  background: #fffdf8;
  width: min(280px, 100%);
}
.totem-bande label { display: grid; gap: 6px; font-weight: 800; margin-top: 8px; }
.foret .animal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: auto;
  min-height: 148px;
  padding: 10px;
}
.barre-magique {
  grid-column: 1 / -1;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 2px 2px 8px;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
}
.barre-magique::-webkit-scrollbar { height: 0; }
.pilule {
  scroll-snap-align: start;
  flex: 0 0 auto;
  border-radius: 999px;
  min-height: 48px;
  padding: 8px 14px;
  font-weight: 800;
  border: 3px solid rgba(196, 146, 78, 0.35);
  color: #3d4a34;
}
.pilule[aria-pressed="true"] {
  border-color: #c4924e;
  box-shadow: 0 4px 0 #c4924e;
}
.pilule-iles { background: #d9f0df; }
.pilule-histoire { background: #d9dcf6; }
.pilule-trace { background: #f8e7c0; }
.pilule-bd { background: #f8d7e6; }
.pilule-gardiens { background: #d7f0c8; }
.pilule-duo { background: #f8e0cc; }
.choix-doux {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.choix-doux button {
  border-radius: 999px;
  min-height: 52px;
  padding: 8px 14px;
  font-weight: 800;
  border: 3px solid rgba(196, 146, 78, 0.4);
  background: #fff8ee;
  color: #3d4a34;
}
.choix-doux button.choisi {
  background: #f0c56e;
  border-color: #c4924e;
}
.conte-nuit {
  max-height: 48vh;
  overflow: auto;
  padding: 12px 4px 28px;
  font-size: 1.35rem;
  line-height: 1.75;
}
.phrase-murmure { margin-top: 18px; }
.kids-app.nuit .kids-header {
  background: rgba(18, 36, 68, 0.92);
  border-bottom-color: rgba(180, 206, 236, 0.28);
}
.kids-app.nuit .rappel,
.kids-app.nuit .heros-nom { color: #e7eef8; }
.kids-app.nuit .kids-main { color: #f7f3ea; }
.kids-app.nuit .kids-nuages { opacity: 0; }
.ciel-nuit {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 1;
}
.ciel-nuit i {
  position: absolute;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #fff6d4;
  box-shadow: 0 0 8px #fff1c2;
  animation: kids-scintille 2.8s ease-in-out infinite;
}
.bd-cases {
  display: grid;
  gap: 12px;
}
.case-bd {
  background: #fff8ee;
  border: 3px solid #f0d0a8;
  border-radius: 26px;
  padding: 14px;
  min-height: 210px;
  text-align: center;
}
.case-bd h3 { margin: 0 0 8px; font-size: 1.05rem; }
.fraises { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; font-size: 2.1rem; }
.fraise-tombe { display: inline-block; animation: kids-tombe 1.6s ease-in-out infinite; }
.panier-bd { font-size: 3rem; }
.bulle-reponse {
  width: 92px;
  height: 92px;
  border-radius: 50%;
  font-size: 2rem;
  font-weight: 800;
  background: #fff;
  border: 3px solid #e2b657;
  color: #3d4a34;
}
.bulle-reponse.juste { background: #f0c56e; }
.ardoise {
  position: relative;
  height: 300px;
  border-radius: 28px;
  overflow: hidden;
  border: 3px solid #e2b657;
  touch-action: none;
  background: #f7f3ea;
}
.repere {
  position: absolute;
  left: 0;
  right: 0;
  height: 33.34%;
  display: flex;
  align-items: flex-end;
  padding: 0 12px 6px;
  font-weight: 800;
  pointer-events: none;
}
.repere.ciel { top: 0; background: rgba(158, 198, 232, 0.55); color: #24527a; }
.repere.herbe { top: 33.34%; background: rgba(154, 206, 160, 0.5); color: #245c38; }
.repere.terre { top: 66.68%; background: rgba(196, 150, 104, 0.55); color: #5c3a22; }
.encre { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.modele-lettre {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 8.5rem;
  font-weight: 800;
  color: rgba(44, 69, 84, 0.16);
  pointer-events: none;
  font-family: "Lexend", "Nunito", sans-serif;
}
.scene-energie {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: end;
  perspective: 800px;
}
.socle-panneau, .moulin {
  background: transparent;
  border: 0;
  min-height: 160px;
}
.panneau-3d {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5px;
  width: 148px;
  height: 104px;
  margin: 0 auto;
  padding: 8px;
  border-radius: 12px;
  background: linear-gradient(160deg, #3d6294, #1b3a66);
  box-shadow: 0 14px 0 rgba(27, 58, 102, 0.25);
  transition: transform 0.45s ease;
}
.panneau-3d i { background: #9fd0f2; border-radius: 4px; }
.moulin { position: relative; }
.rotor { width: 120px; height: 120px; margin: 0 auto; position: relative; }
.rotor.tourne { animation: kids-pales 1.1s linear infinite; }
.rotor i {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 16px;
  height: 50px;
  margin: -50px 0 0 -8px;
  background: #f7f1e6;
  border-radius: 10px;
  transform-origin: 50% 50px;
  box-shadow: 0 0 0 2px rgba(196, 146, 78, 0.35);
}
.rotor i:nth-child(2) { transform: rotate(120deg); }
.rotor i:nth-child(3) { transform: rotate(240deg); }
.mat {
  width: 10px;
  height: 54px;
  margin: -8px auto 0;
  background: #c4924e;
  border-radius: 8px;
}
.jauge-verte {
  height: 26px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.65);
  border: 3px solid #3e9474;
  overflow: hidden;
}
.jauge-verte span {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #b7e4c7, #2f8f62);
  transition: width 0.45s ease;
}
.phare {
  width: 54px;
  margin: 8px auto 0;
  text-align: center;
}
.phare .tour {
  display: block;
  height: 70px;
  border-radius: 18px 18px 8px 8px;
  background: linear-gradient(180deg, #f4efe6, #e2b657);
}
.phare.allume .tour { box-shadow: 0 0 24px #ffe08a; }
.faisceau {
  display: block;
  height: 18px;
  margin-bottom: 4px;
  border-radius: 999px;
  background: transparent;
}
.phare.allume .faisceau { background: rgba(255, 224, 138, 0.85); box-shadow: 0 0 18px #ffe08a; }
.guirlande { display: flex; gap: 12px; justify-content: center; min-height: 28px; }
.guirlande i {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #efe6d4;
}
.guirlande.allume i {
  background: #ffe08a;
  box-shadow: 0 0 12px #ffe08a;
  animation: kids-scintille 1.3s ease-in-out infinite;
}
.guirlande.allume i:nth-child(2n) { background: #f3b4cb; animation-delay: 0.35s; }
.duo-grille {
  display: grid;
  gap: 14px;
}
.role-duo {
  background: rgba(255, 248, 238, 0.9);
  border: 3px solid rgba(226, 182, 87, 0.7);
  border-radius: 28px;
  padding: 14px;
}
.slots-syl { display: flex; gap: 8px; min-height: 64px; }
.slot-syl {
  min-width: 84px;
  min-height: 64px;
  border-radius: 18px;
  border: 3px dashed #c4a15a;
  display: grid;
  place-items: center;
  font-weight: 800;
  font-size: 1.3rem;
  background: rgba(255, 255, 255, 0.7);
}
.victoire-duo {
  background: #f0fdf4;
  border: 3px solid #3e9474;
  border-radius: 24px;
  padding: 16px;
  text-align: center;
  font-weight: 800;
}
@media (min-width: 860px) {
  .missions { grid-template-columns: 1fr 1fr; }
  .bd-cases { grid-template-columns: repeat(3, 1fr); }
  .duo-grille { grid-template-columns: 1fr 1fr; }
}
@media (min-width: 980px) {
  .portes { grid-template-columns: repeat(3, 1fr); }
}
@media (max-width: 800px) {
  .kids-header { grid-template-columns: 1fr; }
  .kids-dys { justify-self: stretch; }
  .accueil-noa { flex-direction: column; align-items: center; }
  .bulle-noa { border-radius: 28px; }
  .scene-energie { grid-template-columns: 1fr; }
}
@media (max-width: 980px) {
  .kids-dys { justify-content: center; }
  .animal { width: 118px; font-size: 3rem; }
  .labo-scene { height: 280px; }
}
@media (prefers-reduced-motion: reduce) {
  .kids-app *, .kids-app *::before, .kids-app *::after {
    animation: none !important;
    transition: none !important;
  }
}
@keyframes kids-hibou {
  0%, 100% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-4px) rotate(-2deg); }
}
@keyframes kids-derive {
  from { transform: translateX(-12vw); }
  to { transform: translateX(12vw); }
}
@keyframes kids-scintille {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.35); }
}
@keyframes kids-tombe {
  0% { transform: translateY(-16px); opacity: 0.45; }
  70% { transform: translateY(6px); opacity: 1; }
  100% { transform: translateY(0); opacity: 1; }
}
@keyframes kids-pales {
  to { transform: rotate(360deg); }
}
@keyframes kids-flotte {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
@keyframes kids-danse {
  0%, 100% { transform: translateY(0) rotate(0); }
  35% { transform: translateY(-14px) rotate(-8deg); }
  70% { transform: translateY(-4px) rotate(7deg); }
}
@keyframes kids-berce {
  0%, 100% { transform: translateX(0); }
  30% { transform: translateX(-7px); }
  70% { transform: translateX(7px); }
}
@keyframes kids-etincelle {
  to { transform: translate(var(--dx), var(--dy)) scale(0.4); opacity: 0; }
}
`;

const NOMS_LETTRES: Record<string, string> = {
  a: "a", à: "a", â: "a", ä: "a",
  b: "bé",
  c: "cé", ç: "cé cédille",
  d: "dé",
  e: "e", é: "é", è: "è", ê: "ê", ë: "e",
  f: "effe",
  g: "gé",
  h: "ache",
  i: "i", î: "i", ï: "i",
  j: "ji",
  k: "ka",
  l: "elle",
  m: "emme",
  n: "enne",
  o: "o", ô: "o", ö: "o",
  p: "pé",
  q: "cu",
  r: "erre",
  s: "esse",
  t: "té",
  u: "u", ù: "u", û: "u", ü: "u",
  v: "vé",
  w: "double vé",
  x: "iks",
  y: "i grec", ÿ: "i grec",
  z: "zède",
  œ: "e dans l'o",
  æ: "e dans l'a",
  "'": "apostrophe",
  "’": "apostrophe",
  "-": "trait d'union",
};

const VOYELLES = new Set("aeiouyàâäéèêëïîôùûüœæ".split(""));
const DIGRAMMES = new Set(["bl", "br", "ch", "cl", "cr", "dr", "fl", "fr", "gl", "gn", "gr", "ph", "pl", "pr", "tr", "vr"]);

let voixFr: SpeechSynthesisVoice | null = null;
let parlerJeton = 0;
let ctxAudio: AudioContext | null = null;
let crisEnCours: OscillatorNode[] = [];

function lireLocal(cle: string, defaut: string) {
  try {
    return localStorage.getItem(cle) ?? defaut;
  } catch {
    return defaut;
  }
}

function ecrireLocal(cle: string, valeur: string) {
  try {
    localStorage.setItem(cle, valeur);
  } catch {
    /* navigation privée */
  }
}

function dateDuJour() {
  const d = new Date();
  const mois = String(d.getMonth() + 1).padStart(2, "0");
  const jour = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mois}-${jour}`;
}

function ecrireEtoilesDuJour(n: number) {
  ecrireLocal(CLE_JOUR, JSON.stringify({ date: dateDuJour(), n }));
  ecrireLocal(CLE_ETOILES, String(n));
}

function lireEtoilesDuJour() {
  const auj = dateDuJour();
  try {
    const brut = localStorage.getItem(CLE_JOUR);
    if (brut) {
      const data = JSON.parse(brut) as { date?: string; n?: number };
      if (data.date === auj && typeof data.n === "number" && data.n > 0) return data.n;
      if (data.date === auj) return 0;
      return 0;
    }
  } catch {
    /* compteur du jour illisible */
  }
  const ancien = Number.parseInt(lireLocal(CLE_ETOILES, "0"), 10);
  const n = Number.isFinite(ancien) && ancien > 0 ? ancien : 0;
  ecrireEtoilesDuJour(n);
  return n;
}

const CLE_HEROS = "energia-kids-heros";
type TotemId = "renard" | "hibou" | "chaton" | "ours";
type Heros = { prenom: string; totem: TotemId | "" };
const TOTEMS: { id: TotemId; nom: string; emoji: string }[] = [
  { id: "renard", nom: "Le Renardeau", emoji: "🦊" },
  { id: "hibou", nom: "Le Petit Hibou", emoji: "🦉" },
  { id: "chaton", nom: "Le Chaton", emoji: "🐱" },
  { id: "ours", nom: "L'Ours doux", emoji: "🐻" },
];

function lireHeros(): Heros {
  try {
    const brut = localStorage.getItem(CLE_HEROS);
    if (!brut) return { prenom: "", totem: "" };
    const data = JSON.parse(brut) as { prenom?: string; totem?: string };
    const totem = TOTEMS.some((t) => t.id === data.totem) ? (data.totem as TotemId) : "";
    const prenom = typeof data.prenom === "string" ? data.prenom.trim().slice(0, 24) : "";
    return { prenom, totem };
  } catch {
    return { prenom: "", totem: "" };
  }
}

function ecrireHeros(heros: Heros) {
  ecrireLocal(CLE_HEROS, JSON.stringify(heros));
}

const FORET = [
  { id: "oiseau", court: "L'Oiseau bleu", cri: "Cui-cui !", eloge: "Oui ! C'est l'oiseau bleu qui chante cui-cui !", emoji: "🐦" },
  { id: "chat", court: "Le Petit Chat", cri: "Miaouuu !", eloge: "Oui ! C'est le petit chat qui miaule !", emoji: "🐱" },
  { id: "grenouille", court: "La Grenouille verte", cri: "Croac !", eloge: "Oui ! C'est la grenouille verte qui croasse !", emoji: "🐸" },
  { id: "lion", court: "Le Lionceau", cri: "Rrrrr !", eloge: "Oui ! C'est le lionceau qui rugit tout doucement !", emoji: "🦁" },
] as const;

function libelleCoffre(n: number) {
  if (n <= 0) return "✨ Le coffre t'attend aujourd'hui";
  if (n === 1) return "✨ 1 étoile gagnée aujourd'hui";
  return `✨ ${n} étoiles gagnées aujourd'hui`;
}

function melanger<T>(liste: T[]): T[] {
  const copie = [...liste];
  for (let i = copie.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copie[i], copie[j]] = [copie[j], copie[i]];
  }
  return copie;
}

function nomLettre(lettre: string) {
  const bas = lettre.toLowerCase();
  return NOMS_LETTRES[bas] ?? NOMS_LETTRES[lettre] ?? lettre;
}

function preparerDire(text: string) {
  const propre = text.replace(/\s+/g, " ").trim();
  if ([...propre].length === 1) return nomLettre(propre);
  return propre;
}

function rafraichirVoix() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const voices = window.speechSynthesis.getVoices();
  voixFr =
    voices.find((v) => v.lang.toLowerCase().replace("_", "-").startsWith("fr-fr")) ||
    voices.find((v) => v.lang.toLowerCase().startsWith("fr")) ||
    null;
}

function indexMotAuCaractere(texte: string, charIndex: number) {
  const avant = texte.slice(0, Math.max(0, charIndex)).trim();
  if (!avant) return 0;
  return avant.split(/\s+/).length;
}

function speak(text: string, rate = 0.9, ensuite?: () => void, onMot?: (index: number) => void, pitch?: number) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onMot?.(-1);
    ensuite?.();
    return;
  }
  const dit = preparerDire(text);
  if (!dit) {
    onMot?.(-1);
    ensuite?.();
    return;
  }
  rafraichirVoix();
  const synth = window.speechSynthesis;
  const u = new SpeechSynthesisUtterance(dit);
  u.lang = "fr-FR";
  u.rate = rate;
  u.pitch = typeof pitch === "number" ? pitch : onMot ? 1.08 : 1.02;
  if (voixFr) u.voice = voixFr;
  const jeton = ++parlerJeton;
  let clos = false;
  let vuFrontiere = false;
  const finir = () => {
    if (clos) return;
    clos = true;
    onMot?.(-1);
    ensuite?.();
  };
  u.onboundary = (event) => {
    if (event.name !== "word") return;
    vuFrontiere = true;
    onMot?.(indexMotAuCaractere(dit, event.charIndex));
  };
  u.onend = finir;
  u.onerror = finir;
  synth.cancel();
  window.setTimeout(() => {
    if (jeton !== parlerJeton) return;
    if (voixFr) u.voice = voixFr;
    synth.resume();
    synth.speak(u);
    if (!onMot) return;
    window.setTimeout(() => {
      if (jeton !== parlerJeton || vuFrontiere || clos) return;
      const mots = dit.split(/\s+/).filter(Boolean);
      const pas = Math.max(280, Math.round(430 / rate));
      mots.forEach((_, i) => {
        window.setTimeout(() => {
          if (parlerJeton !== jeton || clos) return;
          onMot(i);
        }, i * pas);
      });
    }, 420);
  }, 70);
}

function contexteAudio() {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ||
    (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctxAudio) ctxAudio = new Ctor();
  if (ctxAudio.state === "suspended") void ctxAudio.resume();
  return ctxAudio;
}

function jouerBravo() {
  const ctx = contexteAudio();
  if (!ctx) return;
  [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime + i * 0.11;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.06, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
    osc.start(t);
    osc.stop(t + 0.3);
  });
}

function jouerCarillon() {
  const ctx = contexteAudio();
  if (!ctx) return;
  [784, 988, 1175, 1568].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const t = ctx.currentTime + i * 0.09;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.04, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
    osc.start(t);
    osc.stop(t + 0.52);
  });
}

function jouerCri(id: string) {
  const ctx = contexteAudio();
  if (!ctx) return;
  crisEnCours.forEach((osc) => {
    try {
      osc.stop();
    } catch {
      /* déjà arrêté */
    }
  });
  crisEnCours = [];
  const now = ctx.currentTime + 0.02;
  const osc = ctx.createOscillator();
  const filtre = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  osc.connect(filtre);
  filtre.connect(gain);
  gain.connect(ctx.destination);
  filtre.type = "lowpass";
  filtre.frequency.value = 1800;
  gain.gain.setValueAtTime(0.0001, now);
  let fin = now + 0.45;
  osc.type = "sine";
  if (id === "chat") {
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.16);
    osc.frequency.exponentialRampToValueAtTime(340, now + 0.42);
    gain.gain.exponentialRampToValueAtTime(0.11, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.46);
    fin = now + 0.48;
  } else if (id === "chien") {
    osc.type = "square";
    osc.frequency.value = 170;
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "square";
    osc2.frequency.value = 150;
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    gain2.gain.setValueAtTime(0.0001, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.05, now + 0.22);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    osc2.start(now + 0.2);
    osc2.stop(now + 0.36);
    crisEnCours.push(osc2);
    fin = now + 0.36;
  } else if (id === "vache") {
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.7);
    gain.gain.exponentialRampToValueAtTime(0.1, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
    fin = now + 0.78;
  } else if (id === "canard") {
    osc.frequency.value = 640;
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
    fin = now + 0.12;
  } else if (id === "lion") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.55);
    filtre.frequency.value = 500;
    gain.gain.exponentialRampToValueAtTime(0.06, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
    fin = now + 0.62;
  } else if (id === "oiseau") {
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(1900, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(1600, now + 0.18);
    osc2.frequency.exponentialRampToValueAtTime(2100, now + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    gain2.gain.setValueAtTime(0.0001, now + 0.16);
    gain2.gain.exponentialRampToValueAtTime(0.045, now + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);
    osc2.start(now + 0.16);
    osc2.stop(now + 0.36);
    crisEnCours.push(osc2);
    fin = now + 0.38;
  } else if (id === "vent") {
    osc.type = "triangle";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.8);
    filtre.frequency.value = 420;
    gain.gain.exponentialRampToValueAtTime(0.07, now + 0.12);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    fin = now + 0.95;
  } else {
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.16);
    gain.gain.exponentialRampToValueAtTime(0.1, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
    fin = now + 0.2;
  }
  osc.start(now);
  osc.stop(fin);
  crisEnCours.push(osc);
}

function estVoyelle(ch: string) {
  return VOYELLES.has(ch.toLowerCase());
}

function decouperSyllabes(mot: string): string[] {
  const chars = [...mot];
  if (chars.length <= 1) return chars.length ? [mot] : [];
  const groupes: Array<[number, number]> = [];
  let i = 0;
  while (i < chars.length) {
    if (!estVoyelle(chars[i])) {
      i += 1;
      continue;
    }
    const debut = i;
    while (i < chars.length && estVoyelle(chars[i])) i += 1;
    groupes.push([debut, i - 1]);
  }
  if (groupes.length <= 1) return [mot];
  const coupures = [0];
  for (let g = 0; g < groupes.length - 1; g += 1) {
    const fin = groupes[g][1];
    const suiv = groupes[g + 1][0];
    const entre = chars.slice(fin + 1, suiv).join("").toLowerCase();
    if (entre.length <= 1) coupures.push(suiv - entre.length);
    else if (entre.length >= 2 && DIGRAMMES.has(entre.slice(-2))) coupures.push(suiv - 2);
    else coupures.push(fin + 2);
  }
  coupures.push(chars.length);
  const syllabes: string[] = [];
  for (let c = 0; c < coupures.length - 1; c += 1) {
    if (coupures[c + 1] > coupures[c]) {
      syllabes.push(chars.slice(coupures[c], coupures[c + 1]).join(""));
    }
  }
  return syllabes.length ? syllabes : [mot];
}

function separerPonctuation(mot: string) {
  const m = mot.match(/^([^A-Za-zÀ-ÿŒœÆæ'’]*)([A-Za-zÀ-ÿŒœÆæ'’]*)(.*)$/);
  if (!m) return { avant: "", noyau: mot, apres: "" };
  return { avant: m[1], noyau: m[2], apres: m[3] };
}

function enMots(n: number) {
  return ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix"][n] ?? String(n);
}

function phraseBalance(deja: number, ajoutees: number, cible: number) {
  const ajout =
    ajoutees === 1
      ? "Une pomme dorée"
      : `${enMots(ajoutees).charAt(0).toUpperCase()}${enMots(ajoutees).slice(1)} pommes dorées`;
  const base = deja === 1 ? "la pomme déjà posée" : `les ${enMots(deja)} pommes déjà posées`;
  return `La balance est toute droite. ${ajout}, avec ${base}, c'est aussi lourd que les ${enMots(cible)} pommes de l'autre côté.`;
}

function assurerStyle() {
  if (typeof document === "undefined") return;
  let style = document.getElementById("kids-app-style") as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = "kids-app-style";
    document.head.appendChild(style);
  }
  if (style.textContent !== CSS_KIDS) style.textContent = CSS_KIDS;
}

function usePlusTard() {
  const timers = useRef<number[]>([]);
  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );
  return useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }, []);
}

function mouvementCalme() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function Confettis() {
  const pieces = useMemo(() => Array.from({ length: 30 }, (_, i) => i), []);
  if (mouvementCalme()) return null;
  return (
    <div className="confettis" aria-hidden="true">
      {pieces.map((i) => (
        <motion.span
          key={i}
          className="confetti"
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ y: "105vh", opacity: 0.15, rotate: i % 2 ? 200 : -200 }}
          transition={{ duration: 1.6 + (i % 5) * 0.12, ease: "easeIn", delay: (i % 7) * 0.03 }}
          style={{ left: `${(i * 29) % 100}%`, background: PAILLETTES[i % PAILLETTES.length] }}
        />
      ))}
    </div>
  );
}

function MotColore({ mot, dys }: { mot: string; dys: boolean }) {
  if (!dys) return <>{mot}</>;
  const { avant, noyau, apres } = separerPonctuation(mot);
  if (!noyau) return <>{mot}</>;
  const parties = noyau.split(/(['’])/).filter((partie) => partie.length > 0);
  return (
    <>
      {avant}
      {parties.map((partie, p) => {
        if (partie === "'" || partie === "’") return <span key={p}>{partie}</span>;
        const syllabes = decouperSyllabes(partie);
        const liste = syllabes.length ? syllabes : [partie];
        return liste.map((syl, s) => (
          <span key={`${p}-${s}`} style={{ color: COULEURS_SYL[s % COULEURS_SYL.length] }}>
            {syl}
          </span>
        ));
      })}
      {apres}
    </>
  );
}

function TexteIllumine({ text, dys, actif }: { text: string; dys: boolean; actif: number | null }) {
  const mots = text.split(/\s+/).filter(Boolean);
  return (
    <span className="recit kids-text">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {mots.map((mot, index) => (
          <span key={`${mot}-${index}`}>
            <span className={`mot-livre${actif === index ? " allume" : ""}`}>
              <MotColore mot={mot} dys={dys} />
            </span>
            {index < mots.length - 1 ? " " : null}
          </span>
        ))}
      </span>
    </span>
  );
}

function useLectureNoa(text: string) {
  const jeton = useRef(0);
  const [actif, setActif] = useState<number | null>(null);

  const ecouter = useCallback(() => {
    const moi = ++jeton.current;
    setActif(0);
    speak(
      text,
      0.84,
      () => {
        if (jeton.current === moi) setActif(null);
      },
      (index) => {
        if (jeton.current !== moi) return;
        setActif(index < 0 ? null : index);
      },
    );
  }, [text]);

  return { actif, ecouter, parle: actif !== null };
}

function BlocParlant({ text, dys, grand = false }: { text: string; dys: boolean; grand?: boolean }) {
  const { actif, ecouter } = useLectureNoa(text);
  return (
    <div className={`phrase-noa${grand ? " grand" : ""}`}>
      <p className="recit kids-text">
        <TexteIllumine text={text} dys={dys} actif={actif} />
      </p>
      <button type="button" className="ecouter-noa" onClick={ecouter}>
        🔊 Écouter avec Noa
      </button>
    </div>
  );
}

function FormeSvg({ id, couleur, creux = false }: { id: FormeId; couleur: string; creux?: boolean }) {
  const commun = { fill: creux ? "transparent" : couleur, stroke: couleur, strokeWidth: creux ? 7 : 0 };
  return (
    <svg viewBox="0 0 100 100" className="forme-svg" aria-hidden="true">
      {id === "rond" && <circle cx="50" cy="50" r="34" {...commun} />}
      {id === "carre" && <rect x="18" y="18" width="64" height="64" rx="10" {...commun} />}
      {id === "triangle" && <polygon points="50,12 90,84 10,84" {...commun} />}
      {id === "etoile" && (
        <polygon points="50,8 61,38 94,38 67,58 78,90 50,70 22,90 33,58 6,38 39,38" {...commun} />
      )}
    </svg>
  );
}

function Pomme({ nouvelle = false, onClick }: { nouvelle?: boolean; onClick?: () => void }) {
  if (onClick) {
    return (
      <button type="button" className={`pomme${nouvelle ? " nouvelle" : ""}`} onClick={onClick} aria-label="Reprendre cette pomme dorée" />
    );
  }
  return <span className={`pomme${nouvelle ? " nouvelle" : ""}`} aria-hidden="true" />;
}

type JeuBase = {
  dys: boolean;
  donnerEtoile: () => void;
  direCourage: (suite?: string) => void;
  direTemps: (suite?: string) => void;
};

function JeuAnimaux({ dys, donnerEtoile, direTemps }: JeuBase) {
  const plusTard = usePlusTard();
  const [ordre] = useState(() => melanger([...FORET]));
  const [index, setIndex] = useState(0);
  const [danse, setDanse] = useState<string | null>(null);
  const [berce, setBerce] = useState<string | null>(null);
  const [bloque, setBloque] = useState(false);
  const cible = ordre[index];

  useEffect(() => {
    if (!cible) return;
    let annule = false;
    let criId = 0;
    const id = window.setTimeout(() => {
      if (annule) return;
      jouerCri(cible.id);
      criId = window.setTimeout(() => {
        if (!annule) speak(cible.cri, 0.82);
      }, 520);
    }, 380);
    return () => {
      annule = true;
      window.clearTimeout(id);
      window.clearTimeout(criId);
    };
  }, [cible, index]);

  function ecouter() {
    if (!cible) return;
    jouerCri(cible.id);
    plusTard(() => speak(cible.cri, 0.82), 560);
  }

  if (!cible) {
    return (
      <div>
        <BlocParlant dys={dys} text="Toute la forêt a chanté avec toi. Tu peux réécouter si tu veux." />
        <button type="button" className="gros" onClick={() => setIndex(0)}>
          Réécouter la forêt
        </button>
      </div>
    );
  }

  return (
    <div>
      <BlocParlant dys={dys} text={`Noa a lancé un son : ${cible.cri} Touche l'animal qui le fait.`} />
      <div className="rang">
        <button type="button" className="gros" onClick={ecouter}>
          🔊 Écouter avec Noa
        </button>
        <button
          type="button"
          className="hesite"
          onClick={() => {
            direTemps("Écoute encore. Les quatre animaux t'attendent, sans se presser.");
            plusTard(ecouter, 4200);
          }}
        >
          💛 J'hésite
        </button>
      </div>
      <div className="choix-animaux foret">
        {FORET.map((animal) => (
          <button
            key={animal.id}
            type="button"
            className={`animal flotte${danse === animal.id ? " danse" : ""}${berce === animal.id ? " berce" : ""}`}
            aria-label={animal.court}
            disabled={bloque}
            onClick={() => {
              if (animal.id === cible.id) {
                setBloque(true);
                setDanse(animal.id);
                donnerEtoile();
                speak(animal.eloge, 0.86);
                plusTard(() => {
                  setDanse(null);
                  setBloque(false);
                  setIndex((n) => n + 1);
                }, 1500);
              } else {
                setBerce(animal.id);
                direTemps("Ce n'est pas encore celui-là. Réécoute le son, tout doucement.");
                plusTard(() => setBerce(null), 650);
              }
            }}
          >
            <span aria-hidden="true">{animal.emoji}</span>
            <span className="nom-animal">{animal.court}</span>
            {danse === animal.id && (
              <span className="etincelles" aria-hidden="true">
                {Array.from({ length: 6 }, (_, i) => (
                  <i key={i} />
                ))}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function JeuFormes({ dys, donnerEtoile, direCourage, direTemps }: JeuBase) {
  const plusTard = usePlusTard();
  const pieces = useMemo(() => melanger(FORMES), []);
  const maisons = useMemo(() => melanger(FORMES), []);
  const [choisie, setChoisie] = useState<FormeId | null>(null);
  const [placees, setPlacees] = useState<FormeId[]>([]);
  const [berce, setBerce] = useState<FormeId | null>(null);
  const [fini, setFini] = useState(false);

  function rejouer() {
    setChoisie(null);
    setPlacees([]);
    setFini(false);
  }

  return (
    <div>
      <BlocParlant dys={dys} text="Touche une forme, puis touche sa maison de la même couleur." />
      <div className="choix-formes" aria-label="Maisons des formes">
        {maisons.map((forme) => {
          const ok = placees.includes(forme.id);
          return (
            <button
              key={forme.id}
              type="button"
              className={`maison${berce === forme.id ? " berce" : ""}`}
              aria-label={`Maison du ${forme.nom}`}
              onClick={() => {
                speak(forme.nom);
                if (!choisie || ok) return;
                if (choisie === forme.id) {
                  const suivantes = [...placees, forme.id];
                  setPlacees(suivantes);
                  setChoisie(null);
                  donnerEtoile();
                  const complet = suivantes.length === FORMES.length;
                  speak(complet ? "Toutes les formes ont trouvé leur maison. Bravo !" : "Oui ! Elles vont ensemble.");
                  if (complet) setFini(true);
                } else {
                  setBerce(forme.id);
                  direCourage("Cherche la même forme et la même couleur.");
                  plusTard(() => setBerce(null), 650);
                }
              }}
            >
              <FormeSvg id={forme.id} couleur={forme.couleur} creux={!ok} />
              {ok && (
                <span className="etincelles" aria-hidden="true">
                  {Array.from({ length: 6 }, (_, i) => (
                    <i key={i} />
                  ))}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="choix-formes" aria-label="Formes à ranger">
        {pieces.map((forme) =>
          placees.includes(forme.id) ? null : (
            <button
              key={forme.id}
              type="button"
              className={`piece${choisie === forme.id ? " choisie" : ""}`}
              aria-label={forme.nom}
              onClick={() => {
                setChoisie(forme.id);
                speak(forme.nom);
              }}
            >
              <FormeSvg id={forme.id} couleur={forme.couleur} />
            </button>
          ),
        )}
      </div>
      <div className="rang">
        <button type="button" className="hesite" onClick={() => direTemps("Cherche la même forme et la même couleur.")}>
          💛 J'hésite
        </button>
        {fini && (
          <button type="button" className="doux" onClick={rejouer}>
            Rejouer
          </button>
        )}
      </div>
    </div>
  );
}

function ManchePont({
  mot,
  dys,
  onGagne,
  direCourage,
}: {
  mot: MotPont;
  dys: boolean;
  onGagne: (phrase: string, dernier: boolean) => void;
  direCourage: (suite?: string) => void;
}) {
  const [slots, setSlots] = useState<(string | null)[]>(() => mot.syllabes.map(() => null));
  const resolu = useRef(false);
  const choix = useMemo(() => {
    const pool = ["LO", "PI", "MU", "ZA", "RI", "TO", "NE", "LU", "FA", "BO"];
    const extras = melanger(pool.filter((p) => !mot.syllabes.includes(p))).slice(0, 2);
    return melanger([...mot.syllabes, ...extras]);
  }, [mot]);

  useEffect(() => {
    if (slots.some((s) => s == null)) {
      resolu.current = false;
      return;
    }
    if (resolu.current) return;
    const ok = slots.every((s, i) => s === mot.syllabes[i]);
    const timer = window.setTimeout(() => {
      if (resolu.current) return;
      resolu.current = true;
      if (ok) onGagne(mot.mot, false);
      else {
        direCourage(mot.indice);
        setSlots(mot.syllabes.map(() => null));
      }
    }, ok ? 1700 : 700);
    return () => window.clearTimeout(timer);
  }, [slots, mot, onGagne, direCourage]);

  function poser(syl: string) {
    speak(syl, 0.82);
    setSlots((prev) => {
      const trou = prev.indexOf(null);
      if (trou < 0) return prev;
      const next = [...prev];
      next[trou] = syl;
      return next;
    });
  }

  function retirerDernier() {
    setSlots((prev) => {
      let last = -1;
      prev.forEach((s, i) => {
        if (s) last = i;
      });
      if (last < 0) return prev;
      speak(prev[last] || "", 0.82);
      const next = [...prev];
      next[last] = null;
      return next;
    });
  }

  const poses = slots.filter(Boolean) as string[];

  return (
    <div>
      <p className="emoji-xl" style={{ textAlign: "center", margin: "8px 0" }} aria-hidden="true">
        {mot.emoji}
      </p>
      <BlocParlant dys={dys} text={mot.indice} />
      <div className="choix-formes" aria-label="Cases du pont">
        {slots.map((syl, i) => (
          <button key={i} type="button" className="slot" onClick={retirerDernier} aria-label={syl ? `Syllabe ${syl}` : "Case vide"}>
            {syl}
          </button>
        ))}
      </div>
      <div className="briques">
        {choix.map((syl) => (
          <button key={syl} type="button" className="brique" disabled={poses.includes(syl)} onClick={() => poser(syl)}>
            {syl}
          </button>
        ))}
      </div>
      {poses.length === mot.syllabes.length && poses.every((s, i) => s === mot.syllabes[i]) && (
        <div className="mot-revele" aria-label="Lettres du mot">
          {[...mot.mot].map((lettre, i) => (
            <button key={i} type="button" className="perle" onClick={() => speak(lettre)} aria-label={`Lettre ${nomLettre(lettre)}`}>
              {lettre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function JeuSyllabes({ dys, donnerEtoile, direCourage, direTemps }: JeuBase) {
  const [index, setIndex] = useState(0);
  const mot = MOTS_PONT[index];
  const onGagne = useCallback(
    (motTrouve: string) => {
      const dernier = index + 1 >= MOTS_PONT.length;
      donnerEtoile();
      speak(
        dernier
          ? `Oui ! ${motTrouve}. Le petit renard a traversé la rivière magique !`
          : `Oui ! ${motTrouve}. Le renard avance sur le pont.`,
      );
      setIndex((n) => n + 1);
    },
    [donnerEtoile, index],
  );

  return (
    <div>
      <div className="riviere" aria-hidden="true">
        <span className="berge gauche" />
        <span className="berge droite" />
        <motion.div
          className="renard"
          animate={{ left: `${4 + Math.min(index, MOTS_PONT.length) * 20}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 14 }}
        >
          🦊
        </motion.div>
        <div className="eau" />
      </div>
      <BlocParlant
        dys={dys}
        text="Écoute chaque syllabe, puis assemble le mot pour que le renard traverse la rivière."
      />
      {mot ? (
        <ManchePont key={mot.mot} mot={mot} dys={dys} onGagne={onGagne} direCourage={direCourage} />
      ) : (
        <div>
          <BlocParlant dys={dys} text="Le petit renard a traversé la rivière magique." />
          <button type="button" className="gros" onClick={() => setIndex(0)}>
            Rejouer
          </button>
        </div>
      )}
      <div className="rang">
        <button type="button" className="hesite" onClick={() => direTemps(mot ? mot.indice : "Tu peux recommencer le pont.")}>
          💛 J'hésite
        </button>
      </div>
    </div>
  );
}

const NIVEAUX_BALANCE = [
  { deja: 3, cible: 5 },
  { deja: 2, cible: 4 },
  { deja: 1, cible: 4 },
];

function JeuBalance({ dys, donnerEtoile, direCourage, direTemps }: JeuBase) {
  const [niveau, setNiveau] = useState(0);
  const [ajoutees, setAjoutees] = useState(0);
  const [gagne, setGagne] = useState(false);
  const palier = NIVEAUX_BALANCE[Math.min(niveau, NIVEAUX_BALANCE.length - 1)];
  const total = palier.deja + ajoutees;
  const angle = Math.max(-16, Math.min(16, (total - palier.cible) * 6));
  const fini = niveau >= NIVEAUX_BALANCE.length;

  function poser() {
    if (gagne || fini) return;
    const prochain = ajoutees + 1;
    const somme = palier.deja + prochain;
    setAjoutees(prochain);
    if (somme === palier.cible) {
      setGagne(true);
      donnerEtoile();
      speak(phraseBalance(palier.deja, prochain, palier.cible));
    } else if (somme > palier.cible) {
      direCourage("Tu peux reprendre une pomme dorée.");
    }
  }

  function reprendre() {
    if (gagne || ajoutees <= 0) return;
    setAjoutees((n) => Math.max(0, n - 1));
  }

  function suite() {
    setAjoutees(0);
    setGagne(false);
    setNiveau((n) => n + 1);
  }

  if (fini) {
    return (
      <div>
        <BlocParlant dys={dys} text="Les deux paniers ont été aussi lourds, plusieurs fois. Tu sens les quantités dans tes mains." />
        <button type="button" className="gros" onClick={() => { setNiveau(0); setAjoutees(0); setGagne(false); }}>
          Rejouer
        </button>
      </div>
    );
  }

  return (
    <div>
      <BlocParlant
        dys={dys}
        text="Pose des pommes dorées dans ton panier, jusqu'à ce que la balance soit toute droite."
      />
      <div className="balance" aria-hidden="false">
        <div className="socle" />
        <div className="balancier" style={{ transform: `rotate(${angle}deg)` }}>
          <div className="panier gauche" style={{ transform: `rotate(${-angle}deg)` }}>
            <strong>Ton panier</strong>
            {Array.from({ length: palier.deja }, (_, i) => (
              <Pomme key={`d-${i}`} />
            ))}
            {Array.from({ length: ajoutees }, (_, i) => (
              <Pomme key={`a-${i}`} nouvelle onClick={gagne ? undefined : reprendre} />
            ))}
          </div>
          <div className="panier droit" style={{ transform: `rotate(${-angle}deg)` }}>
            <strong>L'autre panier</strong>
            {Array.from({ length: palier.cible }, (_, i) => (
              <Pomme key={`c-${i}`} />
            ))}
          </div>
        </div>
      </div>
      <div className="rang" style={{ justifyContent: "center" }}>
        <button type="button" className="gros" onClick={poser} disabled={gagne}>
          Poser une pomme dorée
        </button>
        <button type="button" className="hesite" onClick={() => direTemps("Compte les pommes de l'autre panier avec ton doigt.")}>
          💛 J'hésite
        </button>
        {gagne && (
          <button type="button" className="doux" onClick={suite}>
            Encore une balance
          </button>
        )}
      </div>
    </div>
  );
}

const ENIGMES = [
  {
    titre: "La boussole disparue",
    recit: "Le professeur Lune a perdu sa boussole dans le laboratoire.",
    indices: [
      "Elle est ronde, et elle brille.",
      "Elle montre toujours le nord.",
      "Elle n'est pas dans le tiroir. Elle est restée près de l'aquarium.",
    ],
    question: "Où est la boussole ?",
    choix: [
      { id: "tiroir", label: "Dans le tiroir", emoji: "🗄️" },
      { id: "aquarium", label: "Près de l'aquarium", emoji: "🐠" },
      { id: "jardin", label: "Dans le jardin", emoji: "🌳" },
    ],
    bonne: "aquarium",
    joie: "Oui ! La boussole est près de l'aquarium.",
  },
  {
    titre: "Le carnet bleu",
    recit: "Un carnet bleu a disparu juste après l'expérience.",
    indices: [
      "Il est caché sous quelque chose de doux.",
      "Ce quelque chose est rouge.",
      "Ce n'est pas la bibliothèque.",
    ],
    question: "Où est le carnet bleu ?",
    choix: [
      { id: "coussin", label: "Sous le coussin rouge", emoji: "🛋️" },
      { id: "biblio", label: "Sur la bibliothèque", emoji: "📚" },
      { id: "porte", label: "Derrière la porte", emoji: "🚪" },
    ],
    bonne: "coussin",
    joie: "Oui ! Le carnet bleu est sous le coussin rouge.",
  },
];

function JeuDetective({ dys, donnerEtoile, direCourage, direTemps }: JeuBase) {
  const plusTard = usePlusTard();
  const [index, setIndex] = useState(0);
  const [berce, setBerce] = useState<string | null>(null);
  const [bloque, setBloque] = useState(false);
  const enigme = ENIGMES[index];

  if (!enigme) {
    return (
      <div>
        <BlocParlant dys={dys} text="Tu as éclairé les deux mystères du laboratoire." />
        <button type="button" className="gros" onClick={() => setIndex(0)}>
          Rejouer
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="kids-text" style={{ marginTop: 0 }}>{enigme.titre}</h2>
      <BlocParlant dys={dys} text={enigme.recit} />
      {enigme.indices.map((indice) => (
        <BlocParlant key={indice} dys={dys} text={indice} />
      ))}
      <BlocParlant dys={dys} text={enigme.question} grand />
      <div className="choix-detective">
        {enigme.choix.map((choix) => (
          <button
            key={choix.id}
            type="button"
            className={`choix${berce === choix.id ? " berce" : ""}`}
            disabled={bloque}
            onClick={() => {
              if (choix.id === enigme.bonne) {
                setBloque(true);
                donnerEtoile();
                const fini = index + 1 >= ENIGMES.length;
                speak(fini ? `${enigme.joie} Les deux mystères sont éclairés.` : enigme.joie);
                plusTard(() => {
                  setBloque(false);
                  setIndex((n) => n + 1);
                }, 1400);
              } else {
                setBerce(choix.id);
                direCourage("Réécoute les indices, tout doucement.");
                plusTard(() => setBerce(null), 650);
              }
            }}
          >
            <span aria-hidden="true">{choix.emoji}</span>
            <span className="kids-text">{choix.label}</span>
          </button>
        ))}
      </div>
      <div className="rang">
        <button type="button" className="hesite" onClick={() => direTemps("Réécoute les indices, tout doucement.")}>
          💛 J'hésite
        </button>
      </div>
    </div>
  );
}

function JeuGoutte({ dys, donnerEtoile, direCourage, direTemps }: JeuBase) {
  const boutons = useMemo(
    () =>
      melanger([
        { id: "soleil" as const, emoji: "☀️", label: "Le soleil" },
        { id: "nuage" as const, emoji: "☁️", label: "Le nuage" },
        { id: "pluie" as const, emoji: "🌧️", label: "La pluie" },
        { id: "riviere" as const, emoji: "🏞️", label: "La rivière" },
      ]),
    [],
  );
  const plusTard = usePlusTard();
  const [etape, setEtape] = useState(0);
  const [berce, setBerce] = useState<EtapeEau | null>(null);
  const [fini, setFini] = useState(false);
  const positions = [
    { left: "46%", top: "74%" },
    { left: "18%", top: "24%" },
    { left: "68%", top: "18%" },
    { left: "50%", top: "46%" },
    { left: "36%", top: "76%" },
  ];
  const pos = positions[Math.min(etape, positions.length - 1)];
  const indices = [
    "La goutte est dans la mer. Qu'est-ce qui la réchauffe ?",
    "La vapeur monte. Où se forme le nuage ?",
    "Le nuage est lourd. Qu'est-ce qui tombe ?",
    "La pluie rejoint le sol. Par où l'eau retourne-t-elle à la mer ?",
  ];

  function choisir(id: EtapeEau) {
    if (fini) return;
    if (id !== SUITE_EAU[etape]) {
      setBerce(id);
      direCourage(indices[etape]);
      plusTard(() => setBerce(null), 650);
      return;
    }
    const suivant = etape + 1;
    setEtape(suivant);
    donnerEtoile();
    const dernier = suivant >= SUITE_EAU.length;
    speak(
      dernier
        ? `${EXPLICATIONS_EAU[id]} La goutte a fait tout son voyage.`
        : EXPLICATIONS_EAU[id],
    );
    if (dernier) setFini(true);
  }

  return (
    <div>
      <BlocParlant dys={dys} text="La goutte commence dans la mer. Touche la prochaine étape de son voyage." />
      <div className="labo-scene" aria-hidden="true">
        <div className="soleil-dessin" />
        <div className="nuage-dessin" />
        <div className="pluie-dessin">
          <i />
          <i />
          <i />
        </div>
        <motion.div className="goutte" animate={{ left: pos.left, top: pos.top }} transition={{ type: "spring", stiffness: 70, damping: 15 }} />
      </div>
      <div className="choix-formes">
        {boutons.map((bouton) => (
          <button
            key={bouton.id}
            type="button"
            className={`choix etape-eau${berce === bouton.id ? " berce" : ""}`}
            onClick={() => choisir(bouton.id)}
            disabled={fini}
          >
            <span aria-hidden="true">{bouton.emoji}</span>
            <span className="kids-text"> {bouton.label}</span>
          </button>
        ))}
      </div>
      <div className="rang">
        <button type="button" className="hesite" onClick={() => direTemps(indices[Math.min(etape, indices.length - 1)])}>
          💛 J'hésite
        </button>
        {fini && (
          <button
            type="button"
            className="doux"
            onClick={() => {
              setEtape(0);
              setFini(false);
            }}
          >
            Refaire le voyage
          </button>
        )}
      </div>
    </div>
  );
}

function HibouNoa({ parle }: { parle: boolean }) {
  return (
    <svg className={`hibou${parle ? " parle" : ""}`} viewBox="0 0 160 180" aria-hidden="true">
      <ellipse cx="80" cy="168" rx="36" ry="8" fill="rgba(120,90,40,0.15)" />
      <path d="M28 92c-18 8-22 34-8 42 10 6 22-4 24-16" fill="#8fb48a" />
      <path d="M132 92c18 8 22 34 8 42-10 6-22-4-24-16" fill="#7aa67a" />
      <ellipse cx="80" cy="96" rx="48" ry="52" fill="#f3e0c4" />
      <path d="M46 58c8-28 28-40 34-40s26 12 34 40c-16-8-52-8-68 0z" fill="#c4a574" />
      <circle cx="58" cy="96" r="16" fill="#fff8ee" />
      <circle cx="102" cy="96" r="16" fill="#fff8ee" />
      <circle cx="60" cy="98" r="7" fill="#3d4a38" />
      <circle cx="104" cy="98" r="7" fill="#3d4a38" />
      <circle cx="62" cy="96" r="2.4" fill="#fff" />
      <circle cx="106" cy="96" r="2.4" fill="#fff" />
      <path d="M74 112c4 6 8 6 12 0" fill="none" stroke="#d17b8e" strokeWidth="3" strokeLinecap="round" />
      <path d="M68 118c8 10 16 10 24 0" fill="none" stroke="#c47a4a" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="48" cy="112" rx="8" ry="5" fill="#f0c2a8" opacity="0.85" />
      <ellipse cx="112" cy="112" rx="8" ry="5" fill="#f0c2a8" opacity="0.85" />
      <path d="M70 128h20c2 8-4 14-10 14s-12-6-10-14z" fill="#e2b657" />
      <rect x="96" y="128" width="22" height="16" rx="3" fill="#8b6bb5" />
      <path d="M96 132h22" stroke="#f6e7c4" strokeWidth="2" />
    </svg>
  );
}

function CoffreBois() {
  return (
    <svg viewBox="0 0 72 56" aria-hidden="true">
      <path d="M8 22h56v26a6 6 0 0 1-6 6H14a6 6 0 0 1-6-6V22z" fill="#c4924e" />
      <path d="M8 22c0-12 12-18 28-18s28 6 28 18" fill="#e2b56a" />
      <path d="M8 22h56" stroke="#8d6230" strokeWidth="3" />
      <rect x="32" y="28" width="8" height="10" rx="2" fill="#f6e7c4" />
      <circle cx="36" cy="36" r="2" fill="#8d6230" />
      <path d="M14 30h10M48 30h10M14 40h8M50 40h8" stroke="#a8783c" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Paysage({ ambiance }: { ambiance: AmbiancePorte }) {
  if (ambiance === "lagon") {
    return (
      <svg className="paysage" viewBox="0 0 360 140" aria-hidden="true">
        <rect width="360" height="140" fill="#c5e6f6" />
        <circle cx="58" cy="36" r="18" fill="#ffe7a8" />
        <rect x="132" y="46" width="26" height="48" fill="#f6e7c4" stroke="#c4924e" strokeWidth="2" />
        <rect x="126" y="38" width="38" height="12" fill="#e2b657" />
        <rect x="164" y="62" width="36" height="32" fill="#fff6dc" stroke="#e2b657" strokeWidth="2" />
        <path d="M160 62l22-16 22 16" fill="#d7a85a" />
        <rect x="204" y="50" width="24" height="44" fill="#f4e2b0" stroke="#c4924e" strokeWidth="2" />
        <rect x="198" y="42" width="36" height="12" fill="#e2b657" />
        <rect x="176" y="76" width="12" height="18" rx="2" fill="#8b6bb5" />
        <path d="M214 42v-14" stroke="#8b6bb5" strokeWidth="2" />
        <path d="M214 28h12v8h-12" fill="#d17b8e" />
        <path d="M0 108c40-18 80 10 130-4s80 16 120 0 70-8 110 6v30H0z" fill="#7ec8e0" />
        <circle cx="80" cy="102" r="5" fill="#e2b657" />
        <circle cx="286" cy="96" r="4" fill="#f6e7c4" />
        <circle cx="310" cy="104" r="3" fill="#e2b657" />
      </svg>
    );
  }
  if (ambiance === "etoile") {
    return (
      <svg className="paysage" viewBox="0 0 360 140" aria-hidden="true">
        <rect width="360" height="140" fill="#e7d4f2" />
        <circle cx="300" cy="34" r="16" fill="#f6e7c4" />
        <circle cx="40" cy="28" r="2" fill="#fff8ee" />
        <circle cx="78" cy="46" r="1.6" fill="#fff8ee" />
        <circle cx="120" cy="22" r="2.2" fill="#ffe08a" />
        <circle cx="210" cy="30" r="1.5" fill="#fff" />
        <path d="M70 140V78l40-24 40 24v62" fill="#f3d7b0" />
        <path d="M64 80l46-30 46 30" fill="#c4924e" />
        <rect x="98" y="100" width="18" height="22" rx="3" fill="#8b6bb5" />
        <rect x="78" y="96" width="12" height="12" rx="2" fill="#ffe08a" />
      </svg>
    );
  }
  return (
    <svg className="paysage" viewBox="0 0 360 140" aria-hidden="true">
      <rect width="360" height="140" fill="#e7f3c8" />
      <circle cx="300" cy="38" r="20" fill="#ffe08a" />
      <ellipse cx="100" cy="118" rx="130" ry="34" fill="#b7d98a" />
      <ellipse cx="260" cy="124" rx="140" ry="30" fill="#8fbf6a" />
      <path d="M64 96c8-16 14-16 18 0" fill="none" stroke="#5c8a4a" strokeWidth="3" strokeLinecap="round" />
      <circle cx="78" cy="78" r="7" fill="#f6e7c4" />
      <path d="M210 100c6-10 10-8 14 2" fill="none" stroke="#3e9474" strokeWidth="3" />
      <path d="M228 86l6-8 6 8" fill="#f0c56e" />
    </svg>
  );
}

function PorteAventure({
  monde,
  dys,
  ouvrir,
}: {
  monde: Monde;
  dys: boolean;
  ouvrir: (monde: Monde) => void;
}) {
  const { actif, ecouter } = useLectureNoa(monde.intro);
  return (
    <article className={`porte porte-${monde.ambiance}`}>
      <Paysage ambiance={monde.ambiance} />
      <div className="porte-corps">
        <p className="sous-titre">{monde.ages}</p>
        <h2 className="kids-text">
          {monde.emoji} {monde.titre}
        </h2>
        <p className="recit kids-text">
          <TexteIllumine text={monde.intro} dys={dys} actif={actif} />
        </p>
        <button type="button" className="ecouter-noa" onClick={ecouter}>
          🔊 Écouter avec Noa
        </button>
        <button type="button" className="partir" onClick={() => ouvrir(monde)}>
          {monde.bouton}
        </button>
      </div>
    </article>
  );
}

function ChoixAventurier({
  heros,
  onChanger,
}: {
  heros: Heros;
  onChanger: (heros: Heros) => void;
}) {
  const [prenom, setPrenom] = useState(heros.prenom);
  const totem = TOTEMS.find((item) => item.id === heros.totem);

  function enregistrer(suivant: Heros) {
    onChanger(suivant);
    const choisi = TOTEMS.find((item) => item.id === suivant.totem);
    const nom = suivant.prenom || "petit aventurier";
    speak(
      choisi
        ? `Bonjour ${nom}. Ton totem est ${choisi.nom}.`
        : `Bonjour ${nom}. Choisis un totem quand tu veux.`,
      0.86,
    );
  }

  return (
    <form
      className="totem-bande"
      onSubmit={(event) => {
        event.preventDefault();
        enregistrer({ prenom: prenom.trim(), totem: heros.totem });
      }}
    >
      <p className="kids-text">
        {totem ? `${totem.emoji} ${heros.prenom || totem.nom} voyage avec Noa.` : "Comment t'appelles-tu ? Choisis aussi un totem."}
      </p>
      <label className="kids-text">
        Ton prénom
        <input
          value={prenom}
          maxLength={24}
          autoComplete="given-name"
          onChange={(event) => setPrenom(event.target.value)}
        />
      </label>
      <div className="rang" style={{ marginTop: 10 }}>
        {TOTEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={heros.totem === item.id ? "gros" : "doux"}
            aria-pressed={heros.totem === item.id}
            onClick={() => enregistrer({ prenom: prenom.trim(), totem: item.id })}
          >
            {item.emoji} {item.nom}
          </button>
        ))}
        <button type="submit" className="ecouter-noa">
          C'est moi
        </button>
      </div>
    </form>
  );
}

function EcranAccueil({
  dys,
  heros,
  onHeros,
  ouvrirMonde,
}: {
  dys: boolean;
  heros: Heros;
  onHeros: (heros: Heros) => void;
  ouvrirMonde: (monde: Monde) => void;
}) {
  const { actif, ecouter, parle } = useLectureNoa(MOT_NOA);
  return (
    <div>
      <ChoixAventurier heros={heros} onChanger={onHeros} />
      <div className="accueil-noa">
        <button type="button" className="noa-avatar" onClick={ecouter} aria-label="Noa le petit hibou savant">
          <HibouNoa parle={parle} />
          <span className="nom-noa">Noa</span>
        </button>
        <button type="button" className="bulle-noa" onClick={ecouter}>
          <TexteIllumine text={MOT_NOA} dys={dys} actif={actif} />
        </button>
      </div>
      <button type="button" className="ecouter-noa grande" onClick={ecouter}>
        🔊 Écouter avec Noa
      </button>
      <div className="portes">
        {MONDES.map((monde) => (
          <PorteAventure key={monde.id} monde={monde} dys={dys} ouvrir={ouvrirMonde} />
        ))}
      </div>
    </div>
  );
}

function usePalier(longueur: number, donnerEtoile: () => void, direTemps: (suite?: string) => void) {
  const [index, setIndex] = useState(0);
  const bloque = useRef(false);
  const plusTard = usePlusTard();
  const repondre = useCallback(
    (ok: boolean, bravo: string, indice: string) => {
      if (bloque.current) return;
      if (!ok) {
        direTemps(indice);
        return;
      }
      bloque.current = true;
      donnerEtoile();
      speak(bravo, 0.86);
      plusTard(() => {
        bloque.current = false;
        setIndex((n) => n + 1);
      }, 900);
    },
    [direTemps, donnerEtoile, plusTard],
  );
  return { index, fini: index >= longueur, repondre };
}

function BoutonTemps({ direTemps, indice }: { direTemps: (suite?: string) => void; indice: string }) {
  return (
    <button type="button" className="hesite" onClick={() => direTemps(indice)}>
      💛 J'hésite
    </button>
  );
}

function SolideSvg({ id }: { id: "cube" | "sphere" | "pyramide" }) {
  return (
    <svg viewBox="0 0 100 100" width="72" height="72" aria-hidden="true">
      {id === "cube" && (
        <>
          <polygon points="18,38 50,22 82,38 50,54" fill="#f6e7c4" stroke="#c4924e" strokeWidth="3" />
          <polygon points="18,38 50,54 50,82 18,66" fill="#e2b56a" stroke="#c4924e" strokeWidth="3" />
          <polygon points="82,38 50,54 50,82 82,66" fill="#f0d48a" stroke="#c4924e" strokeWidth="3" />
        </>
      )}
      {id === "sphere" && <circle cx="50" cy="52" r="30" fill="#c5e6f6" stroke="#7eb6e0" strokeWidth="3" />}
      {id === "pyramide" && (
        <>
          <polygon points="50,16 86,78 14,78" fill="#e7d4f2" stroke="#8b6bb5" strokeWidth="3" />
          <polygon points="50,16 86,78 50,64" fill="#d7c4ec" stroke="#8b6bb5" strokeWidth="3" />
        </>
      )}
    </svg>
  );
}

function JeuSolides({ dys, donnerEtoile, direTemps }: JeuBase) {
  const questions = [
    { id: "sphere" as const, dit: "Touche la sphère. Elle est toute ronde, comme une bulle." },
    { id: "cube" as const, dit: "Touche le cube. Il a des faces plates, comme un dé." },
    { id: "pyramide" as const, dit: "Touche la pyramide. Elle monte en pointe." },
  ];
  const { index, fini, repondre } = usePalier(questions.length, donnerEtoile, direTemps);
  const question = questions[index];
  if (fini || !question) {
    return <BlocParlant dys={dys} text="Tu as reconnu le cube, la sphère et la pyramide. Bravo, explorateur des formes." />;
  }
  return (
    <div>
      <BlocParlant dys={dys} text={question.dit} />
      <div className="rang">
        {(["cube", "sphere", "pyramide"] as const).map((id) => (
          <button
            key={id}
            type="button"
            className="solide"
            onClick={() =>
              repondre(id === question.id, "Oui, c'est bien celle-là.", "Regarde encore la forme, tout doucement.")
            }
          >
            <SolideSvg id={id} />
            <span className="kids-text">{id === "sphere" ? "sphère" : id}</span>
          </button>
        ))}
      </div>
      <BoutonTemps direTemps={direTemps} indice={question.dit} />
    </div>
  );
}

function ScenePlace({ place }: { place: "devant" | "derriere" | "dessus" }) {
  return (
    <div className="panier" aria-hidden="true" style={{ minWidth: 220, position: "relative", minHeight: 150 }}>
      {place === "dessus" && <div style={{ fontSize: "2rem" }}>🟡</div>}
      <div style={{ fontSize: "3rem" }}>🏠</div>
      {place === "devant" && <div style={{ fontSize: "2rem" }}>🟡</div>}
      {place === "derriere" && <div style={{ position: "absolute", top: 8, right: 16, fontSize: "1.4rem" }}>🟡</div>}
    </div>
  );
}

function JeuPositions({ dys, donnerEtoile, direTemps }: JeuBase) {
  const questions = [
    { place: "dessus" as const, dit: "La balle dorée est posée sur la maison. Elle est dessus." },
    { place: "devant" as const, dit: "La balle dorée est tout près, devant la maison." },
    { place: "derriere" as const, dit: "La balle dorée se cache derrière la maison." },
  ];
  const { index, fini, repondre } = usePalier(questions.length, donnerEtoile, direTemps);
  const question = questions[index];
  if (fini || !question) {
    return <BlocParlant dys={dys} text="Devant, derrière, dessus : tu te repères dans l'espace avec douceur." />;
  }
  return (
    <div>
      <BlocParlant dys={dys} text={`${question.dit} Où est la balle ?`} />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ScenePlace place={question.place} />
      </div>
      <div className="rang">
        {(["devant", "derriere", "dessus"] as const).map((place) => (
          <button
            key={place}
            type="button"
            className="gros"
            onClick={() =>
              repondre(
                place === question.place,
                place === "dessus" ? "Oui, elle est dessus." : place === "devant" ? "Oui, elle est devant." : "Oui, elle est derrière.",
                "Regarde la maison, puis la balle. Prends ton temps.",
              )
            }
          >
            {place === "derriere" ? "derrière" : place}
          </button>
        ))}
      </div>
      <BoutonTemps direTemps={direTemps} indice="Regarde si la balle est devant la maison, derrière, ou dessus." />
    </div>
  );
}

function JeuEspace(props: JeuBase) {
  const [chapitre, setChapitre] = useState(0);
  return (
    <div>
      <div className="rang chapitres">
        <button type="button" className={chapitre === 0 ? "gros" : "doux"} onClick={() => setChapitre(0)}>Les solides</button>
        <button type="button" className={chapitre === 1 ? "gros" : "doux"} onClick={() => setChapitre(1)}>Devant, derrière, dessus</button>
        <button type="button" className={chapitre === 2 ? "gros" : "doux"} onClick={() => setChapitre(2)}>Les maisons des couleurs</button>
      </div>
      {chapitre === 0 && <JeuSolides {...props} />}
      {chapitre === 1 && <JeuPositions {...props} />}
      {chapitre === 2 && <JeuFormes {...props} />}
    </div>
  );
}

function JeuNombres({ dys, donnerEtoile, direTemps }: JeuBase) {
  const questions = [
    { dit: "Compte les pommes. Combien y en a-t-il ?", dessin: "🍎🍎🍎", choix: ["deux", "trois", "cinq"], bon: "trois" },
    { dit: "Compte les étoiles dorées.", dessin: "⭐⭐⭐⭐⭐", choix: ["quatre", "cinq", "dix"], bon: "cinq" },
    { dit: "Voici quatre fraises et quatre étoiles. C'est autant, ou plus ?", dessin: "🍓🍓🍓🍓   ⭐⭐⭐⭐", choix: ["autant", "plus de fraises", "plus d'étoiles"], bon: "autant" },
    { dit: "Deux pommes d'un côté, six étoiles de l'autre. Où y en a-t-il plus ?", dessin: "🍎🍎   ⭐⭐⭐⭐⭐⭐", choix: ["plus de pommes", "plus d'étoiles", "autant"], bon: "plus d'étoiles" },
  ];
  const { index, fini, repondre } = usePalier(questions.length, donnerEtoile, direTemps);
  const question = questions[index];
  if (fini || !question) {
    return <BlocParlant dys={dys} text="Tu as compté jusqu'aux étoiles, et tu sais dire plus que, et autant que." />;
  }
  return (
    <div>
      <BlocParlant dys={dys} text={question.dit} />
      <p className="panier" aria-hidden="true">{question.dessin}</p>
      <div className="rang">
        {question.choix.map((choix) => (
          <button key={choix} type="button" className="gros" onClick={() => repondre(choix === question.bon, "Oui, c'est bien ça.", question.dit)}>
            {choix}
          </button>
        ))}
      </div>
      <BoutonTemps direTemps={direTemps} indice="Compte avec ton doigt, un par un. Il n'y a pas de vitesse à tenir." />
    </div>
  );
}

function VisageDoux({ humeur }: { humeur: "joie" | "colere" | "tristesse" | "peur" }) {
  const fond = { joie: "#ffe08a", colere: "#f0c2a8", tristesse: "#c5dff5", peur: "#e4d4f2" }[humeur];
  const bouche = {
    joie: "M28 58 Q50 78 72 58",
    colere: "M30 70 Q50 58 70 70",
    tristesse: "M30 72 Q50 58 70 72",
    peur: "M40 64 h20",
  }[humeur];
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill={fond} />
      <circle cx="36" cy="44" r="4" fill="#3d4a38" />
      <circle cx="64" cy="44" r="4" fill="#3d4a38" />
      {humeur === "colere" && <path d="M28 34 L42 40 M72 34 L58 40" stroke="#3d4a38" strokeWidth="3" strokeLinecap="round" />}
      {humeur === "peur" && (
        <>
          <circle cx="36" cy="44" r="6" fill="#fff" />
          <circle cx="64" cy="44" r="6" fill="#fff" />
          <circle cx="36" cy="44" r="3" fill="#3d4a38" />
          <circle cx="64" cy="44" r="3" fill="#3d4a38" />
        </>
      )}
      <path d={bouche} fill="none" stroke="#5c4630" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function JeuEmotions({ dys, donnerEtoile, direTemps }: JeuBase) {
  const questions = [
    { dit: "Tu retrouves ton doudou sous le coussin. Qu'est-ce que tu peux ressentir ?", bon: "joie" as const },
    { dit: "Quelqu'un a pris ton jouet sans demander. La colère peut arriver, et elle a le droit d'exister.", bon: "colere" as const },
    { dit: "Un ami s'en va un peu plus tôt. Une petite tristesse peut venir. Elle aussi est bienvenue.", bon: "tristesse" as const },
    { dit: "Un bruit fort te surprend. La peur prévient le corps. Tu peux la nommer, puis souffler.", bon: "peur" as const },
  ];
  const noms = { joie: "la joie", colere: "la colère", tristesse: "la tristesse", peur: "la peur" };
  const { index, fini, repondre } = usePalier(questions.length, donnerEtoile, direTemps);
  const question = questions[index];
  if (fini || !question) {
    return <BlocParlant dys={dys} text="Tu sais nommer la joie, la colère, la tristesse et la peur. Aucune émotion n'est une faute." />;
  }
  return (
    <div>
      <BlocParlant dys={dys} text={question.dit} />
      <div className="rang">
        {(["joie", "colere", "tristesse", "peur"] as const).map((humeur) => (
          <button
            key={humeur}
            type="button"
            className="visage"
            onClick={() => repondre(humeur === question.bon, `Oui. C'est ${noms[humeur]}.`, "Tous les visages sont gentils. Écoute encore l'histoire.")}
          >
            <VisageDoux humeur={humeur} />
            <span className="kids-text">{noms[humeur]}</span>
          </button>
        ))}
      </div>
      <BoutonTemps direTemps={direTemps} indice="Ce n'est pas un piège. Choisis le visage qui ressemble à l'histoire." />
    </div>
  );
}

function LettreBd({ lettre }: { lettre: "b" | "d" }) {
  return (
    <span className={`glyphe glyphe-${lettre}`} aria-hidden="true">
      {lettre}
      <span className={lettre === "b" ? "ventre" : "dos"} />
    </span>
  );
}

const CARTES_BD = [
  { id: "bateau", mot: "Bateau", lettre: "b" as const, dessin: "⛵" },
  { id: "dauphin", mot: "Dauphin", lettre: "d" as const, dessin: "🐬" },
  { id: "banane", mot: "Banane", lettre: "b" as const, dessin: "🍌" },
  { id: "danse", mot: "Danse", lettre: "d" as const, dessin: "💃" },
];

function JeuMiroirs({ dys, donnerEtoile, direTemps }: JeuBase) {
  const plusTard = usePlusTard();
  const [pose, setPose] = useState<Record<string, "b" | "d">>({});
  const [choisie, setChoisie] = useState<string | null>(null);
  const [secoue, setSecoue] = useState<string | null>(null);
  const [pont, setPont] = useState(false);
  const placees = Object.keys(pose).length;

  function deposer(id: string, maison: "b" | "d") {
    const carte = CARTES_BD.find((item) => item.id === id);
    if (!carte || pose[id]) return;
    if (carte.lettre !== maison) {
      setSecoue(id);
      setChoisie(null);
      direTemps(
        carte.lettre === "b"
          ? `${carte.mot} commence comme le b au ventre bleu, devant.`
          : `${carte.mot} commence comme le d au dos orange, derrière.`,
      );
      plusTard(() => setSecoue(null), 700);
      return;
    }
    const suivantes = { ...pose, [id]: maison };
    setPose(suivantes);
    setChoisie(null);
    donnerEtoile();
    const complet = Object.keys(suivantes).length === CARTES_BD.length;
    if (complet) {
      setPont(true);
      speak("Le pont des syllabes s'illumine !", 0.86);
    } else {
      speak(`Oui, ${carte.mot} va avec la lettre ${carte.lettre}.`, 0.86);
    }
  }

  if (pont) {
    return (
      <div>
        <BlocParlant dys={dys} text="Le pont des syllabes s'illumine. Tu peux maintenant assembler les syllabes, tout doucement." />
        <div className="pont-lumiere" aria-hidden="true">
          {CARTES_BD.map((carte) => (
            <span key={carte.id} className="planche allumee" />
          ))}
        </div>
        <JeuSyllabes dys={dys} donnerEtoile={donnerEtoile} direCourage={direTemps} direTemps={direTemps} />
      </div>
    );
  }

  return (
    <div
      onDragOver={(event) => event.preventDefault()}
    >
      <BlocParlant
        dys={dys}
        text="Le b a un gros ventre bleu en avant. Le d a un grand dos orange en arrière. Pose chaque mot dans sa maison."
      />
      <div className="rang" style={{ justifyContent: "center", marginBottom: 8 }}>
        <LettreBd lettre="b" />
        <LettreBd lettre="d" />
      </div>
      <div className="pont-lumiere" aria-label="Pont des syllabes">
        {CARTES_BD.map((carte, i) => (
          <span key={carte.id} className={`planche${i < placees ? " allumee" : ""}`} />
        ))}
      </div>
      <div className="maisons-bd">
        {(["b", "d"] as const).map((maison) => (
          <div
            key={maison}
            className={`maison-lettre maison-${maison}`}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const id = event.dataTransfer.getData("text/plain") || choisie;
              if (id) deposer(id, maison);
            }}
          >
            <button type="button" className="doux" onClick={() => choisie && deposer(choisie, maison)}>
              {maison === "b" ? "Maison du b" : "Maison du d"}
            </button>
            <div className="rang">
              {CARTES_BD.filter((carte) => pose[carte.id] === maison).map((carte) => (
                <span key={carte.id} className="kids-text">
                  {carte.dessin} {carte.mot}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="rang" style={{ marginTop: 12 }}>
        {CARTES_BD.filter((carte) => !pose[carte.id]).map((carte) => (
          <button
            key={carte.id}
            type="button"
            draggable
            className={`carte-mot${choisie === carte.id ? " choisie" : ""}${secoue === carte.id ? " secoue" : ""}`}
            onDragStart={(event) => {
              event.dataTransfer.setData("text/plain", carte.id);
              setChoisie(carte.id);
            }}
            onClick={() => {
              setChoisie(carte.id);
              speak(carte.mot, 0.86);
            }}
          >
            <span aria-hidden="true">{carte.dessin}</span>
            <span className="kids-text">{carte.mot}</span>
          </button>
        ))}
      </div>
      <BoutonTemps
        direTemps={direTemps}
        indice="Touche un mot, puis touche la maison du b ou du d. Le ventre bleu est devant, le dos orange est derrière."
      />
    </div>
  );
}

function JeuLabo(props: JeuBase) {
  const [chapitre, setChapitre] = useState(0);
  return (
    <div>
      <div className="rang chapitres">
        <button type="button" className={chapitre === 0 ? "gros" : "doux"} onClick={() => setChapitre(0)}>Lettres miroirs</button>
        <button type="button" className={chapitre === 1 ? "gros" : "doux"} onClick={() => setChapitre(1)}>Syllabes magiques</button>
      </div>
      {chapitre === 0 ? <JeuMiroirs {...props} /> : <JeuSyllabes {...props} />}
    </div>
  );
}

function SymboleGram({ role }: { role: "verbe" | "nom" | "adjectif" }) {
  if (role === "verbe") return <span aria-hidden="true" style={{ display: "inline-block", width: 28, height: 28, borderRadius: "50%", background: "#e07a7a" }} />;
  if (role === "nom") return <SolideSvg id="pyramide" />;
  return (
    <svg viewBox="0 0 40 36" width="32" height="28" aria-hidden="true">
      <polygon points="20,2 38,34 2,34" fill="#7eb6e0" />
    </svg>
  );
}

function JeuGrammaire({ dys, donnerEtoile, direTemps }: JeuBase) {
  const questions = [
    { phrase: "Le chat dort", mots: ["chat", "dort"], bon: "dort", role: "verbe" as const, dit: "Touche le verbe. C'est la boule rouge, le mot de l'action. Ici, le chat dort." },
    { phrase: "Le chat dort", mots: ["chat", "dort"], bon: "chat", role: "nom" as const, dit: "Touche le nom. C'est la pyramide solide. On peut presque tenir un chat." },
    { phrase: "La petite fleur pousse", mots: ["petite", "fleur", "pousse"], bon: "petite", role: "adjectif" as const, dit: "Touche l'adjectif. C'est le triangle bleu. Il dit comment est la fleur : petite." },
    { phrase: "La petite fleur pousse", mots: ["petite", "fleur", "pousse"], bon: "pousse", role: "verbe" as const, dit: "Touche le verbe. Que fait la fleur ? Elle pousse." },
  ];
  const { index, fini, repondre } = usePalier(questions.length, donnerEtoile, direTemps);
  const question = questions[index];
  if (fini || !question) {
    return <BlocParlant dys={dys} text="Tu as touché la phrase : le verbe court, le nom tient debout, l'adjectif colore le monde." />;
  }
  return (
    <div>
      <BlocParlant dys={dys} text={question.dit} />
      <p className="panier kids-text" style={{ fontSize: "1.35rem" }}>{question.phrase}</p>
      <p className="kids-text" style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
        <SymboleGram role={question.role} />
        {question.role === "verbe" ? "boule rouge · verbe" : question.role === "nom" ? "pyramide · nom" : "triangle bleu · adjectif"}
      </p>
      <div className="rang">
        {question.mots.map((mot) => (
          <button key={mot} type="button" className="gros" onClick={() => repondre(mot === question.bon, `Oui, ${mot}.`, question.dit)}>
            <span className="kids-text">{mot}</span>
          </button>
        ))}
      </div>
      <BoutonTemps direTemps={direTemps} indice="Le verbe dit ce qu'on fait. Le nom dit de qui on parle. L'adjectif dit comment c'est." />
    </div>
  );
}

function JeuDizaines({ dys, donnerEtoile, direTemps }: JeuBase) {
  const questions = [
    { dit: "Voici une barre de dix perles, et encore trois étoiles. Combien en tout ?", extra: 3, bon: "treize", choix: ["dix", "treize", "trois"] },
    { dit: "Une barre de dix, toute seule. Combien de perles ?", extra: 0, bon: "dix", choix: ["dix", "onze", "neuf"] },
    { dit: "Une barre de dix, et encore six perles. Combien ?", extra: 6, bon: "seize", choix: ["seize", "six", "dix"] },
  ];
  const { index, fini, repondre } = usePalier(questions.length, donnerEtoile, direTemps);
  const question = questions[index];
  if (fini || !question) return <BlocParlant dys={dys} text="La barre de dix est devenue une amie. Tu peux compter plus loin sans te presser." />;
  return (
    <div>
      <BlocParlant dys={dys} text={question.dit} />
      <div className="barre-dix" aria-hidden="true">
        {Array.from({ length: 10 }, (_, i) => <span key={i} className="perle-compte" />)}
      </div>
      <p className="panier" aria-hidden="true">{"⭐".repeat(question.extra) || "·"}</p>
      <div className="rang">
        {question.choix.map((choix) => (
          <button key={choix} type="button" className="gros" onClick={() => repondre(choix === question.bon, `Oui, ${choix}.`, "Compte la barre comme dix, puis les étoiles une par une.")}>
            {choix}
          </button>
        ))}
      </div>
      <BoutonTemps direTemps={direTemps} indice="La barre vaut dix. Ajoute les étoiles avec le doigt." />
    </div>
  );
}

function JeuBonbons({ dys, donnerEtoile, direTemps }: JeuBase) {
  const questions = [
    { dit: "Deux paquets de quatre bonbons. Combien de bonbons en tout ?", paquets: [4, 4], bon: "huit", choix: ["six", "huit", "quatre"] },
    { dit: "Trois paquets de deux bonbons. Combien ?", paquets: [2, 2, 2], bon: "six", choix: ["cinq", "six", "deux"] },
  ];
  const { index, fini, repondre } = usePalier(questions.length, donnerEtoile, direTemps);
  const question = questions[index];
  if (fini || !question) return <BlocParlant dys={dys} text="La multiplication, ici, c'est juste des paquets. Tu les vois, tu les comptes." />;
  return (
    <div>
      <BlocParlant dys={dys} text={question.dit} />
      <div className="rang">
        {question.paquets.map((n, i) => (
          <p key={i} className="panier" aria-hidden="true">{"🍬".repeat(n)}</p>
        ))}
      </div>
      <div className="rang">
        {question.choix.map((choix) => (
          <button key={choix} type="button" className="gros" onClick={() => repondre(choix === question.bon, `Oui, ${choix} bonbons.`, "Compte les bonbons de chaque paquet, puis additionne.")}>
            {choix}
          </button>
        ))}
      </div>
      <BoutonTemps direTemps={direTemps} indice="Un paquet, puis l'autre. Compte tout haut si tu veux." />
    </div>
  );
}

function JeuMaths(props: JeuBase) {
  const [chapitre, setChapitre] = useState(0);
  return (
    <div>
      <div className="rang chapitres">
        <button type="button" className={chapitre === 0 ? "gros" : "doux"} onClick={() => setChapitre(0)}>La balance</button>
        <button type="button" className={chapitre === 1 ? "gros" : "doux"} onClick={() => setChapitre(1)}>Les barres de dix</button>
        <button type="button" className={chapitre === 2 ? "gros" : "doux"} onClick={() => setChapitre(2)}>Les paquets</button>
      </div>
      {chapitre === 0 && <JeuBalance {...props} />}
      {chapitre === 1 && <JeuDizaines {...props} />}
      {chapitre === 2 && <JeuBonbons {...props} />}
    </div>
  );
}

function Cadran({ heures, minutes }: { heures: number; minutes: number }) {
  const aiguilleHeure = (heures % 12) * 30 + minutes * 0.5;
  const aiguilleMinute = minutes * 6;
  return (
    <svg className="cadran" viewBox="0 0 200 200" aria-hidden="true">
      <circle cx="100" cy="100" r="90" fill="#fff8ee" stroke="#e2b657" strokeWidth="8" />
      {Array.from({ length: 12 }, (_, i) => {
        const angle = ((i + 1) * Math.PI) / 6;
        const x = 100 + Math.sin(angle) * 70;
        const y = 100 - Math.cos(angle) * 70;
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fontSize="16" fill="#5c4630">
            {i + 1}
          </text>
        );
      })}
      <line x1="100" y1="108" x2="100" y2="48" stroke="#3d4a38" strokeWidth="7" strokeLinecap="round" transform={`rotate(${aiguilleHeure} 100 100)`} />
      <line x1="100" y1="112" x2="100" y2="30" stroke="#c48a3a" strokeWidth="4" strokeLinecap="round" transform={`rotate(${aiguilleMinute} 100 100)`} />
      <circle cx="100" cy="100" r="6" fill="#e2b657" />
    </svg>
  );
}

function JeuHorloge({ dys, donnerEtoile, direTemps }: JeuBase) {
  const cibles = [
    { h: 3, m: 0, dit: "Montre trois heures. La grande aiguille sur le 12, la petite sur le 3." },
    { h: 7, m: 30, dit: "Montre sept heures et demie. La grande aiguille sur le 6." },
    { h: 10, m: 0, dit: "Montre dix heures. La petite aiguille sur le 10." },
  ];
  const [index, setIndex] = useState(0);
  const [heures, setHeures] = useState(12);
  const [minutes, setMinutes] = useState(0);
  const cible = cibles[index];
  if (!cible) return <BlocParlant dys={dys} text="L'horloge t'obéit. Tu sais montrer une heure, sans te presser." />;
  function verifier() {
    if (heures % 12 === cible.h % 12 && minutes === cible.m) {
      donnerEtoile();
      speak("Oui, c'est bien cette heure.", 0.86);
      setIndex((n) => n + 1);
      setHeures(12);
      setMinutes(0);
      return;
    }
    direTemps(cible.dit);
  }
  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 12 }}>
      <BlocParlant dys={dys} text={cible.dit} />
      <Cadran heures={heures} minutes={minutes} />
      <div className="rang">
        <button type="button" className="doux" onClick={() => setHeures((h) => (h % 12) + 1)}>Petite aiguille +</button>
        <button type="button" className="doux" onClick={() => setMinutes((m) => (m + 30) % 60)}>Grande aiguille +</button>
      </div>
      <button type="button" className="gros" onClick={verifier}>C'est cette heure</button>
      <BoutonTemps direTemps={direTemps} indice={cible.dit} />
    </div>
  );
}

function JeuEnquetes(props: JeuBase) {
  const [chapitre, setChapitre] = useState(0);
  return (
    <div>
      <div className="rang chapitres">
        <button type="button" className={chapitre === 0 ? "gros" : "doux"} onClick={() => setChapitre(0)}>L'énigme</button>
        <button type="button" className={chapitre === 1 ? "gros" : "doux"} onClick={() => setChapitre(1)}>Le secret de la pluie</button>
      </div>
      {chapitre === 0 ? <JeuDetective {...props} /> : <JeuGoutte {...props} />}
    </div>
  );
}

function JeuOrthographe({ dys, donnerEtoile, direTemps }: JeuBase) {
  const questions = [
    { dit: "Un seul chat. Quel aimant se colle au verbe ?", sujet: "Le chat", choix: ["mange", "mangent"], bon: "mange" },
    { dit: "Plusieurs chats. L'aimant du pluriel attire le verbe.", sujet: "Les chats", choix: ["mange", "mangent"], bon: "mangent" },
    { dit: "Deux chats. L'aimant du nombre attire la lettre s.", sujet: "deux", choix: ["chat", "chats"], bon: "chats" },
    { dit: "Une seule fleur. Pas de s cette fois.", sujet: "une", choix: ["fleur", "fleurs"], bon: "fleur" },
  ];
  const { index, fini, repondre } = usePalier(questions.length, donnerEtoile, direTemps);
  const [choixPose, setChoixPose] = useState<string | null>(null);
  useEffect(() => {
    setChoixPose(null);
  }, [index]);
  const question = questions[index];
  if (fini || !question) {
    return <BlocParlant dys={dys} text="Les aimants ont travaillé pour toi. L'orthographe peut être douce, jamais une punition." />;
  }
  return (
    <div>
      <BlocParlant dys={dys} text={question.dit} />
      <div className="rang" style={{ alignItems: "center" }}>
        <p className="magnet kids-text">{question.sujet}</p>
        <span aria-hidden="true">🧲</span>
        <p className={`magnet kids-text${choixPose === question.bon ? " attire" : ""}`}>{choixPose ?? "…"}</p>
      </div>
      <div className="rang">
        {question.choix.map((choix) => (
          <button
            key={choix}
            type="button"
            className="gros"
            onClick={() => {
              setChoixPose(choix);
              repondre(choix === question.bon, "Les aimants se sont trouvés.", "Écoute si on parle d'un seul, ou de plusieurs.");
            }}
          >
            <span className="kids-text">{choix}</span>
          </button>
        ))}
      </div>
      <BoutonTemps direTemps={direTemps} indice="Un seul : le verbe reste court. Plusieurs : ils s'attirent, et souvent un s ou -ent apparaît." />
    </div>
  );
}

function cheminPart(index: number) {
  const rayon = 78;
  const cx = 100;
  const cy = 100;
  const debut = index * 90 - 90;
  const fin = debut + 90;
  const rad = (deg: number) => (deg * Math.PI) / 180;
  const x0 = cx + rayon * Math.cos(rad(debut));
  const y0 = cy + rayon * Math.sin(rad(debut));
  const x1 = cx + rayon * Math.cos(rad(fin));
  const y1 = cy + rayon * Math.sin(rad(fin));
  return `M ${cx} ${cy} L ${x0} ${y0} A ${rayon} ${rayon} 0 0 1 ${x1} ${y1} Z`;
}

function JeuGateau({ dys, donnerEtoile, direTemps }: JeuBase) {
  const defis = [
    { cible: 2, dit: "Colorie deux parts en doré. Deux parts sur quatre, c'est la moitié du gâteau." },
    { cible: 1, dit: "Colorie une seule part. C'est un quart du gâteau." },
    { cible: 3, dit: "Colorie trois parts. C'est trois quarts du gâteau." },
  ];
  const [index, setIndex] = useState(0);
  const [prises, setPrises] = useState<boolean[]>([false, false, false, false]);
  const [fete, setFete] = useState(false);
  const feteRef = useRef(false);
  const etoileRef = useRef(donnerEtoile);
  etoileRef.current = donnerEtoile;
  const defi = defis[index];

  useEffect(() => {
    if (!defi || feteRef.current) return;
    if (prises.filter(Boolean).length !== defi.cible) return;
    feteRef.current = true;
    setFete(true);
    etoileRef.current();
    const phrase =
      defi.cible === 2
        ? "2 parts sur 4, c'est exactement la moitié (1/2) du gâteau !"
        : defi.cible === 1
          ? "1 part sur 4, c'est un quart du gâteau."
          : "3 parts sur 4, ce sont les trois quarts du gâteau.";
    speak(phrase, 0.86);
  }, [prises, defi]);

  if (!defi) {
    return <BlocParlant dys={dys} text="Tu as partagé le gâteau : la moitié, le quart, et les trois quarts." />;
  }

  function colorier(i: number) {
    if (feteRef.current) return;
    setPrises((prev) => {
      if (feteRef.current) return prev;
      return prev.map((prise, j) => (j === i ? !prise : prise));
    });
  }

  return (
    <div>
      <BlocParlant dys={dys} text={fete && defi.cible === 2 ? "2 parts sur 4, c'est exactement la moitié (1/2) du gâteau !" : defi.dit} />
      <svg className="gateau-rond" viewBox="0 0 200 200" role="img" aria-label="Gâteau rond en quatre parts">
        <circle cx="100" cy="100" r="86" fill="#f6e7c4" />
        {prises.map((dore, i) => (
          <path
            key={i}
            className="part-svg"
            d={cheminPart(i)}
            fill={dore ? "#f0c56e" : "#fff8ee"}
            stroke="#e2b657"
            strokeWidth="3"
            onClick={() => colorier(i)}
          />
        ))}
        <circle cx="100" cy="100" r="10" fill="#f6d7b4" />
      </svg>
      <div className="rang">
        {prises.map((dore, i) => (
          <button key={i} type="button" className={dore ? "gros" : "doux"} onClick={() => colorier(i)} aria-label={`Part ${i + 1}`}>
            {dore ? "Part dorée" : `Part ${i + 1}`}
          </button>
        ))}
      </div>
      {fete && (
        <button
          type="button"
          className="gros"
          onClick={() => {
            feteRef.current = false;
            setPrises([false, false, false, false]);
            setFete(false);
            setIndex((n) => n + 1);
          }}
        >
          Un autre partage
        </button>
      )}
      <BoutonTemps direTemps={direTemps} indice="Touche les parts une par une. Deux parts dorées racontent la moitié." />
    </div>
  );
}

function JeuEuros({ dys, donnerEtoile, direTemps }: JeuBase) {
  const pieces = [
    { label: "1 €", cents: 100 },
    { label: "50 c", cents: 50 },
    { label: "20 c", cents: 20 },
    { label: "10 c", cents: 10 },
  ];
  const [choix, setChoix] = useState<number[]>([]);
  const total = choix.reduce((s, n) => s + n, 0);
  const cible = 150;
  function verifier() {
    if (total === cible) {
      donnerEtoile();
      speak("Oui. Un euro et cinquante centimes.", 0.86);
      setChoix([]);
      return;
    }
    direTemps(total > cible ? "C'est un peu plus que un euro cinquante. Tu peux enlever une pièce." : "Il manque encore un peu pour faire un euro et cinquante centimes.");
  }
  return (
    <div>
      <BlocParlant dys={dys} text="Compose un euro et cinquante centimes. Tu peux poser plusieurs pièces, et en enlever." />
      <p className="panier kids-text">{choix.length ? choix.map((n) => (n === 100 ? "1 €" : `${n} c`)).join(" + ") : "Le comptoir est vide."}</p>
      <p className="kids-text">
        {total > 0 ? `${total} centimes pour l'instant.` : "Le comptoir attend les premières pièces."}
      </p>
      <div className="rang">
        {pieces.map((piece) => (
          <button key={piece.label} type="button" className="piece" onClick={() => setChoix((prev) => [...prev, piece.cents])}>
            {piece.label}
          </button>
        ))}
      </div>
      <div className="rang">
        <button type="button" className="doux" onClick={() => setChoix((prev) => prev.slice(0, -1))}>Enlever la dernière</button>
        <button type="button" className="gros" onClick={verifier}>C'est la somme</button>
      </div>
      <BoutonTemps direTemps={direTemps} indice="Un euro, c'est cent centimes. Ajoute cinquante centimes." />
    </div>
  );
}

function JeuFractions(props: JeuBase) {
  const [chapitre, setChapitre] = useState(0);
  return (
    <div>
      <div className="rang chapitres">
        <button type="button" className={chapitre === 0 ? "gros" : "doux"} onClick={() => setChapitre(0)}>Le gâteau</button>
        <button type="button" className={chapitre === 1 ? "gros" : "doux"} onClick={() => setChapitre(1)}>Les euros</button>
      </div>
      {chapitre === 0 ? <JeuGateau {...props} /> : <JeuEuros {...props} />}
    </div>
  );
}

function JeuCartable({ dys, donnerEtoile, direTemps }: JeuBase) {
  const objets = [
    { id: "trousse", label: "Trousse", emoji: "✏️", ok: true },
    { id: "cahier", label: "Cahier", emoji: "📒", ok: true },
    { id: "regle", label: "Règle", emoji: "📏", ok: true },
    { id: "doudou", label: "Doudou de la maison", emoji: "🧸", ok: false },
  ];
  const [sac, setSac] = useState<string[]>([]);
  const [fete, setFete] = useState(false);
  const feteRef = useRef(false);
  const etoileRef = useRef(donnerEtoile);
  etoileRef.current = donnerEtoile;
  const utiles = objets.filter((objet) => objet.ok).map((objet) => objet.id);

  useEffect(() => {
    if (feteRef.current) return;
    if (!utiles.every((utile) => sac.includes(utile))) return;
    feteRef.current = true;
    setFete(true);
    etoileRef.current();
    speak("Le cartable est prêt. Trousse, cahier et règle sont bien rangés.", 0.86);
  }, [sac, utiles]);

  function poser(id: string, ok: boolean) {
    if (!ok) {
      direTemps("Le doudou reste à la maison. Il t'attendra ce soir.");
      return;
    }
    setSac((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }

  return (
    <div>
      <BlocParlant
        dys={dys}
        text={
          fete
            ? "Trousse, cahier et règle sont dans le sac. La bulle de respiration étoile t'attend."
            : "Range dans le cartable la trousse, le cahier et la règle."
        }
      />
      <p className="panier" aria-label="Cartable">
        🎒{" "}
        {sac.length
          ? objets
              .filter((objet) => sac.includes(objet.id))
              .map((objet) => objet.emoji)
              .join(" ")
          : "Le sac est ouvert."}
      </p>
      <div className="rang">
        {objets.map((objet) => (
          <motion.button
            key={objet.id}
            type="button"
            className={sac.includes(objet.id) ? "gros" : "doux"}
            animate={sac.includes(objet.id) ? { y: 6, scale: 0.96 } : { y: [0, -6, 0] }}
            transition={sac.includes(objet.id) ? { duration: 0.35 } : { duration: 2.2, repeat: Infinity }}
            onClick={() => poser(objet.id, objet.ok)}
          >
            {objet.emoji} {objet.label}
          </motion.button>
        ))}
      </div>
      {fete && <JeuSouffle dys={dys} donnerEtoile={donnerEtoile} direCourage={direTemps} direTemps={direTemps} auto />}
      {!fete && <BoutonTemps direTemps={direTemps} indice="La trousse, le cahier et la règle entrent dans le sac. Le doudou peut rester à la maison." />}
    </div>
  );
}

function JeuAgenda({ dys, donnerEtoile, direTemps }: JeuBase) {
  const { index, fini, repondre } = usePalier(1, donnerEtoile, direTemps);
  if (fini || index > 0) return <BlocParlant dys={dys} text="Mardi est noté. L'agenda te sert de mémoire douce." />;
  return (
    <div>
      <BlocParlant dys={dys} text="La piscine est mardi. Touche le bon jour dans l'agenda." />
      <div className="rang">
        {["lundi", "mardi", "jeudi", "vendredi"].map((jour) => (
          <button key={jour} type="button" className="gros" onClick={() => repondre(jour === "mardi", "Oui, mardi. Tu peux l'écrire dans l'agenda.", "La piscine est mardi. Cherche ce jour.")}>
            {jour}
          </button>
        ))}
      </div>
      <BoutonTemps direTemps={direTemps} indice="Lundi, mardi, jeudi, vendredi. La piscine est le deuxième jour." />
    </div>
  );
}

function JeuSouffle({ dys, donnerEtoile, direTemps, auto = false }: JeuBase & { auto?: boolean }) {
  const etapes = [
    { phase: "inspire" as const, texte: "Inspire doucement…", compte: "" },
    { phase: "inspire" as const, texte: "Inspire doucement…", compte: "1" },
    { phase: "inspire" as const, texte: "Inspire doucement…", compte: "2" },
    { phase: "inspire" as const, texte: "Inspire doucement…", compte: "3" },
    { phase: "souffle" as const, texte: "et souffle…", compte: "1" },
    { phase: "souffle" as const, texte: "et souffle…", compte: "2" },
    { phase: "souffle" as const, texte: "et souffle…", compte: "3" },
  ];
  const cycles = 3;
  const total = etapes.length * cycles;
  const [pas, setPas] = useState(-1);
  const [fini, setFini] = useState(false);
  const offert = useRef(false);
  const etoileRef = useRef(donnerEtoile);
  etoileRef.current = donnerEtoile;
  const etape = pas >= 0 ? etapes[pas % etapes.length] : null;

  useEffect(() => {
    if (!auto || pas >= 0 || fini) return;
    const id = window.setTimeout(() => setPas(0), 1500);
    return () => window.clearTimeout(id);
  }, [auto, pas, fini]);

  useEffect(() => {
    if (pas < 0 || fini) return;
    const id = window.setTimeout(() => {
      if (pas + 1 >= total) {
        setFini(true);
        if (!offert.current) {
          offert.current = true;
          etoileRef.current();
          speak("Trois souffles avec l'étoile. Ton corps est plus léger.", 0.86);
        }
        return;
      }
      setPas(pas + 1);
    }, 1100);
    return () => window.clearTimeout(id);
  }, [pas, fini, total]);

  useEffect(() => {
    if (pas < 0 || fini) return;
    const index = pas % etapes.length;
    if (index === 0) speak("Inspire doucement.", 0.8);
    if (index === 4) speak("et souffle.", 0.8);
  }, [pas, fini, etapes.length]);

  if (fini) {
    return <BlocParlant dys={dys} text="L'étoile a respiré avec toi. Inspire, un, deux, trois. Souffle, un, deux, trois." />;
  }

  return (
    <div>
      <BlocParlant dys={dys} text="La bulle de respiration étoile gonfle quand tu inspires, et se repose quand tu souffles." />
      <div className={`bulle-etoile${etape ? ` ${etape.phase}` : ""}`} aria-hidden="true">
        <div>
          <div>⭐</div>
          {etape?.compte ? <div className="compte-souffle">{etape.compte}</div> : null}
        </div>
      </div>
      <p className="kids-text" style={{ textAlign: "center" }}>
        {etape ? etape.texte : "L'étoile t'attend."}
      </p>
      {pas < 0 && (
        <button type="button" className="gros" onClick={() => setPas(0)}>
          Respirer avec l'étoile
        </button>
      )}
      <BoutonTemps direTemps={direTemps} indice="Inspire doucement, un, deux, trois. Puis souffle, un, deux, trois. L'étoile suit ton rythme." />
    </div>
  );
}

function JeuPasseport(props: JeuBase) {
  const [chapitre, setChapitre] = useState(0);
  return (
    <div>
      <div className="rang chapitres">
        <button type="button" className={chapitre === 0 ? "gros" : "doux"} onClick={() => setChapitre(0)}>Le cartable</button>
        <button type="button" className={chapitre === 1 ? "gros" : "doux"} onClick={() => setChapitre(1)}>L'agenda</button>
        <button type="button" className={chapitre === 2 ? "gros" : "doux"} onClick={() => setChapitre(2)}>Le souffle</button>
      </div>
      {chapitre === 0 && <JeuCartable {...props} />}
      {chapitre === 1 && <JeuAgenda {...props} />}
      {chapitre === 2 && <JeuSouffle {...props} />}
    </div>
  );
}

function MissionActive({ id, base }: { id: JeuId; base: JeuBase }) {
  if (id === "sons") return <JeuAnimaux {...base} />;
  if (id === "espace") return <JeuEspace {...base} />;
  if (id === "nombres") return <JeuNombres {...base} />;
  if (id === "emotions") return <JeuEmotions {...base} />;
  if (id === "labo") return <JeuLabo {...base} />;
  if (id === "grammaire") return <JeuGrammaire {...base} />;
  if (id === "maths") return <JeuMaths {...base} />;
  if (id === "horloge") return <JeuHorloge {...base} />;
  if (id === "enquetes") return <JeuEnquetes {...base} />;
  if (id === "orthographe") return <JeuOrthographe {...base} />;
  if (id === "fractions") return <JeuFractions {...base} />;
  return <JeuPasseport {...base} />;
}

function EcranMonde({
  monde,
  dys,
  ouvrirJeu,
}: {
  monde: Monde;
  dys: boolean;
  ouvrirJeu: (jeuId: JeuId, consigne: string) => void;
}) {
  const { actif, ecouter, parle } = useLectureNoa(monde.accueil);
  return (
    <div>
      <div className="accueil-noa compact">
        <button type="button" className="noa-avatar" onClick={ecouter} aria-label="Écouter l'accueil de Noa">
          <HibouNoa parle={parle} />
          <span className="nom-noa">Noa</span>
        </button>
        <button type="button" className="bulle-noa" onClick={ecouter}>
          <TexteIllumine text={monde.accueil} dys={dys} actif={actif} />
        </button>
      </div>
      <button type="button" className="ecouter-noa grande" onClick={ecouter}>
        🔊 Écouter avec Noa
      </button>
      <div className="missions">
        {monde.jeux.map((jeu) => (
          <article key={jeu.id} className="mission">
            <p className="emoji-xl" aria-hidden="true">{jeu.emoji}</p>
            <h3 className="kids-text">{jeu.titre}</h3>
            <p className="kids-text">{jeu.consigne}</p>
            <button type="button" className="ecouter-noa" onClick={() => speak(`${jeu.titre}. ${jeu.consigne}`, 0.84)}>
              🔊 Écouter avec Noa
            </button>
            <button type="button" className="partir" onClick={() => ouvrirJeu(jeu.id, jeu.consigne)}>
              {jeu.bouton}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

const PHRASE_NUIT =
  "Ferme doucement les yeux, petit champion. Tu as été formidable aujourd'hui... fais de doux rêves.";
const ACTIVITES: { id: Activite; emoji: string; label: string }[] = [
  { id: "iles", emoji: "🏝️", label: "Les 3 Îles" },
  { id: "histoire", emoji: "🌙", label: "L'Histoire du Soir" },
  { id: "trace", emoji: "✏️", label: "Tracé Magique" },
  { id: "bd", emoji: "🎨", label: "Maths en BD" },
  { id: "gardiens", emoji: "☀️", label: "Petits Gardiens" },
  { id: "duo", emoji: "🤝", label: "Mode Duo" },
];

function texteHistoire(prenom: string, compagnon: string, lieu: string) {
  return `Ce soir, ${prenom} avance à tout petits pas avec ${compagnon}. Ils entrent dans ${lieu}. Tout est calme. ${compagnon} chuchote que la nuit est une couverture douce. ${prenom} n'a plus rien à faire, juste à respirer. Les étoiles clignent lentement. Le souffle devient tout petit, comme une vague. ${compagnon} reste près de ${prenom}, sans se presser.`;
}

function ModuleHistoire({
  dys,
  prenomInitial,
  onPrenom,
  onNuit,
}: {
  dys: boolean;
  prenomInitial: string;
  onPrenom: (prenom: string) => void;
  onNuit: (nuit: boolean) => void;
}) {
  const compagnons = [
    { id: "noa", label: "Noa le hibou", dit: "Noa le hibou" },
    { id: "barnabe", label: "Barnabé le renardeau", dit: "Barnabé le renardeau" },
    { id: "plume", label: "Plume le chaton", dit: "Plume le chaton" },
  ] as const;
  const lieux = [
    { id: "lucioles", label: "La Forêt des Lucioles", dit: "la Forêt des Lucioles" },
    { id: "nuage", label: "Le Nuage de Coton", dit: "le Nuage de Coton" },
    { id: "cabane", label: "La Cabane Étoilée", dit: "la Cabane Étoilée" },
  ] as const;
  const [prenom, setPrenom] = useState(prenomInitial);
  const [compagnon, setCompagnon] = useState<(typeof compagnons)[number]["id"]>("noa");
  const [lieu, setLieu] = useState<(typeof lieux)[number]["id"]>("lucioles");
  const [conte, setConte] = useState("");
  const [actif, setActif] = useState<number | null>(null);
  const [murmure, setMurmure] = useState(false);
  const jeton = useRef(0);

  useEffect(() => {
    return () => {
      jeton.current += 1;
    };
  }, []);

  useEffect(() => {
    const el = document.querySelector(".conte-nuit .mot-livre.allume");
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [actif]);

  function ecouter() {
    const nom = prenom.trim() || "le petit aventurier";
    if (prenom.trim()) onPrenom(prenom.trim());
    const ami = compagnons.find((item) => item.id === compagnon)?.dit ?? "Noa le hibou";
    const place = lieux.find((item) => item.id === lieu)?.dit ?? "la Forêt des Lucioles";
    const recit = texteHistoire(nom, ami, place);
    const moi = ++jeton.current;
    setConte(recit);
    setMurmure(false);
    setActif(0);
    onNuit(true);
    const mots = recit.split(/\s+/).filter(Boolean).length;
    speak(
      recit,
      0.68,
      () => {
        if (jeton.current !== moi) return;
        setMurmure(true);
        speak(
          PHRASE_NUIT,
          0.6,
          () => {
            if (jeton.current === moi) setActif(null);
          },
          (index) => {
            if (jeton.current !== moi) return;
            setActif(index < 0 ? null : mots + index);
          },
          0.82,
        );
      },
      (index) => {
        if (jeton.current !== moi) return;
        setActif(index < 0 ? null : index);
      },
      0.92,
    );
  }

  const texteAffiche = murmure ? `${conte} ${PHRASE_NUIT}` : conte;

  return (
    <div>
      <h2 className="kids-text">L'histoire du soir dont tu es le héros</h2>
      <p className="kids-text">Choisis trois ingrédients. Noa racontera très doucement.</p>
      <label className="totem-bande kids-text">
        Ton prénom, ou ton nom de héros
        <input
          value={prenom}
          maxLength={24}
          onChange={(event) => setPrenom(event.target.value)}
          placeholder="Ton prénom"
        />
      </label>
      <p className="kids-text">Ton petit compagnon</p>
      <div className="choix-doux">
        {compagnons.map((item) => (
          <button key={item.id} type="button" className={compagnon === item.id ? "choisi" : ""} onClick={() => setCompagnon(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <p className="kids-text">Le lieu magique</p>
      <div className="choix-doux">
        {lieux.map((item) => (
          <button key={item.id} type="button" className={lieu === item.id ? "choisi" : ""} onClick={() => setLieu(item.id)}>
            {item.label}
          </button>
        ))}
      </div>
      <button type="button" className="gros" onClick={ecouter}>
        🌙 Écouter l'histoire apaisante
      </button>
      {conte && (
        <div className="conte-nuit">
          <TexteIllumine text={texteAffiche} dys={dys} actif={actif} />
        </div>
      )}
    </div>
  );
}

function ModuleBd({ dys, donnerEtoile, direTemps }: JeuBase) {
  const [choix, setChoix] = useState<number | null>(null);
  const offert = useRef(false);

  function repondre(n: number) {
    setChoix(n);
    if (n === 7) {
      if (!offert.current) {
        offert.current = true;
        donnerEtoile();
      }
      speak("Oui ! Quatre fraises, puis trois fraises. Sept fraises pour le festin.", 0.86);
      return;
    }
    direTemps("Regarde les cases. Quatre fraises dans le panier, et trois qui arrivent.");
  }

  return (
    <div>
      <h2 className="kids-text">Le traducteur de maths en bande dessinée</h2>
      <BlocParlant dys={dys} text="Trois images racontent le goûter. Touche la bulle qui dit le total." />
      <div className="bd-cases">
        <article className="case-bd">
          <h3 className="kids-text">La cueillette</h3>
          <div className="panier-bd" aria-hidden="true">🧺</div>
          <div className="fraises" aria-label="Quatre fraises dans le panier">
            {Array.from({ length: 4 }, (_, i) => (
              <span key={i}>🍓</span>
            ))}
          </div>
        </article>
        <article className="case-bd">
          <h3 className="kids-text">Le partage du goûter</h3>
          <div className="fraises" aria-label="Trois fraises tombent dans le panier">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} className="fraise-tombe" style={{ animationDelay: `${i * 0.2}s` }}>
                🍓
              </span>
            ))}
          </div>
        </article>
        <article className="case-bd">
          <h3 className="kids-text">Le banquet</h3>
          <div className="fraises" aria-hidden="true">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i}>🍓</span>
            ))}
          </div>
          <p className="kids-text">Combien de fraises au total pour le festin ?</p>
        </article>
      </div>
      <div className="rang">
        {[5, 7, 9].map((n) => (
          <button
            key={n}
            type="button"
            className={`bulle-reponse${choix === n && n === 7 ? " juste" : ""}${choix === n && n !== 7 ? " berce" : ""}`}
            onClick={() => repondre(n)}
            aria-label={`${n} fraises`}
          >
            {n}
          </button>
        ))}
      </div>
      <BoutonTemps direTemps={direTemps} indice="Compte les fraises de la cueillette, puis celles qui tombent." />
    </div>
  );
}

function ModuleTrace({ dys, donnerEtoile, direTemps }: JeuBase) {
  const lettres = ["b", "d", "s", "m"] as const;
  const [lettre, setLettre] = useState<(typeof lettres)[number]>("b");
  const [traits, setTraits] = useState<{ x: number; y: number }[][]>([]);
  const [taille, setTaille] = useState({ w: 640, h: 300 });
  const [bravo, setBravo] = useState(false);
  const zone = useRef<HTMLDivElement>(null);
  const dessin = useRef<{ x: number; y: number }[]>([]);
  const actif = useRef(false);
  const offert = useRef<Record<string, boolean>>({});

  useLayoutEffect(() => {
    const el = zone.current;
    if (!el) return;
    const lire = () => setTaille({ w: el.clientWidth, h: el.clientHeight });
    lire();
    const obs = new ResizeObserver(lire);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  function pointDe(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function choisir(suivante: (typeof lettres)[number]) {
    setLettre(suivante);
    setTraits([]);
    setBravo(false);
    dessin.current = [];
  }

  return (
    <div>
      <h2 className="kids-text">L'arène du tracé magique</h2>
      <BlocParlant dys={dys} text="Choisis une lettre. Trace-la du doigt ou avec la souris. Le trait devient une poussière d'or." />
      <div className="choix-doux">
        {lettres.map((item) => (
          <button key={item} type="button" className={lettre === item ? "choisi" : ""} onClick={() => choisir(item)} aria-label={`Lettre ${item}`}>
            {item}
          </button>
        ))}
      </div>
      <div
        className="ardoise"
        ref={zone}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          actif.current = true;
          const point = pointDe(event);
          dessin.current = [point];
          setTraits((prev) => [...prev, [point]]);
          setBravo(false);
        }}
        onPointerMove={(event) => {
          if (!actif.current) return;
          const point = pointDe(event);
          dessin.current = [...dessin.current, point];
          setTraits((prev) => {
            const copie = prev.slice();
            copie[copie.length - 1] = dessin.current;
            return copie;
          });
        }}
        onPointerUp={() => {
          if (!actif.current) return;
          actif.current = false;
          if (dessin.current.length < 10) {
            direTemps("Continue encore un peu. Les étincelles suivent ton doigt, sans se presser.");
            return;
          }
          setBravo(true);
          jouerCarillon();
          speak("Oui ! Noa applaudit. Ton trait est tout en lumière.", 0.86);
          if (!offert.current[lettre]) {
            offert.current[lettre] = true;
            donnerEtoile();
          }
        }}
      >
        <div className="repere ciel">Ciel</div>
        <div className="repere herbe">Herbe</div>
        <div className="repere terre">Terre</div>
        <span className="modele-lettre" aria-hidden="true">{lettre}</span>
        <svg className="encre" viewBox={`0 0 ${taille.w} ${taille.h}`} aria-hidden="true">
          {traits.map((trait, index) => (
            <g key={index}>
              <polyline
                points={trait.map((point) => `${point.x},${point.y}`).join(" ")}
                fill="none"
                stroke="#e2b657"
                strokeWidth="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {trait.filter((_, i) => i % 3 === 0).map((point, i) => (
                <circle key={i} cx={point.x} cy={point.y} r="3.5" fill="#fff4c8" />
              ))}
            </g>
          ))}
        </svg>
      </div>
      {bravo && <p className="kids-text">Noa applaudit. Le trait reste en or.</p>}
      <BoutonTemps direTemps={direTemps} indice="Le ciel est en haut, l'herbe au milieu, la terre en bas. Suis la lettre fantôme." />
    </div>
  );
}

function ModuleGardiens({ dys, donnerEtoile }: JeuBase) {
  const [soleil, setSoleil] = useState(0);
  const [vent, setVent] = useState(0);
  const offert = useRef(false);
  const etoileRef = useRef(donnerEtoile);
  etoileRef.current = donnerEtoile;
  const plein = soleil >= 3 && vent >= 3;
  const energie = Math.min(100, soleil * 17 + vent * 17);

  useEffect(() => {
    if (!plein || offert.current) return;
    offert.current = true;
    etoileRef.current();
    speak("Bravo, tu es un vrai Gardien de la Terre !", 0.86);
  }, [plein]);

  return (
    <div>
      <h2 className="kids-text">Les petits gardiens de l'énergie</h2>
      <BlocParlant dys={dys} text="Allume le Phare de l'Île avec le Soleil et le Vent !" />
      <div className="scene-energie">
        <button type="button" className="socle-panneau" onClick={() => setSoleil((n) => Math.min(3, n + 1))} aria-label="Orienter le panneau solaire vers le soleil">
          <span className="panneau-3d" style={{ transform: `rotateY(${-58 + soleil * 24}deg) rotateX(14deg)` }}>
            {Array.from({ length: 6 }, (_, i) => (
              <i key={i} />
            ))}
          </span>
          <span className="kids-text">☀️ Le soleil</span>
        </button>
        <button type="button" className="moulin" onClick={() => setVent((n) => Math.min(3, n + 1))} aria-label="Faire tourner les pales de l'éolienne">
          <span className={`rotor${vent > 0 ? " tourne" : ""}`} style={vent > 0 ? { animationDuration: `${1.8 - vent * 0.3}s` } : undefined}>
            <i /><i /><i />
          </span>
          <span className="mat" />
          <span className="kids-text">Le vent</span>
        </button>
      </div>
      <div className={`phare${plein ? " allume" : ""}`} aria-hidden="true">
        <span className="faisceau" />
        <span className="tour" />
      </div>
      <div className="jauge-verte" role="meter" aria-label="Énergie verte du phare" aria-valuemin={0} aria-valuemax={100} aria-valuenow={energie}>
        <span style={{ width: `${energie}%` }} />
      </div>
      <div className={`guirlande${plein ? " allume" : ""}`} aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      {plein && <p className="kids-text">Bravo, tu es un vrai Gardien de la Terre !</p>}
    </div>
  );
}

function ModuleDuo({ dys, direTemps, offrirCinq }: JeuBase & { offrirCinq: () => void }) {
  const indices = [
    { id: "renard", emoji: "🦊", label: "Le renardeau" },
    { id: "hibou", emoji: "🦉", label: "Le hibou" },
    { id: "grenouille", emoji: "🐸", label: "La grenouille" },
  ];
  const syllabes = ["BOU", "HI", "GRE", "NOU"];
  const [indice, setIndice] = useState<string | null>(null);
  const [suite, setSuite] = useState<string[]>([]);
  const [victoire, setVictoire] = useState(false);
  const offert = useRef(false);

  function poserSyl(syl: string) {
    setSuite((prev) => (prev.length >= 2 ? [syl] : [...prev, syl]));
  }

  function valider() {
    const enfantOk = indice === "hibou";
    const parentOk = suite[0] === "HI" && suite[1] === "BOU";
    if (enfantOk && parentOk) {
      setVictoire(true);
      if (!offert.current) {
        offert.current = true;
        offrirCinq();
      }
      speak("Victoire en équipe ! Vous faites une équipe formidable !", 0.86);
      return;
    }
    direTemps(
      enfantOk
        ? "Le détective a trouvé le hibou. Le grimoire attend HI, puis BOU."
        : "Regardez ensemble. L'animal qui vole la nuit est le hibou. Ses syllabes sont HI, puis BOU.",
    );
    setSuite([]);
  }

  return (
    <div>
      <h2 className="kids-text">Mode duo complice, avec papa ou maman</h2>
      <BlocParlant dys={dys} text="L'enfant est le détective des mots. Le parent est le gardien du grimoire. Vous gagnez ensemble." />
      <div className="duo-grille">
        <section className="role-duo">
          <h3 className="kids-text">Détective des mots</h3>
          <p className="kids-text">Touche l'animal qui vole la nuit.</p>
          <div className="choix-doux">
            {indices.map((item) => (
              <button key={item.id} type="button" className={indice === item.id ? "choisi" : ""} onClick={() => setIndice(item.id)}>
                {item.emoji} {item.label}
              </button>
            ))}
          </div>
        </section>
        <section className="role-duo">
          <h3 className="kids-text">Gardien du grimoire</h3>
          <p className="kids-text">Pose les deux syllabes dans l'ordre.</p>
          <div className="slots-syl" aria-label="Combinaison du grimoire">
            <span className="slot-syl">{suite[0] ?? ""}</span>
            <span className="slot-syl">{suite[1] ?? ""}</span>
          </div>
          <div className="choix-doux">
            {syllabes.map((syl) => (
              <button key={syl} type="button" onClick={() => poserSyl(syl)}>
                {syl}
              </button>
            ))}
          </div>
        </section>
      </div>
      <button type="button" className="gros" onClick={valider}>
        Valider ensemble
      </button>
      {victoire && <p className="victoire-duo">Victoire en équipe ! Vous faites une équipe formidable !</p>}
      <BoutonTemps direTemps={direTemps} indice="Le hibou vole la nuit. On l'écrit HI, puis BOU." />
    </div>
  );
}

function CielNuit() {
  const etoiles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        top: `${(i * 53) % 100}%`,
        delay: `${(i % 7) * 0.35}s`,
      })),
    [],
  );
  return (
    <div className="ciel-nuit" aria-hidden="true">
      {etoiles.map((etoile, i) => (
        <i key={i} style={{ left: etoile.left, top: etoile.top, animationDelay: etoile.delay }} />
      ))}
    </div>
  );
}

export default function KidsApp() {
  const [dys, setDys] = useState(() => lireLocal(CLE_DYS, "0") === "1");
  const [etoiles, setEtoiles] = useState(() => lireEtoilesDuJour());
  const [heros, setHeros] = useState<Heros>(() => lireHeros());
  const [ecran, setEcran] = useState<Ecran>({ vue: "accueil" });
  const [activite, setActivite] = useState<Activite>("iles");
  const [nuit, setNuit] = useState(false);
  const [bandeau, setBandeau] = useState<Bandeau>(null);
  const [pluie, setPluie] = useState(0);

  useLayoutEffect(() => {
    assurerStyle();
    const id = "kids-app-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Lexend:wght@500;700&family=Nunito:wght@600;800&display=swap";
      document.head.appendChild(link);
    }
    const precedent = document.title;
    const fond = document.body.style.background;
    document.title = "Îles d'aventure — enfants";
    document.body.style.background = "#c5e0f2";
    rafraichirVoix();
    window.speechSynthesis?.addEventListener("voiceschanged", rafraichirVoix);
    return () => {
      document.title = precedent;
      document.body.style.background = fond;
      window.speechSynthesis?.removeEventListener("voiceschanged", rafraichirVoix);
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!bandeau) return;
    const timer = window.setTimeout(() => setBandeau(null), 7000);
    return () => window.clearTimeout(timer);
  }, [bandeau]);

  useEffect(() => {
    document.body.style.background = nuit ? "#15284a" : "#c5e0f2";
  }, [nuit]);

  const donnerEtoile = useCallback(() => {
    setEtoiles((n) => {
      const next = n + 1;
      ecrireEtoilesDuJour(next);
      return next;
    });
    setPluie((n) => n + 1);
    jouerBravo();
  }, []);

  const direCourage = useCallback((suite?: string) => {
    setBandeau({ type: "courage", texte: PHRASE_COURAGE, id: Date.now() });
    speak(suite ? `${PHRASE_COURAGE} ${suite}` : PHRASE_COURAGE, 0.86);
  }, []);

  const direTemps = useCallback((suite?: string) => {
    setBandeau({ type: "courage", texte: PHRASE_TEMPS, id: Date.now() });
    speak(suite ? `${PHRASE_TEMPS} ${suite}` : PHRASE_TEMPS, 0.86);
  }, []);

  const celebrer = useCallback((texte: string) => {
    setBandeau({ type: "joie", texte, id: Date.now() });
  }, []);

  const offrirEtoiles = useCallback((nombre: number) => {
    setEtoiles((n) => {
      const next = n + nombre;
      ecrireEtoilesDuJour(next);
      return next;
    });
    setPluie((n) => n + 1);
    jouerBravo();
    setBandeau({ type: "joie", texte: "Victoire en équipe ! Vous faites une équipe formidable !", id: Date.now() });
  }, []);

  function basculerDys() {
    setDys((actif) => {
      const next = !actif;
      ecrireLocal(CLE_DYS, next ? "1" : "0");
      speak(
        next
          ? "La baguette magique est allumée. Les lettres respirent, et les syllabes prennent des couleurs douces."
          : "La baguette magique se repose. Les lettres redeviennent toutes simples.",
        0.86,
      );
      return next;
    });
  }

  function ouvrirActivite(id: Activite) {
    window.speechSynthesis?.cancel();
    setNuit(false);
    setActivite(id);
  }

  function retour() {
    window.speechSynthesis?.cancel();
    if (activite !== "iles") {
      setNuit(false);
      setActivite("iles");
      return;
    }
    if (ecran.vue === "jeu") setEcran({ vue: "monde", monde: ecran.monde });
    else setEcran({ vue: "accueil" });
  }

  const mondeActif = ecran.vue === "accueil" ? null : MONDES.find((m) => m.id === ecran.monde) ?? null;
  const jeuActif =
    ecran.vue === "jeu" ? mondeActif?.jeux.find((j) => j.id === ecran.jeu) ?? null : null;
  const cle =
    activite !== "iles"
      ? activite
      : ecran.vue === "accueil"
        ? "accueil"
        : ecran.vue === "monde"
          ? ecran.monde
          : `${ecran.monde}-${ecran.jeu}`;
  const base = {
    dys,
    direCourage,
    direTemps,
    donnerEtoile: () => {
      donnerEtoile();
      celebrer("Une étoile rejoint ton coffre.");
    },
  };

  return (
    <div className={`kids-app${dys ? " dys" : ""}${nuit ? " nuit" : ""}`} lang="fr">
      <div className="kids-nuages" aria-hidden="true">
        <span style={{ width: 180, height: 54, top: "12%", left: "8%" }} />
        <span style={{ width: 140, height: 42, top: "22%", left: "60%", animationDelay: "-8s" }} />
        <span style={{ width: 100, height: 34, top: "70%", left: "30%", animationDelay: "-16s" }} />
      </div>
      {nuit && <CielNuit />}
      <header className="kids-header">
        <nav className="barre-magique" aria-label="Activités magiques">
          {ACTIVITES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`pilule pilule-${item.id}`}
              aria-pressed={activite === item.id}
              onClick={() => ouvrirActivite(item.id)}
            >
              {item.emoji} {item.label}
            </button>
          ))}
        </nav>
        <div className="coffre-bloc">
          <div className="coffre" aria-live="polite">
            <CoffreBois />
            <span>
              <span className="heros-nom">
                {heros.totem ? `${TOTEMS.find((item) => item.id === heros.totem)?.emoji ?? ""} ` : ""}
                {heros.prenom || "Petit aventurier"}
              </span>
              {libelleCoffre(etoiles)}
            </span>
          </div>
        </div>
        <button type="button" className={`kids-dys${dys ? " actif" : ""}`} aria-pressed={dys} onClick={basculerDys}>
          <span className="interrupteur" aria-hidden="true">
            <span className="boule" />
          </span>
          🪄 Baguette Magique (Confort de lecture DYS)
        </button>
        <p className="rappel kids-text">{PHRASE_COFFRE}</p>
        {(activite !== "iles" || ecran.vue !== "accueil") && (
          <div className="kids-header-ligne">
            <button type="button" className="retour-jeu" onClick={retour}>
              {activite === "iles" && ecran.vue === "jeu" ? "← Retour aux missions" : "← Retour aux îles"}
            </button>
          </div>
        )}
      </header>
      {bandeau && (
        <div className={`bandeau ${bandeau.type}`} role="status">
          <span aria-hidden="true">{bandeau.type === "joie" ? "🌟 " : "💛 "}</span>
          <span className="kids-text">{bandeau.texte}</span>
        </div>
      )}
      {pluie > 0 && <Confettis key={pluie} />}
      <AnimatePresence mode="wait">
        <motion.main
          key={cle}
          className="kids-main"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
        >
          {activite === "iles" && ecran.vue === "accueil" && (
            <EcranAccueil
              dys={dys}
              heros={heros}
              onHeros={(suivant) => {
                setHeros(suivant);
                ecrireHeros(suivant);
              }}
              ouvrirMonde={(monde) => {
                speak(monde.accueil, 0.84);
                setEcran({ vue: "monde", monde: monde.id });
              }}
            />
          )}
          {activite === "iles" && ecran.vue === "monde" && mondeActif && (
            <EcranMonde
              monde={mondeActif}
              dys={dys}
              ouvrirJeu={(jeu, consigne) => {
                speak(consigne);
                setEcran({ vue: "jeu", monde: mondeActif.id, jeu });
              }}
            />
          )}
          {activite === "iles" && ecran.vue === "jeu" && jeuActif && (
            <div>
              <div className="jeu-titre">
                <span className="emoji-xl" aria-hidden="true">{jeuActif.emoji}</span>
                <h2 className="kids-text">{jeuActif.titre}</h2>
              </div>
              <MissionActive id={ecran.jeu} base={base} />
            </div>
          )}
          {activite === "histoire" && (
            <ModuleHistoire
              dys={dys}
              prenomInitial={heros.prenom}
              onPrenom={(prenom) => {
                const suivant = { ...heros, prenom };
                setHeros(suivant);
                ecrireHeros(suivant);
              }}
              onNuit={setNuit}
            />
          )}
          {activite === "trace" && <ModuleTrace {...base} />}
          {activite === "bd" && <ModuleBd {...base} />}
          {activite === "gardiens" && <ModuleGardiens {...base} />}
          {activite === "duo" && <ModuleDuo {...base} offrirCinq={() => offrirEtoiles(5)} />}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}
