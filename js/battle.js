// Turn-based battles. Player acts, then the demon. Statuses tick at the end of each round.
import { BREATHING, DIFFICULTY } from './data.js';
import { renderAvatar } from './avatar.js';
import { renderDemon, ARTS, rankInfo } from './demons.js';
import { renderScene, SCENES } from './scenes.js';
import { app, go, save, esc, modal, bar } from './ui.js';
import { activeWeapon, forms, addXp } from './game.js';

const STATUS = {
  guard: ['🛡️', 'Guard'], evade: ['💨', 'Evade'], focus: ['✨', 'Focus'], bind: ['🕸️', 'Tied up'], confuse: ['😵', 'Dizzy'],
  chill: ['❄️', 'Chilled'], poison: ['🟣', 'Poisoned'], burn: ['🔥', 'Burning'], stun: ['💫', 'Stunned'], hide: ['👻', 'Hidden'], armor: ['🪨', 'Iron skin'],
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const rnd = (a, b) => a + Math.random() * (b - a);

export function battleScreen(root, params) {
  const g = app.game;
  const W = activeWeapon(g);
  const DF = DIFFICULTY[g.difficulty] || DIFFICULTY.medium;
  const artEvery = (d) => (d.boss && DF.artEvery > 3 ? DF.artEvery - 1 : DF.artEvery);
  const color = g.breathing ? BREATHING[g.breathing].color : '#f2efe6';
  const queue = [...params.queue];
  const P = { hp: Math.max(1, g.hp), max: g.stats.hp, bp: g.stats.bp, maxBp: g.stats.bp, str: g.stats.str, spd: g.stats.spd, def: g.stats.def, st: {} };
  let E, busy = false, menu = 'main', slain = [];

  function spawn(d) {
    const hp = Math.round(d.stats.hp * DF.hp);
    E = { ...d, hp, max: hp, atk: d.stats.atk * DF.atk, def: d.stats.def, regen: d.stats.regen, xp: Math.round(d.xp * DF.xp), st: {}, turn: 0 };
  }
  spawn(queue.shift());

  root.innerHTML = `
    <div class="battle">
      <div class="arena">
        <div class="backdrop">${renderScene(params.scene || 'forest', Math.floor(Math.random() * 1000))}</div>
        <div class="enemy-info"></div>
        <div class="battle-stage">
          <div class="player-sprite">${renderAvatar(g.look, { name: g.name, weapon: g.weapon, breathing: g.breathing, trainee: g.rank === 0, pose: 'action' })}</div>
          <div class="enemy-sprite"></div>
        </div>
        <div class="scene-name">${SCENES[params.scene || 'forest'].name} · v${self.APP_VERSION || 'dev'}</div>
        <div class="fx-layer" aria-hidden="true"></div>
      </div>
      <div class="log" aria-live="polite"></div>
      <div class="player-row"><div class="p-bars"></div></div>
      <div class="actions"></div>
    </div>`;
  const $ = (s) => root.querySelector(s);
  const arena = $('.arena'), fx = $('.fx-layer'), sprite = $('.enemy-sprite'), logEl = $('.log');

  const statusIcons = (st) => Object.keys(st).map((k) => `<span class="st" title="${STATUS[k][1]}">${STATUS[k][0]}<small>${STATUS[k][1]}</small></span>`).join('');

  function drawEnemy() {
    const art = ARTS[E.art];
    arena.style.setProperty('--art', art.color);
    $('.enemy-info').innerHTML = `<div class="e-name">${E.boss ? `<span class="tag boss">${rankInfo(E.rank)?.label || 'BOSS'}</span>` : ''}${esc(E.name)} <small>${esc(E.title)}</small></div>
      ${bar(E.hp, E.max, 'hp demon')}<div class="sts">${statusIcons(E.st)}</div>
      <button class="art-chip" data-act="art">${art.fx === 'none' ? 'No Blood Demon Art' : `Blood Demon Art: ${art.name}`} ⓘ</button>`;
    sprite.innerHTML = renderDemon(E);
  }
  function drawBars() {
    $('.p-bars').innerHTML = `<div class="p-name">${esc(g.name)}<span class="sts">${statusIcons(P.st)}</span></div>
      <div class="p-two"><div><label>Health</label>${bar(P.hp, P.max, 'hp')}</div><div><label>Breath</label>${bar(P.bp, P.maxBp, 'bp')}</div></div>`;
    $('.enemy-info .bar').outerHTML = bar(E.hp, E.max, 'hp demon');
    $('.enemy-info .sts').innerHTML = statusIcons(E.st);
  }
  function drawActions() {
    const a = $('.actions');
    if (menu === 'forms') {
      const fl = forms(g);
      a.innerHTML = `<div class="forms-list">${fl.map((f, i) => `
        <button class="btn form-btn" data-form="${i}" ${P.bp < f.cost || busy ? 'disabled' : ''} style="--c:${color}">
          <b>${['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'][i]} Form: ${f.name}</b>
          <small>${f.hits > 1 ? `${f.hits} hits · ` : ''}${f.fx ? fxText(f.fx) + ' · ' : ''}${f.cost} breath</small></button>`).join('')}</div>
        <button class="btn" data-act="back">‹ Back</button>`;
      return;
    }
    const noForms = !forms(g).length;
    a.innerHTML = `
      <button class="btn act strike" data-act="strike" ${busy ? 'disabled' : ''}>⚔️<span>Strike</span></button>
      <button class="btn act" data-act="forms" ${busy || noForms ? 'disabled' : ''} style="--c:${color}">🌀<span>${noForms ? 'No forms yet' : 'Breathing forms'}</span></button>
      <button class="btn act" data-act="focus" ${busy ? 'disabled' : ''}>🫁<span>Focus breath</span></button>
      <button class="btn act" data-act="tea" ${busy || g.tea < 1 || P.hp >= P.max ? 'disabled' : ''}>🍵<span>Wisteria tea ×${g.tea}</span></button>
      ${params.canFlee ? `<button class="btn act" data-act="flee" ${busy ? 'disabled' : ''}>🏃<span>Run away</span></button>` : ''}`;
  }
  const fxText = (k) => ({ guard: 'Guard', burn: 'Burn', stun: 'Stun', poison: 'Poison', evade: 'Evade', pierce: 'Ignores armour', crit: 'Critical', focus: 'Focus', heal: 'Heal' }[k] || k);

  function log(msg) {
    const p = document.createElement('p');
    p.innerHTML = msg;
    logEl.appendChild(p);
    while (logEl.children.length > 2) logEl.firstChild.remove();
  }
  function floater(text, cls, target = 'enemy') {
    const f = document.createElement('div');
    f.className = `floater ${cls}`;
    f.textContent = text;
    f.style.left = `${target === 'enemy' ? rnd(30, 62) : rnd(10, 30)}%`;
    f.style.top = `${target === 'enemy' ? rnd(25, 55) : 80}%`;
    fx.appendChild(f);
    setTimeout(() => f.remove(), 1100);
  }
  function slash(c) {
    const s = document.createElement('div');
    s.className = 'slash';
    s.style.setProperty('--c', c);
    s.style.setProperty('--r', `${rnd(-60, 60)}deg`);
    fx.appendChild(s);
    sprite.classList.remove('hit'); void sprite.offsetWidth; sprite.classList.add('hit');
    setTimeout(() => s.remove(), 500);
  }
  function hurt() {
    root.querySelector('.battle').classList.remove('hurt'); void root.offsetWidth;
    root.querySelector('.battle').classList.add('hurt');
  }
  async function banner(text, c) {
    const b = document.createElement('div');
    b.className = 'art-banner';
    b.style.setProperty('--c', c);
    b.textContent = text;
    arena.appendChild(b);
    await sleep(900);
    b.remove();
  }

  /* ---------- player ---------- */
  async function attack(mults, { fx: effect = null, chance = 1, c = color } = {}) {
    for (const mult of mults) {
      if (E.hp <= 0) break;
      let hitChance = 0.95;
      if (E.st.hide) hitChance = 0.45;
      if (P.st.confuse) hitChance -= 0.35;
      if (W.trait === 'sure') hitChance = Math.max(hitChance, 0.95);
      if (Math.random() > hitChance) { floater('Miss', 'miss'); log('Your attack <b>missed</b>!'); await sleep(300); continue; }
      const critChance = W.crit + P.spd * 0.004 + (effect === 'crit' ? 0.3 : 0) + (P.st.focus ? 0.25 : 0);
      const base = P.str * 1.6 * W.pow * mult * rnd(0.9, 1.1) * (P.st.chill ? 0.7 : 1);
      const def = effect === 'pierce' ? 0 : E.def * 0.6 * (E.st.armor ? 2.5 : 1);
      let dmg = Math.max(1, Math.round(base - def));
      const crit = Math.random() < critChance;
      if (crit) dmg = Math.round(dmg * 1.6);
      E.hp -= dmg;
      slash(c);
      floater(crit ? `${dmg}!` : dmg, crit ? 'crit' : 'dmg');
      drawBars();
      await sleep(mults.length > 3 ? 170 : 300);
    }
    if (E.hp > 0 && effect && Math.random() < chance) {
      switch (effect) {
        case 'burn': E.st.burn = 3; log(`${esc(E.name)} is <b>burning</b>! It can't heal.`); break;
        case 'poison': E.st.poison = 3; log(`${esc(E.name)} is <b>poisoned</b> by wisteria!`); break;
        case 'stun': E.st.stun = 1; log(`${esc(E.name)} is <b>stunned</b>!`); break;
        case 'guard': P.st.guard = 2; log('You take a <b>guard</b> stance.'); break;
        case 'evade': P.st.evade = 2; log('You move like the wind. <b>Evade</b> up!'); break;
        case 'focus': P.st.focus = 3; P.bp = Math.min(P.maxBp, P.bp + 10); log('Your eyes sharpen. <b>Focus</b>!'); break;
      }
    }
  }

  async function playerAction(act, formIndex) {
    if (busy) return;
    busy = true; menu = 'main'; drawActions();
    switch (act) {
      case 'strike': {
        log(`You strike with your ${W.name.toLowerCase()}!`);
        await attack(W.extra ? [1, W.extra] : [1], { c: g.rank === 0 ? '#f2efe6' : color });
        P.bp = Math.min(P.maxBp, P.bp + 8);
        if (E.hp > 0 && W.trait === 'poison' && Math.random() < 0.4) { E.st.poison = 2; log('Your needle leaves <b>wisteria poison</b>.'); }
        if (E.hp > 0 && W.trait === 'stun' && Math.random() < 0.15) { E.st.stun = 1; log(`A heavy blow! ${esc(E.name)} is <b>stunned</b>.`); }
        break;
      }
      case 'form': {
        const f = forms(g)[formIndex];
        const ordinal = ['First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth'][formIndex];
        P.bp -= f.cost;
        drawBars();
        await banner(`${BREATHING[g.breathing].name} Breathing, ${ordinal} Form: ${f.name}!`, color);
        if (f.fx === 'guard' || f.fx === 'evade' || f.fx === 'focus') {
          await attack(Array(f.hits).fill(f.mult));
          if (E.hp > 0) await attack([], { fx: f.fx, chance: f.chance });
        } else {
          await attack(Array(f.hits).fill(f.mult), { fx: f.fx, chance: f.chance });
        }
        break;
      }
      case 'focus':
        P.bp = Math.min(P.maxBp, P.bp + Math.round(P.maxBp * 0.5));
        P.st.focus = 2;
        log(g.rank === 0 ? 'You take slow, deep breaths… <b>Focus</b> up!' : 'Total Concentration Breathing! Breath restored, <b>Focus</b> up!');
        floater('+Breath', 'heal', 'player');
        break;
      case 'tea': {
        const heal = Math.round(P.max * 0.45);
        P.hp = Math.min(P.max, P.hp + heal);
        g.tea--;
        delete P.st.poison; delete P.st.burn;
        log(`You drink wisteria tea and recover <b>${heal}</b> health.`);
        floater(`+${heal}`, 'heal', 'player');
        break;
      }
      case 'flee':
        if (Math.random() < 0.75) {
          log('You got away safely!');
          g.hp = P.hp; save();
          await sleep(700);
          (params.onFlee || (() => go('map')))();
          return;
        }
        log("You couldn't get away!");
        break;
    }
    drawBars();
    if (E.hp <= 0) return victory();
    await sleep(450);
    await enemyTurn();
  }

  /* ---------- demon ---------- */
  async function claw(mult = 1, label = 'slashes at you') {
    const hit = Math.random() < (P.st.evade ? 0.45 : 0.92);
    if (!hit) { log(`${esc(E.name)} ${label}, but you <b>dodge</b>!`); floater('Dodge', 'miss', 'player'); return false; }
    const dmg = Math.max(1, Math.round(E.atk * mult * rnd(0.85, 1.15) - P.def * (P.st.guard ? 2.2 : 1)));
    P.hp -= dmg;
    hurt();
    floater(`-${dmg}`, 'pdmg', 'player');
    log(`${esc(E.name)} ${label} for <b>${dmg}</b>!`);
    drawBars();
    return true;
  }

  async function enemyTurn() {
    // Damage over time on the demon.
    for (const [k, pct] of [['burn', 0.06], ['poison', 0.05]]) {
      if (E.st[k] && E.hp > 0) {
        const d = Math.max(1, Math.round(E.max * pct + (k === 'poison' ? P.str * 0.3 : 0)));
        E.hp -= d; floater(d, k); log(`${esc(E.name)} takes <b>${d}</b> ${k} damage.`);
        drawBars(); await sleep(350);
      }
    }
    if (E.hp <= 0) return victory();
    if (!E.st.burn && E.hp < E.max) {
      const h = Math.round(E.max * E.regen);
      E.hp = Math.min(E.max, E.hp + h);
      floater(`+${h}`, 'regen');
      drawBars();
    }
    if (E.st.stun) {
      log(`${esc(E.name)} is stunned and can't move!`);
      delete E.st.stun;
    } else {
      E.turn++;
      const useArt = ARTS[E.art]?.fx !== 'none' && E.turn % artEvery(E) === 0;
      if (useArt) await demonArt(); else await claw(1, pickVerb());
    }
    await sleep(350);
    if (P.hp <= 0) return defeat();
    await startPlayerTurn();
  }
  const pickVerb = () => ['slashes at you', 'lunges at you', 'swipes its claws', 'bites at you'][Math.floor(Math.random() * 4)];

  async function demonArt() {
    const art = ARTS[E.art];
    await banner(`Blood Demon Art: ${art.name}!`, art.color);
    switch (art.fx) {
      case 'heavy': await claw(art.mult, 'leaps out of the shadows'); break;
      case 'multi': for (let i = 0; i < art.hits; i++) { await claw(art.mult, 'grabs at you'); await sleep(180); } break;
      case 'bind': if (await claw(art.mult, 'whips threads')) { P.st.bind = 1; log('You are <b>tied up</b>! You lose your next turn.'); } break;
      case 'confuse': await claw(art.mult, 'spins the room'); P.st.confuse = 2; log('You feel <b>dizzy</b>. Attacks may miss.'); break;
      case 'hide': if (art.mult) await claw(art.mult, 'strikes'); E.st.hide = 2; log(`${esc(E.name)} is <b>hidden</b>! Hard to hit.`); break;
      case 'poison': if (await claw(art.mult, 'throws stinging petals')) { P.st.poison = 3; log('You are <b>poisoned</b>!'); } break;
      case 'chill': await claw(art.mult, 'breathes freezing fog'); P.st.chill = 2; log('You are <b>chilled</b>. Your attacks are weaker.'); break;
      case 'armor': E.st.armor = 3; log(`${esc(E.name)}'s skin turns to <b>iron</b>!`); break;
      case 'heal': { const h = Math.round(E.max * 0.25); E.hp = Math.min(E.max, E.hp + h); floater(`+${h}`, 'regen'); log(`${esc(E.name)} regrows and heals <b>${h}</b>!`); break; }
      case 'burn': if (await claw(art.mult, 'sends ember moths')) { P.st.burn = 2; log('You are <b>burning</b>!'); } break;
      case 'stun': if (await claw(art.mult, 'screams') && Math.random() < art.chance) { P.st.bind = 1; log('The scream <b>stuns</b> you!'); } break;
    }
    drawBars();
  }

  async function startPlayerTurn() {
    // Statuses wear off at the end of the round.
    for (const st of [P.st, E.st]) {
      for (const k of Object.keys(st)) {
        if (k === 'bind' || k === 'stun') continue;
        if (--st[k] <= 0) delete st[k];
      }
    }
    for (const [k, pct] of [['poison', 0.05], ['burn', 0.06]]) {
      if (P.st[k]) {
        const d = Math.max(1, Math.round(P.max * pct));
        P.hp -= d; floater(`-${d}`, k, 'player'); log(`You take <b>${d}</b> ${k} damage.`);
        drawBars(); await sleep(350);
      }
    }
    if (P.hp <= 0) return defeat();
    if (P.st.bind) {
      delete P.st.bind;
      log("You can't move this turn!");
      drawBars();
      await sleep(700);
      return enemyTurn();
    }
    busy = false;
    drawBars();
    drawActions();
  }

  /* ---------- endings ---------- */
  async function victory() {
    E.hp = 0;
    drawBars();
    log(`${esc(E.name)} crumbles to ash and drifts away…`);
    const svg = sprite.querySelector('svg');
    svg?.classList.add('dissolve');
    for (let i = 0; i < 24; i++) {
      const a = document.createElement('i');
      a.className = 'ash';
      a.style.left = `${rnd(30, 70)}%`; a.style.top = `${rnd(20, 80)}%`;
      a.style.setProperty('--dx', `${rnd(-60, 60)}px`); a.style.animationDelay = `${rnd(0, 0.6)}s`;
      fx.appendChild(a);
    }
    slain.push(E);
    await sleep(1600);
    if (queue.length) {
      const heal = Math.round(P.max * (params.healBetween || 0));
      P.hp = Math.min(P.max, P.hp + heal);
      P.st = {};
      spawn(queue.shift());
      fx.innerHTML = '';
      drawEnemy(); drawBars();
      log(`Another demon appears! ${heal ? `You catch your breath (+${heal}).` : ''}`);
      busy = false; drawActions();
      return;
    }
    g.hp = Math.max(1, P.hp);
    g.slain += slain.length;
    for (const d of slain) if (!g.bestiary.some((b) => b.id === d.id)) g.bestiary.push({ id: d.id, name: d.name, title: d.title, art: d.art, look: d.look, boss: d.boss });
    const xp = slain.reduce((s, d) => s + d.xp, 0);
    const res = addXp(g, xp);
    save();
    const rankLine = res.ups.length ? `<p class="rank-up">⬆ Rank up! You are now <b>${res.ups.at(-1)}</b>.<br><small>Health, strength, speed and breath increased${res.ups.length ? '. A new breathing form may be unlocked!' : ''}</small></p>` : '';
    await modal({
      title: slain.length > 1 ? `${slain.length} demons slain!` : 'Demon slain!',
      body: `<p>${slain.map((d) => esc(d.name)).join(', ')} turned to ash.</p>${g.rank > 0 ? `<p class="xp">+${xp} XP</p>` : ''}${rankLine}
        ${res.capped ? '<p class="hint">You have mastered the forest. Defeat the boss at the Old Shrine!</p>' : ''}`,
      actions: [{ label: 'Continue', value: 1, primary: true }],
    });
    (params.onWin || (() => go('map')))(res);
  }

  async function defeat() {
    busy = true;
    g.hp = g.stats.hp;
    save();
    await modal({
      title: 'Knocked out!',
      body: `<p>${esc(E.name)} was too strong this time. Your crow ${esc(g.crow)} carried you safely home, and your family nursed you back to health.</p><p class="hint">Train more or try a different breathing form!</p>`,
      actions: [{ label: 'Head home', value: 1, primary: true }],
    });
    (params.onLose || (() => go('map')))();
  }

  root.addEventListener('click', async (e) => {
    const t = e.target.closest('button');
    if (!t || t.disabled) return;
    if (t.dataset.form !== undefined) return playerAction('form', +t.dataset.form);
    switch (t.dataset.act) {
      case 'forms': menu = 'forms'; drawActions(); break;
      case 'back': menu = 'main'; drawActions(); break;
      case 'art': {
        const art = ARTS[E.art];
        const ri = rankInfo(E.rank);
        const rankLine = ri ? `<p><b>${ri.label}</b> of the Twelve Kizuki: the rank is written in its eyes, and it is much stronger than a normal demon.</p>` : '';
        const when = art.fx === 'none' ? 'It only attacks with claws and fangs.' : `On ${DF.name}, this demon uses its Blood Demon Art every ${['', '', '2nd', '3rd', '4th'][artEvery(E)]} turn.`;
        modal({ title: art.name, body: `${rankLine}<p>${art.desc}</p><p class="hint">${when} Demons heal a little each turn unless they are burning, and only a Nichirin blade or sunlight can finish them.</p>` });
        break;
      }
      case 'strike': case 'focus': case 'tea': case 'flee': playerAction(t.dataset.act); break;
    }
  });

  drawEnemy();
  drawBars();
  drawActions();
  log(params.intro || `${esc(E.name)}, ${esc(E.title)}, blocks your path!`);
}
