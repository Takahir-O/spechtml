---
description: >
  Create and edit human-readable instruction, explanation, review, and learning
  documents through Compact TOON, TOON patch, HTML, and Markdown. Use when the
  user wants LLM-friendly documents, TOON-based document normalization,
  HTML/Markdown generation from TOON, visible id-based document edits, or
  scripts/skills for a human-to-LLM document workflow.
allowed-tools:
  - Bash(node */runtime/dist/cli.bundle.js *)
  - Bash(node */runtime/dist/cli-md.bundle.js *)
  - Bash(node */runtime/dist/apply-toon-patch.bundle.js *)
  - Bash(node */runtime/dist/validate-toon.bundle.js *)
---

# spechtml

Use this skill to keep human-facing documents and LLM-facing inputs in sync.

**The human never runs commands.** Write files and execute scripts yourself.

## Quick Reference: Abbreviation Table

Memorize these abbreviations before generating any TOON.

| short | canonical | context |
|---|---|---|
| `t` | title | doc, section, reqs, steps |
| `k` | kind | doc |
| `p` | priority | reqs |
| `s` | status | reqs, decisions |
| `s` | state | steps (timeline only) |
| `d` | description | reqs |
| `cat` | category | components |
| `rec` | recommendation | decisions |

| code | canonical |
|---|---|
| `M` | must |
| `S` | should |
| `C` | could |
| `A` | accepted |
| `P` | planned |
| `B` | blocked |
| `D` | done |

**Important**: `s` means `status` in reqs/decisions, but means `state` in steps/timeline. When ambiguity is possible, use the canonical form `status` or `state`.

## Core Rule

```
Do not make HTML the source of truth.
Use Compact TOON for LLM exchange.
Use HTML/Markdown as human views.
Use TOON patch for edits.
```

- Never edit generated HTML directly.
- Never feed generated HTML back to the LLM unless visual layout is the task.
- Always keep Compact TOON as the editable source of truth.

## New Document Workflow

When the user asks to create a document:

1. Choose block types based on content (see Block Selection Guide).
2. Construct Compact TOON using the `spechtml-v1` profile.
3. **Write** the TOON to a file (e.g., `docs/spec.compact.toon`).
4. **Execute** the renderer immediately:

```bash
node ${CLAUDE_SKILL_DIR}/runtime/dist/cli.bundle.js docs/spec.compact.toon dist/spec.html
```

5. Tell the user: "Generated `dist/spec.html`. Open it in a browser and let me know if you want to edit anything by its id number."

### What the human sees

The generated HTML has visible reference IDs (`id10`, `id11`, ...) on every section, block, and row. The human reads the HTML and can say:

```
id10 を初心者向けに書き直して
```

They never need to touch a terminal.

## Edit Workflow

When the human asks for changes by visible id:

### Step 1 — Resolve id to data-path

Read the generated HTML file and find the `data-ref` and `data-path` attributes:

```html
<div data-ref="id10" data-stable-id="dd9ec098" data-path="/stack/components/name=Tokio">
```

The key field is `data-path`. For this id10, the path is `/stack/components/name=Tokio`.

### Step 2 — Write a TOON patch file

```toon
meta:
  pf: spechtml-patch-v1
  v: 1
  target: docs/spec.compact.toon
  target_hash: sha256:<sha256 of docs/spec.compact.toon>

replace[1|]{path|value}:
  /stack/components/name=Tokio/purpose|Rustの非同期処理を動かすための実行基盤
```

`target_hash` is required. Compute it from the current source file (e.g. `Get-FileHash -Algorithm SHA256` on Windows, `shasum -a 256` on POSIX). The applier will refuse the patch if the hash does not match.

Write it to `docs/spec.patch.toon`.

### Step 3 — Apply the patch and re-render

```bash
node ${CLAUDE_SKILL_DIR}/runtime/dist/apply-toon-patch.bundle.js docs/spec.compact.toon docs/spec.patch.toon
node ${CLAUDE_SKILL_DIR}/runtime/dist/cli.bundle.js docs/spec.compact.toon dist/spec.html
```

**The patch is applied in-place.** The applier overwrites the source file, so no third argument is accepted.

### Step 4 — Tell the human

"Updated id10 in `dist/spec.html`. Refresh the page to see the change."

### What NOT to do

- Do NOT edit the HTML file directly.
- Do NOT regenerate the entire TOON for a single field change.
- Do NOT ask the human to run commands.

## Human Feedback Loop — All Variants

| Human says | Action |
|---|---|
| "id10 をもっと平易に" | `replace` the field at id10's data-path |
| "id10 の後に新しい項目を追加" | `append` to the table containing id10 |
| "id10 と id12 の間に新しい行を入れて" | `insert` with the index between id10 and id12 (v0.4) |
| "id10 を削除" | `remove` the row at id10's data-path |
| "id5 の優先度を must に" | `replace` the priority/status field |
| "新しいセクションを追加" | `add_section` with `key`, `index`, and `body` (v0.4) |

For any edit, always: write patch → apply in-place → re-render → notify human.

## Block Selection Guide

**Templates exist as reference examples only. The primary workflow is to select blocks based on content.**

### Block Catalog

Each block maps to a specific semantic need. Learn all of them.

| Block | TOON syntax | When to use | Example |
|---|---|---|---|
| `note` | `note: text` | Short prose, background, summary, conclusion (1-3 sentences) | `note: TOONは人間とLLMの中間表現として使うフォーマット。` |
| `prose` | `prose: text` | Long-form explanation, narrative context | `prose: この設計判断の背景には...` |
| `metrics` | `metrics[N\|]{label\|value\|caption}:` | Key values, design targets, KPI summary | Throughput, SLA, team size |
| `reqs` | `reqs[N\|]{id\|p\|s\|t\|d}:` | Requirements, constraints, cautions, action items | `R1\|M\|A\|制約\|理由` |
| `decisions` | `decisions[N\|]{id\|option\|score\|tradeoff\|recommend}:` | Options, tradeoffs, recommendations | `D1\|方式A\|8\|tradeoff\|理由` |
| `components` | `components[N\|]{name\|cat\|purpose\|note}:` | Concepts, parts, API elements, terms, catalog | `Json<T>\|extractor\|用途\|補足` |
| `steps` | `steps[N\|]{step\|state\|detail}:` | Ordered process, timeline, workflow, operation log | `request到着\|done\|説明` |
| `nodes`+`edges` | `nodes[N\|]{id\|label\|kind}:` + `edges[N\|]{from\|to\|label}:` | Flowchart, data flow, architecture diagram | kinds: input/process/output/event/decision |
| `notes` | `notes[N\|]{file\|line\|concept\|note}:` | Code annotations, inline explanations | `src/main.rs\|42\|handler\|説明` |
| `snippets` | `snippets[N\|]{lang\|path\|lines\|code}:` | Code examples with file reference and line numbers | `rust\|src/main.rs\|1-10\|fn main() {` |
| `controls` | `controls[N\|]{id\|label\|kind\|min\|max\|step\|value\|options}:` | Interactive sliders, toggles, selects | kinds: slider/toggle/select |
| `relations` | `relations[N\|]{from\|to\|type}:` | Cross-references between requirements, decisions, etc. | `reqs/C1\|decisions/D1\|addresses` |

### Decision Flow

```
What is the content?

  Structured data (rows with consistent fields)?
    → Component/API list?            → components
    → Requirements/constraints?      → reqs
    → Options with tradeoffs?        → decisions
    → Ordered steps/timeline?        → steps
    → Code annotations?              → notes
    → Cross-block references?        → relations

  Short text (1-3 sentences)?
    → note

  Long text (paragraphs)?
    → prose

  Key-value metrics?
    → metrics

  Flow/diagram?
    → nodes + edges (Mermaid)

  Code to display?
    → snippets (with path/lines/lang)

  User-configurable parameters?
    → controls
```

### Composition Patterns by Document Type

These are patterns, not templates. Select blocks from the catalog above.

| Document type | Primary blocks | Secondary blocks |
|---|---|---|
| API specification | components, reqs, snippets | decisions, notes, metrics |
| Architecture Decision Record | decisions, prose, relations | reqs, metrics |
| Incident report | steps, metrics, prose | components, reqs |
| Learning material | prose, snippets, components | nodes+edges, notes, controls |
| Code review | reqs, notes, snippets | decisions, prose |

No document type requires all blocks. Use only what the content demands.

## Natural Prose And Code

Do not force everything into tables.

Use:
- `note` for short prose, background, summaries
- `components`, `reqs`, `decisions`, `steps` for structured content
- `notes` for code explanations
- File reference (`file` + `lines`) for long code instead of embedding full code

For long code, prefer a file reference:

```toon
notes[1|]{file|line|concept|note}:
  src/main.rs|42-58|handler|async fn handler(...) -> impl IntoResponse
```

Over embedding a full code block in TOON.

## Common Pitfalls

### Pitfall 1: Editing generated HTML

**Wrong**: Open `dist/spec.html`, edit text.
**Right**: Write a TOON patch, apply it in-place, re-render.
**Why**: HTML is not the source of truth. Edits to HTML will be lost on re-render.

### Pitfall 2: Full TOON regeneration for a small change

**Wrong**: When the human says "fix id10", regenerate the entire TOON.
**Right**: Write a 3-line patch targeting the specific data-path.
**Why**: Full regeneration wastes tokens and risks unintended changes.

### Pitfall 3: Using the wrong `s` abbreviation

**Wrong**: Writing `s: D` in a requirement row.
**Right**: For reqs/decisions, `s` = status (A/P/B/D). For steps, use canonical `state`.
**Why**: Context-dependent ambiguity causes validation errors.

### Pitfall 4: Omitting `meta.profile`

**Wrong**: Starting a TOON document without `meta: pf: spechtml-v1`.
**Right**: Always include the meta block.
**Why**: The renderer may not recognize the compact format without it.

### Pitfall 5: Asking the human to run commands

**Wrong**: "Run `node src/cli.js ...` to render."
**Right**: Execute the command yourself with the Bash tool.
**Why**: The human's role is to read output and give instructions, nothing else.

## Verification Checklist

Before executing a render or patch:

1. **[ ] Path syntax**: Starts with `/`, uses `/` separators, row selectors use `=` (e.g., `/section/table/name=Tokio`)
2. **[ ] Abbreviations correct**: `t` not `title`, `p` not `prio`, `s` not `state` (in reqs context)
3. **[ ] Enum codes valid**: Priority is M/S/C, Status is A/P/B/D
4. **[ ] Array sizes match**: `replace[N|]{fields}` — N must equal the number of rows that follow
5. **[ ] Patch applies in-place**: `apply-toon-patch.js` output goes to the same file as source

## References

Read only what is needed:

- `references/profile-v1.md`: Full abbreviation table, all standard block schemas.
- `references/patch-format.md`: TOON patch format, path rules, operation reference.
- `references/workflow.md`: End-to-end behavior for human/LLM document loops.

## Scripts

All paths use `${CLAUDE_SKILL_DIR}/runtime/dist/`. Execute them yourself — do not tell the human to run them. The runtime is shipped as standalone Node bundles, so no `npm install` or `NODE_PATH` is needed.

All input and output paths must be relative to the human's current working directory and must end in the expected extension (`.toon` for inputs, `.html`/`.md` for outputs). Paths that escape the working directory (`..`, absolute paths outside cwd) are rejected.

Validate a TOON file before rendering:

```bash
node ${CLAUDE_SKILL_DIR}/runtime/dist/validate-toon.bundle.js <input.toon>
```

Render Compact TOON to HTML:

```bash
node ${CLAUDE_SKILL_DIR}/runtime/dist/cli.bundle.js <input.toon> <output.html>
```

Render Compact TOON to Markdown:

```bash
node ${CLAUDE_SKILL_DIR}/runtime/dist/cli-md.bundle.js <input.toon> <output.md>
```

Apply a TOON patch (in-place — output goes back to the source file):

```bash
node ${CLAUDE_SKILL_DIR}/runtime/dist/apply-toon-patch.bundle.js <source.toon> <patch.toon>
```

The patch must declare `meta.target` (matching the source path's basename or relative form) and `meta.target_hash` (SHA-256 of the source file). The applier verifies both before writing.
