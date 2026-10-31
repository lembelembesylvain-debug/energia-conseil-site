```typescript
export interface Skill {
name: string;
cost: string;
cooldown: string;
range: string;
description: string;
}

export interface Character {
id: string;
name: string;
title: string;
faction: 'lumiere' | 'tenebres';
element: string;
elementColor: string;
role: string;
baseClass: string;
weapon: string;
relic: string;
image: string;
stats: {
hp: number;
armor: number;
mana: number;
power: number;
speed: number;
};
passive: {
name: string;
description: string;
};
skills: Skill[];
}

stats: { hp: 90, armor: 85, mana: 40, power: 99, speed: 65 },
passive: {
name: 'Les Sept Tresses Solaires',
description: 'Gagne +8% d’attaque et +5% critique par tranche de 10% de PV manquants.'
},
skills: [
{ name: 'Impact des Piliers', cost: '50 Furie', cooldown: '7s', range: 'Mêlée AoE', description: 'Écrase sa masse au sol, provoquant une explosion solaire dévastatrice.' },
{ name: 'Cri du Nazaréat', cost: '30 Furie', cooldown: '18s', range: 'Zone 10m', description: 'Rugissement brisant tous les contrôles et apeurant les ennemis proches.' },
{ name: 'Brasier du Martyre', cost: '20% PV', cooldown: '80s', range: 'Personnel', description: 'S’embrase : impossible à tuer pendant 12s, dégâts et vitesse augmentés de 50%.' }
]
},
{
id: 'marie',
name: 'Marie',
title: 'La Reine de Grâce Immaculée',
faction: 'lumiere',
element: 'Lumière Pure',
elementColor: '#FBBF24',
role: 'Grande Prêtresse / Guérisseuse Cosmique',
baseClass: 'Thaumaturge Céleste',
weapon: 'Voile Sacré de Miséricorde',
relic: 'Le Diadème des Douze Étoiles d’Or',
image: '/marie.jpg',
stats: { hp: 75, armor: 70, mana: 100, power: 65, speed: 70 },
passive: {
name: 'L’Étoile du Matin',
description: 'Réduit les dégâts de Ténèbres subis de 25% et booste les soins du groupe de 20%.'
},
skills: [
{ name: 'Manteau de Miséricorde', cost: '80 MP', cooldown: '10s', range: '30m', description: 'Bouclier divin absorbant 6 500 dégâts et purgeant les altérations.' },
{ name: 'Plénitude de Grâce', cost: '150 MP', cooldown: '30s', range: 'Zone 20m', description: 'Vague d’or réparatrice rendant 35% PV max aux alliés.' },
{ name: 'Éclat du Magnificat', cost: '210 MP', cooldown: '90s', range: 'Zone 30m', description: 'Aveugle les ennemis et ressuscite jusqu’à 2 alliés tombés avec 80% PV/MP.' }
]
},
{
id: 'esther',
name: 'Esther',
title: 'La Souveraine des Frimas',
faction: 'lumiere',
element: 'Glace Royale',
elementColor: '#67E8F9',
role: 'Mage de Contrôle / Cryomancienne Diplomate',
baseClass: 'Cryomancienne Impériale',
weapon: 'Sceptre d’Or Givré',
relic: 'Le Diadème d’Hiver Impérial',
image: '/esther.jpg',
stats: { hp: 72, armor: 65, mana: 98, power: 85, speed: 75 },
passive: {
name: 'Majesté Imperturbable',
description: 'Insensible au gel et au charme. +18% de pénétration magique pour le groupe.'
},
skills: [
{ name: 'Décret du Silence Givré', cost: '85 MP', cooldown: '14s', range: '28m', description: 'Rayon de givre royal réduisant la cible au silence et gelant son mana.' },
{ name: 'Muraille de Marbre Hivernal', cost: '115 MP', cooldown: '26s', range: '22m', description: 'Rempart de stalagmites bloquant le passage et les projectiles ennemis.' },
{ name: 'Banquet Pourpre de Shushan', cost: '175 MP', cooldown: '65s', range: 'Zone 18m', description: 'Blizzard impérial enfermant les ennemis dans des cercueils de cristal de glace.' }
]
},
{
id: 'debora',
name: 'Débora',
title: 'La Prophétesse de l’Éclair',
faction: 'lumiere',
element: 'Foudre Céleste',
elementColor: '#818CF8',
role: 'Archère de Combat / Tireuse d’Élite',
baseClass: 'Chasseresse du Thabor',
weapon: 'Arc d’Éclair & Lance du Thabor',
relic: 'Le Palmier Prophétique',
image: '/debora.jpg',
stats: { hp: 76, armor: 68, mana: 82, power: 94, speed: 90 },
passive: {
name: 'Vision sous le Palmier',
description: 'Révèle tous les ennemis camouflés à 30m et confère +15% de portée d’attaque.'
},
skills: [
{ name: 'Flèche du Jugement', cost: '65 Énergie', cooldown: '6s', range: '42m', description: 'Javeline de foudre traversant les lignes et sautant sur 3 cibles secondaires.' },
{ name: 'L’Orage du Mont Thabor', cost: '120 Énergie', cooldown: '32s', range: 'Zone 14m', description: 'Dôme ionisé infligeant des décharges continues et des micro-paralysies.' },
{ name: 'Torrent Déferlant du Qishon', cost: '155 Énergie', cooldown: '65s', range: 'Ligne 25m', description: 'Balaye les armées, détruit les montures et foudroie les ennemis.' }
]
},
{
id: 'eve',
name: 'Ève',
title: 'La Mère des Vivants',
faction: 'lumiere',
element: 'Souffle de Vie / Éther',
elementColor: '#10B981',
role: 'Invocatrice Primordiale / Protectrice',
baseClass: 'Matriarche d’Éden',
weapon: 'Rameau Vivant de l’Arbre de Vie',
relic: 'La Sphère d’Harmonie Éthérée',
image: '/eve.jpg',
stats: { hp: 80, armor: 72, mana: 95, power: 75, speed: 78 },
passive: {
name: 'Matrice des Vivants',
description: 'Applique un bouclier impénétrable de 3s à un allié recevant un coup fatal.'
},
skills: [
{ name: 'Racines de Réconciliation', cost: '85 MP', cooldown: '12s', range: '24m', description: 'Lianes immobilisant les ennemis et drainant leur mana pour les alliés.' },
{ name: 'Esprit du Cerf d’Éther', cost: '130 MP', cooldown: '40s', range: 'Invocation', description: 'Invoque un cerf céleste chargeant les lignes et régénérant PV/MP.' },
{ name: 'Renaissance Primordiale', cost: '190 MP', cooldown: '85s', range: 'Zone 22m', description: 'Restaure 45% PV/MP et confère une barrière végétale absorbant 5 000 dégâts.' }
]
},// ==========================================
// L'ABÎME DES TÉNÈBRES (8 ANTAGONISTES)
// ==========================================
{
id: 'pharaon',
name: 'Pharaon',
title: 'L’Oppresseur du Nil Écarlate',
faction: 'tenebres',
element: 'Eau Sanglante',
elementColor: '#EF4444',
role: 'Seigneur des Fléaux / Warlock Hydro-Sanguin',
baseClass: 'Tyran Fluvial',
weapon: 'Fouet d’Or Fléau & Trident',
relic: 'Le Trident du Nil Écarlate',
image: '/pharaon.jpg',
stats: { hp: 78, armor: 72, mana: 95, power: 98, speed: 65 },
passive: {
name: 'Cœur Endurci',
description: 'Plus Pharaon subit de dégâts, plus sa puissance des fléaux augmente (jusqu’à +35%).'
},
skills: [
{ name: 'Crues du Nil Écarlate', cost: '105 MP', cooldown: '14s', range: 'Ligne 28m', description: 'Lame de fond d’eau putride corrodant l’armure et infligeant des hémorragies.' },
{ name: 'Nuée de Sauterelles Sombres', cost: '135 MP', cooldown: '28s', range: 'Zone 15m', description: 'Essaim dévorant le mana des ennemis et bloquant leur vision.' },
{ name: 'Fléau des Premiers-Nés', cost: '200 MP', cooldown: '75s', range: 'Cible unique', description: 'Malédiction absolue exécutant toute cible sous 20% de PV.' }
]
},
{
id: 'cain',
name: 'Caïn',
title: 'Le Vagabond du Sang Premier',
faction: 'tenebres',
element: 'Terre Maudite',
elementColor: '#78350F',
role: 'Assassin Faucheur / Exécuteur',
baseClass: 'Faucheur de Nod',
weapon: 'Faux d’Acier Noir & Dague',
relic: 'La Marque de Sang Indélébile',
image: '/cain.jpg',
stats: { hp: 76, armor: 68, mana: 60, power: 100, speed: 94 },
passive: {
name: 'Vengeance Septuple',
description: 'Renvoie 25% des dégâts subis sous forme de blessures de sang pur.'
},
skills: [
{ name: 'Moisson Fratricide', cost: '40 Énergie', cooldown: '5s', range: 'Mêlée', description: 'Coup de faux lacérant infligeant d’immenses dégâts aux cibles isolées.' },
{ name: 'Ombre de la Terre de Nod', cost: '55 Énergie', cooldown: '15s', range: 'Téléportation', description: 'Se fond dans le sol stérile pour réapparaître dans le dos de sa victime.' },
{ name: 'Cri du Sang d’Abel', cost: '90 Énergie', cooldown: '60s', range: 'Zone 16m', description: 'Fait jaillir le sang de la terre, immobilisant et terrorisant les ennemis.' }
]
},
{
id: 'goliath',
name: 'Goliath',
title: 'Le Titan d’Airain',
faction: 'tenebres',
element: 'Pierre Lourde / Airain',
elementColor: '#9CA3AF',
role: 'Juggernaut Implacable / Démolisseur',
baseClass: 'Colosse des Rephaïm',
weapon: 'Lance Titanesque de Gath',
relic: 'Le Pavois de Bronze Massif',
image: '/goliath.jpg',
stats: { hp: 100, armor: 100, mana: 35, power: 95, speed: 40 },
passive: {
name: 'Présence Écrasante',
description: 'Réduit l’attaque physique de tous les ennemis proches de 20% par sa seule stature.'
},
skills: [
{ name: 'Choc de Pavois d’Airain', cost: '35 Rage', cooldown: '8s', range: 'Cône 6m', description: 'Frappe de bouclier étourdissant les cibles et brisant les gardes.' },
{ name: 'Empalement Titanesque', cost: '50 Rage', cooldown: '16s', range: 'Ligne 12m', description: 'Projette sa lance de bronze, embrochant jusqu’à 3 adversaires.' },
{ name: 'Séisme de la Vallée d’Éla', cost: '90 Rage', cooldown: '65s', range: 'Zone 20m', description: 'Saute et s’écrase au sol, créant un cratère qui attire et renverse les ennemis.' }
]
},
{
id: 'nimrod',
name: 'Nimrod',
title: 'Le Bâtisseur Sacrilège',
faction: 'tenebres',
element: 'Feu Infernal / Magma',
elementColor: '#DC2626',
role: 'Pyromancien de Siège / Artilleur Tellurique',
baseClass: 'Tyran Volcanique',
weapon: 'Arc de Magma Titanesque & Marteau',
relic: 'Le Marteau de la Tour de Babel',
image: '/nimrod.jpg',
stats: { hp: 80, armor: 75, mana: 85, power: 100, speed: 65 },{ name: 'Massacre de la Lignée', cost: '90 Rage', cooldown: '65s', range: 'Personnel', description: 'Déchaîne une tempête de fer : vitesse décuplée et chaque coup réinitialise le CD.' }
]
},
{
id: 'jezabel',
name: 'Jézabel',
title: 'La Reine des Miasmes',
faction: 'tenebres',
element: 'Miasme & Brume Corruptrice',
elementColor: '#065F46',
role: 'Nécromancienne / Sorcière de Baal',
baseClass: 'Grande Sorcière de Baal',
weapon: 'Miroir d’Envoûtement de Baal',
relic: 'Les Aiguilles Maudites d’Ombre',
image: '/jezabel.jpg',
stats: { hp: 70, armor: 62, mana: 98, power: 95, speed: 70 },
passive: {
name: 'L’Infamie Immortelle',
description: 'À sa mort, explose en un nuage toxique infligeant 600 dégâts et aveuglant pendant 8s.'
},
skills: [
{ name: 'Aiguilles Corruptrices', cost: '75 MP', cooldown: '7s', range: '26m', description: 'Projette 3 aiguilles spectrales empoisonnant la cible et drainant sa vitesse.' },
{ name: 'Miroir de Faux Témoignage', cost: '120 MP', cooldown: '25s', range: 'Cible unique', description: 'Retourne les dégâts de la cible contre ses propres alliés pendant 4s.' },
{ name: 'Festin des Molosses Spectraux', cost: '185 MP', cooldown: '65s', range: 'Zone 18m', description: 'Invoque une meute de chiens spectraux dévorant les ennemis et soignant Jézabel.' }
]
}
];

passive: {
name: 'Défi Céleste',
