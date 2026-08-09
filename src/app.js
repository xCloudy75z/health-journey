// src/app.js — app shell: header, 5-tab bottom bar, tab navigation, theme toggle.
(function () {
  var TABS = [
    { id: 'today',  icon: '🏠', label: 'Today'  },
    { id: 'diet',   icon: '🍽️', label: 'Diet'   },
    { id: 'guides', icon: '📚', label: 'Guides' },
    { id: 'trends', icon: '📈', label: 'Trends' },
    { id: 'report', icon: '🩺', label: 'Report' }
  ];
  var active = 'today';

  function h(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
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

  function view(tab) {
    return '<section class="view active" style="padding:40px 8px;text-align:center;color:var(--muted)">' +
      '<div style="font-size:34px;margin-bottom:10px">' + tab.icon + '</div>' +
      '<div style="font-weight:700;color:var(--text)">' + tab.label + '</div>' +
      '<div style="font-size:13px;margin-top:6px">Coming next.</div></section>';
  }

  function render() {
    var app = document.getElementById('app');
    var tab = TABS.filter(function (t) { return t.id === active; })[0];
    app.innerHTML =
      '<header class="app-header"><div class="app-title">Health Journey</div>' +
        '<button class="icon-btn" id="themeBtn" aria-label="Theme">' +
          (currentTheme() === 'dark' ? '☀' : '☾') + '</button></header>' +
      '<div class="body">' + view(tab) + '</div>' +
      '<nav class="tabbar">' + TABS.map(function (t) {
        return '<button class="tab' + (t.id === active ? ' active' : '') + '" data-tab="' + t.id +
          '"><span class="ic">' + t.icon + '</span>' + t.label + '</button>';
      }).join('') + '</nav>';
    document.getElementById('themeBtn').addEventListener('click', toggleTheme);
    [].forEach.call(app.querySelectorAll('.tab'), function (btn) {
      btn.addEventListener('click', function () { active = btn.getAttribute('data-tab'); render(); });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', render);
  else render();
})();
