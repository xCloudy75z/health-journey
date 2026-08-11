// src/views/meals.js — the Meals tab: day-by-day record of what A actually ate,
// with per-meal and per-day macros, compared factually against Dr Ola's plan total.
// Chat-populated only (mealsLog is never written by an in-app form — see the
// meals-intake-tracking spec). NOT pure (reads store), no time construction.
(function () {
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  function mealCard(m) {
    return '<div class="card meal" style="margin-top:8px">' +
      '<h3>' + esc(m.label) + '</h3>' +
      '<p style="color:var(--muted);font-size:13px;margin:0 0 8px">' + esc(m.description) + '</p>' +
      '<div class="macros">' +
        '<span class="mac kcal">' + Math.round(m.kcal) + ' kcal</span>' +
        '<span class="mac">P ' + Math.round(m.protein) + '</span>' +
        '<span class="mac">C ' + Math.round(m.carbs) + '</span>' +
        '<span class="mac">F ' + Math.round(m.fat) + '</span>' +
      '</div></div>';
  }

  function dayBlock(day, dayN, targets) {
    var totals = HJ.calc.mealsLogTotals(day.mealsLog);
    var planKcal = targets.kcal || 0;
    var diff = Math.round(totals.kcal) - Math.round(planKcal);
    var diffTxt = (diff >= 0 ? '+' : '−') + Math.abs(diff).toLocaleString('en-US');
    var meals = day.mealsLog.map(mealCard).join('');
    return '<div class="section-h" style="margin-top:18px">Day ' + dayN + ' <span class="r">' + esc(day.date) + '</span></div>' +
      meals +
      '<div class="card meal total" style="margin-top:8px">' +
        '<h3>Day total</h3>' +
        '<div class="macros">' +
          '<span class="mac kcal">' + Math.round(totals.kcal).toLocaleString('en-US') + ' kcal</span>' +
          '<span class="mac">Protein ' + Math.round(totals.protein) + '</span>' +
          '<span class="mac">Carbs ' + Math.round(totals.carbs) + '</span>' +
          '<span class="mac">Fat ' + Math.round(totals.fat) + '</span>' +
        '</div>' +
        '<p style="margin:10px 0 0;font-size:13.5px;color:var(--muted)">' +
          Math.round(totals.kcal).toLocaleString('en-US') + ' kcal logged · plan ' + Math.round(planKcal).toLocaleString('en-US') + ' kcal · ' + diffTxt +
        '</p>' +
      '</div>';
  }

  function render(store, todayStr) {
    var DAY1 = HJ.schema.DAY1;
    var targets = HJ.schema.TARGETS || {};
    var logs = store.allLogs().filter(function (d) { return Array.isArray(d.mealsLog) && d.mealsLog.length > 0; });

    if (!logs.length) {
      return '<section class="view active" id="meals">' +
        '<div class="section-h" style="margin-top:8px">Meals</div>' +
        '<div class="card" style="margin-top:10px;text-align:center">' +
          '<div style="font-size:30px;margin-bottom:6px">📋</div>' +
          '<div style="font-weight:700">No meals logged yet</div>' +
          '<div style="color:var(--muted);font-size:13px;margin-top:6px">Describe what you ate to Claude and it\'ll show up here.</div>' +
        '</div></section>';
    }

    var mostRecentFirst = logs.slice().reverse();
    var body = mostRecentFirst.map(function (d) {
      return dayBlock(d, HJ.calc.dayNumber(d.date, DAY1), targets);
    }).join('');

    return '<section class="view active" id="meals">' +
      '<div class="section-h" style="margin-top:8px">Meals</div>' +
      '<p style="color:var(--muted);font-size:13px;margin:0 2px 6px">What you actually ate, calculated meal by meal. Compared against Dr Ola\'s plan — never a target the app enforces.</p>' +
      body +
    '</section>';
  }

  (self.HJ = self.HJ || {}).meals = { render: render };
})();
