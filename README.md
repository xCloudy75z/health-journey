# Health Journey — app

A private, offline-first weight-loss tracker built as a **dependency-free, single-file PWA**.
It clones the build approach of the spending-tracker app: plain HTML/CSS/vanilla JS in `src/`,
inlined by a tiny Node script into one self-contained `dist/index.html` for GitHub Pages.

## Privacy — read this first

**Be honest about what is and isn't in this public repo.**

- **The diet, the Rybelsus protocol, and the Guides content ARE in the public source code**
  (see `src/views/diet.js`, `src/views/guides.js`). They are built into the app so it works
  offline with no server. Anyone reading this repo can read the plan — that is by design, and
  it is fine per the owner's rule below.
- **The one hard rule: no name and no age.** The owner's name and age are never written into
  any file, comment, doc, or commit here.
- **Day-to-day log data stays on the device.** Weight readings, the daily medication log, side
  effects, and body-scan numbers are entered/imported **on the phone** and stored locally
  (localStorage). They are never committed to git and only leave the phone via an explicit
  backup export the owner controls.

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
