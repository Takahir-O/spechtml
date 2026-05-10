import { readFile, writeFile, mkdir, rename, unlink, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decode, encode } from '@toon-format/toon';
import { assertSafeInputRealpath } from './utils/safe-path.js';

const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export async function applyPatchFile(sourcePath, patchPath, options = {}) {
  const cwd = options.cwd ?? process.cwd();
  const safeSource = await assertSafeInputRealpath(sourcePath, { allowedExt: ['.toon'], cwd });
  const safePatch = await assertSafeInputRealpath(patchPath, { allowedExt: ['.toon'], cwd });

  const [sourceText, patchText] = await Promise.all([
    readFile(safeSource, 'utf8'),
    readFile(safePatch, 'utf8'),
  ]);

  const doc = decode(sourceText, { strict: true });
  const patch = decode(patchText, { strict: true });

  const declaredTarget = patch.meta?.target;
  if (!declaredTarget) {
    throw new Error('patch.meta.target is required to prevent applying a patch to the wrong file.');
  }

  const declaredHash = patch.meta?.target_hash;
  if (!declaredHash) {
    throw new Error('patch.meta.target_hash is required (sha256 of source file content).');
  }

  let realTarget = null;
  try {
    realTarget = await realpath(resolve(cwd, String(declaredTarget)));
  } catch {
    realTarget = null;
  }
  if (realTarget !== safeSource) {
    throw new Error(
      `Patch target mismatch.\n` +
      `Patch declares: ${declaredTarget}\n` +
      `Source given:   ${sourcePath}`
    );
  }

  const expectedHash = String(declaredHash).replace(/^sha256:/i, '').trim();
  const actualHash = createHash('sha256').update(sourceText).digest('hex');
  if (expectedHash !== actualHash) {
    throw new Error(
      `Source hash mismatch. Patch was created against a different version of the document.\n` +
      `Expected: ${expectedHash.slice(0, 16)}...\n` +
      `Actual:   ${actualHash.slice(0, 16)}...`
    );
  }

  applyPatch(doc, patch);

  const encoded = encode(doc, { delimiter: '|' });
  try {
    decode(encoded, { strict: true });
  } catch (err) {
    throw new Error(`Patched output failed re-decode validation: ${err.message}`);
  }

  await mkdir(dirname(safeSource), { recursive: true });
  const tempPath = `${safeSource}.tmp.${process.pid}`;
  try {
    await writeFile(tempPath, encoded, 'utf8');

    const reverifyText = await readFile(safeSource, 'utf8');
    const reverifyHash = createHash('sha256').update(reverifyText).digest('hex');
    if (reverifyHash !== actualHash) {
      await unlink(tempPath).catch(() => {});
      throw new Error('Source changed during patch application — concurrent write detected.');
    }

    await rename(tempPath, safeSource);
  } catch (err) {
    await unlink(tempPath).catch(() => {});
    throw err;
  }

  return { output: safeSource };
}

export function applyPatch(doc, patch) {
  const snapshot = structuredClone(doc);

  for (const row of arrayOf(patch.replace)) {
    replaceAtPath(snapshot, row.path, row.value);
  }

  for (const row of arrayOf(patch.insert)) {
    const { path, index, ...value } = row;
    insertAtPath(snapshot, path, index, stripEmpty(value));
  }

  for (const row of arrayOf(patch.append)) {
    const { path, ...value } = row;
    appendAtPath(snapshot, path, stripEmpty(value));
  }

  for (const row of arrayOf(patch.add_section)) {
    const { key, index, body } = row;
    addSectionAtRoot(snapshot, key, index, body);
  }

  for (const row of arrayOf(patch.remove)) {
    removeAtPath(snapshot, row.path);
  }

  for (const key of Object.keys(doc)) delete doc[key];
  Object.assign(doc, snapshot);
}

function replaceAtPath(root, path, value) {
  const target = resolvePath(root, path, { parent: true });
  if (Array.isArray(target.parent)) {
    target.parent[target.key] = value;
    return;
  }
  if (!target.parent || typeof target.parent !== 'object') {
    throw new Error(`Cannot replace at ${path}`);
  }
  target.parent[target.key] = value;
}

function appendAtPath(root, path, value) {
  const target = resolvePath(root, path);
  if (!Array.isArray(target)) {
    throw new Error(`Append target is not an array: ${path}`);
  }
  target.push(value);
}

function insertAtPath(root, path, index, value) {
  const target = resolvePath(root, path);
  if (!Array.isArray(target)) {
    throw new Error(`Insert target is not an array: ${path}`);
  }
  const i = Number(index);
  if (!Number.isInteger(i) || i < 0) {
    throw new Error(`Insert index must be a non-negative integer: ${index}`);
  }
  const clamped = Math.min(i, target.length);
  target.splice(clamped, 0, value);
}

function addSectionAtRoot(root, key, index, body) {
  if (!key || typeof key !== 'string') {
    throw new Error('add_section requires a string `key`');
  }
  if (FORBIDDEN_KEYS.has(key)) {
    throw new Error(`Forbidden section key: ${key}`);
  }
  if (Object.hasOwn(root, key)) {
    throw new Error(`Section already exists: ${key}`);
  }
  if (!Array.isArray(root.order)) {
    throw new Error('add_section requires a top-level `order` array');
  }
  if (!body || typeof body !== 'object') {
    throw new Error('add_section requires an object `body`');
  }
  root[key] = body;
  const i = Number(index);
  if (!Number.isInteger(i) || i < 0) {
    root.order.push(key);
  } else {
    const clamped = Math.min(i, root.order.length);
    root.order.splice(clamped, 0, key);
  }
}

function removeAtPath(root, path) {
  const target = resolvePath(root, path, { parent: true });
  if (Array.isArray(target.parent)) {
    target.parent.splice(Number(target.key), 1);
    return;
  }
  if (!target.parent || typeof target.parent !== 'object') {
    throw new Error(`Cannot remove at ${path}`);
  }
  if (!Object.hasOwn(target.parent, target.key)) {
    throw new Error(`Remove target does not exist: ${path}`);
  }
  delete target.parent[target.key];
}

function resolvePath(root, path, options = {}) {
  if (!path || !path.startsWith('/')) {
    throw new Error(`Path must start with /: ${path}`);
  }

  const parts = path.split('/').filter(Boolean);
  let current = root;
  let parent = null;
  let key = null;

  for (const part of parts) {
    if (FORBIDDEN_KEYS.has(part)) {
      throw new Error(`Forbidden path segment: ${part}`);
    }
    parent = current;
    key = part;

    if (Array.isArray(current)) {
      const match = matchArrayPart(current, part);
      current = match.value;
      key = match.index;
      continue;
    }

    if (!current || typeof current !== 'object') {
      throw new Error(`Cannot traverse through non-object at ${part} in ${path}`);
    }

    if (!Object.hasOwn(current, part)) {
      const keys = Object.keys(current);
      const suggestion = suggestKey(part, keys);
      let hint = '';
      if (suggestion) {
        hint = ` (Did you mean "${suggestion}"?)`;
      } else if (keys.length > 0) {
        const preview = keys.slice(0, 5).join(', ');
        const more = keys.length > 5 ? `, ...` : '';
        hint = ` Available keys: ${preview}${more}`;
      }
      throw new Error(`Path segment does not exist: ${part} in ${path}${hint}`);
    }

    current = current[part];
  }

  return options.parent ? { parent, key, value: current } : current;
}

function matchArrayPart(array, part) {
  if (/^\d+$/.test(part)) {
    const index = Number(part);
    if (index >= array.length) throw new Error(`Array index out of range: ${part}`);
    return { index, value: array[index] };
  }

  const eq = part.indexOf('=');
  if (eq !== -1) {
    const field = part.slice(0, eq);
    const expected = part.slice(eq + 1);
    const index = array.findIndex((item) => String(item?.[field]) === expected);
    if (index === -1) throw new Error(`No row matches ${part}`);
    return { index, value: array[index] };
  }

  const index = array.findIndex((item) => String(item?.id) === part || String(item?.name) === part);
  if (index === -1) throw new Error(`No row matches ${part}`);
  return { index, value: array[index] };
}

function stripEmpty(value) {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== ''));
}

function suggestKey(actual, candidates) {
  if (!candidates.length) return null;
  const lower = actual.toLowerCase();
  const exactCi = candidates.find(k => k.toLowerCase() === lower);
  if (exactCi) return exactCi;
  const startsLike = candidates.find(k => {
    const kl = k.toLowerCase();
    return kl.startsWith(lower) || lower.startsWith(kl);
  });
  if (startsLike) return startsLike;
  const containsLike = candidates.find(k => k.toLowerCase().includes(lower) || lower.includes(k.toLowerCase()));
  return containsLike ?? null;
}

function arrayOf(value) {
  return Array.isArray(value) ? value : [];
}

const isMain = process.argv[1]
  ? resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isMain) {
  const fileArgs = process.argv.slice(2);
  if (fileArgs.length !== 2) {
    console.error('Usage: node apply-toon-patch.js <source.toon> <patch.toon>');
    console.error('The patch is applied in-place. Output goes back to <source.toon>.');
    process.exit(1);
  }

  const [sourcePath, patchPath] = fileArgs;
  try {
    const { output } = await applyPatchFile(sourcePath, patchPath);
    console.log(`Patched ${output}`);
  } catch (err) {
    console.error(err?.message ?? String(err));
    process.exit(1);
  }
}
