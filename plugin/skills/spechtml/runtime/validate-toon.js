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
    console.log(JSON.stringify({
      ok: false,
      phase: 'decode',
      error: e.message,
      suggestion: 'Check TOON syntax: indentation, array sizes, delimiter consistency'
    }));
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
