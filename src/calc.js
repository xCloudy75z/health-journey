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
  return { daysBetween: daysBetween, dayNumber: dayNumber, countdownToDay30: countdownToDay30,
           sevenDayAvg: sevenDayAvg, doseTally: doseTally, addDays: addDays,
           withinTrailing7: withinTrailing7 };
});
