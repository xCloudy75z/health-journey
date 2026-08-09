# Health Journey — app

A private, offline-first weight-loss tracker built as a **dependency-free, single-file PWA**.
It clones the build approach of the spending-tracker app: plain HTML/CSS/vanilla JS in `src/`,
inlined by a tiny Node script into one self-contained `dist/index.html` for GitHub Pages.

> **Bundle 0 (Foundation)** ships only the generic app shell — a 5-tab bottom bar, a theme
> toggle, and the offline plumbing. There is **no data and no personal content** here yet.
> Real screens and A's numbers/diet/protocol arrive in later bundles via on-device import.

## Privacy — read this first

**Personal data never lives in this repo.** Every file here is generic. A's weight readings,
meals, medication log, and Dr Ola protocol are entered/imported **on the device** and stored
locally (localStorage) — they are never committed to git and never leave the phone except via
an explicit backup export that A controls.

## Requirements

- Node **≥ 22** (used only for build + tests; nothing is shipped to the browser from Node).
- Git is bundled in GitHub Desktop on this machine — it is not on PATH.

## Commands

```bash
npm test          # run the pure-logic unit tests (node --test) — 7 tests
npm run lint:pure # assert calc.js/format.js stay deterministic (no new Date / Math.random / Date.now)
npm run build     # inline src/* → dist/index.html (+ sw.js, manifest, icons)
npm run dev       # build once, then serve dist/ at http://localhost:5178
```

## How the build works

`scripts/build.js` reads `index.html`, replaces the `STYLES:START…END` and `MODULES:START…END`
marker blocks with the inlined contents of `src/styles/main.css` and the `src/*.js` modules, and
writes `dist/index.html`. It also copies the service worker (`src/sw.js`, with `__VERSION__`
stamped from the git short-SHA or a timestamp fallback), the web manifest, and the icons into
`dist/`. The result is one page with **no external `src=`/`href=` references** — it runs offline.

## File map

```
app/
├── package.json            # scripts (build/dev/test/lint:pure); ZERO runtime deps
├── .gitignore              # dist/, node_modules/, .DS_Store, *.log
├── index.html              # shell: FOUC theme, STYLES/MODULES markers, #app + #toast-root, SW register
├── scripts/
│   ├── build.js            # inliner → dist/index.html + sw.js + icons + manifest
│   ├── dev.js              # build once + static serve on :5178
│   ├── lint-pure.js        # fails if a pure module uses new Date()/Date.now()/Math.random()
│   └── make-icon.js        # one-shot: writes a flat 180×180 teal PNG (no deps)
├── src/
│   ├── styles/main.css     # "quiet clinic" tokens + shell/tab/sheet CSS (visuals from the mockup,
│   │                       #   phone positioning + safe-area from the spending-tracker's real CSS)
│   ├── format.js           # pure: formatKg, formatSigned
│   ├── calc.js             # pure: daysBetween, dayNumber, countdownToDay30
│   ├── app.js              # shell: header + 5-tab bar + placeholder views + nav + theme toggle
│   └── sw.js               # offline cache (hj-<VERSION>), network-first document, skipWaiting
├── icons/
│   ├── manifest.webmanifest
│   ├── icon.svg            # leaf mark (SVG)
│   └── apple-touch-icon-180.png  # iOS home-screen icon (PNG required by iOS)
└── tests/
    ├── calc.test.js
    └── format.test.js
```

## Deploy (owner-gated)

`dist/` is published to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.
Creating the GitHub repo, enabling Pages, and installing on the iPhone are A's steps — see the
Bundle 0 session summary for the exact click-list.
