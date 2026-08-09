// src/format.js — pure display helpers.
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HJ = root.HJ || {}; root.HJ.format = api;
})(typeof self !== 'undefined' ? self : this, function () {
  function isNum(n) { return typeof n === 'number' && !isNaN(n); }
  function formatKg(n) { return isNum(n) ? n.toFixed(1) + ' kg' : '—'; }
  function formatSigned(n) {
    if (!isNum(n)) return '—';
    if (n === 0) return '0.0';
    return (n > 0 ? '+' : '−') + Math.abs(n).toFixed(1);
  }
  var WD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function formatInt(n){ return isNum(n) ? String(Math.round(n)) : '—'; }
  function ymd(s){ var p=s.split('-'); return new Date(Date.UTC(+p[0],+p[1]-1,+p[2],12)); } // @impure-ok deterministic parse of an explicit date string
  function formatDateShort(dateStr, todayStr){
    if (dateStr===todayStr) return 'Today';
    var d=ymd(dateStr); return WD[d.getUTCDay()]+' · '+d.getUTCDate()+' '+MO[d.getUTCMonth()];
  }
  // BB15: day + month only (e.g. "8 Sep"), for the derived Day-30 label.
  function formatDayMonth(dateStr){ var d=ymd(dateStr); return d.getUTCDate()+' '+MO[d.getUTCMonth()]; }
  return { formatKg: formatKg, formatSigned: formatSigned, formatInt: formatInt, formatDateShort: formatDateShort, formatDayMonth: formatDayMonth };
});
