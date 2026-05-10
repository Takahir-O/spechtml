#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { decode } from '@toon-format/toon';
import { normalizeSpecDoc } from './normalize.js';
import { validateSpecDoc } from './validate.js';
import { assertSafeInputRealpath } from './utils/safe-path.js';

const inputPath = process.argv[2];

if (!inputPath) {
  console.log(JSON.stringify({ ok: false, error: 'Usage: node runtime/validate-toon.js <input.toon>' }));
  process.exit(1);
}

try {
  let safeInput;
  try {
    safeInput = await assertSafeInputRealpath(inputPath, { allowedExt: ['.toon'] });
  } catch (e) {
    console.log(JSON.stringify({ ok: false, phase: 'path', error: e.message }));
    process.exit(1);
  }

  const source = await readFile(safeInput, 'utf8');

  let doc;
  try {
    doc = decode(source, { strict: true });
  } catch (e) {
    const result = {
      ok: false,
      phase: 'decode',
      error: e.message,
      suggestion: 'Check TOON syntax: indentation, array sizes, delimiter consistency'
    };
    const hint = diagnoseDecodeError(e.message, source);
    if (hint) {
      result.line_content = hint.line_content;
      result.diagnosis = hint.diagnosis;
    }
    console.log(JSON.stringify(result));
    process.exit(1);
  }

  const data = normalizeSpecDoc(doc);
  validateSpecDoc(data);

  const sections = data.sections.map(s => ({
    id: s.id,
    title: s.title,
    blocks: data.blocks.filter(b => b.section === s.id).length
  }));

  console.log(JSON.stringify({
    ok: true,
    doc: {
      title: data.doc?.title ?? '',
      kind: data.doc?.kind ?? '',
      sections: sections.length,
      blocks: data.blocks?.length ?? 0
    },
    sections,
    profile: doc.meta?.pf ?? 'unknown'
  }));
} catch (e) {
  console.log(JSON.stringify({
    ok: false,
    phase: e.phase ?? 'validate',
    error: e.message ?? String(e)
  }));
  process.exit(1);
}

function diagnoseDecodeError(message, source) {
  const m = message.match(/^Line (\d+): Expected (\d+) tabular row values, but got (\d+)/);
  if (!m) return null;
  const lineNum = parseInt(m[1], 10);
  const expected = parseInt(m[2], 10);
  const got = parseInt(m[3], 10);
  const lines = source.split(/\r?\n/);
  const lineContent = lines[lineNum - 1] ?? '';
  const diagnosis = [];
  if (got > expected) {
    const extra = got - expected;
    diagnosis.push(`値内に \`|\` が ${extra} 個多く含まれているように見えます`);
    diagnosis.push('対処案: 値内の縦棒を `/` か言葉に置換するか、値全体を `"` で quote してください');
  } else if (got < expected) {
    const missing = expected - got;
    diagnosis.push(`値が ${missing} 個不足しています`);
    diagnosis.push('対処案: 空フィールドは空文字列として明示し、列数を保ってください');
  }
  return { line_content: lineContent, diagnosis };
}
