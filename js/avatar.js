// Layered 2D anime-style character renderer. Everything is SVG built from the "look" object.
import { BREATHING } from './data.js';

let uid = 0;
const INK = '#24181d';

export function shade(hex, amt) {
  const n = parseInt((hex || '#888888').slice(1), 16);
  let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round((t - r) * p + r); g = Math.round((t - g) * p + g); b = Math.round((t - b) * p + b);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

const mirror = (s) => `<g transform="matrix(-1 0 0 1 240 0)">${s}</g>`;
const ellipsePath = (cx, cy, rx, ry) => `M${cx - rx},${cy} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0Z`;

export function bladeColor(weapon, breathing) {
  if (weapon.blade && weapon.blade !== 'auto') return weapon.blade;
  return breathing ? BREATHING[breathing].blade : '#9aa3b5';
}

/* ---------------- hair ---------------- */
const BACK_CAP = 'M66,100 C62,40 178,40 174,100 L170,112 L70,112Z';
const SMOOTH_BANGS = 'M66,100 C60,44 90,20 120,20 C150,20 180,44 174,100 L168,80 Q164,96 160,104 Q156,82 146,70 Q144,90 134,98 Q136,78 126,66 Q122,86 112,94 Q112,76 104,68 Q98,86 88,92 Q90,78 84,72 Q78,90 72,104Z';
const SIDE_STRANDS = 'M70,94 Q64,120 72,142 L80,140 Q76,118 81,94Z M170,94 Q176,120 168,142 L160,140 Q164,118 159,94Z';
const SPIKY_FRONT = 'M64,104 C56,44 88,16 122,18 C154,18 184,42 176,104 L170,78 L168,112 L158,70 L150,96 L144,62 L132,100 L126,64 L116,98 L110,60 L100,94 L94,64 L84,100 L80,72 L72,112 L70,82Z';

function braids() {
  let d = '';
  for (const x of [70, 170]) {
    for (let i = 0; i < 9; i++) {
      const y = 122 + i * 14, ox = (i % 2 ? 2 : -2) * (x < 120 ? 1 : -1);
      d += ellipsePath(x + ox, y, 8 - i * 0.25, 9);
    }
  }
  return d;
}

// Flame mane: flickering locks all round the head (tips get the tip colour).
function flameMane() {
  const cx = 120, cy = 92;
  let d = 'M66,170 L60,150';
  const n = 14, a0 = 160, a1 = 380;
  for (let i = 0; i < n; i++) {
    const t0 = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180, t1 = ((a0 + ((a1 - a0) * (i + 1)) / n) * Math.PI) / 180;
    const tm = (t0 + t1) / 2, rT = 78 + (i % 3) * 6, rV = 54;
    const tip = [cx + Math.cos(tm) * rT + Math.sin(tm) * 8, cy + Math.sin(tm) * rT - Math.cos(tm) * 8];
    const v = [cx + Math.cos(t1) * rV, cy + Math.sin(t1) * rV];
    const c1 = [cx + Math.cos(t0) * 70, cy + Math.sin(t0) * 70];
    d += ` Q${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${tip[0].toFixed(1)},${tip[1].toFixed(1)} Q${(cx + Math.cos(tm) * 60).toFixed(1)},${(cy + Math.sin(tm) * 60).toFixed(1)} ${v[0].toFixed(1)},${v[1].toFixed(1)}`;
  }
  return d + ' L182,150 L174,172 Q150,150 120,150 Q90,150 66,170Z';
}
const FLAME_FRONT = 'M62,106 C54,44 88,14 122,16 C156,16 188,42 178,106 Q174,84 166,110 Q164,78 152,96 Q150,66 138,90 Q134,58 122,92 Q112,58 106,90 Q96,64 90,96 Q80,78 76,110 Q70,84 62,106Z';

function hairShapes(style) {
  switch (style) {
    case 'flame': return { back: flameMane(), front: FLAME_FRONT };
    case 'spiky': return { back: 'M62,112 L42,100 L58,88 L38,72 L60,64 L46,44 L72,44 L66,20 L92,30 L96,6 L116,24 L130,2 L142,24 L162,8 L164,32 L188,24 L180,48 L202,52 L184,70 L204,84 L182,92 L196,108 L176,112 C176,60 160,40 120,40 C80,40 62,60 62,112Z', front: SPIKY_FRONT };
    case 'wild': return { back: 'M62,124 L34,114 L52,94 L26,76 L56,64 L42,36 L76,40 L82,8 L108,28 L124,0 L140,28 L166,8 L170,40 L202,36 L186,64 L216,76 L190,94 L208,114 L178,124 C178,60 160,40 120,40 C80,40 62,60 62,124Z', front: 'M62,108 C54,40 88,12 122,14 C156,14 188,40 178,108 L172,80 L170,116 L160,72 L154,100 L146,62 L134,104 L128,62 L118,102 L110,58 L100,98 L92,62 L82,104 L78,74 L70,116 L68,84Z' };
    case 'neat': return { back: BACK_CAP, front: 'M68,96 C62,46 90,24 120,24 C152,24 178,46 172,96 C168,76 160,64 150,60 C146,74 132,84 112,88 C122,80 128,72 130,62 C112,76 92,80 78,82 C74,86 70,90 68,96Z' };
    case 'long': return { back: 'M68,90 C64,30 176,30 172,90 L182,236 Q150,248 120,244 Q90,248 58,236Z', front: 'M68,100 C62,46 90,24 120,24 C150,24 178,46 172,100 L170,150 L160,152 L158,96 L150,84 L142,92 L134,80 L126,92 L118,80 L110,92 L102,80 L94,90 L84,84 L82,152 L70,150Z' };
    case 'ponytail': return { back: BACK_CAP + ' M138,40 C176,20 202,56 190,100 C184,140 198,180 182,224 C172,188 156,150 158,104 C158,72 150,54 138,40Z', front: SMOOTH_BANGS + ' ' + SIDE_STRANDS };
    case 'side': return { back: BACK_CAP + ' M84,52 C44,52 32,104 44,174 C52,138 66,112 90,82Z', front: SMOOTH_BANGS + ' ' + SIDE_STRANDS };
    case 'braids': return { back: BACK_CAP + ' ' + braids(), front: SMOOTH_BANGS };
    case 'bob': return { back: 'M66,92 C62,36 178,36 174,92 L178,152 Q152,160 140,142 L100,142 Q88,160 62,152Z', front: 'M68,100 C62,46 90,24 120,24 C150,24 178,46 172,100 L172,152 L162,152 L160,84 L80,84 L78,152 L68,152Z' };
    case 'bun': return { back: BACK_CAP + ' ' + ellipsePath(120, 26, 21, 20), front: SMOOTH_BANGS + ' ' + SIDE_STRANDS };
    default: return { back: BACK_CAP, front: SPIKY_FRONT };
  }
}

/* ---------------- face parts ---------------- */
const FACES = {
  oval: 'M76,90 C76,50 98,40 120,40 C142,40 164,50 164,90 C164,112 158,126 146,136 Q132,146 120,148 Q108,146 94,136 C82,126 76,112 76,90Z',
  round: 'M74,92 C74,50 96,40 120,40 C144,40 166,50 166,92 C166,125 146,144 120,144 C94,144 74,125 74,92Z',
  sharp: 'M77,88 C77,50 98,40 120,40 C142,40 163,50 163,88 C163,110 150,128 120,150 C90,128 77,110 77,88Z',
  square: 'M75,88 C75,50 96,40 120,40 C144,40 165,50 165,88 L164,118 C160,135 140,145 120,146 C100,145 80,135 76,118Z',
};

const EYE_SHAPES = {
  round: { white: ellipsePath(100, 104, 11, 12.5), iris: [100.5, 105, 8, 10.5], lash: 'M87,100 Q92,89 101,90 Q110,90 114,97', lw: 3.4 },
  sharp: { white: 'M88,104 Q96,95 113,97 Q110,108 100,109 Q91,109 88,104Z', iris: [101, 103, 6.5, 8.5], lash: 'M85,104 Q95,93 115,96', lw: 3.6 },
  gentle: { white: 'M88,102 Q99,92 112,101 Q109,113 100,113 Q90,112 88,102Z', iris: [100.5, 105, 7.5, 9.5], lash: 'M86,104 Q97,90 113,100', lw: 3.2 },
  fierce: { white: 'M88,99 Q100,95 113,101 Q110,110 100,110 Q90,109 88,99Z', iris: [101, 104, 6.5, 8], lash: 'M85,96 Q101,93 115,101', lw: 4 },
  sleepy: { white: 'M88,104 Q100,100 112,104 Q110,113 100,113 Q90,113 88,104Z', iris: [100.5, 108, 7.5, 9], lash: 'M87,104 Q100,99 113,104', lw: 3.2 },
  wide: { white: ellipsePath(100, 103, 12, 14), iris: [100.5, 104, 6, 7], lash: 'M86,99 Q100,86 114,98', lw: 3 },
  happy: { white: null, lash: 'M89,107 Q100,95 111,107', lw: 3.4 },
  blaze: { white: ellipsePath(100, 104, 12, 12.5), iris: [100.5, 104.5, 10, 10.5], lash: 'M86,99 Q92,88 102,89 Q111,89 115,96', lw: 3.6 },
};

// Demon Slayer-style eye: ringed iris, dark upper lid shadow, heavy winged lash.
function eye(style, gradId, clipId, color, fem) {
  return `<g transform="translate(100 104) scale(${fem ? 1.2 : 1.12}) translate(-100 -104)">${eyeInner(style, gradId, clipId, color, fem)}</g>`;
}
function eyeInner(style, gradId, clipId, color, fem) {
  const e = EYE_SHAPES[style] || EYE_SHAPES.round;
  if (!e.white) return `<path d="${e.lash}" fill="none" stroke="${INK}" stroke-width="${e.lw + 0.6}" stroke-linecap="round"/>`;
  const [cx, cy, rx, ry] = e.iris;
  const ring = shade(color, -0.55);
  if (style === 'blaze') {
    // Fire eyes: gold outer iris, a blazing red ring, gold core and a tiny pupil.
    return `<path d="${e.white}" fill="#fffdf8"/>
    <g clip-path="url(#${clipId})">
      <circle cx="${cx}" cy="${cy}" r="${rx}" fill="#f7c63a" stroke="#b8501a" stroke-width="1.4"/>
      <circle cx="${cx}" cy="${cy}" r="${rx * 0.72}" fill="${color}"/>
      <circle cx="${cx}" cy="${cy}" r="${rx * 0.42}" fill="#ffd25a"/>
      <circle cx="${cx}" cy="${cy}" r="${rx * 0.2}" fill="#2a0a0a"/>
      <circle cx="${cx - rx * 0.4}" cy="${cy - ry * 0.42}" r="2.2" fill="#fff"/>
    </g>
    <path d="${e.lash}" fill="none" stroke="${INK}" stroke-width="${e.lw + 2}" stroke-linecap="round"/>
    <path d="M86,99 L80,93 M87,102 L81,100" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/>`;
  }
  return `<path d="${e.white}" fill="#fffdf8"/>
    <g clip-path="url(#${clipId})">
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${gradId})" stroke="${ring}" stroke-width="1.4"/>
      <ellipse cx="${cx}" cy="${cy + 0.5}" rx="${rx * 0.68}" ry="${ry * 0.7}" fill="none" stroke="${ring}" stroke-width=".9" opacity=".7"/>
      <ellipse cx="${cx}" cy="${cy + 1}" rx="${rx * 0.36}" ry="${ry * 0.42}" fill="#120a0e"/>
      <path d="M${cx - rx - 4},${cy - ry * 0.55} Q${cx},${cy - ry - 6} ${cx + rx + 4},${cy - ry * 0.55} L${cx + rx + 4},${cy - ry - 8} L${cx - rx - 4},${cy - ry - 8}Z" fill="#000" opacity=".28"/>
      <ellipse cx="${cx - rx * 0.38}" cy="${cy - ry * 0.4}" rx="${Math.max(1.8, rx * 0.3)}" ry="${Math.max(2.2, ry * 0.26)}" fill="#fff"/>
      <circle cx="${cx + rx * 0.35}" cy="${cy + ry * 0.5}" r="${Math.max(0.9, rx * 0.14)}" fill="#fff" opacity=".85"/>
    </g>
    <path d="${e.lash}" fill="none" stroke="${INK}" stroke-width="${e.lw + 2}" stroke-linecap="round"/>
    <path d="M87,100 L82,96 M87,102 L83,101" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
    ${fem ? `<path d="M88,98 L82,92 M90,96 L86,89 M89,${cy + ry - 3} L85,${cy + ry}" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>` : ''}
    <path d="M92,${cy + ry - 0.5} Q100,${cy + ry + 2.5} 108,${cy + ry - 1}" fill="none" stroke="${INK}" stroke-width="1" opacity=".55"/>`;
}

const BROWS = {
  soft: ['M88,88 Q99,82 111,86', 3], thick: ['M87,88 Q99,80 112,86', 5.5], worried: ['M88,89 Q100,87 111,81', 3],
  angry: ['M87,82 Q100,84 112,90', 4], thin: ['M89,87 Q100,83 110,86', 1.8],
};
function brow(style, color) {
  if (style === 'forked') return `<path d="M113,88 Q100,79 86,81 L78,72 L88,78 L82,68 Q99,74 113,84Z" fill="#24140e"/>`;
  if (style === 'dots') return `<ellipse cx="102" cy="84" rx="4.5" ry="3" fill="${color}"/>`;
  const [d, w] = BROWS[style] || BROWS.soft;
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
}

function nose(style, skin) {
  const c = shade(skin, -0.32);
  switch (style) {
    case 'dot': return `<circle cx="120" cy="117" r="1.4" fill="${c}"/>`;
    case 'button': return `<path d="M116,117 Q120,121 124,117" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>`;
    case 'sharp': return `<path d="M121,106 L116,119 L121,119" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"/>`;
    case 'none': return '';
    default: return `<path d="M120,111 L118,118 L121,118" fill="none" stroke="${c}" stroke-width="1.6" stroke-linecap="round"/>`;
  }
}

function mouth(style) {
  const s = `fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"`;
  switch (style) {
    case 'grin': return `<path d="M110,127 Q120,141 130,127Z" fill="#8a2a33" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M112,128 L128,128 L127,131 L113,131Z" fill="#fff"/>`;
    case 'fang': return `<path d="M111,128 Q120,135 129,128" ${s}/><path d="M124,130.5 L126,135 L127.5,129.8Z" fill="#fff" stroke="${INK}" stroke-width=".8"/>`;
    case 'cat': return `<path d="M111,128 Q115.5,133 120,128 Q124.5,133 129,128" ${s}/>`;
    case 'neutral': return `<path d="M114,130 L126,130" ${s}/>`;
    case 'o': return `<ellipse cx="120" cy="130" rx="3.6" ry="4.4" fill="#8a2a33" stroke="${INK}" stroke-width="1.8"/>`;
    case 'frown': return `<path d="M112,132 Q120,127 128,132" ${s}/>`;
    case 'smirk': return `<path d="M113,130 Q122,132 128,126" ${s}/>`;
    default: return `<path d="M112,128 Q120,134 128,128" ${s}/>`;
  }
}

function ear(style, skin) {
  const inner = `<path d="M74,100 Q70,106 74,113" fill="none" stroke="${shade(skin, -0.25)}" stroke-width="1.6"/>`;
  const fill = `fill="${skin}" class="ol"`;
  switch (style) {
    case 'small': return `<ellipse cx="77" cy="107" rx="5" ry="8" ${fill}/>`;
    case 'big': return `<ellipse cx="74" cy="106" rx="10" ry="14" ${fill}/>${inner}`;
    case 'pointed': return `<path d="M80,98 L60,84 Q63,104 70,114 Q74,119 80,116Z" ${fill}/>${inner}`;
    default: return `<ellipse cx="76" cy="107" rx="7" ry="11" ${fill}/>${inner}`;
  }
}

function earring(style, color) {
  switch (style) {
    case 'hanafuda': return `<path d="M74,117 L74,124" stroke="${INK}" stroke-width="1.2"/><rect x="68" y="124" width="12" height="18" rx="1.5" fill="#f7f3ea" class="ol" stroke-width="1.4"/><circle cx="74" cy="133" r="4.2" fill="#c0303a"/><path d="M68,138 L80,138" stroke="#c0303a" stroke-width="1.2"/>`;
    case 'hoops': return `<circle cx="74" cy="125" r="6" fill="none" stroke="${color}" stroke-width="2.6"/>`;
    case 'studs': return `<circle cx="74" cy="118" r="2.8" fill="${color}" class="ol" stroke-width="1"/>`;
    case 'tassel': return `<path d="M74,117 L74,127" stroke="${color}" stroke-width="1.4"/><path d="M74,126 L70,143 Q74,147 78,143Z" fill="${color}" class="ol" stroke-width="1"/>`;
    case 'crystal': return `<path d="M74,117 L74,121" stroke="${INK}" stroke-width="1"/><path d="M74,121 L78.5,130 L74,140 L69.5,130Z" fill="${color}" opacity=".92" stroke="#fff" stroke-width="1"/>`;
    default: return '';
  }
}

function scar(style, skin) {
  const c = shade(skin, -0.38);
  const s = `fill="none" stroke="${c}" stroke-width="2.2" stroke-linecap="round"`;
  switch (style) {
    case 'forehead': return `<path d="M95,70 Q104,63 111,72 Q108,81 99,84 Q91,79 95,70Z" fill="#a3473a" opacity=".72"/>`;
    case 'cheek': return `<path d="M138,115 L153,106 M140,120 L155,111" ${s}/>`;
    case 'eye': return `<path d="M97,82 L104,126" ${s} stroke-width="2.6"/><path d="M97,92 L103,91 M99,106 L105,105 M101,118 L107,117" ${s} stroke-width="1.3"/>`;
    case 'cross': return `<path d="M86,112 L98,122 M98,112 L86,122" ${s}/>`;
    case 'nose': return `<path d="M103,113 L137,110" ${s} stroke-width="2.6"/>`;
    case 'chin': return `<path d="M124,140 L131,134" ${s}/>`;
    default: return '';
  }
}

function mark(style, skin) {
  const c = shade(skin, -0.35);
  switch (style) {
    case 'beauty': return `<circle cx="146" cy="117" r="1.7" fill="${INK}"/>`;
    case 'freckles': return [[106, 114], [110, 118], [102, 119], [134, 114], [130, 118], [138, 119]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="${c}"/>`).join('');
    case 'flameMark': return `<path d="M99,90 Q90,79 97,66 Q99,74 105,75 Q103,64 112,57 Q110,70 116,76 Q118,85 109,91Z" fill="#c0303a" opacity=".85"/>`;
    case 'vineMark': return `<path d="M152,90 Q160,100 153,110 Q146,119 155,128" fill="none" stroke="#e05a8a" stroke-width="2"/><ellipse cx="157" cy="101" rx="3.5" ry="1.8" fill="#e05a8a" transform="rotate(-30 157 101)"/><ellipse cx="149" cy="118" rx="3.5" ry="1.8" fill="#e05a8a" transform="rotate(30 149 118)"/>`;
    case 'moon': return `<path d="M144,112 a6.5,6.5 0 1,0 7,9 a5,5 0 1,1 -7,-9Z" fill="${c}"/>`;
    case 'star': return `<path d="M148,110 L149.6,114.4 L154,114.6 L150.6,117.4 L151.8,121.6 L148,119.2 L144.2,121.6 L145.4,117.4 L142,114.6 L146.4,114.4Z" fill="${c}"/>`;
    case 'paint': {
      // A red flower-burst of dots and rays around the left eye.
      const rays = [[200, 22, 5], [225, 24, 4.5], [250, 22, 5], [275, 20, 4], [300, 22, 4.5], [170, 20, 4], [145, 18, 3.5]];
      return `<g fill="#b8202e" stroke="#b8202e" stroke-width="2">${rays.map(([a, r, c]) => {
        const t = (a * Math.PI) / 180, x = 98 + Math.cos(t) * r, y = 102 + Math.sin(t) * r;
        return `<path d="M${98 + Math.cos(t) * 11},${102 + Math.sin(t) * 11} L${x.toFixed(1)},${y.toFixed(1)}" fill="none"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${c}" stroke="none"/>`;
      }).join('')}</g>`;
    }
    default: return '';
  }
}

// Masks share one shape (origin-centred, ~30x38). kind: fox | sun | flower | scar
function maskShape(kind) {
  const base = `<path d="M-12,-14 L-10,-27 L-2,-17Z M12,-14 L10,-27 L2,-17Z" fill="#f7f3ea" class="ol" stroke-width="1.5"/>
    <path d="M-11,-16 L-10,-23 L-5,-17Z M11,-16 L10,-23 L5,-17Z" fill="${kind === 'flower' ? '#f0c23a' : '#d83a3a'}"/>
    <path d="M-15,-6 Q-15,-20 0,-20 Q15,-20 15,-6 Q15,10 0,19 Q-15,10 -15,-6Z" fill="#f7f3ea" class="ol"/>`;
  switch (kind) {
    case 'sun': return base + `<circle cx="0" cy="-11" r="4" fill="#d83a3a"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<circle cx="${(Math.cos((a * Math.PI) / 180) * 7).toFixed(1)}" cy="${(-11 + Math.sin((a * Math.PI) / 180) * 7).toFixed(1)}" r="1.2" fill="#d83a3a"/>`).join('')}
      <path d="M-10,-2 L-3,-1 M10,-2 L3,-1" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/><path d="M-12,4 Q-8,6 -6,3 M12,4 Q8,6 6,3" fill="none" stroke="#d83a3a" stroke-width="1.6"/><circle cx="0" cy="12" r="1.8" fill="#d83a3a"/>`;
    case 'flower': return base + `<path d="M-10,-1 Q-6,-5 -2,-1 M10,-1 Q6,-5 2,-1" fill="none" stroke="${INK}" stroke-width="1.6"/><path d="M-3,9 Q0,12 3,9" fill="none" stroke="#d83a3a" stroke-width="1.6"/>
      ${[[9, -9, 4], [11, 3, 3.2], [3, -15, 2.6]].map(([x, y, r]) => `<g transform="translate(${x},${y})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="${-r * 0.7}" rx="${r * 0.5}" ry="${r * 0.7}" fill="#4a8ae0" transform="rotate(${a})"/>`).join('')}<circle r="${r * 0.3}" fill="#f0e060"/></g>`).join('')}`;
    case 'scar': return base + `<path d="M-11,-3 Q-6,-8 -2,-2 Q-6,1 -11,-3Z M11,-3 Q6,-8 2,-2 Q6,1 11,-3Z" fill="${INK}"/><path d="M-3,10 L3,10" stroke="${INK}" stroke-width="1.5"/><path d="M4,2 L12,10 M6,6 L9,4" stroke="#b8604a" stroke-width="1.4"/>`;
    default: return base + `<path d="M-9,-3 Q-5,-8 -2,-3 M9,-3 Q5,-8 2,-3" fill="none" stroke="${INK}" stroke-width="1.6"/><path d="M-11,-8 Q-6,-14 -1,-9 M11,-8 Q6,-14 1,-9" fill="none" stroke="#c0303a" stroke-width="1.8"/><path d="M-5,9 Q0,13 5,9" fill="none" stroke="#c0303a" stroke-width="1.6"/>`;
  }
}
// Headgear sits above hair and accessories (face-part coordinates).
function headgear(kind, color) {
  const dk = shade(color, -0.35);
  switch (kind) {
    case 'kasa': return accessory('strawHat');
    case 'hachimaki': return `<path d="M66,74 Q120,58 174,74 L174,88 Q120,72 66,88Z" fill="${color}" class="ol" stroke-width="1.8"/>
      <path d="M174,80 Q196,86 206,100 L196,104 Q190,94 176,88Z M174,84 Q190,100 190,118 L180,116 Q180,100 172,90Z" fill="${color}" class="ol" stroke-width="1.6"/><circle cx="176" cy="82" r="5" fill="${dk}" class="ol" stroke-width="1.4"/>`;
    case 'jingasa': return `<path d="M96,70 L94,146 M144,70 L146,146" stroke="#c8a868" stroke-width="1.6"/>
      <path d="M34,62 Q120,18 206,62 Q120,76 34,62Z" fill="#1e1a20" class="ol" stroke-width="2.2"/><path d="M60,56 Q120,32 180,56" fill="none" stroke="#4a4250" stroke-width="2"/>
      <circle cx="120" cy="40" r="7" fill="#d9a83a" class="ol" stroke-width="1.4"/><circle cx="120" cy="40" r="3" fill="${color}"/>`;
    case 'zukin': return `<path d="M58,112 C48,26 192,26 182,112 L184,150 L168,148 L168,104 C168,62 72,62 72,104 L72,148 L56,150Z" fill="${color}" class="ol"/>
      <path d="M80,50 Q120,36 160,50 M64,98 Q66,74 78,62" fill="none" stroke="${dk}" stroke-width="1.8"/>`;
    case 'tenugui': {
      let dots = '';
      for (let i = 0; i < 14; i++) dots += `<circle cx="${80 + ((i * 29) % 80)}" cy="${40 + ((i * 17) % 30)}" r="2" fill="#fff" opacity=".7"/>`;
      return `<path d="M64,78 Q60,24 120,20 Q180,24 176,78 Q120,64 64,78Z" fill="${color}" class="ol"/>${dots}
        <path d="M140,28 Q150,16 160,24 Q152,30 146,32Z M146,30 Q160,34 164,46 Q154,42 146,34Z" fill="${color}" class="ol" stroke-width="1.4"/>`;
    }
    default: return '';
  }
}
const sideMask = (kind) => `<g transform="translate(160,50) rotate(24)">${maskShape(kind)}</g>`;

function accessory(style, color) {
  switch (style) {
    case 'sunMask': return sideMask('sun');
    case 'flowerMask': return sideMask('flower');
    case 'scarMask': return `<path d="M70,74 Q120,58 170,74" fill="none" stroke="#a8202e" stroke-width="5"/><path d="M168,74 L176,98 M172,74 L182,94" stroke="#a8202e" stroke-width="3"/>` + sideMask('scar');
    case 'maskFace': return `<g transform="translate(120,100) scale(2.9)">${maskShape('sun')}</g>`;
    case 'bigButterfly': {
      const wing = `<path d="M0,0 C-6,-22 -30,-28 -30,-10 C-30,0 -14,2 0,0Z" fill="url(#bfly)" class="ol" stroke-width="1.4"/><path d="M0,2 C-16,4 -24,18 -12,22 C-4,24 0,12 0,2Z" fill="url(#bfly)" class="ol" stroke-width="1.4"/>
        <path d="M-2,-2 L-24,-14 M-4,-1 L-20,-4 M-2,3 L-14,14" stroke="${INK}" stroke-width="1"/><circle cx="-24" cy="-8" r="1.4" fill="#fff"/><circle cx="-26" cy="-14" r="1.2" fill="#fff"/>`;
      return `<defs><linearGradient id="bfly" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="${color}"/><stop offset="1" stop-color="${shade(color, -0.45)}"/></linearGradient></defs>
        <g transform="translate(156,46) rotate(14) scale(1.05)">${wing}<g transform="scale(-1,1)">${wing}</g><path d="M0,-6 L0,10" stroke="${INK}" stroke-width="2.4"/><path d="M0,-6 L-6,-16 M0,-6 L6,-16" stroke="${INK}" stroke-width="1"/></g>`;
    }
    case 'foxMask': return sideMask('fox');
    case 'strawHat': {
      let weave = '';
      for (let i = -5; i <= 5; i++) weave += `M120,10 L${120 + i * 17},${76 - Math.abs(i) * 1.5} `;
      return `<path d="M96,72 L92,148 M144,72 L148,148" stroke="#b89a5a" stroke-width="1.6"/>
        <path d="M30,78 Q120,-6 210,78 Q120,92 30,78Z" fill="#cdb27a" class="ol" stroke-width="2.4"/><path d="${weave}" stroke="#9a7e46" stroke-width="1.2" opacity=".8"/>
        <path d="M44,74 Q120,62 196,74" fill="none" stroke="#9a7e46" stroke-width="1.4"/><path d="M120,40 Q170,52 196,74 L206,80 Q170,86 150,84Z" fill="#000" opacity=".12"/>`;
    }
    case 'ribbon': return `<g transform="translate(150,40) rotate(15)"><path d="M0,0 L-19,-11 L-18,11Z M0,0 L19,-11 L18,11Z" fill="${color}" class="ol" stroke-width="1.6"/><path d="M-2,2 L-8,22 M2,2 L8,22" stroke="${color}" stroke-width="4" stroke-linecap="round"/><circle r="4.5" fill="${shade(color, -0.2)}" class="ol" stroke-width="1.4"/></g>`;
    case 'butterfly': {
      const b = `<path d="M0,0 L-12,-10 Q-16,0 -6,2 L-10,10 Q-2,10 0,0 L10,10 Q2,10 0,0 L12,-10 Q16,0 6,2Z" fill="${color}" class="ol" stroke-width="1.2"/><path d="M0,-5 L0,6" stroke="${INK}" stroke-width="1.6"/>`;
      return `<g transform="translate(154,54) rotate(18)">${b}</g><g transform="translate(86,54) rotate(-18) scale(.8)">${b}</g>`;
    }
    case 'headband': {
      const beads = (x) => Array.from({ length: 9 }, (_, i) => `<circle cx="${x + Math.sin(i * 0.8) * 1.5}" cy="${84 + i * 7}" r="3" fill="#e8ecf4" class="ol" stroke-width="1"/>`).join('');
      return `${beads(68)}${beads(172)}<path d="M64,66 Q120,46 176,66 L176,84 Q120,64 64,84Z" fill="#d6d9e0" class="ol" stroke-width="1.8"/>
        ${[[94, 66, 7], [120, 60, 9], [146, 66, 7], [78, 72, 4.5], [162, 72, 4.5]].map(([x, y, r]) => `<path d="M${x},${y - r} L${x + r * 0.9},${y} L${x},${y + r} L${x - r * 0.9},${y}Z" fill="${color}" class="ol" stroke-width="1.2"/><path d="M${x - r * 0.4},${y - r * 0.3} L${x},${y - r * 0.7}" stroke="#fff" stroke-width="1.2"/>`).join('')}`;
    }
    case 'flower': return `<g transform="translate(84,52)">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-7" rx="5" ry="7" fill="${color}" class="ol" stroke-width="1.2" transform="rotate(${a})"/>`).join('')}<circle r="3.6" fill="#f0c23a"/></g>`;
    default: return '';
  }
}

/* ---------------- species heads ---------------- */
// Boar: a shaggy grey boar-head mask with pink-tipped ears, big blue eyes, pink snout and tusks.
function boarHead(fur, p) {
  const beard = shade(fur, -0.32), cx = 120, cy = 96;
  let d = '';
  for (let i = 0; i <= 48; i++) {
    const t = (i / 48) * Math.PI * 2, low = Math.sin(t) > -0.2;
    const sp = i % 2 ? (low ? 11 : 5) : 0;
    d += `${i ? 'L' : 'M'}${(cx + Math.cos(t) * (52 + sp)).toFixed(1)},${(cy + Math.sin(t) * (54 + sp) * (Math.sin(t) > 0 ? 1.12 : 1)).toFixed(1)} `;
  }
  let jag = 'M50,124';
  for (let x = 50; x <= 190; x += 10) jag += ` L${x + 5},${116 + ((x * 3) % 8)} L${x + 10},126`;
  let strokes = '';
  for (let i = 0; i < 22; i++) { const x = 78 + ((i * 37) % 84), y = 54 + ((i * 23) % 40); strokes += `M${x},${y} l${(i % 3) - 1},5 `; }
  const ear = `<path d="M86,58 L72,22 L106,46Z" fill="#7a6e8e" class="ol"/><path d="M84,50 L76,30 L98,44Z" fill="#e8869e"/>`;
  const eye = `<path d="M82,98 Q98,80 116,96 Q100,114 82,98Z" fill="#14101c"/><circle cx="99" cy="97" r="9.5" fill="#3462cc"/><circle cx="99" cy="97" r="6" fill="#6f9cf2"/><circle cx="99" cy="97" r="2.8" fill="#0c1230"/><circle cx="95.5" cy="93.5" r="2.6" fill="#fff"/>
    <path d="M80,88 Q96,76 114,84 M84,108 Q98,114 110,108" fill="none" stroke="${beard}" stroke-width="1.6"/>`;
  return `<defs><clipPath id="${p}bh"><path d="${d}Z"/></clipPath></defs>
    ${ear}${mirror(ear)}
    <path d="${d}Z" fill="${fur}" class="ol"/>
    <g clip-path="url(#${p}bh)"><path d="${jag} L190,190 L50,190Z" fill="${beard}"/><path d="M152,40 Q186,100 150,170 L190,170 L190,40Z" fill="#000" opacity=".14"/></g>
    <path d="${strokes}" stroke="${beard}" stroke-width="1.2" opacity=".8"/>
    ${eye}${mirror(eye)}
    <path d="M100,120 Q120,110 140,120 L148,142 Q120,156 92,142Z" fill="#e07a98" class="ol"/>
    <path d="M104,122 Q120,116 136,122" fill="none" stroke="#f6aac0" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="110" cy="140" rx="4.5" ry="3.2" fill="#6a1e38"/><ellipse cx="130" cy="140" rx="4.5" ry="3.2" fill="#6a1e38"/>
    <path d="M94,142 Q88,132 93,121 Q98,132 101,140Z M146,142 Q152,132 147,121 Q142,132 139,140Z" fill="#fffaf0" class="ol" stroke-width="1.4"/>`;
}

// Swordsmith: a comic hyottoko mask, wild curly hair and a polka-dot headband with two knives.
function smithHead(L) {
  const hair = L.hairColor || '#1b1416';
  let curls = '';
  for (let i = 0; i < 22; i++) {
    const a = ((150 + i * 11.5) * Math.PI) / 180, r = 58 + (i % 3) * 6;
    curls += `<circle cx="${(120 + Math.cos(a) * r).toFixed(1)}" cy="${(98 + Math.sin(a) * r * 0.95).toFixed(1)}" r="${13 + (i % 4) * 2}" fill="${hair}" class="ol"/>`;
  }
  for (const [x, y] of [[58, 140], [182, 140], [64, 166], [176, 166]]) curls += `<circle cx="${x}" cy="${y}" r="14" fill="${hair}" class="ol"/>`;
  const knife = (x) => `<path d="M${x - 4},76 L${x - 4},30 Q${x},18 ${x + 4},30 L${x + 4},76Z" fill="#dfe4ec" class="ol" stroke-width="1.6"/><path d="M${x + 1},30 L${x + 1},74" stroke="#fff" stroke-width="1.2"/>`;
  let dots = '';
  for (let x = 76; x <= 164; x += 11) dots += `<circle cx="${x}" cy="${74 - Math.sin(((x - 70) / 100) * Math.PI) * 7}" r="2.6" fill="${INK}"/>`;
  return `${curls}${knife(104)}${knife(136)}
    <ellipse cx="120" cy="102" rx="46" ry="50" fill="#f0dcc0" class="ol"/>
    <path d="M150,66 Q172,104 146,148 L170,148 L170,66Z" fill="#000" opacity=".1"/>
    <path d="M88,86 Q98,78 110,86 M130,86 Q142,78 152,86" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
    ${[100, 140].map((x) => `<circle cx="${x}" cy="100" r="8.5" fill="#fff" class="ol" stroke-width="2"/><circle cx="${x + 1}" cy="101" r="4.4" fill="${INK}"/>`).join('')}
    <ellipse cx="94" cy="118" rx="7" ry="4" fill="#ff8a8a" opacity=".5"/><ellipse cx="146" cy="118" rx="7" ry="4" fill="#ff8a8a" opacity=".5"/>
    <path d="M118,112 L114,122 L120,122" fill="none" stroke="${shade('#f0dcc0', -0.4)}" stroke-width="1.8"/>
    <path d="M114,132 Q122,124 128,128" fill="none" stroke="${INK}" stroke-width="1.6"/>
    <ellipse cx="132" cy="130" rx="8" ry="7" fill="#e8848a" class="ol" stroke-width="2"/><ellipse cx="134" cy="130" rx="3" ry="2.6" fill="#5a1e2a"/>
    <path d="M68,72 Q120,56 172,72 L172,86 Q120,70 68,86Z" fill="#f7f4ee" class="ol" stroke-width="1.8"/>${dots}`;
}

// Muscle Mouse body (its own proportions: huge head and torso, thin legs, ragged fur shorts).
function capsule(x1, y1, x2, y2, r1, r2, fill) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len, f = (v) => v.toFixed(1);
  return `<path d="M${f(x1 + nx * r1)},${f(y1 + ny * r1)} L${f(x2 + nx * r2)},${f(y2 + ny * r2)} L${f(x2 - nx * r2)},${f(y2 - ny * r2)} L${f(x1 - nx * r1)},${f(y1 - ny * r1)}Z" fill="${fill}"/><circle cx="${f(x1)}" cy="${f(y1)}" r="${r1}" fill="${fill}"/><circle cx="${f(x2)}" cy="${f(y2)}" r="${r2}" fill="${fill}"/>`;
}

export function renderMouse(L, opts = {}) {
  const p = `ms${++uid}`;
  const fur = L.furColor || '#c9c4d6', light = shade(fur, 0.4), dark = shade(fur, -0.38);
  const gem = L.accColor || '#d8a6e8', shorts = L.shortsColor || '#3a2a4a', handC = '#5d5868';
  const action = opts.pose === 'action';
  const label = opts.name ? opts.name.replace(/[<>"&]/g, '') : 'Muscle Mouse';
  const style = `<style>.ol{stroke:${INK};stroke-width:2;stroke-linejoin:round}.mo *{fill:${INK};stroke:${INK};stroke-width:7px;stroke-linejoin:round}</style>`;

  const earsHead = `<circle cx="64" cy="62" r="34" fill="${fur}"/><circle cx="176" cy="62" r="34" fill="${fur}"/><ellipse cx="120" cy="114" rx="57" ry="55" fill="${fur}"/>`;
  const face = `<circle cx="66" cy="64" r="21" fill="#f2a2b8"/><circle cx="174" cy="64" r="21" fill="#f2a2b8"/>
    <path d="M60,58 Q66,48 76,52" fill="none" stroke="#d8809a" stroke-width="3"/><path d="M180,58 Q174,48 164,52" fill="none" stroke="#d8809a" stroke-width="3"/>
    <g clip-path="url(#${p}hc)"><path d="M150,70 Q186,112 152,168 L186,168 L186,70Z" fill="#000" opacity=".14"/></g>
    <path d="M100,136 Q120,198 140,136 Q120,148 100,136Z" fill="${light}" class="ol" stroke-width="1.8"/>
    <ellipse cx="120" cy="184" rx="5.5" ry="4" fill="#2a2030"/>
    <path d="M113,176 L82,168 M113,180 L84,184 M127,176 L158,168 M127,180 L156,184" stroke="${INK}" stroke-width="1.3" opacity=".8"/>
    ${[98, 142].map((x) => `<circle cx="${x}" cy="128" r="16" fill="#1a1420" class="ol" stroke-width="1.6"/><circle cx="${x}" cy="128" r="11.5" fill="none" stroke="#6e6880" stroke-width="1.6"/><circle cx="${x - 6}" cy="121" r="4.2" fill="#fff"/><circle cx="${x + 5}" cy="134" r="1.8" fill="#fff"/>`).join('')}
    <path d="M64,98 Q120,74 176,98 L174,116 Q120,92 66,116Z" fill="#efe4c4" class="ol" stroke-width="2"/>
    <path d="M70,104 Q120,82 170,104" fill="none" stroke="#c8b890" stroke-width="1.4"/>
    ${[[120, 95, 13, 9], [92, 102, 6, 6], [148, 102, 6, 6]].map(([x, y, w, h]) => `<path d="M${x - w},${y} L${x - w * 0.5},${y - h} L${x + w * 0.5},${y - h} L${x + w},${y} L${x + w * 0.5},${y + h} L${x - w * 0.5},${y + h}Z" fill="${gem}" class="ol" stroke-width="1.4"/><path d="M${x - w * 0.5},${y - h} L${x},${y} L${x + w * 0.5},${y - h} M${x - w},${y} L${x + w},${y}" stroke="#fff" stroke-width=".9" opacity=".8"/>`).join('')}
    <g fill="#3a2a5a" class="ol" stroke-width="1.6"><ellipse cx="180" cy="102" rx="9" ry="6" transform="rotate(-30 180 102)"/><ellipse cx="182" cy="114" rx="9" ry="6" transform="rotate(30 182 114)"/><path d="M178,108 L194,128 L186,130Z M178,108 L198,118 L194,124Z"/></g>`;

  if (opts.headOnly) {
    return `<svg viewBox="26 22 188 188" class="avatar-svg" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${style}<defs><clipPath id="${p}hc"><ellipse cx="120" cy="114" rx="57" ry="55"/></clipPath></defs><g class="mo">${earsHead}</g>${earsHead}${face}</svg>`;
  }

  const arms = action
    ? [[[66, 168], [28, 140], [36, 92]], [[174, 168], [204, 212], [180, 240]]]
    : [[[66, 168], [44, 222], [50, 272]], [[174, 168], [196, 222], [190, 272]]];
  const handPt = ([, e, w]) => { const dx = w[0] - e[0], dy = w[1] - e[1], l = Math.hypot(dx, dy); return [w[0] + (dx / l) * 9, w[1] + (dy / l) * 9]; };
  const armShape = ([sh, e, w]) => {
    const mx = (sh[0] + e[0]) / 2, my = (sh[1] + e[1]) / 2, out = mx < 120 ? -6 : 6;
    return capsule(sh[0], sh[1], e[0], e[1], 22, 15, fur) + `<circle cx="${mx + out}" cy="${my}" r="20" fill="${fur}"/>` + capsule(e[0], e[1], w[0], w[1], 15, 10, fur);
  };
  const torso = `<path d="M52,178 Q54,146 92,142 L148,142 Q186,146 188,178 L176,216 Q164,244 154,262 L86,262 Q76,244 64,216Z" fill="${fur}"/>`;
  const legs = capsule(104, 300, 100, 384, 10, 6, fur) + capsule(136, 300, 140, 384, 10, 6, fur) + `<ellipse cx="94" cy="390" rx="15" ry="6" fill="${fur}"/><ellipse cx="146" cy="390" rx="15" ry="6" fill="${fur}"/>`;
  const hands = arms.map((a) => { const [x, y] = handPt(a); return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${handC}"/>`; }).join('');
  const silhouette = legs + armShape(arms[0]) + armShape(arms[1]) + torso + earsHead;

  const lines = `<g fill="none" stroke="${dark}" stroke-width="2" stroke-linecap="round">
    <path d="M76,190 Q98,212 120,200 Q142,212 164,190"/><path d="M120,202 L120,254"/>
    ${[214, 230, 246].map((y) => `<path d="M105,${y} Q112,${y + 4} 118,${y} M122,${y} Q128,${y + 4} 135,${y}"/>`).join('')}
    <path d="M84,218 Q92,242 96,258 M156,218 Q148,242 144,258"/><path d="M62,190 Q72,168 92,164 M178,190 Q168,168 148,164"/></g>
    <path d="M150,146 Q186,150 188,178 L176,216 Q164,244 154,262 L142,262 Q158,206 150,146Z" fill="#000" opacity=".14"/>`;

  let hem = '';
  for (let x = 170; x > 124; x -= 8) hem += ` L${x - 4},${336 + ((x * 3) % 7)} L${x - 8},${324}`;
  let hem2 = '';
  for (let x = 116; x > 70; x -= 8) hem2 += ` L${x - 4},${336 + ((x * 5) % 7)} L${x - 8},${324}`;
  const shortsD = `M84,250 L156,250 Q166,286 172,326${hem} L124,322 L120,298 L116,322${hem2} L68,326 Q74,286 84,250Z`;
  const shortsSvg = `<path d="${shortsD}" fill="${shorts}" class="ol"/><path d="M96,262 L92,300 M110,262 L108,292 M132,262 L134,292 M146,262 L150,300" stroke="${shade(shorts, 0.25)}" stroke-width="1.5"/><path d="M84,250 L156,250" stroke="${shade(shorts, -0.3)}" stroke-width="3"/>`;

  const tail = `<path d="M150,262 Q222,272 206,332 Q196,372 228,398" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M150,262 Q222,272 206,332 Q196,372 228,398" fill="none" stroke="#e8b0bc" stroke-width="5" stroke-linecap="round"/>`;

  let weapons = '';
  if (opts.weapon) {
    const [a, b] = heldPieces(opts.weapon, bladeColor(opts.weapon, opts.breathing), opts.name, opts.trainee);
    const [lx, ly] = handPt(arms[0]), [rx, ry] = handPt(arms[1]);
    if (a) weapons += `<g transform="translate(${lx.toFixed(1)},${ly.toFixed(1)}) rotate(${action ? 34 : -28}) translate(0,-14)">${a}</g>`;
    if (b) weapons += `<g transform="translate(${rx.toFixed(1)},${ry.toFixed(1)}) rotate(28) translate(0,-14)">${b}</g>`;
  }

  return `<svg viewBox="0 -10 240 416" class="avatar-svg" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${style}
    <defs><clipPath id="${p}hc"><ellipse cx="120" cy="114" rx="57" ry="55"/></clipPath></defs>
    ${tail}<g class="mo">${silhouette}${hands}</g>${silhouette}${lines}${shortsSvg}${face}${weapons}<g class="mo" style="stroke-width:4px">${hands}</g>${hands}
  </svg>`;
}

/* ---------------- haori patterns ---------------- */
function haoriDefs(p, style, c1, c2, hemY) {
  switch (style) {
    case 'checkered': return `<pattern id="${p}hp" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${c2}"/><rect width="7" height="7" fill="${c1}"/><rect x="7" y="7" width="7" height="7" fill="${c1}"/></pattern>`;
    case 'hexagon': return `<pattern id="${p}hp" width="17.32" height="30" patternUnits="userSpaceOnUse"><rect width="17.32" height="30" fill="${c1}"/><path d="M8.66,0 L17.32,5 L17.32,15 L8.66,20 L0,15 L0,5Z M8.66,20 L8.66,30" fill="none" stroke="${c2}" stroke-width="1.8"/></pattern>`;
    case 'triangles': return `<pattern id="${p}hp" width="16" height="14" patternUnits="userSpaceOnUse"><rect width="16" height="14" fill="${c1}"/><path d="M0,14 L8,0 L16,14Z" fill="${c2}"/></pattern>`;
    case 'waves': return `<pattern id="${p}hp" width="20" height="10" patternUnits="userSpaceOnUse"><rect width="20" height="10" fill="${c1}"/>${[10, 7, 4].map(r => `<path d="M${10 - r},10 A${r},${r} 0 0,1 ${10 + r},10" fill="none" stroke="${c2}" stroke-width="1.3"/>`).join('')}${[10, 7, 4].map(r => `<path d="M${-r},5 A${r},${r} 0 0,1 ${r},5 M${20 - r},5 A${r},${r} 0 0,1 ${20 + r},5" fill="none" stroke="${c2}" stroke-width="1.3"/>`).join('')}</pattern>`;
    case 'dots': return `<pattern id="${p}hp" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${c1}"/><circle cx="6" cy="6" r="2.5" fill="${c2}"/></pattern>`;
    case 'butterfly': return `<pattern id="${p}hp" width="34" height="40" patternUnits="userSpaceOnUse"><rect width="34" height="40" fill="${c1}"/><path d="M0,6 L12,10 L10,24 L0,28 M12,10 L26,2 L34,8 M10,24 L22,30 L34,26 M22,30 L20,40 M26,2 L24,0 M22,30 L28,16 L26,2" fill="none" stroke="#2a2430" stroke-width="1.1"/></pattern>`;
    case 'clouds': return `<pattern id="${p}hp" width="56" height="48" patternUnits="userSpaceOnUse"><rect width="56" height="48" fill="${c1}"/>
      <path d="M0,40 q7,-4 14,0 t14,0 t14,0 t14,0 M0,8 q7,-4 14,0 t14,0 t14,0 t14,0" fill="none" stroke="${shade(c1, -0.3)}" stroke-width="1.2"/>
      <g fill="${c2}" stroke="${shade(c1, -0.45)}" stroke-width=".8"><circle cx="10" cy="22" r="5.5"/><circle cx="18" cy="17" r="7.5"/><circle cx="27" cy="22" r="5.5"/><rect x="9" y="22" width="19" height="5" rx="2.5"/>
      <circle cx="40" cy="38" r="4"/><circle cx="46" cy="34" r="5.5"/><circle cx="52" cy="38" r="4"/><rect x="39" y="38" width="14" height="4" rx="2"/></g></pattern>`;
    case 'blossoms': return `<pattern id="${p}hp" width="28" height="28" patternUnits="userSpaceOnUse"><rect width="28" height="28" fill="${c1}"/>
      <g transform="translate(9,9)">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-4" rx="3" ry="4" fill="${c2}" transform="rotate(${a})"/>`).join('')}<circle r="1.6" fill="#f0c23a"/></g>
      <circle cx="22" cy="22" r="2.2" fill="${c2}"/><circle cx="23" cy="6" r="1.4" fill="${c2}"/></pattern>`;
    default: return '';
  }
}

function flameOverlay(hemY, c2) {
  let d = '';
  for (let x = 30; x < 214; x += 14) {
    const h = 24 + ((x * 7) % 18);
    d += `M${x},${hemY + 2} L${x + 3},${hemY - h * 0.6} Q${x + 5},${hemY - h * 0.35} ${x + 7},${hemY - h} Q${x + 11},${hemY - h * 0.5} ${x + 14},${hemY + 2}Z `;
  }
  return `<path d="${d}" fill="${c2}"/><path d="M20,${hemY - 4} L220,${hemY - 4}" stroke="${shade(c2, 0.35)}" stroke-width="3" opacity=".6"/>`;
}
// Butterfly-wing bands at a hem: soft colour, pink, then a black border with white dots.
function wingBands(y, c2) {
  let dots = '';
  for (let x = 0; x < 240; x += 9) dots += `<ellipse cx="${x + 4}" cy="${y - 6}" rx="2.6" ry="2" fill="#fff"/>`;
  return `<rect x="0" y="${y - 46}" width="240" height="20" fill="${c2}" opacity=".92"/><rect x="0" y="${y - 26}" width="240" height="14" fill="#f28cab" opacity=".95"/>
    <rect x="0" y="${y - 12}" width="240" height="14" fill="#16121c"/>${dots}`;
}
function wingOverlay(hemY, c2) { return wingBands(hemY, c2); }

/* ---------------- weapons ---------------- */
function guardSide(style, color) {
  const a = `fill="${color}" class="ol" stroke-width="1.2"`;
  switch (style) {
    case 'none': return '';
    case 'flower': return `<path d="M-10,-1 Q-8,-5 -4,-3 Q0,-6 4,-3 Q8,-5 10,-1 Q8,3 4,1 Q0,4 -4,1 Q-8,3 -10,-1Z" ${a}/>`;
    case 'square': return `<rect x="-8" y="-4" width="16" height="5" rx="1" ${a}/>`;
    case 'flame': return `<path d="M-11,1 L-9,-5 L-6,-1 L-3,-6 L0,-1 L3,-6 L6,-1 L9,-5 L11,1Z" ${a}/>`;
    case 'butterfly': return `<path d="M0,-1 L-12,-6 Q-13,1 -5,2Z M0,-1 L12,-6 Q13,1 5,2Z" ${a}/>`;
    case 'hexagon': return `<path d="M-9,-1.5 L-5,-4.5 L5,-4.5 L9,-1.5 L5,1.5 L-5,1.5Z" ${a}/>`;
    default: return `<ellipse cx="0" cy="-1.5" rx="9" ry="3" ${a}/>`;
  }
}

export function guardFace(style, color) {
  const a = `fill="${color}" stroke="${INK}" stroke-width="2"`;
  const hole = `<ellipse cx="20" cy="20" rx="3" ry="6" fill="#16121c"/>`;
  let s;
  switch (style) {
    case 'none': s = `<path d="M8,8 L32,32 M32,8 L8,32" stroke="#888" stroke-width="3"/>`; return svgWrap(s);
    case 'flower': s = [0, 72, 144, 216, 288].map(r => `<ellipse cx="20" cy="10" rx="8" ry="10" ${a} transform="rotate(${r} 20 20)"/>`).join('') + `<circle cx="20" cy="20" r="8" ${a}/>`; break;
    case 'square': s = `<rect x="5" y="5" width="30" height="30" rx="6" ${a}/>`; break;
    case 'flame': s = `<path d="${Array.from({ length: 16 }, (_, i) => { const r = i % 2 ? 11 : 18, t = i * Math.PI / 8; return `${i ? 'L' : 'M'}${(20 + r * Math.sin(t)).toFixed(1)},${(20 - r * Math.cos(t)).toFixed(1)}`; }).join(' ')}Z" ${a}/>`; break;
    case 'butterfly': s = `<path d="M20,20 L4,6 Q0,20 12,22 L6,34 Q18,34 20,20 L34,34 Q22,34 20,20 L36,6 Q40,20 28,22Z" ${a}/>`; break;
    case 'hexagon': s = `<path d="M20,3 L35,11.5 L35,28.5 L20,37 L5,28.5 L5,11.5Z" ${a}/>`; break;
    default: s = `<circle cx="20" cy="20" r="16" ${a}/><circle cx="20" cy="20" r="11" fill="none" stroke="${shade(color, -0.3)}" stroke-width="1.5"/>`;
  }
  return svgWrap(s + hole);
}
const svgWrap = (s) => `<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true">${s}</svg>`;

function engravingText(weapon, name) {
  const map = { metsu: '悪鬼滅殺', kokoro: '心', hono: '炎', mizu: '水', custom: (name || 'S').trim().charAt(0).toUpperCase() };
  const t = map[weapon.engraving];
  if (!t) return '';
  return [...t].map((ch, i) => `<text x="0" y="${-14 - i * 7.5}" font-size="6.5" text-anchor="middle" fill="#fff" opacity=".85" font-weight="700">${ch}</text>`).join('');
}

function handle(wrap, len = 34, y0 = 2) {
  let lines = '';
  for (let y = y0 + 4; y < y0 + len - 4; y += 7) lines += `M-3.5,${y} L3.5,${y + 5} M3.5,${y} L-3.5,${y + 5} `;
  return `<rect x="-3.6" y="${y0}" width="7.2" height="${len}" rx="2" fill="${wrap}" class="ol" stroke-width="1.3"/><path d="${lines}" stroke="${shade(wrap, 0.45)}" stroke-width="1"/>`;
}
const spikes = (cx, cy, r, n, fill) => Array.from({ length: n }, (_, i) => {
  const t = (i / n) * Math.PI * 2, c = Math.cos(t), s = Math.sin(t);
  return `<path d="M${(cx + c * r * 0.75 - s * 4).toFixed(1)},${(cy + s * r * 0.75 + c * 4).toFixed(1)} L${(cx + c * (r + 7)).toFixed(1)},${(cy + s * (r + 7)).toFixed(1)} L${(cx + c * r * 0.75 + s * 4).toFixed(1)},${(cy + s * r * 0.75 - c * 4).toFixed(1)}Z" fill="${fill}" class="ol" stroke-width="1"/>`;
}).join('');

// One weapon piece pointing up (-y) with its grip at the origin.
function weaponPiece(kind, weapon, bc, name) {
  const g = guardSide(weapon.guard, weapon.guardColor);
  const shine = (len) => `<path d="M.6,-8 Q-1.4,${-len * 0.5} 1,${-len + 12}" fill="none" stroke="#fff" stroke-width="1.2" opacity=".55"/>`;
  const habaki = `<rect x="-3" y="-7" width="6" height="6" fill="#d9a83a" class="ol" stroke-width=".8"/>`;
  switch (kind) {
    case 'wooden': return `<path d="M-3.5,-4 Q-5,-60 -1,-104 L3.5,-100 Q0,-60 3.5,-4Z" fill="#a8743f" class="ol" stroke-width="1.4"/>${handle('#8a5a30')}`;
    case 'katana': {
      const len = 112;
      return `<path d="M-3,-4 Q-5.5,${-len * 0.55} -1,${-len} L3.2,${-len + 9} Q-0.2,${-len * 0.55} 3,-4Z" fill="${bc}" class="ol" stroke-width="1.2"/>${shine(len)}${engravingText(weapon, name)}${habaki}${g}${handle(weapon.wrap)}<rect x="-4.2" y="35" width="8.4" height="4" rx="1" fill="${weapon.guardColor}" class="ol" stroke-width="1"/>`;
    }
    case 'jagged': {
      let d = 'M-3,-4 L-3.5,-98 L0,-108';
      for (let i = 10; i >= 0; i--) d += ` L${i % 2 ? 7 : 3},${-6 - i * 9.4}`;
      return `<path d="${d}Z" fill="${shade(bc, -0.1)}" class="ol" stroke-width="1.2"/>${habaki}${g}${handle(weapon.wrap)}`;
    }
    case 'whip': {
      const pts = Array.from({ length: 18 }, (_, i) => `${(3.4 * Math.sin(i * 0.7)).toFixed(1)},${-4 - i * 7.5}`).join(' L');
      return `<path d="M${pts}" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linecap="round"/><path d="M${pts}" fill="none" stroke="${bc}" stroke-width="3.4" stroke-linecap="round"/><path d="M${pts}" fill="none" stroke="#fff" stroke-width=".8" opacity=".6"/>${habaki}${g}${handle(weapon.wrap)}`;
    }
    case 'needle': return `<path d="M-2.4,-4 L-1.2,-30 L0,-112 L1.2,-30 L2.4,-4Z" fill="${bc}" class="ol" stroke-width="1"/>${engravingText(weapon, name)}${g}${handle(weapon.wrap, 30)}`;
    case 'cleaver': return `<path d="M-3,-4 L-3,-74 L16,-82 L18,-6Z" fill="${bc}" class="ol" stroke-width="1.4"/><path d="M14,-10 L14,-76" stroke="#fff" stroke-width="1.4" opacity=".5"/>${engravingText(weapon, name)}${g}${handle(weapon.wrap, 34)}`;
    case 'spear': return `<rect x="-2.6" y="-104" width="5.2" height="150" rx="2" fill="${weapon.wrap}" class="ol" stroke-width="1.2"/><path d="M0,-140 Q8,-118 3.5,-104 L-3.5,-104 Q-8,-118 0,-140Z" fill="${bc}" class="ol" stroke-width="1.2"/><g transform="translate(0,-102)">${g}</g>`;
    case 'axe': return `${handle(weapon.wrap, 70, -40)}<path d="M2,-36 Q26,-44 26,-16 Q20,-24 2,-20Z" fill="${bc}" class="ol" stroke-width="1.4"/>`;
    case 'mace': return `${handle(weapon.wrap, 70, -40)}${spikes(0, -54, 14, 8, shade(bc, -0.15))}<circle cx="0" cy="-54" r="14" fill="${bc}" class="ol" stroke-width="1.4"/><circle cx="-4" cy="-58" r="4" fill="#fff" opacity=".35"/>`;
    case 'star': return `<g transform="rotate(20)"><path d="M0,-13 L3.5,-3.5 L13,0 L3.5,3.5 L0,13 L-3.5,3.5 L-13,0 L-3.5,-3.5Z" fill="${bc}" class="ol" stroke-width="1.2"/><circle r="2.5" fill="#16121c"/></g>`;
    default: return '';
  }
}

// Weapon as held in two hands. Returns [leftHandSvg, rightHandSvg, extraSvg].
function heldPieces(weapon, bc, name, trainee) {
  if (trainee) return [weaponPiece('wooden', weapon, bc, name), '', ''];
  const P = (k) => weaponPiece(k, weapon, bc, name);
  switch (weapon.type) {
    case 'dual': return [P('katana'), P('katana'), ''];
    case 'jagged': return [P('jagged'), P('jagged'), ''];
    case 'cleavers': return [P('cleaver'), P('cleaver'), 'chain'];
    case 'flail': return [P('axe'), '', 'ball'];
    case 'morningstar': return [P('mace'), '', ''];
    case 'shuriken': return [`<g transform="translate(-4,-6)">${P('star')}</g><g transform="translate(8,-14) scale(.85)">${P('star')}</g>`, P('star'), ''];
    case 'whip': return [P('whip'), '', ''];
    case 'needle': return [P('needle'), '', ''];
    case 'spear': return [P('spear'), '', ''];
    default: return [P('katana'), '', ''];
  }
}

export function renderWeaponPreview(weapon, breathing, name = '') {
  const bc = bladeColor(weapon, breathing);
  const [a, b, extra] = heldPieces(weapon, bc, name, false);
  const single = !b && !extra;
  let body;
  if (weapon.type === 'shuriken') {
    body = `<g transform="translate(110,80) scale(2.6)">${weaponPiece('star', weapon, bc)}</g><g transform="translate(200,70) scale(2) rotate(30)">${weaponPiece('star', weapon, bc)}</g><g transform="translate(160,120) scale(1.6) rotate(60)">${weaponPiece('star', weapon, bc)}</g>`;
  } else if (weapon.type === 'flail') {
    body = `<g transform="translate(110,84) rotate(90) scale(1.6)">${a}</g><path d="M150,84 Q205,130 250,84" fill="none" stroke="#9aa3b5" stroke-width="3" stroke-dasharray="5 3"/><g transform="translate(266,84)">${spikes(0, 0, 16, 9, shade(bc, -0.15))}<circle r="16" fill="${bc}" class="ol" stroke-width="1.4"/></g>`;
  } else if (single) {
    const sc = weapon.type === 'spear' ? 1.45 : weapon.type === 'morningstar' ? 1.7 : 1.9;
    const x = weapon.type === 'spear' ? 90 : weapon.type === 'morningstar' ? 110 : 76;
    body = `<g transform="translate(${x},80) rotate(90) scale(${sc})">${a}</g>`;
  } else {
    body = `<g transform="translate(70,52) rotate(90) scale(1.45)">${a}</g><g transform="translate(70,116) rotate(90) scale(1.45)">${b}</g>`;
    if (extra === 'chain') body += `<path d="M18,52 Q0,84 18,116" fill="none" stroke="#9aa3b5" stroke-width="3" stroke-dasharray="5 3"/>`;
  }
  return `<svg viewBox="0 0 320 160" class="weapon-svg" role="img" aria-label="${weapon.type} preview"><style>.ol{stroke:${INK};stroke-linejoin:round}</style>${body}</svg>`;
}

/* ---------------- manga-style weapon panels ---------------- */
// A weapon drawn like a manga panel: paper, radial speed lines, halftone dots,
// heavy ink outlines, a hard blade glint and a sound-effect word.
const SFX = { katana: 'シャキン', dual: 'ザシュ', jagged: 'ギザッ', whip: 'ヒュン', needle: 'チクッ', cleavers: 'ドドン',
  flail: 'ブォン', morningstar: 'ゴツン', spear: 'ズバッ', shuriken: 'シュシュ' };

export function mangaWeaponArt(weapon, breathing, name = '', opts = {}) {
  const id = `mg${++uid}`;
  const W = 200, H = 140, cx = 100, cy = 70;
  const bc = bladeColor(weapon, breathing);
  const [a, b] = heldPieces(weapon, bc, name, false);
  // Speed lines radiating from the centre.
  let lines = '';
  for (let i = 0; i < 44; i++) {
    const t = (i / 44) * Math.PI * 2 + (i % 3) * 0.03;
    const r0 = 46 + ((i * 37) % 22), r1 = 150;
    const w = 0.6 + ((i * 13) % 5) * 0.45;
    const c = Math.cos(t), s = Math.sin(t);
    lines += `<path d="M${(cx + c * r0).toFixed(1)},${(cy + s * r0).toFixed(1)} L${(cx + c * r1 - s * w).toFixed(1)},${(cy + s * r1 + c * w).toFixed(1)} L${(cx + c * r1 + s * w).toFixed(1)},${(cy + s * r1 - c * w).toFixed(1)}Z"/>`;
  }
  const P = (piece, rot, sc, ty, dx = 0, dy = 0) => `<g transform="translate(${cx + dx} ${cy + dy}) rotate(${rot}) scale(${sc}) translate(0 ${ty})">${piece}</g>`;
  let art;
  switch (weapon.type) {
    case 'dual': case 'jagged': case 'cleavers':
      art = P(a, 42, 0.62, 36, -10) + P(b, -42, 0.62, 36, 10);
      if (weapon.type === 'cleavers') art = `<path d="M70,112 Q100,134 130,112" fill="none" stroke="#111" stroke-width="3" stroke-dasharray="5 3"/>` + art;
      break;
    case 'flail':
      art = P(a, 40, 0.85, 0, -24, 6) + `<path d="M78,92 Q120,124 150,74" fill="none" stroke="#111" stroke-width="3" stroke-dasharray="5 3"/><g transform="translate(152 66)">${spikes(0, 0, 15, 9, shade(bc, -0.2))}<circle r="15" fill="${bc}" class="ol"/><path d="M-7,-6 Q-2,-11 4,-9" stroke="#fff" stroke-width="2.5" fill="none"/></g>`;
      break;
    case 'shuriken':
      art = P(weaponPiece('star', weapon, bc), 0, 2.6, 0, -34, 6) + P(weaponPiece('star', weapon, bc), 30, 1.8, 0, 36, -20) + P(weaponPiece('star', weapon, bc), 60, 1.4, 0, 46, 34);
      break;
    case 'spear': art = P(a, 52, 0.62, 47); break;
    case 'morningstar': art = P(a, 40, 0.95, 20); break;
    case 'whip': art = P(a, 50, 0.85, 54); break;
    default: art = P(a, 52, 0.84, 37);
  }
  const sfx = SFX[weapon.type] || 'シャキン';
  return `<svg viewBox="0 0 ${W} ${H}" class="manga-svg" role="img" aria-label="${weapon.type} in manga style">
    <defs>
      <pattern id="${id}d" width="5" height="5" patternUnits="userSpaceOnUse"><circle cx="2.5" cy="2.5" r="1.1" fill="#111"/></pattern>
      <radialGradient id="${id}g"><stop offset=".45" stop-color="#000"/><stop offset="1" stop-color="#fff"/></radialGradient>
      <mask id="${id}m"><rect width="${W}" height="${H}" fill="url(#${id}g)"/></mask>
      <clipPath id="${id}c"><rect width="${W}" height="${H}"/></clipPath>
    </defs><g clip-path="url(#${id}c)">
    <style>.manga-svg .ol{stroke:#111;stroke-width:2.8;stroke-linejoin:round}</style>
    <rect width="${W}" height="${H}" fill="#f7f2e6"/>
    <rect width="${W}" height="${H}" fill="url(#${id}d)" mask="url(#${id}m)" opacity=".55"/>
    <g fill="#111" opacity=".85">${lines}</g>
    <ellipse cx="${cx}" cy="${cy}" rx="58" ry="40" fill="#f7f2e6" opacity=".9"/>
    <path d="M${cx - 70},${cy + 30} L${cx + 70},${cy - 30}" stroke="${bc}" stroke-width="16" opacity=".22" stroke-linecap="round"/>
    ${art}
    <path d="M${cx - 30},${cy + 10} L${cx + 34},${cy - 26}" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>
    <path d="M${cx + 38},${cy - 34} l4,-10 l4,10 l10,4 l-10,4 l-4,10 l-4,-10 l-10,-4Z" fill="#fff" stroke="#111" stroke-width="1.4"/>
    ${opts.sfx === false ? '' : `<text x="${W - 10}" y="24" text-anchor="end" font-size="20" font-weight="900" fill="#fff" stroke="#111" stroke-width="3" paint-order="stroke" font-family="'Yu Gothic','Hiragino Sans','Noto Sans JP',sans-serif" transform="rotate(-8 ${W - 10} 24)">${sfx}</text>`}
    <rect x="1.5" y="1.5" width="${W - 3}" height="${H - 3}" fill="none" stroke="#111" stroke-width="3"/>
  </g></svg>`;
}

/* ---------------- full character ---------------- */
// Proportions follow the Demon Slayer look: ~6.5 heads tall, small head on a long body,
// bold line work and hard-edged cel shading (light from the upper left).
const HEAD_K = 0.66;          // head scale relative to the face-part coordinates
const CHIN_Y = 94;           // where the chin sits on the body
const SHADE = 'fill="#000" opacity=".2"';

export function renderAvatar(look, opts = {}) {
  if (look.species === 'mouse') return renderMouse(look, opts);
  const p = `av${++uid}`;
  const L = look;
  const uc = L.uniformColor;
  const skin = L.species === 'mouse' ? (L.furColor || '#bdb6c4') : L.skin;
  const hairFill = L.hairTip ? `url(#${p}hair)` : L.hairColor;
  const hs = hairShapes(L.hair);

  /* shared defs */
  const fade = { soft: ['.5', '1'], sharp: ['.7', '.76'], full: ['0', '1'], ends: ['.84', '.9'] }[L.hairFade] || ['.5', '1'];
  let defs = `<linearGradient id="${p}hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L.hairColor}"/><stop offset="${fade[0]}" stop-color="${L.hairColor}"/><stop offset="${fade[1]}" stop-color="${L.hairTip || L.hairColor}"/><stop offset="1" stop-color="${L.hairTip || L.hairColor}"/></linearGradient>`;
  for (const [id, c] of [['iris1', L.eyeColor], ['iris2', L.eyeColor2 || L.eyeColor]]) {
    defs += `<linearGradient id="${p}${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(c, -0.6)}"/><stop offset=".5" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, 0.55)}"/></linearGradient>`;
  }
  const es = EYE_SHAPES[L.eyes] || EYE_SHAPES.round;
  if (es.white) defs += `<clipPath id="${p}eclip"><path d="${es.white}"/></clipPath>`;
  const faceD = FACES[L.face] || FACES.oval;
  defs += `<clipPath id="${p}face"><path d="${faceD}"/></clipPath><clipPath id="${p}hf"><path d="${hs.front}"/></clipPath>`;

  /* head (in face-part coordinates) */
  const browColor = shade(L.hairColor, -0.3);
  const ears = ear(L.ears, skin) + mirror(ear(L.ears, skin));
  const earrings = earring(L.earrings, L.earringColor) + mirror(earring(L.earrings, L.earringColor));
  const face = `<path d="${faceD}" fill="${skin}" class="ol"/>
    <g clip-path="url(#${p}face)"><path d="${hs.front}" transform="translate(1,8)" fill="${shade(skin, -0.16)}"/>
    <path d="M152,60 Q172,100 142,150 L172,150 L172,60Z" fill="${shade(skin, -0.1)}"/></g>`;
  const blush = L.blush ? `<ellipse cx="92" cy="121" rx="7" ry="3" fill="#ff7a8a" opacity=".32"/><ellipse cx="148" cy="121" rx="7" ry="3" fill="#ff7a8a" opacity=".32"/>` : '';
  const fem = L.body === 'fem';
  const eyes = eye(L.eyes, `${p}iris1`, `${p}eclip`, L.eyeColor, fem) + mirror(eye(L.eyes, `${p}iris2`, `${p}eclip`, L.eyeColor2 || L.eyeColor, fem));
  const brows = `<g ${fem ? 'transform="translate(120 86) scale(1 .8) translate(-120 -86)"' : ''}>${brow(L.brows, browColor) + mirror(brow(L.brows, browColor))}</g>`;
  // Flame mane: the outer ring of locks takes the tip colour, like flickering fire.
  if (L.hair === 'flame' && L.hairTip) defs += `<clipPath id="${p}ring"><path clip-rule="evenodd" d="M-200,-200 H440 V440 H-200Z ${ellipsePath(120, 92, 68, 68)}"/></clipPath>`;
  const flameTips = L.hair === 'flame' && L.hairTip ? `<g clip-path="url(#${p}ring)"><path d="${hs.back}" fill="${L.hairTip}"/></g>` : '';
  const hairBack = `<path d="${hs.back}" fill="${hairFill}" class="ol"/>${flameTips}<path d="${hs.back}" fill="#000" opacity=".22"/>`;
  const hairFront = `<path d="${hs.front}" fill="${hairFill}" class="ol"/>
    <g clip-path="url(#${p}hf)"><path d="${hs.front}" fill="#000" opacity=".26"/><path d="${hs.front}" transform="translate(-3,-7)" fill="${hairFill}"/>
    <path d="M98,26 Q90,50 100,76 M122,22 Q118,48 126,70 M146,28 Q156,52 148,80 M80,44 Q72,66 82,90 M164,46 Q172,70 162,94" fill="none" stroke="#000" stroke-width="1.6" opacity=".3"/>
    <path d="M86,44 Q120,28 154,44" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".3"/></g>`;
  const species = L.species || 'human';
  const headFront = species === 'boar' ? boarHead(L.furColor || '#9a948e', p)
    : species === 'smith' ? smithHead(L) + earrings + headgear(L.headgear, L.headgearColor || '#c0303a')
    : `${ears}${face}${blush}${eyes}${nose(L.nose, skin)}${mouth(L.mouth)}${hairFront}${brows}${scar(L.scar, skin)}${mark(L.mark, skin)}${earrings}${accessory(L.accessory, L.accColor)}${headgear(L.headgear, L.headgearColor || '#c0303a')}`;
  const style = `<style>.ol{stroke:${INK};stroke-width:2;stroke-linejoin:round}.hd .ol{stroke-width:3.2}</style>`;
  const label = opts.name ? opts.name.replace(/[<>"&]/g, '') : 'Your character';

  if (opts.headOnly) {
    return `<svg viewBox="56 22 128 128" class="avatar-svg" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${style}<defs>${defs}</defs>${species === 'human' ? hairBack : ''}${headFront}</svg>`;
  }

  /* body */
  const W = L.species === 'boar' ? 1.15 : { slim: 0.9, regular: 1, strong: 1.15 }[L.build] || 1;
  const femBody = L.body === 'fem' && L.species !== 'mouse';
  const S = 42 * W * (femBody ? 0.86 : 1), Wt = 27 * W * (femBody ? 0.86 : 1);
  const legLen = { short: 150, medium: 168, tall: 186 }[L.height] || 168;
  const dy = 186 - legLen;
  const fy = 204 + legLen, hemY = 204 + legLen * 0.55;
  const ax = 120 - S;
  const headT = `translate(120 ${CHIN_Y}) scale(${HEAD_K}) translate(-120 -146)`;

  /* haori */
  const hStyle = L.haori;
  const c1 = L.haoriColor, c2 = L.haoriColor2;
  let haoriBack = '', haoriFront = '', haoriSleeve = '', haoriSleeveD = '', haoriSleeveFill = '';
  if (hStyle !== 'none') {
    defs += haoriDefs(p, hStyle, c1, c2, hemY);
    const patterned = ['checkered', 'hexagon', 'triangles', 'waves', 'dots', 'butterfly', 'clouds', 'blossoms'].includes(hStyle);
    const fillA = patterned ? `url(#${p}hp)` : c1;
    const fillB = hStyle === 'split' ? c2 : fillA;
    const back = `M${120 - S - 4},118 L${120 + S + 4},118 L${120 + S + 18},${hemY} L${120 - S - 18},${hemY}Z`;
    const panel = `M110,106 L104,${hemY} L${120 - S - 16},${hemY} L${120 - S - 5},120 Q${120 - S + 2},111 110,106Z`;
    const sleeve = `M${ax + 8},111 Q${ax - 6},110 ${ax - 12},126 L${ax - 22},194 Q${ax - 6},202 ${ax + 12},196 L${ax + 8},140Z`;
    if (hStyle === 'split') defs += `<linearGradient id="${p}hs" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="240" y2="0"><stop offset=".5" stop-color="${c1}"/><stop offset=".5" stop-color="${c2}"/></linearGradient>`;
    const overlay = hStyle === 'flames' ? flameOverlay(hemY, c2) : hStyle === 'butterfly' ? wingOverlay(hemY, c2) : '';
    defs += `<clipPath id="${p}cb"><path d="${back}"/></clipPath><clipPath id="${p}cf"><path d="${panel}"/><path d="${panel}" transform="matrix(-1 0 0 1 240 0)"/></clipPath>`;
    haoriBack = `<path d="${back}" fill="${hStyle === 'split' ? `url(#${p}hs)` : fillA}" class="ol"/>${overlay ? `<g clip-path="url(#${p}cb)">${overlay}</g>` : ''}<path d="${back}" ${SHADE}/>`;
    const side = (fill) => `<path d="${panel}" fill="${fill}" class="ol"/>`;
    const sleeveBands = hStyle === 'butterfly' ? `<g clip-path="url(#${p}cs)">${wingBands(204, c2)}</g>` : '';
    defs += `<clipPath id="${p}cs"><path d="${sleeve}"/></clipPath>`;
    haoriSleeve = `<path d="${sleeve}" fill="${fillA}" class="ol"/>${sleeveBands}`;
    haoriSleeveD = sleeve;
    haoriSleeveFill = fillA;
    const folds = `<path d="M${120 - S - 8},150 L${120 - S - 12},${hemY - 6} M${ax - 14},150 L${ax - 18},188" stroke="#000" stroke-width="1.6" opacity=".25" fill="none"/>`;
    haoriFront = side(fillA) + mirror(side(fillB)) + (overlay ? `<g clip-path="url(#${p}cf)">${overlay}</g>` : '')
      + folds + mirror(folds) + mirror(`<path d="${panel}" ${SHADE}/>`);
  }

  /* legs, pants, shoes */
  const pantsColor = L.pantsColor || (L.uniform === 'training' || L.uniform === 'kimono' ? '#2a2f45' : shade(uc, 0.04));
  const pleat = shade(pantsColor, -0.4);
  let legs = '', legsL = '', legsR = '', legsTop = '';
  if (L.pants === 'hakama') {
    legs = `<path d="M${120 - Wt - 2},200 L${120 + Wt + 2},200 L${120 + Wt + 16},${fy} L123,${fy} L120,${204 + legLen * 0.3} L117,${fy} L${120 - Wt - 16},${fy}Z" fill="${pantsColor}" class="ol"/>
      <path d="M108,208 L100,${fy - 4} M132,208 L140,${fy - 4} M114,206 L112,${fy - 30}" stroke="${pleat}" stroke-width="1.4"/>
      <path d="M120,200 L${120 + Wt + 2},200 L${120 + Wt + 16},${fy} L123,${fy}Z" ${SHADE}/>`;
  } else if (L.pants === 'skirt') {
    const sy = 204 + legLen * 0.32;
    const legD = `M106,${sy - 4} L105,${fy} L117,${fy} L117,${sy - 4}Z`;
    legs = `<path d="${legD}" fill="${skin}" class="ol"/>${mirror(`<path d="${legD}" fill="${skin}" class="ol"/><path d="${legD}" ${SHADE}/>`)}
      <path d="M${120 - Wt - 2},200 L${120 + Wt + 2},200 L${120 + Wt + 12},${sy} L${120 - Wt - 12},${sy}Z" fill="${pantsColor}" class="ol"/>
      <path d="M108,204 L104,${sy - 2} M120,204 L120,${sy - 2} M132,204 L136,${sy - 2}" stroke="${pleat}" stroke-width="1.3"/>`;
  } else if (L.pants === 'baggy') {
    // Puffy trousers gathered at the shin, leg wraps below (or fur boots cover them).
    const wy = fy - legLen * 0.3, wc = L.wrapColor || '#f2efe6';
    let stripes = '';
    for (let y = wy + 7; y < fy - 2; y += 8) stripes += `M106,${y} L117,${y - 4} `;
    const legD = `M${120 - Wt - 1},200 L119,200 Q124,${wy - 40} 119,${wy + 2} L104,${wy + 2} Q${86 - Wt * 0.2},${wy - 60} ${120 - Wt - 1},200Z`;
    const leg = `<path d="M105,${wy - 4} L118,${wy - 4} L117.5,${fy} L105,${fy}Z" fill="${wc}" class="ol" stroke-width="1.4"/><path d="${stripes}" stroke="${shade(wc, -0.3)}" stroke-width="1.2"/>
      <path d="${legD}" fill="${pantsColor}" class="ol"/><path d="M108,${wy - 30} Q100,${wy - 60} 104,${wy - 90}" fill="none" stroke="${pleat}" stroke-width="1.4"/>`;
    legsL = leg;
    legsR = mirror(leg + `<path d="${legD}" fill="#000" opacity=".15"/>`);
  } else {
    const wy = fy - legLen * 0.42;
    let stripes = '';
    for (let y = wy + 8; y < fy - 2; y += 10) stripes += `M106,${y} L117,${y - 4} `;
    const legD = `M${120 - Wt},200 L119,200 L119,${wy + 4} L117.5,${fy} L105,${fy} L104,${wy + 4} Q${98 - Wt * 0.1},${wy - 30} ${120 - Wt - 2},200Z`;
    const leg = `<path d="${legD}" fill="${pantsColor}" class="ol"/>
      <path d="M106,${wy} L117.8,${wy} L117.5,${fy} L105,${fy}Z" fill="${L.wrapColor || '#f2efe6'}" class="ol" stroke-width="1.4"/><path d="${stripes}" stroke="${shade(L.wrapColor || '#f2efe6', -0.3)}" stroke-width="1.2"/>`;
    legsL = leg;
    legsR = mirror(leg + `<path d="${legD}" fill="#000" opacity=".15"/>`);
  }
  let shoe;
  if (L.shoes === 'geta') {
    shoe = `<ellipse cx="111" cy="${fy + 2}" rx="8" ry="4" fill="${skin}" class="ol" stroke-width="1.4"/><rect x="100" y="${fy + 5}" width="22" height="5" rx="1" fill="#a8743f" class="ol" stroke-width="1.2"/>
      <rect x="102" y="${fy + 10}" width="5" height="6" fill="#7a5028"/><rect x="115" y="${fy + 10}" width="5" height="6" fill="#7a5028"/><path d="M111,${fy - 1} L104,${fy + 5} M111,${fy - 1} L118,${fy + 5}" stroke="#a82a2a" stroke-width="2"/>`;
  } else if (L.shoes === 'furBoots') {
    let top = '';
    for (let x = 101; x <= 119; x += 4) top += ` L${x + 2},${fy - 52 - ((x * 7) % 6)} L${x + 4},${fy - 44}`;
    shoe = `<path d="M100,${fy - 44}${top} L121,${fy} L100,${fy}Z" fill="#23202e" class="ol"/><path d="M104,${fy - 30} l3,8 M112,${fy - 34} l2,9 M108,${fy - 16} l3,8" stroke="#4a4458" stroke-width="1.4"/><ellipse cx="111" cy="${fy + 4}" rx="9" ry="4.4" fill="${skin}" class="ol" stroke-width="1.4"/>`;
  } else if (L.shoes === 'boots') shoe = `<path d="M103,${fy - 26} L118,${fy - 26} L118,${fy + 5} L121,${fy + 9} L100,${fy + 9} L103,${fy + 1}Z" fill="#2a2a2e" class="ol"/>`;
  else if (L.shoes === 'zori') shoe = `<ellipse cx="111" cy="${fy + 5}" rx="8" ry="4.2" fill="${skin}" class="ol" stroke-width="1.4"/><rect x="101" y="${fy + 7}" width="20" height="4" rx="2" fill="#c8a868" class="ol" stroke-width="1"/><path d="M111,${fy + 2} L105,${fy + 7} M111,${fy + 2} L117,${fy + 7}" stroke="#c0303a" stroke-width="1.8"/>`;
  else shoe = `<ellipse cx="111" cy="${fy + 5}" rx="8" ry="4.6" fill="#f2efe6" class="ol" stroke-width="1.4"/><rect x="101" y="${fy + 8}" width="20" height="3.5" rx="1.5" fill="#6b4a35"/>`;
  if (legsL) { legsL += shoe; legsR += mirror(shoe); } else legsTop = legs + shoe + mirror(shoe);

  /* arms */
  const armD = `M${ax + 10},114 Q${ax - 6},114 ${ax - 8},140 L${ax - 12},208 L${ax + 1},208 L${ax + 8},146Z`;
  const sl = L.uniform === 'training' ? 162 : 208;
  const lx = ax - 8 - (4 * (sl - 140)) / 68, rx = ax + 8 - (7 * (sl - 146)) / 62;
  const armSleeve = L.uniform === 'bare' ? `<path d="M${ax - 4},150 Q${ax - 10},160 ${ax - 9},172" fill="none" stroke="${shade(skin, -0.3)}" stroke-width="1.5"/>` : L.uniform === 'vest' ? `<path d="M${ax - 11.5},194 L${ax + 2.4},194 L${ax + 1},208 L${ax - 12},208Z" fill="#f2efe6" class="ol" stroke-width="1.2"/>`
    : `<path d="M${ax + 10},114 Q${ax - 6},114 ${ax - 8},140 L${lx},${sl} L${rx},${sl} L${ax + 8},146Z" fill="${uc}" class="ol"/>`;
  const bands = L.armbands === 'gold'
    ? `<path d="M${ax - 9},136 L${ax + 9},140 L${ax + 8},154 L${ax - 10},151Z" fill="#e0b040" class="ol" stroke-width="1.4"/><path d="M${ax - 8},143 L${ax + 8},147" stroke="#a87a20" stroke-width="1.4"/>
      <path d="M${ax - 12.4},190 L${ax + 2.6},190 L${ax + 1},207 L${ax - 12.4},207Z" fill="#4a3a7a" class="ol" stroke-width="1.4"/><path d="M${ax - 12},194 L${ax + 2},194 M${ax - 12},197 L${ax + 2},197" stroke="#e0b040" stroke-width="1.6"/>` : '';
  const arm = `<path d="${armD}" fill="${skin}" class="ol"/>${armSleeve}${bands}`;
  const hx = ax - 6, hy = 214;
  const hand = `<circle cx="${hx}" cy="${hy}" r="6.5" fill="${skin}" class="ol"/>`;

  /* torso */
  const torsoD = `M${120 - S + 6},122 Q${120 - S},114 ${120 - S + 16},112 L111,107 L129,107 L${120 + S - 16},112 Q${120 + S},114 ${120 + S - 6},122 L${120 + Wt + 2},206 L${120 - Wt - 2},206Z`;
  let torso = `<path d="${torsoD}" fill="${uc}" class="ol"/>`;
  const gold = '#d9a83a', dark = shade(uc, -0.3);
  const belt = `<rect x="${120 - Wt - 2}" y="194" width="${2 * (Wt + 2)}" height="9" fill="#f2efe6" class="ol" stroke-width="1.4"/>`;
  const buttons = (ys) => ys.map((y) => `<circle cx="120" cy="${y}" r="2.1" fill="${gold}" stroke="${INK}" stroke-width=".8"/>`).join('');
  switch (L.uniform) {
    case 'open':
      torso += `<path d="M110,106 L130,106 L120,134Z" fill="${skin}" class="ol" stroke-width="1.4"/><path d="M108,106 L120,138 L113,108Z M132,106 L120,138 L127,108Z" fill="${dark}"/><path d="M120,138 L120,194" stroke="${dark}" stroke-width="1.2"/>${buttons([152, 174])}${belt}`;
      break;
    case 'kimono':
      torso += `<path d="M110,106 L130,106 L120,132Z" fill="${skin}"/><path d="M110,106 L131,168" stroke="#f2efe6" stroke-width="5"/><path d="M130,106 L117,134" stroke="#f2efe6" stroke-width="5"/><rect x="${120 - Wt - 1}" y="168" width="${2 * (Wt + 1)}" height="26" fill="${c2 || '#5a1e2a'}" class="ol" stroke-width="1.4"/><path d="M${122 - Wt},181 L${118 + Wt},181" stroke="${gold}" stroke-width="2.2"/>`;
      break;
    case 'bare': {
      torso = `<path d="${torsoD}" fill="${skin}" class="ol"/>
        <path d="M${120 - S + 14},132 Q108,146 120,140 Q132,146 ${120 + S - 14},132" fill="none" stroke="${shade(skin, -0.3)}" stroke-width="1.8"/>
        <path d="M120,142 L120,188 M112,154 L128,154 M112,168 L128,168 M113,181 L127,181" stroke="${shade(skin, -0.3)}" stroke-width="1.5"/>`;
      let pelt = '';
      for (let x = 120 - Wt - 10; x < 120 + Wt + 10; x += 8) pelt += ` L${x + 4},${222 + ((x * 7) % 9)} L${x + 8},210`;
      torso += `<path d="M${120 - Wt - 8},190 L${120 + Wt + 8},190 L${120 + Wt + 10},210${pelt.replace(/^ L/, ' L')} L${120 - Wt - 10},210Z" fill="#7a5a3a" class="ol"/><path d="M${120 - Wt - 6},196 L${120 + Wt + 6},196" stroke="#5a3a24" stroke-width="2"/>`;
      break;
    }
    case 'training':
      torso += `<path d="M110,106 L130,106 L120,132Z" fill="${skin}"/><path d="M110,106 L130,194 M130,106 L118,134" stroke="${shade(uc, -0.25)}" stroke-width="3"/><rect x="${120 - Wt - 2}" y="192" width="${2 * (Wt + 2)}" height="10" fill="#2a2a2e" class="ol" stroke-width="1.4"/>`;
      break;
    default:
      torso += `<path d="M107,103 L133,103 L135,118 L105,118Z" fill="${dark}" class="ol" stroke-width="1.4"/><path d="M120,118 L120,194" stroke="${dark}" stroke-width="1.2"/>${buttons([132, 152, 172])}${belt}`;
  }
  torso += `<path d="M${120 + S * 0.3},108 L${120 + S - 16},112 Q${120 + S},114 ${120 + S - 6},122 L${120 + Wt + 2},206 L${120 + Wt * 0.3},206Z" ${SHADE}/>`;
  const sc = L.scarfColor || '#4a7ad8', scD = shade(sc, -0.3);
  const ribs = (x0, x1, y0, y1) => { let r = ''; for (let x = x0; x <= x1; x += 4.5) r += `M${x},${y0} L${x + 1},${y1} `; return `<path d="${r}" stroke="${scD}" stroke-width="1.2"/>`; };
  let scarfFront = '', scarfBack = '';
  if (L.scarf && L.scarf !== 'none') {
    const high = L.scarf === 'wrap';
    const top = high ? 88 : 96;
    scarfFront = `<path d="M94,${top} Q120,${top + 8} 146,${top} L150,122 Q120,132 90,122Z" fill="${sc}" class="ol"/>${ribs(96, 144, top + 4, 124)}
      <path d="M92,${top + 13} Q120,${top + 22} 148,${top + 13}" fill="none" stroke="${scD}" stroke-width="2.2"/>`;
    if (L.scarf === 'knit') scarfFront += `<path d="M124,118 L142,116 L147,178 L129,180Z" fill="${sc}" class="ol"/>${ribs(127, 143, 120, 176)}<path d="M130,180 l-1,7 M134,180 l0,7 M138,179 l1,7 M142,179 l1,7 M146,178 l2,6" stroke="${sc}" stroke-width="2"/>`;
    if (L.scarf === 'long') scarfBack = `<path d="M140,100 Q186,94 212,116 Q228,132 238,126 L236,144 Q214,152 198,136 Q180,118 146,120Z" fill="${sc}" class="ol"/><path d="M160,104 Q190,104 214,124" fill="none" stroke="${scD}" stroke-width="1.6"/>`;
  }
  let cape = '';
  if (L.cape === 'mino') {
    // Straw rain cape: two fringed tiers over the shoulders.
    const tier = (y0, y1, w, c) => {
      let d = `M${120 - w * 0.55},${y0} Q120,${y0 - 10} ${120 + w * 0.55},${y0} L${120 + w},${y1}`;
      for (let x = 120 + w; x > 120 - w; x -= 7) d += ` L${x - 3.5},${y1 + 10 + ((x * 7) % 6)} L${x - 7},${y1}`;
      let strands = '';
      for (let x = 120 - w + 6; x < 120 + w; x += 6) strands += `M${120 + (x - 120) * 0.55},${y0 + 4} L${x},${y1 + 4} `;
      return `<path d="${d}Z" fill="${c}" class="ol"/><path d="${strands}" stroke="${shade(c, -0.3)}" stroke-width="1.1"/>`;
    };
    cape = tier(110, 176, S + 30, '#a89060') + tier(104, 140, S + 16, '#bba070') + `<path d="M108,104 L104,116 M132,104 L136,116" stroke="#e8dcc0" stroke-width="2"/>`;
  }
  const neck = `<rect x="112" y="80" width="16" height="32" fill="${skin}" class="ol"/><path d="M112,82 L128,82 L128,96 Q120,102 112,96Z" fill="${shade(skin, -0.2)}"/>`;

  /* weapon + pose */
  let weaponExtra = '';
  const action = opts.pose === 'action';
  // Action pose: weapon arm raised overhead (blade across the back), other arm forward, wide stance.
  const aL = action ? 128 : 0, aR = action ? -22 : 0;
  const shL = [ax + 4, 118];
  const rot = (x, y, deg) => {
    const t = (deg * Math.PI) / 180, ddx = x - shL[0], ddy = y - shL[1];
    return [shL[0] + ddx * Math.cos(t) - ddy * Math.sin(t), shL[1] + ddx * Math.sin(t) + ddy * Math.cos(t)];
  };
  let pieceA = '', pieceB = '', extraKind = '';
  if (opts.weapon) [pieceA, pieceB, extraKind] = heldPieces(opts.weapon, bladeColor(opts.weapon, opts.breathing), opts.name, opts.trainee);
  const [lhx, lhy] = rot(hx, hy, aL), [rhx0, rhy] = rot(hx, hy, aR), rhx = 240 - rhx0;
  if (extraKind === 'chain') weaponExtra = `<path d="M${lhx},${lhy} Q120,${fy - 40} ${rhx},${rhy}" fill="none" stroke="#9aa3b5" stroke-width="2.6" stroke-dasharray="4 3"/>`;
  if (extraKind === 'ball') {
    const bc = bladeColor(opts.weapon, opts.breathing);
    weaponExtra = `<path d="M${rhx},${rhy} Q${rhx + 14},${rhy + 40} ${rhx + 2},${fy - 30}" fill="none" stroke="#9aa3b5" stroke-width="2.6" stroke-dasharray="4 3"/><g transform="translate(${rhx + 2},${fy - 20})">${spikes(0, 0, 11, 8, shade(bc, -0.15))}<circle r="11" fill="${bc}" class="ol" stroke-width="1.2"/></g>`;
  }
  const wA = pieceA ? `<g transform="translate(${hx},${hy}) rotate(${action ? -62 : -28}) translate(0,-14)">${pieceA}</g>` : '';
  const wB = pieceB ? `<g transform="translate(${hx},${hy}) rotate(-28) translate(0,-14)">${pieceB}</g>` : '';
  const sleeveR = haoriSleeveD ? (hStyle === 'split' ? `<path d="${haoriSleeveD}" fill="${c2}" class="ol"/>` : haoriSleeve) + `<path d="${haoriSleeveD}" ${SHADE}/>` : '';
  const armL = `<g transform="rotate(${aL} ${shL[0]} ${shL[1]})">${arm}${haoriSleeve}${wA}${hand}</g>`;
  const armRight = mirror(`<g transform="rotate(${aR} ${shL[0]} ${shL[1]})">${arm}<path d="${armD}" ${SHADE}/>${sleeveR}${wB}${hand}</g>`);
  const stance = (side) => (action ? `rotate(${side * 7} ${120 - side * 10} 204)` : '');
  const body = `<g transform="translate(0,${dy})">
    <g class="hd" transform="${headT}">${species === 'human' ? hairBack : ''}</g>
    ${haoriBack}
    <g transform="${stance(1)}">${legsL}</g><g transform="${stance(-1)}">${legsR}</g>${legsTop}
    ${scarfBack}${neck}${torso}${haoriFront}${scarfFront}
    ${weaponExtra}${armL}${armRight}${cape}
    <g class="hd" transform="${headT}">${headFront}</g>
  </g>`;

  return `<svg viewBox="0 -10 240 416" class="avatar-svg" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${style}<defs>${defs}</defs>${body}</svg>`;
}
