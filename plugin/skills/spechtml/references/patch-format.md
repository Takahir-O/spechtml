# TOON Patch Format

TOON patch is not an official TOON feature. It is an `spechtml-v1` convention for local document edits.

Use valid TOON.

## Shape

```toon
meta:
  pf: spechtml-patch-v1
  v: 1
  target: docs/spec.compact.toon
  target_hash: sha256:abc123def456...

append[1|]{path|name|cat|purpose|note}:
  /extractors/components|Form<T>|extractor|form bodyを構造体に変換する|HTML form向け

replace[1|]{path|value}:
  /overview/note|新しい概要文
```

`target_hash` is required. `apply-toon-patch.js` computes the SHA-256 of the source file content and refuses the patch if the value does not match. The leading `sha256:` prefix is optional. This prevents accidental application of patches against a stale version of a document.

`target` must resolve (via `fs.realpath`) to the same physical file as the `<source.toon>` argument passed on the command line. The applier rejects the patch if the realpath comparison fails, even when basenames look identical.

The applier takes exactly two arguments — `<source.toon>` and `<patch.toon>` — and writes the result back to `<source.toon>` in place.

## Operations

| operation | behavior |
|---|---|
| `append` | append a row object to an array |
| `replace` | replace a scalar or field |
| `remove` | remove a key or row |

## Paths

| path | meaning |
|---|---|
| `/overview/note` | section scalar field |
| `/extractors/components` | table in a section |
| `/cautions/reqs/id=C2/s` | field in row matched by id |
| `/fit/decisions/id=D5` | row matched by id |
| `/extractors/components/name=Json<T>` | row matched by name |

## Rules For LLMs

- Treat visible ids such as `id10` as render-local references. Resolve them through `data-ref`, `data-path`, or `spechtml-ref-map`, then emit a path-based patch.
- Return patch only; do not return regenerated HTML.
- Keep paths explicit.
- Preserve existing IDs.
- Use `append` for new rows.
- Use `replace` for text edits.
- Use `remove` only when the user clearly requests deletion.
- If the target visible id or path is ambiguous, ask for clarification.
