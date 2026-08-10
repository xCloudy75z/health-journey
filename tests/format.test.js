// tests/format.test.js
const { test } = require('node:test');
const assert = require('node:assert');
const { formatKg, formatSigned, formatInt, formatDateShort, esc } = require('../src/format.js');

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

// A15 — the canonical note-escaper. The `note` is not rendered anywhere today, but the
// contract is: any future render site must pass it through esc() so a stored note can
// never inject markup. A <script>/onerror note must come out inert (no live tags).
test('esc neutralizes a <script>/onerror note into inert text (A15)', () => {
  assert.strictEqual(esc('<script>alert(1)</script>'), '&lt;script&gt;alert(1)&lt;/script&gt;');
  assert.strictEqual(esc('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
  assert.strictEqual(esc('a & b'), 'a &amp; b');
  // no un-escaped angle bracket or quote survives → the string cannot open a live tag
  const out = esc('<b onmouseover="x">"&');
  assert.ok(out.indexOf('<') === -1 && out.indexOf('>') === -1, 'no raw angle brackets remain');
});
