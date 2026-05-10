import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SafeUrlSchema } from '../skills/spechtml/runtime/schema.js';

test('SafeUrlSchema rejects javascript: URLs', () => {
  const result = SafeUrlSchema.safeParse('javascript:alert(1)');
  assert.equal(result.success, false);
});

test('SafeUrlSchema rejects data: URLs', () => {
  const result = SafeUrlSchema.safeParse('data:text/html,<script>alert(1)</script>');
  assert.equal(result.success, false);
});

test('SafeUrlSchema rejects file: URLs', () => {
  const result = SafeUrlSchema.safeParse('file:///etc/passwd');
  assert.equal(result.success, false);
});

test('SafeUrlSchema accepts https URLs', () => {
  const result = SafeUrlSchema.safeParse('https://example.com/page');
  assert.equal(result.success, true);
});

test('SafeUrlSchema accepts http URLs', () => {
  const result = SafeUrlSchema.safeParse('http://example.com');
  assert.equal(result.success, true);
});

test('SafeUrlSchema is case-insensitive on the scheme', () => {
  const result = SafeUrlSchema.safeParse('HTTPS://example.com');
  assert.equal(result.success, true);
});
