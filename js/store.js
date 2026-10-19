// Save slots in localStorage. Falls back to memory if storage is blocked (private mode, etc.).
import { DEFAULT_LOOK, DEFAULT_WEAPON, CROW_NAMES } from './data.js';

const KEY = 'slayers-path.slots.v1';
const SLOT_COUNT = 3;
let memory = null;
export let storageOk = true;

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    const slots = raw ? JSON.parse(raw) : [];
    while (slots.length < SLOT_COUNT) slots.push(null);
    return slots.slice(0, SLOT_COUNT);
  } catch {
    storageOk = false;
    return memory || Array(SLOT_COUNT).fill(null);
  }
}

function writeAll(slots) {
  memory = slots;
  try {
    localStorage.setItem(KEY, JSON.stringify(slots));
    storageOk = true;
  } catch {
    storageOk = false;
  }
}

export const listSlots = () => readAll();

export function loadSlot(i) {
  const s = readAll()[i];
  return s ? migrate(s) : null;
}

export function saveGame(game) {
  if (game == null || game.slot == null) return;
  const slots = readAll();
  game.updatedAt = Date.now();
  slots[game.slot] = game;
  writeAll(slots);
}

export function deleteSlot(i) {
  const slots = readAll();
  slots[i] = null;
  writeAll(slots);
}

export function newGame(slot) {
  return {
    v: 1, slot, createdAt: Date.now(), updatedAt: Date.now(),
    name: '', look: { ...DEFAULT_LOOK }, weapon: { ...DEFAULT_WEAPON },
    difficulty: 'medium', breathing: null, crow: CROW_NAMES[Math.floor(Math.random() * CROW_NAMES.length)],
    rank: 0, xp: 0, slain: 0, trainings: 0, rankTrainings: 0, missions: null,
    stats: { hp: 60, str: 8, spd: 8, bp: 30, def: 3 },
    hp: 60, tea: 3,
    flags: { intro: false, metMentor: false, selection: false, boss: false, chapter1: false },
    customDemons: [], bestiary: [],
  };
}

// Fill in fields added after a save was made, so old saves keep working.
function migrate(s) {
  const base = newGame(s.slot);
  return {
    ...base, ...s,
    look: { ...base.look, ...s.look }, weapon: { ...base.weapon, ...s.weapon },
    stats: { ...base.stats, ...s.stats }, flags: { ...base.flags, ...s.flags },
  };
}

export function exportSave(game) {
  const blob = new Blob([JSON.stringify(game, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `slayers-path-${(game.name || 'slayer').replace(/\W+/g, '_')}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export async function importSave(file, slot) {
  const data = JSON.parse(await file.text());
  if (!data || typeof data !== 'object' || !data.look || !data.stats) throw new Error('Not a Slayer\'s Path save file');
  const game = migrate({ ...data, slot });
  saveGame(game);
  return game;
}

// Ask the browser not to clear our data when space runs low (helps on iPhone).
export function requestPersistence() {
  try { navigator.storage?.persist?.(); } catch { /* not supported */ }
}
