// tests/calc.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { daysBetween, dayNumber, countdownToDay30, sevenDayAvg, doseTally } = require('../src/calc.js');

const DAY1 = '2026-08-10';

test('daysBetween counts calendar days inclusive of neither end offset', () => {
  assert.strictEqual(daysBetween('2026-08-10', '2026-08-10'), 0);
  assert.strictEqual(daysBetween('2026-08-10', '2026-08-11'), 1);
  assert.strictEqual(daysBetween('2026-08-10', '2026-09-08'), 29);
});

test('dayNumber: Day 1 on the start date, Day 30 on 8 Sep', () => {
  assert.strictEqual(dayNumber('2026-08-10', DAY1), 1);
  assert.strictEqual(dayNumber('2026-09-08', DAY1), 30);
});

test('countdownToDay30: 29 on Day 1, 0 on Day 30', () => {
  assert.strictEqual(countdownToDay30('2026-08-10', DAY1), 29);
  assert.strictEqual(countdownToDay30('2026-09-08', DAY1), 0);
});

test('dayNumber handles a skipped day (gap does not break numbering)', () => {
  // logging resumes on 2026-08-14 after skipping the 13th
  assert.strictEqual(dayNumber('2026-08-14', DAY1), 5);
});

test('sevenDayAvg = mean of non-null weights in trailing 7 days incl today', () => {
  const logs = [
    { date: '2026-08-10', weightKg: 110.0 },
    { date: '2026-08-11', weightKg: 109.6 },
    { date: '2026-08-13', weightKg: 109.0 },   // 12th skipped
  ];
  const r = sevenDayAvg(logs, '2026-08-13');
  assert.strictEqual(r.n, 3);
  assert.ok(Math.abs(r.avg - 109.5333) < 0.001);
  assert.strictEqual(r.building, false);      // n >= 3
});

test('sevenDayAvg is "building" when fewer than 3 readings', () => {
  const r = sevenDayAvg([{ date: '2026-08-10', weightKg: 110 }], '2026-08-10');
  assert.strictEqual(r.n, 1);
  assert.strictEqual(r.building, true);
  assert.strictEqual(r.avg, null);
});

test('sevenDayAvg ignores readings older than 7 days and null weights', () => {
  const logs = [
    { date: '2026-08-01', weightKg: 112 },     // >7 days before the 13th → excluded
    { date: '2026-08-11', weightKg: 109.6 },
    { date: '2026-08-12', weightKg: null },    // null → excluded
    { date: '2026-08-13', weightKg: 109.0 },
  ];
  const r = sevenDayAvg(logs, '2026-08-13');
  assert.strictEqual(r.n, 2);
});

test('doseTally: past unset dose = unconfirmed (NOT missed); today unset excluded', () => {
  const logs = [
    { date: '2026-08-10', dose: 'correct' },
    { date: '2026-08-11', dose: 'incorrect' },
    { date: '2026-08-12', dose: null },        // past + unset → unconfirmed
    { date: '2026-08-13', dose: null },        // today → excluded
  ];
  const t = doseTally(logs, '2026-08-13', '2026-08-10');
  assert.strictEqual(t.correct, 1);
  assert.strictEqual(t.incorrect, 1);
  assert.strictEqual(t.missed, 0);
  assert.strictEqual(t.unconfirmed, 1);
  // rate = correct / completed-dose-due-days (past days that are resolved OR unconfirmed=counted as due)
  // denominator excludes today (not over). Due days = 10,11,12 → 3. rate = 1/3.
  assert.ok(Math.abs(t.rate - 1/3) < 0.001);
});
