# spechtml-v1 Compact TOON Profile

Use official TOON syntax. Do not fork TOON.

## Minimal Shape

```toon
meta:
  pf: spechtml-v1
  v: 1
doc:
  t: ドキュメントのタイトル
  k: learning
  lang: ja
order[3]: overview, details, flow

overview:
  t: 概要
  note: 短い背景説明を書く。
```

`order` defines render order. Each top-level section object contains content blocks.

## Common Abbreviations

| short | canonical |
|---|---|
| `pf` | profile |
| `v` | version |
| `t` | title |
| `sub` | subtitle |
| `k` | kind |
| `r` | requirements |
| `p` | priority |
| `s` | status (in reqs/decisions/requirements context)<br>state (in steps/timeline context only) |
| `d` | description |
| `cat` | category |
| `rec` | recommendation |

**Note**: `s` means `status` in reqs/decisions/requirements tables, and `state` in steps/timeline tables. When ambiguity is possible, use the canonical form `status` or `state`.

## Enum Codes

| short | canonical |
|---|---|
| `M` | must |
| `S` | should |
| `C` | could |
| `A` | accepted |
| `P` | planned |
| `B` | blocked |
| `D` | done |

## Standard Blocks

### Requirements

```toon
reqs[2|]{id|p|s|t|d}:
  R1|M|A|HTMLを直接書かない|LLMはCompact TOONを出力する
  R2|S|P|Skill化する|検証と変換を固定する
```

### Components

```toon
components[2|]{name|cat|purpose|note}:
  Json<T>|extractor|JSON bodyを構造体に変換する|APIでよく使う
```

### Decisions

```toon
decisions[2|]{id|option|score|tradeoff|recommend}:
  D1|Markdown|6|自然文に強いが構造復元が弱い|軽いメモに残す
```

### Flow

```toon
nodes[2|]{id|label|kind}:
  req|HTTP request|input
  res|HTTP response|output
edges[1|]{from|to|label}:
  req|res|process
```

### Steps

```toon
steps[2|]{step|state|detail}:
  route選択|done|Routerがpathとmethodでhandlerを選ぶ
```

### Code Notes

```toon
notes[1|]{file|line|concept|note}:
  src/main.rs|1|handler|handlerはasync関数として書く
```

## Visible Reference IDs

Generated HTML should expose short visible reference IDs such as `id10`.
Humans should point at those IDs when asking for edits:

```txt
id10の部分を初心者向けに書き直して
```

Each visible ID must map to a machine path:

```html
<div data-ref="id10" data-path="/stack/components/name=Tokio">...</div>
```

The generated HTML may also include semantic section labels like `OVERVIEW-COMPONENTS`, but those are secondary. Human edit instructions should prefer `id10` style references because they can point to smaller parts.
