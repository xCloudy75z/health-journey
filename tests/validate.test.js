const { test } = require('node:test');
const assert = require('node:assert');
const { validateImport } = require('../src/validate.js');

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
