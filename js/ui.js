// Tiny screen router and shared UI helpers.
import { saveGame } from './store.js';

export const app = { game: null, screens: {}, current: null, params: null };

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function go(name, params = {}) {
  // Swap in a fresh element so the previous screen's event listeners are dropped.
  const old = document.getElementById('app');
  const root = old.cloneNode(false);
  old.replaceWith(root);
  if (app.current !== name) app.previous = app.current;
  app.current = name;
  app.params = params;
  root.className = `screen-${name}`;
  window.scrollTo(0, 0);
  app.screens[name](root, params);
}

export function save() {
  if (app.game) saveGame(app.game);
}

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

let toastTimer;
export function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

// Story dialogue: lines = [{ who, text, portrait? }]. Tap to advance.
export function dialog(lines) {
  return new Promise((resolve) => {
    let i = 0;
    const ov = el(`<div class="overlay dialog-ov" role="dialog" aria-live="polite"><div class="dialog-box">
      <div class="dialog-portrait"></div><div class="dialog-body"><div class="dialog-who"></div><p class="dialog-text"></p>
      <div class="dialog-next">Tap to continue ▸</div></div></div></div>`);
    const show = () => {
      const l = lines[i];
      ov.querySelector('.dialog-who').textContent = l.who || '';
      ov.querySelector('.dialog-text').textContent = l.text;
      const p = ov.querySelector('.dialog-portrait');
      p.innerHTML = l.portrait || '';
      p.style.display = l.portrait ? '' : 'none';
    };
    const next = () => {
      i++;
      if (i >= lines.length) { ov.remove(); document.removeEventListener('keydown', key); resolve(); } else show();
    };
    const key = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); next(); } };
    ov.addEventListener('click', next);
    document.addEventListener('keydown', key);
    show();
    document.body.appendChild(ov);
  });
}

// Simple modal with buttons. Resolves with the chosen action's value.
export function modal({ title = '', body = '', actions = [{ label: 'OK', value: true, primary: true }], cls = '' }) {
  return new Promise((resolve) => {
    const ov = el(`<div class="overlay" role="dialog" aria-modal="true"><div class="modal ${cls}">
      ${title ? `<h2>${title}</h2>` : ''}<div class="modal-body">${body}</div>
      <div class="modal-actions">${actions.map((a, i) => `<button class="btn ${a.primary ? 'primary' : ''} ${a.danger ? 'danger' : ''}" data-i="${i}">${a.label}</button>`).join('')}</div>
    </div></div>`);
    ov.querySelectorAll('[data-i]').forEach((b) => b.addEventListener('click', () => { ov.remove(); resolve(actions[+b.dataset.i].value); }));
    document.body.appendChild(ov);
    ov.querySelector('.btn.primary, .btn')?.focus();
  });
}

export function bar(value, max, cls = '') {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return `<div class="bar ${cls}"><div class="bar-fill" style="width:${pct}%"></div><span>${Math.max(0, Math.round(value))} / ${Math.round(max)}</span></div>`;
}
