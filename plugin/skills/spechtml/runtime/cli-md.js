import { readFile, writeFile } from 'node:fs/promises';
import { decode } from '@toon-format/toon';
import { normalizeSpecDoc } from './normalize.js';
import { validateSpecDoc } from './validate.js';
import { renderMarkdown } from './render/markdown.js';
import { assertSafeInputRealpath, assertSafeOutputRealpath } from './utils/safe-path.js';

const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const fileArgs = args.filter(a => a !== '--json');
const inputPath = fileArgs[0];
const outputPath = fileArgs[1] ?? 'dist/specdoc.md';

if (!inputPath) {
  const err = { ok: false, error: 'Usage: node runtime/cli-md.js [--json] <input.toon> [output.md]' };
  if (jsonMode) console.log(JSON.stringify(err));
  else console.error(err.error);
  process.exit(1);
}

try {
  let safeInput, safeOutput;
  try {
    safeInput = await assertSafeInputRealpath(inputPath, { allowedExt: ['.toon'] });
    safeOutput = await assertSafeOutputRealpath(outputPath, { allowedExt: ['.md'] });
  } catch (e) {
    throw { phase: 'path', message: e.message };
  }

  const source = await readFile(safeInput, 'utf8');

  let doc;
  try {
    doc = decode(source, { strict: true });
  } catch (e) {
    throw { phase: 'decode', message: e.message };
  }

  const data = normalizeSpecDoc(doc);
  validateSpecDoc(data);

  await writeFile(safeOutput, renderMarkdown(data), 'utf8');

  const result = {
    ok: true,
    output: safeOutput,
    doc: {
      title: data.doc?.title ?? '',
      kind: data.doc?.kind ?? '',
      sections: data.sections?.length ?? 0
    }
  };

  if (jsonMode) console.log(JSON.stringify(result));
  else console.log(`Rendered ${result.output}`);
} catch (e) {
  const err = { ok: false, phase: e.phase ?? 'unknown', error: e.message ?? String(e) };
  if (jsonMode) console.log(JSON.stringify(err));
  else console.error(`Error (${err.phase}): ${err.error}`);
  process.exit(1);
}
