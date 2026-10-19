# Onigari (鬼狩り): Blade of Dawn

*Onigari* is Japanese for "demon hunting". A fan-made, kid-friendly demon hunter adventure that runs in the browser and installs like an app on Android and iPhone.

## Features (Chapter 1: The Forest)

- **Character creator** (Demon Slayer-inspired art style: tall proportions, bold line work, cel shading): face shape, skin, eyes (including odd-coloured eyes), brows, nose, mouth, ears, earrings, scars, birthmarks and Slayer Marks, 9 hairstyles with two-tone tips, hair accessories, build, height, tops, bottoms, shoes and haori patterns.
- **Outfit library**: one-tap looks inspired by famous slayers.
- **Weapon builder**: katana, twin katanas, jagged blades, whip sword, needle blade, chained cleavers, flail & axe, morning star, spear and ninja stars, each with its own stats. Choose blade colour (or Nichirin, which matches your breathing), guard shape, metal, handle wrap and engraving.
- **12 breathing styles**: each has 6 forms, unlocked as you rank up.
- **Story path**: train with your mentor (2 mini-games), choose a breathing style, survive Final Selection, get your Nichirin blade and Kasugai crow, patrol the forest, rank up from Mizunoto to Kanoe and defeat the Lower Moon at the Old Shrine.
- **Difficulty**: Easy, Medium or Hard, chosen when you create a slayer and changeable in the Wardrobe.
- **Immersive battle scenes**: 12 detailed, animated locations (night forest, frozen river, bamboo grove, Wisteria Mountain, the Old Shrine and more). Your slayer fights in an action pose.
- **Turn-based battles**: strikes, breathing forms, Total Concentration, wisteria tea, and status effects. Demons have procedurally generated looks and Blood Demon Arts.
- **Demon Lab**: design your own demons and spar with them.
- **Saves**: 3 save slots in the browser's local storage, plus backup and import as a file. No account needed.
- **Works offline** once installed.

Coming in later chapters: family, siblings, friends and a love interest; side heroes; the Small Town, City and Metropolis; ranks up to Hashira.

## Run locally

Any static file server works, for example:

```bash
python -m http.server 8765
```

Then open http://localhost:8765.

## Install on a phone

- **Android (Chrome)**: open the site, then tap **Install the app** on the title screen (or use ⋮ → Add to Home screen).
- **iPhone / iPad (Safari)**: Share → **Add to Home Screen**.

The home-screen app keeps its own saves, separate from the browser. Use **⋯ → Back up to file** and **Import a backup** to move a slayer between them.

## Updating

When you change any file, bump `VERSION` in `sw.js` so installed copies refresh their offline cache.

---

Fan project, not affiliated with or endorsed by the creators of *Demon Slayer: Kimetsu no Yaiba*.
