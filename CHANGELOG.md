# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
