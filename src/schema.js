// src/schema.js — shared constants + factories. Pure.
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HJ = root.HJ || {}; root.HJ.schema = api;
})(typeof self !== 'undefined' ? self : this, function () {
  var APP_ID = 'health-journey';
  var SCHEMA_VERSION = 2;
  var DAY1 = '2026-08-10';
  // Dr Ola's daily plan totals (PROJECT_STATUS §14 — oatmeal-bread numbers). The app
  // never sets its own targets; these are hers, shown as-planned in the Day-30 report.
  var TARGETS = { kcal: 1729, protein: 145, carbs: 119, fat: 72, fibre: 17 };
  // The fixed quick-note vocabulary from the approved mockup (docs/mockups/2026-08-10-
  // app-improvements-mockup.html §3). Import validation rejects any tag outside this set.
  var ALLOWED_TAGS = ['Appetite way down', 'Queasy after pill', 'Slept well', 'Couldn\'t finish lunch', 'Bloated'];
  // dose: null = unset (default), or 'correct'|'incorrect'|'missed'
  function emptyDay(date) {
    return { date: date, weightKg: null, walkedMin: null, dose: null,
             sideEffects: null, adherence: null, note: '', updatedAt: null,
             feelings: { nausea: null, appetite: null, energy: null, bowels: null, tags: [] } };
  }
  function emptyState() {
    return { schemaVersion: SCHEMA_VERSION, dailyLogs: [], scans: [], meds: [], weekly: [], settings: {} };
  }
  return { APP_ID: APP_ID, SCHEMA_VERSION: SCHEMA_VERSION, DAY1: DAY1, TARGETS: TARGETS,
           ALLOWED_TAGS: ALLOWED_TAGS, emptyDay: emptyDay, emptyState: emptyState };
});
