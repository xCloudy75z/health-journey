// tests/format.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { formatKg, formatSigned, formatInt, formatDateShort } = require('../src/format.js');

test('formatKg shows one decimal + unit', () => {
  assert.strictEqual(formatKg(108.9), '108.9 kg');
  assert.strictEqual(formatKg(109), '109.0 kg');
});

test('formatKg returns a dash for null/undefined/NaN', () => {
  assert.strictEqual(formatKg(null), '—');
  assert.strictEqual(formatKg(undefined), '—');
  assert.strictEqual(formatKg(NaN), '—');
});

test('formatSigned prefixes + / − and one decimal', () => {
  assert.strictEqual(formatSigned(-0.8), '−0.8');
  assert.strictEqual(formatSigned(0.8), '+0.8');
  assert.strictEqual(formatSigned(0), '0.0');
});

test('formatInt rounds; dash for non-numbers', () => {
  assert.strictEqual(formatInt(30.4), '30');
  assert.strictEqual(formatInt(29.6), '30');
  assert.strictEqual(formatInt(null), '—');
  assert.strictEqual(formatInt(NaN), '—');
});

test('formatDateShort: Today when equal, else weekday · day mon', () => {
  assert.strictEqual(formatDateShort('2026-08-13', '2026-08-13'), 'Today');
  assert.strictEqual(formatDateShort('2026-08-13', '2026-08-15'), 'Thu · 13 Aug');
});
