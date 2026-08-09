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

  // Local Y-M-D — never toISOString() (UTC would mislabel 00:00–04:00 Dubai). (C2)
  function localYMD(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  var todayStr = localYMD(new Date());   // computed once at app start

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

  function placeholder(tab) {
    return '<section class="view active" style="padding:40px 8px;text-align:center;color:var(--muted)">' +
      '<div style="font-size:34px;margin-bottom:10px">' + tab.icon + '</div>' +
      '<div style="font-weight:700;color:var(--text)">' + tab.label + '</div>' +
      '<div style="font-size:13px;margin-top:6px">Coming next.</div></section>';
  }

  function viewHtml(tab) {
    if (tab.id === 'today') return HJ.today.render(store, todayStr);
    return placeholder(tab);
  }

  function render() {
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
      HJ.logSheet.open(store, todayStr, render);
    });
    [].forEach.call(app.querySelectorAll('.tab'), function (btn) {
      btn.addEventListener('click', function () { active = btn.getAttribute('data-tab'); render(); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
