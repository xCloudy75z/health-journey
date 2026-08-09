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
