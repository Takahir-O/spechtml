import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderProseText } from '../skills/spechtml/runtime/render/blocks.js';

test('renderProseText wraps plain text in a single <p>', () => {
  assert.equal(renderProseText('hello'), '<p>hello</p>');
});

test('renderProseText escapes HTML in plain text', () => {
  assert.equal(renderProseText('<script>'), '<p>&lt;script&gt;</p>');
});

test('renderProseText converts a fenced block with lang to <pre><code class="language-...">', () => {
  const text = '```python\nprint("hi")\n```';
  const html = renderProseText(text);
  assert.match(html, /<pre><code class="language-python">print\(&quot;hi&quot;\)<\/code><\/pre>/);
});

test('renderProseText defaults lang to "text" when fence has no language', () => {
  const text = '```\nplain code\n```';
  const html = renderProseText(text);
  assert.match(html, /<pre><code class="language-text">plain code<\/code><\/pre>/);
});

test('renderProseText splits surrounding paragraphs and a single fence', () => {
  const text = 'before\n```js\nlet a = 1;\n```\nafter';
  const html = renderProseText(text);
  assert.match(html, /<p>before<\/p>/);
  assert.match(html, /<pre><code class="language-js">let a = 1;<\/code><\/pre>/);
  assert.match(html, /<p>after<\/p>/);
});

test('renderProseText supports multiple fences interleaved with prose', () => {
  const text = '```py\nx = 1\n```\nmiddle\n```js\ny = 2\n```';
  const html = renderProseText(text);
  assert.match(html, /<pre><code class="language-py">x = 1<\/code><\/pre>/);
  assert.match(html, /<p>middle<\/p>/);
  assert.match(html, /<pre><code class="language-js">y = 2<\/code><\/pre>/);
});

test('renderProseText leaves non-fence Markdown (bold) as plain text', () => {
  const html = renderProseText('this is **bold** text');
  assert.equal(html, '<p>this is **bold** text</p>');
});

test('renderProseText escapes HTML inside a fenced block too', () => {
  const text = '```html\n<div>x</div>\n```';
  const html = renderProseText(text);
  assert.match(html, /<pre><code class="language-html">&lt;div&gt;x&lt;\/div&gt;<\/code><\/pre>/);
});
