# Markdown round-trip — verified golden sample

This directory shows a complete, verified end-to-end round-trip of the
Markdown editing workflow described in the main `SKILL.md`.

## Files in this sample

| File | What it represents |
|---|---|
| `final.toon` | The source TOON document **after** the round-trip (post-patch state) |
| `before-edit.md` | The Markdown a team member started from (`cli-md.bundle.js` output of the original TOON) |
| `after-edit.md` | The Markdown after the team member edited line 7 (`実装はこんな感じ。` → `実装の概要は以下のとおり。`) |
| `patch.toon` | The TOON patch the LLM produced by reading the diff between `before-edit.md` and `after-edit.md` |
| `rendered-after-patch.md` | Re-rendering `final.toon` with `cli-md.bundle.js` yields exactly `after-edit.md` (diff: 0 lines) |

## Verified outcome

```bash
diff after-edit.md rendered-after-patch.md
# exit 0 — files are byte-identical
```

The round-trip is therefore lossless for the prose-text edit class of
changes. Structural changes (adding rows, sections, etc.) require the
LLM to choose the correct patch op (`insert`, `add_section`, etc.) — the
strict procedure in `SKILL.md` covers those branches.

## How this sample was generated

1. Authored `final.toon` (originally with `実装はこんな感じ。` as the prose lead-in)
2. `cli-md.bundle.js` → `before-edit.md`
3. Manually edited line 7 of `before-edit.md` and saved as `after-edit.md`
4. LLM read the diff and produced `patch.toon` (a single `replace` op
   targeting `/main/prose`)
5. `apply-toon-patch.bundle.js final.toon patch.toon` — patch applied
6. `cli-md.bundle.js final.toon` → `rendered-after-patch.md`
7. `diff after-edit.md rendered-after-patch.md` reported zero differences

The LLM's patch was generated with the help of
`plugin/skills/spechtml/scripts/md-diff-helper.mjs` (new in v0.3.2), which
extracts changed lines plus surrounding context as JSON for path inference.
Inside the installed plugin, this is reachable as
`${CLAUDE_SKILL_DIR}/scripts/md-diff-helper.mjs`.
