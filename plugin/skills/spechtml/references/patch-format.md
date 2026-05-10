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
| `replace` | replace a scalar or field |
| `append` | append a row object to an array (end of array) |
| `insert` | insert a row object into an array at a given index (added in v0.4) |
| `remove` | remove a key or row |
| `add_section` | add a new top-level section and place its key into `order` (added in v0.4) |

### `insert`

Use `insert` when **order matters** and the new row should go in the middle of the array (timelines, ordered steps). The applier clamps `index` to `[0, length]`.

```toon
insert[1|]{path|index|step|state|detail}:
  /timeline/steps|2|14:38|done|status page を更新
```

### `add_section`

Use `add_section` to add a brand-new top-level section. Provide the section `key`, the position in `order` (`index`, omit to append), and the section `body` as a nested object.

```toon
add_section[1]:
  - key: rate_limit
    index: 4
    body:
      title: Rate limit
      reqs[3|]{id|p|s|t|d}:
        RL1|M|A|上限|60 秒あたり 100 リクエスト
        RL2|M|A|超過時|HTTP 429 と Retry-After ヘッダで再試行秒数を通知
        RL3|M|A|単位|認証済みユーザー単位(同一トークン)
```

Constraints:

- The source TOON must already have a top-level `order` array.
- `key` must not already exist on the document root.
- `key` must not be one of `__proto__`, `prototype`, `constructor`.

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
- Use `replace` for text edits.
- Use `append` for new rows at the end of an ordered list.
- Use `insert` when the new row must go to a specific position (timelines, sorted lists).
- Use `add_section` when the user asks to add a brand-new chapter / section. Do NOT regenerate the whole TOON.
- Use `remove` only when the user clearly requests deletion.
- If the target visible id or path is ambiguous, ask for clarification.
