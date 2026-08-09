const { test } = require('node:test');
const assert = require('node:assert');
const { validateImport } = require('../src/validate.js');

test('accepts a well-formed health-journey backup', () => {
  assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1, state: { dailyLogs: [] } }).ok, true);
});
test('rejects wrong app', () => { assert.strictEqual(validateImport({ app: 'spending-tracker', schemaVersion: 1, state: { dailyLogs: [] } }).ok, false); });
test('rejects a newer schema', () => { assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 99, state: { dailyLogs: [] } }).ok, false); });
test('rejects malformed', () => { assert.strictEqual(validateImport(null).ok, false); assert.strictEqual(validateImport({ app: 'health-journey', schemaVersion: 1 }).ok, false); });
