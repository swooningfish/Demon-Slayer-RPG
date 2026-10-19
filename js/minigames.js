// Training mini-games on the mentor's mountain.
import { app, go, save, modal } from './ui.js';
import { trainingLeft, addXp } from './game.js';

function reward(g, gains) {
  const canGrow = trainingLeft(g) > 0;
  g.trainings++;
  const lines = [];
  if (canGrow) {
    g.rankTrainings = (g.rankTrainings || 0) + 1;
    for (const [k, v] of Object.entries(gains)) {
      if (!v) continue;
      g.stats[k] += v;
      lines.push(`+${v} ${{ hp: 'Health', str: 'Strength', spd: 'Speed', bp: 'Breath', def: 'Defence' }[k]}`);
    }
    if (gains.hp) g.hp = Math.min(g.stats.hp, g.hp + gains.hp);
    if (g.rank > 0) { addXp(g, 4); lines.push('+4 XP'); }
  }
  save();
  return { lines, canGrow };
}

async function finish(title, scoreText, gains) {
  const g = app.game;
  const { lines, canGrow } = reward(g, gains);
  await modal({
    title,
    body: `<p class="score">${scoreText}</p>${canGrow ? `<p class="gains">${lines.join('<br>')}</p>`
      : '<p class="hint">Your body needs real battles to grow stronger now. Go on patrol, then come back after your next rank!</p>'}`,
    actions: [{ label: 'Back to the mountain', value: 1, primary: true }],
  });
  go('mentor');
}

export function trainScreen(root, { kind }) {
  if (kind === 'breath') breathGame(root); else slashGame(root);
}

function breathGame(root) {
  const ROUNDS = 6;
  let round = 0, points = 0, t0 = performance.now(), speed = 1.6, raf, locked = false;
  root.innerHTML = `
    <header class="topbar"><button class="icon-btn" data-act="quit" aria-label="Quit">‹</button><h1>Breath Focus</h1><span class="round"></span></header>
    <div class="mini">
      <p class="hint center">Tap <b>Breathe</b> when the moving ring lines up with the gold ring.</p>
      <div class="breath-box"><div class="ring goal"></div><div class="ring mover"></div><div class="breath-msg" aria-live="polite"></div></div>
      <button class="btn primary big" data-act="tap">Breathe!</button>
    </div>`;
  const mover = root.querySelector('.mover'), msg = root.querySelector('.breath-msg'), rEl = root.querySelector('.round');
  let scale = 1;
  const tick = (now) => {
    scale = 1 + 0.7 * Math.sin(((now - t0) / 1000) * speed);
    mover.style.transform = `translate(-50%,-50%) scale(${scale})`;
    raf = requestAnimationFrame(tick);
  };
  const showRound = () => { rEl.textContent = `${Math.min(round + 1, ROUNDS)} / ${ROUNDS}`; };
  showRound();
  raf = requestAnimationFrame(tick);

  root.addEventListener('click', async (e) => {
    const act = e.target.closest('button')?.dataset.act;
    if (act === 'quit') { cancelAnimationFrame(raf); go('mentor'); return; }
    if (act !== 'tap' || locked) return;
    locked = true;
    const off = Math.abs(scale - 1);
    const [label, pts, cls] = off < 0.07 ? ['Perfect!', 2, 'good'] : off < 0.18 ? ['Good', 1, 'ok'] : ['Missed', 0, 'bad'];
    points += pts;
    msg.textContent = label; msg.className = `breath-msg ${cls}`;
    round++; speed += 0.35;
    setTimeout(() => {
      msg.textContent = '';
      locked = false;
      showRound();
      if (round >= ROUNDS) {
        cancelAnimationFrame(raf);
        const gains = points >= 9 ? { bp: 4, hp: 6 } : points >= 5 ? { bp: 3, hp: 4 } : { bp: 1, hp: 2 };
        finish('Breathing practice done!', `Score: ${points} / ${ROUNDS * 2}`, gains);
      }
    }, 600);
  });
}

function slashGame(root) {
  const DURATION = 15;
  let hits = 0, left = DURATION, spawnT, clockT, over = false;
  root.innerHTML = `
    <header class="topbar"><button class="icon-btn" data-act="quit" aria-label="Quit">‹</button><h1>Slash Practice</h1><span class="round"></span></header>
    <div class="mini">
      <p class="hint center">Tap the falling leaves and straw dummies before they vanish!</p>
      <div class="slash-box" aria-label="Practice area"></div>
      <p class="center score-live">Hits: <b>0</b></p>
    </div>`;
  const box = root.querySelector('.slash-box'), rEl = root.querySelector('.round'), sc = root.querySelector('.score-live b');
  rEl.textContent = `${left}s`;

  const spawn = () => {
    if (over) return;
    const t = document.createElement('button');
    t.className = 'target';
    t.textContent = Math.random() < 0.7 ? '🍃' : '🎯';
    t.setAttribute('aria-label', 'Target');
    t.style.left = `${8 + Math.random() * 78}%`;
    t.style.top = `${8 + Math.random() * 74}%`;
    box.appendChild(t);
    setTimeout(() => t.remove(), Math.max(700, 1300 - hits * 25));
    spawnT = setTimeout(spawn, Math.max(380, 700 - hits * 15));
  };
  spawn();
  clockT = setInterval(() => {
    left--;
    rEl.textContent = `${left}s`;
    if (left <= 0) {
      over = true;
      clearInterval(clockT); clearTimeout(spawnT);
      const gains = hits >= 16 ? { str: 2, spd: 1 } : hits >= 9 ? { str: 1, spd: 1 } : { str: 1 };
      finish('Sword practice done!', `You slashed ${hits} targets!`, gains);
    }
  }, 1000);

  root.addEventListener('pointerdown', (e) => {
    const t = e.target.closest('.target');
    if (t && !over) {
      hits++;
      sc.textContent = hits;
      t.classList.add('cut');
      t.disabled = true;
      setTimeout(() => t.remove(), 250);
    }
  });
  root.addEventListener('click', (e) => {
    if (e.target.closest('button')?.dataset.act === 'quit') { over = true; clearInterval(clockT); clearTimeout(spawnT); go('mentor'); }
  });
}
