// Demon Lab: design custom demons, then spar with them.
import { ARTS, DEMON_SKIN, DEMON_EYE, DEMON_ROBE, DEMON_OPTS, renderDemon, randomLook, randomName, labToBattle, generateDemon, rng } from './demons.js';
import { app, go, save, esc, toast, modal } from './ui.js';

const HORN_COLORS = ['#f2efe6', '#2a2a2e', '#c0303a', '#d9a83a', '#6a5a9a', '#3cb6c8'];
const MARK_COLORS = ['#c0303a', '#6a2a8a', '#2a5a8a', '#1a1018', '#d9a83a', '#3e9a5a'];
const HAIR_COLORS = ['#1b1416', '#e8e8f0', '#6a3a8a', '#c0303a', '#3a5a3a', '#e0b45a', '#3a3a5a'];
const label = { none: 'None', one: 'One horn', two: 'Two horns', four: 'Four horns', curly: 'Curly', fangs: 'Fangs', grin: 'Toothy grin', stitched: 'Stitched',
  tusks: 'Tusks', stripes: 'Stripes', spots: 'Spots', cracks: 'Cracks', swirl: 'Swirl', wild: 'Wild', long: 'Long', weak: 'Weak', normal: 'Normal', strong: 'Strong' };

export function labScreen(root) {
  const g = app.game;
  const list = g.customDemons;
  root.innerHTML = `<header class="topbar"><button class="icon-btn" data-act="back" aria-label="Back">‹</button><h1>Demon Lab</h1><span></span></header>
    <p class="hint center pad">Invent your own demons with their own Blood Demon Arts, then test your skills against them.${g.rank === 0 ? ' (Sparring gives XP after Final Selection.)' : ''}</p>
    <div class="menu-list"><button class="btn primary big" data-act="new">＋ Create a new demon</button>
      <button class="btn" data-act="random">🎲 Spar with a random demon</button></div>
    <div class="lab-list">${list.length ? list.map((d, i) => `
      <div class="lab-card"><div class="mission-face">${renderDemon(d, { headOnly: true })}</div>
        <div class="mission-info"><b>${esc(d.name)}</b><small>${ARTS[d.art].name} · ${label[d.tier]}</small></div>
        <div class="lab-btns"><button class="btn primary" data-fight="${i}">Fight</button><button class="btn" data-edit="${i}">Edit</button><button class="btn danger" data-del="${i}" aria-label="Delete ${esc(d.name)}">✕</button></div>
      </div>`).join('') : '<p class="hint center">No custom demons yet.</p>'}</div>`;

  const fight = (demon) => go('battle', { queue: [demon], mode: 'lab', scene: 'dojo', canFlee: true, onWin: () => go('lab'), onLose: () => go('lab'), onFlee: () => go('lab') });
  root.addEventListener('click', async (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    const lvl = Math.max(1, g.rank);
    if (t.dataset.act === 'back') return go('map');
    if (t.dataset.act === 'new') return go('labEdit', {});
    if (t.dataset.act === 'random') return fight({ ...generateDemon({ level: lvl }), xp: Math.round((20 + lvl * 8) * 0.5) });
    if (t.dataset.fight) return fight(labToBattle(list[+t.dataset.fight], lvl));
    if (t.dataset.edit) return go('labEdit', { index: +t.dataset.edit });
    if (t.dataset.del) {
      const d = list[+t.dataset.del];
      const ok = await modal({ title: 'Delete demon?', body: `<p>Remove <b>${esc(d.name)}</b> from your lab?</p>`, actions: [{ label: 'Keep', value: false }, { label: 'Delete', value: true, danger: true }] });
      if (ok) { list.splice(+t.dataset.del, 1); save(); go('lab'); }
    }
  });
}

export function labEditScreen(root, { index }) {
  const g = app.game;
  const editing = index != null;
  const r = rng(Date.now());
  const d = editing ? structuredClone(g.customDemons[index])
    : { id: `c${Date.now()}`, name: randomName(r), art: Object.keys(ARTS)[Math.floor(r() * 12)], tier: 'normal', look: randomLook(r) };

  root.innerHTML = `<header class="topbar"><button class="icon-btn" data-act="back" aria-label="Back">‹</button><h1>${editing ? 'Edit demon' : 'New demon'}</h1>
      <button class="icon-btn" data-act="random" aria-label="Randomise" title="Randomise">🎲</button></header>
    <div class="creator"><div class="stage"><div class="stage-avatar demon-stage"></div></div><div class="creator-side"><div class="panel lab-panel"></div></div></div>`;
  const stage = root.querySelector('.demon-stage'), panel = root.querySelector('.panel');

  const chips = (key, opts, fmt = (v) => label[v] ?? v) => `<div class="chips">${opts.map((v) => `<button class="chip ${d.look[key] === v ? 'on' : ''}" data-k="${key}" data-v="${v}">${fmt(v)}</button>`).join('')}</div>`;
  const sw = (key, opts) => `<div class="swatches">${opts.map((c) => `<button class="sw ${d.look[key] === c ? 'on' : ''}" style="--c:${c}" data-k="${key}" data-v="${c}" aria-label="${c}"></button>`).join('')}<label class="sw sw-custom"><input type="color" data-k="${key}" value="${d.look[key]}" aria-label="Custom colour">＋</label></div>`;
  const grp = (t, body) => `<section class="group"><h3>${t}</h3>${body}</section>`;

  function draw() {
    stage.innerHTML = renderDemon({ ...d, title: '' });
    const top = panel.scrollTop;
    panel.innerHTML = grp('Name', `<input class="text-in" id="dn" maxlength="20" value="${esc(d.name)}" autocomplete="off">`)
      + grp('Blood Demon Art', `<div class="art-cards">${Object.entries(ARTS).map(([k, a]) => `<button class="art-card ${d.art === k ? 'on' : ''}" data-art="${k}" style="--c:${a.color}"><b>${a.name}</b><small>${a.desc}</small></button>`).join('')}</div>`)
      + grp('Strength', `<div class="chips">${['weak', 'normal', 'strong'].map((v) => `<button class="chip ${d.tier === v ? 'on' : ''}" data-tier="${v}">${label[v]}</button>`).join('')}</div>`)
      + grp('Skin', sw('skin', DEMON_SKIN))
      + grp('Eyes', chips('eyes', DEMON_OPTS.eyes, (v) => `${v} eye${v > 1 ? 's' : ''}`)) + grp('Eye colour', sw('eyeColor', DEMON_EYE))
      + grp('Horns', chips('horns', DEMON_OPTS.horns)) + grp('Horn colour', sw('hornColor', HORN_COLORS))
      + grp('Mouth', chips('mouth', DEMON_OPTS.mouth))
      + grp('Markings', chips('marks', DEMON_OPTS.marks)) + grp('Marking colour', sw('markColor', MARK_COLORS))
      + grp('Hair', chips('hair', DEMON_OPTS.hair)) + grp('Hair colour', sw('hairColor', HAIR_COLORS))
      + grp('Arms', chips('arms', DEMON_OPTS.arms, (v) => `${v} arms`)) + grp('Robe colour', sw('robe', DEMON_ROBE))
      + `<button class="btn primary big" data-act="save">Save demon</button>`;
    panel.scrollTop = top;
  }

  root.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.k) { const v = t.dataset.v; d.look[t.dataset.k] = /^\d+$/.test(v) ? +v : v; return draw(); }
    if (t.dataset.art) { d.art = t.dataset.art; return draw(); }
    if (t.dataset.tier) { d.tier = t.dataset.tier; return draw(); }
    switch (t.dataset.act) {
      case 'back': go('lab'); break;
      case 'random': d.look = randomLook(rng(Date.now())); draw(); break;
      case 'save':
        d.name = d.name.trim() || 'Nameless';
        if (editing) g.customDemons[index] = d; else g.customDemons.push(d);
        save(); toast(`${d.name} saved to your lab`); go('lab');
        break;
    }
  });
  root.addEventListener('input', (e) => {
    if (e.target.id === 'dn') d.name = e.target.value;
    else if (e.target.type === 'color') { d.look[e.target.dataset.k] = e.target.value; stage.innerHTML = renderDemon({ ...d, title: '' }); }
  });
  draw();
}
