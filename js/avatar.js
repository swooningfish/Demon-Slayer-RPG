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

function hairShapes(style) {
  switch (style) {
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
    case 'paint': return `<path d="M84,95 L92,88 L94,95Z" fill="#c0303a"/><path d="M83,104 L89,103 M84,111 L90,109 M88,118 L93,114" stroke="#c0303a" stroke-width="2.6" stroke-linecap="round"/>`;
    default: return '';
  }
}

function accessory(style, color) {
  switch (style) {
    case 'foxMask': return `<g transform="translate(158,52) rotate(24)">
      <path d="M-12,-14 L-9,-26 L-3,-16Z M12,-14 L9,-26 L3,-16Z" fill="#f7f3ea" class="ol" stroke-width="1.5"/>
      <ellipse rx="15" ry="19" fill="#f7f3ea" class="ol"/>
      <path d="M-9,-3 Q-5,-8 -2,-3 M9,-3 Q5,-8 2,-3" fill="none" stroke="${INK}" stroke-width="1.6"/>
      <path d="M-11,-8 Q-6,-14 -1,-9 M11,-8 Q6,-14 1,-9" fill="none" stroke="#c0303a" stroke-width="1.8"/>
      <path d="M-5,9 Q0,13 5,9" fill="none" stroke="#c0303a" stroke-width="1.6"/>
      <path d="M-7,-15 q7,-6 14,0" fill="none" stroke="#3cb6c8" stroke-width="2"/></g>`;
    case 'ribbon': return `<g transform="translate(150,40) rotate(15)"><path d="M0,0 L-19,-11 L-18,11Z M0,0 L19,-11 L18,11Z" fill="${color}" class="ol" stroke-width="1.6"/><path d="M-2,2 L-8,22 M2,2 L8,22" stroke="${color}" stroke-width="4" stroke-linecap="round"/><circle r="4.5" fill="${shade(color, -0.2)}" class="ol" stroke-width="1.4"/></g>`;
    case 'butterfly': {
      const b = `<path d="M0,0 L-12,-10 Q-16,0 -6,2 L-10,10 Q-2,10 0,0 L10,10 Q2,10 0,0 L12,-10 Q16,0 6,2Z" fill="${color}" class="ol" stroke-width="1.2"/><path d="M0,-5 L0,6" stroke="${INK}" stroke-width="1.6"/>`;
      return `<g transform="translate(154,54) rotate(18)">${b}</g><g transform="translate(86,54) rotate(-18) scale(.8)">${b}</g>`;
    }
    case 'headband': return `<path d="M70,72 Q120,54 170,72 L170,80 Q120,62 70,80Z" fill="#d6d9e0" class="ol" stroke-width="1.6"/>${[86, 103, 120, 137, 154].map((x, i) => `<path d="M${x},${71 - (i === 2 ? 4 : i % 2 ? 2 : 0)} l3.5,4 l-3.5,4 l-3.5,-4Z" fill="${color}" stroke="#fff" stroke-width=".8"/>`).join('')}`;
    case 'flower': return `<g transform="translate(84,52)">${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-7" rx="5" ry="7" fill="${color}" class="ol" stroke-width="1.2" transform="rotate(${a})"/>`).join('')}<circle r="3.6" fill="#f0c23a"/></g>`;
    default: return '';
  }
}

/* ---------------- species heads ---------------- */
// Muscle Mouse: round ears, buck teeth, whiskers. Boar: a fur boar-head mask with tusks.
function mouseHead(fur) {
  const light = shade(fur, 0.35), dark = shade(fur, -0.25);
  return `<circle cx="76" cy="52" r="27" fill="${fur}" class="ol"/><circle cx="76" cy="52" r="16" fill="#f4a6b8"/>
    <circle cx="164" cy="52" r="27" fill="${fur}" class="ol"/><circle cx="164" cy="52" r="16" fill="#f4a6b8"/>
    <ellipse cx="120" cy="98" rx="45" ry="48" fill="${fur}" class="ol"/>
    <path d="M150,62 Q172,100 146,140 L170,140 L170,62Z" fill="#000" opacity=".12"/>
    <path d="M104,52 L110,66 L116,50 L122,66 L128,52" fill="none" stroke="${dark}" stroke-width="2"/>
    <ellipse cx="120" cy="124" rx="24" ry="17" fill="${light}" class="ol"/>
    <ellipse cx="100" cy="94" rx="7" ry="9.5" fill="#120a0e"/><ellipse cx="140" cy="94" rx="7" ry="9.5" fill="#120a0e"/>
    <circle cx="98" cy="90" r="2.8" fill="#fff"/><circle cx="138" cy="90" r="2.8" fill="#fff"/>
    <path d="M88,80 L110,84 M152,80 L130,84" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
    <ellipse cx="120" cy="113" rx="7" ry="5" fill="#ff7a9a" class="ol" stroke-width="1.5"/>
    <path d="M112,124 Q116,128 120,124 Q124,128 128,124" fill="none" stroke="${INK}" stroke-width="2"/>
    <rect x="114" y="126" width="12" height="10" rx="2" fill="#fff" class="ol" stroke-width="1.4"/><path d="M120,126 L120,136" stroke="${INK}" stroke-width="1.2"/>
    <path d="M96,120 L66,114 M96,126 L64,128 M144,120 L174,114 M144,126 L176,128" stroke="${INK}" stroke-width="1.4" opacity=".7"/>`;
}
function boarHead(fur, hairColor) {
  const dark = shade(fur, -0.35);
  let mane = '';
  for (let i = 0; i < 9; i++) { const x = 84 + i * 9; mane += `M${x},${54 - (i % 2) * 2} L${x + 4},${34 - (i % 3) * 5} L${x + 8},${54 - (i % 2) * 2} `; }
  return `<path d="M64,100 L46,150 L70,132 L62,170 L88,140 L120,150 L152,140 L178,170 L170,132 L194,150 L176,100Z" fill="${hairColor}" class="ol"/>
    <path d="M78,62 L66,30 L96,52Z M162,62 L174,30 L144,52Z" fill="${fur}" class="ol"/><path d="M78,56 L72,40 L88,52Z M162,56 L168,40 L152,52Z" fill="#c88a80"/>
    <path d="${mane}" fill="${dark}" class="ol" stroke-width="1.5"/>
    <path d="M70,92 C66,48 98,40 120,40 C142,40 174,48 170,92 C170,124 152,146 120,148 C88,146 70,124 70,92Z" fill="${fur}" class="ol"/>
    <path d="M150,58 Q176,100 148,144 L172,140 L172,58Z" fill="#000" opacity=".14"/>
    <path d="M84,70 Q96,62 108,70 M132,70 Q144,62 156,70" fill="none" stroke="${dark}" stroke-width="2.5"/>
    <ellipse cx="100" cy="92" rx="10" ry="8" fill="#14101a" class="ol" stroke-width="1.5"/><ellipse cx="140" cy="92" rx="10" ry="8" fill="#14101a" class="ol" stroke-width="1.5"/>
    <circle cx="102" cy="90" r="3.2" fill="#7ad0ff"/><circle cx="142" cy="90" r="3.2" fill="#7ad0ff"/>
    <ellipse cx="120" cy="124" rx="24" ry="17" fill="#d8a098" class="ol"/>
    <ellipse cx="112" cy="124" rx="4" ry="6" fill="#5a2a2a"/><ellipse cx="128" cy="124" rx="4" ry="6" fill="#5a2a2a"/>
    <path d="M96,132 Q88,124 90,110 Q96,124 102,128Z M144,132 Q152,124 150,110 Q144,124 138,128Z" fill="#fffaf0" class="ol" stroke-width="1.4"/>`;
}

/* ---------------- haori patterns ---------------- */
function haoriDefs(p, style, c1, c2, hemY) {
  switch (style) {
    case 'checkered': return `<pattern id="${p}hp" width="14" height="14" patternUnits="userSpaceOnUse"><rect width="14" height="14" fill="${c2}"/><rect width="7" height="7" fill="${c1}"/><rect x="7" y="7" width="7" height="7" fill="${c1}"/></pattern>`;
    case 'hexagon': return `<pattern id="${p}hp" width="17.32" height="30" patternUnits="userSpaceOnUse"><rect width="17.32" height="30" fill="${c1}"/><path d="M8.66,0 L17.32,5 L17.32,15 L8.66,20 L0,15 L0,5Z M8.66,20 L8.66,30" fill="none" stroke="${c2}" stroke-width="1.8"/></pattern>`;
    case 'triangles': return `<pattern id="${p}hp" width="16" height="14" patternUnits="userSpaceOnUse"><rect width="16" height="14" fill="${c1}"/><path d="M0,14 L8,0 L16,14Z" fill="${c2}"/></pattern>`;
    case 'waves': return `<pattern id="${p}hp" width="20" height="10" patternUnits="userSpaceOnUse"><rect width="20" height="10" fill="${c1}"/>${[10, 7, 4].map(r => `<path d="M${10 - r},10 A${r},${r} 0 0,1 ${10 + r},10" fill="none" stroke="${c2}" stroke-width="1.3"/>`).join('')}${[10, 7, 4].map(r => `<path d="M${-r},5 A${r},${r} 0 0,1 ${r},5 M${20 - r},5 A${r},${r} 0 0,1 ${20 + r},5" fill="none" stroke="${c2}" stroke-width="1.3"/>`).join('')}</pattern>`;
    case 'dots': return `<pattern id="${p}hp" width="12" height="12" patternUnits="userSpaceOnUse"><rect width="12" height="12" fill="${c1}"/><circle cx="6" cy="6" r="2.5" fill="${c2}"/></pattern>`;
    case 'butterfly': return `<linearGradient id="${p}hp" gradientUnits="userSpaceOnUse" x1="0" y1="115" x2="0" y2="${hemY}"><stop offset="0" stop-color="${shade(c1, 0.75)}"/><stop offset=".45" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
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
function wingOverlay(hemY) {
  let d = '';
  for (let x = 40; x < 210; x += 22) d += `M${x},${hemY} Q${x + 8},${hemY - 40} ${x + 2},${hemY - 75} `;
  return `<path d="${d}" fill="none" stroke="#1d1530" stroke-width="1.6" opacity=".55"/>`;
}

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
  const p = `av${++uid}`;
  const L = look;
  const uc = L.uniformColor;
  const skin = L.species === 'mouse' ? (L.furColor || '#bdb6c4') : L.skin;
  const hairFill = L.hairTip ? `url(#${p}hair)` : L.hairColor;
  const hs = hairShapes(L.hair);

  /* shared defs */
  let defs = `<linearGradient id="${p}hair" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${L.hairColor}"/><stop offset=".5" stop-color="${L.hairColor}"/><stop offset="1" stop-color="${L.hairTip || L.hairColor}"/></linearGradient>`;
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
  const hairBack = `<path d="${hs.back}" fill="${hairFill}" class="ol"/><path d="${hs.back}" fill="#000" opacity=".28"/>`;
  const hairFront = `<path d="${hs.front}" fill="${hairFill}" class="ol"/>
    <g clip-path="url(#${p}hf)"><path d="${hs.front}" fill="#000" opacity=".26"/><path d="${hs.front}" transform="translate(-3,-7)" fill="${hairFill}"/>
    <path d="M98,26 Q90,50 100,76 M122,22 Q118,48 126,70 M146,28 Q156,52 148,80 M80,44 Q72,66 82,90 M164,46 Q172,70 162,94" fill="none" stroke="#000" stroke-width="1.6" opacity=".3"/>
    <path d="M86,44 Q120,28 154,44" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".3"/></g>`;
  const species = L.species || 'human';
  const fur = L.furColor || '#bdb6c4';
  const headFront = species === 'mouse' ? mouseHead(fur) + accessory(L.accessory, L.accColor)
    : species === 'boar' ? boarHead(fur, L.hairColor)
    : `${ears}${face}${blush}${eyes}${nose(L.nose, skin)}${mouth(L.mouth)}${hairFront}${brows}${scar(L.scar, skin)}${mark(L.mark, skin)}${earrings}${accessory(L.accessory, L.accColor)}`;
  const style = `<style>.ol{stroke:${INK};stroke-width:2;stroke-linejoin:round}.hd .ol{stroke-width:3.2}</style>`;
  const label = opts.name ? opts.name.replace(/[<>"&]/g, '') : 'Your character';

  if (opts.headOnly) {
    return `<svg viewBox="56 22 128 128" class="avatar-svg" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${style}<defs>${defs}</defs>${species === 'human' ? hairBack : ''}${headFront}</svg>`;
  }

  /* body */
  const W = L.species && L.species !== 'human' ? 1.18 : { slim: 0.9, regular: 1, strong: 1.15 }[L.build] || 1;
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
    const patterned = ['checkered', 'hexagon', 'triangles', 'waves', 'dots', 'butterfly'].includes(hStyle);
    const fillA = patterned ? `url(#${p}hp)` : c1;
    const fillB = hStyle === 'split' ? c2 : fillA;
    const back = `M${120 - S - 4},118 L${120 + S + 4},118 L${120 + S + 18},${hemY} L${120 - S - 18},${hemY}Z`;
    const panel = `M110,106 L104,${hemY} L${120 - S - 16},${hemY} L${120 - S - 5},120 Q${120 - S + 2},111 110,106Z`;
    const sleeve = `M${ax + 8},111 Q${ax - 6},110 ${ax - 12},126 L${ax - 22},194 Q${ax - 6},202 ${ax + 12},196 L${ax + 8},140Z`;
    if (hStyle === 'split') defs += `<linearGradient id="${p}hs" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="240" y2="0"><stop offset=".5" stop-color="${c1}"/><stop offset=".5" stop-color="${c2}"/></linearGradient>`;
    const overlay = hStyle === 'flames' ? flameOverlay(hemY, c2) : hStyle === 'butterfly' ? wingOverlay(hemY) : '';
    defs += `<clipPath id="${p}cb"><path d="${back}"/></clipPath><clipPath id="${p}cf"><path d="${panel}"/><path d="${panel}" transform="matrix(-1 0 0 1 240 0)"/></clipPath>`;
    haoriBack = `<path d="${back}" fill="${hStyle === 'split' ? `url(#${p}hs)` : fillA}" class="ol"/>${overlay ? `<g clip-path="url(#${p}cb)">${overlay}</g>` : ''}<path d="${back}" ${SHADE}/>`;
    const side = (fill) => `<path d="${panel}" fill="${fill}" class="ol"/>`;
    haoriSleeve = `<path d="${sleeve}" fill="${fillA}" class="ol"/>`;
    haoriSleeveD = sleeve;
    haoriSleeveFill = fillA;
    const folds = `<path d="M${120 - S - 8},150 L${120 - S - 12},${hemY - 6} M${ax - 14},150 L${ax - 18},188" stroke="#000" stroke-width="1.6" opacity=".25" fill="none"/>`;
    haoriFront = side(fillA) + mirror(side(fillB)) + (overlay ? `<g clip-path="url(#${p}cf)">${overlay}</g>` : '')
      + folds + mirror(folds) + mirror(`<path d="${panel}" ${SHADE}/>`);
  }

  /* legs, pants, shoes */
  const pantsColor = L.uniform === 'training' || L.uniform === 'kimono' ? '#2a2f45' : shade(uc, 0.04);
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
  } else {
    const wy = fy - legLen * 0.42;
    let stripes = '';
    for (let y = wy + 8; y < fy - 2; y += 10) stripes += `M106,${y} L117,${y - 4} `;
    const legD = `M${120 - Wt},200 L119,200 L119,${wy + 4} L117.5,${fy} L105,${fy} L104,${wy + 4} Q${98 - Wt * 0.1},${wy - 30} ${120 - Wt - 2},200Z`;
    const leg = `<path d="${legD}" fill="${pantsColor}" class="ol"/>
      <path d="M106,${wy} L117.8,${wy} L117.5,${fy} L105,${fy}Z" fill="#f2efe6" class="ol" stroke-width="1.4"/><path d="${stripes}" stroke="#b9b4a6" stroke-width="1.2"/>`;
    legsL = leg;
    legsR = mirror(leg + `<path d="${legD}" fill="#000" opacity=".15"/>`);
  }
  let shoe;
  if (L.shoes === 'boots') shoe = `<path d="M103,${fy - 26} L118,${fy - 26} L118,${fy + 5} L121,${fy + 9} L100,${fy + 9} L103,${fy + 1}Z" fill="#2a2a2e" class="ol"/>`;
  else if (L.shoes === 'zori') shoe = `<ellipse cx="111" cy="${fy + 5}" rx="8" ry="4.2" fill="${skin}" class="ol" stroke-width="1.4"/><rect x="101" y="${fy + 7}" width="20" height="4" rx="2" fill="#c8a868" class="ol" stroke-width="1"/><path d="M111,${fy + 2} L105,${fy + 7} M111,${fy + 2} L117,${fy + 7}" stroke="#c0303a" stroke-width="1.8"/>`;
  else shoe = `<ellipse cx="111" cy="${fy + 5}" rx="8" ry="4.6" fill="#f2efe6" class="ol" stroke-width="1.4"/><rect x="101" y="${fy + 8}" width="20" height="3.5" rx="1.5" fill="#6b4a35"/>`;
  if (legsL) { legsL += shoe; legsR += mirror(shoe); } else legsTop = legs + shoe + mirror(shoe);

  /* arms */
  const armD = `M${ax + 10},114 Q${ax - 6},114 ${ax - 8},140 L${ax - 12},208 L${ax + 1},208 L${ax + 8},146Z`;
  const sl = L.uniform === 'training' ? 162 : 208;
  const lx = ax - 8 - (4 * (sl - 140)) / 68, rx = ax + 8 - (7 * (sl - 146)) / 62;
  const armSleeve = L.uniform === 'bare' ? `<path d="M${ax - 4},150 Q${ax - 10},160 ${ax - 9},172" fill="none" stroke="${shade(skin, -0.3)}" stroke-width="1.5"/>` : L.uniform === 'vest' ? `<path d="M${ax - 11.5},194 L${ax + 2.4},194 L${ax + 1},208 L${ax - 12},208Z" fill="#f2efe6" class="ol" stroke-width="1.2"/>`
    : `<path d="M${ax + 10},114 Q${ax - 6},114 ${ax - 8},140 L${lx},${sl} L${rx},${sl} L${ax + 8},146Z" fill="${uc}" class="ol"/>`;
  const arm = `<path d="${armD}" fill="${skin}" class="ol"/>${armSleeve}`;
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
  const sleeveR = haoriSleeveD ? `<path d="${haoriSleeveD}" fill="${hStyle === 'split' ? c2 : haoriSleeveFill}" class="ol"/><path d="${haoriSleeveD}" ${SHADE}/>` : '';
  const armL = `<g transform="rotate(${aL} ${shL[0]} ${shL[1]})">${arm}${haoriSleeve}${wA}${hand}</g>`;
  const armRight = mirror(`<g transform="rotate(${aR} ${shL[0]} ${shL[1]})">${arm}<path d="${armD}" ${SHADE}/>${sleeveR}${wB}${hand}</g>`);
  const stance = (side) => (action ? `rotate(${side * 7} ${120 - side * 10} 204)` : '');
  const body = `<g transform="translate(0,${dy})">
    <g class="hd" transform="${headT}">${species === 'human' ? hairBack : ''}</g>
    ${L.species === 'mouse' ? `<path d="M126,196 Q190,230 176,300 Q170,330 196,350" fill="none" stroke="#f4a6b8" stroke-width="6" stroke-linecap="round"/>` : ''}
    ${haoriBack}
    <g transform="${stance(1)}">${legsL}</g><g transform="${stance(-1)}">${legsR}</g>${legsTop}
    ${neck}${torso}${haoriFront}
    ${weaponExtra}${armL}${armRight}
    <g class="hd" transform="${headT}">${headFront}</g>
  </g>`;

  return `<svg viewBox="0 -10 240 416" class="avatar-svg" role="img" aria-label="${label}" xmlns="http://www.w3.org/2000/svg">${style}<defs>${defs}</defs>${body}</svg>`;
}
