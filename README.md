**English** | [日本語](./README.ja.md)

# spechtml

Write lightweight Compact TOON, get beautiful HTML/Markdown.

A Claude Code plugin for the human-LLM document loop:

```txt
Compact TOON
  -> generated HTML for humans
  -> visible ref ids such as id10
  -> human asks LLM to edit id10
  -> LLM returns TOON patch
  -> script updates Compact TOON
  -> script regenerates HTML
```

## Install (Claude Code plugin)

```shell
/plugin marketplace add Takahir-O/spechtml
/plugin install spechtml@spechtml
```

For plugin usage details, see [plugin/README.md](./plugin/README.md).

## Repository layout

```
.
├── .claude-plugin/
│   └── marketplace.json    # marketplace catalog (root must contain this)
├── plugin/                 # everything that ships with /plugin install
│   ├── .claude-plugin/plugin.json
│   ├── skills/spechtml/    # SKILL.md, runtime/, runtime/dist/, references/
│   ├── README.md / README.ja.md
│   └── LICENSE
├── package.json            # development scripts (build, test, lefthook, render shortcuts)
├── package-lock.json
├── build.mjs               # esbuild bundle generator for runtime/dist/*.bundle.js
├── lefthook.yml            # pre-push npm audit / test / build
├── .nvmrc                  # Node 24 (Active LTS)
├── .editorconfig
├── CHANGELOG.md
├── SECURITY.md
├── README.md / README.ja.md
└── LICENSE
```

A local-only `dev/` workspace exists outside git for personal drafts and generated test output. It is not part of the distributable plugin.

## Local plugin testing

```bash
claude --plugin-dir ./plugin
```

After changing files in `plugin/`, run `/reload-plugins` inside Claude Code to apply changes without restarting.

## Local development

```bash
npm install                 # installs dev deps + registers lefthook hooks
npm run build               # rebuild runtime/dist/*.bundle.js (run after editing runtime sources)
npm test                    # node:test suite under plugin/test/
npm run render:spec-ja      # render a Compact TOON sample to HTML (local only)
npm run audit:root          # audit production dependencies
```

`render` scripts read from a local `dev/` workspace that is gitignored. They will fail in a fresh clone until you populate `dev/examples/` yourself.

## Dependency policy

All runtime dependencies are pinned to exact versions (no `^` or `~` prefixes) and locked via `package-lock.json` integrity hashes. This is a defense-in-depth measure against supply-chain attacks. Runtime code is shipped as esbuild bundles under `plugin/skills/spechtml/runtime/dist/*.bundle.js`, so the distributed plugin does not run `npm install` and does not fetch dependencies at runtime.

A pre-push git hook (managed by [lefthook](https://github.com/evilmartians/lefthook)) runs `npm audit --omit=dev --audit-level=moderate`, `npm test`, and `npm run build` against the root workspace in parallel. The push is rejected on moderate-or-higher vulnerabilities, test failures, or build errors.

Use `npm ci` instead of `npm install` in CI to enforce the lockfile strictly.

## License

MIT — see [LICENSE](./LICENSE).
