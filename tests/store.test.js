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

test('import keeps UNDO — snapshot before, restore after', () => {
  const s = createStore(fakeStorage());
  s.setDay('2026-08-10', { weightKg: 109.5 });
  const prev = s.snapshot();
  s.importPayload({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [{ date: '2026-09-01', weightKg: 100, dose: null, walkedMin: null, sideEffects: null, adherence: null, note: '' }] } });
  assert.strictEqual(s.getDay('2026-08-10'), null, 'imported data replaced state');
  assert.strictEqual(s.getDay('2026-09-01').weightKg, 100);
  s.restore(prev);
  assert.strictEqual(s.getDay('2026-08-10').weightKg, 109.5, 'restore undoes the import');
  assert.strictEqual(s.getDay('2026-09-01'), null);
});
