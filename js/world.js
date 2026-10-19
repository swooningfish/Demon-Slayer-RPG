// The forest chapter: map, home, mentor, breathing choice, Final Selection, patrols, boss and profile.
import { BREATHING, DIFFICULTY, RANKS, REGIONS, CHAPTER1_RANK_CAP, TRAINING_TO_CHOOSE_BREATHING, TRAINING_FOR_SELECTION, DEFAULT_LOOK } from './data.js';
import { renderAvatar, mangaWeaponArt } from './avatar.js';
import { generateDemon, renderDemon, ARTS } from './demons.js';
import { renderScene } from './scenes.js';
import { app, go, save, esc, toast, dialog, modal, bar } from './ui.js';
import { forms, rankProgress, fullHeal, trainingLeft, activeWeapon, weaponOf, rankUp } from './game.js';

const MENTOR_LOOK = { ...DEFAULT_LOOK, hair: 'neat', hairColor: '#e8e8ee', eyes: 'sleepy', eyeColor: '#3c8be0', mouth: 'neutral', brows: 'thick',
  accessory: 'foxMask', accColor: '#c0303a', haori: 'waves', haoriColor: '#2a4f86', haoriColor2: '#f2efe6', uniform: 'kimono', uniformColor: '#3a2f4f', skin: '#f0c29e', blush: false };
const mentorFace = () => renderAvatar(MENTOR_LOOK, { headOnly: true });
// Kasugai crow: a sleek blue-black jungle crow with a heavy beak and a pale eye.
const crowFace = () => `<svg viewBox="0 0 64 64" aria-hidden="true"><g stroke="#0c0e18" stroke-width="1.6" stroke-linejoin="round">
  <path d="M6,44 L20,36 L24,46 L10,50Z" fill="#181b2c"/>
  <path d="M14,40 Q18,24 36,22 Q48,24 48,36 Q44,50 26,50 Q16,48 14,40Z" fill="#1e2236"/>
  <path d="M20,36 Q32,28 44,36 Q36,46 18,46Z" fill="#283050"/>
  <circle cx="42" cy="20" r="10" fill="#1e2236"/>
  <path d="M48,14 Q60,13 63,21 Q56,21 50,24Z" fill="#2c3048"/></g>
  <path d="M50,16 Q58,15 61,19" stroke="#6a7498" stroke-width="1.2" fill="none"/>
  <path d="M24,38 Q32,33 40,38 M22,42 Q30,38 38,42" stroke="#4a5a8a" stroke-width="1" fill="none"/>
  <path d="M34,14 Q40,10 46,12 M26,28 Q34,24 42,26" stroke="#5a6c9e" stroke-width="1.4" fill="none" opacity=".8"/>
  <circle cx="45" cy="18" r="2.4" fill="#cdd0de"/><circle cx="45.4" cy="18" r="1" fill="#14161f"/>
  <path d="M28,50 L27,58 M34,50 L35,58 M24,58 L30,58 M32,58 L38,58" stroke="#14161f" stroke-width="1.6"/></svg>`;
const meFace = () => renderAvatar(app.game.look, { headOnly: true });
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

export function hud(g) {
  const rp = rankProgress(g);
  const nxt = RANKS[g.rank + 1];
  return `<header class="hud">
    <button class="hud-me" data-go="profile" aria-label="Profile"><span class="hud-face">${renderAvatar(g.look, { headOnly: true })}</span>
      <span class="rank-badge" title="${RANKS[g.rank].name}">${RANKS[g.rank].kanji}</span></button>
    <div class="hud-main"><div class="hud-name">${esc(g.name)} <small>${RANKS[g.rank].name}</small></div>
      ${bar(g.hp, g.stats.hp, 'hp sm')}
      ${g.rank > 0 && nxt ? `<div class="xpbar" title="XP to ${nxt.name}"><i style="width:${rp.pct * 100}%"></i><span>${rp.have} / ${rp.need} XP to ${nxt.name}</span></div>` : ''}</div>
    <button class="icon-btn" data-go="title" aria-label="Menu and save slots" title="Menu">☰</button>
  </header>`;
}

function objective(g) {
  if (g.trainings < TRAINING_TO_CHOOSE_BREATHING) return 'Visit your mentor on the mountain and start training.';
  if (!g.breathing) return 'Your mentor wants to talk to you about breathing styles.';
  if (g.trainings < TRAINING_FOR_SELECTION) return `Train ${plural(TRAINING_FOR_SELECTION - g.trainings, 'more time')} to be ready for Final Selection.`;
  if (!g.flags.selection) return "You're ready! Survive Final Selection on Wisteria Mountain.";
  if (g.rank < CHAPTER1_RANK_CAP) return `Patrol the forest and slay demons to reach ${RANKS[g.rank + 1].name}.`;
  if (!g.flags.boss) return 'A powerful demon hides in the Old Shrine. Defeat it!';
  return 'Chapter 1 complete! The Small Town opens in the next chapter.';
}

/* ---------------- intro ---------------- */
export async function introScreen(root) {
  const g = app.game;
  root.innerHTML = `<div class="scene scene-forest night"><div class="backdrop">${renderScene('cabin', 1)}</div><div class="scene-avatar">${renderAvatar(g.look, { name: g.name })}</div></div>`;
  await dialog([
    { who: 'Story', text: `Deep in a snowy mountain forest, ${g.name} lives in a little cabin with their family.` },
    { who: 'Story', text: 'One night, a demon creeps out of the trees. Before it can reach the village, a demon slayer in a swirling haori cuts it down in a flash of light.' },
    { who: 'Demon Slayer', text: '"Demons hide from the sun and hunt at night. If you want to protect the people you love… train. Find the mentor on the mountain."' },
    { who: g.name, text: "I'll do it. I'll become a demon slayer!", portrait: meFace() },
    { who: 'Story', text: 'Your journey begins with very, very basic training. Every demon you defeat makes you stronger. Maybe one day… you could become a Hashira.' },
  ]);
  g.flags.intro = true;
  save();
  go('map');
}

/* ---------------- map ---------------- */
export function mapScreen(root) {
  const g = app.game;
  const canSelect = g.breathing && g.trainings >= TRAINING_FOR_SELECTION && !g.flags.selection;
  const locs = [
    { id: 'home', icon: '🏠', name: 'Home Cabin', desc: 'Rest, change your look and visit the swordsmith.', state: 'open' },
    { id: 'mentor', icon: '⛰️', name: "Mentor's Mountain", desc: g.rank === 0 ? `Training: ${g.trainings} / ${TRAINING_FOR_SELECTION}` : `Training left this rank: ${trainingLeft(g)}`, state: 'open' },
    { id: 'selection', icon: '🌸', name: 'Wisteria Mountain', desc: g.flags.selection ? 'Final Selection passed ✓' : canSelect ? 'Final Selection is ready!' : 'Final Selection: finish training first',
      state: g.flags.selection ? 'done' : canSelect ? 'glow' : 'locked' },
    { id: 'patrol', icon: '🌲', name: 'Forest Patrol', desc: g.flags.selection ? 'Your crow has missions for you.' : 'Unlocks after Final Selection', state: g.flags.selection ? 'open' : 'locked' },
    { id: 'boss', icon: '⛩️', name: 'Old Shrine', desc: g.flags.boss ? 'The shrine is safe again ✓' : g.rank >= CHAPTER1_RANK_CAP ? 'A powerful demon awaits…' : `Reach ${RANKS[CHAPTER1_RANK_CAP].name} rank to enter`,
      state: g.flags.boss ? 'done' : g.rank >= CHAPTER1_RANK_CAP ? 'glow' : 'locked' },
    { id: 'lab', icon: '🧪', name: 'Demon Lab', desc: 'Design your own demons and spar with them.', state: 'open' },
  ];
  root.innerHTML = `${hud(g)}
    <div class="regions" role="tablist">${REGIONS.map((r) => `<button class="region ${r.open ? 'on' : 'locked'}" data-region="${r.id}" ${r.open ? 'aria-selected="true"' : ''}>${r.open ? '' : '🔒 '}${r.name}</button>`).join('')}</div>
    <div class="crow-msg"><span class="crow">${crowFace()}</span><p><b>${esc(g.crow)}:</b> "Caw! ${objective(g)}"</p></div>
    <div class="locs">${locs.map((l) => `
      <button class="loc loc-${l.id} ${l.state}" data-loc="${l.id}" ${l.state === 'locked' ? 'aria-disabled="true"' : ''}>
        <span class="loc-icon">${l.icon}</span><span class="loc-text"><b>${l.name}</b><small>${l.desc}</small></span>${l.state === 'locked' ? '<span class="lock">🔒</span>' : ''}
      </button>`).join('')}</div>`;

  root.addEventListener('click', async (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.go) return go(t.dataset.go);
    if (t.dataset.region) {
      const r = REGIONS.find((x) => x.id === t.dataset.region);
      if (!r.open) modal({ title: `🔒 ${r.name}`, body: `<p>${r.desc}</p><p class="hint">This area opens in a future chapter. Finish the forest first!</p>` });
      return;
    }
    const loc = locs.find((l) => l.id === t.dataset.loc);
    if (!loc) return;
    if (loc.state === 'locked') return toast(loc.desc);
    if (loc.id === 'selection') return startSelection();
    if (loc.id === 'boss') return startBoss();
    go(loc.id);
  });
}

/* ---------------- home ---------------- */
export function homeScreen(root) {
  const g = app.game;
  root.innerHTML = `${hud(g)}
    <div class="scene scene-home"><div class="backdrop">${renderScene('interior', 2)}</div><div class="scene-avatar">${renderAvatar(g.look, { name: g.name, weapon: g.weapon, breathing: g.breathing, trainee: g.rank === 0 })}</div></div>
    <div class="menu-list">
      <button class="btn big" data-act="rest">🛌 Rest <small>Restore health and refill wisteria tea</small></button>
      <button class="btn big" data-act="wardrobe">👘 Wardrobe <small>Change your face, hair and outfit</small></button>
      <button class="btn big" data-act="smith">🔨 Swordsmith <small>Customise your ${g.rank === 0 ? 'future ' : ''}weapon</small></button>
      <button class="btn big" data-act="profile">📜 Slayer profile <small>Stats, rank, forms and demons slain</small></button>
      <button class="btn" data-act="map">‹ Back to the forest</button>
    </div>`;
  root.addEventListener('click', async (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.go) return go(t.dataset.go);
    switch (t.dataset.act) {
      case 'rest':
        fullHeal(g); save();
        await dialog([{ who: 'Family', text: `Welcome home, ${g.name}! Sit down and have some warm soup. You've been working so hard.` },
          { who: 'Story', text: 'You sleep soundly. Health restored and wisteria tea refilled!' }]);
        go('home');
        break;
      case 'wardrobe': go('creator', { mode: 'edit', back: 'home' }); break;
      case 'smith': go('creator', { mode: 'edit', tab: 'weapon', back: 'home' }); break;
      case 'profile': go('profile'); break;
      case 'map': go('map'); break;
    }
  });
}

/* ---------------- mentor ---------------- */
export async function mentorScreen(root) {
  const g = app.game;
  const canChoose = g.trainings >= TRAINING_TO_CHOOSE_BREATHING && !g.flags.selection;
  const left = trainingLeft(g);
  root.innerHTML = `${hud(g)}
    <div class="scene scene-mountain"><div class="backdrop">${renderScene('path', 3)}</div><div class="scene-avatar small">${renderAvatar(MENTOR_LOOK)}</div><div class="scene-avatar small">${renderAvatar(g.look, { weapon: g.weapon, breathing: g.breathing, trainee: g.rank === 0 })}</div></div>
    <div class="menu-list">
      <p class="hint center">${g.rank === 0 ? `Training sessions: <b>${g.trainings}</b> (Final Selection needs ${TRAINING_FOR_SELECTION})` : `Training that still makes you stronger this rank: <b>${left}</b>`}</p>
      <button class="btn big" data-train="breath">🫁 Breath Focus <small>Timing game · grows Health &amp; Breath</small></button>
      <button class="btn big" data-train="slash">🍃 Slash Practice <small>Tapping game · grows Strength &amp; Speed</small></button>
      ${canChoose ? `<button class="btn big glow" data-act="choose">🌀 ${g.breathing ? 'Change' : 'Choose'} breathing style <small>${g.breathing ? `Current: ${BREATHING[g.breathing].name} Breathing` : 'Your mentor senses your talent!'}</small></button>` : ''}
      ${g.breathing && g.flags.selection ? `<p class="hint center">Your style: <b style="color:${BREATHING[g.breathing].color}">${BREATHING[g.breathing].name} Breathing</b></p>` : ''}
      <button class="btn" data-act="map">‹ Back to the forest</button>
    </div>`;
  root.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.go) return go(t.dataset.go);
    if (t.dataset.train) return go('train', { kind: t.dataset.train });
    if (t.dataset.act === 'choose') return go('breathing');
    if (t.dataset.act === 'map') go('map');
  });
  if (g.trainings === 0 && !g.flags.metMentor) {
    await dialog([
      { who: 'Mentor', text: "So, you want to be a demon slayer? Hmph. You can barely hold a sword.", portrait: mentorFace() },
      { who: 'Mentor', text: "We'll start with the basics: breathing and swinging. Train with me, and I'll see what you're made of.", portrait: mentorFace() },
    ]);
    g.flags.metMentor = true; save();
  } else if (canChoose && !g.breathing) {
    await dialog([{ who: 'Mentor', text: "You're getting stronger. It's time to choose your breathing style, the heart of every slayer's technique.", portrait: mentorFace() }]);
    go('breathing');
  }
}

export function breathingScreen(root) {
  const g = app.game;
  root.innerHTML = `<header class="topbar"><button class="icon-btn" data-act="back" aria-label="Back">‹</button><h1>Choose your breathing</h1><span></span></header>
    <p class="hint center pad">Each style has its own forms and powers. You can change it until you pass Final Selection.</p>
    <div class="breath-grid">${Object.entries(BREATHING).map(([id, b]) => `
      <button class="breath-card ${g.breathing === id ? 'on' : ''}" data-b="${id}" style="--c:${b.color}">
        <b>${b.name} Breathing</b><small>${b.desc}</small><em>1st Form: ${b.forms[0].name}</em></button>`).join('')}</div>`;
  root.addEventListener('click', async (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.act === 'back') return go('mentor');
    const id = t.dataset.b;
    if (!id) return;
    const b = BREATHING[id];
    const ok = await modal({ title: `${b.name} Breathing`, body: `<p>${b.desc}</p><p><b>Forms you can learn:</b></p><ol class="form-ol">${b.forms.map((f) => `<li>${f.name}</li>`).join('')}</ol>`,
      actions: [{ label: 'Not yet', value: false }, { label: `Learn ${b.name} Breathing`, value: true, primary: true }] });
    if (!ok) return;
    g.breathing = id; save();
    await dialog([{ who: 'Mentor', text: `${b.name} Breathing… a good fit for you. Breathe deep, fill every part of your body, and the First Form will come.`, portrait: mentorFace() }]);
    go('mentor');
  });
}

/* ---------------- Final Selection ---------------- */
async function startSelection() {
  const g = app.game;
  const ok = await modal({ title: '🌸 Final Selection', body: '<p>Survive the demons trapped on Wisteria Mountain. You must defeat <b>3 demons in a row</b>. Your health carries over, but you catch your breath a little between fights.</p><p class="hint">You fight with your wooden practice sword and your First Form.</p>',
    actions: [{ label: 'Not yet', value: false }, { label: 'Begin!', value: true, primary: true }] });
  if (!ok) return;
  fullHeal(g);
  const queue = [0, 1, 2].map((i) => generateDemon({ level: i === 2 ? 1 : 0.5, seed: Date.now() + i * 7919 }));
  go('battle', {
    queue, mode: 'selection', scene: 'wisteria', healBetween: 0.3, canFlee: false,
    intro: 'Wisteria blooms all around… but deeper in the mountain, demons wait.',
    onWin: async () => {
      g.flags.selection = true;
      rankUp(g);
      g.xp = 0;
      fullHeal(g);
      save();
      await dialog([
        { who: 'Story', text: 'The sun rises over Wisteria Mountain. You survived Final Selection!' },
        { who: g.crow, text: `Caw! I am ${g.crow}, your Kasugai crow! I will bring you your missions, ${g.name}! Caw!`, portrait: crowFace() },
        { who: 'Swordsmith', text: 'Hmph! Here is your Nichirin blade, forged exactly the way you asked. Draw it, and let us see its colour!' },
      ]);
      await modal({ title: 'Your Nichirin weapon!', body: `<div class="manga-reveal">${mangaWeaponArt(g.weapon, g.breathing, g.name)}</div><p class="center">The blade glows with the colour of <b style="color:${BREATHING[g.breathing].color}">${BREATHING[g.breathing].name} Breathing</b>.</p><p class="center">You are now rank <b>Mizunoto</b>, the very first rank of the Demon Slayer Corps.</p>`,
        actions: [{ label: 'Go on patrol!', value: 1, primary: true }] });
      go('map');
    },
    onLose: () => go('map'),
  });
}

/* ---------------- patrol ---------------- */
const PLACES = [['by the frozen river', 'river'], ['in the bamboo grove', 'bamboo'], ['at the abandoned mill', 'mill'], ['on the mountain path', 'path'],
  ['near the old well', 'well'], ['in the misty valley', 'valley'], ['at the charcoal hut', 'hut'], ['beneath the giant cedar', 'cedar'], ['deep in the forest', 'forest'],
  ['at the forest temple', 'temple'], ['by the charcoal kiln', 'cabin'], ['on the road into town', 'street']];

function ensureMissions(g) {
  if (g.missions?.length === 3 && g.missions[0].rank === g.rank) return;
  const base = Math.max(1, g.rank);
  const places = [...PLACES].sort(() => Math.random() - 0.5);
  g.missions = [0, 1, 2].map((i) => ({
    rank: g.rank, place: places[i][0], scene: places[i][1],
    demon: generateDemon({ level: base + (i === 2 ? 1 : i === 0 ? -0.3 : 0), seed: Math.floor(Math.random() * 1e9) }),
  }));
  save();
}

export function patrolScreen(root) {
  const g = app.game;
  ensureMissions(g);
  const stars = (lvl, base) => '★'.repeat(lvl > base ? 3 : lvl < base ? 1 : 2) + '☆'.repeat(lvl > base ? 0 : lvl < base ? 2 : 1);
  const base = Math.max(1, g.rank);
  root.innerHTML = `${hud(g)}
    <div class="crow-msg"><span class="crow">${crowFace()}</span><p><b>${esc(g.crow)}:</b> "Caw! Demons spotted in the forest! Choose your mission!"</p></div>
    ${g.hp < g.stats.hp * 0.4 ? `<p class="warn">Your health is low (${g.hp}/${g.stats.hp}). Rest at home or bring wisteria tea (you have ${g.tea}).</p>` : ''}
    <div class="missions">${g.missions.map((m, i) => `
      <div class="mission">
        <div class="mission-face">${renderDemon(m.demon, { headOnly: true })}</div>
        <div class="mission-info"><b>${esc(m.demon.name)}</b><small>${esc(m.demon.title)} · ${m.place}</small>
          <span class="art-tag" style="--c:${ARTS[m.demon.art].color}">${ARTS[m.demon.art].name}</span>
          <span class="diff" aria-label="Difficulty">${stars(m.demon.level, base)}</span> <small>+${m.demon.xp} XP</small></div>
        <button class="btn primary" data-m="${i}">Hunt</button>
      </div>`).join('')}</div>
    <div class="menu-list"><button class="btn" data-act="reroll">🔄 Ask for different missions</button><button class="btn" data-act="map">‹ Back to the forest</button></div>`;
  root.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.go) return go(t.dataset.go);
    if (t.dataset.act === 'map') return go('map');
    if (t.dataset.act === 'reroll') { g.missions = null; ensureMissions(g); return go('patrol'); }
    if (t.dataset.m !== undefined) {
      const m = g.missions[+t.dataset.m];
      go('battle', {
        queue: [m.demon], mode: 'patrol', scene: m.scene || 'forest', canFlee: true, intro: `Night falls ${m.place}… ${esc(m.demon.name)} appears!`,
        onWin: () => { g.missions = null; save(); go('patrol'); },
        onLose: () => go('home'), onFlee: () => go('patrol'),
      });
    }
  });
}

/* ---------------- boss ---------------- */
async function startBoss() {
  const g = app.game;
  const boss = generateDemon({ level: 6, boss: true, seed: g.createdAt % 1e9 });
  const ok = await modal({ title: '⛩️ The Old Shrine', body: `<div class="boss-prev">${renderDemon(boss)}</div><p><b>${esc(boss.name)}</b>, ${esc(boss.title)}, has been hiding here, guarding a secret.</p><p class="hint">Bosses use their Blood Demon Art every 2nd turn. Bring wisteria tea! (You have ${g.tea}.)</p>`,
    actions: [{ label: 'Prepare more', value: false }, { label: 'Enter the shrine', value: true, primary: true }] });
  if (!ok) return;
  go('battle', {
    queue: [boss], mode: 'boss', scene: 'shrine', canFlee: true, intro: `The shrine doors creak open… ${esc(boss.name)} is waiting!`,
    onWin: async () => {
      g.flags.boss = true; g.flags.chapter1 = true; save();
      await dialog([
        { who: g.crow, text: 'CAW! CAW! You defeated a Lower Moon! The whole Corps will hear about this!', portrait: crowFace() },
        { who: 'Story', text: 'As the demon fades, you find an old map in the shrine. It points down the mountain, to a small town where people have been going missing at night…' },
      ]);
      await modal({ title: '🎉 Chapter 1 complete!', body: '<p>You started with basic training and became a true demon slayer of the forest.</p><p class="hint">The <b>Small Town</b>, your family &amp; friends, side heroes and higher ranks all the way to <b>Hashira</b> come in the next chapters. Your progress is saved on this device.</p>' });
      go('map');
    },
    onLose: () => go('home'), onFlee: () => go('map'),
  });
}

/* ---------------- profile ---------------- */
export function profileScreen(root) {
  const g = app.game;
  const w = activeWeapon(g), designed = weaponOf(g);
  const fl = forms(g);
  const all = g.breathing ? BREATHING[g.breathing].forms : [];
  root.innerHTML = `<header class="topbar"><button class="icon-btn" data-act="back" aria-label="Back">‹</button><h1>Slayer profile</h1><span></span></header>
    <div class="profile">
      <div class="profile-hero"><div class="scene-avatar">${renderAvatar(g.look, { name: g.name, weapon: g.weapon, breathing: g.breathing, trainee: g.rank === 0 })}</div>
        <div><h2>${esc(g.name)}</h2><p class="rank-line"><span class="rank-badge big">${RANKS[g.rank].kanji}</span> ${RANKS[g.rank].name}</p>
          <p>${g.breathing ? `<b style="color:${BREATHING[g.breathing].color}">${BREATHING[g.breathing].name} Breathing</b>` : 'No breathing style yet'}</p>
          <p>Weapon: <b>${w.name}</b>${g.rank === 0 ? ` <small>(${designed.name} after Final Selection)</small>` : ''}</p>
          <p>Crow: ${esc(g.crow)} · Demons slain: <b>${g.slain}</b></p><p>Difficulty: <b>${(DIFFICULTY[g.difficulty] || DIFFICULTY.medium).icon} ${(DIFFICULTY[g.difficulty] || DIFFICULTY.medium).name}</b> <small>(change in the Wardrobe)</small></p></div></div>
      <section class="card"><h3>Stats</h3><div class="stats">
        ${[['Health', g.stats.hp], ['Strength', g.stats.str], ['Speed', g.stats.spd], ['Breath', g.stats.bp], ['Defence', g.stats.def]].map(([k, v]) => `<div><small>${k}</small><b>${v}</b></div>`).join('')}</div></section>
      <section class="card"><h3>Breathing forms</h3>${all.length ? `<ol class="form-ol">${all.map((f, i) => `<li class="${i < fl.length ? '' : 'locked'}">${i < fl.length ? f.name : '??? (unlocks at a higher rank)'}</li>`).join('')}</ol>` : '<p class="hint">Train with your mentor to choose a breathing style.</p>'}</section>
      <section class="card"><h3>Road to Hashira</h3><ol class="ranks">${RANKS.map((r, i) => `<li class="${i === g.rank ? 'now' : i < g.rank ? 'past' : ''}"><span>${r.kanji}</span>${r.name}${i > CHAPTER1_RANK_CAP ? ' <small>🔒</small>' : ''}</li>`).join('')}</ol></section>
      <section class="card"><h3>Demons defeated</h3>${g.bestiary.length ? `<div class="bestiary">${g.bestiary.slice(-24).reverse().map((d) => `<div class="beast">${renderDemon(d, { headOnly: true })}<small>${esc(d.name)}</small></div>`).join('')}</div>` : '<p class="hint">None yet. Every demon you slay appears here.</p>'}</section>
      <section class="card soon"><h3>Coming in future chapters</h3><p>👪 Choose your family and siblings · 🤝 Friends and a special someone · 🦸 Side heroes who fight beside you · 🏘️ Town, City and Metropolis · 🔥 Hashira rank</p></section>
    </div>`;
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-act="back"]')) go(app.previous && app.previous !== 'profile' ? app.previous : 'map');
  });
}
