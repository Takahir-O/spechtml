import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeMdCell,
  escapeMermaidLabel,
  escapeMermaidId,
  pickFence,
  renderMarkdown
} from '../skills/spechtml/runtime/render/markdown.js';

test('escapeMdCell escapes a literal pipe', () => {
  assert.equal(escapeMdCell('a|b'), 'a\\|b');
});

test('escapeMdCell collapses CR/LF/CRLF newlines into single spaces', () => {
  assert.equal(escapeMdCell('a\nb\r\nc'), 'a b c');
});

test('escapeMdCell escapes a backslash before escaping the pipe', () => {
  assert.equal(escapeMdCell('a\\|b'), 'a\\\\\\|b');
});

test('escapeMdCell handles null and undefined as empty string', () => {
  assert.equal(escapeMdCell(null), '');
  assert.equal(escapeMdCell(undefined), '');
});

test('escapeMermaidLabel strips mermaid bracket and quote characters', () => {
  assert.equal(escapeMermaidLabel('foo[bar]'), 'foo bar');
  assert.equal(escapeMermaidLabel('a"b"c'), 'a b c');
  assert.equal(escapeMermaidLabel('p(q){r}|s'), 'p q r s');
});

test('pickFence returns 3 backticks when the code has none', () => {
  assert.equal(pickFence('console.log(1)'), '```');
});

test('pickFence picks 4 backticks when the code contains a triple backtick', () => {
  assert.equal(pickFence('see ``` here'), '````');
});

test('pickFence picks 5 backticks when the code contains four backticks', () => {
  assert.equal(pickFence('see ```` here'), '`````');
});

test('escapeMermaidId replaces Mermaid-syntax characters with underscore', () => {
  assert.equal(escapeMermaidId('A-->B'), 'A___B');
  assert.equal(escapeMermaidId('A;B'), 'A_B');
  assert.equal(escapeMermaidId('A.B'), 'A_B');
  assert.equal(escapeMermaidId('plain_id'), 'plain_id');
});

test('escapeMermaidId falls back to n0 for empty / null / undefined input', () => {
  assert.equal(escapeMermaidId(''), 'n0');
  assert.equal(escapeMermaidId(null), 'n0');
  assert.equal(escapeMermaidId(undefined), 'n0');
});

test('renderMarkdown applies pipe escaping to requirement table cells', () => {
  const data = {
    doc: { title: 'D' },
    sections: [{ id: 's1', title: 'Sec' }],
    blocks: [{ id: 'b1', section: 's1', type: 'requirements', title: 'reqs' }],
    requirements: [{
      id: 'R|1',
      section: 's1',
      priority: 'must',
      status: 'accepted',
      title: 'has | pipe',
      description: 'desc'
    }]
  };
  const out = renderMarkdown(data);
  assert.ok(out.includes('R\\|1'), 'id pipe must be escaped');
  assert.ok(out.includes('has \\| pipe'), 'title pipe must be escaped');
});
