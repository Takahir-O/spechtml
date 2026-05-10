# spechtml Workflow

## Best Behavior

```txt
Human reads HTML
  -> Human gives visible id-based instruction
  -> LLM returns TOON patch
  -> Script applies patch to Compact TOON
  -> Script regenerates HTML
```

## Do Not

- Do not edit generated HTML by hand unless explicitly asked.
- Do not regenerate the full TOON document for a small change.
- Do not feed generated HTML back to LLM unless the visual layout is the topic.
- Do not compress long prose so aggressively that meaning becomes unclear.

## Natural Language Heavy Documents

For explanation documents, keep a hybrid shape:

```txt
short prose:
  note

structured facts:
  components / reqs / decisions / steps

code:
  snippet or source reference
```

This keeps LLM input compact while preserving human readability in the generated HTML.

## Edit Example

Human:

```txt
id10の部分を初心者向けに書き直して。
```

LLM:

```toon
meta:
  pf: spechtml-patch-v1
  v: 1
  target: docs/spec.compact.toon
  target_hash: sha256:<sha256 of docs/spec.compact.toon>

replace[1|]{path|value}:
  /stack/components/name=Tokio/purpose|Rustの非同期処理を動かすための実行基盤
```

Then run:

```bash
node ${CLAUDE_SKILL_DIR}/runtime/dist/apply-toon-patch.bundle.js docs/spec.compact.toon docs/spec.patch.toon
node ${CLAUDE_SKILL_DIR}/runtime/dist/cli.bundle.js docs/spec.compact.toon dist/spec.html
```

The applier takes exactly two arguments and writes back to the source file in place. `target_hash` (SHA-256 of the source content) is required.
