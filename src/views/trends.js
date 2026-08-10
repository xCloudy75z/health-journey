// src/views/trends.js — Trends tab: a read-only weekly/overall review computed from the
// on-device daily logs. Combines calc.sevenDayAvg + calc.doseTally + calc.logStats.
// NOT pure (reads store), no time construction — todayStr is injected by app.js.
// Never plays doctor: weight, trend and net-change are shown NEUTRALLY (no red/amber,
// no "too slow"). Only the dose row and the side-effect row carry the one intentional
// health-signal colour. No name, no age.
(function () {
  var SIDE = ['None', 'Mild', 'Disruptive', 'Stopped me'];

  // .rep-line rollup row (same markup the Guides money/summary rows use).
  function row(k, v, vStyle) {
    return '<div class="rep-line"><span class="k">' + k + '</span>' +
      '<span class="v"' + (vStyle ? ' style="' + vStyle + '"' : '') + '>' + v + '</span></div>';
  }

  // BP3: never assume state.weekly exists (older/imported state may omit it). Latest
  // entry that actually carries a numeric waistCm wins; empty → "not measured yet".
  function latestWaist(store) {
    // A1: a non-array weekly (from a damaged import) must not crash .slice()/.sort() here.
    var raw = store.getState().weekly;
    var weekly = (Array.isArray(raw) ? raw : []).slice().sort(function (a, b) {
      return (a.date || '') < (b.date || '') ? -1 : (a.date || '') > (b.date || '') ? 1 : 0;
    });
    for (var i = weekly.length - 1; i >= 0; i--) {
      if (weekly[i] && typeof weekly[i].waistCm === 'number') return weekly[i].waistCm;
    }
    return null;
  }

  function render(store, todayStr) {
    var DAY1 = HJ.schema.DAY1;
    var logs = store.allLogs();

    // Empty state — nothing logged yet.
    if (!logs.length) {
      return '<section class="view active" id="trends">' +
        '<div class="section-h" style="margin-top:8px">Weekly review</div>' +
        '<div class="card" style="margin-top:8px;text-align:center">' +
          '<div style="font-size:30px;margin-bottom:6px">📈</div>' +
          '<div style="font-weight:700">Nothing to review yet</div>' +
          '<div style="color:var(--muted);font-size:13px;margin-top:6px">Log a few days and your weekly review — weight trend, walking, dose and how you felt — builds itself here.</div>' +
        '</div></section>';
    }

    var stats = HJ.calc.logStats(logs);
    var avg = HJ.calc.sevenDayAvg(logs, todayStr);
    var tally = HJ.calc.doseTally(logs, todayStr, DAY1);
    var dayN = Math.max(1, HJ.calc.dayNumber(todayStr, DAY1));
    // A14: cap the week label at 4 so it agrees with the Report, whose final window (Day
    // 24–30) is framed as "week 4". Uncapped, Day 29–30 would read "Week 5" and drift.
    var weekN = Math.min(4, Math.floor((dayN - 1) / 7) + 1);

    // ---- Weight card: 7-day average + neutral net-change + neutral trend ----
    var avgLine;
    if (avg.building) {
      avgLine = 'Building <span class="u">' + avg.n + ' of 7</span>';
    } else {
      avgLine = HJ.format.formatKg(avg.avg).replace(' kg', '<span class="u">kg</span>');
    }
    // BP5: netWeightChange is all-time (first→latest), labelled "since Day 1" — never
    // "this week" — so it can't read as contradicting the 7-day average. Muted, never
    // red/amber: the app does not judge the pace (that's Dr Ola's call).
    var netStr = HJ.format.formatSigned(stats.netWeightChange);
    var netHtml = stats.netWeightChange != null
      ? '<div class="rep-line"><span class="k">Net change <span style="color:var(--muted)">since Day 1</span></span>' +
        '<span class="v" style="color:var(--muted)">' + netStr + ' kg</span></div>'
      : '<div class="rep-line"><span class="k">Net change <span style="color:var(--muted)">since Day 1</span></span>' +
        '<span class="v" style="color:var(--muted)">—</span></div>';

    // Trend — reuse today.js's exact neutral SVG (BP2) over the trailing-7 non-null
    // weights, so the graph and the 7-day average agree on which readings count.
    var weights = logs.filter(function (l) {
      return typeof l.weightKg === 'number' && HJ.calc.withinTrailing7(l.date, todayStr);
    }).map(function (l) { return l.weightKg; });
    var trend = weights.length >= 2
      ? HJ.today.trendSvg(weights) +
        '<div class="trend-legend"><span><span class="sw"></span>Your weight (Eufy)</span><span>Neutral — no targets. Dr Ola sets the pace.</span></div>'
      : '<div style="text-align:center;color:var(--muted);font-size:13px;padding:6px 0">Collecting weigh-ins — log a couple more days and the trend appears here.</div>';

    var weightCard = '<div class="card">' +
      '<div class="rep-line"><span class="k">7-day average <span style="color:var(--muted)">last 7 days</span></span>' +
        '<span class="v">' + avgLine + '</span></div>' +
      netHtml +
      '<div style="margin-top:10px">' + trend + '</div>' +
    '</div>';

    // ---- Rollup card: waist · dose · walking · plan · side effects ----
    var waist = latestWaist(store);
    var waistV = waist != null ? waist.toFixed(1) + ' cm' : '<span style="color:var(--muted)">not measured yet</span>';

    // BP4: dose uses the COMPLETED denominator (matching the B2 fix), not `due`. When
    // nothing is completed yet (likely on Day 1) suppress the "X / Y" line and show a
    // neutral collecting note instead of a misleading 0 / 0.
    var doseV;
    if (tally.completed > 0) {
      doseV = '<span style="color:var(--good)">' + tally.correct + ' / ' + tally.completed + '</span> completed';
    } else {
      doseV = '<span style="color:var(--muted)">collecting…</span>';
    }

    var worst = stats.sideEffects.worst;
    var sideLabel = SIDE[worst] || 'None';
    var sideV = worst > 0
      ? '<span style="color:var(--warn)">' + sideLabel + '</span>'
      : '<span style="color:var(--muted)">' + sideLabel + '</span>';

    var rollup = '<div class="card">' +
      '<div class="section-h" style="margin:0 0 8px">So far</div>' +
      row('Waist', waistV) +
      row('Dose correct', doseV) +
      row('Walking', stats.walkedDays + ' day' + (stats.walkedDays === 1 ? '' : 's') + ' · ' + stats.walkedTotalMin + ' min') +
      row('Plan followed', 'mostly/fully ' + stats.adherence.mostlyOrFully + ' of ' + stats.adherence.rated) +
      row('Side effects', sideV + ' <span style="color:var(--muted)">worst so far</span>') +
    '</div>';

    // ---- Neutral "so far" banner: purely factual, no judgement ----
    var banner = '<div class="banner" style="margin-top:14px">🌱 You\'ve logged ' +
      stats.daysLogged + ' day' + (stats.daysLogged === 1 ? '' : 's') + ' and walked ' +
      stats.walkedTotalMin + ' minute' + (stats.walkedTotalMin === 1 ? '' : 's') + ' so far.</div>';

    return '<section class="view active" id="trends">' +
      '<div class="section-h" style="margin-top:8px">Weekly review <span class="r">Week ' + weekN + ' · Day ' + dayN + '</span></div>' +
      '<div class="section-h">Weight <span class="r">neutral — Dr Ola sets the pace</span></div>' + weightCard +
      rollup +
      banner +
    '</section>';
  }

  (self.HJ = self.HJ || {}).trends = { render: render };
})();
