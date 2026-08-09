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
  return { formatKg: formatKg, formatSigned: formatSigned };
});
