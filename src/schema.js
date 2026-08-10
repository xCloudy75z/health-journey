// src/schema.js — shared constants + factories. Pure.
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.HJ = root.HJ || {}; root.HJ.schema = api;
})(typeof self !== 'undefined' ? self : this, function () {
  var APP_ID = 'health-journey';
  var SCHEMA_VERSION = 1;
  var DAY1 = '2026-08-10';
  // Dr Ola's daily plan totals (PROJECT_STATUS §14 — oatmeal-bread numbers). The app
  // never sets its own targets; these are hers, shown as-planned in the Day-30 report.
  var TARGETS = { kcal: 1729, protein: 145, carbs: 119, fat: 72, fibre: 17 };
  // dose: null = unset (default), or 'correct'|'incorrect'|'missed'
  function emptyDay(date) {
    return { date: date, weightKg: null, walkedMin: null, dose: null,
             sideEffects: null, adherence: null, note: '' };
  }
  function emptyState() {
    return { schemaVersion: SCHEMA_VERSION, dailyLogs: [], scans: [], meds: [], weekly: [], settings: {} };
  }
  return { APP_ID: APP_ID, SCHEMA_VERSION: SCHEMA_VERSION, DAY1: DAY1, TARGETS: TARGETS, emptyDay: emptyDay, emptyState: emptyState };
});
