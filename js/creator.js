// Character + weapon creator. Used for a new slayer and for the wardrobe / swordsmith later.
import * as D from './data.js';
import { renderAvatar, mangaWeaponArt, guardFace } from './avatar.js';
import { app, go, save, esc, toast } from './ui.js';

const TABS = [
  { id: 'face', label: 'Face' }, { id: 'eyes', label: 'Eyes' }, { id: 'hair', label: 'Hair' }, { id: 'marks', label: 'Marks' },
  { id: 'body', label: 'Body' }, { id: 'outfit', label: 'Outfit' }, { id: 'library', label: 'Outfit library' },
  { id: 'weapon', label: 'Weapon' }, { id: 'name', label: 'Name & difficulty' },
];

// Each group: [title, lookKey, options | colours, { preview, none }]
const GROUPS = {
  face: [['Character', 'species', D.SPECIES, { preview: true }], ['Fur colour (Mouse & Boar)', 'furColor', D.FUR], ['Skin tone', 'skin', D.SKIN], ['Face shape', 'face', D.FACE, { preview: true }], ['Ears', 'ears', D.EARS, { preview: true }],
    ['Nose', 'nose', D.NOSE, { preview: true }], ['Mouth', 'mouth', D.MOUTH, { preview: true }],
    ['Rosy cheeks', 'blush', [{ id: true, name: 'On' }, { id: false, name: 'Off' }]]],
  eyes: [['Eye shape', 'eyes', D.EYES, { preview: true }], ['Eye colour', 'eyeColor', D.EYE_COLORS],
    ['Right eye colour (odd eyes!)', 'eyeColor2', D.EYE_COLORS, { none: 'Same' }], ['Eyebrows', 'brows', D.BROWS, { preview: true }]],
  hair: [['Hairstyle', 'hair', D.HAIR, { preview: true }], ['Hair colour', 'hairColor', D.HAIR_COLORS],
    ['Hair tips (two-tone)', 'hairTip', D.HAIR_COLORS, { none: 'None' }], ['Tip style', 'hairFade', D.HAIR_FADE], ['Hair accessory', 'accessory', D.ACCESSORY, { preview: true }],
    ['Accessory colour', 'accColor', D.CLOTH_COLORS], ['Headgear', 'headgear', D.HEADGEAR, { preview: true }], ['Headgear colour', 'headgearColor', D.CLOTH_COLORS]],
  marks: [['Scars', 'scar', D.SCARS, { preview: true }], ['Birthmarks & Slayer Marks', 'mark', D.MARKS, { preview: true }],
    ['Earrings', 'earrings', D.EARRINGS, { preview: true }], ['Earring colour', 'earringColor', D.METAL_COLORS]],
  body: [['Body style', 'body', D.BODY], ['Build', 'build', D.BUILD], ['Height', 'height', D.HEIGHT], ['Skin tone', 'skin', D.SKIN]],
  outfit: [['Top', 'uniform', D.UNIFORM], ['Top colour', 'uniformColor', D.CLOTH_COLORS], ['Bottoms', 'pants', D.PANTS],
    ['Shoes', 'shoes', D.SHOES], ['Haori (jacket)', 'haori', D.HAORI], ['Haori colour', 'haoriColor', D.CLOTH_COLORS],
    ['Haori pattern colour', 'haoriColor2', D.CLOTH_COLORS], ['Trousers colour', 'pantsColor', D.CLOTH_COLORS, { none: 'Auto' }],
    ['Leg wrap colour', 'wrapColor', D.CLOTH_COLORS], ['Scarf', 'scarf', D.SCARF], ['Scarf colour', 'scarfColor', D.CLOTH_COLORS],
    ['Straw cape', 'cape', D.CAPE], ['Arm bands', 'armbands', D.ARMBANDS], ['Fur shorts (Muscle Mouse)', 'shortsColor', D.CLOTH_COLORS]],
};

const isColorList = (opts) => typeof opts[0] === 'string';
const pickR = (a) => a[Math.floor(Math.random() * a.length)];

export function randomName(look) {
  if (look.species === 'mouse') return pickR(D.NAMES.mouse);
  const given = look.body === 'fem' ? D.NAMES.fem : look.body === 'masc' ? D.NAMES.masc : [...D.NAMES.masc, ...D.NAMES.fem];
  return `${pickR(given)} ${pickR(D.NAMES.family)}`;
}

export function randomLook() {
  const L = { ...D.DEFAULT_LOOK };
  for (const groups of Object.values(GROUPS)) {
    for (const [, key, opts] of groups) {
      const v = pickR(opts);
      L[key] = typeof v === 'string' ? v : v.id;
    }
  }
  L.eyeColor2 = Math.random() < 0.15 ? pickR(D.EYE_COLORS) : '';
  L.hairTip = Math.random() < 0.3 ? pickR(D.HAIR_COLORS) : '';
  L.scar = Math.random() < 0.35 ? L.scar : 'none';
  L.mark = Math.random() < 0.35 ? L.mark : 'none';
  L.accessory = Math.random() < 0.4 ? L.accessory : 'none';
  L.skin = pickR(D.SKIN.slice(0, 7));
  Object.assign(L, { species: 'human', pantsColor: '', cape: 'none', armbands: 'none', scarf: Math.random() < 0.2 ? 'knit' : 'none', accessory: ['maskFace', 'strawHat'].includes(L.accessory) ? 'none' : L.accessory, headgear: 'none' });
  L.body = pickR(['masc', 'fem']);
  return L;
}

export function creatorScreen(root, params) {
  const g = app.game;
  const isNew = params.mode === 'new';
  const look = { ...g.look };
  const weapon = { ...g.weapon };
  let name = g.name || '';
  let crow = g.crow;
  let difficulty = g.difficulty || 'medium';
  let tab = params.tab || 'face';
  let pose = 'idle';

  root.innerHTML = `
    <header class="topbar">
      <button class="icon-btn" data-act="back" aria-label="Back">‹</button>
      <h1>${isNew ? 'Create your slayer' : params.tab === 'weapon' ? 'Swordsmith' : 'Wardrobe'}</h1>
      <button class="icon-btn" data-act="random" aria-label="Randomise look" title="Randomise">🎲</button>
    </header>
    <div class="creator">
      <div class="stage"><div class="stage-avatar"></div><div class="stage-weapon"></div><button class="pose-btn" data-act="pose" aria-pressed="false">⚔️ Battle pose</button></div>
      <div class="creator-side">
        <nav class="tabs" role="tablist">${TABS.map((t) => `<button role="tab" class="tab" data-tab="${t.id}">${t.label}</button>`).join('')}</nav>
        <div class="panel" role="tabpanel"></div>
      </div>
    </div>`;

  const stageA = root.querySelector('.stage-avatar');
  const stageW = root.querySelector('.stage-weapon');
  const panel = root.querySelector('.panel');

  function drawStage() {
    stageA.innerHTML = renderAvatar(look, { weapon, breathing: g.breathing, name, pose });
    stageW.innerHTML = tab === 'weapon' ? mangaWeaponArt(weapon, g.breathing, name) : '';
    stageW.hidden = tab !== 'weapon';
  }

  function chips(key, opts, extra = {}) {
    const cur = look[key];
    if (isColorList(opts)) {
      const none = extra.none ? `<button class="sw sw-none ${!cur ? 'on' : ''}" data-k="${key}" data-v="" aria-label="${extra.none}">${extra.none}</button>` : '';
      return `<div class="swatches">${none}${opts.map((c) => `<button class="sw ${cur === c ? 'on' : ''}" style="--c:${c}" data-k="${key}" data-v="${c}" aria-label="${c}"></button>`).join('')}
        <label class="sw sw-custom" title="Pick any colour"><input type="color" data-k="${key}" value="${cur || '#888888'}" aria-label="Custom colour">＋</label></div>`;
    }
    return `<div class="chips">${opts.map((o) => {
      const on = cur === o.id;
      const prev = extra.preview ? `<span class="chip-prev">${renderAvatar({ ...look, [key]: o.id }, { headOnly: true })}</span>` : '';
      return `<button class="chip ${extra.preview ? 'chip-big' : ''} ${on ? 'on' : ''}" data-k="${key}" data-v="${o.id}" aria-pressed="${on}">${prev}<span>${o.name}</span></button>`;
    }).join('')}</div>`;
  }

  function weaponPanel() {
    const wchips = (key, opts, fmt) => `<div class="chips">${opts.map((o) => `<button class="chip ${weapon[key] === o.id ? 'on' : ''}" data-w="${key}" data-v="${o.id}">${fmt ? fmt(o) : o.name}</button>`).join('')}</div>`;
    const wsw = (key, opts, auto) => `<div class="swatches">${auto ? `<button class="sw sw-none ${weapon[key] === 'auto' ? 'on' : ''}" data-w="${key}" data-v="auto">Nichirin</button>` : ''}${opts.map((c) => `<button class="sw ${weapon[key] === c ? 'on' : ''}" style="--c:${c}" data-w="${key}" data-v="${c}" aria-label="${c}"></button>`).join('')}
      <label class="sw sw-custom"><input type="color" data-w="${key}" value="${weapon[key] && weapon[key] !== 'auto' ? weapon[key] : '#888888'}" aria-label="Custom colour">＋</label></div>`;
    const stat = (v, max) => `<span class="mini-bar"><i style="width:${Math.min(100, (v / max) * 100)}%"></i></span>`;
    const blades = [...new Set([...Object.values(D.BREATHING).map((b) => b.blade), '#2a2a2e', '#c0c6cf'])];
    return `
      <section class="group"><h3>Weapon type</h3><div class="weapon-cards">${D.WEAPONS.map((w) => `
        <button class="wcard ${weapon.type === w.id ? 'on' : ''}" data-w="type" data-v="${w.id}">
          <span class="wart">${mangaWeaponArt({ ...weapon, type: w.id }, g.breathing, name, { sfx: false })}</span>
          <b>${w.name}</b><small>${w.desc}</small>
          <span class="wstats"><span>Power ${stat(w.pow, 1.5)}</span><span>Speed ${stat(w.spd, 1.4)}</span><span>Luck ${stat(w.crit, 0.2)}</span></span>
        </button>`).join('')}</div></section>
      <section class="group"><h3>Blade colour</h3><p class="hint">"Nichirin" blades change colour to match your breathing style${g.breathing ? '' : ' once you choose one'}.</p>${wsw('blade', blades, true)}</section>
      <section class="group"><h3>Guard (tsuba)</h3><div class="chips">${D.GUARDS.map((o) => `<button class="chip chip-big ${weapon.guard === o.id ? 'on' : ''}" data-w="guard" data-v="${o.id}"><span class="chip-prev guard-prev">${guardFace(o.id, weapon.guardColor)}</span><span>${o.name}</span></button>`).join('')}</div></section>
      <section class="group"><h3>Guard &amp; metal colour</h3>${wsw('guardColor', D.METAL_COLORS)}</section>
      <section class="group"><h3>Handle wrap</h3>${wsw('wrap', D.CLOTH_COLORS)}</section>
      <section class="group"><h3>Engraving</h3>${wchips('engraving', D.ENGRAVINGS)}</section>
      ${g.rank === 0 ? '<p class="hint">You train with a wooden sword for now. The swordsmith forges this weapon when you pass Final Selection.</p>' : ''}`;
  }

  function libraryPanel() {
    return `<p class="hint">Tap an outfit to wear it. You can still change every colour afterwards in Outfit.</p>
      <div class="library">${D.OUTFIT_PRESETS.map((p, i) => `
        <button class="lib-card" data-preset="${i}">${renderAvatar({ ...look, species: 'human', ...p.set }, { weapon: p.weapon ? { ...weapon, ...p.weapon } : null })}<b>${p.name}</b><small>${p.note}</small></button>`).join('')}</div>`;
  }

  function namePanel() {
    const diff = `<section class="group"><h3>Difficulty</h3><div class="diff-cards">${Object.entries(D.DIFFICULTY).map(([id, d]) => `
        <button class="diff-card ${difficulty === id ? 'on' : ''}" data-diff="${id}" aria-pressed="${difficulty === id}"><b>${d.icon} ${d.name}</b><small>${d.desc}</small></button>`).join('')}</div>
        <p class="hint">You can change this any time in the Wardrobe.</p></section>`;
    return diff + `<section class="group"><h3>Your name</h3>
        <div class="in-row"><input class="text-in" id="nm" maxlength="20" placeholder="e.g. Hana Haruno" value="${esc(name)}" autocomplete="off">
        <button class="icon-btn" data-act="rname" aria-label="Random name" title="Random name">🎲</button></div></section>
      <section class="group"><h3>Your Kasugai crow's name</h3><p class="hint">Every slayer gets a talking crow that brings missions.</p>
        <div class="in-row"><input class="text-in" id="crow" maxlength="16" value="${esc(crow)}" autocomplete="off">
        <button class="icon-btn" data-act="rcrow" aria-label="Random crow name" title="Random crow name">🎲</button></div></section>
      <button class="btn primary big" data-act="finish">${isNew ? 'Begin your journey ▸' : 'Save changes'}</button>`;
  }

  function drawPanel() {
    root.querySelectorAll('.tab').forEach((t) => {
      t.setAttribute('aria-selected', t.dataset.tab === tab);
      if (t.dataset.tab === tab) {
        const bar = t.parentElement;
        bar.scrollLeft = Math.max(0, t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2);
      }
    });
    const top = panel.scrollTop;
    if (tab === 'weapon') panel.innerHTML = weaponPanel();
    else if (tab === 'library') panel.innerHTML = libraryPanel();
    else if (tab === 'name') panel.innerHTML = namePanel();
    else panel.innerHTML = GROUPS[tab].map(([title, key, opts, extra]) => `<section class="group"><h3>${title}</h3>${chips(key, opts, extra)}</section>`).join('')
      + `<div class="panel-next"><button class="btn" data-act="next">Next: ${TABS[TABS.findIndex((t) => t.id === tab) + 1].label} ▸</button></div>`;
    panel.scrollTop = top;
  }

  function redraw() { drawStage(); drawPanel(); }

  function persist() {
    Object.assign(g, { look: { ...look }, weapon: { ...weapon }, name: name.trim(), crow: crow.trim() || g.crow, difficulty });
    save();
  }

  root.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.tab) { tab = t.dataset.tab; panel.scrollTop = 0; redraw(); return; }
    if (t.dataset.k) {
      let v = t.dataset.v;
      if (v === 'true' || v === 'false') v = v === 'true';
      look[t.dataset.k] = v;
      // Picking a mouse or boar sets up a fitting outfit (still changeable).
      if (t.dataset.k === 'species' && v === 'mouse') Object.assign(look, { accColor: '#d8a6e8', furColor: '#c9c4d6' });
      if (t.dataset.k === 'species' && v === 'boar') Object.assign(look, { uniform: 'bare', haori: 'none', pants: 'baggy', pantsColor: '#26304a', shoes: 'furBoots', furColor: '#9a948e' });
      if (t.dataset.k === 'species' && v === 'smith') Object.assign(look, { uniform: 'kimono', uniformColor: '#2a2a2e', haori: 'none', pants: 'hakama', pantsColor: '#b8ac90', shoes: 'geta', hairColor: '#1b1416' });
      if (t.dataset.k === 'species' && v === 'human' && look.uniform === 'bare') Object.assign(look, { uniform: 'corps' });
      redraw();
      return;
    }
    if (t.dataset.w) { weapon[t.dataset.w] = t.dataset.v; redraw(); return; }
    if (t.dataset.diff) { difficulty = t.dataset.diff; drawPanel(); return; }
    if (t.dataset.preset) {
      const pr = D.OUTFIT_PRESETS[+t.dataset.preset];
      Object.assign(look, { species: 'human', ...pr.set });
      if (pr.weapon) Object.assign(weapon, pr.weapon);
      drawStage(); toast(`Wearing ${pr.name}${pr.weapon ? ' (weapon too)' : ''}`); return;
    }
    switch (t.dataset.act) {
      case 'random': Object.assign(look, randomLook()); redraw(); break;
      case 'rname': name = randomName(look); drawPanel(); drawStage(); break;
      case 'rcrow': crow = pickR(D.CROW_NAMES.filter((c) => c !== crow)); drawPanel(); break;
      case 'pose': pose = pose === 'idle' ? 'action' : 'idle'; t.setAttribute('aria-pressed', pose === 'action'); drawStage(); break;
      case 'next': tab = TABS[TABS.findIndex((x) => x.id === tab) + 1].id; panel.scrollTop = 0; redraw(); break;
      case 'back':
        if (isNew) go('title');
        else { persist(); go(params.back || 'map'); }
        break;
      case 'finish':
        if (!name.trim()) { toast('Give your slayer a name first!'); root.querySelector('#nm')?.focus(); return; }
        persist();
        if (isNew) go('intro'); else { toast('Saved!'); go(params.back || 'map'); }
        break;
    }
  });

  root.addEventListener('input', (e) => {
    const t = e.target;
    if (t.id === 'nm') { name = t.value; return; }
    if (t.id === 'crow') { crow = t.value; return; }
    if (t.type === 'color') {
      if (t.dataset.k) look[t.dataset.k] = t.value;
      if (t.dataset.w) weapon[t.dataset.w] = t.value;
      drawStage();
    }
  });
  root.addEventListener('change', (e) => { if (e.target.type === 'color') drawPanel(); });

  redraw();
}
