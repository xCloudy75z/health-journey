// tests/calc.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { daysBetween, dayNumber, countdownToDay30, sevenDayAvg, doseTally, addDays, logStats } = require('../src/calc.js');

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

test('addDays derives the Day-30 date from Day 1 + 29 (BB15)', () => {
  assert.strictEqual(addDays(DAY1, 29), '2026-09-08');   // Day 30
  assert.strictEqual(addDays('2026-08-31', 1), '2026-09-01'); // month rollover
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
  assert.strictEqual(t.unconfirmed, 1, 'unconfirmed reported separately');
  // BB2: rate denominator is COMPLETED doses only (correct+incorrect+missed),
  // not unconfirmed days. Completed = 1 correct + 1 incorrect = 2 → rate = 1/2.
  assert.strictEqual(t.completed, 2);
  assert.ok(Math.abs(t.rate - 0.5) < 0.001);
});

test('doseTally: rate is null (not 0) when there are no completed doses yet', () => {
  const logs = [
    { date: '2026-08-10', dose: null },        // past + unset → unconfirmed
    { date: '2026-08-11', dose: null },        // past + unset → unconfirmed
    { date: '2026-08-12', dose: null },        // today → excluded
  ];
  const t = doseTally(logs, '2026-08-12', '2026-08-10');
  assert.strictEqual(t.completed, 0);
  assert.strictEqual(t.unconfirmed, 2, 'unconfirmed still counted separately');
  assert.strictEqual(t.rate, null);
});

test('logStats aggregates weigh-ins, walking, adherence, side-effects, weight change', () => {
  const logs = [
    { date:'2026-08-10', weightKg:110.0, walkedMin:30, dose:'correct', sideEffects:1, adherence:3 },
    { date:'2026-08-11', weightKg:109.6, walkedMin:0,  dose:'correct', sideEffects:0, adherence:1 },
    { date:'2026-08-12', weightKg:null,  walkedMin:20, dose:'incorrect', sideEffects:2, adherence:2 },
    { date:'2026-08-13', weightKg:109.2, walkedMin:30, dose:null,        sideEffects:0, adherence:3 },
  ];
  const s = logStats(logs);
  assert.strictEqual(s.weighIns, 3);                 // non-null weights
  assert.strictEqual(s.walkedDays, 3);               // walkedMin > 0
  assert.strictEqual(s.walkedTotalMin, 80);
  assert.strictEqual(s.firstWeight, 110.0);
  assert.strictEqual(s.latestWeight, 109.2);
  assert.ok(Math.abs(s.netWeightChange - (-0.8)) < 1e-9); // latest - first
  assert.strictEqual(s.adherence.mostlyOrFully, 3);  // adherence >= 2
  assert.strictEqual(s.sideEffects.worst, 2);
  assert.strictEqual(s.daysLogged, 4);
});

test('logStats handles empty logs without NaN', () => {
  const s = logStats([]);
  assert.strictEqual(s.daysLogged, 0);
  assert.strictEqual(s.weighIns, 0);
  assert.strictEqual(s.firstWeight, null);
  assert.strictEqual(s.latestWeight, null);
  assert.strictEqual(s.netWeightChange, null);
});
