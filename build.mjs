#!/usr/bin/env node
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { rm, readFile, writeFile } from 'node:fs/promises';

const ROOT = dirname(fileURLToPath(import.meta.url));
const RUNTIME = join(ROOT, 'plugin', 'skills', 'spechtml', 'runtime');
const DIST = join(RUNTIME, 'dist');
const PLUGIN = join(ROOT, 'plugin');

await rm(DIST, { recursive: true, force: true });

const entries = [
  'cli.js',
  'cli-md.js',
  'apply-toon-patch.js',
  'validate-toon.js'
];

const results = await Promise.all(entries.map(async (entry) => {
  const outName = entry.replace(/\.js$/, '.bundle.js');
  const result = await build({
    entryPoints: [join(RUNTIME, entry)],
    bundle: true,
    outfile: join(DIST, outName),
    platform: 'node',
    target: 'node22',
    format: 'esm',
    minify: true,
    legalComments: 'external',
    sourcemap: false,
    metafile: true
  });
  const bytes = Object.values(result.metafile.outputs)[0]?.bytes ?? 0;
  return { outName, bytes };
}));

for (const { outName, bytes } of results) {
  const kb = (bytes / 1024).toFixed(1);
  console.log(`built ${outName}  (${kb} KB)`);
}

// Aggregate license texts of bundled runtime dependencies into THIRD_PARTY_NOTICES.md
const RUNTIME_DEPS = ['@toon-format/toon', 'zod'];
const noticeLines = [
  '# Third-Party Notices',
  '',
  'The esbuild bundles under `skills/spechtml/runtime/dist/*.bundle.js` include the following dependencies.',
  'Their license texts are reproduced below as required by their respective licenses.',
  ''
];
for (const dep of RUNTIME_DEPS) {
  const licensePath = join(ROOT, 'node_modules', dep, 'LICENSE');
  let text;
  try {
    text = await readFile(licensePath, 'utf8');
  } catch {
    try {
      text = await readFile(join(ROOT, 'node_modules', dep, 'LICENSE.md'), 'utf8');
    } catch (err) {
      console.warn(`warn: could not read LICENSE for ${dep}: ${err.message}`);
      continue;
    }
  }
  noticeLines.push('---', '', `## ${dep}`, '', '```', text.trim(), '```', '');
}
await writeFile(join(PLUGIN, 'THIRD_PARTY_NOTICES.md'), noticeLines.join('\n'), 'utf8');
console.log('wrote plugin/THIRD_PARTY_NOTICES.md');
