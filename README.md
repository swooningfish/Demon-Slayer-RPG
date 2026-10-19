# Demon Slayer RPG

An unofficial, fan-made, kid-friendly demon slayer adventure that runs in the browser and installs like an app on Android and iPhone.

## ▶ Play online

**[swooningfish.github.io/Demon-Slayer-RPG](https://swooningfish.github.io/Demon-Slayer-RPG/)**

No download, account or local server needed. Open the link on any phone, tablet or computer and start playing. The site is hosted for free on GitHub Pages and updates automatically whenever new code is pushed to `main`.

### Install it like an app

1. Open the link above on your phone.
2. Add it to your home screen:
   - **Android (Chrome)**: tap **Install the app** on the title screen (or ⋮ → **Add to Home screen**).
   - **iPhone / iPad (Safari)**: tap **Share** → **Add to Home Screen**.
3. Launch it from the home-screen icon. It opens full screen and works offline after the first visit.

Your slayers are saved on that device only. The home-screen app keeps its own saves, separate from the browser, so use **⋯ → Back up to file** and **Import a backup** to move a slayer between them or to another device.

## Features (Chapter 1: The Forest)

- **Character creator** (Demon Slayer-inspired art style: tall proportions, bold line work, cel shading): face shape, skin, eyes (including odd-coloured eyes), brows, nose, mouth, ears, earrings, scars, birthmarks and Slayer Marks, 9 hairstyles with two-tone tips, hair accessories, build, height, tops, bottoms, shoes and haori patterns.
- **Character types**: human, Muscle Mouse or Boar Mask, with masculine or feminine body styles.
- **Accessories**: warding, fox, tengu and swordsmith (hyottoko) masks, headgear (straw hat, hachimaki, jingasa, hood and more), scarves with patterns, straw cape, arm bands, and a crow or sparrow on your shoulder.
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

## For developers

You only need this to work on the code. Players should use the [online link](#-play-online).

### Run locally

Any static file server works, for example:

```bash
python -m http.server 8765
```

Then open http://localhost:8765.

### Publishing updates

1. Bump `APP_VERSION` in [`version.js`](version.js), for example `1.4.0` → `1.5.0`. It's shown on the title screen and in the corner of every screen, and it renames the offline cache so installed copies refresh.
2. Commit and push to `main`.
3. GitHub Pages rebuilds automatically, usually within a minute or two (watch it under the repo's **Actions** tab). The live site then serves the new version.

---

Fan project, not affiliated with or endorsed by the creators of *Demon Slayer: Kimetsu no Yaiba*.
