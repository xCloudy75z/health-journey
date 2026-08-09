// tests/calc.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { daysBetween, dayNumber, countdownToDay30 } = require('../src/calc.js');

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
