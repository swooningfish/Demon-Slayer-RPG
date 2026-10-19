// Detailed, layered battle backdrops. Each scene is an SVG built from reusable pieces
// (sky, moon, mountains, trees, landmarks, mist, particles) and animated with CSS.
import { rng } from './demons.js';

const VW = 400, VH = 600, GROUND = 500;

export const SCENES = {
  forest: { name: 'Night forest', sky: ['#070b1c', '#14244a', '#2a3a5a'], moon: '#fff4d0', ground: '#14261a', tree: 'pine', fx: 'fireflies' },
  river: { name: 'Frozen river', sky: ['#0a1020', '#1c2c50', '#41587e'], moon: '#f4f8ff', ground: '#dfe8f4', tree: 'snowpine', fx: 'snow' },
  bamboo: { name: 'Bamboo grove', sky: ['#06120c', '#12301e', '#2a4a30'], moon: '#f0ffe0', ground: '#10241a', tree: 'bamboo', fx: 'fireflies' },
  mill: { name: 'Abandoned mill', sky: ['#120a18', '#2a1a30', '#4a2f3a'], moon: '#ffe0b0', ground: '#1e1812', tree: 'dead', fx: 'leaves' },
  path: { name: 'Mountain path', sky: ['#080a1a', '#1a2040', '#3a3a60'], moon: '#ffffff', ground: '#3a3a46', tree: 'snowpine', fx: 'snow' },
  well: { name: 'Old well', sky: ['#0a0a16', '#1a1a30', '#30304a'], moon: '#fff0c8', ground: '#1e1e22', tree: 'dead', fx: 'mist' },
  valley: { name: 'Misty valley', sky: ['#0c1020', '#26304e', '#55607e'], moon: '#ffffff', ground: '#1a2430', tree: 'pine', fx: 'fireflies' },
  hut: { name: 'Charcoal hut', sky: ['#0a0812', '#1e1428', '#3a2430'], moon: '#ffd8a0', ground: '#1a1410', tree: 'pine', fx: 'embers' },
  cedar: { name: 'Giant cedar', sky: ['#060a12', '#14223a', '#24384a'], moon: '#f0f4ff', ground: '#121e14', tree: 'pine', fx: 'fireflies' },
  wisteria: { name: 'Wisteria Mountain', sky: ['#0e0820', '#2a1648', '#5a3a7a'], moon: '#fff0ff', ground: '#1e1430', tree: 'pine', fx: 'petals' },
  shrine: { name: 'Old shrine', sky: ['#14040a', '#3a0a18', '#6a1a24'], moon: '#ff5a4a', ground: '#1a1014', tree: 'dead', fx: 'embers' },
  cabin: { name: 'Snowy cabin', sky: ['#0a0e1e', '#1e2a48', '#3a4a6a'], moon: '#f4f8ff', ground: '#dfe6f0', tree: 'snowpine', fx: 'snow' },
  interior: { name: 'Home', indoor: true, fx: 'embers' },
  temple: { name: 'Forest temple', sky: ['#080c16', '#18243a', '#2e3e52'], moon: '#fffbe8', ground: '#1c2420', tree: 'pine', fx: 'fireflies' },
  street: { name: 'Town street', sky: ['#0a0c18', '#1e2440', '#40486a'], moon: '#fff4d0', ground: '#c8d0dc', tree: 'none', fx: 'snow' },
  dojo: { name: 'Training yard', sky: ['#0a0c18', '#1c2240', '#3a3a5a'], moon: '#fff4d0', ground: '#3a2c20', tree: 'pine', fx: 'leaves' },
};

/* ---------- building blocks ---------- */
function pine(x, y, h, c) {
  const p = (a, b) => `${(x + h * a).toFixed(1)},${(y - h * b).toFixed(1)}`;
  return `<rect x="${x - h * 0.03}" y="${y - h * 0.1}" width="${h * 0.06}" height="${h * 0.12}" fill="${c}"/>
    <path d="M${p(0, 1)} L${p(0.17, 0.64)} L${p(0.08, 0.64)} L${p(0.27, 0.32)} L${p(0.12, 0.32)} L${p(0.36, 0.04)} L${p(-0.36, 0.04)} L${p(-0.12, 0.32)} L${p(-0.27, 0.32)} L${p(-0.08, 0.64)} L${p(-0.17, 0.64)}Z" fill="${c}"/>`;
}
function snowPine(x, y, h, c) {
  const p = (a, b) => `${(x + h * a).toFixed(1)},${(y - h * b).toFixed(1)}`;
  return pine(x, y, h, c) + `<path d="M${p(0, 1)} L${p(0.1, 0.8)} L${p(-0.1, 0.8)}Z M${p(-0.17, 0.64)} L${p(0.17, 0.64)} L${p(0.11, 0.58)} L${p(-0.11, 0.58)}Z M${p(-0.27, 0.32)} L${p(0.27, 0.32)} L${p(0.2, 0.27)} L${p(-0.2, 0.27)}Z" fill="#e8f0ff" opacity=".85"/>`;
}
function deadTree(x, y, h, c, r) {
  const lean = (r() - 0.5) * 0.2;
  let d = `M${x - h * 0.035},${y} L${x + h * lean - h * 0.015},${y - h} L${x + h * lean + h * 0.015},${y - h} L${x + h * 0.035},${y}Z`;
  for (let i = 0; i < 5; i++) {
    const t = 0.35 + i * 0.13, side = i % 2 ? 1 : -1;
    const bx = x + h * lean * t, by = y - h * t;
    d += ` M${bx},${by} L${bx + side * h * (0.18 + r() * 0.12)},${by - h * (0.12 + r() * 0.1)} L${bx},${by - h * 0.03}Z`;
  }
  return `<path d="${d}" fill="${c}"/>`;
}
function bamboo(x, y, h, c, r) {
  const w = 7 + r() * 5, lean = (r() - 0.5) * 18;
  let s = `<path d="M${x},${y} L${x + lean},${y - h} L${x + lean + w},${y - h} L${x + w},${y}Z" fill="${c}"/>`;
  for (let k = 0.15; k < 1; k += 0.14 + r() * 0.04) {
    const nx = x + lean * k, ny = y - h * k;
    s += `<path d="M${nx - 1},${ny} L${nx + w + 1},${ny}" stroke="#000" stroke-width="2" opacity=".35"/>`;
    if (r() < 0.35) s += `<path d="M${nx + w},${ny} q${18 + r() * 12},-6 ${30 + r() * 16},${4 + r() * 6} q-16,0 -${30 + r() * 10},-${2 + r() * 3}Z" fill="${c}"/>`;
  }
  return s;
}
function mountains(y, peaks, amp, c, r) {
  let d = `M0,${VH} L0,${y}`;
  for (let i = 0; i <= peaks; i++) d += ` L${(i / peaks) * VW + (r() - 0.5) * 20},${y - amp * (0.4 + r() * 0.6)} L${((i + 0.5) / peaks) * VW},${y - amp * 0.15 * r()}`;
  return `<path d="${d} L${VW},${VH}Z" fill="${c}"/>`;
}
function treeRow(kind, y, count, hMin, hMax, c, r) {
  let s = '';
  if (kind === 'none') return s;
  for (let i = 0; i < count; i++) {
    const x = (i + r() * 0.8) * (VW / count) - 10, h = hMin + r() * (hMax - hMin);
    s += kind === 'snowpine' ? snowPine(x, y, h, c) : kind === 'dead' ? deadTree(x, y, h, c, r) : kind === 'bamboo' ? bamboo(x, y, h, c, r) : pine(x, y, h, c);
  }
  return s;
}
// Big foreground trees framing the left and right edges.
function edgeTrees(kind, c, r) {
  if (kind === 'none') return '';
  const one = (x) => {
    const h = 420 + r() * 80;
    return kind === 'snowpine' ? snowPine(x, VH + 30, h, c) : kind === 'dead' ? deadTree(x, VH, h, c, r) : kind === 'bamboo' ? bamboo(x, VH, h + 100, c, r) + bamboo(x + 26, VH, h + 60, c, r) : pine(x, VH + 30, h, c);
  };
  return one(-30 + r() * 20) + one(VW + 10 - r() * 20);
}
const mist = (y, op, dur) => `<g class="drift" style="animation-duration:${dur}s"><ellipse cx="120" cy="${y}" rx="260" ry="26" fill="#dfe6ff" opacity="${op}"/><ellipse cx="380" cy="${y + 14}" rx="220" ry="20" fill="#dfe6ff" opacity="${op * 0.8}"/></g>`;

function particles(kind, r) {
  let s = '';
  const n = { fireflies: 18, snow: 46, petals: 34, embers: 26, leaves: 16, mist: 0 }[kind] || 0;
  for (let i = 0; i < n; i++) {
    const x = r() * VW, d = (r() * 6).toFixed(2), dur = (5 + r() * 7).toFixed(2), sx = ((r() - 0.5) * 120).toFixed(0);
    const st = `style="--sx:${sx}px;--dx:${((r() - 0.5) * 40).toFixed(0)}px;--dy:${((r() - 0.5) * 40).toFixed(0)}px;animation-delay:-${d}s;animation-duration:${dur}s"`;
    if (kind === 'fireflies') s += `<circle class="pt-glow" ${st} cx="${x}" cy="${260 + r() * 260}" r="${1.6 + r() * 1.4}" fill="#e8ff8a"/>`;
    if (kind === 'snow') s += `<circle class="pt-fall" ${st} cx="${x}" cy="0" r="${1 + r() * 2.2}" fill="#fff" opacity="${0.5 + r() * 0.5}"/>`;
    if (kind === 'petals') s += `<ellipse class="pt-fall" ${st} cx="${x}" cy="0" rx="3.2" ry="1.8" fill="${r() < 0.5 ? '#c9a0ff' : '#f0c8ff'}"/>`;
    if (kind === 'embers') s += `<circle class="pt-rise" ${st} cx="${x}" cy="${VH}" r="${1 + r() * 1.8}" fill="${r() < 0.5 ? '#ff9a3c' : '#ffd23a'}"/>`;
    if (kind === 'leaves') s += `<path class="pt-fall" ${st} d="M${x},0 q5,-4 10,0 q-5,4 -10,0Z" fill="${r() < 0.5 ? '#8a6a2a' : '#6a4a1a'}"/>`;
  }
  return s;
}

/* ---------- landmarks ---------- */
const lantern = (x, y, s = 1) => `<g transform="translate(${x},${y}) scale(${s})">
  <ellipse cx="0" cy="-58" rx="34" ry="34" fill="url(#glow)" class="flicker"/>
  <rect x="-12" y="-8" width="24" height="8" fill="#5a5a60"/><rect x="-5" y="-40" width="10" height="34" fill="#6a6a72"/>
  <rect x="-13" y="-66" width="26" height="24" fill="#4a4a52"/><rect x="-7" y="-62" width="14" height="14" fill="#ffcc6a" class="flicker"/>
  <path d="M-22,-66 L0,-82 L22,-66Z" fill="#5a5a60"/></g>`;
const torii = (x, y, w, h, c = '#c0303a') => `<g transform="translate(${x},${y})">
  <rect x="${-w / 2 + 10}" y="${-h}" width="12" height="${h}" fill="${c}"/><rect x="${w / 2 - 22}" y="${-h}" width="12" height="${h}" fill="${c}"/>
  <rect x="${-w / 2 + 2}" y="${-h + 18}" width="${w - 4}" height="9" fill="${c}"/>
  <path d="M${-w / 2 - 14},${-h - 8} Q0,${-h + 2} ${w / 2 + 14},${-h - 8} L${w / 2 + 10},${-h + 4} Q0,${-h + 12} ${-w / 2 - 10},${-h + 4}Z" fill="#1a0a0e"/>
  <rect x="-5" y="${-h + 4}" width="10" height="14" fill="${c}"/></g>`;

// Taisho-era street: two rows of wooden shop-houses and telegraph poles running to a vanishing point.
function street() {
  const vx = 200, vy = 330;
  const side = (dir, wall, trim) => {
    const x0 = dir < 0 ? 0 : VW, xe = vx + dir * 18;
    let g = `<path d="M${x0},150 L${xe},${vy - 30} L${xe},${vy + 6} L${x0},560Z" fill="${wall}"/>`;
    for (let i = 0; i < 7; i++) {
      const t = 1 - Math.pow(0.72, i + 1), x = x0 + (xe - x0) * t;
      const top = 150 + (vy - 30 - 150) * t, bot = 560 + (vy + 6 - 560) * t;
      g += `<path d="M${x.toFixed(1)},${top.toFixed(1)} L${x.toFixed(1)},${bot.toFixed(1)}" stroke="${trim}" stroke-width="${(4 * (1 - t) + 1).toFixed(1)}"/>`;
      const wy = top + (bot - top) * 0.55;
      g += `<rect x="${(dir < 0 ? x - (1 - t) * 40 : x + 4).toFixed(1)}" y="${wy.toFixed(1)}" width="${((1 - t) * 34 + 2).toFixed(1)}" height="${((bot - top) * 0.2).toFixed(1)}" fill="#ffb860" opacity=".55" class="flicker"/>`;
      for (let k = 0; k < 6; k++) {
        const lx = x + dir * -(k + 1) * (1 - t) * 6;
        g += `<path d="M${lx.toFixed(1)},${(top + (bot - top) * 0.25).toFixed(1)} L${lx.toFixed(1)},${(top + (bot - top) * 0.45).toFixed(1)}" stroke="${trim}" stroke-width=".8" opacity=".7"/>`;
      }
    }
    g += `<path d="M${x0},140 L${xe},${vy - 34}" stroke="#1a1418" stroke-width="10"/><path d="M${x0},${dir < 0 ? 300 : 290} L${xe},${vy - 12}" stroke="#2a2024" stroke-width="7"/>`;
    return g;
  };
  let poles = '', wires = '';
  const tops = [];
  for (let i = 0; i < 6; i++) {
    const t = 1 - Math.pow(0.66, i + 0.4), x = 350 + (vx + 26 - 350) * t, base = 600 + (vy - 600) * t, h = 330 * (1 - t) + 30, w = 2 + 8 * (1 - t);
    tops.push([x, base - h]);
    poles += `<rect x="${(x - w / 2).toFixed(1)}" y="${(base - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#1a1418"/>`;
    for (let k = 0; k < 3; k++) poles += `<rect x="${(x - w * 3).toFixed(1)}" y="${(base - h + 8 * (1 - t) + k * 12 * (1 - t) + 2).toFixed(1)}" width="${(w * 6).toFixed(1)}" height="${(w * 0.5).toFixed(1)}" fill="#1a1418"/>`;
  }
  for (let i = 0; i < tops.length - 1; i++) wires += `M${tops[i][0].toFixed(1)},${(tops[i][1] + 4).toFixed(1)} Q${((tops[i][0] + tops[i + 1][0]) / 2).toFixed(1)},${((tops[i][1] + tops[i + 1][1]) / 2 + 14).toFixed(1)} ${tops[i + 1][0].toFixed(1)},${(tops[i + 1][1] + 4).toFixed(1)} `;
  return `<path d="M${vx - 26},${vy} L${vx + 26},${vy} L${VW},${VH} L0,${VH}Z" fill="#c8d0dc"/>
    <path d="M${vx},${vy} L120,${VH} M${vx},${vy} L290,${VH}" stroke="#a8b2c2" stroke-width="2" opacity=".6"/>
    ${side(-1, '#3a2e26', '#24191a')}${side(1, '#33292a', '#1e1618')}
    <path d="${wires}" stroke="#1a1418" stroke-width="1.2" fill="none"/>${poles}
    ${lantern(96, 520, 0.8)}`;
}

function interior() {
  const vx = 200, vy = 290;
  let planks = '', boards = '';
  for (let i = -6; i <= 6; i++) planks += `M${vx + i * 16},380 L${vx + i * 64},${VH} `;
  for (let i = 0; i < 8; i++) boards += `M${110 - i * 14},${210 - i * 26} L${110 - i * 14},${380 + i * 28} M${290 + i * 14},${210 - i * 26} L${290 + i * 14},${380 + i * 28} `;
  let beams = '';
  for (let i = 0; i < 4; i++) { const y = 40 + i * 50, k = i / 4; beams += `<path d="M${k * 110},${y} L${400 - k * 110},${y}" stroke="#2a1c12" stroke-width="${12 - i * 2}"/>`; }
  return `<path d="M0,0 L400,0 L290,210 L110,210Z" fill="#3a2a1c"/>${beams}
    <path d="M0,0 L110,210 L110,380 L0,560Z" fill="#5a4230"/><path d="M400,0 L290,210 L290,380 L400,560Z" fill="#4a3626"/>
    <path d="${boards}" stroke="#2e2014" stroke-width="1.2" opacity=".7"/>
    <rect x="110" y="210" width="180" height="170" fill="#4e3a28"/>
    <rect x="128" y="236" width="70" height="144" fill="#6a5238" stroke="#2a1c12" stroke-width="4"/><rect x="202" y="236" width="70" height="144" fill="#6a5238" stroke="#2a1c12" stroke-width="4"/>
    <path d="M30,140 L84,170 L84,280 L30,266Z" fill="#cfd8e8" opacity=".55"/><path d="M57,154 L57,272 M30,204 L84,226" stroke="#2a1c12" stroke-width="3"/>
    <path d="M110,380 L290,380 L400,600 L0,600Z" fill="#6a4c30"/><path d="${planks}" stroke="#4a321e" stroke-width="1.4"/>
    <ellipse cx="200" cy="476" rx="150" ry="70" fill="url(#glow)" class="flicker"/>
    <path d="M150,450 L250,450 L272,506 L128,506Z" fill="#1a120c" stroke="#3a2a1c" stroke-width="5"/>
    <ellipse cx="200" cy="482" rx="34" ry="10" fill="#ff8a3c" opacity=".8" class="flicker"/>
    <path d="M200,0 L200,430" stroke="#1a120c" stroke-width="3"/><path d="M186,430 Q200,416 214,430 Q216,452 200,454 Q184,452 186,430Z" fill="#2a2a30" stroke="#0e0c10" stroke-width="2"/>
    ${[[30, 420], [340, 400]].map(([x, y], i) => i ? `<path d="M${x},${y} L${x + 50},${y - 10} L${x + 50},${y + 90} L${x},${y + 100}Z" fill="#4a3220" stroke="#24180e" stroke-width="2"/><path d="M${x},${y + 30} L${x + 50},${y + 22} M${x},${y + 62} L${x + 50},${y + 56}" stroke="#24180e" stroke-width="2"/>`
      : `<rect x="${x}" y="${y}" width="34" height="56" fill="#f6e2b8" stroke="#2a1c12" stroke-width="3" class="flicker"/><ellipse cx="${x + 17}" cy="${y + 28}" rx="50" ry="50" fill="url(#glow)" class="flicker"/>`).join('')}`;
}

function landmark(id, r) {
  switch (id) {
    case 'street': return street();
    case 'cabin': return `<g transform="translate(0,${GROUND})">
      <path d="M70,-110 L250,-110 L250,0 L70,0Z" fill="#4a3a2c"/><path d="M70,-50 L250,-50" stroke="#2a1e16" stroke-width="3"/>
      ${[100, 130, 160, 220].map((x) => `<path d="M${x},-110 L${x},0" stroke="#2a1e16" stroke-width="4"/>`).join('')}
      <rect x="168" y="-92" width="44" height="80" fill="#ffb860" opacity=".7" class="flicker"/><path d="M190,-92 L190,-12" stroke="#2a1e16" stroke-width="3"/>
      <path d="M44,-100 L96,-200 L224,-200 L276,-100Z" fill="#e2e8f2" stroke="#9aa6b8" stroke-width="2"/><path d="M44,-100 L276,-100" stroke="#6a5a48" stroke-width="7"/>
      <rect x="112" y="-214" width="96" height="16" fill="#d8dee8" stroke="#9aa6b8" stroke-width="2"/>${[120, 140, 160, 180, 200].map((x) => `<rect x="${x - 3}" y="-220" width="6" height="8" fill="#9aa6b8"/>`).join('')}
      <path d="M150,-200 L120,-120 M180,-200 L210,-120" stroke="#b8c2d2" stroke-width="2" opacity=".7"/>
      <path d="M290,0 L338,-92 L392,0Z" fill="#3a3026"/><path d="M296,-12 L338,-92 L344,-80 L306,-10Z" fill="#e2e8f2"/>
      <rect x="288" y="-40" width="108" height="40" fill="#6a4a30"/>${[300, 316, 332, 348, 364, 380].map((x) => `<path d="M${x},-40 L${x},0" stroke="#3a2618" stroke-width="2"/>`).join('')}
      <path d="M326,0 L326,-22 Q338,-36 350,-22 L350,0Z" fill="#120c08"/>
      <g transform="translate(272,-14)"><circle r="16" fill="none" stroke="#5a4028" stroke-width="4"/>${[0, 45, 90, 135].map((a) => `<path d="M${(16 * Math.cos((a * Math.PI) / 180)).toFixed(1)},${(16 * Math.sin((a * Math.PI) / 180)).toFixed(1)} L${(-16 * Math.cos((a * Math.PI) / 180)).toFixed(1)},${(-16 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" stroke="#5a4028" stroke-width="2"/>`).join('')}</g>
      <path d="M272,-14 L232,-40 M272,-8 L230,-32" stroke="#5a4028" stroke-width="4"/>
      ${[[40, 6, 50], [140, 8, 70], [360, 6, 40]].map(([x, y, w]) => `<ellipse cx="${x}" cy="${y}" rx="${w}" ry="14" fill="#eef2f8"/>`).join('')}</g>`;
    case 'temple': return `<g transform="translate(200,${GROUND})">
      <path d="M-110,-40 L110,-40 L118,-20 L-118,-20Z" fill="#5a5a60"/><rect x="-118" y="-20" width="236" height="20" fill="#4a4a50"/>
      <rect x="-80" y="-120" width="160" height="80" fill="#4a3424"/>${[-60, -30, 0, 30, 60].map((x) => `<path d="M${x},-120 L${x},-40" stroke="#2a1c12" stroke-width="3"/>`).join('')}
      <rect x="-28" y="-104" width="56" height="64" fill="#2a1c12"/><path d="M-28,-88 L28,-88 M-28,-72 L28,-72 M-28,-56 L28,-56 M0,-104 L0,-40" stroke="#5a4430" stroke-width="2"/>
      <path d="M-120,-112 Q0,-136 120,-112 L92,-160 Q0,-186 -92,-160Z" fill="#26262e" stroke="#14141a" stroke-width="2"/>
      <path d="M-120,-112 Q-130,-108 -136,-116 M120,-112 Q130,-108 136,-116" stroke="#26262e" stroke-width="5" fill="none"/>
      <rect x="-10" y="-186" width="20" height="16" fill="#26262e"/><ellipse cx="0" cy="-192" rx="6" ry="9" fill="#3a3a44"/>
      <path d="M-90,-40 L-90,-56 L90,-56 L90,-40" fill="none" stroke="#3a2618" stroke-width="3"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="${-30 - i * 8}" y="${i * 8}" width="${60 + i * 16}" height="8" fill="${i % 2 ? '#6a6a72' : '#5a5a62'}"/>`).join('')}</g>
      ${lantern(92, GROUND + 8)}${lantern(308, GROUND + 8)}
      <path d="M0,${GROUND - 4} L120,${GROUND - 4} M280,${GROUND - 4} L400,${GROUND - 4}" stroke="#4a3a2a" stroke-width="5"/>`;
    case 'river': return `<path d="M0,${GROUND + 6} Q200,${GROUND - 14} ${VW},${GROUND + 2} L${VW},${GROUND + 40} Q200,${GROUND + 26} 0,${GROUND + 46}Z" fill="#9ec4e8"/>
      <path d="M40,${GROUND + 20} L120,${GROUND + 16} M200,${GROUND + 24} L300,${GROUND + 18}" stroke="#fff" stroke-width="2" opacity=".7"/>`;
    case 'mill': return `<g fill="#1a1216"><rect x="230" y="${GROUND - 150}" width="140" height="150"/><path d="M220,${GROUND - 150} L300,${GROUND - 210} L380,${GROUND - 150}Z"/></g>
      <rect x="262" y="${GROUND - 110}" width="26" height="30" fill="#ffb05a" opacity=".55" class="flicker"/>
      <g transform="translate(215,${GROUND - 60})"><g class="spin"><circle r="58" fill="none" stroke="#2a1e18" stroke-width="10"/>${Array.from({ length: 8 }, (_, i) => `<path d="M0,0 L${(58 * Math.cos(i * 0.785)).toFixed(1)},${(58 * Math.sin(i * 0.785)).toFixed(1)}" stroke="#2a1e18" stroke-width="6"/>`).join('')}</g></g>
      <path d="M20,${GROUND - 30} L20,${GROUND} M50,${GROUND - 36} L52,${GROUND} M80,${GROUND - 26} L78,${GROUND} M10,${GROUND - 24} L95,${GROUND - 30}" stroke="#2a1e18" stroke-width="5"/>`;
    case 'path': return `<path d="M0,${GROUND - 260} L60,${GROUND - 200} L40,${GROUND - 120} L90,${GROUND} L0,${GROUND}Z M${VW},${GROUND - 280} L340,${GROUND - 190} L370,${GROUND - 100} L310,${GROUND} L${VW},${GROUND}Z" fill="#22222c"/>
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="${150 + i * 6}" y="${GROUND - 20 - i * 22}" width="${100 - i * 12}" height="10" fill="#4a4a56"/>`).join('')}
      ${[0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${120 + i * 40}" cy="${GROUND - 190 + (i % 2) * 8}" r="2" fill="#ffd27a" class="flicker"/>`).join('')}`;
    case 'well': return `<g transform="translate(300,${GROUND})"><path d="M-40,0 L-40,-46 Q0,-56 40,-46 L40,0Z" fill="#4a4a52"/><path d="M-40,-46 Q0,-36 40,-46" stroke="#2a2a30" stroke-width="3" fill="none"/>
      <path d="M-36,-46 L-36,-120 M36,-46 L36,-120" stroke="#3a2a20" stroke-width="7"/><path d="M-56,-112 L0,-140 L56,-112Z" fill="#2a1e18"/>
      <path d="M0,-118 L0,-70" stroke="#a08060" stroke-width="2"/><rect x="-9" y="-72" width="18" height="16" fill="#5a3a24"/></g>${lantern(70, GROUND, 0.9)}`;
    case 'valley': return mountains(GROUND - 120, 4, 120, '#2a3448', r) + mist(GROUND - 110, 0.35, 16) + mountains(GROUND - 50, 6, 80, '#1e2636', r) + mist(GROUND - 40, 0.3, 12);
    case 'hut': return `<g transform="translate(280,${GROUND})"><rect x="-60" y="-80" width="120" height="80" fill="#2a1e18"/><path d="M-78,-78 L0,-140 L78,-78Z" fill="#3a2a1a"/>
      <rect x="-38" y="-58" width="26" height="22" fill="#ffb05a" class="flicker"/><rect x="10" y="-60" width="26" height="60" fill="#140e0a"/>
      <rect x="30" y="-170" width="14" height="50" fill="#2a1e18"/>
      ${[0, 1, 2].map((i) => `<circle class="pt-smoke" cx="37" cy="-176" r="${10 + i * 4}" fill="#8a8a9a" style="animation-delay:-${i * 1.3}s"/>`).join('')}</g>
      <path d="M40,${GROUND} l20,-26 l20,26Z M70,${GROUND} l16,-20 l16,20Z" fill="#141010"/>`;
    case 'cedar': return `<path d="M60,${GROUND} Q90,${GROUND - 200} 70,${-10} L160,${-10} Q140,${GROUND - 200} 180,${GROUND}Z" fill="#1e1a14"/>
      <path d="M90,${GROUND - 160} q20,-12 30,-6 M100,${GROUND - 260} q16,-8 26,4" stroke="#0e0c08" stroke-width="3" fill="none"/>
      <path d="M68,${GROUND - 210} Q120,${GROUND - 190} 176,${GROUND - 214}" stroke="#d8c08a" stroke-width="9" fill="none"/>
      ${[86, 120, 154].map((x) => `<path d="M${x},${GROUND - 202} l-6,12 l8,0 l-6,12 l8,0" stroke="#f4f0e6" stroke-width="3" fill="none"/>`).join('')}`;
    case 'wisteria': {
      let s = `<path d="M0,40 Q200,70 ${VW},34" stroke="#3a2418" stroke-width="10" fill="none"/>`;
      for (let i = 0; i < 26; i++) {
        const x = i * 16 + r() * 8, len = 70 + r() * 110, y0 = 40 + Math.sin(i / 3) * 10;
        s += `<path class="sway" style="animation-delay:-${(r() * 4).toFixed(2)}s" d="M${x - 9},${y0} Q${x},${y0 + len * 1.1} ${x + 2},${y0 + len} Q${x + 4},${y0 + len * 1.1} ${x + 11},${y0}Z" fill="url(#wis)"/>`;
      }
      return s + torii(200, GROUND, 170, 170, '#8a2a3a');
    }
    case 'shrine': return `<g transform="translate(200,${GROUND - 40})"><rect x="-110" y="-10" width="220" height="14" fill="#2a1a1e"/>
      <rect x="-90" y="-100" width="180" height="90" fill="#3a1a1e"/><rect x="-26" y="-80" width="52" height="70" fill="#0e0608"/>
      <path d="M-136,-96 Q0,-140 136,-96 L118,-128 Q0,-170 -118,-128Z" fill="#1a0c10"/></g>
      ${torii(200, GROUND, 230, 210)}${lantern(60, GROUND)}${lantern(340, GROUND)}`;
    case 'dojo': return `<rect x="0" y="${GROUND - 110}" width="${VW}" height="10" fill="#2a1e14"/>
      ${[0, 1, 2, 3, 4, 5, 6, 7].map((i) => `<rect x="${i * 56}" y="${GROUND - 110}" width="8" height="110" fill="#2a1e14"/>`).join('')}
      ${[40, 360].map((x) => `<g transform="translate(${x},${GROUND})"><rect x="-4" y="-90" width="8" height="90" fill="#5a4024"/><ellipse cx="0" cy="-70" rx="16" ry="26" fill="#c8a868"/><path d="M-16,-70 L16,-70" stroke="#8a6a3a" stroke-width="3"/></g>`).join('')}
      ${[110, 200, 290].map((x) => `<g transform="translate(${x},${GROUND - 170})"><g class="sway"><path d="M0,-30 L0,0" stroke="#3a2a1a" stroke-width="2"/><ellipse cy="14" rx="14" ry="18" fill="#ff7a4a" opacity=".9"/><ellipse cy="14" rx="26" ry="30" fill="url(#glow)" class="flicker"/></g></g>`).join('')}`;
    default: return '';
  }
}

export function renderScene(id = 'forest', seed = 7) {
  const sc = SCENES[id] || SCENES.forest;
  if (sc.indoor) {
    const r0 = rng(seed + 11);
    return `<svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMax slice" class="scene-svg" aria-hidden="true">
      <defs><radialGradient id="glow"><stop offset="0" stop-color="#ffb860" stop-opacity=".55"/><stop offset="1" stop-color="#ffb860" stop-opacity="0"/></radialGradient>
      <radialGradient id="vig" cx="50%" cy="55%" r="75%"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".75"/></radialGradient></defs>
      ${interior()}${particles(sc.fx, r0)}<rect width="${VW}" height="${VH}" fill="url(#vig)"/></svg>`;
  }
  const r = rng(seed * 7919 + id.length * 104729);
  const [s0, s1, s2] = sc.sky;
  const red = id === 'shrine';
  let stars = '';
  for (let i = 0; i < 60; i++) stars += `<circle cx="${(r() * VW).toFixed(0)}" cy="${(r() * 300).toFixed(0)}" r="${(0.4 + r() * 1.2).toFixed(1)}" fill="#fff" opacity="${(0.3 + r() * 0.7).toFixed(2)}" class="${r() < 0.25 ? 'twinkle' : ''}" style="animation-delay:-${(r() * 3).toFixed(1)}s"/>`;
  const moonX = 70 + r() * 260;
  const far = sc.tree === 'bamboo' ? '#0a1a10' : '#0c1424';
  const mid = sc.tree === 'snowpine' ? '#1a2840' : sc.tree === 'bamboo' ? '#163020' : '#0a1410';
  const near = sc.tree === 'bamboo' ? '#0a1a0e' : '#05080a';
  const groundTop = sc.ground;
  return `<svg viewBox="0 0 ${VW} ${VH}" preserveAspectRatio="xMidYMax slice" class="scene-svg" aria-hidden="true">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${s0}"/><stop offset=".55" stop-color="${s1}"/><stop offset="1" stop-color="${s2}"/></linearGradient>
      <radialGradient id="moonglow"><stop offset="0" stop-color="${sc.moon}" stop-opacity=".55"/><stop offset="1" stop-color="${sc.moon}" stop-opacity="0"/></radialGradient>
      <radialGradient id="glow"><stop offset="0" stop-color="#ffcc6a" stop-opacity=".6"/><stop offset="1" stop-color="#ffcc6a" stop-opacity="0"/></radialGradient>
      <linearGradient id="wis" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a3aa8"/><stop offset=".6" stop-color="#a87ae0"/><stop offset="1" stop-color="#e8d0ff"/></linearGradient>
      <linearGradient id="gnd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${groundTop}"/><stop offset="1" stop-color="#05040a"/></linearGradient>
      <radialGradient id="vig" cx="50%" cy="55%" r="75%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></radialGradient>
    </defs>
    <rect width="${VW}" height="${VH}" fill="url(#sky)"/>
    ${stars}
    <circle cx="${moonX}" cy="110" r="110" fill="url(#moonglow)"/>
    <circle cx="${moonX}" cy="110" r="${red ? 44 : 36}" fill="${sc.moon}"/>
    ${red ? '' : `<circle cx="${moonX - 10}" cy="100" r="7" fill="#000" opacity=".06"/><circle cx="${moonX + 12}" cy="122" r="5" fill="#000" opacity=".06"/>`}
    ${mountains(GROUND - 150, 5, 110, far, r)}
    ${sc.fx === 'mist' || id === 'valley' ? '' : mist(GROUND - 140, 0.18, 20)}
    ${id === 'valley' ? '' : treeRow(sc.tree, GROUND - 60, 9, 140, 220, mid, r)}
    ${landmark(id, r)}
    ${mist(GROUND - 30, sc.fx === 'mist' ? 0.4 : 0.22, 14)}
    <rect y="${GROUND}" width="${VW}" height="${VH - GROUND}" fill="url(#gnd)"/>
    <path d="M0,${GROUND} ${Array.from({ length: 40 }, (_, i) => `L${i * 10 + 5},${GROUND - 3 - r() * 7} L${i * 10 + 10},${GROUND}`).join(' ')}" fill="${groundTop}"/>
    ${id === 'valley' || id === 'dojo' || id === 'shrine' || id === 'wisteria' ? '' : edgeTrees(sc.tree, near, r)}
    ${sc.fx === 'mist' ? mist(GROUND + 20, 0.35, 10) : ''}
    ${particles(sc.fx, r)}
    <rect width="${VW}" height="${VH}" fill="url(#vig)"/>
  </svg>`;
}
