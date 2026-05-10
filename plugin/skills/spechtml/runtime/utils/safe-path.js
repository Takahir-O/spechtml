import { resolve, relative, extname, isAbsolute, dirname, sep } from 'node:path';
import { realpath, lstat, mkdir } from 'node:fs/promises';

function escapesCwd(rel) {
  return rel === '..' || rel.startsWith('..' + sep) || isAbsolute(rel);
}

export function assertSafePath(input, { allowedExt, cwd = process.cwd() } = {}) {
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Path must be a non-empty string');
  }

  if (input.includes('\0')) {
    throw new Error(`Path contains a null byte: ${input}`);
  }

  if (isAbsolute(input)) {
    throw new Error(`Absolute paths are not allowed: ${input}`);
  }

  const absolute = resolve(cwd, input);
  const rel = relative(cwd, absolute);

  if (escapesCwd(rel)) {
    throw new Error(`Path escapes the working directory: ${input}`);
  }

  if (Array.isArray(allowedExt) && allowedExt.length > 0) {
    const ext = extname(absolute).toLowerCase();
    if (!allowedExt.includes(ext)) {
      throw new Error(
        `Path has disallowed extension "${ext || '(none)'}". Allowed: ${allowedExt.join(', ')}. Got: ${input}`
      );
    }
  }

  return absolute;
}

export async function assertSafeInputRealpath(input, options = {}) {
  const safe = assertSafePath(input, options);
  const cwd = options.cwd ?? process.cwd();
  const cwdReal = await realpath(cwd);
  const inputReal = await realpath(safe);
  const rel = relative(cwdReal, inputReal);
  if (escapesCwd(rel)) {
    throw new Error(`Input path resolves outside the working directory via symlink: ${input}`);
  }
  return inputReal;
}

export async function assertSafeOutputRealpath(output, options = {}) {
  const safe = assertSafePath(output, options);
  const cwd = options.cwd ?? process.cwd();
  const cwdReal = await realpath(cwd);

  await mkdir(dirname(safe), { recursive: true });

  const outDirReal = await realpath(dirname(safe));
  const rel = relative(cwdReal, outDirReal);
  if (escapesCwd(rel)) {
    throw new Error(`Output directory resolves outside the working directory via symlink: ${output}`);
  }

  try {
    const lst = await lstat(safe);
    if (lst.isSymbolicLink()) {
      throw new Error(`Output path is an existing symlink: ${output}`);
    }
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }

  return safe;
}
