// All static game data: creator options, weapons, breathing styles, ranks, locations.

export const SKIN = ['#ffe6d5', '#f9d4b8', '#f0c29e', '#dda67f', '#c08a60', '#97653f', '#6e452b', '#4f301e'];
export const HAIR_COLORS = ['#1b1416', '#3a2622', '#6b3f2a', '#a8653a', '#e0b45a', '#f3e2b0', '#f2f2f2', '#9aa3b5',
  '#c0303a', '#ff7aa8', '#7a4bd1', '#2f5fd0', '#3cb6c8', '#3e9a5a', '#8ad6b0', '#ff8c2e'];
export const EYE_COLORS = ['#b3262e', '#7a1f3d', '#e08a1e', '#f0c23a', '#3c8be0', '#76c6f0', '#2fa58a', '#8fe3c0',
  '#8a5ad6', '#d65aa8', '#6b4a35', '#2b2b2b', '#c9d4e8'];
export const CLOTH_COLORS = ['#1d2233', '#0f0f12', '#3a2f4f', '#5a1e2a', '#1f4a3a', '#2a4f86', '#f2efe6', '#c8b28a',
  '#2f8f5b', '#e0b13a', '#e05a8a', '#9b6cd6', '#d8452f', '#ff9a3c', '#6fc3e0', '#7a7f8a'];
export const METAL_COLORS = ['#d9a83a', '#c0c6cf', '#2a2a2e', '#b3262e', '#7a4bd1', '#e05a8a', '#3cb6c8', '#f2efe6'];

const o = (id, name) => ({ id, name });

export const FACE = [o('oval', 'Oval'), o('round', 'Round'), o('sharp', 'Sharp'), o('square', 'Square')];
export const EYES = [o('round', 'Sparkly'), o('sharp', 'Sharp'), o('gentle', 'Gentle'), o('fierce', 'Fierce'),
  o('sleepy', 'Sleepy'), o('happy', 'Happy'), o('wide', 'Wide')];
export const BROWS = [o('soft', 'Soft'), o('thick', 'Thick'), o('worried', 'Worried'), o('angry', 'Determined'),
  o('dots', 'Dot brows'), o('thin', 'Thin')];
export const NOSE = [o('line', 'Line'), o('dot', 'Dot'), o('button', 'Button'), o('sharp', 'Pointed'), o('none', 'None')];
export const MOUTH = [o('smile', 'Smile'), o('grin', 'Big grin'), o('fang', 'Fang smile'), o('cat', 'Cat smile'),
  o('neutral', 'Calm'), o('o', 'Surprised'), o('frown', 'Serious'), o('smirk', 'Smirk')];
export const EARS = [o('normal', 'Normal'), o('small', 'Small'), o('big', 'Big'), o('pointed', 'Pointed')];
export const EARRINGS = [o('none', 'None'), o('hanafuda', 'Sun cards'), o('hoops', 'Hoops'), o('studs', 'Studs'),
  o('tassel', 'Tassels'), o('crystal', 'Crystals')];
export const SCARS = [o('none', 'None'), o('forehead', 'Forehead burn'), o('cheek', 'Cheek slash'),
  o('eye', 'Across eye'), o('cross', 'Cross scar'), o('nose', 'Nose bridge'), o('chin', 'Chin nick')];
export const MARKS = [o('none', 'None'), o('beauty', 'Beauty mark'), o('freckles', 'Freckles'),
  o('flameMark', 'Slayer Mark: flame'), o('vineMark', 'Slayer Mark: vines'), o('moon', 'Moon birthmark'),
  o('star', 'Star birthmark'), o('paint', 'Eye paint')];
export const HAIR = [o('spiky', 'Spiky'), o('wild', 'Wild mane'), o('neat', 'Side swept'), o('long', 'Long straight'),
  o('ponytail', 'High ponytail'), o('side', 'Side ponytail'), o('braids', 'Twin braids'), o('bob', 'Bob'), o('bun', 'Bun')];
export const ACCESSORY = [o('none', 'None'), o('foxMask', 'Fox mask'), o('ribbon', 'Ribbon'), o('butterfly', 'Butterfly clips'),
  o('headband', 'Jewel headband'), o('flower', 'Flower pin')];
export const SPECIES = [o('human', 'Human'), o('mouse', 'Muscle Mouse'), o('boar', 'Boar Mask')];
export const BODY = [o('masc', 'Masculine'), o('fem', 'Feminine')];
export const FUR = ['#bdb6c4', '#e8e4ec', '#8a7a6a', '#6b4a35', '#4a4048', '#d8b48a'];
export const BUILD = [o('slim', 'Slim'), o('regular', 'Regular'), o('strong', 'Strong')];
export const HEIGHT = [o('short', 'Short'), o('medium', 'Medium'), o('tall', 'Tall')];
export const UNIFORM = [o('corps', 'Corps uniform'), o('open', 'Open collar'), o('kimono', 'Kimono'),
  o('training', 'Training gi'), o('vest', 'Sleeveless'), o('bare', 'Bare chest + fur pelt')];
export const PANTS = [o('hakama', 'Wide hakama'), o('fitted', 'Fitted + leg wraps'), o('skirt', 'Pleated skirt')];
export const SHOES = [o('tabi', 'Tabi + sandals'), o('boots', 'Boots'), o('zori', 'Straw sandals')];
export const HAORI = [o('none', 'No haori'), o('plain', 'Plain'), o('checkered', 'Checkered'), o('split', 'Two halves'),
  o('hexagon', 'Hexagon'), o('triangles', 'Triangles'), o('flames', 'Flame hem'), o('butterfly', 'Butterfly wings'),
  o('waves', 'Waves'), o('dots', 'Polka dots')];

// Outfit library: one tap sets a whole look inspired by famous slayers.
export const OUTFIT_PRESETS = [
  { name: 'Water Checkered', note: 'Tanjiro style', set: { uniform: 'corps', uniformColor: '#1d2233', haori: 'checkered', haoriColor: '#2f8f5b', haoriColor2: '#0f0f12', pants: 'fitted', shoes: 'tabi' } },
  { name: 'Thunder Triangles', note: 'Zenitsu style', set: { uniform: 'corps', uniformColor: '#1d2233', haori: 'triangles', haoriColor: '#e0b13a', haoriColor2: '#f2efe6', pants: 'fitted', shoes: 'tabi' } },
  { name: 'Flame Hashira', note: 'Rengoku style', set: { uniform: 'corps', uniformColor: '#1d2233', haori: 'flames', haoriColor: '#f2efe6', haoriColor2: '#d8452f', pants: 'hakama', shoes: 'boots' } },
  { name: 'Butterfly', note: 'Shinobu style', set: { uniform: 'corps', uniformColor: '#1d2233', haori: 'butterfly', haoriColor: '#9b6cd6', haoriColor2: '#6fc3e0', pants: 'fitted', shoes: 'boots' } },
  { name: 'Half & Half', note: 'Giyu style', set: { uniform: 'corps', uniformColor: '#1d2233', haori: 'split', haoriColor: '#5a1e2a', haoriColor2: '#2f8f5b', pants: 'hakama', shoes: 'tabi' } },
  { name: 'Mist', note: 'Muichiro style', set: { uniform: 'corps', uniformColor: '#1d2233', haori: 'none', pants: 'hakama', shoes: 'tabi' } },
  { name: 'Love', note: 'Mitsuri style', set: { uniform: 'open', uniformColor: '#1d2233', haori: 'plain', haoriColor: '#f2efe6', haoriColor2: '#f2efe6', pants: 'skirt', shoes: 'boots' } },
  { name: 'Wind', note: 'Sanemi style', set: { uniform: 'open', uniformColor: '#1d2233', haori: 'plain', haoriColor: '#f2efe6', haoriColor2: '#f2efe6', pants: 'hakama', shoes: 'tabi' } },
  { name: 'Hemp Kimono', note: 'Nezuko style', set: { uniform: 'kimono', uniformColor: '#e05a8a', haori: 'plain', haoriColor: '#5a1e2a', haoriColor2: '#5a1e2a', pants: 'hakama', shoes: 'zori' } },
  { name: 'Flower', note: 'Kanao style', set: { uniform: 'corps', uniformColor: '#1d2233', haori: 'plain', haoriColor: '#f2efe6', haoriColor2: '#f2efe6', pants: 'skirt', shoes: 'boots' } },
  { name: 'Sound', note: 'Tengen style', set: { uniform: 'vest', uniformColor: '#1d2233', haori: 'none', pants: 'hakama', shoes: 'boots' } },
  { name: 'Boar Pelt', note: 'Inosuke style', set: { uniform: 'bare', haori: 'none', pants: 'hakama', uniformColor: '#2a2f45', shoes: 'tabi' } },
  { name: 'Mountain Trainee', note: 'Training gear', set: { uniform: 'training', uniformColor: '#f2efe6', haori: 'none', pants: 'hakama', shoes: 'zori' } },
];

export const DEFAULT_LOOK = {
  species: 'human', body: 'masc', furColor: '#bdb6c4',
  skin: '#f9d4b8', face: 'oval', eyes: 'round', eyeColor: '#b3262e', eyeColor2: '', brows: 'soft', nose: 'line',
  mouth: 'smile', ears: 'normal', earrings: 'none', earringColor: '#d9a83a', scar: 'none', mark: 'none', blush: true,
  hair: 'spiky', hairColor: '#3a2622', hairTip: '', accessory: 'none', accColor: '#e05a8a',
  build: 'regular', height: 'medium', uniform: 'corps', uniformColor: '#1d2233', pants: 'fitted', shoes: 'tabi',
  haori: 'checkered', haoriColor: '#2f8f5b', haoriColor2: '#0f0f12',
};

// pow: damage multiplier, spd: speed (crit + who strikes first), crit: base crit chance.
// extra: bonus hit on a basic strike. trait: special basic-strike effect.
export const WEAPONS = [
  { id: 'katana', name: 'Nichirin Katana', pow: 1.0, spd: 1.0, crit: 0.08, desc: 'The classic slayer blade. Balanced in every way.' },
  { id: 'dual', name: 'Twin Katanas', pow: 0.75, spd: 1.2, crit: 0.1, extra: 0.5, desc: 'Two blades: every strike hits twice.' },
  { id: 'jagged', name: 'Jagged Twin Blades', pow: 0.8, spd: 1.15, crit: 0.16, extra: 0.45, desc: 'Chipped, saw-toothed blades. Wild and lucky.' },
  { id: 'whip', name: 'Whip Sword', pow: 0.85, spd: 1.3, crit: 0.12, desc: 'Paper-thin and bendy. Lashes from any angle.' },
  { id: 'needle', name: 'Needle Blade', pow: 0.6, spd: 1.4, crit: 0.2, trait: 'poison', desc: 'Thin stinger tip that leaves wisteria poison.' },
  { id: 'cleavers', name: 'Chained Cleavers', pow: 1.15, spd: 0.95, crit: 0.1, extra: 0.4, desc: 'Two huge cleavers joined by a chain. Flashy!' },
  { id: 'flail', name: 'Flail & Axe', pow: 1.5, spd: 0.7, crit: 0.06, trait: 'stun', desc: 'A spiked ball and hand axe on a chain. Very heavy.' },
  { id: 'morningstar', name: 'Morning Star', pow: 1.35, spd: 0.8, crit: 0.07, trait: 'stun', desc: 'A spiked mace. Big hits can stun.' },
  { id: 'spear', name: 'Nichirin Spear', pow: 1.1, spd: 1.0, crit: 0.1, desc: 'Long reach, steady damage.' },
  { id: 'shuriken', name: 'Ninja Stars', pow: 0.7, spd: 1.35, crit: 0.18, trait: 'sure', desc: 'Thrown stars never miss, even dodging demons.' },
];
export const GUARDS = [o('round', 'Round'), o('flower', 'Flower'), o('square', 'Square'), o('flame', 'Flame'),
  o('butterfly', 'Butterfly'), o('hexagon', 'Hexagon'), o('none', 'None')];
export const ENGRAVINGS = [o('none', 'None'), o('metsu', '悪鬼滅殺 Destroy all demons'), o('kokoro', '心 Heart'),
  o('hono', '炎 Flame'), o('mizu', '水 Water'), o('custom', 'My initial')];
export const DEFAULT_WEAPON = { type: 'katana', blade: 'auto', guard: 'round', guardColor: '#d9a83a', wrap: '#2a4f86', engraving: 'none' };

// Breathing styles. Forms unlock one per rank (form 1 at Mizunoto).
// fx: guard | burn | stun | poison | evade | pierce | crit | heal | focus
const f = (name, mult, cost, hits = 1, fx = null, chance = 1) => ({ name, mult, cost, hits, fx, chance });
export const BREATHING = {
  water: { name: 'Water', color: '#3aa0ff', blade: '#2f6fe0', desc: 'Flowing and calm. Strong defence.', forms: [
    f('Water Surface Slash', 1.5, 10), f('Water Wheel', 1.3, 12, 1, 'guard'), f('Flowing Dance', 0.8, 14, 2, 'evade'),
    f('Striking Tide', 0.6, 16, 3), f('Waterfall Basin', 2.0, 20), f('Constant Flux', 0.55, 26, 5)] },
  flame: { name: 'Flame', color: '#ff6a2a', blade: '#e0401f', desc: 'Burning power. Sets demons on fire.', forms: [
    f('Unknowing Fire', 1.6, 10), f('Rising Scorching Sun', 1.3, 12, 1, 'burn'), f('Blazing Universe', 1.9, 16),
    f('Blooming Flame Undulation', 1.2, 14, 1, 'guard'), f('Flame Tiger', 2.0, 22, 1, 'burn'), f('Purgatory', 2.8, 30)] },
  thunder: { name: 'Thunder', color: '#ffd23a', blade: '#e6b800', desc: 'Lightning fast. Huge critical hits.', forms: [
    f('Thunderclap and Flash', 1.8, 12, 1, 'crit'), f('Rice Spirit', 0.4, 14, 4), f('Thunder Swarm', 0.6, 14, 3, 'stun', 0.3),
    f('Distant Thunder', 1.6, 14, 1, 'crit'), f('Heat Lightning', 2.0, 20), f('Sixfold', 0.45, 26, 6, 'crit')] },
  wind: { name: 'Wind', color: '#5fe0a0', blade: '#2fb070', desc: 'Wild gusts that slash many times.', forms: [
    f('Dust Whirlwind Cutter', 1.5, 10), f('Purifying Wind Claws', 0.6, 14, 3), f('Clean Storm Wind Tree', 1.4, 14, 1, 'evade'),
    f('Rising Dust Storm', 1.9, 18), f('Cold Mountain Wind', 2.1, 22), f('Black Wind Mountain Mist', 0.7, 28, 4)] },
  stone: { name: 'Stone', color: '#b89a7a', blade: '#8a7a6a', desc: 'Slow but mighty. Can stun demons.', forms: [
    f('Serpentinite Bipolar', 1.7, 12), f('Upper Smash', 1.4, 14, 1, 'stun', 0.45), f('Stone Skin', 1.0, 12, 1, 'guard'),
    f('Volcanic Rock', 2.2, 20), f('Arcs of Justice', 2.6, 28, 1, 'stun', 0.3), f('Mountain Crush', 3.0, 34)] },
  mist: { name: 'Mist', color: '#c8d6f0', blade: '#9fb4d8', desc: 'Hard to hit. Confuse and dodge.', forms: [
    f('Low Clouds, Distant Haze', 1.5, 10), f('Eight-Layered Mist', 0.45, 14, 4), f('Scattering Mist Splash', 1.3, 12, 1, 'evade'),
    f('Sea of Clouds', 1.9, 18), f('Lunar Dispersing Mist', 2.1, 22), f('Obscuring Clouds', 2.4, 28, 1, 'evade')] },
  insect: { name: 'Insect', color: '#b98cff', blade: '#9a6ae0', desc: 'Tiny stings full of wisteria poison.', forms: [
    f('Butterfly Dance: Caprice', 1.0, 10, 1, 'poison'), f('Bee Sting: True Flutter', 1.3, 12, 1, 'poison'),
    f('Dragonfly: Compound Eye', 0.35, 16, 6, 'poison', 0.5), f('Centipede: Zigzag', 1.6, 16, 1, 'poison'),
    f('Wasp Sting', 1.9, 20, 1, 'poison'), f('Butterfly Swarm', 0.6, 26, 5, 'poison', 0.4)] },
  love: { name: 'Love', color: '#ff8cc6', blade: '#ff6aa8', desc: 'Bendy, joyful slashes in a flurry.', forms: [
    f('Shivers of First Love', 1.5, 10), f('Love Pangs', 0.4, 14, 4), f('Catlove Shower', 0.65, 14, 3),
    f('Swaying Love', 1.9, 18), f('Cat-Legged Love', 2.1, 22), f('Heart Flurry', 0.5, 28, 6)] },
  serpent: { name: 'Serpent', color: '#8a6ad6', blade: '#6a4ab0', desc: 'Twisting strikes that ignore armour.', forms: [
    f('Winding Serpent Slash', 1.5, 10, 1, 'pierce'), f('Venom Fangs', 1.3, 12, 1, 'poison'), f('Coil Choke', 1.2, 14, 1, 'stun', 0.4),
    f('Twin-Headed Reptile', 1.0, 18, 2, 'pierce'), f('Slithering Serpent', 2.2, 22, 1, 'pierce'), f('Serpent Storm', 0.7, 28, 4, 'pierce')] },
  sound: { name: 'Sound', color: '#e0b13a', blade: '#c08a20', desc: 'Explosive rhythm that rattles demons.', forms: [
    f('Roar', 1.7, 12), f('Resounding Slashes', 0.5, 14, 4), f('String Performance', 1.4, 14, 1, 'stun', 0.4),
    f('Booming Drums', 1.9, 18), f('Musical Score', 1.2, 16, 1, 'crit'), f('Finale', 2.6, 30)] },
  flower: { name: 'Flower', color: '#ff9ab8', blade: '#ff7a9a', desc: 'Graceful and precise. Lucky crits.', forms: [
    f('Peony of Futility', 1.6, 10, 1, 'crit'), f('Crimson Hanagoromo', 1.4, 12), f('Whirling Peach', 0.6, 14, 3),
    f('Equinox Eye', 1.0, 12, 1, 'focus'), f('Plum Blossom', 2.0, 20, 1, 'crit'), f('Hundred Petals', 0.4, 26, 7)] },
  beast: { name: 'Beast', color: '#7ab0d0', blade: '#5a7a90', desc: 'Self-taught chaos. Rip and tear!', forms: [
    f('Pierce', 1.5, 10), f('Crunch Fang', 0.9, 14, 2), f('Rip and Tear', 0.6, 14, 3, 'crit'),
    f('Spatial Awareness', 1.2, 12, 1, 'evade'), f('Crazy Cutting', 0.4, 22, 6), f('Sudden Throw', 2.4, 26)] },
};

export const RANKS = [
  { name: 'Trainee', kanji: '修', xp: 0 },
  { name: 'Mizunoto', kanji: '癸', xp: 0 },
  { name: 'Mizunoe', kanji: '壬', xp: 60 },
  { name: 'Kanoto', kanji: '辛', xp: 160 },
  { name: 'Kanoe', kanji: '庚', xp: 320 },
  { name: 'Tsuchinoto', kanji: '己', xp: 550 },
  { name: 'Tsuchinoe', kanji: '戊', xp: 850 },
  { name: 'Hinoto', kanji: '丁', xp: 1250 },
  { name: 'Hinoe', kanji: '丙', xp: 1750 },
  { name: 'Kinoto', kanji: '乙', xp: 2400 },
  { name: 'Kinoe', kanji: '甲', xp: 3200 },
  { name: 'Hashira', kanji: '柱', xp: 4500 },
];
// Chapter 1 (the forest) caps progress at this rank.
export const CHAPTER1_RANK_CAP = 4;
export const TRAINING_TO_CHOOSE_BREATHING = 2;
export const TRAINING_FOR_SELECTION = 4;

export const REGIONS = [
  { id: 'forest', name: 'The Forest', desc: 'Your home in the mountains.', open: true },
  { id: 'town', name: 'Small Town', desc: 'A quiet town with a few people, and whispers of demons at night.', open: false },
  { id: 'city', name: 'The City', desc: 'Busy streets and lantern-lit alleys.', open: false },
  { id: 'metro', name: 'The Metropolis', desc: 'Where the strongest demons hide.', open: false },
];

// Difficulty scales demons. artEvery = how often (in turns) a demon uses its Blood Demon Art.
export const DIFFICULTY = {
  easy: { name: 'Easy', icon: '🌸', desc: 'Weaker demons that rarely use their Blood Demon Art. Great for younger slayers.', hp: 0.7, atk: 0.65, artEvery: 4, xp: 1 },
  medium: { name: 'Medium', icon: '⚔️', desc: 'The normal challenge. Use your forms wisely!', hp: 1, atk: 1, artEvery: 3, xp: 1 },
  hard: { name: 'Hard', icon: '🔥', desc: 'Tough demons that use Blood Demon Arts often. +20% XP.', hp: 1.3, atk: 1.3, artEvery: 2, xp: 1.2 },
};

export const CROW_NAMES = ['Kaa-chan', 'Kurokane', 'Hoshi', 'Sumi', 'Kurumi', 'Kaa-suke', 'Kuro', 'Soot', 'Pepper', 'Inky', 'Captain Caw',
  'Midnight', 'Tsubasa', 'Kage', 'Feather', 'Matsu', 'Biscuit', 'Shadowwing', 'Kazu', 'Sir Squawk', 'Nori', 'Yoru'];

// Random name parts (original names, not characters from the series).
export const NAMES = {
  family: ['Haruno', 'Kazemaki', 'Tsukishiro', 'Hoshino', 'Mizuhara', 'Akagane', 'Shirasagi', 'Kurobane', 'Morikawa', 'Yukimura',
    'Asagiri', 'Sakuragi', 'Kirishima', 'Hanabusa', 'Takamine', 'Amagumo', 'Hotaruba', 'Ishikawa', 'Kumoi', 'Fujinami'],
  masc: ['Ren', 'Haru', 'Sora', 'Kaito', 'Daichi', 'Ryu', 'Shin', 'Takeru', 'Yuto', 'Kenji', 'Hayate', 'Raiden', 'Jun', 'Akio', 'Tora'],
  fem: ['Hana', 'Yuki', 'Sakura', 'Aoi', 'Mei', 'Rin', 'Kaede', 'Hinata', 'Akari', 'Suzu', 'Tsubaki', 'Momo', 'Ayame', 'Kiku', 'Nana'],
  mouse: ['Mukimuki', 'Chu-taro', 'Squeaks', 'Flex', 'Nibbles', 'Biceps', 'Whiskers', 'Chu-chu', 'Mighty Mo', 'Pip'],
};
