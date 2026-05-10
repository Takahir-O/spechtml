#!/usr/bin/env node
// Usage: node dev/verification/scripts/md-diff-helper.mjs <before.md> <after.md>
//
// Markdown round-trip ヘルパー(v0.3.2+):
//   2 つの MD ファイルを LCS diff し、変更行(追加/削除/置換)と前後 3 行の文脈を
//   JSON で出力する。LLM が「どの TOON path に replace / insert / remove を当てるか」
//   判断するための材料を機械化する。
//
// 出力フォーマット:
//   { changes: [{ kind: 'replace'|'add'|'remove', before_line, after_line, context_before, context_after, before, after }, ...] }
//
// 機械的なパス推論はしない(MD 表現と TOON 構造の対応は LLM が判断)。
import { readFileSync } from 'node:fs';

const [a, b] = process.argv.slice(2);
if (!a || !b) {
  console.error('Usage: node md-diff-helper.mjs <before.md> <after.md>');
  process.exit(1);
}

const linesA = readFileSync(a, 'utf8').split(/\r?\n/);
const linesB = readFileSync(b, 'utf8').split(/\r?\n/);

const ops = lcsOps(linesA, linesB);
const changes = collectChanges(ops, linesA, linesB);

console.log(JSON.stringify({
  before: a,
  after: b,
  total_changes: changes.length,
  changes,
}, null, 2));

function lcsOps(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  const ops = [];
  let i = m, j = n;
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      ops.push({ kind: 'eq', i: i - 1, j: j - 1 });
      i--; j--;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      ops.push({ kind: 'del', i: i - 1 });
      i--;
    } else {
      ops.push({ kind: 'add', j: j - 1 });
      j--;
    }
  }
  while (i > 0) { ops.push({ kind: 'del', i: i - 1 }); i--; }
  while (j > 0) { ops.push({ kind: 'add', j: j - 1 }); j--; }
  return ops.reverse();
}

function collectChanges(ops, a, b) {
  const out = [];
  let k = 0;
  while (k < ops.length) {
    const op = ops[k];
    if (op.kind === 'eq') { k++; continue; }
    const dels = [];
    const adds = [];
    let last = k;
    while (last < ops.length && ops[last].kind !== 'eq') {
      if (ops[last].kind === 'del') dels.push(ops[last].i);
      else adds.push(ops[last].j);
      last++;
    }
    const beforeLine = dels.length ? dels[0] + 1 : null;
    const afterLine = adds.length ? adds[0] + 1 : null;
    const ctxBeforeFrom = Math.max(0, (dels[0] ?? adds[0] ?? 0) - 3);
    const ctxBeforeTo = (dels[0] ?? adds[0] ?? 0);
    const ctxAfterFrom = (dels[dels.length - 1] ?? adds[adds.length - 1] ?? 0) + 1;
    const ctxAfterTo = Math.min(a.length, ctxAfterFrom + 3);
    out.push({
      kind: dels.length && adds.length ? 'replace' : dels.length ? 'remove' : 'add',
      before_line: beforeLine,
      after_line: afterLine,
      context_before: a.slice(ctxBeforeFrom, ctxBeforeTo),
      before: dels.map((i) => a[i]),
      after: adds.map((j) => b[j]),
      context_after: a.slice(ctxAfterFrom, ctxAfterTo),
    });
    k = last;
  }
  return out;
}
