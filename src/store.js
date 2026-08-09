// src/store.js — on-device data layer over an injected storage (localStorage in prod).
// Pure w.r.t. time/rng (none used). Field-level MERGE: absent keys never overwrite.
(function (root, factory) {
  var deps = (typeof module !== 'undefined' && module.exports)
    ? { schema: require('./schema.js'), validate: require('./validate.js'), migrate: require('./migrate.js') }
    : { schema: root.HJ.schema, validate: root.HJ.validate, migrate: root.HJ.migrate };
  var api = factory(deps);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HJ = root.HJ || {}; root.HJ.store = api;
})(typeof self !== 'undefined' ? self : this, function (deps) {
  var KEY = 'health-journey:state';
  var schema = deps.schema;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function createStore(storage) {
    var state;
    try {
      var raw = storage.getItem(KEY);
      state = raw ? JSON.parse(raw) : schema.emptyState();
    } catch (e) { state = schema.emptyState(); }
    if (!state || typeof state !== 'object' || !Array.isArray(state.dailyLogs)) state = schema.emptyState();

    function persist() { storage.setItem(KEY, JSON.stringify(state)); }

    function getDay(date) {
      var found = state.dailyLogs.filter(function (d) { return d.date === date; })[0];
      return found ? found : null;
    }
    function setDay(date, partial) {
      var idx = -1, i;
      for (i = 0; i < state.dailyLogs.length; i++) { if (state.dailyLogs[i].date === date) { idx = i; break; } }
      var base = idx >= 0 ? state.dailyLogs[idx] : schema.emptyDay(date);
      var merged = {};
      for (var k in base) if (base.hasOwnProperty(k)) merged[k] = base[k];
      for (var p in partial) if (partial.hasOwnProperty(p) && partial[p] !== undefined) merged[p] = partial[p];
      merged.date = date;
      if (idx >= 0) state.dailyLogs[idx] = merged; else state.dailyLogs.push(merged);
      persist();
      return merged;
    }
    function allLogs() {
      return state.dailyLogs.slice().sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
    }
    function exportPayload(nowISO) {
      return { app: schema.APP_ID, schemaVersion: schema.SCHEMA_VERSION, exportedAt: nowISO, state: state };
    }
    function importPayload(payload) {
      var v = deps.validate.validateImport(payload);
      if (!v.ok) return { ok: false, error: v.error };
      var migrated = deps.migrate.migrate(payload);
      state = clone(migrated.state);   // deep-clone: never share a reference with the imported payload
      persist();
      return { ok: true };
    }
    function snapshot() { return clone(state); }
    function restore(snap) { state = clone(snap); persist(); }
    function getState() { return state; }

    return { getDay: getDay, setDay: setDay, allLogs: allLogs,
             exportPayload: exportPayload, importPayload: importPayload,
             snapshot: snapshot, restore: restore, getState: getState };
  }
  return { createStore: createStore, KEY: KEY };
});
