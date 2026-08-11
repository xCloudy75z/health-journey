const { test } = require('node:test');
const assert = require('node:assert');
const { migrate } = require('../src/migrate.js');

test('migrate backfills updatedAt:null on dailyLogs entries that lack it', () => {
  const payload = { app: 'health-journey', schemaVersion: 1,
    state: { dailyLogs: [{ date: '2026-08-10', weightKg: 109.5 }], scans: [], weekly: [], meds: [], settings: {} } };
  const { state } = migrate(payload);
  assert.strictEqual(state.dailyLogs[0].updatedAt, null);
  assert.strictEqual(state.dailyLogs[0].weightKg, 109.5, 'other fields untouched');
});

test('migrate leaves an existing updatedAt alone', () => {
  const payload = { app: 'health-journey', schemaVersion: 2,
    state: { dailyLogs: [{ date: '2026-08-10', weightKg: 109.5, updatedAt: '2026-08-10T06:00:00.000Z' }] } };
  const { state } = migrate(payload);
  assert.strictEqual(state.dailyLogs[0].updatedAt, '2026-08-10T06:00:00.000Z');
});

test('migrate does not mutate the input payload object', () => {
  const day = { date: '2026-08-10', weightKg: 109.5 };
  const payload = { app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [day] } };
  migrate(payload);
  assert.strictEqual('updatedAt' in day, false, 'the original object passed in was not mutated');
});

test('migrate is a no-op when state or dailyLogs is missing', () => {
  const { state } = migrate({ app: 'health-journey', schemaVersion: 1, state: {} });
  assert.deepStrictEqual(state, {});
});

test('migrate backfills mealsLog:[] on dailyLogs entries that lack it', () => {
  const payload = { app: 'health-journey', schemaVersion: 2,
    state: { dailyLogs: [{ date: '2026-08-10', weightKg: 109.5, updatedAt: '2026-08-10T06:00:00.000Z' }] } };
  const { state } = migrate(payload);
  assert.deepStrictEqual(state.dailyLogs[0].mealsLog, []);
  assert.strictEqual(state.dailyLogs[0].weightKg, 109.5, 'other fields untouched');
});

test('migrate leaves an existing mealsLog alone', () => {
  const existing = [{ label: 'Lunch', description: 'x', kcal: 500, protein: 40, carbs: 40, fat: 10 }];
  const payload = { app: 'health-journey', schemaVersion: 3,
    state: { dailyLogs: [{ date: '2026-08-10', weightKg: 109.5, updatedAt: '2026-08-10T06:00:00.000Z', mealsLog: existing }] } };
  const { state } = migrate(payload);
  assert.deepStrictEqual(state.dailyLogs[0].mealsLog, existing);
});

test('migrate backfills BOTH updatedAt and mealsLog on a v1 day missing both', () => {
  const payload = { app: 'health-journey', schemaVersion: 1,
    state: { dailyLogs: [{ date: '2026-08-10', weightKg: 109.5 }] } };
  const { state } = migrate(payload);
  assert.strictEqual(state.dailyLogs[0].updatedAt, null);
  assert.deepStrictEqual(state.dailyLogs[0].mealsLog, []);
});

test('migrate still does not mutate the input payload object', () => {
  const day = { date: '2026-08-10', weightKg: 109.5 };
  const payload = { app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [day] } };
  migrate(payload);
  assert.strictEqual('mealsLog' in day, false, 'the original object passed in was not mutated');
});
