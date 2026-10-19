// Procedural demons: looks, names, Blood Demon Arts and stats.
import { shade } from './avatar.js';

const INK = '#1a1018';

export const ARTS = {
  thread: { name: 'Thread Snare', theme: 'Thread', color: '#e8e8f8', desc: 'Sharp threads tie you up. You lose your next turn.', fx: 'bind', mult: 0.8 },
  drum: { name: 'Room Shuffle Drum', theme: 'Drum', color: '#d09a5a', desc: 'Spins the whole room. Your attacks may miss.', fx: 'confuse', mult: 0.7 },
  swamp: { name: 'Swamp Dive', theme: 'Swamp', color: '#5a8a4a', desc: 'Sinks into the ground to dodge attacks.', fx: 'hide', mult: 0 },
  thorns: { name: 'Thorn Petals', theme: 'Thorn', color: '#ff5a8a', desc: 'Stinging petals that hurt every turn.', fx: 'poison', mult: 0.6 },
  frost: { name: 'Frost Fog', theme: 'Frost', color: '#9ae0ff', desc: 'Freezing mist that weakens your blows.', fx: 'chill', mult: 0.7 },
  mirror: { name: 'Mirror Copies', theme: 'Mirror', color: '#c8d6f0', desc: 'Fake copies make it hard to hit.', fx: 'hide', mult: 0.5 },
  stone: { name: 'Iron Skin', theme: 'Iron', color: '#9a9aa8', desc: 'Hardens its skin like armour.', fx: 'armor', mult: 0 },
  regrow: { name: 'Rapid Regrowth', theme: 'Root', color: '#6ad66a', desc: 'Heals its wounds super fast.', fx: 'heal', mult: 0 },
  hands: { name: 'Hundred Hands', theme: 'Hand', color: '#d6a86a', desc: 'Grabs at you from everywhere at once.', fx: 'multi', mult: 0.45, hits: 4 },
  moth: { name: 'Ember Moths', theme: 'Moth', color: '#ff9a3c', desc: 'Burning moths that keep stinging.', fx: 'burn', mult: 0.6 },
  scream: { name: 'Echo Scream', theme: 'Echo', color: '#c08aff', desc: 'A scream so loud it can stun you.', fx: 'stun', mult: 0.6, chance: 0.5 },
  shadow: { name: 'Shadow Lunge', theme: 'Shadow', color: '#6a5a9a', desc: 'Leaps out of the shadows for a huge hit.', fx: 'heavy', mult: 1.8 },
};

export const DEMON_SKIN = ['#e8e0e0', '#c9c2d6', '#a8b4a0', '#d6b8a0', '#9ab0c8', '#b08ab8', '#8a9a8a', '#e0c8b0', '#c86a6a', '#6a7a9a'];
export const DEMON_EYE = ['#ff3a3a', '#ffd23a', '#7aff7a', '#3ae0ff', '#ff6ad6', '#b06aff', '#ffffff', '#ff8c2e'];
export const DEMON_ROBE = ['#2a1f2f', '#3a2a1a', '#1f2a3a', '#4a1a1a', '#2a3a2a', '#5a4a6a', '#e8e0d0', '#7a3a1a'];
export const DEMON_OPTS = {
  eyes: [1, 2, 3, 6], horns: ['none', 'one', 'two', 'four', 'curly'], mouth: ['fangs', 'grin', 'stitched', 'tusks'],
  marks: ['none', 'stripes', 'spots', 'cracks', 'swirl'], hair: ['none', 'wild', 'long'], arms: [2, 4],
};
const HAIR = ['#1b1416', '#e8e8f0', '#6a3a8a', '#c0303a', '#3a5a3a', '#e0b45a', '#3a3a5a'];
const SYL = ['ka', 'ki', 'ku', 'ro', 'ma', 'shi', 'no', 'ra', 'ze', 'gi', 'mo', 'tsu', 'ya', 'ri', 'ha', 'za', 'do', 'ne', 'ru', 'mi', 'zu', 'ga'];

export function rng(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
}
const pick = (r, a) => a[Math.floor(r() * a.length)];

export function demonStats(level, tier = 1, boss = false) {
  const m = boss ? 1.3 : tier;
  return {
    hp: Math.round((40 + level * 22) * m),
    atk: +((6 + level * 2.6) * (boss ? 1.0 : 0.85 + tier * 0.15)).toFixed(1),
    def: +(1 + level * 0.8).toFixed(1),
    regen: boss ? 0.02 : 0.03,
  };
}

export function randomLook(r) {
  return {
    skin: pick(r, DEMON_SKIN), eyes: pick(r, DEMON_OPTS.eyes), eyeColor: pick(r, DEMON_EYE),
    horns: pick(r, DEMON_OPTS.horns), hornColor: pick(r, ['#f2efe6', '#2a2a2e', '#c0303a', '#d9a83a', '#6a5a9a']),
    mouth: pick(r, DEMON_OPTS.mouth), marks: pick(r, DEMON_OPTS.marks), markColor: pick(r, ['#c0303a', '#6a2a8a', '#2a5a8a', '#1a1018', '#d9a83a']),
    hair: pick(r, DEMON_OPTS.hair), hairColor: pick(r, HAIR), arms: r() < 0.25 ? 4 : 2, robe: pick(r, DEMON_ROBE),
  };
}

export function randomName(r) {
  const n = 2 + Math.floor(r() * 2);
  let s = '';
  for (let i = 0; i < n; i++) s += pick(r, SYL);
  return s[0].toUpperCase() + s.slice(1);
}

export function generateDemon({ level = 1, seed = Date.now() ^ (Math.random() * 1e9), boss = false } = {}) {
  const r = rng(seed);
  const artKey = pick(r, Object.keys(ARTS));
  const art = ARTS[artKey];
  const look = randomLook(r);
  const tier = 0.9 + r() * 0.25;
  return {
    id: `d${seed}`, name: randomName(r), title: boss ? `Lower Moon, the ${art.theme} Demon` : `the ${art.theme} Demon`,
    art: artKey, level, boss, look: { ...look, eyeColor: boss ? '#ff3a3a' : look.eyeColor },
    stats: demonStats(level, tier, boss), xp: boss ? 120 : Math.round(20 + level * 8),
  };
}

// A demon designed in the Demon Lab, scaled to the player's level.
export function labToBattle(custom, level) {
  const tier = { weak: 0.75, normal: 1, strong: 1.3 }[custom.tier] || 1;
  return {
    id: custom.id, name: custom.name || 'Nameless', title: `the ${ARTS[custom.art].theme} Demon`, art: custom.art,
    level, boss: false, look: custom.look, stats: demonStats(level, tier), xp: Math.round((20 + level * 8) * 0.5 * tier), custom: true,
  };
}

/* ---------------- renderer ---------------- */
function eyeAt(x, y, rx, ry, color, tilt, boss) {
  return `<g transform="rotate(${tilt} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#f6f0c8" stroke="${INK}" stroke-width="1.8"/>
    <ellipse cx="${x}" cy="${y}" rx="${rx * 0.62}" ry="${ry * 0.92}" fill="${color}"/>
    ${boss ? `<text x="${x}" y="${y + ry * 0.4}" font-size="${ry * 1.1}" text-anchor="middle" fill="${INK}" font-weight="700">下</text>`
    : `<ellipse cx="${x}" cy="${y}" rx="${Math.max(1, rx * 0.12)}" ry="${ry * 0.8}" fill="${INK}"/>`}
    <circle cx="${x - rx * 0.3}" cy="${y - ry * 0.35}" r="${Math.max(1, rx * 0.18)}" fill="#fff" opacity=".8"/></g>`;
}

function horns(style, color) {
  const a = `fill="${color}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"`;
  const pair = (d) => `<path d="${d}" ${a}/><path d="${d}" ${a} transform="matrix(-1 0 0 1 240 0)"/>`;
  switch (style) {
    case 'one': return `<path d="M112,60 Q118,24 122,10 Q126,30 130,60Z" ${a}/>`;
    case 'two': return pair('M96,64 Q80,40 84,18 Q96,38 108,58Z');
    case 'four': return pair('M96,64 Q80,40 84,18 Q96,38 108,58Z') + pair('M84,76 Q62,66 56,46 Q74,56 90,66Z');
    case 'curly': return pair('M92,66 Q66,62 68,42 Q72,26 88,32 Q98,40 88,48 Q80,46 84,40');
    default: return '';
  }
}

function demonMouth(style) {
  switch (style) {
    case 'grin': {
      let t = '';
      for (let x = 100; x < 140; x += 6) t += `M${x},128 L${x + 3},${x % 12 ? 136 : 134} L${x + 6},128 `;
      return `<path d="M96,126 Q120,146 144,126Z" fill="#3a0a14" stroke="${INK}" stroke-width="2"/><path d="${t}" fill="#fff" stroke="${INK}" stroke-width=".8"/>`;
    }
    case 'stitched': return `<path d="M102,130 L138,130" stroke="${INK}" stroke-width="2.4"/><path d="M106,125 L106,135 M114,125 L114,135 M122,125 L122,135 M130,125 L130,135" stroke="${INK}" stroke-width="1.6"/>`;
    case 'tusks': return `<path d="M108,130 Q120,136 132,130" fill="none" stroke="${INK}" stroke-width="2.4"/><path d="M107,131 L104,118 L111,129Z M133,131 L136,118 L129,129Z" fill="#f6f0e0" stroke="${INK}" stroke-width="1.4"/>`;
    default: return `<path d="M104,128 Q120,138 136,128" fill="#3a0a14" stroke="${INK}" stroke-width="2.2"/><path d="M109,129 L111,136 L114,130Z M126,130 L129,136 L131,129Z" fill="#fff" stroke="${INK}" stroke-width=".8"/>`;
  }
}

function marks(style, c) {
  const s = `fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round"`;
  switch (style) {
    case 'stripes': return `<path d="M86,104 L98,108 M84,112 L97,114 M86,120 L97,120 M154,104 L142,108 M156,112 L143,114 M154,120 L143,120" ${s}/>`;
    case 'spots': return [[92, 116], [98, 122], [146, 116], [140, 122], [120, 66], [112, 70], [128, 70]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${c}"/>`).join('');
    case 'cracks': return `<path d="M100,62 L106,74 L100,82 L108,92 M146,96 L138,104 L144,112 L136,120" ${s} stroke-width="1.8"/>`;
    case 'swirl': return `<path d="M120,74 a6,6 0 1,1 -6,-6 a10,10 0 1,1 14,-4" ${s}/>`;
    default: return '';
  }
}

export function renderDemon(demon, opts = {}) {
  const L = demon.look;
  const art = ARTS[demon.art] || ARTS.shadow;
  const id = `dm${Math.floor(Math.random() * 1e9)}`;
  const skin = L.skin, robe = L.robe;
  const claws = (x, y) => `<path d="M${x - 6},${y} l-3,9 l4,-4 l2,8 l2,-8 l4,4 l-1,-9Z" fill="#2a1a20"/>`;
  const armD = 'M84,172 Q60,190 54,246 L66,248 Q72,204 94,186Z';
  const arm = `<path d="${armD}" fill="${skin}" stroke="${INK}" stroke-width="2"/>${claws(60, 246)}`;
  const backArm = `<g transform="rotate(-38 88 176)"><path d="${armD}" fill="${shade(skin, -0.18)}" stroke="${INK}" stroke-width="2"/>${claws(60, 246)}</g>`;
  const m = (s) => `<g transform="matrix(-1 0 0 1 240 0)">${s}</g>`;
  let robeD = 'M84,168 Q120,152 156,168 L176,296';
  for (let x = 168; x >= 64; x -= 8) robeD += ` L${x},${x % 16 ? 290 : 302}`;
  robeD += 'Z';
  const hairBack = L.hair === 'wild'
    ? `<path d="M74,110 L54,96 L70,84 L52,62 L80,62 L74,36 L100,50 L106,24 L122,44 L138,22 L144,50 L168,36 L162,62 L190,62 L172,84 L188,96 L166,110 Q170,56 120,52 Q70,56 74,110Z" fill="${L.hairColor}" stroke="${INK}" stroke-width="2"/>`
    : L.hair === 'long' ? `<path d="M76,96 Q74,50 120,48 Q166,50 164,96 L176,220 L64,220Z" fill="${L.hairColor}" stroke="${INK}" stroke-width="2"/>` : '';
  const eyeSets = {
    1: [[120, 96, 15, 11, 0]],
    2: [[103, 98, 10, 7, 12], [137, 98, 10, 7, -12]],
    3: [[103, 100, 9, 6.5, 12], [137, 100, 9, 6.5, -12], [120, 76, 5, 9, 0]],
    6: [[103, 98, 7, 5, 12], [137, 98, 7, 5, -12], [108, 86, 5, 3.6, 12], [132, 86, 5, 3.6, -12], [96, 110, 4, 3, 10], [144, 110, 4, 3, -10]],
  };
  const eyes = (eyeSets[L.eyes] || eyeSets[2]).map(([x, y, rx, ry, t]) => eyeAt(x, y, rx, ry, L.eyeColor, t, demon.boss && L.eyes !== 6)).join('');
  const ears = `<path d="M82,96 L60,80 L78,114Z" fill="${skin}" stroke="${INK}" stroke-width="2"/>`;
  return `<svg viewBox="${opts.headOnly ? '50 10 140 150' : '20 50 200 256'}" class="demon-svg ${opts.cls || ''}" role="img" aria-label="${demon.name} ${demon.title}">
    <defs><radialGradient id="${id}a"><stop offset="0" stop-color="${art.color}" stop-opacity=".55"/><stop offset="1" stop-color="${art.color}" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="120" cy="180" rx="110" ry="140" fill="url(#${id}a)"/>
    ${opts.headOnly ? hairBack : `<g transform="translate(120 146) scale(.62) translate(-120 -146)">${hairBack}</g>`}
    ${L.arms === 4 ? backArm + m(backArm) : ''}
    <path d="${robeD}" fill="${robe}" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M120,160 L156,168 L176,296 L120,296Z" fill="#000" opacity=".2"/>
    <path d="M100,164 L120,196 L140,164" fill="none" stroke="${shade(robe, 0.3)}" stroke-width="3"/>
    <path d="M88,214 L152,214" stroke="${shade(robe, 0.35)}" stroke-width="5"/>
    ${arm}${m(arm)}
    <rect x="108" y="132" width="24" height="34" fill="${shade(skin, -0.12)}" stroke="${INK}" stroke-width="2"/>
    <g ${opts.headOnly ? '' : 'transform="translate(120 146) scale(.62) translate(-120 -146)" class="dhd"'}>
    ${ears}${m(ears)}
    <ellipse cx="120" cy="100" rx="40" ry="46" fill="${skin}" stroke="${INK}" stroke-width="2.2"/>
    <path d="M150,70 Q166,104 140,144 L170,144 L170,70Z" fill="#000" opacity=".15"/>
    ${horns(L.horns, L.hornColor)}
    ${marks(L.marks, L.markColor)}
    <path d="M92,84 L112,90 M148,84 L128,90" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
    ${eyes}${demonMouth(L.mouth)}</g>
  </svg>`;
}
