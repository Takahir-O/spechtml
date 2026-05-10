# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.2] - 2026-05-11

### Added
- `renderProseText` in `runtime/render/blocks.js`: triple-backtick code fences inside `prose` are now rendered as `<pre><code class="language-...">`. Other Markdown syntax (bold, links, tables) remains plain text by design (Simplicity First; no `marked` dependency added).
- SKILL.md gains "Code blocks inside `prose` (v0.3.1+)" and "Markdown round-trip workflow (v0.3.1+)" sections, documenting the LLM-mediated MD→TOON-patch flow recommended for team review.
- 8 new tests in `plugin/test/prose.test.mjs` covering plain prose, escape, fence with/without lang, multiple fences, and bold-as-plain-text behavior.

### Notes
- TOON SPEC v3 has no YAML-style block scalar; `prose` must be written as a `\n`-escaped quoted string. spechtml's Core Rule keeps TOON in the LLM's lane, so this is not a human-facing UX issue.
- Token-efficiency note: prose-fence vs. existing snippets block — prose-fence is ~57% (3-line code) to ~67% (10-line code) of snippets' tokens because the snippets header is heavier.

## [0.3.1] - 2026-05-11

### Added
- `insert` patch op: insert a row into an array at a given index (clamped to `[0, length]`). Solves the "append-only" limitation observed in postmortem-style timelines where order matters.
- `add_section` patch op: add a brand-new top-level section and place its key into `order` in a single operation. Eliminates the need to re-emit the entire TOON document when adding chapters.
- `validate-toon` now returns `line_content` and `diagnosis` for tabular row-count mismatches, with explicit hints (e.g., "値内に `|` が N 個多く含まれているように見えます") to shorten retry loops on syntax errors.
- `apply-toon-patch` path resolver now suggests a similar key (`Did you mean "..."?`) or lists available keys when a path segment does not exist.
- `dev/verification/scripts/diff-stats.mjs` switched from multiset approximation to LCS-based diff for accurate order-aware churn measurement.
- `dev/verification/scripts/measure-tokens.mjs` learned a `--cached <N>` option that estimates billed tokens under Anthropic prompt caching (90% off on cached input).
- Documentation: `references/patch-format.md`, `SKILL.md`, and `format-prompts/spechtml-edit.md` updated to reflect the new operations.

### Notes
- Versioned as a PATCH bump (0.3.0 → 0.3.1) per repository policy. Strictly under semver this would be a MINOR bump (new patch ops added).

### Future (not in this release)
- Stable-mode for `apply-toon-patch` that minimizes incidental re-serialization diff (LIM4 in the verification report). Requires changes to upstream `@toon-format/toon` encode options or a custom serializer.

## [0.3.0] - 2026-05-10

Initial public release.

### Added
- `spechtml` skill for the Compact TOON document loop (write Compact TOON, render to HTML/Markdown, edit via visible id-based TOON patches)
- Compact TOON renderer with deterministic HTML output and visible reference ids (`id10`, `id11`, ...)
- TOON patch applier with realpath-based target validation, mandatory `target_hash` (SHA-256) verification, prototype-pollution-resistant path resolution, two-stage hash recheck before in-place rewrite, and post-write re-decode validation
- esbuild bundles (`runtime/dist/*.bundle.js`) shipped inside the plugin so users do not need `npm install` or runtime network access (the bundles cover the four CLI entries: `cli`, `cli-md`, `apply-toon-patch`, `validate-toon`)
- Symlink-aware path safety: CLI inputs and outputs are validated against cwd via `realpath` and `lstat` to reject symlink-based escapes
- Marketplace catalog (`.claude-plugin/marketplace.json`) for `/plugin install spechtml@spechtml`
- Pre-push checks via lefthook (`npm audit --omit=dev --audit-level=moderate`, `npm test`, `npm run build` against the root workspace, in parallel)
- Bilingual READMEs (English / Japanese) at the repository root and inside `plugin/`
- SECURITY.md describing vulnerability reporting and supply-chain policy
- THIRD_PARTY_NOTICES files (`runtime/dist/*.bundle.js.LEGAL.txt`) emitted by esbuild for MIT-licensed runtime dependencies
- `.nvmrc` (Node 24) and `.editorconfig`
