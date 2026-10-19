// Game rules that don't touch the screen: ranks, XP, forms, training limits.
import { WEAPONS, BREATHING, RANKS, CHAPTER1_RANK_CAP } from './data.js';

export const weaponOf = (g) => WEAPONS.find((w) => w.id === g.weapon.type) || WEAPONS[0];
export const WOODEN = { id: 'wooden', name: 'Wooden Practice Sword', pow: 0.8, spd: 1, crit: 0.05 };
export const activeWeapon = (g) => (g.rank === 0 ? WOODEN : weaponOf(g));

const FORMS_BY_RANK = [1, 2, 2, 3, 4, 4, 5, 5, 6, 6, 6, 6];
export function forms(g) {
  if (!g.breathing) return [];
  return BREATHING[g.breathing].forms.slice(0, FORMS_BY_RANK[g.rank]);
}

export const rankName = (g) => RANKS[g.rank].name;
export const nextRank = (g) => RANKS[g.rank + 1];

// Fraction of the way to the next rank, for the XP bar.
export function rankProgress(g) {
  const cur = RANKS[g.rank], nxt = RANKS[g.rank + 1];
  if (!nxt || g.rank === 0) return { have: 0, need: 1, pct: 0 };
  const have = g.xp - cur.xp, need = nxt.xp - cur.xp;
  return { have: Math.min(have, need), need, pct: Math.min(1, have / need) };
}

export function rankUp(g) {
  g.rank++;
  g.stats.hp += 12; g.stats.str += 2; g.stats.spd += 1; g.stats.bp += 5; g.stats.def += 1;
  g.hp = g.stats.hp;
  g.rankTrainings = 0;
}

// Adds XP and applies any rank-ups (capped for the forest chapter).
export function addXp(g, amount) {
  const ups = [];
  if (g.rank === 0) return { ups, capped: false };
  g.xp += amount;
  while (g.rank + 1 < RANKS.length && g.rank < CHAPTER1_RANK_CAP && g.xp >= RANKS[g.rank + 1].xp) {
    rankUp(g);
    ups.push(RANKS[g.rank].name);
  }
  const capped = g.rank >= CHAPTER1_RANK_CAP && RANKS[g.rank + 1] && g.xp >= RANKS[g.rank + 1].xp;
  return { ups, capped };
}

export const trainingCap = (g) => (g.rank === 0 ? 8 : 3);
export const trainingLeft = (g) => Math.max(0, trainingCap(g) - (g.rankTrainings || 0));

export function fullHeal(g) {
  g.hp = g.stats.hp;
  g.tea = Math.max(g.tea, 3);
}
