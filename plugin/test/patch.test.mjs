import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { encode, decode } from '@toon-format/toon';
import { applyPatch, applyPatchFile } from '../skills/spechtml/runtime/apply-toon-patch.js';

function sha256(text) {
  return createHash('sha256').update(text).digest('hex');
}

function buildSourceText() {
  const sourceDoc = {
    meta: { pf: 'spechtml-v1', v: 1 },
    order: ['sec1'],
    sec1: {
      title: 'Section 1',
      note: 'old note'
    }
  };
  return encode(sourceDoc, { delimiter: '|' });
}

async function setup() {
  const dir = await mkdtemp(join(tmpdir(), 'spechtml-patch-'));
  const sourceText = buildSourceText();
  await writeFile(join(dir, 'src.toon'), sourceText, 'utf8');
  return { dir, sourceText };
}

test('patch is applied in-place when target and target_hash both match', async () => {
  const { dir, sourceText } = await setup();
  const patchDoc = {
    meta: {
      pf: 'spechtml-patch-v1',
      v: 1,
      target: 'src.toon',
      target_hash: sha256(sourceText)
    },
    replace: [{ path: '/sec1/note', value: 'new note' }]
  };
  await writeFile(join(dir, 'patch.toon'), encode(patchDoc, { delimiter: '|' }), 'utf8');

  const result = await applyPatchFile('src.toon', 'patch.toon', { cwd: dir });
  assert.ok(result.output.endsWith('src.toon'));

  const updated = decode(await readFile(join(dir, 'src.toon'), 'utf8'), { strict: true });
  assert.equal(updated.sec1.note, 'new note');
});

test('patch is rejected when target_hash is missing', async () => {
  const { dir } = await setup();
  const patchDoc = {
    meta: { pf: 'spechtml-patch-v1', v: 1, target: 'src.toon' },
    replace: [{ path: '/sec1/note', value: 'x' }]
  };
  await writeFile(join(dir, 'patch.toon'), encode(patchDoc, { delimiter: '|' }), 'utf8');

  await assert.rejects(
    () => applyPatchFile('src.toon', 'patch.toon', { cwd: dir }),
    /target_hash is required/
  );
});

test('patch is rejected when target_hash does not match source content', async () => {
  const { dir } = await setup();
  const patchDoc = {
    meta: {
      pf: 'spechtml-patch-v1',
      v: 1,
      target: 'src.toon',
      target_hash: 'sha256:' + 'a'.repeat(64)
    },
    replace: [{ path: '/sec1/note', value: 'x' }]
  };
  await writeFile(join(dir, 'patch.toon'), encode(patchDoc, { delimiter: '|' }), 'utf8');

  await assert.rejects(
    () => applyPatchFile('src.toon', 'patch.toon', { cwd: dir }),
    /Source hash mismatch/
  );
});

test('patch is rejected when target points to a different file even if basenames look similar', async () => {
  const { dir, sourceText } = await setup();
  await writeFile(join(dir, 'other.toon'), sourceText, 'utf8');

  const patchDoc = {
    meta: {
      pf: 'spechtml-patch-v1',
      v: 1,
      target: 'other.toon',
      target_hash: sha256(sourceText)
    },
    replace: [{ path: '/sec1/note', value: 'x' }]
  };
  await writeFile(join(dir, 'patch.toon'), encode(patchDoc, { delimiter: '|' }), 'utf8');

  await assert.rejects(
    () => applyPatchFile('src.toon', 'patch.toon', { cwd: dir }),
    /target mismatch/
  );
});

test('patch is applied when target_hash omits the sha256: prefix', async () => {
  const { dir, sourceText } = await setup();
  const patchDoc = {
    meta: {
      pf: 'spechtml-patch-v1',
      v: 1,
      target: 'src.toon',
      target_hash: sha256(sourceText)
    },
    replace: [{ path: '/sec1/note', value: 'no-prefix' }]
  };
  await writeFile(join(dir, 'patch.toon'), encode(patchDoc, { delimiter: '|' }), 'utf8');

  await applyPatchFile('src.toon', 'patch.toon', { cwd: dir });
  const updated = decode(await readFile(join(dir, 'src.toon'), 'utf8'), { strict: true });
  assert.equal(updated.sec1.note, 'no-prefix');
});

test('applyPatch rejects __proto__ path segments', () => {
  assert.throws(
    () => applyPatch({}, { replace: [{ path: '/__proto__/toString', value: 'polluted' }] }),
    /Forbidden path segment/
  );
});

test('applyPatch rejects prototype path segments', () => {
  assert.throws(
    () => applyPatch({ a: { b: 1 } }, { replace: [{ path: '/a/prototype', value: 'x' }] }),
    /Forbidden path segment/
  );
});

test('applyPatch rejects constructor path segments', () => {
  assert.throws(
    () => applyPatch({}, { remove: [{ path: '/constructor' }] }),
    /Forbidden path segment/
  );
});

test('applyPatch does not pollute Object.prototype after a rejected attempt', () => {
  try {
    applyPatch({}, { replace: [{ path: '/__proto__/toString', value: 'polluted' }] });
  } catch {}
  assert.equal(typeof ({}).toString, 'function');
  assert.equal(({}).toString(), '[object Object]');
});

test('applyPatch supports append into an array path', () => {
  const doc = { a: { items: [{ id: 'A', name: 'first' }] } };
  applyPatch(doc, { append: [{ path: '/a/items', id: 'B', name: 'second' }] });
  assert.equal(doc.a.items.length, 2);
  assert.equal(doc.a.items[1].id, 'B');
  assert.equal(doc.a.items[1].name, 'second');
});

test('applyPatch supports remove of a row matched by id selector', () => {
  const doc = { a: { items: [{ id: 'A' }, { id: 'B' }] } };
  applyPatch(doc, { remove: [{ path: '/a/items/id=A' }] });
  assert.equal(doc.a.items.length, 1);
  assert.equal(doc.a.items[0].id, 'B');
});

test('applyPatch insert places a row at the given index', () => {
  const doc = { a: { items: [{ id: 'A' }, { id: 'B' }, { id: 'D' }] } };
  applyPatch(doc, { insert: [{ path: '/a/items', index: 2, id: 'C' }] });
  assert.equal(doc.a.items.length, 4);
  assert.equal(doc.a.items[2].id, 'C');
  assert.equal(doc.a.items[3].id, 'D');
});

test('applyPatch insert at index 0 prepends', () => {
  const doc = { a: { items: [{ id: 'B' }] } };
  applyPatch(doc, { insert: [{ path: '/a/items', index: 0, id: 'A' }] });
  assert.equal(doc.a.items[0].id, 'A');
  assert.equal(doc.a.items[1].id, 'B');
});

test('applyPatch insert clamps index past length to the end', () => {
  const doc = { a: { items: [{ id: 'A' }] } };
  applyPatch(doc, { insert: [{ path: '/a/items', index: 99, id: 'B' }] });
  assert.equal(doc.a.items.length, 2);
  assert.equal(doc.a.items[1].id, 'B');
});

test('applyPatch insert rejects non-array path', () => {
  assert.throws(
    () => applyPatch({ a: { note: 'x' } }, { insert: [{ path: '/a/note', index: 0, id: 'X' }] }),
    /Insert target is not an array/
  );
});

test('applyPatch insert rejects negative index', () => {
  assert.throws(
    () => applyPatch({ a: { items: [] } }, { insert: [{ path: '/a/items', index: -1, id: 'X' }] }),
    /Insert index must be a non-negative integer/
  );
});

test('applyPatch add_section adds a new top-level section and inserts into order', () => {
  const doc = {
    order: ['s1', 's2'],
    s1: { title: 'one' },
    s2: { title: 'two' }
  };
  applyPatch(doc, {
    add_section: [{ key: 's3', index: 1, body: { title: 'three', note: 'inserted' } }]
  });
  assert.deepEqual(doc.order, ['s1', 's3', 's2']);
  assert.equal(doc.s3.title, 'three');
  assert.equal(doc.s3.note, 'inserted');
});

test('applyPatch add_section without index appends to order', () => {
  const doc = { order: ['s1'], s1: { title: 'one' } };
  applyPatch(doc, { add_section: [{ key: 's2', body: { title: 'two' } }] });
  assert.deepEqual(doc.order, ['s1', 's2']);
});

test('applyPatch add_section rejects existing key', () => {
  const doc = { order: ['s1'], s1: { title: 'one' } };
  assert.throws(
    () => applyPatch(doc, { add_section: [{ key: 's1', body: { title: 'dup' } }] }),
    /Section already exists/
  );
});

test('applyPatch add_section rejects forbidden key', () => {
  const doc = { order: [] };
  assert.throws(
    () => applyPatch(doc, { add_section: [{ key: '__proto__', body: { title: 'x' } }] }),
    /Forbidden section key/
  );
});

test('applyPatch add_section requires top-level order', () => {
  const doc = { s1: { title: 'one' } };
  assert.throws(
    () => applyPatch(doc, { add_section: [{ key: 's2', body: { title: 'two' } }] }),
    /add_section requires a top-level `order` array/
  );
});

test('resolvePath error suggests a similar key when path segment is missing', () => {
  const doc = { overview: { note: 'x' }, get_users: { title: 'GET' } };
  assert.throws(
    () => applyPatch(doc, { replace: [{ path: '/get_user/title', value: 'y' }] }),
    /Did you mean "get_users"\?/
  );
});

test('resolvePath error lists available keys when no close match', () => {
  const doc = { alpha: 1, beta: 2 };
  assert.throws(
    () => applyPatch(doc, { replace: [{ path: '/zzz', value: 'y' }] }),
    /Available keys: alpha, beta/
  );
});
