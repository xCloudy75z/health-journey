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

  function createStore(storage, nowFn) {
    var now = typeof nowFn === 'function' ? nowFn : function () { return new Date().toISOString(); }; // @impure-ok: default real-clock fallback; tests always inject nowFn
    var state;
    try {
      var raw = storage.getItem(KEY);
      state = raw ? JSON.parse(raw) : schema.emptyState();
    } catch (e) { state = schema.emptyState(); }
    if (!state || typeof state !== 'object' || !Array.isArray(state.dailyLogs)) state = schema.emptyState();

    // BB14: a failed setItem (quota/private-mode) must not throw out of a handler.
    // Data is tiny for B2 — swallow and warn; the in-memory state is still correct.
    function persist() {
      try { storage.setItem(KEY, JSON.stringify(state)); }
      catch (e) { if (typeof console !== 'undefined' && console.warn) console.warn('Health Journey: could not save to storage', e); }
    }

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
      // A8: only a real value overwrites. An explicit null (or undefined) in a partial
      // must NOT wipe a populated field — the field-level merge preserves the prior value.
      for (var p in partial) if (partial.hasOwnProperty(p) && partial[p] !== undefined && partial[p] !== null) merged[p] = partial[p];
      merged.updatedAt = now();   // Bundle 8: every save (chat or tap-in) re-stamps recency
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
      var incoming = clone(migrated.state);   // deep-clone: never share a reference with the imported payload
      // A7: de-duplicate the INCOMING dailyLogs by date (last wins) before merging it
      // against local state — unchanged from the prior replace-based behavior.
      if (Array.isArray(incoming.dailyLogs)) {
        var byDate = {}, order = [];
        for (var i = 0; i < incoming.dailyLogs.length; i++) {
          var day = incoming.dailyLogs[i], dt = day && day.date;
          if (!byDate.hasOwnProperty(dt)) order.push(dt);
          byDate[dt] = day;
        }
        incoming.dailyLogs = order.map(function (dt) { return byDate[dt]; });
      } else {
        incoming.dailyLogs = [];
      }
      // Bundle 8: merge dailyLogs by date, most-recent updatedAt wins per day. A date
      // absent from the incoming payload is left untouched — an import only ADDS/UPDATES
      // days it knows about, it never deletes. scans/weekly/meds/settings are NOT part of
      // this merge — their pre-existing full-replace-when-present behavior falls out of the
      // `state = incoming` assignment below; no separate merge step exists or is needed for them.
      var mergedByDate = {}, mergedOrder = [];
      state.dailyLogs.forEach(function (d) {
        if (!mergedByDate.hasOwnProperty(d.date)) mergedOrder.push(d.date);
        mergedByDate[d.date] = d;
      });
      incoming.dailyLogs.forEach(function (d) {
        var existing = mergedByDate[d.date];
        if (!existing) { mergedOrder.push(d.date); mergedByDate[d.date] = d; return; }
        var incomingWins = !!d.updatedAt && (!existing.updatedAt || d.updatedAt > existing.updatedAt);
        if (incomingWins) mergedByDate[d.date] = d;
      });
      incoming.dailyLogs = mergedOrder.map(function (dt) { return mergedByDate[dt]; });
      state = incoming;
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
