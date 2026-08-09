// tests/format.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { formatKg, formatSigned } = require('../src/format.js');

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
