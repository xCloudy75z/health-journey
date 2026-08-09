// src/calc.js — pure day math. No new Date() inside pure paths except UTC-noon
// parsing of an explicit YYYY-MM-DD (deterministic; lint:pure allowlists this file's
// parseYMD helper via the // @impure-ok marker below).
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
  function dayNumber(dateStr, day1Str) { return daysBetween(day1Str, dateStr) + 1; }
  function countdownToDay30(dateStr, day1Str) {
    return Math.max(0, 30 - dayNumber(dateStr, day1Str));
  }
  return { daysBetween: daysBetween, dayNumber: dayNumber, countdownToDay30: countdownToDay30 };
});
