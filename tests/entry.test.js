const { test } = require('node:test');
const assert = require('node:assert');
const { buildEntryPatch } = require('../src/entry.js');

test('sideEffects: 0 · None is a REAL value, kept in the patch', () => {
  const p = buildEntryPatch({ weight: '', walked: '', dose: null, sideEffects: 0, adherence: null, note: '' });
  assert.strictEqual(p.sideEffects, 0);
});

test('an unselected dose yields NO dose key (so merge preserves prior)', () => {
  const p = buildEntryPatch({ weight: '', walked: '', dose: null, sideEffects: null, adherence: null, note: '' });
  assert.ok(!('dose' in p), 'no dose key when unselected');
});

test('an empty weight string yields no weightKg key', () => {
  const p = buildEntryPatch({ weight: '', walked: '', dose: null, sideEffects: null, adherence: null, note: '' });
  assert.ok(!('weightKg' in p));
});

test('a fully filled form maps every field; walked rounds to an int', () => {
  const p = buildEntryPatch({ weight: '109.5', walked: '30', dose: 'correct', sideEffects: 2, adherence: 3, note: 'x' });
  assert.strictEqual(p.weightKg, 109.5);
  assert.strictEqual(p.walkedMin, 30);
  assert.strictEqual(p.dose, 'correct');
  assert.strictEqual(p.sideEffects, 2);
  assert.strictEqual(p.adherence, 3);
  assert.strictEqual(p.note, 'x');
});

test('adherence: 0 · Off is kept (not dropped as falsy)', () => {
  const p = buildEntryPatch({ weight: '', walked: '', dose: null, sideEffects: null, adherence: 0, note: '' });
  assert.strictEqual(p.adherence, 0);
});

test('a note-only save yields just the note (evening merge safety)', () => {
  const p = buildEntryPatch({ weight: '', walked: '', dose: null, sideEffects: null, adherence: null, note: 'felt fine' });
  assert.deepStrictEqual(p, { note: 'felt fine' });
});

test('buildEntryPatch includes feelings when at least one field is set', () => {
  const patch = buildEntryPatch({ weight: '', walked: '', dose: null, sideEffects: null,
    adherence: null, note: '', feelings: { nausea: 1, appetite: null, energy: null, bowels: null, tags: [] } });
  assert.deepStrictEqual(patch.feelings, { nausea: 1, appetite: null, energy: null, bowels: null, tags: [] });
});

test('buildEntryPatch includes feelings when only a tag is set', () => {
  const patch = buildEntryPatch({ weight: '', walked: '', dose: null, sideEffects: null,
    adherence: null, note: '', feelings: { nausea: null, appetite: null, energy: null, bowels: null, tags: ['Bloated'] } });
  assert.deepStrictEqual(patch.feelings.tags, ['Bloated']);
});

test('buildEntryPatch OMITS feelings entirely when the panel was untouched', () => {
  const patch = buildEntryPatch({ weight: '109.5', walked: '30', dose: 'correct', sideEffects: null,
    adherence: null, note: '', feelings: { nausea: null, appetite: null, energy: null, bowels: null, tags: [] } });
  assert.strictEqual('feelings' in patch, false);
});

test('buildEntryPatch OMITS feelings when the form has no feelings key at all', () => {
  const patch = buildEntryPatch({ weight: '109.5', walked: '', dose: null, sideEffects: null, adherence: null, note: '' });
  assert.strictEqual('feelings' in patch, false);
});
