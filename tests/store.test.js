const { test } = require('node:test');
const assert = require('node:assert');
const { createStore } = require('../src/store.js');

// in-memory storage double (localStorage-shaped: getItem/setItem)
function fakeStorage() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), _map: m };
}

test('setDay creates a day; getDay returns it', () => {
  const s = createStore(fakeStorage());
  s.setDay('2026-08-10', { weightKg: 109.5, dose: 'correct' });
  const d = s.getDay('2026-08-10');
  assert.strictEqual(d.weightKg, 109.5);
  assert.strictEqual(d.dose, 'correct');
});

test('setDay MERGES — a partial update never nulls a populated field', () => {
  const s = createStore(fakeStorage());
  s.setDay('2026-08-10', { weightKg: 109.5, dose: 'correct' });   // morning
  s.setDay('2026-08-10', { sideEffects: 1, note: 'ok' });          // evening, no weight/dose
  const d = s.getDay('2026-08-10');
  assert.strictEqual(d.weightKg, 109.5, 'weight preserved');
  assert.strictEqual(d.dose, 'correct', 'dose preserved');
  assert.strictEqual(d.sideEffects, 1);
  assert.strictEqual(d.note, 'ok');
});

// A8 — an explicit null in a partial must NOT wipe a populated field (only a real value overwrites).
test('setDay({weightKg:null}) does NOT wipe a stored weight (A8)', () => {
  const s = createStore(fakeStorage());
  s.setDay('2026-08-10', { weightKg: 109.5, dose: 'correct' });
  s.setDay('2026-08-10', { weightKg: null, sideEffects: 1 });   // null must be ignored by the merge
  const d = s.getDay('2026-08-10');
  assert.strictEqual(d.weightKg, 109.5, 'null did not null the stored weight');
  assert.strictEqual(d.dose, 'correct');
  assert.strictEqual(d.sideEffects, 1);
});

test('setDay can explicitly overwrite a field when a new value is given', () => {
  const s = createStore(fakeStorage());
  s.setDay('2026-08-10', { weightKg: 109.5 });
  s.setDay('2026-08-10', { weightKg: 109.2 });
  assert.strictEqual(s.getDay('2026-08-10').weightKg, 109.2);
});

test('persists to storage and reloads', () => {
  const storage = fakeStorage();
  const a = createStore(storage);
  a.setDay('2026-08-10', { weightKg: 109.5 });
  const b = createStore(storage);            // fresh store, same storage
  assert.strictEqual(b.getDay('2026-08-10').weightKg, 109.5);
});

test('allLogs returns entries sorted by date', () => {
  const s = createStore(fakeStorage());
  s.setDay('2026-08-12', { weightKg: 109 });
  s.setDay('2026-08-10', { weightKg: 110 });
  assert.deepStrictEqual(s.allLogs().map(d => d.date), ['2026-08-10', '2026-08-12']);
});

test('export → import round-trips with no data loss', () => {
  const s1 = createStore(fakeStorage());
  s1.setDay('2026-08-10', { weightKg: 109.5, dose: 'correct', sideEffects: 1 });
  s1.setDay('2026-08-11', { weightKg: 109.2, dose: 'correct' });
  const payload = s1.exportPayload('2026-08-11T06:00:00');
  const s2 = createStore(fakeStorage());
  const res = s2.importPayload(payload);
  assert.strictEqual(res.ok, true);
  assert.strictEqual(s2.getDay('2026-08-10').weightKg, 109.5);
  assert.strictEqual(s2.allLogs().length, 2);
});

test('import REJECTS a foreign app backup (e.g. spending-tracker)', () => {
  const s = createStore(fakeStorage());
  s.setDay('2026-08-10', { weightKg: 109.5 });
  const res = s.importPayload({ app: 'spending-tracker', schemaVersion: 1, state: { dailyLogs: [] } });
  assert.strictEqual(res.ok, false);
  assert.match(res.error, /different app/);
  assert.strictEqual(s.getDay('2026-08-10').weightKg, 109.5, 'existing data untouched after a rejected import');
});

test('import REJECTS a payload with a malformed dailyLogs item; prior data untouched (BB3)', () => {
  const s = createStore(fakeStorage());
  s.setDay('2026-08-10', { weightKg: 109.5, dose: 'correct' });
  const res = s.importPayload({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [{ weightKg: 70 }] } });
  assert.strictEqual(res.ok, false);
  assert.strictEqual(s.getDay('2026-08-10').weightKg, 109.5, 'existing data untouched after a rejected import');
  assert.strictEqual(s.getDay('2026-08-10').dose, 'correct');
  assert.strictEqual(s.allLogs().length, 1);
});

// A1/A7 — a rejected import (non-array scans) must leave prior state untouched.
test('import REJECTS a non-array scans payload; prior data untouched (A1)', () => {
  const s = createStore(fakeStorage());
  s.setDay('2026-08-10', { weightKg: 109.5, dose: 'correct' });
  const res = s.importPayload({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [], scans: { bad: true } } });
  assert.strictEqual(res.ok, false);
  assert.strictEqual(s.getDay('2026-08-10').weightKg, 109.5, 'existing data untouched after a rejected import');
  assert.strictEqual(s.allLogs().length, 1);
});

// A7 — duplicate dates in an imported payload are de-duplicated (last wins).
test('import DEDUPS duplicate dates, last wins (A7)', () => {
  const s = createStore(fakeStorage());
  const res = s.importPayload({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [
    { date: '2026-08-10', weightKg: 110, dose: 'correct', walkedMin: null, sideEffects: null, adherence: null, note: '' },
    { date: '2026-08-11', weightKg: 109, dose: 'correct', walkedMin: null, sideEffects: null, adherence: null, note: '' },
    { date: '2026-08-10', weightKg: 108, dose: 'missed', walkedMin: null, sideEffects: null, adherence: null, note: '' }
  ] } });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(s.allLogs().length, 2, 'the duplicate 2026-08-10 collapsed to one');
  assert.strictEqual(s.getDay('2026-08-10').weightKg, 108, 'last write wins');
  assert.strictEqual(s.getDay('2026-08-10').dose, 'missed', 'last write wins');
});

test('import MERGES dailyLogs (does not delete local days the import omits); UNDO still works', () => {
  const s = createStore(fakeStorage());
  s.setDay('2026-08-10', { weightKg: 109.5 });
  const prev = s.snapshot();
  s.importPayload({ app: 'health-journey', schemaVersion: 2, state: { dailyLogs: [
    { date: '2026-09-01', weightKg: 100, dose: null, walkedMin: null, sideEffects: null, adherence: null, note: '', updatedAt: '2026-09-01T06:00:00.000Z' }
  ] } });
  assert.strictEqual(s.getDay('2026-08-10').weightKg, 109.5, 'local-only day survives a merge import');
  assert.strictEqual(s.getDay('2026-09-01').weightKg, 100, 'new day from the import is added');
  s.restore(prev);
  assert.strictEqual(s.getDay('2026-08-10').weightKg, 109.5);
  assert.strictEqual(s.getDay('2026-09-01'), null, 'restore undoes the import');
});

test('setDay stamps updatedAt using the injected clock', () => {
  let clock = '2026-08-10T06:00:00.000Z';
  const s = createStore(fakeStorage(), () => clock);
  s.setDay('2026-08-10', { weightKg: 109.5 });
  assert.strictEqual(s.getDay('2026-08-10').updatedAt, '2026-08-10T06:00:00.000Z');
  clock = '2026-08-10T19:00:00.000Z';
  s.setDay('2026-08-10', { note: 'evening update' });
  assert.strictEqual(s.getDay('2026-08-10').updatedAt, '2026-08-10T19:00:00.000Z', 'second save re-stamps');
});

test('setDay defaults to a real ISO timestamp when no clock is injected', () => {
  const s = createStore(fakeStorage());
  s.setDay('2026-08-10', { weightKg: 109.5 });
  const ts = s.getDay('2026-08-10').updatedAt;
  assert.strictEqual(typeof ts, 'string');
  assert.ok(!isNaN(Date.parse(ts)), 'updatedAt parses as a valid date');
});

test('import: incoming day with a NEWER updatedAt replaces the local day', () => {
  const s = createStore(fakeStorage(), () => '2026-08-10T06:00:00.000Z');
  s.setDay('2026-08-10', { weightKg: 109.5 });   // local updatedAt = 06:00
  const res = s.importPayload({ app: 'health-journey', schemaVersion: 2, state: { dailyLogs: [
    { date: '2026-08-10', weightKg: 108.9, dose: null, walkedMin: null, sideEffects: null, adherence: null, note: '', updatedAt: '2026-08-10T19:00:00.000Z' }
  ] } });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(s.getDay('2026-08-10').weightKg, 108.9, 'newer incoming wins');
});

test('import: incoming day with an OLDER updatedAt is discarded, local kept', () => {
  const s = createStore(fakeStorage(), () => '2026-08-10T19:00:00.000Z');
  s.setDay('2026-08-10', { weightKg: 109.5 });   // local updatedAt = 19:00
  const res = s.importPayload({ app: 'health-journey', schemaVersion: 2, state: { dailyLogs: [
    { date: '2026-08-10', weightKg: 200, dose: null, walkedMin: null, sideEffects: null, adherence: null, note: '', updatedAt: '2026-08-10T06:00:00.000Z' }
  ] } });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(s.getDay('2026-08-10').weightKg, 109.5, 'older incoming discarded, local kept');
});

test('import: a null/missing updatedAt on the incoming side never wins', () => {
  const s = createStore(fakeStorage(), () => '2026-08-10T06:00:00.000Z');
  s.setDay('2026-08-10', { weightKg: 109.5 });
  const res = s.importPayload({ app: 'health-journey', schemaVersion: 2, state: { dailyLogs: [
    { date: '2026-08-10', weightKg: 150, dose: null, walkedMin: null, sideEffects: null, adherence: null, note: '', updatedAt: null }
  ] } });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(s.getDay('2026-08-10').weightKg, 109.5, 'a null incoming timestamp cannot beat a real local one');
});

test('import: a brand-new date (not present locally) is always added regardless of updatedAt', () => {
  const s = createStore(fakeStorage());
  const res = s.importPayload({ app: 'health-journey', schemaVersion: 2, state: { dailyLogs: [
    { date: '2026-08-15', weightKg: 108, dose: null, walkedMin: null, sideEffects: null, adherence: null, note: '', updatedAt: null }
  ] } });
  assert.strictEqual(res.ok, true);
  assert.strictEqual(s.getDay('2026-08-15').weightKg, 108);
});

test('import: scans/weekly/meds/settings still fully replace when present (unchanged regression)', () => {
  const s = createStore(fakeStorage());
  const res = s.importPayload({ app: 'health-journey', schemaVersion: 2, state: {
    dailyLogs: [], scans: [{ date: '2026-08-07', fat_mass_percent: 46.5 }], weekly: [], meds: [], settings: { x: 1 }
  } });
  assert.strictEqual(res.ok, true);
  assert.deepStrictEqual(s.getState().scans, [{ date: '2026-08-07', fat_mass_percent: 46.5 }]);
  assert.deepStrictEqual(s.getState().settings, { x: 1 });
});
