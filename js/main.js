// Entry point: registers screens, the title / save-slot screen, install prompt and offline support.
import { app, go, esc, modal, toast } from './ui.js';
import { listSlots, loadSlot, newGame, deleteSlot, exportSave, importSave, requestPersistence, storageOk } from './store.js';
import { renderAvatar } from './avatar.js';
import { RANKS, DIFFICULTY } from './data.js';
import { creatorScreen } from './creator.js';
import { introScreen, mapScreen, homeScreen, mentorScreen, breathingScreen, patrolScreen, profileScreen } from './world.js';
import { battleScreen } from './battle.js';
import { trainScreen } from './minigames.js';
import { labScreen, labEditScreen } from './lab.js';

let installEvent = null;
const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isStandalone = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

function titleScreen(root) {
  const slots = listSlots();
  const when = (t) => new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  root.innerHTML = `
    <div class="title-screen">
      <div class="logo"><span class="logo-kanji" aria-hidden="true">滅</span><h1>Slayer's Path</h1><p>Create your slayer. Train. Rise to Hashira.</p></div>
      ${storageOk ? '' : '<p class="warn">Saving is blocked in this browser (private mode?). Progress will be lost when you close the page.</p>'}
      <div class="slots">${slots.map((s, i) => s ? `
        <div class="slot">
          <div class="slot-face">${renderAvatar(s.look, { headOnly: true })}</div>
          <div class="slot-info"><b>${esc(s.name || 'Unnamed slayer')}</b><small>${RANKS[s.rank]?.name || 'Trainee'} · ${s.slain} demons · ${(DIFFICULTY[s.difficulty] || DIFFICULTY.medium).name} · ${when(s.updatedAt)}</small></div>
          <div class="slot-btns"><button class="btn primary" data-play="${i}">Play</button><button class="icon-btn" data-more="${i}" aria-label="More options for ${esc(s.name)}">⋯</button></div>
        </div>` : `
        <button class="slot empty" data-new="${i}"><span class="plus">＋</span><span><b>New slayer</b><small>Empty slot ${i + 1}</small></span></button>`).join('')}</div>
      <div class="title-actions">
        ${installEvent ? '<button class="btn glow" data-act="install">📲 Install the app</button>' : ''}
        ${isIos && !isStandalone ? '<button class="btn" data-act="ios">📲 Install on iPhone / iPad</button>' : ''}
        <label class="btn file-btn">📂 Import a backup<input type="file" accept="application/json,.json" hidden></label>
      </div>
      <p class="foot">A fan-made game. Your slayers are saved on this device only. Use <b>⋯ → Back up</b> to keep a copy.</p>
    </div>`;

  root.addEventListener('click', async (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.play) {
      app.game = loadSlot(+t.dataset.play);
      requestPersistence();
      return go(app.game.name ? (app.game.flags.intro ? 'map' : 'intro') : 'creator', { mode: 'new' });
    }
    if (t.dataset.new) {
      app.game = newGame(+t.dataset.new);
      requestPersistence();
      return go('creator', { mode: 'new' });
    }
    if (t.dataset.more) {
      const i = +t.dataset.more, s = slots[i];
      const choice = await modal({ title: esc(s.name), body: '<p>Back up this slayer to a file, or delete it from this device.</p>',
        actions: [{ label: 'Back up to file', value: 'export', primary: true }, { label: 'Delete', value: 'delete', danger: true }, { label: 'Cancel', value: null }] });
      if (choice === 'export') exportSave(s);
      if (choice === 'delete') {
        const sure = await modal({ title: 'Delete for ever?', body: `<p><b>${esc(s.name)}</b> and all their progress will be removed from this device. This can't be undone.</p>`,
          actions: [{ label: 'Keep', value: false, primary: true }, { label: 'Delete', value: true, danger: true }] });
        if (sure) { deleteSlot(i); go('title'); }
      }
      return;
    }
    if (t.dataset.act === 'install' && installEvent) {
      installEvent.prompt();
      await installEvent.userChoice;
      installEvent = null;
      go('title');
    }
    if (t.dataset.act === 'ios') {
      modal({ title: 'Install on iPhone / iPad', body: '<ol class="form-ol"><li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button (square with an arrow).</li><li>Choose <b>Add to Home Screen</b>.</li></ol><p class="hint">Note: the home-screen app keeps its own saves, separate from Safari. Use Back up / Import to move a slayer across.</p>' });
    }
  });

  root.querySelector('input[type=file]').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const choice = await modal({ title: 'Import into which slot?', body: '<p>The slot you choose will be replaced.</p>',
      actions: [...slots.map((s, i) => ({ label: `Slot ${i + 1}${s ? ` (${esc(s.name)})` : ' (empty)'}`, value: i, primary: !s })), { label: 'Cancel', value: null }] });
    if (choice == null) return;
    try {
      await importSave(file, choice);
      toast('Backup imported!');
      go('title');
    } catch (err) {
      modal({ title: "Couldn't import", body: `<p>${esc(err.message)}</p>` });
    }
  });
}

Object.assign(app.screens, {
  title: titleScreen, creator: creatorScreen, intro: introScreen, map: mapScreen, home: homeScreen, mentor: mentorScreen,
  breathing: breathingScreen, patrol: patrolScreen, profile: profileScreen, battle: battleScreen, train: trainScreen,
  lab: labScreen, labEdit: labEditScreen,
});

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  installEvent = e;
  if (app.current === 'title') go('title');
});

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  navigator.serviceWorker.register('sw.js').catch(() => { /* offline support unavailable */ });
}

go('title');
