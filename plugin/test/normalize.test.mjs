import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { decode } from '@toon-format/toon';
import { normalizeSpecDoc, field } from '../skills/spechtml/runtime/normalize.js';
import { validateSpecDoc } from '../skills/spechtml/runtime/validate.js';

test('field returns the value of the first key that is defined', () => {
  assert.equal(field({ a: 1, b: 2 }, 'a', 'b'), 1);
  assert.equal(field({ b: 2 }, 'a', 'b'), 2);
  assert.equal(field({ a: '' }, 'a', 'b'), '');
  assert.equal(field({}, 'a', 'b'), '');
});

test('reqs accept canonical priority/status/title/description', () => {
  const data = {
    order: ['s1'],
    s1: {
      title: 'Sec',
      reqs: [{ id: 'R1', priority: 'M', status: 'A', title: 'T', description: 'D' }]
    }
  };
  const result = normalizeSpecDoc(data);
  assert.equal(result.requirements[0].priority, 'must');
  assert.equal(result.requirements[0].status, 'accepted');
  assert.equal(result.requirements[0].title, 'T');
  assert.equal(result.requirements[0].description, 'D');
});

test('reqs accept short forms p/s/t/d', () => {
  const data = {
    order: ['s1'],
    s1: {
      title: 'Sec',
      reqs: [{ id: 'R1', p: 'S', s: 'P', t: 'T2', d: 'D2' }]
    }
  };
  const result = normalizeSpecDoc(data);
  assert.equal(result.requirements[0].priority, 'should');
  assert.equal(result.requirements[0].status, 'planned');
  assert.equal(result.requirements[0].title, 'T2');
  assert.equal(result.requirements[0].description, 'D2');
});

test('decisions accept canonical recommendation and short rec/recommend forms', () => {
  const data1 = {
    order: ['s1'],
    s1: { title: 'S', decisions: [{ id: 'D1', option: 'A', score: 9, tradeoff: 't', recommendation: 'yes' }] }
  };
  assert.equal(normalizeSpecDoc(data1).decisions[0].recommendation, 'yes');

  const data2 = {
    order: ['s1'],
    s1: { title: 'S', decisions: [{ id: 'D1', option: 'A', score: 9, tradeoff: 't', recommend: 'maybe' }] }
  };
  assert.equal(normalizeSpecDoc(data2).decisions[0].recommendation, 'maybe');

  const data3 = {
    order: ['s1'],
    s1: { title: 'S', decisions: [{ id: 'D1', option: 'A', score: 9, tradeoff: 't', rec: 'no' }] }
  };
  assert.equal(normalizeSpecDoc(data3).decisions[0].recommendation, 'no');
});

test('components accept canonical category/notes and short cat/note', () => {
  const canonical = normalizeSpecDoc({
    order: ['s1'],
    s1: { title: 'S', components: [{ name: 'X', category: 'cat1', purpose: 'p', notes: 'n1' }] }
  });
  assert.equal(canonical.components[0].category, 'cat1');
  assert.equal(canonical.components[0].notes, 'n1');

  const short = normalizeSpecDoc({
    order: ['s1'],
    s1: { title: 'S', components: [{ name: 'X', cat: 'cat2', purpose: 'p', note: 'n2' }] }
  });
  assert.equal(short.components[0].category, 'cat2');
  assert.equal(short.components[0].notes, 'n2');
});

test('relations accept from_ref/to_ref canonical form and from/to short form', () => {
  const canonical = normalizeSpecDoc({
    order: ['s1'],
    s1: { title: 'S', relations: [{ from_ref: 'A', to_ref: 'B', type: 'depends_on' }] }
  });
  assert.equal(canonical.relations[0].from_ref, 'A');
  assert.equal(canonical.relations[0].to_ref, 'B');
  assert.equal(canonical.relations[0].type, 'depends_on');

  const short = normalizeSpecDoc({
    order: ['s1'],
    s1: { title: 'S', relations: [{ from: 'C', to: 'D' }] }
  });
  assert.equal(short.relations[0].from_ref, 'C');
  assert.equal(short.relations[0].to_ref, 'D');
  assert.equal(short.relations[0].type, 'relates_to');
});

test('timeline status accepts state (canonical), status, or s', () => {
  const r1 = normalizeSpecDoc({
    order: ['s1'],
    s1: { title: 'S', steps: [{ step: 'a', state: 'done', detail: 'd' }] }
  });
  assert.equal(r1.timeline[0].status, 'done');

  const r2 = normalizeSpecDoc({
    order: ['s1'],
    s1: { title: 'S', steps: [{ step: 'a', status: 'done', detail: 'd' }] }
  });
  assert.equal(r2.timeline[0].status, 'done');
});

test('reqs status accepts state column (compact spec backwards compatibility)', () => {
  const data = {
    order: ['s1'],
    s1: {
      title: 'Sec',
      reqs: [{ id: 'R1', prio: 'M', state: 'A', title: 'T', desc: 'D' }]
    }
  };
  const result = normalizeSpecDoc(data);
  assert.equal(result.requirements[0].status, 'accepted');
});

test('source_url is omitted when absent so the optional schema passes', () => {
  const data = {
    order: ['s1'],
    s1: { title: 'Sec', reqs: [{ id: 'R1', prio: 'M', s: 'A', title: 'T', desc: 'D' }] },
    doc: { title: 'D' }
  };
  const result = normalizeSpecDoc(data);
  assert.equal(result.doc.source_url, undefined);
});

test('compact spec sample passes normalize and schema validation end-to-end', async () => {
  const text = await readFile(resolve('dev/examples/spec-ja.compact.toon'), 'utf8');
  const doc = decode(text, { strict: true });
  const data = normalizeSpecDoc(doc);
  validateSpecDoc(data);
});
