// src/validate.js — import/entry validation. Pure.
(function (root, factory) { var api = factory(root); if (typeof module!=='undefined'&&module.exports) module.exports=api; root.HJ=root.HJ||{}; root.HJ.validate=api; })(typeof self!=='undefined'?self:this, function (root) {
  var schema = (typeof module!=='undefined'&&module.exports) ? require('./schema.js') : root.HJ.schema;
  // BB3: a present field must be the right type; absent fields are allowed (merge fills them).
  function isNum(v) { return typeof v === 'number' && !isNaN(v); }
  function numOrNull(v) { return v === null || v === undefined || isNum(v); }
  function sevOrNull(v) { return v === null || v === undefined || (isNum(v) && v >= 0 && v <= 3); }
  function validateDay(d) {
    if (!d || typeof d !== 'object') return false;
    if (typeof d.date !== 'string') return false;
    if (!numOrNull(d.weightKg)) return false;
    if (!(d.dose === null || d.dose === undefined || d.dose === 'correct' || d.dose === 'incorrect' || d.dose === 'missed')) return false;
    if (!sevOrNull(d.sideEffects)) return false;
    if (!sevOrNull(d.adherence)) return false;
    if (!numOrNull(d.walkedMin)) return false;
    if (!(d.note === undefined || typeof d.note === 'string')) return false;
    return true;
  }
  function validateImport(p) {
    if (!p || typeof p !== 'object') return { ok: false, error: 'Not a valid backup file.' };
    if (p.app !== schema.APP_ID) return { ok: false, error: 'This backup is from a different app (' + (p.app || 'unknown') + '). Health Journey only imports its own backups.' };
    if (typeof p.schemaVersion !== 'number' || p.schemaVersion > schema.SCHEMA_VERSION) return { ok: false, error: 'This backup was made by a newer version.' };
    if (!p.state || !Array.isArray(p.state.dailyLogs)) return { ok: false, error: 'Backup is missing its data.' };
    // BB3: deep-check every day BEFORE any state mutation — a bad item must not brick the app.
    for (var i = 0; i < p.state.dailyLogs.length; i++) {
      if (!validateDay(p.state.dailyLogs[i])) return { ok: false, error: 'This backup has a damaged day entry and cannot be imported.' };
    }
    return { ok: true };
  }
  function validateEntry(e) { return e && typeof e.date === 'string'; }
  return { validateImport: validateImport, validateEntry: validateEntry };
});
