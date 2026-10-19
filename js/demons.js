// Demons: looks, names, Blood Demon Arts, Twelve Kizuki ranks, stock demons, stats and the renderer.
// Looks follow three kinds seen in the series: human-looking, semi-human (horns, fangs, veins) and monstrous.
import { shade } from './avatar.js';

const INK = '#1a1018';
const o = (id, name) => ({ id, name });

/* ---------------- Blood Demon Arts ---------------- */
export const ARTS = {
  none: { name: 'No Blood Demon Art', theme: 'Wild', color: '#8a8a9a', desc: 'No special power. It fights with claws and fangs only.', fx: 'none', mult: 0 },
  thread: { name: 'Thread Snare', theme: 'Thread', color: '#e8e8f8', desc: 'Sharp threads tie you up. You lose your next turn.', fx: 'bind', mult: 0.8 },
  drum: { name: 'Room Shuffle Drum', theme: 'Drum', color: '#d09a5a', desc: 'Spins the whole room. Your attacks may miss.', fx: 'confuse', mult: 0.7 },
  swamp: { name: 'Swamp Dive', theme: 'Swamp', color: '#5a8a4a', desc: 'Sinks into the ground to dodge attacks.', fx: 'hide', mult: 0 },
  thorns: { name: 'Thorn Petals', theme: 'Thorn', color: '#ff5a8a', desc: 'Stinging petals that hurt every turn.', fx: 'poison', mult: 0.6 },
  frost: { name: 'Frost Fog', theme: 'Frost', color: '#9ae0ff', desc: 'Freezing mist that weakens your blows.', fx: 'chill', mult: 0.7 },
  mirror: { name: 'Mirror Copies', theme: 'Mirror', color: '#c8d6f0', desc: 'Fake copies make it hard to hit.', fx: 'hide', mult: 0.5 },
  stone: { name: 'Iron Shell', theme: 'Iron', color: '#9a9aa8', desc: 'Hardens its skin like armour.', fx: 'armor', mult: 0 },
  regrow: { name: 'Rapid Regrowth', theme: 'Root', color: '#6ad66a', desc: 'Heals its wounds super fast.', fx: 'heal', mult: 0 },
  hands: { name: 'Hundred Hands', theme: 'Hand', color: '#d6a86a', desc: 'Grabs at you from everywhere at once.', fx: 'multi', mult: 0.45, hits: 4 },
  moth: { name: 'Ember Moths', theme: 'Moth', color: '#ff9a3c', desc: 'Burning moths that keep stinging.', fx: 'burn', mult: 0.6 },
  scream: { name: 'Echo Scream', theme: 'Echo', color: '#c08aff', desc: 'A scream so loud it can stun you.', fx: 'stun', mult: 0.6, chance: 0.5 },
  shadow: { name: 'Shadow Lunge', theme: 'Shadow', color: '#6a5a9a', desc: 'Leaps out of the shadows for a huge hit.', fx: 'heavy', mult: 1.8 },
  sickles: { name: 'Blood Sickles', theme: 'Sickle', color: '#d83a4a', desc: 'Spinning blood sickles that leave poison.', fx: 'poison', mult: 1.2 },
  sash: { name: 'Obi Sash Dance', theme: 'Sash', color: '#ff7ab8', desc: 'Flowing sashes whip you three times.', fx: 'multi', mult: 0.5, hits: 3 },
  tongue: { name: 'Long Tongue Lash', theme: 'Tongue', color: '#c8505a', desc: 'A stretching tongue that leaves you dizzy.', fx: 'confuse', mult: 0.8 },
};

/* ---------------- Twelve Kizuki ranks ---------------- */
const NUM = ['', '壱', '弐', '参', '肆', '伍', '陸'];
const WORD = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];
export const RANKS_KIZUKI = [o('none', 'No rank'),
  ...[6, 5, 4, 3, 2, 1].map((n) => o(`L${n}`, `Lower Moon ${WORD[n]}`)),
  ...[6, 5, 4, 3, 2, 1].map((n) => o(`U${n}`, `Upper Moon ${WORD[n]}`))];
export function rankInfo(rank) {
  if (!rank || rank === 'none') return null;
  const upper = rank[0] === 'U', n = +rank.slice(1);
  return { upper, n, label: `${upper ? 'Upper' : 'Lower'} Moon ${WORD[n]}`, kanji: [upper ? '上' : '下', NUM[n]],
    mult: upper ? 2.0 + (6 - n) * 0.25 : 1.25 + (6 - n) * 0.1 };
}

/* ---------------- look options ---------------- */
export const DEMON_SKIN = ['#f2ecf4', '#e8e0d8', '#d6c8c0', '#c9c2d6', '#a8a8b8', '#8a8a9a', '#a8b4a0', '#9ab0c8', '#b08ab8', '#c86a6a', '#5a4a6a', '#2a3448'];
export const DEMON_EYE = ['#ff3a3a', '#c0303a', '#ffd23a', '#e8a030', '#7aff7a', '#3ae0ff', '#7ab8d0', '#ff6ad6', '#b06aff', '#ffffff'];
export const DEMON_ROBE = ['#f4f2f0', '#2a1f2f', '#1f2a3a', '#4a1a1a', '#8a2a4a', '#2a3a2a', '#5a7a3a', '#3a3a9a', '#5a4a6a', '#7a8aa0', '#e05a8a', '#2a2e3a'];
export const DEMON_ACCENT = ['#3ab0c8', '#c0303a', '#e8c860', '#ff7ab8', '#e8902a', '#f2efe6', '#3a3a9a', '#1a1018'];
const HAIR_C = ['#1b1416', '#f2f0f4', '#d8c8e0', '#6a3a8a', '#c0303a', '#3a5a3a', '#8ad640', '#e0b45a', '#3a3a5a'];

export const DEMON_OPTS = {
  kind: [o('human', 'Human-looking'), o('semi', 'Semi-human'), o('monster', 'Monstrous')],
  build: [o('slim', 'Slim'), o('hulking', 'Hulking muscle'), o('skinny', 'Skinny & ribbed'), o('armored', 'Armoured spikes'), o('spider', 'Giant spider')],
  head: [o('human', 'Human face'), o('spider', 'Spider face')],
  eyes: [1, 2, 3, 6],
  eyeStyle: [o('slit', 'Slit pupils'), o('ringed', 'Ringed'), o('glow', 'Glowing'), o('blank', 'Blank stare')],
  sclera: [o('white', 'White'), o('black', 'Black'), o('red', 'Red')],
  horns: [o('none', 'None'), o('nubs', 'Small nubs'), o('one', 'One horn'), o('two', 'Two horns'), o('spiral', 'Spiral horns'), o('four', 'Four horns'), o('curly', 'Curly')],
  ears: [o('pointed', 'Pointed'), o('human', 'Human')],
  mouth: [o('closed', 'Closed'), o('fangs', 'Fangs'), o('grin', 'Toothy grin'), o('teeth', 'Snarl'), o('tongue', 'Long tongue'), o('tusks', 'Tusks'), o('stitched', 'Stitched')],
  marks: [o('none', 'None'), o('dots', 'Dot chains'), o('bars', 'Cheek bars'), o('stripes', 'Stripes'), o('flower', 'Flower tattoo'), o('veins', 'Veins'), o('spots', 'Spots'), o('cracks', 'Cracks'), o('swirl', 'Swirl')],
  hair: [o('none', 'None'), o('wild', 'Wild'), o('long', 'Long'), o('veryLong', 'Very long'), o('bob', 'Bob'), o('wavy', 'Wavy over eye'), o('topknot', 'Topknot')],
  arms: [2, 4],
  outfit: [o('robe', 'Tattered robe'), o('kimono', 'Kimono + obi'), o('skirt', 'Striped wrap'), o('baggy', 'Baggy + sash'), o('wrapped', 'Wrapped trousers'), o('loincloth', 'Loincloth')],
  pattern: [o('plain', 'Plain'), o('web', 'Spider web'), o('stripes', 'Stripes'), o('flowers', 'Flowers')],
  feet: [o('bare', 'Bare'), o('zori', 'Sandals'), o('geta', 'Tall geta')],
  extras: [o('drums', 'Body drums'), o('furCollar', 'Fur collar'), o('beads', 'Bead necklace'), o('ropeBelt', 'Rope belt'), o('sashes', 'Flowing sashes'),
    o('armBands', 'Arm bands'), o('spikes', 'Spikes'), o('sickles', 'Blood sickles'), o('veinsBody', 'Body veins'), o('dotTrail', 'Dot trails')],
};

export const DEFAULT_DEMON = {
  kind: 'semi', build: 'slim', head: 'human', skin: '#c9c2d6', eyes: 2, eyeStyle: 'slit', eyeColor: '#ff3a3a', sclera: 'white',
  horns: 'two', hornColor: '#f2efe6', ears: 'pointed', mouth: 'fangs', marks: 'none', markColor: '#c0303a',
  hair: 'wild', hairColor: '#1b1416', arms: 2, nails: '#2a1a20', outfit: 'robe', robe: '#2a1f2f', obi: '#4a1a1a', pattern: 'plain',
  accent: '#3ab0c8', feet: 'bare', extras: [], rank: 'none',
};
// Older saves only had a few fields: fill in the rest.
export const normalizeLook = (l = {}) => ({ ...DEFAULT_DEMON, ...l, extras: Array.isArray(l.extras) ? l.extras : [] });

/* ---------------- random & stock demons ---------------- */
const SYL = ['ka', 'ki', 'ku', 'ro', 'ma', 'shi', 'no', 'ra', 'ze', 'gi', 'mo', 'tsu', 'ya', 'ri', 'ha', 'za', 'do', 'ne', 'ru', 'mi', 'zu', 'ga'];
export function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
}
const pick = (r, a) => a[Math.floor(r() * a.length)];
const ids = (a) => a.map((x) => x.id ?? x);

export function randomName(r) {
  const n = 2 + Math.floor(r() * 2);
  let s = '';
  for (let i = 0; i < n; i++) s += pick(r, SYL);
  return s[0].toUpperCase() + s.slice(1);
}

// Coherent random look for a kind of demon.
export function randomLook(r, kind = pick(r, ['human', 'semi', 'semi', 'monster'])) {
  const L = { ...DEFAULT_DEMON, kind, skin: pick(r, DEMON_SKIN), eyeColor: pick(r, DEMON_EYE), robe: pick(r, DEMON_ROBE), obi: pick(r, DEMON_ROBE),
    hairColor: pick(r, HAIR_C), markColor: pick(r, ['#c0303a', '#6a2a8a', '#2a5a8a', '#1a1018', '#ff7ab8', '#f2efe6']), accent: pick(r, DEMON_ACCENT),
    hornColor: pick(r, ['#f2efe6', '#d8d0c0', '#2a2a2e', '#c0303a', '#8a7a6a']), nails: pick(r, ['#2a1a20', '#3a6a8a', '#6a2a4a', '#2a2a5a']),
    pattern: r() < 0.25 ? pick(r, ['web', 'stripes', 'flowers']) : 'plain', feet: pick(r, ['bare', 'bare', 'zori', 'geta']) };
  if (kind === 'human') {
    Object.assign(L, { build: 'slim', head: 'human', eyes: 2, eyeStyle: pick(r, ['slit', 'ringed']), sclera: r() < 0.3 ? 'black' : 'white', horns: r() < 0.2 ? 'nubs' : 'none',
      ears: r() < 0.5 ? 'human' : 'pointed', mouth: pick(r, ['closed', 'fangs']), marks: pick(r, ['dots', 'bars', 'flower', 'none', 'stripes']),
      hair: pick(r, ['long', 'veryLong', 'bob', 'wavy', 'topknot']), outfit: 'kimono', skin: pick(r, DEMON_SKIN.slice(0, 4)),
      extras: r() < 0.5 ? [pick(r, ['beads', 'furCollar', 'sashes'])] : [] });
  } else if (kind === 'semi') {
    Object.assign(L, { build: pick(r, ['slim', 'skinny', 'hulking']), head: 'human', eyes: pick(r, [2, 2, 3]), eyeStyle: pick(r, ids(DEMON_OPTS.eyeStyle)),
      sclera: pick(r, ['white', 'black', 'red']), horns: pick(r, ['nubs', 'one', 'two', 'spiral', 'curly']), ears: 'pointed',
      mouth: pick(r, ['fangs', 'grin', 'teeth', 'tusks', 'tongue']), marks: pick(r, ids(DEMON_OPTS.marks)), hair: pick(r, ['wild', 'long', 'bob', 'topknot', 'none']),
      outfit: pick(r, ['robe', 'skirt', 'baggy', 'wrapped', 'kimono']), arms: r() < 0.15 ? 4 : 2,
      extras: r() < 0.6 ? [pick(r, ['ropeBelt', 'armBands', 'veinsBody', 'drums', 'dotTrail', 'sickles'])] : [] });
  } else {
    Object.assign(L, { build: pick(r, ['hulking', 'armored', 'spider', 'skinny']), head: r() < 0.4 ? 'spider' : 'human', eyes: pick(r, [1, 3, 6]),
      eyeStyle: pick(r, ['glow', 'slit', 'blank']), sclera: pick(r, ['black', 'red', 'white']), horns: pick(r, ['two', 'four', 'spiral', 'one']), ears: 'pointed',
      mouth: pick(r, ['teeth', 'grin', 'tongue', 'tusks']), marks: pick(r, ['veins', 'cracks', 'spots', 'dots']), hair: pick(r, ['wild', 'long', 'none']),
      outfit: pick(r, ['loincloth', 'baggy', 'robe']), arms: r() < 0.4 ? 4 : 2, skin: pick(r, DEMON_SKIN.slice(4)),
      extras: [pick(r, ['spikes', 'veinsBody', 'dotTrail', 'drums'])] });
  }
  return L;
}

// Ready-made demons (original names; notes say which style they're inspired by).
export const STOCK_DEMONS = [
  { name: 'Shirai', note: 'Spider family sister', art: 'thread', tier: 'weak', look: { kind: 'human', build: 'slim', skin: '#f2ecf4', eyes: 2, eyeStyle: 'ringed', eyeColor: '#7ab8d0', sclera: 'white', horns: 'none', ears: 'human', mouth: 'closed', marks: 'dots', markColor: '#b8202e', hair: 'long', hairColor: '#f2f0f4', outfit: 'kimono', robe: '#f4f2f0', obi: '#f4f2f0', pattern: 'web', accent: '#3ab0c8', nails: '#3a6a8a', feet: 'geta', extras: ['beads'] } },
  { name: 'Itomaru', note: 'Thread child, web kimono', art: 'thread', tier: 'strong', rank: 'L5', look: { kind: 'human', build: 'slim', skin: '#f2ecf4', eyes: 2, eyeStyle: 'ringed', eyeColor: '#c0303a', ears: 'human', horns: 'none', mouth: 'closed', marks: 'dots', markColor: '#b8202e', hair: 'wavy', hairColor: '#d8c8e0', outfit: 'kimono', robe: '#f4f2f0', obi: '#8a2a4a', pattern: 'web', accent: '#c0303a', nails: '#3a6a8a', extras: ['beads'] } },
  { name: 'Kumoha', note: 'Web mother, very long hair', art: 'thread', tier: 'weak', look: { kind: 'human', build: 'slim', skin: '#f2ecf4', eyes: 2, eyeStyle: 'ringed', eyeColor: '#a8b4c0', ears: 'human', horns: 'none', mouth: 'closed', marks: 'dots', markColor: '#b8202e', hair: 'veryLong', hairColor: '#f2f0f4', outfit: 'kimono', robe: '#f4f2f0', obi: '#8a2a5a', pattern: 'flowers', accent: '#3ab0c8', nails: '#3a6a8a', extras: ['beads'] } },
  { name: 'Ashigumo', note: 'Giant spider', art: 'thorns', tier: 'normal', look: { kind: 'monster', build: 'spider', skin: '#c9c2d6', robe: '#5a3a8a', markColor: '#e8902a', eyes: 2, eyeStyle: 'blank', hair: 'wild', hairColor: '#d8c8e0', horns: 'none', mouth: 'teeth' } },
  { name: 'Ogumo', note: 'Spider-faced brute', art: 'shadow', tier: 'strong', look: { kind: 'monster', build: 'hulking', head: 'spider', skin: '#9a9aa8', markColor: '#c0303a', hair: 'long', hairColor: '#f2f0f4', outfit: 'baggy', robe: '#2a2e3a', obi: '#4a4a9a', nails: '#3a6a8a', extras: ['dotTrail'] } },
  { name: 'Kabuto', note: 'Molted armour brute', art: 'stone', tier: 'strong', look: { kind: 'monster', build: 'armored', head: 'spider', skin: '#2a3448', markColor: '#c0303a', hair: 'long', hairColor: '#f2f0f4', outfit: 'loincloth', robe: '#1a1a22', extras: ['spikes'] } },
  { name: 'Tsuzumi', note: 'Drum demon', art: 'drum', tier: 'normal', look: { kind: 'semi', build: 'hulking', skin: '#e8e0d8', eyes: 2, eyeStyle: 'glow', eyeColor: '#ff3a3a', sclera: 'black', horns: 'none', ears: 'pointed', mouth: 'teeth', marks: 'stripes', markColor: '#f2efe6', hair: 'long', hairColor: '#2a2224', outfit: 'skirt', robe: '#5a4a8a', obi: '#1f1a2a', accent: '#c0303a', extras: ['drums', 'ropeBelt', 'veinsBody'] } },
  { name: 'Nameri', note: 'Long-tongue crawler', art: 'tongue', tier: 'weak', look: { kind: 'semi', build: 'skinny', skin: '#8a8a9a', eyes: 3, eyeStyle: 'ringed', eyeColor: '#8ae06a', horns: 'nubs', hornColor: '#d8d0c0', ears: 'pointed', mouth: 'tongue', marks: 'spots', markColor: '#4a3a9a', hair: 'bob', hairColor: '#2a2e4a', outfit: 'loincloth', robe: '#2a4a3a' } },
  { name: 'Fuyuko', note: 'Fur-collar Lower Moon', art: 'mirror', tier: 'normal', rank: 'L4', look: { kind: 'semi', build: 'slim', skin: '#ece6ee', eyes: 2, eyeStyle: 'ringed', eyeColor: '#c0303a', horns: 'spiral', hornColor: '#d8d0d8', ears: 'human', mouth: 'closed', marks: 'bars', markColor: '#c0304a', hair: 'bob', hairColor: '#f2f0f4', outfit: 'kimono', robe: '#8a2a4a', obi: '#3a2a6a', feet: 'geta', extras: ['furCollar'] } },
  { name: 'Hanaobi', note: 'Sash dancer Upper Moon', art: 'sash', tier: 'normal', rank: 'U6', look: { kind: 'human', build: 'slim', skin: '#f6ecea', eyes: 2, eyeStyle: 'slit', eyeColor: '#e8a030', ears: 'human', horns: 'none', mouth: 'fangs', marks: 'flower', markColor: '#c03a8a', hair: 'veryLong', hairColor: '#16121c', outfit: 'kimono', robe: '#2a1a24', obi: '#e05a9a', pattern: 'flowers', accent: '#e8902a', feet: 'geta', extras: ['sashes'] } },
  { name: 'Kamaro', note: 'Blood-sickle Upper Moon', art: 'sickles', tier: 'strong', rank: 'U6', look: { kind: 'semi', build: 'skinny', skin: '#e0dcd6', eyes: 2, eyeStyle: 'slit', eyeColor: '#e8b030', sclera: 'white', horns: 'none', ears: 'pointed', mouth: 'grin', marks: 'spots', markColor: '#1a1018', hair: 'topknot', hairColor: '#8ad640', outfit: 'wrapped', robe: '#7a8aa0', accent: '#a83a2a', extras: ['armBands', 'sickles'] } },
  { name: 'Shizuha', note: 'Before becoming family', art: 'none', tier: 'weak', look: { kind: 'human', build: 'slim', skin: '#f2ecf0', eyes: 2, eyeStyle: 'slit', eyeColor: '#ff6a8a', sclera: 'white', ears: 'human', horns: 'none', mouth: 'closed', marks: 'none', hair: 'bob', hairColor: '#1b1416', outfit: 'kimono', robe: '#6a7a3a', obi: '#e05a7a', feet: 'zori' } },
].map((d, i) => ({ id: `stock${i}`, rank: 'none', ...d, look: normalizeLook(d.look) }));

/* ---------------- stats & generation ---------------- */
export function demonStats(level, tier = 1, boss = false) {
  const m = boss ? 1.3 : tier;
  return {
    hp: Math.round((40 + level * 22) * m),
    atk: +((6 + level * 2.6) * (boss ? 1.0 : 0.85 + tier * 0.15)).toFixed(1),
    def: +(1 + level * 0.8).toFixed(1),
    regen: boss ? 0.02 : 0.03,
  };
}

const titleFor = (art, rank) => {
  const ri = rankInfo(rank);
  return ri ? `${ri.label}, the ${ARTS[art].theme} Demon` : `the ${ARTS[art].theme} Demon`;
};

export function generateDemon({ level = 1, seed = Date.now() ^ (Math.random() * 1e9), boss = false, rank = boss ? 'L6' : 'none' } = {}) {
  const r = rng(seed);
  const keys = Object.keys(ARTS).filter((k) => k !== 'none');
  // Weak demons often have no Blood Demon Art at all.
  const artKey = !boss && level <= 1 && r() < 0.3 ? 'none' : pick(r, keys);
  const look = randomLook(r, boss ? pick(r, ['semi', 'monster', 'human']) : undefined);
  look.rank = rank;
  if (boss) look.eyeColor = '#ff3a3a';
  const tier = 0.9 + r() * 0.25;
  return {
    id: `d${seed}`, name: randomName(r), title: titleFor(artKey, rank), art: artKey, level, boss, rank, look,
    stats: demonStats(level, tier, boss), xp: boss ? 120 : Math.round(20 + level * 8),
  };
}

// A Demon Lab or stock demon, scaled to the player's level and its Kizuki rank.
export function labToBattle(custom, level) {
  const tier = { weak: 0.75, normal: 1, strong: 1.3 }[custom.tier] || 1;
  const look = normalizeLook(custom.look);
  const rank = custom.rank || look.rank || 'none';
  const ri = rankInfo(rank);
  const stats = demonStats(level, tier * (ri ? ri.mult : 1));
  const art = ARTS[custom.art] ? custom.art : 'none';
  return {
    id: custom.id, name: custom.name || 'Nameless', title: titleFor(art, rank), art, rank,
    level, boss: !!ri, look: { ...look, rank }, stats, xp: Math.round((20 + level * 8) * 0.5 * tier * (ri ? ri.mult : 1)), custom: true,
  };
}

/* ---------------- renderer ---------------- */
const mirror = (s) => `<g transform="matrix(-1 0 0 1 240 0)">${s}</g>`;
const SHADE = 'fill="#000" opacity=".18"';
function capsule(x1, y1, x2, y2, r1, r2, fill, extra = '') {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, f = (v) => v.toFixed(1);
  return `<path d="M${f(x1 + nx * r1)},${f(y1 + ny * r1)} L${f(x2 + nx * r2)},${f(y2 + ny * r2)} L${f(x2 - nx * r2)},${f(y2 - ny * r2)} L${f(x1 - nx * r1)},${f(y1 - ny * r1)}Z" fill="${fill}" ${extra}/><circle cx="${f(x1)}" cy="${f(y1)}" r="${r1}" fill="${fill}" ${extra}/><circle cx="${f(x2)}" cy="${f(y2)}" r="${r2}" fill="${fill}" ${extra}/>`;
}

/* ----- head (face coordinates: head centre 120,100; chin 146) ----- */
function demonEye(x, y, rx, ry, L, tilt, kanji) {
  const scl = { white: '#f6f2e8', black: '#16101a', red: '#a01828' }[L.sclera] || '#f6f2e8';
  let iris = '';
  const c = L.eyeColor;
  if (kanji) {
    iris = `<ellipse cx="${x}" cy="${y}" rx="${rx * 0.7}" ry="${ry * 0.95}" fill="${c}" stroke="${shade(c, -0.5)}" stroke-width="1"/>
      <text x="${x}" y="${y - ry * 0.05}" font-size="${ry * 0.62}" text-anchor="middle" fill="${INK}" font-weight="800">${kanji[0]}</text>
      <text x="${x}" y="${y + ry * 0.58}" font-size="${ry * 0.62}" text-anchor="middle" fill="${INK}" font-weight="800">${kanji[1]}</text>`;
  } else if (L.eyeStyle === 'ringed') {
    iris = `<ellipse cx="${x}" cy="${y}" rx="${rx * 0.66}" ry="${ry * 0.92}" fill="${c}"/><ellipse cx="${x}" cy="${y}" rx="${rx * 0.46}" ry="${ry * 0.64}" fill="none" stroke="${shade(c, -0.5)}" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="${Math.min(rx, ry) * 0.24}" fill="${INK}"/>`;
  } else if (L.eyeStyle === 'glow') {
    iris = `<ellipse cx="${x}" cy="${y}" rx="${rx * 0.7}" ry="${ry * 0.92}" fill="${shade(c, 0.35)}"/><ellipse cx="${x}" cy="${y}" rx="${rx * 0.4}" ry="${ry * 0.55}" fill="#fff" opacity=".85"/>`;
  } else if (L.eyeStyle === 'blank') {
    iris = `<ellipse cx="${x}" cy="${y}" rx="${rx * 0.62}" ry="${ry * 0.85}" fill="${shade(c, 0.5)}" opacity=".8"/>`;
  } else {
    iris = `<ellipse cx="${x}" cy="${y}" rx="${rx * 0.66}" ry="${ry * 0.92}" fill="${c}"/><ellipse cx="${x}" cy="${y}" rx="${Math.max(1, rx * 0.12)}" ry="${ry * 0.8}" fill="${INK}"/>`;
  }
  return `<g transform="rotate(${tilt} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${scl}" stroke="${INK}" stroke-width="1.8"/>${iris}
    ${kanji ? '' : `<circle cx="${x - rx * 0.32}" cy="${y - ry * 0.35}" r="${Math.max(1, rx * 0.16)}" fill="#fff" opacity=".85"/>`}
    <path d="M${x - rx - 1},${y - ry * 0.3} Q${x},${y - ry - 4} ${x + rx + 1},${y - ry * 0.3}" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/></g>`;
}

function hornsSvg(style, color) {
  const a = `fill="${color}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"`;
  const pair = (d, extra = '') => `<path d="${d}" ${a}/>${extra}${mirror(`<path d="${d}" ${a}/>${extra}`)}`;
  switch (style) {
    case 'nubs': return pair('M100,60 L96,46 L108,56Z');
    case 'one': return `<path d="M112,58 Q118,22 122,8 Q126,28 130,58Z" ${a}/>`;
    case 'two': return pair('M96,64 Q80,40 84,18 Q96,38 108,58Z');
    case 'four': return pair('M96,64 Q80,40 84,18 Q96,38 108,58Z') + pair('M84,76 Q62,66 56,46 Q74,56 90,66Z');
    case 'curly': return pair('M92,66 Q66,62 68,42 Q72,26 88,32 Q98,40 88,48 Q80,46 84,40');
    case 'spiral': return pair('M92,64 L84,26 L106,58Z', '<path d="M89,52 L101,50 M87,42 L97,40 M86,33 L93,32" stroke="#6a6070" stroke-width="1.6"/>');
    default: return '';
  }
}

function mouthSvg(style) {
  switch (style) {
    case 'closed': return `<path d="M112,130 Q120,132 128,130" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
    case 'grin': {
      let t = '';
      for (let x = 100; x < 140; x += 6) t += `M${x},128 L${x + 3},${x % 12 ? 136 : 134} L${x + 6},128 `;
      return `<path d="M96,126 Q120,146 144,126Z" fill="#3a0a14" stroke="${INK}" stroke-width="2"/><path d="${t}" fill="#fff" stroke="${INK}" stroke-width=".8"/>`;
    }
    case 'teeth': {
      let top = '', bot = '';
      for (let x = 100; x < 140; x += 5) { top += `M${x},124 L${x + 2.5},131 L${x + 5},124 `; bot += `M${x},140 L${x + 2.5},133 L${x + 5},140 `; }
      return `<path d="M98,122 Q120,118 142,122 Q144,140 120,144 Q96,140 98,122Z" fill="#3a0a14" stroke="${INK}" stroke-width="2"/><path d="${top}${bot}" fill="#fff" stroke="${INK}" stroke-width=".7"/>`;
    }
    case 'tongue': return `<ellipse cx="120" cy="130" rx="14" ry="9" fill="#3a0a14" stroke="${INK}" stroke-width="2"/>
      <path d="M114,132 Q110,160 128,172 Q150,186 136,206 Q148,184 132,170 Q120,160 126,132Z" fill="#c0505a" stroke="${INK}" stroke-width="1.8"/>`;
    case 'stitched': return `<path d="M102,130 L138,130" stroke="${INK}" stroke-width="2.4"/><path d="M106,125 L106,135 M114,125 L114,135 M122,125 L122,135 M130,125 L130,135" stroke="${INK}" stroke-width="1.6"/>`;
    case 'tusks': return `<path d="M108,130 Q120,136 132,130" fill="none" stroke="${INK}" stroke-width="2.4"/><path d="M107,131 L104,118 L111,129Z M133,131 L136,118 L129,129Z" fill="#f6f0e0" stroke="${INK}" stroke-width="1.4"/>`;
    default: return `<path d="M104,128 Q120,138 136,128" fill="#3a0a14" stroke="${INK}" stroke-width="2.2"/><path d="M109,129 L111,136 L114,130Z M126,130 L129,136 L131,129Z" fill="#fff" stroke="${INK}" stroke-width=".8"/>`;
  }
}

function faceMarks(style, c) {
  const s = `fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"`;
  const dot = (x, y, r = 2.6) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
  switch (style) {
    case 'dots': return dot(120, 60, 3.4) + dot(120, 70, 3) + dot(120, 79, 2.6) + [[96, 112], [100, 120], [96, 128], [144, 112], [140, 120], [144, 128]].map(([x, y]) => dot(x, y)).join('')
      + `<path d="M120,60 L120,79 M96,112 L100,120 L96,128 M144,112 L140,120 L144,128" stroke="${c}" stroke-width="1"/>`;
    case 'bars': return [108, 115, 122].map((y) => `<path d="M84,${y} L100,${y + 2} M156,${y} L140,${y + 2}" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`).join('');
    case 'stripes': return `<path d="M86,104 L98,108 M84,112 L97,114 M86,120 L97,120 M154,104 L142,108 M156,112 L143,114 M154,120 L143,120" ${s}/>`;
    case 'flower': return `<g transform="translate(92,104)">${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="0" cy="-9" rx="4" ry="8" fill="${c}" opacity=".85" transform="rotate(${a})"/>`).join('')}<circle r="3" fill="${shade(c, -0.3)}"/></g>`;
    case 'veins': return `<path d="M104,58 L108,66 L104,74 M136,58 L132,66 L136,74 M112,56 L114,62 M128,56 L126,62" fill="none" stroke="${c}" stroke-width="2"/>`;
    case 'spots': return [[92, 116], [98, 122], [146, 116], [140, 122], [120, 66], [112, 70], [128, 70], [104, 60]].map(([x, y]) => dot(x, y, 3)).join('');
    case 'cracks': return `<path d="M100,62 L106,74 L100,82 L108,92 M146,96 L138,104 L144,112 L136,120" ${s} stroke-width="1.8"/>`;
    case 'swirl': return `<path d="M120,74 a6,6 0 1,1 -6,-6 a10,10 0 1,1 14,-4" ${s}/>`;
    default: return '';
  }
}

function hairSvg(style, color, part, yFloor) {
  const f = `fill="${color}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"`;
  if (part === 'back') {
    switch (style) {
      case 'wild': return `<path d="M74,110 L54,96 L70,84 L52,62 L80,62 L74,36 L100,50 L106,24 L122,44 L138,22 L144,50 L168,36 L162,62 L190,62 L172,84 L188,96 L166,110 Q170,56 120,52 Q70,56 74,110Z" ${f}/>`;
      case 'long': return `<path d="M76,96 Q74,46 120,46 Q166,46 164,96 L180,236 Q120,250 60,236Z" ${f}/>`;
      case 'veryLong': {
        let strands = '';
        for (let x = 70; x <= 170; x += 12) strands += `M${x},140 Q${x + (x < 120 ? -14 : 14)},${(140 + yFloor) / 2} ${x + (x < 120 ? -20 : 20)},${yFloor - 6} `;
        return `<path d="M76,96 Q74,46 120,46 Q166,46 164,96 L198,${yFloor} Q120,${yFloor + 10} 42,${yFloor}Z" ${f}/><path d="${strands}" fill="none" stroke="${shade(color, -0.25)}" stroke-width="2"/>`;
      }
      case 'bob': return `<path d="M72,92 Q70,40 120,40 Q170,40 168,92 L170,146 L70,146Z" ${f}/>`;
      case 'wavy': return `<path d="M70,104 Q56,60 92,42 Q120,28 150,42 Q186,60 172,104 Q186,128 168,150 Q150,140 120,146 Q90,140 72,150 Q54,128 70,104Z" ${f}/>`;
      case 'topknot': return `<path d="M72,98 Q62,140 76,156 Q70,128 82,110Z M168,98 Q178,140 164,156 Q170,128 158,110Z" ${f}/><path d="M74,96 Q70,48 120,44 Q170,48 166,96 L160,110 L80,110Z" ${f}/>`;
      default: return '';
    }
  }
  switch (style) {
    case 'long': case 'veryLong': return `<path d="M80,84 Q90,54 120,50 Q150,54 160,84 Q146,64 120,64 Q94,64 80,84Z" ${f}/>`;
    case 'bob': return `<path d="M76,92 Q80,48 120,46 Q160,48 164,92 L160,80 L80,80Z" ${f}/>`;
    case 'wavy': return `<path d="M78,80 Q92,48 124,48 Q158,52 164,90 Q150,72 140,74 Q150,96 144,122 Q132,104 126,80 Q108,70 94,78 Q86,84 78,80Z" ${f}/>`;
    case 'topknot': return `<path d="M80,82 Q94,58 120,56 Q146,58 160,82 Q140,70 120,72 Q100,70 80,82Z" fill="${color}" stroke="${INK}" stroke-width="2"/>
      <path d="M100,46 Q96,20 120,16 Q144,20 140,46Z" fill="#1b1416" stroke="${INK}" stroke-width="2"/><path d="M110,20 Q104,8 112,2 M126,18 Q134,6 128,0" fill="none" stroke="#1b1416" stroke-width="3"/><rect x="104" y="40" width="32" height="8" rx="3" fill="#1b1416"/>`;
    default: return '';
  }
}

function spiderFace(L) {
  const head = shade(L.markColor === '#c0303a' ? '#6a3a8a' : L.markColor, -0.1);
  const eye = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#3ab8c8" stroke="${INK}" stroke-width="1.6"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.35}" fill="#fff"/>`;
  let teeth = '';
  for (let x = 98; x < 142; x += 6) teeth += `M${x},128 L${x + 3},138 L${x + 6},128 `;
  return `<ellipse cx="120" cy="100" rx="42" ry="48" fill="#6a3a8a" stroke="${INK}" stroke-width="2.2"/>
    <path d="M150,62 Q170,100 146,146 L170,146 L170,62Z" fill="#000" opacity=".15"/>
    <path d="M112,60 L120,52 L128,60 L120,66Z" fill="${head}" stroke="${INK}" stroke-width="1.4"/>
    ${eye(106, 88, 7)}${eye(134, 88, 7)}${eye(94, 98, 5)}${eye(146, 98, 5)}${eye(114, 102, 4.5)}${eye(126, 102, 4.5)}
    <path d="M94,122 Q120,150 146,122 Q140,138 120,142 Q100,138 94,122Z" fill="#3a0a14" stroke="${INK}" stroke-width="2"/><path d="${teeth}" fill="#fff" stroke="${INK}" stroke-width=".8"/>
    <path d="M100,124 Q88,150 98,176 Q102,160 108,134Z M140,124 Q152,150 142,176 Q138,160 132,134Z" fill="#c8a8d8" stroke="${INK}" stroke-width="1.8"/>
    <path d="M98,150 L104,148 M96,160 L102,159 M142,150 L136,148 M144,160 L138,159" stroke="#e8902a" stroke-width="2"/>`;
}

const EYE_SETS = {
  1: [[120, 98, 15, 11, 0]],
  2: [[103, 100, 10, 7, 12], [137, 100, 10, 7, -12]],
  3: [[103, 102, 9, 6.5, 12], [137, 102, 9, 6.5, -12], [120, 78, 5, 9, 0]],
  6: [[103, 100, 7, 5, 12], [137, 100, 7, 5, -12], [108, 88, 5, 3.6, 12], [132, 88, 5, 3.6, -12], [96, 112, 4, 3, 10], [144, 112, 4, 3, -10]],
};

function headSvg(L, yFloorFace) {
  const ri = rankInfo(L.rank);
  const back = hairSvg(L.hair, L.hairColor, 'back', yFloorFace);
  if (L.head === 'spider') return { back, front: spiderFace(L) + hairSvg(L.hair, L.hairColor, 'front') };
  const ears = L.ears === 'human' ? `<ellipse cx="80" cy="104" rx="6" ry="10" fill="${L.skin}" stroke="${INK}" stroke-width="2"/>`
    : `<path d="M82,96 L60,80 L78,114Z" fill="${L.skin}" stroke="${INK}" stroke-width="2"/>`;
  const eyes = (EYE_SETS[L.eyes] || EYE_SETS[2]).map(([x, y, rx, ry, t], i) => demonEye(x, y, rx, ry, L, t, ri && i < 2 ? ri.kanji : null)).join('');
  const brows = L.kind === 'human' ? '<path d="M92,86 L110,90 M148,86 L130,90" stroke="#2a1a20" stroke-width="2" stroke-linecap="round"/>'
    : `<path d="M92,84 L112,90 M148,84 L128,90" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  const front = `${ears}${mirror(ears)}
    <path d="M78,96 C78,52 98,44 120,44 C142,44 162,52 162,96 C162,122 148,140 120,148 C92,140 78,122 78,96Z" fill="${L.skin}" stroke="${INK}" stroke-width="2.2"/>
    <path d="M150,60 Q166,104 140,146 L168,146 L168,60Z" fill="#000" opacity=".14"/>
    ${hornsSvg(L.horns, L.hornColor)}${faceMarks(L.marks, L.markColor)}${brows}${eyes}
    <path d="M120,110 L118,118 L121,118" fill="none" stroke="${shade(L.skin, -0.35)}" stroke-width="1.6"/>${mouthSvg(L.mouth)}
    ${hairSvg(L.hair, L.hairColor, 'front')}`;
  return { back, front };
}

/* ----- outfit pattern overlays ----- */
function patternOverlay(kind, color, x0, y0, x1, y1) {
  if (kind === 'web') {
    let s = '';
    for (const [cx, cy] of [[x0 + 18, y0 + 30], [x1 - 14, y0 + 90], [x0 + 30, y1 - 40]]) {
      for (let a = 0; a < 8; a++) { const t = (a * Math.PI) / 4; s += `M${cx},${cy} L${(cx + Math.cos(t) * 40).toFixed(1)},${(cy + Math.sin(t) * 40).toFixed(1)} `; }
      for (const r of [10, 20, 30]) {
        let ring = '';
        for (let a = 0; a <= 8; a++) { const t = (a * Math.PI) / 4; ring += `${a ? 'L' : 'M'}${(cx + Math.cos(t) * r).toFixed(1)},${(cy + Math.sin(t) * r).toFixed(1)} `; }
        s += ring;
      }
    }
    return `<path d="${s}" fill="none" stroke="${color}" stroke-width="1.1" opacity=".8"/>`;
  }
  if (kind === 'stripes') { let s = ''; for (let x = x0; x < x1; x += 12) s += `<rect x="${x}" y="${y0}" width="6" height="${y1 - y0}" fill="${color}" opacity=".55"/>`; return s; }
  if (kind === 'flowers') {
    let s = '';
    for (let y = y0 + 14; y < y1; y += 34) for (let x = x0 + ((y / 34) % 2 ? 6 : 22); x < x1; x += 32)
      s += `<g transform="translate(${x},${y})">${[0, 90, 180, 270].map((a) => `<ellipse cx="0" cy="-4" rx="2.6" ry="4.5" fill="${color}" opacity=".85" transform="rotate(${a + 45})"/>`).join('')}<circle r="1.5" fill="#fff"/></g>`;
    return s;
  }
  return '';
}

/* ----- the full demon ----- */
export function renderDemon(demon, opts = {}) {
  const L = normalizeLook(demon.look);
  const art = ARTS[demon.art] || ARTS.none;
  const id = `dm${Math.floor(Math.random() * 1e9)}`;
  const label = `${demon.name || ''} ${demon.title || ''}`.replace(/[<>"&]/g, '');
  const aura = art.fx === 'none' ? '#8a8a9a' : art.color;

  if (opts.headOnly) {
    const h = L.build === 'spider' ? headSvg({ ...L }, 240) : headSvg(L, 240);
    return `<svg viewBox="50 0 140 160" class="demon-svg ${opts.cls || ''}" role="img" aria-label="${label}">${h.back}${h.front}</svg>`;
  }

  if (L.build === 'spider') return renderSpider(L, id, aura, label, opts);

  const big = L.build === 'hulking' || L.build === 'armored';
  const skinny = L.build === 'skinny';
  const k = big ? 0.52 : skinny ? 0.6 : 0.62;
  const S = big ? 56 : skinny ? 38 : 40, Wt = big ? 36 : skinny ? 20 : 26;
  const fy = 376, chin = 96;
  const headT = `translate(120 ${chin}) scale(${k}) translate(-120 -146)`;
  const yFloorFace = (400 - chin) / k + 146;
  const head = headSvg(L, yFloorFace);
  const skin = L.skin;
  const has = (x) => L.extras.includes(x);
  const bare = ['skirt', 'baggy', 'wrapped', 'loincloth'].includes(L.outfit);
  const sleeved = L.outfit === 'kimono' || L.outfit === 'robe';

  /* arms */
  const armR1 = big ? 18 : skinny ? 7 : 9, armR2 = big ? 13 : skinny ? 5 : 6.5;
  const sh = [120 - S + 6, 120], el = [120 - S - 8, 172], wr = [120 - S - 4, 226];
  let arm = capsule(sh[0], sh[1], el[0], el[1], armR1, armR2 + 1, skin, `stroke="${INK}" stroke-width="2"`) + capsule(el[0], el[1], wr[0], wr[1], armR2 + 1, armR2, skin, `stroke="${INK}" stroke-width="2"`);
  arm += capsule(sh[0], sh[1], el[0], el[1], armR1 - 2, armR2, skin) + capsule(el[0], el[1], wr[0], wr[1], armR2, armR2 - 1, skin);
  if (big) arm += `<circle cx="${(sh[0] + el[0]) / 2 - 6}" cy="${(sh[1] + el[1]) / 2}" r="${armR1}" fill="${skin}"/><path d="M${sh[0] - 14},150 Q${sh[0] - 22},134 ${sh[0] - 8},126" fill="none" stroke="${shade(skin, -0.35)}" stroke-width="1.6"/>`;
  if (has('dotTrail') && !sleeved) arm += [0.1, 0.3, 0.5, 0.7, 0.9].map((t) => `<circle cx="${sh[0] + (wr[0] - sh[0]) * t - 4}" cy="${sh[1] + (wr[1] - sh[1]) * t}" r="3.2" fill="${L.markColor}"/>`).join('');
  if (has('veinsBody') && !sleeved) arm += `<path d="M${el[0] + 2},${el[1] - 20} L${el[0] - 3},${el[1]} L${el[0] + 2},${el[1] + 18}" fill="none" stroke="${shade(skin, -0.4)}" stroke-width="1.4"/>`;
  if (has('armBands')) arm += `<path d="M${sh[0] - armR1},${144} L${sh[0] + armR1 - 4},${148} L${sh[0] + armR1 - 6},${158} L${sh[0] - armR1 - 2},${154}Z" fill="${L.accent === '#3ab0c8' ? '#a83a2a' : L.accent}" stroke="${INK}" stroke-width="1.6"/>
    <path d="M${wr[0] - armR2 - 2},${wr[1] - 16} L${wr[0] + armR2 + 2},${wr[1] - 16} L${wr[0] + armR2 + 2},${wr[1] - 6} L${wr[0] - armR2 - 2},${wr[1] - 6}Z" fill="${L.accent === '#3ab0c8' ? '#a83a2a' : L.accent}" stroke="${INK}" stroke-width="1.6"/>`;
  if (has('spikes') || L.build === 'armored') {
    let sp = '';
    for (let i = 0; i < 5; i++) { const t = 0.15 + i * 0.17, x = sh[0] + (wr[0] - sh[0]) * t - armR1 + 2, y = sh[1] + (wr[1] - sh[1]) * t; sp += `M${x},${y - 5} L${x - 14},${y - 2} L${x},${y + 4}Z `; }
    arm = `<path d="${sp}" fill="${shade(skin, -0.3)}" stroke="${INK}" stroke-width="1.4"/>` + arm;
  }
  if (sleeved) arm += `<path d="M${sh[0] + 10},114 Q${sh[0] - 10},112 ${sh[0] - 16},128 L${sh[0] - 28},196 Q${sh[0] - 10},206 ${sh[0] + 12},198 L${sh[0] + 8},140Z" fill="${L.robe}" stroke="${INK}" stroke-width="2"/>
    ${L.outfit === 'robe' ? `<path d="M${sh[0] - 28},196 L${sh[0] - 22},188 L${sh[0] - 16},200 L${sh[0] - 8},190 L${sh[0]},202 L${sh[0] + 6},192 L${sh[0] + 12},198" fill="none" stroke="${INK}" stroke-width="1.6"/>` : ''}`;
  const hand = `<circle cx="${wr[0]}" cy="${wr[1] + 6}" r="${armR2 + 1.5}" fill="${skin}" stroke="${INK}" stroke-width="2"/><path d="M${wr[0] - 6},${wr[1] + 10} l-2,10 l4,-5 l1,9 l3,-9 l3,6 l1,-11" fill="${L.nails}" stroke="${INK}" stroke-width="1"/>`;
  let weapon = '';
  if (has('sickles')) weapon = `<path d="M${wr[0]},${wr[1] + 4} Q${wr[0] - 40},${wr[1] - 30} ${wr[0] - 20},${wr[1] - 70} Q${wr[0] - 26},${wr[1] - 30} ${wr[0] + 6},${wr[1] + 2}Z" fill="#c8303a" stroke="${INK}" stroke-width="1.8"/><path d="M${wr[0] - 10},${wr[1] - 20} l-6,-4 M${wr[0] - 18},${wr[1] - 42} l-6,-2" stroke="#ff8a8a" stroke-width="2"/>`;
  const armL = arm + weapon + hand;
  const armRight = mirror(arm + `<path d="M${sh[0] + 8},118 L${el[0] + 4},${el[1]} L${wr[0] + 4},${wr[1]}" fill="none" stroke="#000" stroke-width="${armR1}" opacity=".08"/>` + weapon + hand);
  const backArms = L.arms === 4 ? mirror(capsule(sh[0] + 4, 126, sh[0] - 34, 104, armR2 + 2, armR2, shade(skin, -0.2), `stroke="${INK}" stroke-width="2"`) + capsule(sh[0] - 34, 104, sh[0] - 50, 60, armR2, armR2 - 1, shade(skin, -0.2), `stroke="${INK}" stroke-width="2"`))
    + capsule(sh[0] + 4, 126, sh[0] - 34, 104, armR2 + 2, armR2, shade(skin, -0.2), `stroke="${INK}" stroke-width="2"`) + capsule(sh[0] - 34, 104, sh[0] - 50, 60, armR2, armR2 - 1, shade(skin, -0.2), `stroke="${INK}" stroke-width="2"`) : '';

  /* torso */
  const torsoD = `M${120 - S + 6},126 Q${120 - S},116 ${120 - S + 16},112 L110,106 L130,106 L${120 + S - 16},112 Q${120 + S},116 ${120 + S - 6},126 L${120 + Wt + 2},210 L${120 - Wt - 2},210Z`;
  let torso = `<path d="${torsoD}" fill="${bare ? skin : L.robe}" stroke="${INK}" stroke-width="2"/>`;
  if (bare) {
    const line = shade(skin, -0.35);
    if (big) torso += `<path d="M${120 - S + 16},140 Q104,158 120,152 Q136,158 ${120 + S - 16},140 M120,154 L120,200 M108,168 L132,168 M109,182 L131,182 M110,196 L130,196" fill="none" stroke="${line}" stroke-width="1.8"/>`;
    else if (skinny) torso += [140, 150, 160, 170].map((y) => `<path d="M${120 - Wt - 6},${y} Q${112},${y + 4} 116,${y + 1} M${120 + Wt + 6},${y} Q128,${y + 4} 124,${y + 1}" fill="none" stroke="${line}" stroke-width="1.5"/>`).join('') + `<path d="M104,118 Q112,122 118,118 M136,118 Q128,122 122,118 M120,176 L120,204" stroke="${line}" stroke-width="1.5" fill="none"/>`;
    else torso += `<path d="M106,140 Q114,146 120,142 Q126,146 134,140 M120,144 L120,196" fill="none" stroke="${line}" stroke-width="1.5"/>`;
    if (has('veinsBody')) torso += `<path d="M110,150 L104,164 L110,176 L102,190 M132,148 L138,162 L130,172 L138,188 M120,160 L114,172" fill="none" stroke="${shade(skin, -0.45)}" stroke-width="1.4"/>`;
    if (has('dotTrail')) torso += [130, 146, 162, 178, 194].map((y) => `<circle cx="120" cy="${y}" r="3" fill="${L.markColor}"/>`).join('');
    if (L.marks === 'spots') torso += [[106, 140], [134, 150], [112, 176], [130, 186], [100, 160]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${4 + (x % 3)}" fill="${L.markColor}" opacity=".85"/>`).join('');
  } else {
    torso += `<path d="M110,106 L131,170 M130,106 L117,134" stroke="${L.outfit === 'kimono' ? shade(L.robe, -0.25) : '#f2efe6'}" stroke-width="4"/><path d="M110,106 L130,106 L120,128Z" fill="${skin}"/>`;
    if (L.pattern !== 'plain') torso += `<g clip-path="url(#${id}t)">${patternOverlay(L.pattern, L.pattern === 'web' ? (L.robe === '#f4f2f0' ? '#2a2a3a' : '#f2efe6') : L.obi, 120 - S, 106, 120 + S, 210)}</g>`;
    torso += `<rect x="${120 - Wt - 3}" y="180" width="${2 * (Wt + 3)}" height="${L.outfit === 'kimono' ? 26 : 12}" fill="${L.obi}" stroke="${INK}" stroke-width="1.8"/>`;
  }
  torso += `<path d="M${120 + S * 0.3},108 L${120 + S - 16},112 Q${120 + S},116 ${120 + S - 6},126 L${120 + Wt + 2},210 L${120 + Wt * 0.3},210Z" ${SHADE}/>`;

  /* legs & lower clothing */
  const leg = (x) => capsule(x, 214, x + (x < 120 ? -4 : 4), fy - 6, big ? 15 : skinny ? 8 : 10, big ? 10 : 6, skin, `stroke="${INK}" stroke-width="2"`);
  const foot = (x) => {
    if (L.feet === 'geta') return `<rect x="${x - 12}" y="${fy}" width="24" height="7" fill="#2a2024" stroke="${INK}" stroke-width="1.4"/><rect x="${x - 10}" y="${fy + 7}" width="6" height="12" fill="#2a2024"/><rect x="${x + 4}" y="${fy + 7}" width="6" height="12" fill="#2a2024"/><ellipse cx="${x}" cy="${fy - 2}" rx="9" ry="4" fill="${skin}" stroke="${INK}" stroke-width="1.4"/>`;
    if (L.feet === 'zori') return `<ellipse cx="${x}" cy="${fy}" rx="10" ry="4.5" fill="${skin}" stroke="${INK}" stroke-width="1.4"/><rect x="${x - 11}" y="${fy + 3}" width="22" height="4" rx="2" fill="#c8a868"/><path d="M${x},${fy - 3} L${x - 6},${fy + 3} M${x},${fy - 3} L${x + 6},${fy + 3}" stroke="#c0303a" stroke-width="1.6"/>`;
    return `<ellipse cx="${x}" cy="${fy}" rx="11" ry="5.5" fill="${skin}" stroke="${INK}" stroke-width="1.6"/><path d="M${x - 8},${fy + 3} l0,3 M${x - 3},${fy + 4} l0,3 M${x + 2},${fy + 4} l0,3 M${x + 7},${fy + 3} l0,3" stroke="${L.nails}" stroke-width="2"/>`;
  };
  const xl = 120 - Wt * 0.55, xr = 120 + Wt * 0.55;
  let legs = leg(xl) + leg(xr) + foot(xl - 4) + foot(xr + 4);
  let lower = '';
  const r2 = shade(L.robe, -0.3);
  switch (L.outfit) {
    case 'kimono': case 'robe': {
      let hem = `M${120 - Wt - 6},204 L${120 + Wt + 6},204 L${120 + Wt + 22},${fy - 8}`;
      if (L.outfit === 'robe') for (let x = 120 + Wt + 22; x > 120 - Wt - 22; x -= 9) hem += ` L${x - 4.5},${fy + 2 - ((x * 7) % 10)} L${x - 9},${fy - 8}`;
      else hem += ` L${120 - Wt - 22},${fy - 8}`;
      lower = `<path d="${hem}Z" fill="${L.robe}" stroke="${INK}" stroke-width="2"/><path d="M128,206 L134,${fy - 10}" stroke="${r2}" stroke-width="2"/>`;
      if (L.pattern !== 'plain') lower += `<g clip-path="url(#${id}k)">${patternOverlay(L.pattern, L.pattern === 'web' ? (L.robe === '#f4f2f0' ? '#2a2a3a' : '#f2efe6') : L.obi, 120 - Wt - 22, 204, 120 + Wt + 22, fy)}</g>`;
      lower += `<path d="M120,204 L${120 + Wt + 6},204 L${120 + Wt + 22},${fy - 8} L124,${fy - 8}Z" ${SHADE}/>`;
      legs = foot(xl - 4) + foot(xr + 4);
      break;
    }
    case 'skirt': {
      let stripes = '';
      for (let x = 120 - Wt - 10; x < 120 + Wt + 10; x += 14) stripes += `<rect x="${x}" y="206" width="7" height="${fy - 80 - 206}" fill="${L.obi}"/>`;
      lower = `<defs><clipPath id="${id}s"><path d="M${120 - Wt - 6},204 L${120 + Wt + 6},204 L${120 + Wt + 12},${fy - 80} L${120 - Wt - 12},${fy - 80}Z"/></clipPath></defs>
        <path d="M${120 - Wt - 6},204 L${120 + Wt + 6},204 L${120 + Wt + 12},${fy - 80} L${120 - Wt - 12},${fy - 80}Z" fill="${L.robe}" stroke="${INK}" stroke-width="2"/><g clip-path="url(#${id}s)">${stripes}</g>`;
      break;
    }
    case 'baggy': case 'wrapped': {
      const pant = (side) => {
        const x0 = side < 0 ? 120 - Wt - 4 : 120, x1 = side < 0 ? 120 : 120 + Wt + 4, mid = side < 0 ? 120 - Wt - 22 : 120 + Wt + 22;
        let lines = '';
        if (L.outfit === 'wrapped') for (let y = 230; y < fy - 20; y += 14) lines += `M${Math.min(x0, mid) + 4},${y} Q${(x0 + x1) / 2},${y + 6} ${Math.max(x1, mid) - 4},${y - 4} `;
        return `<path d="M${x0},206 L${x1},206 Q${side < 0 ? 124 : 116},${fy - 60} ${side < 0 ? 116 : 124},${fy - 16} L${side < 0 ? 96 : 144},${fy - 16} Q${mid},${fy - 90} ${x0 === 120 ? x1 : x0},206Z" fill="${L.robe}" stroke="${INK}" stroke-width="2"/>
          <path d="${lines || `M${(x0 + x1) / 2},220 Q${mid - side * 4},${fy - 90} ${(x0 + x1) / 2 + side * 4},${fy - 24}`}" fill="none" stroke="${r2}" stroke-width="1.6"/>`;
      };
      lower = pant(-1) + pant(1) + (L.outfit === 'baggy' ? `<rect x="${120 - Wt - 6}" y="198" width="${2 * (Wt + 6)}" height="14" fill="${L.obi}" stroke="${INK}" stroke-width="1.8"/><path d="M${120 - 12},212 L${120 - 16},262 L${120 - 6},262 L${120 - 4},212Z M${120 + 8},212 L${120 + 12},250 L${120 + 20},250 L${120 + 16},212Z" fill="${L.obi}" stroke="${INK}" stroke-width="1.6"/>` : '');
      legs = foot(xl - 4) + foot(xr + 4);
      break;
    }
    case 'loincloth':
      lower = `<path d="M${120 - Wt - 4},204 L${120 + Wt + 4},204 L${120 + Wt},224 L${120 - Wt},224Z" fill="${L.robe}" stroke="${INK}" stroke-width="2"/><path d="M106,222 L104,272 L136,272 L134,222Z" fill="${L.robe}" stroke="${INK}" stroke-width="2"/>`;
      break;
  }

  /* extras */
  let extrasBack = '', extrasFront = '';
  if (has('sashes')) {
    const c2 = L.accent;
    extrasBack += `<path d="M${120 - Wt},196 Q40,200 30,260 Q22,320 52,370 L66,364 Q40,316 48,266 Q58,214 ${120 - Wt},208Z" fill="${L.obi}" stroke="${INK}" stroke-width="1.8"/><path d="M38,280 L58,282 M36,300 L52,304" stroke="${c2}" stroke-width="4"/>`
      + mirror(`<path d="M${120 - Wt},196 Q40,200 30,260 Q22,320 52,370 L66,364 Q40,316 48,266 Q58,214 ${120 - Wt},208Z" fill="${L.obi}" stroke="${INK}" stroke-width="1.8"/><path d="M38,280 L58,282 M36,300 L52,304" stroke="${c2}" stroke-width="4"/>`);
  }
  if (has('spikes') || L.build === 'armored') extrasBack += `<path d="M${120 - S + 8},112 L${120 - S - 6},84 L${120 - S + 18},106Z M${120 + S - 8},112 L${120 + S + 6},84 L${120 + S - 18},106Z M100,108 L92,82 L110,104Z M140,108 L148,82 L130,104Z" fill="${shade(skin, -0.35)}" stroke="${INK}" stroke-width="1.6"/>`;
  if (has('ropeBelt')) extrasFront += `<path d="M${120 - Wt - 6},202 Q120,212 ${120 + Wt + 6},202" fill="none" stroke="#8a2a2a" stroke-width="9" stroke-linecap="round"/><path d="M${120 - Wt - 6},202 Q120,212 ${120 + Wt + 6},202" fill="none" stroke="#c0505a" stroke-width="3" stroke-dasharray="5 5"/>
    <path d="M108,210 Q106,240 110,268 M118,212 Q118,244 120,276" stroke="#8a2a2a" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M108,210 Q106,240 110,268 M118,212 Q118,244 120,276" stroke="#c0505a" stroke-width="2" fill="none" stroke-dasharray="4 4"/>`;
  if (has('drums')) {
    const drum = (x, y, r = 15) => `<g transform="translate(${x},${y})"><circle r="${r + 3}" fill="#2a1a1a" stroke="${INK}" stroke-width="1.6"/><circle r="${r}" fill="#e8c860" stroke="#a83a2a" stroke-width="2.4"/>
      <circle r="${r * 0.55}" fill="none" stroke="#a87a30" stroke-width="1.2"/>${[0, 60, 120].map((a) => `<path d="M${(Math.cos((a * Math.PI) / 180) * r).toFixed(1)},${(Math.sin((a * Math.PI) / 180) * r).toFixed(1)} L${(-Math.cos((a * Math.PI) / 180) * r).toFixed(1)},${(-Math.sin((a * Math.PI) / 180) * r).toFixed(1)}" stroke="#a87a30" stroke-width="1"/>`).join('')}</g>`;
    extrasFront += drum(120 - S + 8, 128) + drum(120 + S - 8, 128) + drum(120, 168, 17) + drum(120 - Wt - 14, 244, 12) + drum(120 + Wt + 14, 244, 12);
  }
  if (has('beads')) extrasFront += `<path d="M104,108 Q120,150 136,108" fill="none" stroke="${INK}" stroke-width="1"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => { const t = i / 6, x = 104 + 32 * t, y = 108 + Math.sin(t * Math.PI) * 30; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${i === 3 ? 6 : 4.5}" fill="${L.accent}" stroke="${INK}" stroke-width="1.2"/>`; }).join('')}`;
  if (has('furCollar')) {
    let d = '';
    for (let i = 0; i <= 24; i++) { const t = (i / 24) * Math.PI * 2, r = i % 2 ? 30 : 44; d += `${i ? 'L' : 'M'}${(120 + Math.cos(t) * r * 1.25).toFixed(1)},${(108 + Math.sin(t) * r * 0.42).toFixed(1)} `; }
    extrasFront += `<path d="${d}Z" fill="#f4f2f6" stroke="${INK}" stroke-width="1.8"/><path d="${d}Z" fill="none" stroke="#1a1018" stroke-width="5" stroke-dasharray="3 9" opacity=".8"/>`;
  }

  const body = `<g>
    <ellipse cx="120" cy="210" rx="120" ry="200" fill="url(#${id}a)"/>
    <g transform="${headT}">${head.back}</g>
    ${extrasBack}${backArms}
    ${legs}${lower}${torso}${armL}${armRight}${extrasFront}
    <g transform="${headT}">${head.front}</g>
  </g>`;
  return `<svg viewBox="0 -10 240 416" class="demon-svg ${opts.cls || ''}" role="img" aria-label="${label}">
    <defs><radialGradient id="${id}a"><stop offset="0" stop-color="${aura}" stop-opacity=".5"/><stop offset="1" stop-color="${aura}" stop-opacity="0"/></radialGradient>
    <clipPath id="${id}t"><path d="${torsoD}"/></clipPath><clipPath id="${id}k"><path d="M${120 - Wt - 6},204 L${120 + Wt + 6},204 L${120 + Wt + 22},${fy - 8} L${120 - Wt - 22},${fy - 8}Z"/></clipPath></defs>
    ${body}</svg>`;
}

// Giant spider body with a small human head hanging beneath it.
function renderSpider(L, id, aura, label, opts) {
  const body = L.robe, band = L.markColor, dark = shade(body, -0.35);
  let legs = '';
  const legPath = (pts) => {
    let s = '';
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i], [x2, y2] = pts[i + 1];
      s += capsule(x1, y1, x2, y2, 6.5 - i, 5.5 - i, body, `stroke="${INK}" stroke-width="1.8"`);
      const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
      s += `<circle cx="${mx.toFixed(1)}" cy="${my.toFixed(1)}" r="${4.5 - i}" fill="${band}"/>`;
    }
    const [lx, ly] = pts[pts.length - 1], [px, py] = pts[pts.length - 2];
    const dx = lx - px, dy = ly - py, l = Math.hypot(dx, dy);
    s += `<path d="M${lx - 3},${ly} L${(lx + (dx / l) * 18).toFixed(1)},${(ly + (dy / l) * 18).toFixed(1)} L${lx + 3},${ly}Z" fill="#16101a"/>`;
    return s;
  };
  const sets = [
    [[100, 210], [60, 120], [36, 40], [70, 6]],
    [[98, 220], [40, 170], [12, 110], [8, 60]],
    [[98, 232], [36, 240], [14, 310], [26, 360]],
    [[100, 240], [60, 300], [50, 370], [80, 400]],
  ];
  for (const s of sets) { const one = legPath(s); legs += one + mirror(one); }
  const abd = `<ellipse cx="120" cy="140" rx="48" ry="64" fill="${body}" stroke="${INK}" stroke-width="2.2"/>
    <path d="M120,84 L120,200" stroke="${band}" stroke-width="5"/><ellipse cx="102" cy="122" rx="7" ry="13" fill="${band}"/><ellipse cx="138" cy="122" rx="7" ry="13" fill="${band}"/>
    <ellipse cx="102" cy="154" rx="7" ry="13" fill="${band}"/><ellipse cx="138" cy="154" rx="7" ry="13" fill="${band}"/><path d="M78,186 Q120,206 162,186" fill="none" stroke="${band}" stroke-width="5"/>
    <path d="M150,96 Q176,140 150,196 L170,196 L170,96Z" fill="#000" opacity=".18"/>`;
  const thorax = `<ellipse cx="120" cy="226" rx="30" ry="24" fill="${dark}" stroke="${INK}" stroke-width="2"/>`;
  const h = headSvg({ ...L, head: 'human', hair: L.hair === 'none' ? 'wild' : L.hair }, 300);
  const headT = 'translate(120 296) scale(.42) translate(-120 -146)';
  return `<svg viewBox="0 -10 240 416" class="demon-svg ${opts.cls || ''}" role="img" aria-label="${label}">
    <defs><radialGradient id="${id}a"><stop offset="0" stop-color="${aura}" stop-opacity=".5"/><stop offset="1" stop-color="${aura}" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="120" cy="210" rx="120" ry="200" fill="url(#${id}a)"/>${legs}${abd}${thorax}
    <g transform="${headT}">${h.back}${h.front}</g></svg>`;
}
