// src/app.js — app shell: header, 5-tab bottom bar, tab navigation, theme toggle,
// and (B2) the live Today view wired to the on-device store + log/backup sheets.
// This is the ONE module allowed to read the wall clock (it is not a pure module).
(function () {
  var TABS = [
    { id: 'today',  icon: '🏠', label: 'Today'  },
    { id: 'diet',   icon: '🍽️', label: 'Diet'   },
    { id: 'guides', icon: '📚', label: 'Guides' },
    { id: 'trends', icon: '📈', label: 'Trends' },
    { id: 'report', icon: '🩺', label: 'Report' }
  ];
  var active = 'today';
  var guidesSub = null;   // B4: null = the Guides index; a guide id = that guide's detail.

  // Local Y-M-D — never toISOString() (UTC would mislabel 00:00–04:00 Dubai). (C2)
  function localYMD(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  // BB4: recomputed at every render + when the log sheet opens, so a session left open
  // across midnight never writes to (or shows) the wrong day.
  var todayStr = localYMD(new Date());

  var store = HJ.store.createStore(window.localStorage);

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }
  function toggleTheme() {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('hj-theme', next); } catch (e) {}
    render();
  }

  function viewHtml(tab) {
    if (tab.id === 'today') return HJ.today.render(store, todayStr);
    if (tab.id === 'diet') return HJ.diet.render();
    if (tab.id === 'guides') return HJ.guides.render(guidesSub);
    if (tab.id === 'trends') return HJ.trends.render(store, todayStr);
    if (tab.id === 'report') return HJ.report.render(store, todayStr);
    return '';   // A13: all five tabs are handled above; no placeholder fallback needed.
  }

  function render() {
    // A3: never re-render while a log/backup sheet is open — the sheet is appended into
    // #app, so replacing #app.innerHTML here would silently wipe a half-typed entry and
    // bypass the discard-confirm. Bail; the sheet's own onSaved/onClose re-renders after.
    if (document.querySelector('.sheet-wrap.open')) return;
    todayStr = localYMD(new Date());   // BB4: refresh the day on every render
    var app = document.getElementById('app');
    var tab = TABS.filter(function (t) { return t.id === active; })[0];
    app.innerHTML =
      '<header class="app-header"><div class="app-title">Health Journey</div>' +
        '<div class="hb">' +
          '<button class="icon-btn" id="backupBtn" aria-label="Back up">⤓</button>' +
          '<button class="icon-btn" id="themeBtn" aria-label="Theme">' +
            (currentTheme() === 'dark' ? '☀' : '☾') + '</button>' +
        '</div></header>' +
      '<div class="body">' + viewHtml(tab) + '</div>' +
      (active === 'today' ? '<div class="log-cta"><button class="btn btn-primary" id="logBtn">＋ Log today</button></div>' : '') +
      '<nav class="tabbar">' + TABS.map(function (t) {
        return '<button class="tab' + (t.id === active ? ' active' : '') + '" data-tab="' + t.id +
          '"><span class="ic">' + t.icon + '</span>' + t.label + '</button>';
      }).join('') + '</nav>';

    document.getElementById('themeBtn').addEventListener('click', toggleTheme);
    document.getElementById('backupBtn').addEventListener('click', function () {
      HJ.backupSheet.open(store, new Date().toISOString(), render);
    });
    var logBtn = document.getElementById('logBtn');
    if (logBtn) logBtn.addEventListener('click', function () {
      todayStr = localYMD(new Date());   // BB4: fresh day at the moment the sheet opens
      HJ.logSheet.open(store, todayStr, render);
    });
    // B6: Report tab actions — print the sheet, or open the backup/export sheet so
    // Dr Ola's printed copy and an off-device backup are one tap apart.
    var repPrint = document.getElementById('repPrintBtn');
    if (repPrint) repPrint.addEventListener('click', function () { window.print(); });
    var repExport = document.getElementById('repExportBtn');
    if (repExport) repExport.addEventListener('click', function () {
      HJ.backupSheet.open(store, new Date().toISOString(), render);
    });
    [].forEach.call(app.querySelectorAll('.tab'), function (btn) {
      // B4: switching tabs always returns Guides to its index (never lands mid-detail).
      btn.addEventListener('click', function () { active = btn.getAttribute('data-tab'); guidesSub = null; render(); });
    });
    // B4: Guides index↔detail nav. A card opens its guide; the back link clears to the index.
    [].forEach.call(app.querySelectorAll('[data-guide]'), function (btn) {
      btn.addEventListener('click', function () { guidesSub = btn.getAttribute('data-guide'); render(); });
    });
    var guidesHome = app.querySelector('[data-guides-home]');
    if (guidesHome) guidesHome.addEventListener('click', function () { guidesSub = null; render(); });
    // B8: Training guide's segmented sub-nav (Overview/Day A/Day B/Safety) — pure
    // DOM toggle, no state/re-render, matching the approved mockup's own behavior.
    var seg = app.querySelector('[data-seg]');
    if (seg) {
      [].forEach.call(seg.querySelectorAll('button'), function (b) {
        b.addEventListener('click', function () {
          [].forEach.call(seg.querySelectorAll('button'), function (x) { x.classList.remove('sel'); });
          b.classList.add('sel');
          var container = seg.parentNode;
          [].forEach.call(container.querySelectorAll('.subpane'), function (p) { p.classList.remove('on'); });
          var pane = container.querySelector('#' + b.getAttribute('data-pane'));
          if (pane) pane.classList.add('on');
        });
      });
    }
    // BB9: tap (or keyboard-activate) a recent day to edit/backfill that date.
    [].forEach.call(app.querySelectorAll('.row-tap[data-date]'), function (row) {
      function openDay() { HJ.logSheet.open(store, row.getAttribute('data-date'), render); }
      row.addEventListener('click', openDay);
      row.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDay(); }
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();

  // BB4 + A3: re-render when the PWA returns to the foreground (resume / bfcache restore)
  // ONLY when the calendar day actually changed — an unconditional re-render on every
  // resume risks wiping an open sheet and does needless work. render() itself also bails
  // under an open sheet, so this is belt-and-braces.
  function rerenderIfDayChanged() {
    if (localYMD(new Date()) !== todayStr) render();
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden) rerenderIfDayChanged(); });
  window.addEventListener('pageshow', function (event) { if (event && event.persisted) rerenderIfDayChanged(); });
})();
