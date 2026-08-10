// tests/calc.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { daysBetween, dayNumber, countdownToDay30, sevenDayAvg, doseTally, addDays, logStats,
        windowAvg, percentChange, reportData } = require('../src/calc.js');

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
  assert.strictEqual(s.adherence.rated, 4);          // A9: all 4 days carry a numeric adherence
  assert.strictEqual(s.sideEffects.worst, 2);
  assert.strictEqual(s.daysLogged, 4);
});

// A9 — the adherence denominator is days-with-a-numeric-adherence, NOT daysLogged.
// An un-rated day must not read as non-adherence.
test('logStats.adherence.rated counts only days with a numeric adherence (A9)', () => {
  const logs = [
    { date:'2026-08-10', adherence:3 },
    { date:'2026-08-11', adherence:null },   // logged (e.g. weight only), adherence not rated
    { date:'2026-08-12' },                    // no adherence field at all
    { date:'2026-08-13', adherence:2 },
  ];
  const s = logStats(logs);
  assert.strictEqual(s.daysLogged, 4);
  assert.strictEqual(s.adherence.rated, 2, 'only the 2 days with a numeric adherence count');
  assert.strictEqual(s.adherence.mostlyOrFully, 2);
});

test('logStats handles empty logs without NaN', () => {
  const s = logStats([]);
  assert.strictEqual(s.daysLogged, 0);
  assert.strictEqual(s.weighIns, 0);
  assert.strictEqual(s.firstWeight, null);
  assert.strictEqual(s.latestWeight, null);
  assert.strictEqual(s.netWeightChange, null);
});

// ---- Bundle 6: Day-30 report ----

test('windowAvg = mean of non-null weights within [start,end] inclusive', () => {
  const logs = [
    {date:'2026-08-10', weightKg:110}, {date:'2026-08-11', weightKg:109.6},
    {date:'2026-08-12', weightKg:null}, {date:'2026-08-20', weightKg:108}
  ];
  const r = windowAvg(logs, '2026-08-10', '2026-08-16');
  assert.strictEqual(r.n, 2);
  assert.ok(Math.abs(r.avg - 109.8) < 1e-9);
  assert.strictEqual(windowAvg(logs, '2026-09-01','2026-09-07').avg, null); // none → null
});

test('percentChange signed relative to the start value', () => {
  assert.ok(Math.abs(percentChange(110, 108.9) - (-1.0)) < 1e-6);
  assert.strictEqual(percentChange(0, 5), null);   // guard divide-by-zero
  assert.strictEqual(percentChange(null, 5), null);
});

test('reportData assembles week1 vs week4 + dose + sideEffects, pending when sparse', () => {
  // BP2: build 30 days (Day 1..30) so the Day 24..30 week-4 window is exercised.
  const logs = [];
  for (let i=0;i<30;i++){
    const d = new Date(Date.UTC(2026,7,10+i,12));
    const ds = d.toISOString().slice(0,10);
    logs.push({date:ds, weightKg: 110 - i*0.15, walkedMin:30, dose: i%10===0?'incorrect':'correct', sideEffects: i<3?1:0, adherence:3});
  }
  const rd = reportData(logs, [], {kcal:1729, protein:145, carbs:119, fat:72}, '2026-09-08', DAY1);
  assert.ok(rd.week1.avg > rd.week4.avg);                 // lost weight
  assert.ok(rd.weightDeltaKg < 0);
  assert.ok(rd.weightDeltaPct < 0);
  assert.ok(rd.dose.completed > 0 && rd.dose.rate >= 0 && rd.dose.rate <= 1);
  assert.strictEqual(rd.scans.available, false);          // no scans → pending
  assert.strictEqual(rd.targets.kcal, 1729);
  assert.ok(Array.isArray(rd.sideEffectsByDay));
  // BP5: pin the windows with exact-value assertions so a wrong window can't ship silently.
  assert.ok(Math.abs(rd.week1.avg - 109.55) < 1e-9);      // mean of Day 1..7 weights
  assert.ok(Math.abs(rd.week4.avg - 106.1) < 1e-9);       // mean of Day 24..30 weights
  assert.ok(Math.abs(rd.weightDeltaKg - (-3.45)) < 1e-9);
  assert.strictEqual(rd.week1.n, 7);
  assert.strictEqual(rd.week4.n, 7);
});

test('reportData reads snake_case Seca scans (BP1) and sorts them (BP3)', () => {
  // On-disk Seca shape is snake_case; feed the two real baseline scans out of order.
  const scans = [
    { date:'2026-08-07', fat_mass_percent:46.5, fat_mass_kg:51.08, skeletal_muscle_kg:30.2, visceral_fat:null },
    { date:'2025-10-01', fat_mass_percent:46.2, fat_mass_kg:50.38, skeletal_muscle_kg:29.31, visceral_fat:null }
  ];
  const rd = reportData([], scans, {}, '2026-09-08', DAY1);
  assert.strictEqual(rd.scans.available, true);
  assert.strictEqual(rd.scans.from, '2025-10-01');        // BP3: earliest first
  assert.strictEqual(rd.scans.to, '2026-08-07');          // BP3: latest last
  assert.ok(Math.abs(rd.scans.muscleKgDelta - 0.89) < 1e-9);  // real number, not NaN
  assert.ok(Math.abs(rd.scans.fatKgDelta - 0.70) < 1e-9);
  assert.ok(Math.abs(rd.scans.fatPctDelta - 0.30) < 1e-9);
  assert.strictEqual(rd.scans.visceralDelta, null);       // both null → not measured
});
