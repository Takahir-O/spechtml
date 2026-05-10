**English** | [日本語](./README.ja.md)

# spechtml plugin

A Claude Code plugin that keeps human-facing documents and LLM-facing inputs in sync through Compact TOON, deterministic HTML rendering, and visible id-based patches.

## Install

```shell
/plugin marketplace add Takahir-O/spechtml
/plugin install spechtml@spechtml
```

Once installed, the skill is available as `/spechtml:spechtml`. Claude also auto-invokes it when the user asks to create or edit TOON-based documents.

## What the skill does

1. Writes Compact TOON source files (the editable source of truth)
2. Renders them to HTML with visible `id10`-style reference ids
3. Accepts human edits like *"Rewrite id10 for beginners"*
4. Produces a 3-line TOON patch and applies it in-place
5. Regenerates the HTML

The human only reads the generated HTML and gives instructions. The skill executes every render and patch.

See [skills/spechtml/SKILL.md](./skills/spechtml/SKILL.md) for the full skill definition.

## Plugin layout

```
.claude-plugin/
  plugin.json              # plugin manifest
skills/
  spechtml/
    SKILL.md               # skill body
    runtime/               # TOON renderer + patch applier source
    runtime/dist/          # esbuild-produced bundles invoked by the skill
    references/            # supporting docs auto-loaded by the skill
README.md
README.ja.md
LICENSE
```

## Local development

```bash
claude --plugin-dir .
```

After modifying any file under this directory, run `/reload-plugins` inside Claude Code to pick up the change without restarting.

The full repository (including development sources, examples, and design docs) lives at:
https://github.com/Takahir-O/spechtml

## Dependencies

Runtime dependencies are pinned to exact versions for supply-chain defense:

- `@toon-format/toon` 2.2.0
- `zod` 4.4.3

The runtime (TOON parsing, normalization, rendering, patch application) is bundled into `runtime/dist/*.bundle.js` via esbuild — `npm install` is not run when the plugin is installed, and no Node-side network fetch happens at runtime.

When a generated HTML page contains flowcharts, the page itself loads Mermaid (`mermaid@11.14.0`) from `cdn.jsdelivr.net` with a fixed SRI integrity hash. This is a browser-side fetch and is the only network surface; a page without flowcharts opens fully offline.

## License

MIT — see [LICENSE](./LICENSE).
