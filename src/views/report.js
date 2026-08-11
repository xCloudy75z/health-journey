// src/views/report.js — the Day-30 report for Dr Ola. A data-only, zero-advice sheet
// assembled from calc.reportData. NOT pure (reads store), no time construction —
// todayStr is injected by app.js. NEVER plays doctor: every figure is a stated number,
// never an interpretation, never a threshold, never advice. Weight = Eufy, scans = Seca —
// the two scales are labelled and never crossed. No name, no age.
(function () {
  var SIDE = ['None', 'Mild', 'Disruptive', 'Stopped me'];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function num(n, d) { return (typeof n === 'number' && !isNaN(n)) ? n.toFixed(d == null ? 1 : d) : '—'; }
  function signed(n, d) {
    if (typeof n !== 'number' || isNaN(n)) return '—';
    if (n === 0) return '0.0';
    return (n > 0 ? '+' : '−') + Math.abs(n).toFixed(d == null ? 1 : d);
  }
  // .rep-line rollup row (same markup Trends + the Guides summaries use).
  function row(k, v, vStyle) {
    return '<div class="rep-line"><span class="k">' + k + '</span>' +
      '<span class="v"' + (vStyle ? ' style="' + vStyle + '"' : '') + '>' + v + '</span></div>';
  }
  function pending(msg) {
    return '<div style="text-align:center;color:var(--muted);font-size:13px;padding:8px 0">' + esc(msg) + '</div>';
  }
  function sectionHead(n, title, badge) {
    return '<div class="section-h" style="margin-top:14px">' + n + '. ' + title +
      (badge ? ' <span class="r">' + esc(badge) + '</span>' : '') + '</div>';
  }

  // Compact neutral side-effect strip: one thin bar per logged day, height by level.
  // Level 0 = a muted baseline tick; >0 = the one intentional amber health-signal.
  function sideStrip(list) {
    var bars = list.map(function (e) {
      var lvl = typeof e.level === 'number' ? e.level : 0;
      var h = 5 + lvl * 9;   // 5,14,23,32 px for levels 0..3
      var amber = lvl > 0;
      return '<span title="Day ' + e.day + ': ' + esc(SIDE[lvl] || String(lvl)) + '" ' +
        'style="display:inline-block;width:7px;height:' + h + 'px;border-radius:3px;' +
        'background:' + (amber ? 'var(--warn)' : 'var(--border)') + '"></span>';
    }).join('');
    return '<div style="display:flex;align-items:flex-end;gap:3px;flex-wrap:wrap;padding:6px 0 2px">' + bars + '</div>' +
      '<div style="color:var(--muted);font-size:11.5px;margin-top:4px">Each bar = one logged day, in day order. Taller/amber = stronger side effect (0 none · 1 mild · 2 disruptive · 3 stopped me).</div>';
  }

  var NAUSEA_COLORS = ['var(--surface-3)', 'var(--warn-soft)', 'var(--warn)', 'var(--bad)'];
  function feelingsSection(timeline, highlights, dayN) {
    if (!timeline.length && !highlights.length) {
      return pending('Collecting… (Day ' + dayN + ' of 30)');
    }
    var out = '';
    if (timeline.length) {
      var cells = timeline.map(function (t) {
        return '<span class="cell" title="Day ' + t.day + '" style="background:' + (NAUSEA_COLORS[t.nausea] || NAUSEA_COLORS[0]) + '"></span>';
      }).join('');
      out += '<div class="section-h" style="margin:4px 2px 8px">Nausea — day by day</div>' +
        '<div class="tl-legend">' +
          '<span><i style="background:var(--surface-3)"></i>None</span>' +
          '<span><i style="background:var(--warn-soft)"></i>Mild</span>' +
          '<span><i style="background:var(--warn)"></i>Medium</span>' +
          '<span><i style="background:var(--bad)"></i>Bad</span>' +
        '</div>' +
        '<div class="tl">' + cells + '</div>';
    }
    if (highlights.length) {
      out += '<div class="section-h" style="margin:16px 2px 8px">Highlights from your notes</div>' +
        '<ul class="narr">' + highlights.map(function (h) {
          return '<li><span class="d">Day ' + h.day + '</span><span class="q">"' + esc(h.note) + '"</span></li>';
        }).join('') + '</ul>';
    }
    out += '<div class="rep-note" style="font-style:italic;margin-top:11px;border-top:1px dashed var(--border);padding-top:10px">Compiled from your entries only. No interpretation, no advice — these notes are for Dr Ola to read and decide on.</div>';
    return out;
  }

  function render(store, todayStr) {
    var DAY1 = HJ.schema.DAY1;
    var logs = store.allLogs();
    // BP6 + A1: guard against imported/older state that omits scans OR carries a non-array
    // scans (the sort/slice below would otherwise crash the whole Report view).
    var scans = store.getState().scans;
    if (!Array.isArray(scans)) scans = [];
    var rd = HJ.calc.reportData(logs, scans, HJ.schema.TARGETS, todayStr, DAY1);
    var stats = HJ.calc.logStats(logs);
    var dayN = Math.max(1, HJ.calc.dayNumber(todayStr, DAY1));
    var pendMsg = 'Collecting… (Day ' + dayN + ' of 30)';

    // ---- Header ----
    var range = HJ.format.formatDayMonth(DAY1) + ' → ' +
      (todayStr === DAY1 ? 'today' : HJ.format.formatDayMonth(todayStr)) + ' · Day 1–' + dayN;
    var header =
      '<div class="hero" style="padding:18px 12px 8px">' +
        '<div class="lbl">For Dr Ola</div>' +
        '<div class="amt" style="font-size:26px">Day-30 report</div>' +
        '<div class="sub">Data only — every target is Dr Ola\'s. ' + esc(range) + '</div>' +
      '</div>';

    // ---- 1. Weight (Eufy) ----
    var w1 = rd.week1, w4 = rd.week4;
    var weightCard;
    if (w1.avg != null && w4.avg != null) {
      weightCard = '<div class="card">' +
        row('Week 1 average', num(w1.avg) + ' <span style="color:var(--muted);font-weight:500">kg · ' + w1.n + ' reading' + (w1.n === 1 ? '' : 's') + '</span>') +
        row('Week 4 average', num(w4.avg) + ' <span style="color:var(--muted);font-weight:500">kg · ' + w4.n + ' reading' + (w4.n === 1 ? '' : 's') + '</span>') +
        row('Change <span style="color:var(--muted)">vs week-1 average</span>',
            '<span style="color:var(--muted)">' + signed(rd.weightDeltaKg) + ' kg · ' + signed(rd.weightDeltaPct) + '%</span>') +
      '</div>';
    } else {
      weightCard = '<div class="card">' + pending(pendMsg) +
        '<div style="color:var(--muted);font-size:12px;text-align:center">Week-1 vs week-4 7-day averages appear once both windows have weigh-ins.</div></div>';
    }

    // ---- 2. Dose-correctness ----
    var dz = rd.dose;
    var doseCard;
    if (dz.completed > 0) {
      doseCard = '<div class="card">' +
        row('Dose-correct rate', '<span style="color:var(--good)">' + Math.round(dz.rate * 100) + '%</span> <span style="color:var(--muted);font-weight:500">of ' + dz.completed + ' completed day' + (dz.completed === 1 ? '' : 's') + '</span>') +
        row('Correct', String(dz.correct)) +
        row('Incorrect', String(dz.incorrect)) +
        row('Missed', String(dz.missed)) +
        row('Unconfirmed <span style="color:var(--muted)">(shown separately, not counted as missed)</span>', String(dz.unconfirmed)) +
      '</div>';
    } else {
      doseCard = '<div class="card">' + pending(pendMsg) +
        (dz.unconfirmed > 0 ? '<div style="color:var(--muted);font-size:12px;text-align:center">' + dz.unconfirmed + ' past day' + (dz.unconfirmed === 1 ? '' : 's') + ' still need their dose confirmed.</div>' : '') +
      '</div>';
    }

    // ---- 3. Side effects vs day-of-medicine ----
    var seCard = rd.sideEffectsByDay.length
      ? '<div class="card">' + sideStrip(rd.sideEffectsByDay) + '</div>'
      : '<div class="card">' + pending(pendMsg) + '</div>';

    // ---- 4. Body-scan changes (Seca) ----
    var scanCard;
    if (rd.scans.available) {
      var sc = rd.scans;
      scanCard = '<div class="card">' +
        row('Window', esc(HJ.format.formatDayMonth(sc.from)) + ' → ' + esc(HJ.format.formatDayMonth(sc.to))) +
        row('Body fat', signed(sc.fatPctDelta) + ' <span style="color:var(--muted);font-weight:500">% pts · now measured</span>') +
        row('Fat mass', signed(sc.fatKgDelta) + ' <span style="color:var(--muted);font-weight:500">kg</span>') +
        row('Skeletal muscle', signed(sc.muscleKgDelta) + ' <span style="color:var(--muted);font-weight:500">kg</span>') +
        // BP6: only report a visceral number when it was actually measured on both scans.
        row('Visceral fat', sc.visceralDelta != null
          ? signed(sc.visceralDelta, 0)
          : '<span style="color:var(--muted)">not measured</span>') +
      '</div>';
    } else {
      // BP3: distinguish "no scans", "one scan only", and "waiting on the Day-30 scan".
      var sorted = scans.slice().sort(function (a, b) { return (a.date || '') < (b.date || '') ? -1 : (a.date || '') > (b.date || '') ? 1 : 0; });
      var msg;
      if (sorted.length === 0) msg = 'No scans imported yet — add two Seca scans to show fat / muscle / visceral change.';
      else {
        var last = sorted[sorted.length - 1];
        var afterDay1 = last && last.date && HJ.calc.daysBetween(DAY1, last.date) > 0;
        msg = afterDay1
          ? 'One scan on record — need a second to show change.'
          : 'Baseline scan on record (' + esc(HJ.format.formatDayMonth(last.date)) + ') — awaiting the Day-30 scan.';
      }
      scanCard = '<div class="card">' + pending(msg) + '</div>';
    }

    // ---- 5. Intake vs target ----
    var t = rd.targets || {};
    // A9: denominator = days that carry a numeric self-rating (adherence.rated), NOT every
    // logged day — an un-rated day must not read as non-adherence.
    var adhRated = stats.adherence.rated;
    var adhPct = adhRated > 0 ? Math.round(stats.adherence.mostlyOrFully / adhRated * 100) : null;
    // Real logged intake — only counts days inside the report window (Day1..todayStr)
    // that actually have a mealsLog. Partial coverage is stated honestly, never implied
    // as complete.
    // Excludes "today" — a day still in progress isn't a complete day of intake,
    // same reasoning as doseTally's today-exclusion (calc.js) — averaging in a
    // partial day would misleadingly skew the figure.
    var intakeDays = logs.filter(function (l) {
      return l && Array.isArray(l.mealsLog) && l.mealsLog.length > 0 && l.date !== todayStr &&
        HJ.calc.daysBetween(DAY1, l.date) >= 0 && HJ.calc.daysBetween(l.date, todayStr) >= 0;
    });
    var loggedIntakeAvg = null;
    if (intakeDays.length) {
      var sums = intakeDays.reduce(function (acc, l) {
        var tot = HJ.calc.mealsLogTotals(l.mealsLog);
        acc.kcal += tot.kcal; acc.protein += tot.protein; acc.carbs += tot.carbs; acc.fat += tot.fat;
        return acc;
      }, { kcal: 0, protein: 0, carbs: 0, fat: 0 });
      var nDays = intakeDays.length;
      loggedIntakeAvg = { kcal: sums.kcal / nDays, protein: sums.protein / nDays, carbs: sums.carbs / nDays, fat: sums.fat / nDays, days: nDays };
    }
    var intakeCard = '<div class="card">' +
      row('Plan total <span style="color:var(--muted)">Dr Ola\'s</span>',
          (t.kcal != null ? t.kcal.toLocaleString('en-US') : '—') + ' <span style="color:var(--muted);font-weight:500">kcal</span>') +
      row('Protein / Carbs / Fat', 'P ' + num(t.protein, 0) + ' · C ' + num(t.carbs, 0) + ' · F ' + num(t.fat, 0) + ' <span style="color:var(--muted);font-weight:500">g</span>') +
      (t.fibre != null ? row('Fibre', num(t.fibre, 0) + ' <span style="color:var(--muted);font-weight:500">g</span>') : '') +
      (loggedIntakeAvg
        ? row('Actual (logged) <span style="color:var(--muted)">avg of ' + loggedIntakeAvg.days + ' logged day' + (loggedIntakeAvg.days === 1 ? '' : 's') + '</span>',
              Math.round(loggedIntakeAvg.kcal).toLocaleString('en-US') + ' <span style="color:var(--muted);font-weight:500">kcal · P ' + Math.round(loggedIntakeAvg.protein) + ' C ' + Math.round(loggedIntakeAvg.carbs) + ' F ' + Math.round(loggedIntakeAvg.fat) + '</span>')
        : '') +
      row('Adherence <span style="color:var(--muted)">self-rated</span>',
          adhPct != null
            ? '<span style="color:var(--muted)">mostly/fully ' + stats.adherence.mostlyOrFully + ' of ' + adhRated + ' rated day' + (adhRated === 1 ? '' : 's') + ' · ' + adhPct + '%</span>'
            : '<span style="color:var(--muted)">collecting…</span>') +
      (loggedIntakeAvg
        ? '<div class="flag" style="margin-top:10px">Logged for ' + loggedIntakeAvg.days + ' of ' + dayN + ' day' + (dayN === 1 ? '' : 's') + ' so far' + (loggedIntakeAvg.days < dayN ? ' — the rest have no meal record.' : '.') + ' "Actual" is a meal-by-meal calculated average, not a lab measurement.</div>'
        : '<div class="flag" style="margin-top:10px">This is the <b>planned</b> intake. The app does not track grams actually eaten — adherence above is A\'s own self-rating, not a measured calorie count.</div>') +
    '</div>';

    // ---- 6. Questions for Dr Ola — FIXED mechanical list (BP4) ----
    // Every line is a stated number. A line is omitted ONLY when its data is literally
    // absent (0 completed doses, <2 scans) — never because a value "looks fine". No
    // threshold, no interpretation, no advice.
    var q = [];
    if (dz.completed > 0) {
      q.push('Dose-correct rate: <b>' + Math.round(dz.rate * 100) + '%</b> (' + dz.incorrect + ' incorrect, ' + dz.missed + ' missed, ' + dz.unconfirmed + ' unconfirmed).');
    }
    if (rd.scans.available) {
      q.push('Muscle change: <b>' + signed(rd.scans.muscleKgDelta) + ' kg</b> vs baseline.');
      q.push('Fat mass change: <b>' + signed(rd.scans.fatKgDelta) + ' kg</b> vs baseline.');
    }
    var qCard = q.length
      ? '<div class="card"><ul class="items" style="margin:0">' + q.map(function (line) { return '<li>' + line + '</li>'; }).join('') + '</ul>' +
        '<div style="color:var(--muted);font-size:11.5px;margin-top:8px">Mechanical figures only — stated numbers, no interpretation.</div></div>'
      : '<div class="card">' + pending('No completed doses or scan pairs yet — figures appear as data accrues.') + '</div>';

    // ---- 7. Symptoms & how you felt ----
    var timeline = HJ.calc.feelingsTimeline(logs, DAY1);
    var highlights = HJ.calc.noteHighlights(logs, DAY1);
    var feelCard = '<div class="card">' + feelingsSection(timeline, highlights, dayN) + '</div>';

    // ---- Buttons: Print + Export (wired in app.js) ----
    var buttons =
      '<div class="btn-row" style="margin-top:16px">' +
        '<button class="btn btn-ghost" id="repExportBtn">⤓ Export data</button>' +
        '<button class="btn btn-primary" id="repPrintBtn">🖨 Print report</button>' +
      '</div>';

    return '<section class="view active" id="report">' +
      header +
      sectionHead(1, 'Weight', 'Eufy scale · 7-day averages') + weightCard +
      sectionHead(2, 'Dose-correctness', 'completed dose-due days') + doseCard +
      sectionHead(3, 'Side effects by day') + seCard +
      sectionHead(4, 'Body-scan change', 'Seca scale') + scanCard +
      sectionHead(5, 'Intake vs target') + intakeCard +
      sectionHead(6, 'Questions for Dr Ola') + qCard +
      sectionHead(7, 'Symptoms &amp; how you felt', 'from your daily taps') + feelCard +
      buttons +
    '</section>';
  }

  (self.HJ = self.HJ || {}).report = { render: render };
})();
