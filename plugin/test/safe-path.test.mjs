import { test } from 'node:test';
import assert from 'node:assert/strict';
import { assertSafePath } from '../skills/spechtml/runtime/utils/safe-path.js';

const cwd = process.cwd();

test('null byte in path is rejected', () => {
  assert.throws(
    () => assertSafePath('foo\0.toon', { allowedExt: ['.toon'], cwd }),
    /null byte/
  );
});

test('absolute path is rejected', () => {
  const absolute = process.platform === 'win32' ? 'C:\\foo.toon' : '/tmp/foo.toon';
  assert.throws(
    () => assertSafePath(absolute, { allowedExt: ['.toon'], cwd }),
    /Absolute paths are not allowed/
  );
});

test('parent traversal is rejected', () => {
  assert.throws(
    () => assertSafePath('../foo.toon', { allowedExt: ['.toon'], cwd }),
    /escapes the working directory/
  );
});

test('disallowed extension is rejected', () => {
  assert.throws(
    () => assertSafePath('foo.txt', { allowedExt: ['.toon'], cwd }),
    /disallowed extension/
  );
});

test('empty input is rejected', () => {
  assert.throws(
    () => assertSafePath('', { allowedExt: ['.toon'], cwd }),
    /non-empty string/
  );
});

test('valid relative path is accepted and normalized to an absolute path', () => {
  const result = assertSafePath('subdir/foo.toon', { allowedExt: ['.toon'], cwd });
  assert.ok(result.endsWith('foo.toon'), 'returned path should end with foo.toon');
  assert.ok(result.startsWith(cwd), 'returned path should be under cwd');
});

test('multiple allowed extensions are honored', () => {
  const result = assertSafePath('out.html', { allowedExt: ['.html', '.md'], cwd });
  assert.ok(result.endsWith('out.html'));
});

test('cwd-internal filename starting with .. (e.g. ..foo) is accepted, not over-rejected', () => {
  const result = assertSafePath('..foo.toon', { allowedExt: ['.toon'], cwd });
  assert.ok(result.endsWith('..foo.toon'));
});

test('cwd-internal subdir filename starting with .. is accepted', () => {
  const result = assertSafePath('subdir/..bar.toon', { allowedExt: ['.toon'], cwd });
  assert.ok(result.endsWith('..bar.toon'));
});

test('parent traversal `..` alone is rejected', () => {
  assert.throws(
    () => assertSafePath('..', { allowedExt: ['.toon'], cwd }),
    /escapes the working directory|disallowed extension/
  );
});
