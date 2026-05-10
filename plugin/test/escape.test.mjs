import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  escapeHtml,
  escapeAttr,
  safeJsonForScript
} from '../skills/spechtml/runtime/utils/escape.js';

test('escapeHtml escapes &, <, >, ", and single quotes', () => {
  assert.equal(
    escapeHtml(`<a href="x" class='y'>&</a>`),
    '&lt;a href=&quot;x&quot; class=&#39;y&#39;&gt;&amp;&lt;/a&gt;'
  );
});

test('escapeHtml encodes ampersand before other entities so it is not double-encoded', () => {
  assert.equal(escapeHtml('&amp;'), '&amp;amp;');
});

test('escapeAttr produces the same output as escapeHtml', () => {
  const input = `"&<>'`;
  assert.equal(escapeAttr(input), escapeHtml(input));
});

test('safeJsonForScript prevents </script> from terminating the script element', () => {
  const out = safeJsonForScript({ tag: '</script>', amp: '&', lt: '<', gt: '>' });
  assert.ok(!out.includes('</script>'), 'must not contain raw </script>');
  assert.ok(!out.includes('<'), 'must not contain raw <');
  assert.ok(!out.includes('>'), 'must not contain raw >');
  assert.ok(out.includes('\\u003c'), 'must encode <');
  assert.ok(out.includes('\\u003e'), 'must encode >');
  assert.ok(out.includes('\\u0026'), 'must encode &');
});

test('safeJsonForScript output round-trips through JSON.parse with the original meaning', () => {
  const value = { tag: '</script>', amp: '&', lt: '<', gt: '>' };
  const out = safeJsonForScript(value);
  assert.deepEqual(JSON.parse(out), value);
});
