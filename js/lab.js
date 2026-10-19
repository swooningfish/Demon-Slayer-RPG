// Demon Lab: stock demons, a full demon creator (body, head, eyes, hair, marks, outfit, extras,
// Blood Demon Art and Twelve Kizuki rank), and sparring.
import { ARTS, DEMON_SKIN, DEMON_EYE, DEMON_ROBE, DEMON_ACCENT, DEMON_OPTS, DEFAULT_DEMON, RANKS_KIZUKI, STOCK_DEMONS,
  normalizeLook, rankInfo, renderDemon, randomLook, randomName, labToBattle, generateDemon, rng } from './demons.js';
import { app, go, save, esc, toast, modal } from './ui.js';

const HORN_C = ['#f2efe6', '#d8d0c0', '#2a2a2e', '#c0303a', '#d9a83a', '#6a5a9a', '#8a7a6a'];
const MARK_C = ['#c0303a', '#b8202e', '#ff7ab8', '#c03a8a', '#6a2a8a', '#4a3a9a', '#2a5a8a', '#1a1018', '#f2efe6', '#e8902a'];
const HAIR_C = ['#1b1416', '#2a2e4a', '#f2f0f4', '#d8c8e0', '#6a3a8a', '#c0303a', '#8ad640', '#3a5a3a', '#e0b45a'];
const NAIL_C = ['#2a1a20', '#3a6a8a', '#6a2a4a', '#2a2a5a', '#c0303a', '#e8e4ec'];
const TIER = { weak: 'Weak', normal: 'Normal', strong: 'Strong' };

const TABS = [
  { id: 'body', label: 'Type & body' }, { id: 'head', label: 'Head' }, { id: 'eyes', label: 'Eyes' }, { id: 'hair', label: 'Hair & horns' },
  { id: 'marks', label: 'Marks' }, { id: 'outfit', label: 'Outfit' }, { id: 'extras', label: 'Extras' }, { id: 'power', label: 'Art & rank' }, { id: 'name', label: 'Name' },
];

/* ---------------- list screen ---------------- */
export function labScreen(root) {
  const g = app.game;
  const list = g.customDemons;
  const lvl = Math.max(1, g.rank);
  const card = (d, i, stock) => {
    const ri = rankInfo(d.rank || d.look?.rank);
    return `<div class="lab-card"><div class="mission-face">${renderDemon(d, { headOnly: true })}</div>
      <div class="mission-info"><b>${esc(d.name)}</b><small>${stock ? `${esc(d.note)} · ` : ''}${ARTS[d.art]?.name || 'No Blood Demon Art'} · ${TIER[d.tier] || 'Normal'}</small>
        ${ri ? `<span class="art-tag" style="--c:#ff5a6a">${ri.label} ${ri.kanji.join('')}</span>` : ''}</div>
      <div class="lab-btns">${stock
        ? `<button class="btn primary" data-sfight="${i}">Fight</button><button class="btn" data-copy="${i}">Copy &amp; edit</button>`
        : `<button class="btn primary" data-fight="${i}">Fight</button><button class="btn" data-edit="${i}">Edit</button><button class="btn danger" data-del="${i}" aria-label="Delete ${esc(d.name)}">✕</button>`}</div>
    </div>`;
  };
  root.innerHTML = `<header class="topbar"><button class="icon-btn" data-act="back" aria-label="Back">‹</button><h1>Demon Lab</h1><span></span></header>
    <p class="hint center pad">Build your own demons, from human-looking to monstrous, give them a Blood Demon Art (or none) and even a Twelve Kizuki rank, then test your skills.${g.rank === 0 ? ' (Sparring gives XP after Final Selection.)' : ''}</p>
    <div class="menu-list"><button class="btn primary big" data-act="new">＋ Create a new demon</button>
      <button class="btn" data-act="random">🎲 Spar with a random demon</button></div>
    <h2 class="lab-h">Your demons</h2>
    <div class="lab-list">${list.length ? list.map((d, i) => card(d, i, false)).join('') : '<p class="hint center">No custom demons yet. Create one, or copy a stock demon below.</p>'}</div>
    <h2 class="lab-h">Stock demons</h2>
    <div class="lab-list">${STOCK_DEMONS.map((d, i) => card(d, i, true)).join('')}</div>`;

  const fight = (demon) => go('battle', { queue: [demon], mode: 'lab', scene: 'dojo', canFlee: true, onWin: () => go('lab'), onLose: () => go('lab'), onFlee: () => go('lab') });
  root.addEventListener('click', async (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.act === 'back') return go('map');
    if (t.dataset.act === 'new') return go('labEdit', {});
    if (t.dataset.act === 'random') return fight({ ...generateDemon({ level: lvl }), xp: Math.round((20 + lvl * 8) * 0.5) });
    if (t.dataset.fight) return fight(labToBattle(list[+t.dataset.fight], lvl));
    if (t.dataset.sfight) return fight(labToBattle(STOCK_DEMONS[+t.dataset.sfight], lvl));
    if (t.dataset.copy) return go('labEdit', { from: +t.dataset.copy });
    if (t.dataset.edit) return go('labEdit', { index: +t.dataset.edit });
    if (t.dataset.del) {
      const d = list[+t.dataset.del];
      const ok = await modal({ title: 'Delete demon?', body: `<p>Remove <b>${esc(d.name)}</b> from your lab?</p>`, actions: [{ label: 'Keep', value: false }, { label: 'Delete', value: true, danger: true }] });
      if (ok) { list.splice(+t.dataset.del, 1); save(); go('lab'); }
    }
  });
}

/* ---------------- creator ---------------- */
export function labEditScreen(root, { index, from }) {
  const g = app.game;
  const editing = index != null;
  const r = rng(Date.now());
  const src = editing ? g.customDemons[index] : from != null ? STOCK_DEMONS[from] : null;
  const d = src
    ? { ...structuredClone(src), id: editing ? src.id : `c${Date.now()}`, rank: src.rank || src.look?.rank || 'none', look: normalizeLook(src.look) }
    : { id: `c${Date.now()}`, name: randomName(r), art: 'none', tier: 'normal', rank: 'none', look: randomLook(r, 'semi') };
  delete d.note;
  if (!ARTS[d.art]) d.art = 'none';
  let tab = 'body';

  root.innerHTML = `<header class="topbar"><button class="icon-btn" data-act="back" aria-label="Back">‹</button><h1>${editing ? 'Edit demon' : 'New demon'}</h1>
      <div class="topbar-btns"><button class="icon-btn" data-act="reset" aria-label="Reset" title="Reset">↺</button><button class="icon-btn" data-act="random" aria-label="Randomise" title="Randomise">🎲</button></div></header>
    <div class="creator"><div class="stage"><div class="stage-avatar demon-stage"></div><div class="stage-rank"></div></div>
      <div class="creator-side"><nav class="tabs" role="tablist">${TABS.map((t) => `<button role="tab" class="tab" data-tab="${t.id}">${t.label}</button>`).join('')}</nav><div class="panel"></div></div></div>`;
  const stage = root.querySelector('.demon-stage'), rankEl = root.querySelector('.stage-rank'), panel = root.querySelector('.panel');
  const L = () => d.look;
  const view = () => ({ ...d, title: '', look: { ...d.look, rank: d.rank } });

  const drawStage = () => {
    stage.innerHTML = renderDemon(view());
    const ri = rankInfo(d.rank);
    rankEl.innerHTML = ri ? `<span class="rank-pill">${ri.kanji.join('')} ${ri.label}</span>` : '';
  };
  const preview = (key, v) => renderDemon({ ...view(), look: { ...d.look, rank: d.rank, [key]: v } }, { headOnly: true });
  const chips = (key, opts, { preview: pv = false, fmt } = {}) => `<div class="chips">${opts.map((op) => {
    const v = op.id ?? op, name = fmt ? fmt(v) : op.name ?? v, on = L()[key] === v;
    return `<button class="chip ${pv ? 'chip-big' : ''} ${on ? 'on' : ''}" data-k="${key}" data-v="${v}" aria-pressed="${on}">${pv ? `<span class="chip-prev">${preview(key, v)}</span>` : ''}<span>${name}</span></button>`;
  }).join('')}</div>`;
  const sw = (key, opts) => `<div class="swatches">${opts.map((c) => `<button class="sw ${L()[key] === c ? 'on' : ''}" style="--c:${c}" data-k="${key}" data-v="${c}" aria-label="${c}"></button>`).join('')}
    <label class="sw sw-custom"><input type="color" data-k="${key}" value="${L()[key] || '#888888'}" aria-label="Custom colour">＋</label></div>`;
  const grp = (t, body, hint = '') => `<section class="group"><h3>${t}</h3>${hint ? `<p class="hint">${hint}</p>` : ''}${body}</section>`;
  const spider = () => L().build === 'spider';

  const panels = {
    body: () => grp('Kind of demon', chips('kind', DEMON_OPTS.kind), 'Human-looking demons pass for people; semi-human ones have horns and fangs; monstrous ones barely look human. 🎲 randomises within the kind you pick.')
      + grp('Body', `<div class="chips">${DEMON_OPTS.build.map((b) => `<button class="chip chip-big chip-tall ${L().build === b.id ? 'on' : ''}" data-k="build" data-v="${b.id}"><span class="chip-prev">${renderDemon({ ...view(), look: { ...d.look, build: b.id, rank: d.rank } })}</span><span>${b.name}</span></button>`).join('')}</div>`)
      + grp(spider() ? 'Spider body colour' : 'Skin', spider() ? sw('robe', DEMON_ROBE) : sw('skin', DEMON_SKIN))
      + (spider() ? grp('Leg bands & markings', sw('markColor', MARK_C)) : grp('Arms', chips('arms', DEMON_OPTS.arms, { fmt: (v) => `${v} arms` })) + grp('Nails & claws', sw('nails', NAIL_C))),
    head: () => grp('Head', chips('head', DEMON_OPTS.head, { preview: true }), spider() ? 'Giant spiders carry a small human head under the body.' : '')
      + (L().head === 'spider' && !spider() ? '' : grp('Ears', chips('ears', DEMON_OPTS.ears, { preview: true })) + grp('Mouth', chips('mouth', DEMON_OPTS.mouth, { preview: true })))
      + grp('Skin', sw('skin', DEMON_SKIN)),
    eyes: () => (L().head === 'spider' && !spider() ? '<p class="hint">Spider faces always have a cluster of glossy eyes.</p>' : grp('Number of eyes', chips('eyes', DEMON_OPTS.eyes, { preview: true, fmt: (v) => `${v} eye${v > 1 ? 's' : ''}` }))
      + grp('Eye style', chips('eyeStyle', DEMON_OPTS.eyeStyle, { preview: true })) + grp('Whites of the eyes', chips('sclera', DEMON_OPTS.sclera, { preview: true })) + grp('Eye colour', sw('eyeColor', DEMON_EYE))),
    hair: () => grp('Hair', chips('hair', DEMON_OPTS.hair, { preview: true })) + grp('Hair colour', sw('hairColor', HAIR_C))
      + (L().head === 'spider' ? '' : grp('Horns', chips('horns', DEMON_OPTS.horns, { preview: true })) + grp('Horn colour', sw('hornColor', HORN_C))),
    marks: () => grp('Face & body markings', chips('marks', DEMON_OPTS.marks, { preview: true }), 'Many demons have tattoo-like marks, like dot chains or cheek bars.') + grp('Marking colour', sw('markColor', MARK_C)),
    outfit: () => spider() ? '<p class="hint">Giant spiders don\'t wear clothes. Change the body colour in Type & body.</p>'
      : grp('Clothes', chips('outfit', DEMON_OPTS.outfit)) + grp('Main colour', sw('robe', DEMON_ROBE)) + grp('Obi, sash & stripe colour', sw('obi', DEMON_ROBE))
        + (['kimono', 'robe'].includes(L().outfit) ? grp('Pattern', chips('pattern', DEMON_OPTS.pattern)) : '') + grp('Feet', chips('feet', DEMON_OPTS.feet)),
    extras: () => spider() ? '<p class="hint">Extras are for demons with a human-shaped body.</p>'
      : grp('Extras (pick as many as you like)', `<div class="chips">${DEMON_OPTS.extras.map((x) => { const on = L().extras.includes(x.id); return `<button class="chip ${on ? 'on' : ''}" data-x="${x.id}" aria-pressed="${on}">${on ? '✓ ' : ''}${x.name}</button>`; }).join('')}</div>`)
        + grp('Beads, sash & band accent colour', sw('accent', DEMON_ACCENT)),
    power: () => grp('Blood Demon Art', `<div class="art-cards">${Object.entries(ARTS).map(([k, a]) => `<button class="art-card ${d.art === k ? 'on' : ''}" data-art="${k}" style="--c:${a.color}"><b>${a.name}</b><small>${a.desc}</small></button>`).join('')}</div>`)
      + grp('Strength', `<div class="chips">${Object.entries(TIER).map(([v, n]) => `<button class="chip ${d.tier === v ? 'on' : ''}" data-tier="${v}">${n}</button>`).join('')}</div>`)
      + grp('Twelve Kizuki rank', `<div class="rank-grid">${RANKS_KIZUKI.map((rk) => { const ri = rankInfo(rk.id); return `<button class="chip rank-chip ${d.rank === rk.id ? 'on' : ''}" data-rank="${rk.id}">${ri ? `<b>${ri.kanji.join('')}</b>` : ''}<span>${rk.name}</span></button>`; }).join('')}</div>`,
        'The strongest demons serve as the Twelve Kizuki: six Lower Moons and six Upper Moons. Their rank is carved into their eyes, and Upper Moons are extremely tough!'),
    name: () => grp('Name', `<div class="in-row"><input class="text-in" id="dn" maxlength="20" value="${esc(d.name)}" autocomplete="off"><button class="icon-btn" data-act="rname" aria-label="Random name">🎲</button></div>`)
      + `<button class="btn primary big" data-act="save">Save demon</button>`,
  };

  function drawPanel() {
    root.querySelectorAll('.tab').forEach((t) => {
      t.setAttribute('aria-selected', t.dataset.tab === tab);
      if (t.dataset.tab === tab) { const bar = t.parentElement; bar.scrollLeft = Math.max(0, t.offsetLeft - (bar.clientWidth - t.offsetWidth) / 2); }
    });
    const top = panel.scrollTop;
    const i = TABS.findIndex((t) => t.id === tab);
    panel.innerHTML = panels[tab]() + (TABS[i + 1] ? `<div class="panel-next"><button class="btn" data-act="next">Next: ${TABS[i + 1].label} ▸</button></div>` : '');
    panel.scrollTop = top;
  }
  const redraw = () => { drawStage(); drawPanel(); };

  root.addEventListener('click', async (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.tab) { tab = t.dataset.tab; panel.scrollTop = 0; return redraw(); }
    if (t.dataset.k) {
      const v = t.dataset.v;
      L()[t.dataset.k] = /^\d+$/.test(v) ? +v : v;
      return redraw();
    }
    if (t.dataset.x) {
      const x = L().extras;
      L().extras = x.includes(t.dataset.x) ? x.filter((y) => y !== t.dataset.x) : [...x, t.dataset.x];
      return redraw();
    }
    if (t.dataset.art) { d.art = t.dataset.art; return redraw(); }
    if (t.dataset.tier) { d.tier = t.dataset.tier; return redraw(); }
    if (t.dataset.rank) { d.rank = t.dataset.rank; return redraw(); }
    switch (t.dataset.act) {
      case 'back': go('lab'); break;
      case 'next': tab = TABS[TABS.findIndex((x) => x.id === tab) + 1].id; panel.scrollTop = 0; redraw(); break;
      case 'random': d.look = randomLook(rng(Date.now()), L().kind); redraw(); toast(`Random ${DEMON_OPTS.kind.find((k) => k.id === L().kind).name.toLowerCase()} demon`); break;
      case 'rname': d.name = randomName(rng(Date.now())); drawPanel(); break;
      case 'reset': {
        const ok = await modal({ title: 'Reset demon?', body: '<p>Start again from a plain demon? The name, art and rank stay.</p>', actions: [{ label: 'Reset look', value: true, primary: true }, { label: 'Cancel', value: false }] });
        if (ok) { d.look = { ...DEFAULT_DEMON, extras: [] }; redraw(); }
        break;
      }
      case 'save':
        d.name = d.name.trim() || 'Nameless';
        d.look.rank = d.rank;
        if (editing) g.customDemons[index] = d; else g.customDemons.push(d);
        save(); toast(`${d.name} saved to your lab`); go('lab');
        break;
    }
  });
  root.addEventListener('input', (e) => {
    if (e.target.id === 'dn') d.name = e.target.value;
    else if (e.target.type === 'color') { L()[e.target.dataset.k] = e.target.value; drawStage(); }
  });
  root.addEventListener('change', (e) => { if (e.target.type === 'color') drawPanel(); });
  redraw();
}
