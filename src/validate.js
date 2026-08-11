// src/validate.js — import/entry validation. Pure.
(function (root, factory) { var api = factory(root); if (typeof module!=='undefined'&&module.exports) module.exports=api; root.HJ=root.HJ||{}; root.HJ.validate=api; })(typeof self!=='undefined'?self:this, function (root) {
  var schema = (typeof module!=='undefined'&&module.exports) ? require('./schema.js') : root.HJ.schema;
  // BB3: a present field must be the right type; absent fields are allowed (merge fills them).
  function isNum(v) { return typeof v === 'number' && !isNaN(v) && isFinite(v); }
  function sevOrNull(v) { return v === null || v === undefined || (isNum(v) && v >= 0 && v <= 3); }
  // Bundle 8: feelings is optional; when present, each 0-3 scale uses the same
  // sevOrNull rule as sideEffects/adherence, and tags must be drawn from the fixed set.
  function validFeelings(f) {
    if (f === null || f === undefined) return true;
    if (typeof f !== 'object') return false;
    if (!sevOrNull(f.nausea) || !sevOrNull(f.appetite) || !sevOrNull(f.energy) || !sevOrNull(f.bowels)) return false;
    if (f.tags === undefined) return true;
    if (!Array.isArray(f.tags)) return false;
    for (var i = 0; i < f.tags.length; i++) {
      if (schema.ALLOWED_TAGS.indexOf(f.tags[i]) === -1) return false;
    }
    return true;
  }
  // A2: a date must match YYYY-MM-DD AND round-trip through the same UTC-noon parser calc
  // uses — so an impossible date (2026-13-45, 2026-02-30) that silently rolls over is
  // rejected instead of corrupting the day / dose figures downstream.
  function validYMD(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var p = s.split('-'), y = +p[0], m = +p[1], d = +p[2];
    var dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)); // @impure-ok: deterministic round-trip check of an explicit date string
    return dt.getUTCFullYear() === y && (dt.getUTCMonth() + 1) === m && dt.getUTCDate() === d;
  }
  function validateDay(d) {
    if (!d || typeof d !== 'object') return false;
    if (!validYMD(d.date)) return false;                                     // A2
    // A7: weightKg, when present/non-null, must be a finite reading in 30–400 kg.
    if (!(d.weightKg === null || d.weightKg === undefined || (isNum(d.weightKg) && d.weightKg >= 30 && d.weightKg <= 400))) return false;
    if (!(d.dose === null || d.dose === undefined || d.dose === 'correct' || d.dose === 'incorrect' || d.dose === 'missed')) return false;
    if (!sevOrNull(d.sideEffects)) return false;                             // A7: 0–3
    if (!sevOrNull(d.adherence)) return false;                               // A7: 0–3
    // A7: walkedMin, when present/non-null, must be a finite non-negative number of minutes.
    if (!(d.walkedMin === null || d.walkedMin === undefined || (isNum(d.walkedMin) && d.walkedMin >= 0))) return false;
    if (!(d.note === undefined || typeof d.note === 'string')) return false;
    if (!validFeelings(d.feelings)) return false;                       // Bundle 8
    return true;
  }
  function validateImport(p) {
    if (!p || typeof p !== 'object') return { ok: false, error: 'Not a valid backup file.' };
    if (p.app !== schema.APP_ID) return { ok: false, error: 'This backup is from a different app (' + (p.app || 'unknown') + '). Health Journey only imports its own backups.' };
    if (typeof p.schemaVersion !== 'number' || p.schemaVersion > schema.SCHEMA_VERSION) return { ok: false, error: 'This backup was made by a newer version.' };
    if (!p.state || !Array.isArray(p.state.dailyLogs)) return { ok: false, error: 'Backup is missing its data.' };
    // A1: scans/weekly/meds are optional, but if present they MUST be arrays — Report
    // (scan sort) and Trends (weekly sort) call .slice()/.sort() on them and a non-array
    // would crash the view. Reject before any state mutation.
    var COLLECTIONS = ['scans', 'weekly', 'meds'];
    for (var c = 0; c < COLLECTIONS.length; c++) {
      var key = COLLECTIONS[c];
      if (p.state[key] !== undefined && p.state[key] !== null && !Array.isArray(p.state[key])) {
        return { ok: false, error: 'This backup has a damaged ' + key + ' list and cannot be imported.' };
      }
    }
    // BB3: deep-check every day BEFORE any state mutation — a bad item must not brick the app.
    for (var i = 0; i < p.state.dailyLogs.length; i++) {
      if (!validateDay(p.state.dailyLogs[i])) return { ok: false, error: 'This backup has a damaged day entry and cannot be imported.' };
    }
    return { ok: true };
  }
  function validateEntry(e) { return e && typeof e.date === 'string'; }
  return { validateImport: validateImport, validateDay: validateDay, validateEntry: validateEntry };
});
