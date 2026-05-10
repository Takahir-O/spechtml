# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in spechtml, please report it privately:

1. Open a GitHub Security Advisory at https://github.com/Takahir-O/spechtml/security/advisories/new
2. Or contact the maintainer through the GitHub profile linked in `package.json`

Please do not file public issues for security vulnerabilities.

We aim to acknowledge reports within 7 days.

## Supply Chain Defense

All runtime dependencies are pinned to exact versions in `package.json` (no `^` or `~` prefixes) and verified by `package-lock.json` integrity hashes. Runtime code is shipped as standalone esbuild bundles under `plugin/skills/spechtml/runtime/dist/*.bundle.js`, so the distributed plugin does not perform `npm install` and does not fetch dependencies at runtime.

A `pre-push` git hook (managed by [lefthook](https://github.com/evilmartians/lefthook)) runs three commands in parallel against the root workspace: `npm audit --omit=dev --audit-level=moderate`, `npm test`, and `npm run build`. The push is rejected if a moderate-or-higher vulnerability is found, any test fails, or the bundle build fails.

To run the checks manually:

```bash
npm install              # registers lefthook git hooks via prepare script
npm run audit:root       # audit production dependencies
npm test                 # node:test suite under plugin/test/
npm run build            # esbuild — regenerate runtime/dist/*.bundle.js
```

## Dependency Update Policy

Dependencies are not auto-upgraded. To update a dependency:

1. Manually edit the version in `package.json` (root only — runtime is bundled, plugin/package.json is not part of the distribution)
2. Run `npm install --save-exact` to regenerate `package-lock.json` with new integrity hashes
3. Verify reproducibility via `npm ci`
4. Run `npm run audit:root && npm test && npm run build` before committing
5. Document the update in `CHANGELOG.md`

## Plugin Distribution Integrity

The plugin is distributed via Claude Code's marketplace mechanism. When users install `spechtml@spechtml`, Claude Code copies the `plugin/` directory into `~/.claude/plugins/cache/`. Because the runtime is shipped as esbuild bundles under `runtime/dist/*.bundle.js`, no install-time script runs and no network fetch is performed for runtime dependencies. The distributed bundle paths and the `Bash(node *runtime/dist/*.bundle.js *)` allow-list in `SKILL.md` are the only execution entry points.

Generated HTML that contains flowcharts loads Mermaid (`mermaid@11.14.0`) from `cdn.jsdelivr.net` with a fixed SRI integrity hash. This is browser-side fetch, not Node-side, and falls back to no diagram render if the CDN is unreachable.
