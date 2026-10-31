import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type FactionId = "lumiere" | "tenebres";
type AttaqueDominante = "Physique" | "Magique";

type Heros = {
  id: string;
  faction: FactionId;
  nom: string;
  titre: string;
  classe: string;
  iconeClasse: string;
  element: string;
  iconeElement: string;
  couleur: number;
  bonus: string;
  malus: string;
  attaqueDominante: AttaqueDominante;
  reliques: { nom: string; detail: string }[];
  stats: {
    attaque: number;
    defense: number;
    agilite: number;
    elementaire: number;
  };
  quete: string;
};

type DegatFlottant = { id: number; cible: "joueur" | "ennemi"; montant: number; critique: boolean };
type EtatCombat = {
  ennemiId: string;
  pvJoueur: number;
  pvMaxJoueur: number;
  pvEnnemi: number;
  pvMaxEnnemi: number;
  ressource: number;
  cooldowns: [number, number, number];
  journal: string[];
  degats: DegatFlottant[];
  secousse: number;
  victoire: boolean;
  defaite: boolean;
  xp: number;
  benedictions: number;
  victoires: number;
};

type ActionCombat = { nom: string; cout: number; cooldown: number; puissance: number; icone: string };

const ADVERSAIRES_PAR_HEROS: Record<string, string> = {
  moise: "pharaon",
  adam: "goliath",
  david: "goliath",
  samson: "cain",
  marie: "lilith",
  esther: "dalila",
  debora: "athalie",
  eve: "jezabel",
};

const FAIBLESSES_ELEMENTAIRES: Record<string, string> = {
  Eau: "Feu", "Eau sanglante": "Feu", Terre: "Vent", "Terre maudite": "Vent",
  Vent: "Foudre", Tempête: "Foudre", Feu: "Glace", Magma: "Glace", Glace: "Eau", "Glace noire": "Feu",
  Lumière: "Ténèbres", Ténèbres: "Lumière", Éther: "Miasmes", Miasmes: "Foudre", "Pierre d'airain": "Eau",
};

function avantageElementaire(attaque: string, defense: string): boolean {
  return FAIBLESSES_ELEMENTAIRES[attaque] === defense;
}

function actionsDuHeros(heros: Heros): ActionCombat[] {
  return [
    { nom: "Attaque signature", cout: 0, cooldown: 0, puissance: 0.72, icone: heros.iconeClasse },
    { nom: heros.reliques[0]?.nom ?? "Technique de combat", cout: 12, cooldown: 4, puissance: 1.05, icone: "✦" },
    { nom: heros.reliques[1]?.nom ?? "Pouvoir élémentaire", cout: 24, cooldown: 8, puissance: 1.45, icone: heros.iconeElement },
    { nom: "Ultime · " + heros.element, cout: 40, cooldown: 15, puissance: 2.15, icone: "✹" },
  ];
}

const HEROS: Heros[] = [
  {
    id: "moise",
    faction: "lumiere",
    nom: "Moïse",
    titre: "Le Fendeur de la Mer Rouge",
    classe: "Prophète des Marées",
    iconeClasse: "📜",
    element: "Eau",
    iconeElement: "🌊",
    couleur: 0x3ec6e0,
    bonus: "+50 % puissance des flots et soins de marée",
    malus: "−30 % résistance aux brasiers",
    attaqueDominante: "Magique",
    reliques: [
      { nom: "Bâton du Nil", detail: "Fend les eaux et commande la marée du champ de bataille." },
      { nom: "Tables de Saphir", detail: "Gravent un bouclier de loi sur les alliés proches." },
    ],
    stats: { attaque: 74, defense: 71, agilite: 52, elementaire: 97 },
    quete:
      "Au niveau 100, Moïse doit fendre la Dernière Mer — celle qui noie le pont entre Éden-Sion et Babel-Shéol — et conduire la Légion à pied sec avant que les flots ne se referment.",
  },
  {
    id: "adam",
    faction: "lumiere",
    nom: "Adam",
    titre: "Le Premier Gardien du Jardin",
    classe: "Sentinelle",
    iconeClasse: "🛡️",
    element: "Terre",
    iconeElement: "🌍",
    couleur: 0xa3b565,
    bonus: "+50 % armure minérale et ancrage",
    malus: "−30 % agilité dans les bourrasques",
    attaqueDominante: "Physique",
    reliques: [
      { nom: "Côte d'Argile Sacrée", detail: "Relève un gardien de pierre une fois par siège." },
      { nom: "Sceau du Jardin", detail: "Rend le sol allié infranchissable aux pas maudits." },
    ],
    stats: { attaque: 68, defense: 94, agilite: 44, elementaire: 72 },
    quete:
      "Au niveau 100, Adam doit replanter l'Arbre de Vie dans le sol maudit de la Nécropole et tenir le jardin jusqu'à ce que la première aube repousse les ronces.",
  },
  {
    id: "david",
    faction: "lumiere",
    nom: "David",
    titre: "Le Pâtre des Vents",
    classe: "Frondeur",
    iconeClasse: "🏹",
    element: "Vent",
    iconeElement: "🌪️",
    couleur: 0xd5e4f2,
    bonus: "+50 % critiques de bourrasque",
    malus: "−30 % défense face aux masses",
    attaqueDominante: "Physique",
    reliques: [
      { nom: "Fronde des Cinq Pierres", detail: "La cinquième pierre ignore l'armure des colosses." },
      { nom: "Harpe de Cèdre", detail: "Accorde le vent : les alliés gagnent en vitesse." },
    ],
    stats: { attaque: 86, defense: 58, agilite: 96, elementaire: 81 },
    quete:
      "Au niveau 100, David doit choisir la pierre juste parmi les vents contraires et abattre le colosse qui scelle la porte du centième ciel.",
  },
  {
    id: "samson",
    faction: "lumiere",
    nom: "Samson",
    titre: "Le Brasier Solaire Invincible",
    classe: "Berserker",
    iconeClasse: "⚔️",
    element: "Feu",
    iconeElement: "🔥",
    couleur: 0xff6a2a,
    bonus: "+50 % dégâts de mêlée solaire",
    malus: "−30 % résistance au gel noir",
    attaqueDominante: "Physique",
    reliques: [
      { nom: "Mâchoire de Lion Astral", detail: "Chaque coup embrase la cible et les voisins." },
      { nom: "Colonnes d'Hélios", detail: "Ultime : fait choir un temple sur l'armée ennemie." },
    ],
    stats: { attaque: 99, defense: 78, agilite: 61, elementaire: 90 },
    quete:
      "Au niveau 100, Samson doit embraser les colonnes du temple d'obsidienne et les faire choir sans ensevelir l'Alliance de la Lumière.",
  },
  {
    id: "marie",
    faction: "lumiere",
    nom: "Marie",
    titre: "L'Aube Immaculée",
    classe: "Oracle",
    iconeClasse: "🕊️",
    element: "Lumière",
    iconeElement: "☀️",
    couleur: 0xffe08a,
    bonus: "+50 % boucliers de lumière",
    malus: "−30 % dégâts dans les miasmes",
    attaqueDominante: "Magique",
    reliques: [
      { nom: "Manteau d'Étoiles", detail: "Absorbe la première frappe mortelle de chaque combat." },
      { nom: "Lis de l'Aube", detail: "Purifie malédictions et poisons dans un rayon d'or." },
    ],
    stats: { attaque: 64, defense: 88, agilite: 63, elementaire: 100 },
    quete:
      "Au niveau 100, Marie doit allumer le Phare d'Éden-Sion : une aube assez pure pour dissiper la nuit permanente du dernier palier.",
  },
  {
    id: "esther",
    faction: "lumiere",
    nom: "Esther",
    titre: "La Couronne de Givre Royal",
    classe: "Stratège",
    iconeClasse: "👑",
    element: "Glace",
    iconeElement: "❄️",
    couleur: 0x9fd6ff,
    bonus: "+50 % contrôle de givre",
    malus: "−30 % puissance sous le magma",
    attaqueDominante: "Magique",
    reliques: [
      { nom: "Diadème de Pourpre Gelée", detail: "Gèle les décrets ennemis : les sorts adverses se figent." },
      { nom: "Sceptre du Banquet", detail: "Inverse une sentence et la renvoie à son auteur." },
    ],
    stats: { attaque: 80, defense: 77, agilite: 79, elementaire: 91 },
    quete:
      "Au niveau 100, Esther doit retourner le décret de Babel, geler l'armée des ombres pendant une nuit, et faire reconnaître la Légion avant l'aube.",
  },
  {
    id: "debora",
    faction: "lumiere",
    nom: "Débora",
    titre: "La Juge des Éclairs",
    classe: "Invocatrice",
    iconeClasse: "⚖️",
    element: "Foudre",
    iconeElement: "⚡",
    couleur: 0xd6b4ff,
    bonus: "+50 % chaîne d'éclairs",
    malus: "−30 % stabilité sur terre mouvante",
    attaqueDominante: "Magique",
    reliques: [
      { nom: "Palme de Victoire", detail: "Chaque jugement réussi renforce l'éclair suivant." },
      { nom: "Javelot de Kédesh", detail: "Frappe le ciel et appelle l'orage sur une porte." },
    ],
    stats: { attaque: 91, defense: 66, agilite: 87, elementaire: 95 },
    quete:
      "Au niveau 100, Débora doit convoquer l'orage du centième ciel et juger, éclair après éclair, les sept portes de Shéol.",
  },
  {
    id: "eve",
    faction: "lumiere",
    nom: "Ève",
    titre: "La Mère des Souffles",
    classe: "Mystique",
    iconeClasse: "🌿",
    element: "Éther",
    iconeElement: "🌬️",
    couleur: 0xe7d5ff,
    bonus: "+50 % souffle vital et régénération",
    malus: "−30 % armure contre la pierre d'airain",
    attaqueDominante: "Magique",
    reliques: [
      { nom: "Fruit de Connaissance", detail: "Révèle la faiblesse élémentaire de la cible." },
      { nom: "Voile d'Éther", detail: "Rend le souffle aux alliés tombés une fois par siège." },
    ],
    stats: { attaque: 73, defense: 70, agilite: 89, elementaire: 93 },
    quete:
      "Au niveau 100, Ève doit rendre le souffle aux légions pétrifiées et refermer le voile d'éther avant que l'Abîme n'avale le jardin.",
  },
  {
    id: "pharaon",
    faction: "tenebres",
    nom: "Pharaon",
    titre: "Le Fleuve de Sang",
    classe: "Tyran",
    iconeClasse: "👑",
    element: "Eau sanglante",
    iconeElement: "🌊🩸",
    couleur: 0x8b1e3f,
    bonus: "+50 % malédiction des eaux",
    malus: "−30 % puissance face à la lumière pure",
    attaqueDominante: "Magique",
    reliques: [
      { nom: "Couronne d'Uraeus", detail: "Les eaux touchées saignent et ralentissent les armées." },
      { nom: "Char du Nil Noir", detail: "Charge qui écrase la première ligne ennemie." },
    ],
    stats: { attaque: 84, defense: 80, agilite: 48, elementaire: 92 },
    quete:
      "Au niveau 100, Pharaon doit renverser le fleuve de sang sur le sanctuaire et noyer le pont d'Éden avant que la mer ne s'ouvre.",
  },
  {
    id: "cain",
    faction: "tenebres",
    nom: "Caïn",
    titre: "Le Sillon Maudit",
    classe: "Assassin",
    iconeClasse: "🗡️",
    element: "Terre maudite",
    iconeElement: "🌍⛓️",
    couleur: 0x6b4a32,
    bonus: "+50 % frappes dans le dos",
    malus: "−30 % soins reçus",
    attaqueDominante: "Physique",
    reliques: [
      { nom: "Pierre du Front", detail: "Marque une cible : la prochaine attaque est une exécution." },
      { nom: "Faux des Sillons", detail: "Ouvre le sol sous les gardiens isolés." },
    ],
    stats: { attaque: 90, defense: 62, agilite: 88, elementaire: 74 },
    quete:
      "Au niveau 100, Caïn doit tracer le sillon maudit jusqu'au cœur du jardin et marquer le dernier gardien du sceau.",
  },
  {
    id: "goliath",
    faction: "tenebres",
    nom: "Goliath",
    titre: "Le Colosse d'Airain",
    classe: "Titan",
    iconeClasse: "🗿",
    element: "Pierre d'airain",
    iconeElement: "🗿",
    couleur: 0xb08d57,
    bonus: "+50 % défense massive",
    malus: "−30 % agilité",
    attaqueDominante: "Physique",
    reliques: [
      { nom: "Armure de Gat", detail: "Ignore les projectiles tant que le front n'est pas touché." },
      { nom: "Lance de Six Coudées", detail: "Balaye une ligne entière à chaque estoc." },
    ],
    stats: { attaque: 96, defense: 99, agilite: 28, elementaire: 70 },
    quete:
      "Au niveau 100, Goliath doit barrer la porte d'airain de son corps et tenir cent vagues de la Légion sans qu'une pierre ne l'atteigne au front.",
  },
  {
    id: "nimrod",
    faction: "tenebres",
    nom: "Nimrod",
    titre: "Le Chasseur de Magma",
    classe: "Chasseur",
    iconeClasse: "🏹",
    element: "Magma",
    iconeElement: "🔥",
    couleur: 0xff3b1f,
    bonus: "+50 % tirs embrasés",
    malus: "−30 % résistance au givre royal",
    attaqueDominante: "Physique",
    reliques: [
      { nom: "Arc de Babel", detail: "Les flèches montent jusqu'au ciel puis retombent en pluie de lave." },
      { nom: "Couronne de Chasseur", detail: "Révèle les proies cachées dans la brume." },
    ],
    stats: { attaque: 88, defense: 64, agilite: 85, elementaire: 94 },
    quete:
      "Au niveau 100, Nimrod doit chasser le phare d'Éden à travers les plaines de magma et l'éteindre d'une flèche de braise.",
  },
  {
    id: "lilith",
    faction: "tenebres",
    nom: "Lilith",
    titre: "La Nuit Première",
    classe: "Sorcière",
    iconeClasse: "🌑",
    element: "Ténèbres",
    iconeElement: "🌑",
    couleur: 0x7c3aed,
    bonus: "+50 % drains d'ombre",
    malus: "−30 % puissance à l'aube",
    attaqueDominante: "Magique",
    reliques: [
      { nom: "Aile de Nuit", detail: "Téléporte dans l'ombre d'un ennemi." },
      { nom: "Sceau de l'Abîme", detail: "Vole un sort de lumière et le corrompt." },
    ],
    stats: { attaque: 82, defense: 60, agilite: 91, elementaire: 98 },
    quete:
      "Au niveau 100, Lilith doit étendre la nuit première sur le centième ciel et voler l'aube avant qu'elle ne soit nommée.",
  },
  {
    id: "dalila",
    faction: "tenebres",
    nom: "Dalila",
    titre: "Le Baiser de Glace Noire",
    classe: "Lame voilée",
    iconeClasse: "🕸️",
    element: "Glace noire",
    iconeElement: "❄️",
    couleur: 0x164e63,
    bonus: "+50 % entraves de givre noir",
    malus: "−30 % dégâts face au brasier solaire",
    attaqueDominante: "Physique",
    reliques: [
      { nom: "Ciseaux d'Argent Noir", detail: "Tranchent la force d'un berserker et la lient." },
      { nom: "Voile de Soie", detail: "Endort la vigilance : la cible ne pare plus." },
    ],
    stats: { attaque: 79, defense: 68, agilite: 93, elementaire: 86 },
    quete:
      "Au niveau 100, Dalila doit lier le brasier solaire dans des chaînes de glace noire et dérober la force qui tient les colonnes.",
  },
  {
    id: "athalie",
    faction: "tenebres",
    nom: "Athalie",
    titre: "La Tempête Usurpatrice",
    classe: "Reine de guerre",
    iconeClasse: "🌪️",
    element: "Tempête",
    iconeElement: "🌪️",
    couleur: 0x94a3b8,
    bonus: "+50 % rafales perçantes",
    malus: "−30 % stabilité des soins",
    attaqueDominante: "Physique",
    reliques: [
      { nom: "Épée du Temple Volé", detail: "Chaque rafale vole un bouclier ennemi." },
      { nom: "Diadème d'Orage", detail: "Couronne la tempête : les alliés frappent deux fois." },
    ],
    stats: { attaque: 87, defense: 72, agilite: 84, elementaire: 89 },
    quete:
      "Au niveau 100, Athalie doit usurper le trône du temple dans la tempête et faire taire les juges avant le septième éclair.",
  },
  {
    id: "jezabel",
    faction: "tenebres",
    nom: "Jézabel",
    titre: "La Reine des Miasmes",
    classe: "Nécromancienne",
    iconeClasse: "☠️",
    element: "Miasmes",
    iconeElement: "🌫️",
    couleur: 0x84cc16,
    bonus: "+50 % poisons et brumes",
    malus: "−30 % résistance à la foudre",
    attaqueDominante: "Magique",
    reliques: [
      { nom: "Fiole de Sidon", detail: "Répand une brume que la lumière traverse mal." },
      { nom: "Palette de Pourpre", detail: "Peint un spectre qui combat à sa place." },
    ],
    stats: { attaque: 76, defense: 65, agilite: 77, elementaire: 97 },
    quete:
      "Au niveau 100, Jézabel doit répandre les miasmes de Sidon sur le jardin retrouvé et couronner l'Abîme d'une brume que la lumière ne traverse plus.",
  },
];

function adversairePour(heros: Heros, victoires = 0): Heros {
  const forceId = ADVERSAIRES_PAR_HEROS[heros.id];
  const adversaires = HEROS.filter((candidat) => candidat.faction !== heros.faction);
  const cible = forceId ? HEROS.find((candidat) => candidat.id === forceId) : undefined;
  if (victoires === 0 && cible) return cible;
  const indexDepart = cible ? adversaires.findIndex((candidat) => candidat.id === cible.id) : 0;
  return adversaires[(Math.max(indexDepart, 0) + victoires) % adversaires.length];
}

function creerCombat(heros: Heros, precedent?: EtatCombat): EtatCombat {
  const ennemi = adversairePour(heros, precedent?.victoires ?? 0);
  const pvMaxJoueur = 1000 + heros.stats.defense * 14;
  const pvMaxEnnemi = 950 + ennemi.stats.defense * 14;
  return {
    ennemiId: ennemi.id,
    pvJoueur: pvMaxJoueur,
    pvMaxJoueur,
    pvEnnemi: pvMaxEnnemi,
    pvMaxEnnemi,
    ressource: 100,
    cooldowns: [0, 0, 0],
    journal: [`${heros.nom} entre dans la Plaine de Proelium. ${ennemi.nom} relève le défi.`],
    degats: [],
    secousse: 0,
    victoire: false,
    defaite: false,
    xp: precedent?.xp ?? 0,
    benedictions: precedent?.benedictions ?? 0,
    victoires: precedent?.victoires ?? 0,
  };
}

const PORTRAITS_HEROS: Partial<Record<string, string>> = {
  moise: "/Moise.png",
  jezabel: "/j%C3%A9zabel.jpg",
};

const REPLIQUES_HEROS: Record<string, string> = {
  moise: "Que les flots s'écartent devant la Légion ! Le décret du Sinaï est scellé.",
  adam: "La terre primordiale se dresse. Nul ne franchira le seuil d'Éden.",
  david: "Au nom de l'Alliance, le vent guide mon trait droit au cœur du colosse !",
  samson: "Les piliers de Gaza vont s'effondrer sous la fureur du feu divin !",
  marie: "Sous le manteau de grâce, les ténèbres s'évanouissent.",
  esther: "Par le sceptre et le givre royal, le silence s'abat sur l'arène.",
  debora: "L'orage du Thabor gronde ! Foudroyez les chars impies !",
  eve: "Le souffle premier renaît. L'arbre de vie ne périra jamais.",
  pharaon: "Le sang du Nil écarlate engloutira vos prophètes et vos idoles !",
  cain: "Le cri du sol réclame vengeance. Ma marque est éternelle.",
  goliath: "Tremblez devant l'airain des Rephaïm ! Je briserai vos os !",
  nimrod: "Babel s'élèvera jusqu'aux cieux, dussent les étoiles brûler !",
  lilith: "L'obscurité originelle vous réclame. Sombrez dans mon éclipse.",
  dalila: "Un doux murmure glacé... et votre force s'éteint pour toujours.",
  athalie: "Le trône appartient au plus féroce ! Périssez sous mon glaive !",
  jezabel: "Que les miasmes de Baal vous consument et nourrissent la nuit !",
};

const JAUGES = [
  { cle: "attaque" as const, label: "Attaque Physique / Magique" },
  { cle: "defense" as const, label: "Défense & Résistance" },
  { cle: "agilite" as const, label: "Agilité & Vitesse" },
  { cle: "elementaire" as const, label: "Puissance Élémentaire" },
];

function hexCss(couleur: number) {
  return `#${couleur.toString(16).padStart(6, "0")}`;
}

function jouerGong(contexte: AudioContext) {
  const maintenant = contexte.currentTime;
  const master = contexte.createGain();
  master.gain.setValueAtTime(0.9, maintenant);
  master.connect(contexte.destination);

  const partiels = [
    { freq: 92, gain: 0.55, duree: 3.8 },
    { freq: 138, gain: 0.32, duree: 3.1 },
    { freq: 207, gain: 0.18, duree: 2.4 },
    { freq: 311, gain: 0.1, duree: 1.7 },
    { freq: 466, gain: 0.05, duree: 1.15 },
  ];

  for (const partiel of partiels) {
    const osc = contexte.createOscillator();
    const gain = contexte.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(partiel.freq * 1.55, maintenant);
    osc.frequency.exponentialRampToValueAtTime(partiel.freq, maintenant + 0.22);
    gain.gain.setValueAtTime(0.0001, maintenant);
    gain.gain.exponentialRampToValueAtTime(partiel.gain, maintenant + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, maintenant + partiel.duree);
    osc.connect(gain);
    gain.connect(master);
    osc.start(maintenant);
    osc.stop(maintenant + partiel.duree + 0.05);
  }

  const taille = Math.floor(contexte.sampleRate * 0.22);
  const buffer = contexte.createBuffer(1, taille, contexte.sampleRate);
  const donnees = buffer.getChannelData(0);
  for (let i = 0; i < taille; i += 1) {
    donnees[i] = (Math.random() * 2 - 1) * Math.exp(-i / (contexte.sampleRate * 0.028));
  }
  const bruit = contexte.createBufferSource();
  bruit.buffer = buffer;
  const filtre = contexte.createBiquadFilter();
  filtre.type = "bandpass";
  filtre.frequency.value = 740;
  filtre.Q.value = 0.7;
  const gainBruit = contexte.createGain();
  gainBruit.gain.setValueAtTime(0.42, maintenant);
  gainBruit.gain.exponentialRampToValueAtTime(0.0001, maintenant + 0.2);
  bruit.connect(filtre);
  filtre.connect(gainBruit);
  gainBruit.connect(master);
  bruit.start(maintenant);
}

function SceneCeleste({ faction, accent }: { faction: FactionId; accent: number }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const factionRef = useRef(faction);
  const accentRef = useRef(accent);
  factionRef.current = faction;
  accentRef.current = accent;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07010f, 0.055);
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 80);
    camera.position.set(0, 0.35, 8.2);

    const etoiles = 1600;
    const positionsEtoiles = new Float32Array(etoiles * 3);
    const couleursEtoiles = new Float32Array(etoiles * 3);
    for (let i = 0; i < etoiles; i += 1) {
      positionsEtoiles[i * 3] = (Math.random() - 0.5) * 46;
      positionsEtoiles[i * 3 + 1] = (Math.random() - 0.5) * 26;
      positionsEtoiles[i * 3 + 2] = -4 - Math.random() * 28;
      const dore = i % 3 !== 0;
      const couleur = new THREE.Color(dore ? 0xf6d98a : 0xc084fc);
      couleursEtoiles[i * 3] = couleur.r;
      couleursEtoiles[i * 3 + 1] = couleur.g;
      couleursEtoiles[i * 3 + 2] = couleur.b;
    }
    const geoEtoiles = new THREE.BufferGeometry();
    geoEtoiles.setAttribute("position", new THREE.BufferAttribute(positionsEtoiles, 3));
    geoEtoiles.setAttribute("color", new THREE.BufferAttribute(couleursEtoiles, 3));
    const pointsEtoiles = new THREE.Points(
      geoEtoiles,
      new THREE.PointsMaterial({
        size: 0.045,
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      }),
    );
    scene.add(pointsEtoiles);

    const motes = 240;
    const positionsMotes = new Float32Array(motes * 3);
    const vitesses = new Float32Array(motes);
    for (let i = 0; i < motes; i += 1) {
      positionsMotes[i * 3] = (Math.random() - 0.5) * 18;
      positionsMotes[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positionsMotes[i * 3 + 2] = (Math.random() - 0.5) * 4;
      vitesses[i] = 0.25 + Math.random() * 0.7;
    }
    const geoMotes = new THREE.BufferGeometry();
    geoMotes.setAttribute("position", new THREE.BufferAttribute(positionsMotes, 3));
    const matMotes = new THREE.PointsMaterial({
      color: 0xf6d98a,
      size: 0.07,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(geoMotes, matMotes));

    const matNebuleuseA = new THREE.MeshBasicMaterial({
      color: 0x4c1d95,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const nebuleuseA = new THREE.Mesh(new THREE.SphereGeometry(6.4, 28, 28), matNebuleuseA);
    nebuleuseA.position.set(-4.2, 1.2, -7.5);
    scene.add(nebuleuseA);

    const matNebuleuseB = new THREE.MeshBasicMaterial({
      color: 0x7c4a12,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const nebuleuseB = new THREE.Mesh(new THREE.SphereGeometry(5.2, 28, 28), matNebuleuseB);
    nebuleuseB.position.set(4.4, -0.8, -6.5);
    scene.add(nebuleuseB);

    const anneau = new THREE.Mesh(
      new THREE.TorusGeometry(2.35, 0.028, 16, 140),
      new THREE.MeshBasicMaterial({ color: 0xf6d98a, transparent: true, opacity: 0.85 }),
    );
    anneau.rotation.x = Math.PI / 2.35;
    scene.add(anneau);

    const anneauInterne = new THREE.Mesh(
      new THREE.TorusGeometry(1.35, 0.015, 12, 90),
      new THREE.MeshBasicMaterial({ color: 0xffe7a8, transparent: true, opacity: 0.55 }),
    );
    scene.add(anneauInterne);

    const noyau = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.62, 1),
      new THREE.MeshStandardMaterial({
        color: 0xf6d98a,
        emissive: 0xc9a227,
        emissiveIntensity: 1.15,
        metalness: 0.72,
        roughness: 0.22,
      }),
    );
    scene.add(noyau);

    const lumiere = new THREE.PointLight(0xffe7a3, 12, 24);
    lumiere.position.set(0, 0.4, 2.2);
    scene.add(lumiere);
    scene.add(new THREE.AmbientLight(0x2a1840, 1.4));

    const pointeur = { x: 0, y: 0 };
    const surPointeur = (event: PointerEvent) => {
      pointeur.x = (event.clientX / window.innerWidth - 0.5) * 1.1;
      pointeur.y = (event.clientY / window.innerHeight - 0.5) * 0.6;
    };
    window.addEventListener("pointermove", surPointeur);

    const redimensionner = () => {
      const largeur = mount.clientWidth || window.innerWidth;
      const hauteur = mount.clientHeight || window.innerHeight;
      camera.aspect = largeur / Math.max(hauteur, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(largeur, hauteur, false);
    };
    const observateur = new ResizeObserver(redimensionner);
    observateur.observe(mount);
    redimensionner();

    const horloge = new THREE.Clock();
    let cadre = 0;
    const animer = () => {
      const temps = horloge.getElapsedTime();
      const tenebres = factionRef.current === "tenebres";
      const accentActuel = accentRef.current;
      const matNoyau = noyau.material as THREE.MeshStandardMaterial;
      matNoyau.color.setHex(accentActuel);
      matNoyau.emissive.setHex(accentActuel);
      (anneau.material as THREE.MeshBasicMaterial).color.setHex(tenebres ? 0xff4d2e : 0xf6d98a);
      (anneauInterne.material as THREE.MeshBasicMaterial).color.setHex(accentActuel);
      matNebuleuseA.color.setHex(tenebres ? 0x6b1020 : 0x3b1d78);
      matNebuleuseB.color.setHex(tenebres ? 0xff5a1a : 0xd4a017);
      matMotes.color.setHex(tenebres ? 0xff5a1f : 0xf6d98a);
      lumiere.color.setHex(tenebres ? 0xff6a3c : 0xffe7a3);

      anneau.rotation.z = temps * 0.16;
      anneau.rotation.y = temps * 0.07;
      anneauInterne.rotation.x = temps * 0.35;
      anneauInterne.rotation.z = -temps * 0.22;
      noyau.rotation.y = temps * 0.45;
      noyau.rotation.x = Math.sin(temps * 0.3) * 0.25;
      noyau.position.y = Math.sin(temps * 0.8) * 0.16;
      pointsEtoiles.rotation.y = temps * 0.012;
      nebuleuseA.position.x = -4.2 + Math.sin(temps * 0.15) * 0.4;

      const positions = geoMotes.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < motes; i += 1) {
        let y = positions.getY(i);
        y += tenebres ? vitesses[i] * 0.018 : Math.sin(temps * 0.6 + i) * 0.004;
        if (y > 6.2) y = -5.4;
        if (y < -5.6) y = 6;
        positions.setY(i, y);
      }
      positions.needsUpdate = true;

      camera.position.x += (pointeur.x - camera.position.x) * 0.035;
      camera.position.y += (0.35 - pointeur.y - camera.position.y) * 0.035;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      cadre = requestAnimationFrame(animer);
    };
    animer();

    return () => {
      cancelAnimationFrame(cadre);
      window.removeEventListener("pointermove", surPointeur);
      observateur.disconnect();
      scene.traverse((objet) => {
        const maillage = objet as THREE.Mesh;
        if (maillage.geometry) maillage.geometry.dispose();
        const materiau = maillage.material;
        if (Array.isArray(materiau)) materiau.forEach((item) => item.dispose());
        else if (materiau) materiau.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />;
}

function Etincelles() {
  const etincelles = useMemo(
    () =>
      Array.from({ length: 32 }, (_, index) => ({
        left: `${(index * 31) % 100}%`,
        delai: `${(index * 0.31) % 4.2}s`,
        duree: `${3.2 + (index % 5) * 0.55}s`,
        couleur: index % 2 === 0 ? "#f6d98a" : "#d8b4fe",
        taille: 2 + (index % 3),
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden="true">
      {etincelles.map((etincelle, index) => (
        <span
          key={index}
          className="absolute bottom-0 rounded-full"
          style={{
            left: etincelle.left,
            width: etincelle.taille,
            height: etincelle.taille,
            background: etincelle.couleur,
            boxShadow: `0 0 10px ${etincelle.couleur}`,
            animation: `legion-etincelle ${etincelle.duree} linear ${etincelle.delai} infinite`,
          }}
        />
      ))}
    </div>
  );
}

function Jauge({
  label,
  valeur,
  couleur,
  detail,
}: {
  label: string;
  valeur: number;
  couleur: string;
  detail?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3 text-[0.72rem] tracking-[0.12em] text-[#f3e6c4]/80 uppercase">
        <span>{label}</span>
        <span className="font-semibold text-[#fff6d8]">
          {valeur}
          <span className="text-[#f3e6c4]/50"> / 100</span>
        </span>
      </div>
      {detail ? <p className="mb-1 text-[0.68rem] tracking-wide text-[#f6d98a]/70">{detail}</p> : null}
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${valeur}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          style={{ background: `linear-gradient(90deg, ${couleur}, #fff4cc)`, boxShadow: `0 0 14px ${couleur}` }}
        />
      </div>
    </div>
  );
}

function SceneInvocation({
  heros,
  imageIndisponible,
  onImageErreur,
}: {
  heros: Heros;
  imageIndisponible: boolean;
  onImageErreur: () => void;
}) {
  const accent = hexCss(heros.couleur);
  const particules = Array.from({ length: 22 }, (_, index) => ({
    left: `${8 + ((index * 37) % 84)}%`,
    delay: `${(index % 8) * 0.32}s`,
    duration: `${3.8 + (index % 5) * 0.7}s`,
    size: 2 + (index % 3),
  }));

  return (
    <section
      aria-label={`Invocation de ${heros.nom}`}
      className="relative isolate mx-auto mt-6 h-[470px] w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#050813]/55 shadow-[inset_0_0_80px_rgba(0,0,0,.65)] sm:h-[560px] lg:h-[620px]"
      style={{ "--hero-accent": accent } as React.CSSProperties}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_75%,var(--hero-accent)_0%,transparent_42%)] opacity-20" />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[48%] z-[4] h-[45%] w-[48%] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: `radial-gradient(ellipse, ${accent}88 0%, ${accent}30 42%, transparent 74%)` }}
        animate={{ opacity: [0.35, 0.72, 0.35], scale: [0.92, 1.12, 0.92] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 top-5 z-20 text-center sm:top-7">
        <p className="text-[0.6rem] tracking-[0.45em] text-[#f6d98a]/80 uppercase sm:text-xs">Héros invoqué · niveau 1</p>
        <h2
          className="mt-1 text-2xl text-[#fff8e4] sm:text-4xl lg:text-5xl"
          style={{ fontFamily: '"Cinzel", Palatino, serif', textShadow: `0 0 28px ${accent}99` }}
        >
          {heros.nom}
        </h2>
        <p className="mt-1 text-sm text-[#f3e6c4]/75 italic sm:text-lg">{heros.titre}</p>
      </div>

      {particules.map((particule, index) => (
        <span
          key={`${heros.id}-spark-${index}`}
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[15%] z-[5] rounded-full"
          style={{
            left: particule.left,
            width: particule.size,
            height: particule.size,
            backgroundColor: accent,
            boxShadow: `0 0 12px ${accent}`,
            animation: `legion-hero-particle ${particule.duration} ease-in-out ${particule.delay} infinite`,
          }}
        />
      ))}

      <div className="absolute bottom-6 left-1/2 z-[6] h-16 w-[72%] -translate-x-1/2 rounded-[50%] border border-white/15 bg-black/50 shadow-[0_0_48px_var(--hero-accent)] sm:bottom-7 sm:h-24 sm:w-[58%]">
        <div className="absolute inset-[7px] rounded-[50%] border border-[var(--hero-accent)]/75 shadow-[inset_0_0_22px_var(--hero-accent)]" />
        <motion.div
          aria-hidden="true"
          className="absolute inset-[-7px] rounded-[50%] border border-t-[var(--hero-accent)] border-r-transparent border-b-white/30 border-l-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-[15px] rounded-[50%] border border-dashed border-[var(--hero-accent)]/70"
          animate={{ rotate: -360, scale: [1, 1.04, 1] }}
          transition={{ rotate: { duration: 26, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity } }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute inset-[20px] flex items-center justify-between px-2 font-serif text-[10px] text-[#fff2c2] drop-shadow-[0_0_8px_var(--hero-accent)] sm:text-xs"
          animate={{ rotate: 360 }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
        >
          <span>✦</span><span>ᚱ</span><span>✧</span><span>ᚨ</span><span>✦</span>
        </motion.div>
      </div>

      {!imageIndisponible ? (
        <motion.img
          key={heros.id}
          src={PORTRAITS_HEROS[heros.id] ?? `/${heros.id}.jpg`}
          alt={`${heros.nom}, héros invoqué en pied`}
          onError={onImageErreur}
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          className="absolute bottom-12 left-1/2 z-10 h-[76%] max-w-[88%] -translate-x-1/2 object-contain object-bottom drop-shadow-[0_18px_40px_rgba(0,0,0,.75)] sm:bottom-16 sm:h-[82%]"
          style={{ filter: `drop-shadow(0 0 22px ${accent}55)` }}
          animate={{ opacity: 1, y: [0, -10, 0], scale: 1 }}
          transition={{ opacity: { duration: 0.65 }, scale: { duration: 0.65 }, y: { duration: 4.2, repeat: Infinity, ease: "easeInOut" } }}
        />
      ) : (
        <motion.div
          key={`${heros.id}-sigil`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: [1, 1.035, 1] }}
          transition={{ scale: { duration: 4, repeat: Infinity, ease: "easeInOut" } }}
          className="absolute bottom-20 left-1/2 z-10 flex h-64 w-48 -translate-x-1/2 flex-col items-center justify-center rounded-[48%] border border-white/10 bg-black/20 text-center sm:bottom-24 sm:h-80 sm:w-60"
          style={{ boxShadow: `0 0 80px ${accent}33, inset 0 0 42px ${accent}22` }}
        >
          <span className="text-7xl drop-shadow-[0_0_28px_var(--hero-accent)] sm:text-8xl">{heros.iconeElement}</span>
          <span className="mt-3 text-3xl" aria-hidden="true">{heros.iconeClasse}</span>
          <span className="mt-2 font-serif text-sm tracking-[.18em] text-[#fff8e4]/80 uppercase">{heros.classe}</span>
        </motion.div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-2 z-20 text-center text-[8px] tracking-[.28em] text-[#f6d98a]/65 uppercase sm:text-[10px]">
        Socle d’invocation · {heros.element}
      </div>
    </section>
  );
}

export default function LegionCelesteApp() {
  const [faction, setFaction] = useState<FactionId>("lumiere");
  const [herosId, setHerosId] = useState(HEROS[0].id);
  const [rituel, setRituel] = useState<Heros | null>(null);
  const [eclat, setEclat] = useState(0);
  const [portraitErreur, setPortraitErreur] = useState<string | null>(null);
  const [sonActif, setSonActif] = useState(true);
  const [combat, setCombat] = useState<EtatCombat | null>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const prochainDegatId = useRef(0);
  const combatRef = useRef(combat);
  combatRef.current = combat;

  const herosFaction = useMemo(() => HEROS.filter((heros) => heros.faction === faction), [faction]);
  const heros = HEROS.find((candidat) => candidat.id === herosId && candidat.faction === faction) ?? herosFaction[0];
  const herosRef = useRef(heros);
  herosRef.current = heros;
  const lumiere = faction === "lumiere";
  const teinte = hexCss(heros.couleur);

  useEffect(() => {
    const precedent = document.title;
    document.title = "Légion Céleste — Sélection du Héros";
    const identifiant = "legion-celeste-fonts";
    if (!document.getElementById(identifiant)) {
      const lien = document.createElement("link");
      lien.id = identifiant;
      lien.rel = "stylesheet";
      lien.href =
        "https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap";
      document.head.appendChild(lien);
    }
    return () => {
      document.title = precedent;
      if (audioRef.current && audioRef.current.state !== "closed") void audioRef.current.close();
    };
  }, []);

  function choisirFaction(suivante: FactionId) {
    setFaction(suivante);
    const premier = HEROS.find((candidat) => candidat.faction === suivante);
    if (premier) setHerosId(premier.id);
  }

  function jouerGongLocal() {
    if (!sonActif) return;
    const Contexte =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Contexte) return;
    if (!audioRef.current || audioRef.current.state === "closed") audioRef.current = new Contexte();
    if (audioRef.current.state === "suspended") void audioRef.current.resume();
    jouerGong(audioRef.current);
  }

  function prononcerReplique() {
    if (!sonActif || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(REPLIQUES_HEROS[heros.id] ?? heros.quete);
    utterance.lang = "fr-FR";
    utterance.rate = 0.84;
    utterance.pitch = 0.82;
    utterance.volume = 1;
    const voixFrancaise = window.speechSynthesis.getVoices().find((voix) => voix.lang.toLowerCase().startsWith("fr"));
    if (voixFrancaise) utterance.voice = voixFrancaise;
    window.speechSynthesis.speak(utterance);
  }

  function basculerSon() {
    const suivant = !sonActif;
    if (!suivant) {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
      if (audioRef.current?.state === "running") void audioRef.current.suspend();
    }
    setSonActif(suivant);
  }

  function incarner() {
    jouerGongLocal();
    prononcerReplique();
    setEclat((valeur) => valeur + 1);
    setCombat(creerCombat(heros));
    setRituel(heros);
  }

  function attaquer(indexAction: number) {
    const herosCombat = rituel;
    const combatActuel = combatRef.current;
    if (!herosCombat || !combatActuel || combatActuel.victoire || combatActuel.defaite) return;
    const actions = actionsDuHeros(herosCombat);
    const action = actions[indexAction - 1];
    if (!action) return;
    if (indexAction > 1 && combatActuel.cooldowns[indexAction - 2] > 0) return;
    if (combatActuel.ressource < action.cout) return;

    jouerGongLocal();
    const adversaire = HEROS.find((candidat) => candidat.id === combatActuel.ennemiId);
    if (!adversaire) return;
    const avantage = avantageElementaire(herosCombat.element, adversaire.element);
    const critique = indexAction === 4 || Math.random() < 0.14;
    const base = (herosCombat.stats.attaque * 3.2 + herosCombat.stats.elementaire * 1.2) * action.puissance;
    const degats = Math.round(base * (avantage ? 1.5 : 1) * (critique ? 1.65 : 1));
    const idDegat = ++prochainDegatId.current;

    setCombat((actuel) => {
      if (!actuel || actuel.victoire || actuel.defaite || actuel.ressource < action.cout) return actuel;
      const pvEnnemi = Math.max(0, actuel.pvEnnemi - degats);
      const victoire = pvEnnemi <= 0;
      const tempsCooldowns: [number, number, number] = [...actuel.cooldowns];
      if (indexAction > 1) tempsCooldowns[indexAction - 2] = action.cooldown;
      return {
        ...actuel,
        pvEnnemi,
        ressource: Math.min(100, actuel.ressource - action.cout + 4),
        cooldowns: tempsCooldowns,
        victoire,
        xp: actuel.xp + (victoire ? 250 : 0),
        benedictions: actuel.benedictions + (victoire ? 100 : 0),
        victoires: actuel.victoires + (victoire ? 1 : 0),
        secousse: actuel.secousse + (critique ? 1 : 0),
        journal: [`${herosCombat.nom} lance ${action.nom} : −${degats}${critique ? ' CRITIQUE' : ''}${avantage ? ' · AVANTAGE +50 %' : ''}.`, ...actuel.journal].slice(0, 8),
        degats: [...actuel.degats, { id: idDegat, cible: "ennemi" as const, montant: degats, critique }],
      };
    });
    window.setTimeout(() => {
      setCombat((actuel) => actuel ? { ...actuel, degats: actuel.degats.filter((item) => item.id !== idDegat) } : actuel);
    }, 1200);
  }

  function combatSuivant() {
    if (rituel && combat) setCombat(creerCombat(rituel, combat));
  }

  useEffect(() => {
    if (!rituel) return;
    const intervalle = window.setInterval(() => {
      const joueur = herosRef.current;
      const actuel = combatRef.current;
      if (!joueur || !actuel || actuel.victoire || actuel.defaite) return;
      const adversaire = HEROS.find((candidat) => candidat.id === actuel.ennemiId);
      if (!adversaire) return;
      const critique = Math.random() < 0.1;
      const degats = Math.round((adversaire.stats.attaque * 2.3 + adversaire.stats.elementaire * 0.7) * (critique ? 1.55 : 1));
      const idDegat = ++prochainDegatId.current;
      setCombat((etat) => {
        if (!etat || etat.victoire || etat.defaite) return etat;
        const pvJoueur = Math.max(0, etat.pvJoueur - degats);
        const defaite = pvJoueur <= 0;
        return {
          ...etat,
          pvJoueur,
          ressource: Math.min(100, etat.ressource + 8),
          cooldowns: etat.cooldowns.map((valeur) => Math.max(0, valeur - 3)) as [number, number, number],
          defaite,
          secousse: etat.secousse + (critique ? 1 : 0),
          journal: [`${adversaire.nom} riposte : −${degats}${critique ? ' CRITIQUE' : ''}.`, ...etat.journal].slice(0, 8),
          degats: [...etat.degats, { id: idDegat, cible: "joueur" as const, montant: degats, critique }],
        };
      });
      window.setTimeout(() => {
        setCombat((etat) => etat ? { ...etat, degats: etat.degats.filter((item) => item.id !== idDegat) } : etat);
      }, 1200);
    }, 3000);
    return () => window.clearInterval(intervalle);
  }, [rituel]);

  useEffect(() => {
    if (!rituel || combat?.victoire || combat?.defaite) return;
    const clavier = (event: KeyboardEvent) => {
      if (["1", "2", "3", "4"].includes(event.key)) attaquer(Number(event.key));
    };
    window.addEventListener("keydown", clavier);
    return () => window.removeEventListener("keydown", clavier);
  }, [rituel, combat?.victoire, combat?.defaite, sonActif]);

  return (
    <div
      className="relative min-h-screen overflow-x-hidden text-[#f8f1de]"
      style={{ fontFamily: '"Cormorant Garamond", Palatino, "Palatino Linotype", serif' }}
    >
      <style>{`
        @keyframes legion-etincelle {
          0% { transform: translateY(12vh) scale(0.6); opacity: 0; }
          12% { opacity: 1; }
          100% { transform: translateY(-110vh) scale(1); opacity: 0; }
        }
        @keyframes legion-flamme {
          0%, 100% { transform: scaleY(0.8) translateY(10px); opacity: 0.35; }
          50% { transform: scaleY(1.2) translateY(-8px); opacity: 0.9; }
        }
        @keyframes legion-shimmer {
          0% { transform: translateX(-130%); }
          100% { transform: translateX(230%); }
        }
        @keyframes legion-hero-particle {
          0% { transform: translate3d(0, 35px, 0) scale(.55); opacity: 0; }
          16% { opacity: .95; }
          100% { transform: translate3d(8px, -260px, 0) scale(1.2); opacity: 0; }
        }
        @keyframes legion-arena-shake {
          0%, 100% { transform: translate3d(0, 0, 0); }
          20% { transform: translate3d(-7px, 2px, 0); }
          40% { transform: translate3d(6px, -2px, 0); }
          60% { transform: translate3d(-4px, 1px, 0); }
          80% { transform: translate3d(3px, 0, 0); }
        }
      `}</style>

      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: lumiere
            ? "radial-gradient(ellipse at 50% 0%, #3a2a12 0%, #140c18 42%, #05010c 100%)"
            : "radial-gradient(ellipse at 50% 100%, #3a0c12 0%, #14060c 46%, #05010c 100%)",
          transition: "background 700ms ease",
        }}
      />
      <SceneCeleste faction={faction} accent={heros.couleur} />
      <Etincelles />

      <div
        className="pointer-events-none absolute inset-0 z-[1] transition-opacity duration-700"
        style={{
          opacity: lumiere ? 1 : 0,
          background:
            "radial-gradient(ellipse at 50% 18%, rgba(255,214,120,0.22), transparent 46%), radial-gradient(ellipse at 50% 100%, rgba(255,196,90,0.08), transparent 42%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-52 overflow-hidden transition-opacity duration-700"
        style={{ opacity: lumiere ? 0 : 1 }}
      >
        {Array.from({ length: 10 }, (_, index) => (
          <span
            key={index}
            className="absolute bottom-0 w-16 rounded-full blur-md"
            style={{
              left: `${index * 10}%`,
              height: `${80 + (index % 4) * 28}px`,
              background:
                "linear-gradient(to top, rgba(40,0,0,0), rgba(255,70,18,0.55), rgba(80,0,20,0))",
              animation: `legion-flamme ${1.5 + (index % 4) * 0.28}s ease-in-out ${index * 0.12}s infinite`,
            }}
          />
        ))}
      </div>
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.28)_58%,rgba(0,0,0,0.78)_100%)]" />

      <AnimatePresence>
        {eclat > 0 && rituel ? (
          <motion.div
            key={eclat}
            className="pointer-events-none fixed inset-0 z-40"
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9 }}
            style={{ background: lumiere ? "rgba(255, 220, 140, 0.45)" : "rgba(255, 60, 20, 0.4)" }}
          />
        ) : null}
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1540px] flex-col px-4 pt-6 pb-8 md:px-8">
        {!rituel ? (
          <>
        <header className="relative pt-11 text-center sm:pt-0">
          <button
            type="button"
            onClick={basculerSon}
            aria-pressed={sonActif}
            aria-label={sonActif ? "Désactiver le son" : "Activer le son"}
            className="absolute right-0 top-0 rounded-full border border-[#f6d98a]/50 bg-black/45 px-3 py-2 text-xs tracking-wide text-[#fff4cc] transition hover:border-[#f6d98a] hover:bg-black/65 sm:right-1 sm:top-1"
          >
            {sonActif ? "🔊 Son ON" : "🔇 Son OFF"}
          </button>
          <p className="text-[0.68rem] tracking-[0.55em] text-[#f6d98a]/80 uppercase">MMORPG · Arène des Origines</p>
          <h1
            className="mx-auto mt-2 max-w-5xl text-[1.55rem] leading-tight text-[#fff8e4] uppercase sm:text-4xl lg:text-5xl"
            style={{
              fontFamily: '"Cinzel", Palatino, serif',
              textShadow: lumiere
                ? "0 0 24px rgba(246,217,138,0.45), 0 2px 0 #3a2a10"
                : "0 0 24px rgba(255,80,40,0.4), 0 2px 0 #2a0a0c",
            }}
          >
            Légion Céleste : La Guerre des Origines
          </h1>
          <p className="mt-3 text-lg tracking-[0.18em] text-[#f3e6c4]/85 sm:text-xl">
            Sélection du Héros · Level 1 à 100
          </p>
        </header>

        <div role="tablist" aria-label="Sélection de faction" className="mx-auto mt-6 grid w-full max-w-5xl gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => choisirFaction("lumiere")}
            aria-pressed={lumiere}
            role="tab"
            aria-selected={lumiere}
            className={`rounded-2xl border px-4 py-4 text-left transition duration-300 ${
              lumiere
                ? "border-[#f6d98a] bg-gradient-to-br from-[#3a2a10]/90 to-[#1a1208]/80 shadow-[0_0_32px_rgba(246,217,138,0.35)]"
                : "border-white/15 bg-black/35 hover:border-[#f6d98a]/50"
            }`}
          >
            <span className="block text-2xl">☀️</span>
            <span className="mt-1 block text-sm tracking-[0.16em] uppercase" style={{ fontFamily: '"Cinzel", Palatino, serif' }}>
              Alliance de la Lumière
            </span>
            <span className="mt-1 block text-base text-[#f6d98a]/90">Le Sanctuaire d'Éden-Sion</span>
            <span className="mt-1 block text-xs tracking-[.18em] text-[#fff8e4]/65 uppercase">8 Gardiens</span>
          </button>
          <button
            type="button"
            onClick={() => choisirFaction("tenebres")}
            aria-pressed={!lumiere}
            role="tab"
            aria-selected={!lumiere}
            className={`rounded-2xl border px-4 py-4 text-left transition duration-300 ${
              !lumiere
                ? "border-[#ff6a3c] bg-gradient-to-br from-[#2a080c]/95 to-[#0c0608]/85 shadow-[0_0_32px_rgba(255,70,30,0.35)]"
                : "border-white/15 bg-black/35 hover:border-[#ff6a3c]/50"
            }`}
          >
            <span className="block text-2xl">🌑</span>
            <span className="mt-1 block text-sm tracking-[0.16em] uppercase" style={{ fontFamily: '"Cinzel", Palatino, serif' }}>
              L'Abîme des Ténèbres
            </span>
            <span className="mt-1 block text-base text-[#ffb199]/90">La Nécropole de Babel-Shéol</span>
            <span className="mt-1 block text-xs tracking-[.18em] text-[#fff8e4]/65 uppercase">8 Antagonistes</span>
          </button>
        </div>

        <SceneInvocation
          heros={heros}
          imageIndisponible={portraitErreur === heros.id}
          onImageErreur={() => setPortraitErreur(heros.id)}
        />

        <div className="mt-6 grid flex-1 items-start gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)]">
          <section aria-label="Héros de la faction">
            <h2
              className="mb-3 text-center text-xs tracking-[0.38em] uppercase"
              style={{ fontFamily: '"Cinzel", Palatino, serif', color: lumiere ? "#f6d98a" : "#ffb199" }}
            >
              {lumiere ? "Huit gardiens du Sanctuaire" : "Huit seigneurs de la Nécropole"}
            </h2>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {herosFaction.map((candidat) => {
                const actif = candidat.id === heros.id;
                return (
                  <motion.button
                    key={candidat.id}
                    type="button"
                    onClick={() => {
                      setHerosId(candidat.id);
                      jouerGongLocal();
                    }}
                    aria-pressed={actif}
                    whileHover={{ y: -4, rotateX: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`group relative overflow-hidden rounded-2xl border px-3 py-4 text-center backdrop-blur-md transition ${
                      actif
                        ? "border-[#f6d98a] shadow-[0_0_24px_rgba(246,217,138,0.28)]"
                        : "border-white/10 hover:border-white/30"
                    }`}
                    style={{
                      background: actif
                        ? `linear-gradient(180deg, ${hexCss(candidat.couleur)}33, rgba(8,6,12,0.88))`
                        : "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(6,4,10,0.72))",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <span className="absolute top-2 right-2 rounded-full border border-white/15 px-2 py-0.5 text-[0.62rem] tracking-[0.14em] text-[#f3e6c4]/70 uppercase">
                      Niv. 1
                    </span>
                    <span className="block text-3xl drop-shadow">{candidat.iconeClasse}</span>
                    <span className="mt-1 block text-xl">{candidat.iconeElement}</span>
                    <span
                      className="mt-2 block text-lg leading-none text-[#fff8e8]"
                      style={{ fontFamily: '"Cinzel", Palatino, serif' }}
                    >
                      {candidat.nom}
                    </span>
                    <span className="mt-1 block text-sm text-[#f3e6c4]/75">{candidat.element}</span>
                    <span className="mt-0.5 block text-xs tracking-wide text-[#f6d98a]/60 uppercase">{candidat.classe}</span>
                  </motion.button>
                );
              })}
            </div>
          </section>

          <aside
            className="rounded-3xl border p-5 shadow-2xl backdrop-blur-xl md:p-6 xl:sticky xl:top-4"
            style={{
              borderColor: lumiere ? "rgba(246,217,138,0.35)" : "rgba(255,90,40,0.4)",
              background: lumiere
                ? "linear-gradient(180deg, rgba(36,26,12,0.88), rgba(8,6,10,0.92))"
                : "linear-gradient(180deg, rgba(32,8,12,0.9), rgba(8,4,8,0.94))",
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={heros.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                <p className="text-[0.68rem] tracking-[0.32em] text-[#f6d98a]/75 uppercase">{heros.classe}</p>
                <h2
                  className="mt-1 text-3xl leading-tight text-[#fff8e8] sm:text-4xl"
                  style={{ fontFamily: '"Cinzel", Palatino, serif' }}
                >
                  {heros.nom}
                </h2>
                <p className="mt-1 text-xl text-[#f3e6c4] italic">{heros.titre}</p>

                <div
                  className="mt-4 rounded-2xl border px-4 py-3"
                  style={{ borderColor: `${teinte}88`, background: `${teinte}22` }}
                >
                  <p className="text-lg">
                    <span className="mr-2">{heros.iconeElement}</span>
                    <span style={{ fontFamily: '"Cinzel", Palatino, serif' }}>{heros.element}</span>
                  </p>
                  <p className="mt-1 text-[#d9ffe8]">{heros.bonus}</p>
                  <p className="text-[#ffd0c8]">{heros.malus}</p>
                </div>

                <h3
                  className="mt-5 text-xs tracking-[0.28em] text-[#f6d98a] uppercase"
                  style={{ fontFamily: '"Cinzel", Palatino, serif' }}
                >
                  Reliques & Armes Légendaires
                </h3>
                <ul className="mt-2 space-y-2">
                  {heros.reliques.map((relique) => (
                    <li key={relique.nom} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
                      <p className="text-[#fff6d8]">{relique.nom}</p>
                      <p className="text-sm text-[#f3e6c4]/70">{relique.detail}</p>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 space-y-3" key={`${heros.id}-jauges`}>
                  {JAUGES.map((jauge) => (
                    <Jauge
                      key={jauge.cle}
                      label={jauge.label}
                      valeur={heros.stats[jauge.cle]}
                      couleur={teinte}
                      detail={jauge.cle === "attaque" ? `Dominante : ${heros.attaqueDominante}` : undefined}
                    />
                  ))}
                </div>

                <h3
                  className="mt-5 text-xs tracking-[0.28em] text-[#f6d98a] uppercase"
                  style={{ fontFamily: '"Cinzel", Palatino, serif' }}
                >
                  Quête Épique du Niveau 100
                </h3>
                <p className="mt-2 text-lg leading-snug text-[#f8f1de]/90">{heros.quete}</p>

                <button
                  type="button"
                  onClick={incarner}
                  className="relative mt-6 w-full overflow-hidden rounded-2xl border border-[#ffe7a8] px-4 py-4 text-sm tracking-[0.12em] text-[#2a1a08] uppercase shadow-[0_0_28px_rgba(246,217,138,0.45)] sm:text-base"
                  style={{
                    fontFamily: '"Cinzel", Palatino, serif',
                    background: "linear-gradient(180deg, #fff1c2 0%, #e7b84a 48%, #b8860b 100%)",
                  }}
                >
                  <span
                    className="pointer-events-none absolute inset-y-0 left-0 w-1/3"
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.65), transparent)",
                      animation: "legion-shimmer 2.4s ease-in-out infinite",
                    }}
                  />
                  <span className="relative">[ ⚔️ Incarner ce héros dans l'arène ]</span>
                </button>
                <p className="mt-2 text-center text-sm tracking-wide text-[#f3e6c4]/60">
                  Départ au niveau 1 · Le gong de guerre scelle le pacte
                </p>
              </motion.div>
            </AnimatePresence>
          </aside>
        </div>
          </>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {rituel && combat ? (
          <motion.main
            key="arena-proelium"
            initial={{ opacity: 0, scale: 0.97, filter: "blur(8px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.65 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-[#050712]/95 px-3 py-4 text-[#fff8e4] backdrop-blur-xl sm:px-6 sm:py-6"
            style={combat.secousse ? { animation: "legion-arena-shake .32s ease-in-out" } : undefined}
          >
            {(() => {
              const adversaire = HEROS.find((candidat) => candidat.id === combat.ennemiId) ?? HEROS[0];
              const avantage = avantageElementaire(rituel.element, adversaire.element);
              const actions = actionsDuHeros(rituel);
              const pvJoueurPct = (combat.pvJoueur / combat.pvMaxJoueur) * 100;
              const pvEnnemiPct = (combat.pvEnnemi / combat.pvMaxEnnemi) * 100;
              const portraitJoueur = PORTRAITS_HEROS[rituel.id] ?? `/${rituel.id}.jpg`;
              const portraitEnnemi = PORTRAITS_HEROS[adversaire.id] ?? `/${adversaire.id}.jpg`;
              return (
                <div className="mx-auto flex min-h-full max-w-7xl flex-col">
                  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f6d98a]/30 pb-4">
                    <div>
                      <p className="text-[.62rem] tracking-[.4em] text-[#f6d98a]/75 uppercase">Chapitre V · Plaine de Proelium · RvR niveaux 1–25</p>
                      <h1 className="mt-1 font-serif text-xl text-[#fff4cc] sm:text-3xl">Arène de Combat</h1>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-[#f6d98a]/35 px-3 py-1 text-xs text-[#f6d98a]">Niveau {1 + Math.floor(combat.xp / 1000)}</span>
                      <button type="button" onClick={() => { setRituel(null); setCombat(null); }} className="rounded-full border border-white/25 px-4 py-2 text-xs text-white/80 transition hover:border-[#f6d98a] hover:text-[#f6d98a]">Quitter l’Arène</button>
                    </div>
                  </header>

                  <div className={`mt-4 grid flex-1 items-stretch gap-3 md:grid-cols-[1fr_auto_1fr] ${combat.secousse ? "animate-pulse" : ""}`}>
                    <article className="relative overflow-hidden rounded-3xl border border-[#f6d98a]/35 bg-gradient-to-b from-[#1a2338]/95 to-[#090b14]/95 p-4 sm:p-6">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(62,198,224,.16),transparent_55%)]" />
                      {combat.degats.filter((item) => item.cible === "joueur").map((item) => <motion.span key={item.id} initial={{ opacity: 1, y: 0, scale: 0.7 }} animate={{ opacity: 0, y: -70, scale: 1.2 }} className="absolute left-1/2 top-1/3 z-20 font-black text-red-400 drop-shadow-lg">−{item.montant}{item.critique ? " CRITIQUE" : ""}</motion.span>)}
                      <div className="relative flex h-full flex-col items-center text-center">
                        <p className="text-[.6rem] tracking-[.35em] text-[#f6d98a] uppercase">Alliance de la Lumière · Joueur</p>
                        <div className="relative mt-3 h-48 w-full sm:h-64">
                          {!portraitErreur || portraitErreur !== rituel.id ? <img src={portraitJoueur} alt={rituel.nom} onError={() => setPortraitErreur(rituel.id)} className="h-full w-full object-contain object-bottom drop-shadow-[0_12px_25px_rgba(62,198,224,.35)]" /> : <div className="flex h-full items-center justify-center text-7xl">{rituel.iconeElement}</div>}
                        </div>
                        <h2 className="mt-2 font-serif text-2xl">{rituel.iconeElement} {rituel.nom}</h2>
                        <div className="mt-3 w-full text-left">
                          <div className="flex justify-between text-xs"><span>PV</span><span>{combat.pvJoueur} / {combat.pvMaxJoueur}</span></div>
                          <div className="mt-1 h-3 overflow-hidden rounded-full border border-white/15 bg-black/50"><motion.div className="h-full bg-gradient-to-r from-red-800 to-red-400" animate={{ width: `${pvJoueurPct}%` }} /></div>
                          <div className="mt-2 flex justify-between text-xs"><span>{rituel.attaqueDominante === "Physique" ? "Rage" : "Mana"}</span><span>{combat.ressource} / 100</span></div>
                          <div className="mt-1 h-2 overflow-hidden rounded-full bg-black/50"><motion.div className="h-full bg-gradient-to-r from-blue-800 to-cyan-300" animate={{ width: `${combat.ressource}%` }} /></div>
                        </div>
                      </div>
                    </article>

                    <div className="flex items-center justify-center px-2 py-1 font-serif text-2xl tracking-[.3em] text-[#f6d98a] sm:text-4xl">VS</div>

                    <article className="relative overflow-hidden rounded-3xl border border-red-500/35 bg-gradient-to-b from-[#32151d]/95 to-[#10070d]/95 p-4 sm:p-6">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,70,30,.18),transparent_55%)]" />
                      {combat.degats.filter((item) => item.cible === "ennemi").map((item) => <motion.span key={item.id} initial={{ opacity: 1, y: 0, scale: 0.7 }} animate={{ opacity: 0, y: -70, scale: 1.2 }} className={`absolute left-1/2 top-1/3 z-20 font-black drop-shadow-lg ${item.critique ? "text-yellow-300" : "text-orange-400"}`}>−{item.montant}{item.critique ? " CRITIQUE" : ""}</motion.span>)}
                      <div className="relative flex h-full flex-col items-center text-center">
                        <p className="text-[.6rem] tracking-[.35em] text-red-300 uppercase">Abîme des Ténèbres · Champion</p>
                        <div className="relative mt-3 h-48 w-full sm:h-64">
                          <img src={portraitEnnemi} alt={adversaire.nom} onError={(event) => { event.currentTarget.style.opacity = "0"; }} className="h-full w-full object-contain object-bottom drop-shadow-[0_12px_25px_rgba(255,60,35,.35)]" />
                          <span className="absolute inset-0 -z-10 flex items-center justify-center text-7xl">{adversaire.iconeElement}</span>
                        </div>
                        <h2 className="mt-2 font-serif text-2xl">{adversaire.iconeElement} {adversaire.nom}</h2>
                        <div className="mt-3 w-full text-left">
                          <div className="flex justify-between text-xs"><span>PV</span><span>{combat.pvEnnemi} / {combat.pvMaxEnnemi}</span></div>
                          <div className="mt-1 h-3 overflow-hidden rounded-full border border-white/15 bg-black/50"><motion.div className="h-full bg-gradient-to-r from-red-950 to-red-500" animate={{ width: `${pvEnnemiPct}%` }} /></div>
                          <p className="mt-2 text-xs text-white/60">Élément : {adversaire.element}</p>
                        </div>
                      </div>
                    </article>
                  </div>

                  {avantage ? <motion.p initial={{ opacity: 0.5 }} animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.2, repeat: Infinity }} className="mx-auto mt-3 rounded-full border border-yellow-300/60 bg-yellow-300/10 px-5 py-2 text-center text-xs font-black tracking-[.16em] text-yellow-200">⚡ +50 % AVANTAGE ÉLÉMENTAIRE ⚡</motion.p> : null}

                  <section className="mt-4 rounded-2xl border border-[#f6d98a]/25 bg-black/50 p-3 sm:p-4" aria-label="Actions de combat">
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {actions.map((action, index) => {
                        const key = index + 1;
                        const cooldown = index > 0 ? combat.cooldowns[index - 1] : 0;
                        const disabled = combat.victoire || combat.defaite || cooldown > 0 || combat.ressource < action.cout;
                        return <button key={action.nom} type="button" disabled={disabled} onClick={() => attaquer(key)} className="min-h-[78px] rounded-xl border border-[#f6d98a]/35 bg-gradient-to-b from-[#342814] to-[#15100b] px-2 py-2 text-left transition enabled:hover:border-[#fff0b5] enabled:hover:shadow-[0_0_18px_rgba(246,217,138,.22)] disabled:cursor-not-allowed disabled:opacity-45"><span className="flex items-center justify-between text-xs font-bold text-[#f6d98a]"><span>[{key}] {action.icone}</span><span>{cooldown > 0 ? `${cooldown}s` : action.cout ? `${action.cout} MP` : "Prêt"}</span></span><span className="mt-2 block text-xs leading-tight text-white">{action.nom}</span><span className="mt-1 block text-[9px] text-white/50">{action.cooldown ? `Recharge ${action.cooldown}s` : "Sans recharge"}</span></button>;
                      })}
                    </div>
                    <p className="mt-2 text-center text-[10px] tracking-wide text-white/45">Raccourcis clavier : 1 · 2 · 3 · 4</p>
                  </section>

                  <section className="mt-4 grid gap-3 pb-6 md:grid-cols-[1fr_auto]">
                    <div className="max-h-36 overflow-y-auto rounded-2xl border border-white/10 bg-black/45 p-3">
                      <h3 className="text-[.62rem] font-bold tracking-[.3em] text-[#f6d98a]/80 uppercase">Journal de combat</h3>
                      <ul className="mt-2 space-y-1 text-xs text-white/75">{combat.journal.map((ligne, index) => <li key={`${index}-${ligne}`}>{ligne}</li>)}</ul>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-[#f6d98a]/25 bg-black/45 p-3 text-center">
                      <span className="rounded-full bg-[#f6d98a]/10 px-3 py-2 text-xs text-[#f6d98a]">XP {combat.xp}</span>
                      <span className="rounded-full bg-[#f6d98a]/10 px-3 py-2 text-xs text-[#f6d98a]">✦ Bénédictions {combat.benedictions}</span>
                    </div>
                  </section>

                  {(combat.victoire || combat.defaite) ? <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"><motion.div initial={{ scale: .8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-xl rounded-3xl border border-[#f6d98a] bg-[#100c08] p-7 text-center shadow-[0_0_70px_rgba(246,217,138,.3)]"><p className="text-4xl">{combat.victoire ? "🏆" : "🛡️"}</p><h2 className="mt-3 font-serif text-3xl text-[#ffe7a8]">{combat.victoire ? `VICTOIRE ÉPIQUE DE L’${rituel.faction === "lumiere" ? "ALLIANCE" : "ABÎME"}` : "LE HÉROS EST À TERRE"}</h2><p className="mt-3 text-white/80">{combat.victoire ? "+250 XP · +100 Points de Bénédiction Divine" : "La Plaine de Proelium attend votre revanche."}</p><div className="mt-6 flex flex-wrap justify-center gap-3"><button type="button" onClick={combatSuivant} className="rounded-xl bg-gradient-to-b from-[#fff1c2] to-[#b8860b] px-5 py-3 font-bold text-[#211608]">{combat.victoire ? "Combat suivant" : "Recommencer"}</button><button type="button" onClick={() => { setRituel(null); setCombat(null); }} className="rounded-xl border border-[#f6d98a]/50 px-5 py-3 text-[#f6d98a]">Retour au Sanctuaire</button></div></motion.div></div> : null}
                </div>
              );
            })()}
          </motion.main>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
