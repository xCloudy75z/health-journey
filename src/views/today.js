// src/views/today.js — real Today view from live store data. Returns an HTML string.
// NOT pure (reads store), but does no time construction — todayStr is injected by app.js.
(function () {
  var ADH = ['Off', 'Partial', 'Mostly', 'Fully'];
  var SIDE = ['None', 'Mild', 'Disruptive', 'Stopped me'];

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  function trendSvg(points) {
    // points: array of numbers (weights), chronological, length >= 2
    var min = Math.min.apply(null, points), max = Math.max.apply(null, points);
    var span = (max - min) || 1;
    var x0 = 6, x1 = 314, y0 = 18, y1 = 100;
    var n = points.length;
    var xy = points.map(function (w, i) {
      var x = n === 1 ? x1 : x0 + (x1 - x0) * (i / (n - 1));
      var y = y1 - (y1 - y0) * ((w - min) / span);
      return [Math.round(x), Math.round(y)];
    });
    var line = xy.map(function (p, i) { return (i ? 'L' : 'M') + p[0] + ',' + p[1]; }).join(' ');
    var area = 'M' + xy[0][0] + ',116 ' + xy.map(function (p) { return 'L' + p[0] + ',' + p[1]; }).join(' ') + ' L' + xy[n - 1][0] + ',116 Z';
    var last = xy[n - 1];
    return '<svg class="trend" viewBox="0 0 320 120" preserveAspectRatio="none" aria-label="Weight trend">' +
      '<line class="grid" x1="0" y1="20" x2="320" y2="20"></line>' +
      '<line class="grid" x1="0" y1="60" x2="320" y2="60"></line>' +
      '<line class="grid" x1="0" y1="100" x2="320" y2="100"></line>' +
      '<path class="area" d="' + area + '"></path>' +
      '<path class="line" d="' + line + '"></path>' +
      '<circle class="dot" cx="' + last[0] + '" cy="' + last[1] + '" r="4"></circle>' +
    '</svg>';
  }

  function doseBits(d) {
    if (d === 'correct') return { cls: 'ok', t: '✓ dose correct' };
    if (d === 'incorrect') return { cls: 'no', t: '✗ dose incorrect' };
    if (d === 'missed') return { cls: 'no', t: '✗ dose missed' };
    return { cls: '', t: '· dose not logged' };
  }

  function recentRow(d, todayStr) {
    var db = doseBits(d.dose);
    var parts = [db.t];
    if (typeof d.walkedMin === 'number') parts.push('walked ' + HJ.format.formatInt(d.walkedMin) + 'm');
    if (typeof d.adherence === 'number' && ADH[d.adherence]) parts.push('plan: ' + ADH[d.adherence].toLowerCase());
    var w = typeof d.weightKg === 'number'
      ? '<div class="w">' + d.weightKg.toFixed(1) + '<span class="u">kg</span></div>'
      : '<div class="w" style="color:var(--muted);font-weight:600">—</div>';
    // BB9: each row carries its date and is tappable → app.js opens the log sheet for
    // that day (edit / backfill a past entry).
    return '<li class="row row-tap" data-date="' + esc(d.date) + '" role="button" tabindex="0">' +
      '<span class="ic">📅</span>' +
      '<div class="m"><div class="t">' + esc(HJ.format.formatDateShort(d.date, todayStr)) + '</div>' +
      '<div class="s tick ' + db.cls + '">' + esc(parts.join(' · ')) + '</div></div>' + w + '</li>';
  }

  function render(store, todayStr) {
    var DAY1 = HJ.schema.DAY1;
    var logs = store.allLogs();

    // Empty state
    if (!logs.length) {
      return '<section class="view active" id="today">' +
        '<div class="hero"><div class="lbl">Health Journey</div>' +
          '<div class="amt" style="font-size:34px">Let\'s begin</div>' +
          '<div class="sub">No entries yet — tap ＋ Log today to add your first day.</div></div>' +
        '<div class="card" style="margin-top:14px;text-align:center">' +
          '<div style="font-size:30px;margin-bottom:6px">📝</div>' +
          '<div style="font-weight:700">Log your first day</div>' +
          '<div style="color:var(--muted);font-size:13px;margin-top:6px">Weight, walk, medicine, how you felt. Stored on this phone.</div>' +
        '</div></section>';
    }

    var avg = HJ.calc.sevenDayAvg(logs, todayStr);
    var tally = HJ.calc.doseTally(logs, todayStr, DAY1);
    var dayN = HJ.calc.dayNumber(todayStr, DAY1);
    var countdown = HJ.calc.countdownToDay30(todayStr, DAY1);
    var today = store.getDay(todayStr) || {};

    // Hero
    var heroAmt, heroSub;
    if (avg.building) {
      heroAmt = 'Building <span class="u">' + avg.n + ' of 7</span>';
      heroSub = avg.n === 0 ? 'Log a weight to start your 7-day average.' : 'avg of ' + avg.n + ' reading' + (avg.n === 1 ? '' : 's') + ' so far';
    } else {
      heroAmt = HJ.format.formatKg(avg.avg).replace(' kg', '<span class="u">kg</span>');
      heroSub = 'avg of ' + avg.n + ' readings · last 7 days';
    }

    // Chips
    var chips = '';
    // BB2: correct-chip denominator = completed doses only. When nothing is completed
    // yet, suppress the chip and let the "need their dose confirmed" nudge speak instead.
    if (tally.completed > 0) {
      chips += '<span class="chip good"><span class="dot"></span>Dose correct ' + tally.correct + ' / ' + tally.completed + '</span>';
    }
    if (typeof today.walkedMin === 'number') chips += '<span class="chip"><span class="dot"></span>Walked ' + HJ.format.formatInt(today.walkedMin) + ' min today</span>';
    // BB10: 0 = an explicit "no side effects" (neutral chip); null = not logged (no chip);
    // >0 = amber severity chip (the one intentional health-signal colour).
    if (today.sideEffects === 0) chips += '<span class="chip"><span class="dot"></span>No side effects today</span>';
    else if (typeof today.sideEffects === 'number' && today.sideEffects > 0) chips += '<span class="chip warn"><span class="dot"></span>Side effects: ' + SIDE[today.sideEffects].toLowerCase() + '</span>';
    if (tally.unconfirmed > 0) chips += '<span class="chip"><span class="dot"></span>' + tally.unconfirmed + ' day' + (tally.unconfirmed === 1 ? '' : 's') + ' need their dose confirmed</span>';

    // Strip
    var day30 = HJ.format.formatDayMonth(HJ.calc.addDays(DAY1, 29));   // BB15: derived, not hardcoded
    var todayW = typeof today.weightKg === 'number' ? today.weightKg.toFixed(1) + ' kg' : '—';
    var pct = Math.max(0, Math.min(100, Math.round((dayN / 30) * 100)));
    var dayLabel = dayN >= 1 ? 'Day ' + dayN : 'Starts 10 Aug';
    var strip =
      '<div class="strip"><div class="strip-row">' +
        '<div><div class="strip-lbl">Dr Ola review</div><div class="strip-val">' + countdown + ' day' + (countdown === 1 ? '' : 's') + ' to go</div></div>' +
        '<div style="text-align:end"><div class="strip-lbl">Today</div><div class="strip-val">' + todayW + '</div></div>' +
      '</div><div class="strip-bar"><div style="width:' + pct + '%"></div></div>' +
      '<div class="strip-sub"><span>' + dayLabel + '</span><span>Day 30 · ' + day30 + '</span></div></div>';

    // Trend — BB13: same window as the hero (non-null weights in the trailing 7 calendar
    // days), so the graph and the 7-day average never disagree about which readings count.
    var weights = logs.filter(function (l) {
      return typeof l.weightKg === 'number' && HJ.calc.withinTrailing7(l.date, todayStr);
    }).map(function (l) { return l.weightKg; });
    var trend = weights.length >= 2
      ? '<div class="card">' + trendSvg(weights) +
          '<div class="trend-legend"><span><span class="sw"></span>Your weight (Eufy)</span><span>Neutral — no targets. Dr Ola sets the pace.</span></div></div>'
      : '<div class="card" style="text-align:center;color:var(--muted);font-size:13px">Not enough readings yet — log a couple more days.</div>';

    // Recent rows (most recent first, up to 5)
    var recent = logs.slice(-5).reverse().map(function (d) { return recentRow(d, todayStr); }).join('');

    return '<section class="view active" id="today">' +
      '<div class="hero"><div class="lbl">7-day average weight</div>' +
        '<div class="amt">' + heroAmt + '</div><div class="sub">' + esc(heroSub) + '</div></div>' +
      '<div class="chips"><span class="phase-pill">🟢 Phase 1 · medication + diet + walking</span></div>' +
      (chips ? '<div class="chips">' + chips + '</div>' : '') +
      strip +
      '<div class="section-h">Weight trend <span class="r">last 7 days</span></div>' + trend +
      '<div class="section-h">Recent days <span class="r">tap a day to edit</span></div>' +
      '<div class="card" style="padding:2px 14px"><ul class="rows">' + recent + '</ul></div>' +
      // BB11: backup is otherwise hidden behind the ⤓ glyph until the Report tab exists.
      '<div class="banner" style="margin-top:14px">💾 Back up weekly — tap ⤓ (top-right) to export your data.</div>' +
    '</section>';
  }

  // BP2: trendSvg is exported so trends.js reuses this exact neutral SVG (one source
  // of truth for colour discipline) instead of copy-pasting and risking drift.
  (self.HJ = self.HJ || {}).today = { render: render, trendSvg: trendSvg };
})();
