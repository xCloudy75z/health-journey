// src/calc.js — pure day math. No wall-clock date construction inside pure paths;
// the only exception is UTC-noon parsing of an explicit YYYY-MM-DD (deterministic;
// lint:pure allowlists this file's parseYMD helper via the // @impure-ok marker below).
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HJ = root.HJ || {}; root.HJ.calc = api;
})(typeof self !== 'undefined' ? self : this, function () {
  // Parse 'YYYY-MM-DD' to a UTC-noon epoch (noon avoids DST/offset day-flips).
  function parseYMD(s) { // @impure-ok: deterministic parse of an explicit date string
    var p = s.split('-');
    return Date.UTC(+p[0], +p[1] - 1, +p[2], 12, 0, 0);
  }
  var DAY_MS = 86400000;
  function daysBetween(a, b) { return Math.round((parseYMD(b) - parseYMD(a)) / DAY_MS); }
  // BB15: derive a calendar date N days after an explicit YYYY-MM-DD (deterministic).
  function addDays(dateStr, n) {
    var d = new Date(parseYMD(dateStr) + n * DAY_MS); // @impure-ok: arithmetic on a deterministic epoch
    return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
  }
  function dayNumber(dateStr, day1Str) { return daysBetween(day1Str, dateStr) + 1; }
  function countdownToDay30(dateStr, day1Str) {
    return Math.max(0, 30 - dayNumber(dateStr, day1Str));
  }
  function withinTrailing7(dateStr, todayStr) {
    var d = daysBetween(dateStr, todayStr);   // today - date
    return d >= 0 && d <= 6;
  }
  function sevenDayAvg(logs, todayStr) {
    var vals = logs.filter(function (l) {
      return l && typeof l.weightKg === 'number' && withinTrailing7(l.date, todayStr);
    }).map(function (l) { return l.weightKg; });
    var n = vals.length;
    if (n < 3) return { avg: null, n: n, building: true };
    var sum = vals.reduce(function (a, b) { return a + b; }, 0);
    return { avg: sum / n, n: n, building: false };
  }
  function doseTally(logs, todayStr, day1Str) {
    // BB2: rate is over COMPLETED doses only (correct+incorrect+missed). Unconfirmed
    // past days are reported separately as a nudge, never as a failed dose. `due`
    // (all past days that should carry a dose) and `completed` are both reported.
    var t = { correct: 0, incorrect: 0, missed: 0, unconfirmed: 0, due: 0, completed: 0, rate: null };
    logs.forEach(function (l) {
      if (!l) return;
      if (daysBetween(day1Str, l.date) < 0) return;   // before Day 1
      if (l.date === todayStr) return;                 // today not over → excluded
      if (daysBetween(l.date, todayStr) < 0) return;   // future
      t.due++;
      if (l.dose === 'correct') t.correct++;
      else if (l.dose === 'incorrect') t.incorrect++;
      else if (l.dose === 'missed') t.missed++;
      else t.unconfirmed++;                            // null/unset past day
    });
    t.completed = t.correct + t.incorrect + t.missed;
    t.rate = t.completed > 0 ? t.correct / t.completed : null;
    return t;
  }
  // B5: overall/weekly-review aggregates from the on-device daily logs. Pure — no
  // wall-clock reads. netWeightChange is all-time (first→latest non-null weight),
  // NOT weekly; the view labels it "since Day 1" so it can't read as contradicting
  // the 7-day average (BP5). Empty/sparse logs yield null (never NaN).
  function logStats(logs) {
    var sorted = logs.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    var weights = sorted.filter(function (l) { return typeof l.weightKg === 'number'; });
    var walkedDays = 0, walkedTotalMin = 0, mostlyOrFully = 0, adherenceRated = 0, worst = 0;
    sorted.forEach(function (l) {
      if (typeof l.walkedMin === 'number' && l.walkedMin > 0) { walkedDays++; walkedTotalMin += l.walkedMin; }
      // A9: `rated` is the true adherence denominator — days that actually carry a numeric
      // self-rating. An un-rated day must not read as non-adherence (that's what daysLogged did).
      if (typeof l.adherence === 'number') { adherenceRated++; if (l.adherence >= 2) mostlyOrFully++; }
      if (typeof l.sideEffects === 'number' && l.sideEffects > worst) worst = l.sideEffects;
    });
    var first = weights.length ? weights[0].weightKg : null;
    var last = weights.length ? weights[weights.length - 1].weightKg : null;
    return {
      daysLogged: sorted.length,
      weighIns: weights.length,
      walkedDays: walkedDays,
      walkedTotalMin: walkedTotalMin,
      adherence: { mostlyOrFully: mostlyOrFully, rated: adherenceRated },
      sideEffects: { worst: worst },
      firstWeight: first,
      latestWeight: last,
      netWeightChange: (first != null && last != null) ? (last - first) : null
    };
  }
  // B6: Day-30 report assembly. Pure — no wall-clock reads; every window is derived
  // from the explicit day1Str/todayStr passed in. Assembles the six report figures.
  function inWindow(dateStr, startStr, endStr) {
    return daysBetween(startStr, dateStr) >= 0 && daysBetween(dateStr, endStr) >= 0;
  }
  function windowAvg(logs, startStr, endStr) {
    var vals = logs.filter(function (l) {
      return l && typeof l.weightKg === 'number' && inWindow(l.date, startStr, endStr);
    }).map(function (l) { return l.weightKg; });
    if (!vals.length) return { avg: null, n: 0 };
    return { avg: vals.reduce(function (a, b) { return a + b; }, 0) / vals.length, n: vals.length };
  }
  function percentChange(from, to) {
    if (typeof from !== 'number' || typeof to !== 'number' || from === 0) return null;
    return (to - from) / from * 100;
  }
  function reportData(logs, scans, targets, todayStr, day1Str) {
    var w1s = day1Str, w1e = addDays(day1Str, 6);              // Day 1..7
    var w4s = addDays(day1Str, 23), w4e = addDays(day1Str, 29); // Day 24..30 — trailing 7 to the review (BP2)
    var week1 = windowAvg(logs, w1s, w1e), week4 = windowAvg(logs, w4s, w4e);
    var deltaKg = (week1.avg != null && week4.avg != null) ? (week4.avg - week1.avg) : null;
    var deltaPct = (week1.avg != null && week4.avg != null) ? percentChange(week1.avg, week4.avg) : null;
    var dose = doseTally(logs, todayStr, day1Str);
    var sideEffectsByDay = logs.filter(function (l) { return l && typeof l.sideEffects === 'number'; })
      .map(function (l) { return { day: dayNumber(l.date, day1Str), level: l.sideEffects }; })
      .sort(function (a, b) { return a.day - b.day; });
    // BP1: Seca scans are snake_case on disk. BP3: date-sort before choosing endpoints.
    var sc = (Array.isArray(scans) ? scans.slice() : []).sort(function (x, y) {
      return x.date < y.date ? -1 : x.date > y.date ? 1 : 0;
    });
    var scanInfo = { available: sc.length >= 2 };
    if (scanInfo.available) {
      var a = sc[0], b = sc[sc.length - 1];
      scanInfo.fatPctDelta = b.fat_mass_percent - a.fat_mass_percent;
      scanInfo.fatKgDelta = b.fat_mass_kg - a.fat_mass_kg;
      scanInfo.muscleKgDelta = b.skeletal_muscle_kg - a.skeletal_muscle_kg;
      scanInfo.visceralDelta = (b.visceral_fat != null && a.visceral_fat != null) ? (b.visceral_fat - a.visceral_fat) : null;
      scanInfo.from = a.date; scanInfo.to = b.date;
    }
    return {
      week1: week1, week4: week4, weightDeltaKg: deltaKg, weightDeltaPct: deltaPct,
      dose: dose, sideEffectsByDay: sideEffectsByDay, scans: scanInfo, targets: targets || {},
      daysLogged: logs.length
    };
  }
  // Bundle 8: nausea-by-day timeline + free-text highlights for the report's
  // "Symptoms & how you felt" section. Both mirror sideEffectsByDay's shape/sort.
  function feelingsTimeline(logs, day1Str) {
    return logs.filter(function (l) { return l && l.feelings && typeof l.feelings.nausea === 'number'; })
      .map(function (l) { return { day: dayNumber(l.date, day1Str), nausea: l.feelings.nausea }; })
      .sort(function (a, b) { return a.day - b.day; });
  }
  function noteHighlights(logs, day1Str) {
    return logs.filter(function (l) { return l && typeof l.note === 'string' && l.note.trim() !== ''; })
      .map(function (l) { return { day: dayNumber(l.date, day1Str), note: l.note }; })
      .sort(function (a, b) { return a.day - b.day; });
  }
  return { daysBetween: daysBetween, dayNumber: dayNumber, countdownToDay30: countdownToDay30,
           sevenDayAvg: sevenDayAvg, doseTally: doseTally, addDays: addDays,
           withinTrailing7: withinTrailing7, logStats: logStats,
           windowAvg: windowAvg, percentChange: percentChange, reportData: reportData,
           feelingsTimeline: feelingsTimeline, noteHighlights: noteHighlights };
});
