// src/validate.js — import/entry validation. Pure.
(function (root, factory) { var api = factory(root); if (typeof module!=='undefined'&&module.exports) module.exports=api; root.HJ=root.HJ||{}; root.HJ.validate=api; })(typeof self!=='undefined'?self:this, function (root) {
  var schema = (typeof module!=='undefined'&&module.exports) ? require('./schema.js') : root.HJ.schema;
  function validateImport(p) {
    if (!p || typeof p !== 'object') return { ok: false, error: 'Not a valid backup file.' };
    if (p.app !== schema.APP_ID) return { ok: false, error: 'This backup is from a different app (' + (p.app || 'unknown') + '). Health Journey only imports its own backups.' };
    if (typeof p.schemaVersion !== 'number' || p.schemaVersion > schema.SCHEMA_VERSION) return { ok: false, error: 'This backup was made by a newer version.' };
    if (!p.state || !Array.isArray(p.state.dailyLogs)) return { ok: false, error: 'Backup is missing its data.' };
    return { ok: true };
  }
  function validateEntry(e) { return e && typeof e.date === 'string'; }
  return { validateImport: validateImport, validateEntry: validateEntry };
});
