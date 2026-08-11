const { test } = require('node:test');
const assert = require('node:assert');
const { validateImport, validateDay } = require('../src/validate.js');

test('accepts a well-formed health-journey backup', () => {
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [] } }).ok, true);
});
test('rejects wrong app', () => { assert.strictEqual(validateImport({ app: 'spending-tracker', schemaVersion: 1, state: { dailyLogs: [] } }).ok, false); });
test('rejects a newer schema', () => { assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 99, state: { dailyLogs: [] } }).ok, false); });
test('rejects malformed', () => { assert.strictEqual(validateImport(null).ok, false); assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1 }).ok, false); });

// BB3 — deep validation of each dailyLogs item (a shallow check could brick the app).
test('rejects a dailyLogs item missing its date', () => {
  const res = validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [{ weightKg: 70 }] } });
  assert.strictEqual(res.ok, false);
});
test('rejects a null dailyLogs item', () => {
  const res = validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [null] } });
  assert.strictEqual(res.ok, false);
});
test('rejects a dailyLogs item with a wrong-typed field', () => {
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [{ date: '2026-08-10', weightKg: 'heavy' }] } }).ok, false);
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [{ date: '2026-08-10', dose: 'sometimes' }] } }).ok, false);
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [{ date: '2026-08-10', sideEffects: 9 }] } }).ok, false);
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [{ date: '2026-08-10', note: 123 }] } }).ok, false);
});
test('accepts a well-formed dailyLogs item with valid fields', () => {
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [{ date: '2026-08-10', weightKg: 70, dose: 'correct', sideEffects: 0, adherence: 3, walkedMin: 30, note: 'ok' }] } }).ok, true);
  // null-valued optional fields are allowed
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [{ date: '2026-08-10', weightKg: null, dose: null, sideEffects: null, adherence: null, walkedMin: null, note: '' }] } }).ok, true);
});

// A1 — a non-array scans/weekly/meds must be rejected before Report/Trends .slice() on it.
test('rejects a non-array scans / weekly / meds (A1)', () => {
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [], scans: {} } }).ok, false);
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [], scans: 'nope' } }).ok, false);
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [], weekly: 5 } }).ok, false);
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [], meds: {} } }).ok, false);
  // absent is fine; a real array is fine
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [], scans: [], weekly: [], meds: [] } }).ok, true);
});

// A2 — the date must match YYYY-MM-DD AND round-trip through the parser (rejects 2026-13-45).
test('rejects a malformed or impossible date (A2)', () => {
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [{ date: '2026-13-45' }] } }).ok, false, '2026-13-45 rolls over → reject');
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [{ date: '2026-02-30' }] } }).ok, false, 'Feb 30 does not exist → reject');
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [{ date: '8/10/2026' }] } }).ok, false, 'wrong format → reject');
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [{ date: '2026-8-10' }] } }).ok, false, 'unpadded → reject');
  assert.strictEqual(validateDay({ date: '2026-08-10' }), true, 'a real date round-trips');
});

// A7 — range checks on numeric fields.
test('rejects out-of-range weightKg / walkedMin / severity (A7)', () => {
  assert.strictEqual(validateDay({ date: '2026-08-10', weightKg: 500 }), false, 'weight > 400 → reject');
  assert.strictEqual(validateDay({ date: '2026-08-10', weightKg: 10 }), false, 'weight < 30 → reject');
  assert.strictEqual(validateDay({ date: '2026-08-10', weightKg: 109.5 }), true, 'in-range weight ok');
  assert.strictEqual(validateDay({ date: '2026-08-10', weightKg: null }), true, 'null weight ok');
  assert.strictEqual(validateDay({ date: '2026-08-10', walkedMin: -5 }), false, 'negative walk → reject');
  assert.strictEqual(validateDay({ date: '2026-08-10', walkedMin: 0 }), true, '0 walk ok');
  assert.strictEqual(validateDay({ date: '2026-08-10', sideEffects: 4 }), false, 'severity > 3 → reject');
  assert.strictEqual(validateDay({ date: '2026-08-10', adherence: -1 }), false, 'severity < 0 → reject');
  assert.strictEqual(validateDay({ date: '2026-08-10', dose: 'sometimes' }), false, 'dose off-enum → reject');
});

test('validateDay ACCEPTS a day with a full feelings object', () => {
  const d = { date: '2026-08-10', weightKg: null, walkedMin: null, dose: null,
    sideEffects: null, adherence: null, note: '', updatedAt: null,
    feelings: { nausea: 1, appetite: 0, energy: 2, bowels: 1, tags: ['Queasy after pill'] } };
  assert.strictEqual(validateDay(d), true);
});

test('validateDay ACCEPTS a day with feelings omitted (backwards compatible)', () => {
  const d = { date: '2026-08-10', weightKg: null, walkedMin: null, dose: null,
    sideEffects: null, adherence: null, note: '', updatedAt: null };
  assert.strictEqual(validateDay(d), true);
});

test('validateDay REJECTS an out-of-range feelings value', () => {
  const d = { date: '2026-08-10', weightKg: null, walkedMin: null, dose: null,
    sideEffects: null, adherence: null, note: '', updatedAt: null,
    feelings: { nausea: 4, appetite: null, energy: null, bowels: null, tags: [] } };
  assert.strictEqual(validateDay(d), false);
});

test('validateDay REJECTS an unknown tag', () => {
  const d = { date: '2026-08-10', weightKg: null, walkedMin: null, dose: null,
    sideEffects: null, adherence: null, note: '', updatedAt: null,
    feelings: { nausea: null, appetite: null, energy: null, bowels: null, tags: ['made up tag'] } };
  assert.strictEqual(validateDay(d), false);
});

test('validateDay REJECTS feelings.tags that is not an array', () => {
  const d = { date: '2026-08-10', weightKg: null, walkedMin: null, dose: null,
    sideEffects: null, adherence: null, note: '', updatedAt: null,
    feelings: { nausea: null, appetite: null, energy: null, bowels: null, tags: 'Bloated' } };
  assert.strictEqual(validateDay(d), false);
});
