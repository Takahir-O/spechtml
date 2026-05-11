export function styles() {
  return `
/* ============================================================
   spechtml — note-inspired light theme
   (https://github.com/kzhrknt/awesome-design-md-jp/tree/main/design-md/note)
   ============================================================ */
:root {
  color-scheme: light;
  --bg:        #ffffff;
  --bg-soft:   #f5f8fa;
  --panel:     #ffffff;

  --ink:       #08131a;
  --ink-2:     rgba(8,19,26,0.66);
  --muted:     #5a656b;
  --faint:     rgba(8,19,26,0.14);

  --rule:      rgba(8,19,26,0.14);
  --rule-soft: #f5f8fa;

  --accent:    #08131a;
  --accent-bg: #f5f8fa;
  --accent-2:  #292d9e;
  --brand:     #5ac8b8;

  --c-must:    #b22323;   --c-must-bg:    #fdf3f3;
  --c-should:  #916626;   --c-should-bg:  #fefbea;
  --c-could:   #1e7b65;   --c-could-bg:   #e6f6f2;
  --c-done:    #1e7b65;
  --c-next:    #916626;
  --c-blocked: #5a656b;

  --code-bg:        #08131a;
  --code-shoulder:  #202a30;
  --code-fg:        hsla(0,0%,100%,0.90);
  --code-mute:      #aeb7bd;
  --code-rule:      rgba(255,255,255,0.10);

  --elevation-1: 0px 1px 3px 1px rgba(0,0,0,0.14), 0px 1px 2px 0px rgba(0,0,0,0.22);
  --elevation-4: 0px 4px 8px 3px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.22);
  --elevation-6: 0px 6px 10px 4px rgba(0,0,0,0.14), 0px 2px 3px 0px rgba(0,0,0,0.22);

  --sans: "Helvetica Neue", "Hiragino Sans", "Hiragino Kaku Gothic ProN", Arial, "Noto Sans JP", Meiryo, sans-serif;
  --serif: "Hiragino Mincho ProN", "Hiragino Mincho Pro", HGSMinchoE, "Yu Mincho", YuMincho, "MS PMincho", serif;
  --mono: SFMono-Regular, Consolas, Menlo, Courier, monospace;

  --section-w: 180px;
  --main-w:    940px;
  --article-w: 620px;
}

* { box-sizing: border-box; }

img, svg { max-width: 100%; height: auto; }

html { scroll-padding-top: 80px; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font: 18px/2.0 var(--sans);
  letter-spacing: normal;
  font-feature-settings: normal;
  word-wrap: break-word;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  font-kerning: auto;
}

h1, h2, h3, h4 {
  letter-spacing: 0.04em;
  font-feature-settings: "palt";
}

:focus-visible {
  outline: 2px solid var(--accent-2);
  outline-offset: 2px;
  border-radius: 3px;
}

::selection { background: rgba(90,200,184,0.30); color: var(--ink); }

h1, h2, h3, h4, p, ul, ol { margin: 0; }
p { text-wrap: pretty; }

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; text-underline-offset: 3px; }

code {
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--bg-soft);
  font-family: var(--mono);
  font-size: 0.9em;
  color: var(--ink);
}

/* ============================================================
   HERO
   ============================================================ */
.hero {
  padding: 64px clamp(20px, 5vw, 72px) 40px;
  background: var(--bg);
  border-bottom: 1px solid var(--rule);
}

.hero-wrap { max-width: 920px; }

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 13px;
  color: var(--muted);
}

.hero-meta .label { font-weight: 600; color: var(--ink-2); }
.hero-meta .sep { color: var(--faint); }

.hero-meta .tag,
.tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--bg-soft);
  color: var(--ink-2);
  font-size: 12px;
  font-weight: 500;
}

.hero h1 {
  margin-bottom: 16px;
  font-size: 32px;
  line-height: 1.5;
  font-weight: 700;
  letter-spacing: 0.04em;
  font-feature-settings: "palt";
  color: var(--ink);
}

.hero-sub,
.subtitle {
  max-width: 60ch;
  margin-bottom: 32px;
  font-size: 17px;
  line-height: 1.65;
  color: var(--ink-2);
}

.hero-stamp {
  display: flex;
  flex-wrap: wrap;
  gap: 28px;
  padding-top: 20px;
  border-top: 1px solid var(--rule);
}

.hero-stamp dt {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 3px;
}

.hero-stamp dd {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--ink);
}

.source-link { color: var(--accent); font-weight: 700; }
.source-link:hover { text-decoration: underline; }

.eyebrow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 13px;
  color: var(--accent);
  font-weight: 800;
  text-transform: uppercase;
}

.stamp {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--rule);
}

.stamp span {
  display: block;
  color: var(--muted);
  font-size: 12px;
  font-weight: 600;
}

.stamp strong { display: block; margin-top: 3px; font-size: 15px; color: var(--ink); }

/* ============================================================
   TOC — sticky horizontal nav
   ============================================================ */
.toc {
  position: sticky;
  top: 0;
  z-index: 40;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px) saturate(1.4);
  -webkit-backdrop-filter: blur(12px) saturate(1.4);
  border-bottom: 1px solid var(--rule);
}

.toc-inner {
  display: flex;
  align-items: center;
  gap: 4px;
  overflow-x: auto;
  padding: 10px clamp(20px, 5vw, 72px);
  scrollbar-width: none;
}
.toc-inner::-webkit-scrollbar { display: none; }

.toc-label {
  flex: 0 0 auto;
  padding-right: 14px;
  margin-right: 6px;
  border-right: 1px solid var(--rule);
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  white-space: nowrap;
}

.toc a {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  padding: 7px 12px;
  border-radius: 7px;
  color: var(--ink-2);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.15s, color 0.15s;
}

.toc a .num {
  color: var(--faint);
  font-size: 12px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.toc a:hover { background: var(--bg-soft); color: var(--ink); text-decoration: none; }
.toc a:hover .num { color: var(--accent); }

.toc-tools {
  margin-left: auto;
  flex: 0 0 auto;
  padding-left: 12px;
  border-left: 1px solid var(--rule);
}

.toc-tools button {
  padding: 6px 11px;
  border: 1px solid var(--rule);
  border-radius: 7px;
  background: var(--panel);
  color: var(--muted);
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}

.toc-tools button:hover { color: var(--ink); border-color: var(--ink-2); }

.toc-tools button.is-on {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

/* ============================================================
   MAIN LAYOUT
   ============================================================ */
main {
  padding: 24px clamp(16px, 3vw, 48px) 80px;
  max-width: var(--main-w);
  margin: 0 auto;
  overflow-x: hidden;
}

.section {
  padding: 48px 0;
  border-top: 1px solid var(--rule);
}

.section:first-of-type {
  border-top: 0;
  padding-top: 28px;
}

.section-head {
  margin-bottom: 32px;
  max-width: 64ch;
}

.section-num {
  display: inline-block;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
  font-variant-numeric: tabular-nums;
}

.section-head h2 {
  margin-bottom: 8px;
  font-size: 28px;
  line-height: 1.286;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: 0.04em;
  font-feature-settings: "palt";
}

.section-head .section-sub {
  font-size: 15px;
  line-height: 1.65;
  color: var(--muted);
}

.block-stack {
  display: grid;
  gap: 32px;
}

/* Legacy grid compat for section-wide blocks */
.block-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.section-wide .block-grid,
.block-flowchart,
.block-timeline,
.block-findings,
.block-requirements,
.block-decision-matrix,
.block-component-catalog,
.block-code-notes,
.block-controls,
.block-export,
.block-prose,
.block-snippets,
.block-diagram,
.block-relations {
  grid-column: 1 / -1;
}

/* ============================================================
   REF BADGES — hidden by default
   ============================================================ */
.ref-badge {
  display: inline-block;
  padding: 1px 6px;
  margin-left: 5px;
  border-radius: 4px;
  background: transparent;
  color: var(--faint);
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0;
  vertical-align: middle;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;
  user-select: all;
}

body:not(.show-refs) .ref-badge { display: none; }

body.show-refs .ref-badge {
  opacity: 1;
  background: var(--bg-soft);
  color: var(--muted);
}

[id]:target {
  background: rgba(90,200,184,0.18);
  border-radius: 6px;
}

/* ============================================================
   BLOCK base
   ============================================================ */
.block {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--rule);
  border-radius: 12px;
  background: var(--panel);
}

.block-title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 14px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--rule);
}

.block-title h3 {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.35;
  color: var(--ink);
}

.block-title .meta {
  font-size: 12px;
  color: var(--muted);
  flex-shrink: 0;
}

/* ============================================================
   BLOCK: callout
   ============================================================ */
.block-callout {
  padding: 0;
  border: 0;
  background: transparent;
  border-radius: 0;
}

.block-callout .block-title {
  border-bottom: 0;
  padding-bottom: 0;
  margin-bottom: 10px;
}

.callout-text {
  margin: 0;
  padding: 3px 0 3px 18px;
  border-left: 3px solid var(--brand);
  font-size: 18px;
  line-height: 2.0;
  color: var(--ink);
  max-width: var(--article-w);
}

/* ============================================================
   BLOCK: prose
   ============================================================ */
.prose {
  max-width: var(--article-w);
  font-size: 18px;
  line-height: 2.0;
  color: var(--ink);
}

.prose p + p { margin-top: 1em; }

.prose code {
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--bg-soft);
  font-family: var(--mono);
  font-size: 0.9em;
  color: var(--ink);
}

/* ============================================================
   BLOCK: metrics
   ============================================================ */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(var(--section-w), 1fr));
  gap: 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}

.metric {
  padding: 22px 22px 22px 0;
  border-right: 1px solid var(--rule);
}

.metric:last-child { border-right: 0; }

.metric .label {
  display: block;
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--muted);
}

.metric .value {
  display: block;
  font-size: 36px;
  line-height: 1.1;
  font-weight: 800;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
}

.metric .value .unit {
  font-size: 20px;
  color: var(--muted);
  font-weight: 500;
  margin-left: 2px;
}

.metric .caption {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
}

/* ============================================================
   BLOCK: requirements
   ============================================================ */
.requirement-list {
  display: grid;
  gap: 0;
}

.requirement {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr) auto;
  gap: 20px;
  align-items: start;
  padding: 20px 0;
  border-top: 1px solid var(--rule);
}

.requirement:first-child { border-top: 0; padding-top: 4px; }
.requirement:last-child { padding-bottom: 4px; }

.req-priority {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  width: max-content;
}

.req-priority::before {
  content: "";
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
}

.priority-must   .req-priority { color: var(--c-must);   background: var(--c-must-bg); }
.priority-should .req-priority { color: var(--c-should); background: var(--c-should-bg); }
.priority-could  .req-priority { color: var(--c-could);  background: var(--c-could-bg); }

.req-body strong {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 5px;
  line-height: 1.45;
}

.req-body p {
  font-size: 14px;
  line-height: 1.65;
  color: var(--muted);
}

.req-status {
  font-size: 12px;
  color: var(--muted);
  white-space: nowrap;
  padding-top: 3px;
}

.status-accepted { color: var(--c-done); }
.status-planned  { color: var(--c-next); }
.status-blocked  { color: var(--c-blocked); }

/* ============================================================
   BLOCK: decision-matrix (data-table)
   ============================================================ */
.table-scroll { overflow-x: auto; }

.data-table {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table thead th {
  padding: 12px 14px 12px 0;
  border-bottom: 2px solid var(--ink-2);
  text-align: left;
  font-size: 12px;
  font-weight: 700;
  color: var(--ink);
}

.data-table tbody td {
  padding: 18px 14px 18px 0;
  border-bottom: 1px solid var(--rule);
  vertical-align: top;
  color: var(--ink-2);
  line-height: 1.6;
}

.data-table tbody tr:last-child td { border-bottom: 0; }

.data-table .col-option {
  font-size: 15px;
  font-weight: 700;
  color: var(--ink);
  width: 28%;
}

.data-table .col-score {
  font-size: 26px;
  font-weight: 800;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
  width: 72px;
  line-height: 1.1;
}

.data-table .col-rec { width: 120px; }

.rec-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

.rec-pill::before {
  content: "";
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
}

.rec-adopt   { background: var(--c-could-bg); color: var(--c-done); }
.rec-defer   { background: var(--c-should-bg); color: var(--c-should); }
.rec-reject  { background: var(--c-must-bg); color: var(--c-must); }

/* ============================================================
   BLOCK: component catalog
   ============================================================ */
.component-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 14px;
}

.component-card {
  padding: 20px;
  background: var(--panel);
  border: 1px solid var(--rule);
  border-radius: 12px;
  box-shadow: var(--elevation-1);
  transition: border-color 0.15s, box-shadow 0.15s;
}

.component-card:hover { border-color: var(--ink); box-shadow: var(--elevation-4); }

.component-card .cat {
  display: inline-block;
  margin-bottom: 10px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--accent-bg);
  color: var(--accent-2);
  font-size: 11px;
  font-weight: 600;
}

.component-card .name {
  display: block;
  margin-bottom: 8px;
  font-family: var(--mono);
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
  word-break: break-all;
  line-height: 1.35;
}

.component-card .purpose {
  margin-bottom: 12px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--ink-2);
}

.component-card .notes {
  display: block;
  padding-top: 12px;
  border-top: 1px solid var(--rule);
  font-size: 12px;
  line-height: 1.55;
  color: var(--muted);
}

/* ============================================================
   BLOCK: timeline
   ============================================================ */
.timeline-list {
  list-style: none;
  padding: 0;
  position: relative;
}

.timeline-list::before {
  content: "";
  position: absolute;
  left: 12px;
  top: 20px;
  bottom: 20px;
  width: 2px;
  background: var(--rule);
}

.timeline-item {
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr) auto;
  gap: 18px;
  padding: 16px 0;
  align-items: start;
  position: relative;
}

.timeline-item .marker {
  position: relative;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--bg);
  border: 2px solid var(--rule);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  color: var(--muted);
  z-index: 1;
}

.status-done .marker {
  background: var(--c-done);
  border-color: var(--c-done);
  color: #fff;
}
.status-done .marker::before { content: "✓"; font-size: 13px; font-weight: 700; }

.status-next .marker {
  background: var(--bg);
  border-color: var(--c-next);
  color: var(--c-next);
}
.status-next .marker::before {
  content: "";
  width: 7px; height: 7px;
  background: var(--c-next);
  border-radius: 50%;
}

.status-blocked .marker {
  background: var(--bg);
  border-color: var(--c-blocked);
  color: var(--c-blocked);
}
.status-blocked .marker::before {
  content: "✕";
  font-size: 12px;
}

.timeline-item .body strong {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 5px;
  line-height: 1.45;
}

.timeline-item .body p {
  font-size: 14px;
  line-height: 1.65;
  color: var(--muted);
}

.timeline-item .status-tag {
  font-size: 12px;
  font-weight: 600;
  color: var(--muted);
  padding-top: 3px;
}

.status-done .status-tag { color: var(--c-done); }
.status-next .status-tag { color: var(--c-next); }
.status-blocked .status-tag { color: var(--c-blocked); }

/* Legacy status classes for old timeline rendering */
.status { /* keep for backward compat */ }
.status-done-old { color: var(--c-done); }
.status-next-old { color: var(--c-next); }

/* ============================================================
   BLOCK: code-notes
   ============================================================ */
.code-note-list {
  display: grid;
  gap: 0;
}

.code-note {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 24px;
  padding: 20px 0;
  border-top: 1px solid var(--rule);
  align-items: start;
}

.code-note:first-child { border-top: 0; padding-top: 4px; }

.code-note .loc {
  display: inline-block;
  padding: 4px 10px;
  background: var(--accent-bg);
  border-radius: 6px;
  color: var(--accent-2);
  font-family: var(--mono);
  font-size: 12px;
  word-break: break-all;
  width: max-content;
  max-width: 100%;
  line-height: 1.45;
}

.code-note .body strong {
  display: block;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
  margin-bottom: 5px;
  line-height: 1.45;
}

.code-note .body p {
  font-size: 14px;
  line-height: 1.7;
  color: var(--muted);
}

/* ============================================================
   BLOCK: snippets — dark surface + mono
   ============================================================ */
.snippet-list { display: grid; gap: 18px; }

.snippet {
  border-radius: 12px;
  overflow: hidden;
  background: var(--code-bg);
  border: 1px solid var(--rule);
}

.snippet-source {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--code-shoulder);
  border-bottom: 1px solid var(--code-rule);
  font-family: var(--mono);
  font-size: 12px;
  color: var(--code-mute);
}

.snippet-lang {
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255,255,255,0.08);
  color: #d8d4ad;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.snippet-path {
  flex: 1;
  color: var(--code-mute);
  word-break: break-all;
}

.snippet .copy-btn {
  padding: 4px 10px;
  border: 1px solid transparent;
  border-radius: 5px;
  background: rgba(255,255,255,0.06);
  color: var(--code-fg);
  font-family: var(--sans);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.snippet .copy-btn:hover {
  background: rgba(255,255,255,0.14);
  border-color: var(--code-rule);
}

.snippet pre {
  margin: 0;
  padding: 16px 18px;
  overflow-x: auto;
  background: none;
}

.snippet code {
  display: block;
  font: 13px/1.8 var(--mono);
  color: var(--code-fg);
  background: none;
  padding: 0;
  border-radius: 0;
}

.snippet .line-number {
  display: inline-block;
  width: 26px;
  margin-right: 16px;
  color: var(--code-mute);
  text-align: right;
  user-select: none;
  font-size: 12px;
}

/* Syntax highlight tokens */
.snippet .kw  { color: #f48aa7; }
.snippet .fn  { color: #c9b3f4; }
.snippet .str { color: #d4d49a; }
.snippet .ty  { color: #f4be7a; }
.snippet .cm  { color: #8a8d96; font-style: italic; }
.snippet .key { color: #a3c8e6; }
.snippet .num { color: #f4be7a; }

/* Legacy code-block-wrapper support */
.code-block-wrapper {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: var(--code-bg);
  border: 1px solid var(--rule);
}

.code-block-wrapper pre {
  margin: 0;
  padding: 16px 16px 16px 52px;
  overflow-x: auto;
  background: none;
}

.code-block-wrapper code {
  display: block;
  background: none;
  color: var(--code-fg);
  font: 13px/1.7 var(--mono);
  padding: 0;
  border-radius: 0;
  counter-reset: line;
}

.code-block-wrapper .line-number {
  display: inline-block;
  width: 34px;
  margin-left: -42px;
  margin-right: 8px;
  color: var(--code-mute);
  text-align: right;
  font-size: 12px;
  user-select: none;
}

.code-copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 10px;
  border: 1px solid var(--code-rule);
  border-radius: 5px;
  background: rgba(255,255,255,0.06);
  color: var(--code-fg);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s, background 0.15s;
}

.code-block-wrapper:hover .code-copy-btn { opacity: 1; }

.code-copy-btn:hover {
  background: rgba(255,255,255,0.14);
}

/* Language-specific syntax highlighting (legacy compat) */
.language-rust .kw, .language-rs .kw { color: #f48aa7; }
.language-rust .fn, .language-rs .fn { color: #c9b3f4; }
.language-rust .str, .language-rs .str { color: #d4d49a; }
.language-rust .cm, .language-rs .cm { color: #8a8d96; font-style: italic; }
.language-rust .ty, .language-rs .ty { color: #f4be7a; }
.language-rust .macro, .language-rs .macro { color: #c9b3f4; }

.language-javascript .kw, .language-js .kw, .language-typescript .kw, .language-ts .kw { color: #f48aa7; }
.language-javascript .fn, .language-js .fn, .language-typescript .fn, .language-ts .fn { color: #c9b3f4; }
.language-javascript .str, .language-js .str, .language-typescript .str, .language-ts .str { color: #d4d49a; }
.language-javascript .cm, .language-js .cm, .language-typescript .cm, .language-ts .cm { color: #8a8d96; font-style: italic; }

.language-python .kw, .language-py .kw { color: #f48aa7; }
.language-python .fn, .language-py .fn { color: #c9b3f4; }
.language-python .str, .language-py .str { color: #d4d49a; }
.language-python .cm, .language-py .cm { color: #8a8d96; font-style: italic; }
.language-python .decorator, .language-py .decorator { color: #f4be7a; }

.language-json .key { color: #a3c8e6; }
.language-json .str { color: #d4d49a; }
.language-json .num { color: #f4be7a; }
.language-json .bool { color: #f48aa7; }

.language-yaml .key { color: #a3c8e6; }
.language-yaml .str { color: #d4d49a; }
.language-yaml .num { color: #f4be7a; }

.language-bash .kw, .language-sh .kw, .language-shell .kw { color: #f48aa7; }
.language-bash .str, .language-sh .str, .language-shell .str { color: #d4d49a; }
.language-bash .cm, .language-sh .cm, .language-shell .cm { color: #8a8d96; }

.language-sql .kw { color: #f48aa7; }
.language-sql .fn { color: #c9b3f4; }
.language-sql .str { color: #d4d49a; }
.language-sql .tbl { color: #f4be7a; }

/* ============================================================
   BLOCK: diagram (generic Mermaid)
   ============================================================ */
.diagram-list {
  display: grid;
  gap: 24px;
}

.diagram-item {
  border: 1px solid var(--rule);
  border-radius: 12px;
  overflow: hidden;
}

.diagram-kind {
  padding: 8px 14px;
  background: var(--bg-soft);
  border-bottom: 1px solid var(--rule);
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.diagram-item .flow-wrap {
  border-radius: 0;
  background: var(--panel);
}

/* ============================================================
   BLOCK: flowchart
   ============================================================ */
.flow-wrap {
  padding: 24px 14px;
  background: var(--bg-soft);
  border-radius: 12px;
  overflow-x: auto;
}

.flow-wrap svg {
  max-width: 100%;
  height: auto;
}

.flow-wrap .mermaid {
  display: flex;
  justify-content: center;
  background: none;
  color: inherit;
  font-size: 13px;
  padding: 0;
}

/* ============================================================
   BLOCK: controls
   ============================================================ */
.control-panel {
  border: 1px solid var(--rule);
  border-radius: 12px;
  overflow: hidden;
  background: var(--panel);
}

.control-row {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr) 64px;
  gap: 16px;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--rule);
}

.control-row.toggle-row { grid-template-columns: 180px auto; }

.control-row .label {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.45;
}

.control-row select {
  width: 100%;
  padding: 7px 10px;
  border: 1px solid var(--rule);
  border-radius: 6px;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--sans);
  font-size: 13px;
  cursor: pointer;
}

.control-row select:focus { outline: 2px solid var(--accent); outline-offset: 1px; border-color: var(--accent); }

.control-row input[type="range"] {
  width: 100%;
  accent-color: var(--accent);
}

.control-row input[type="checkbox"] {
  width: 40px;
  height: 22px;
  appearance: none;
  background: var(--rule);
  border-radius: 999px;
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}

.control-row input[type="checkbox"]::after {
  content: "";
  position: absolute;
  top: 2px; left: 2px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: var(--panel);
  box-shadow: 0 1px 3px rgba(0,0,0,0.18);
  transition: left 0.2s;
}

.control-row input[type="checkbox"]:checked { background: var(--accent); }
.control-row input[type="checkbox"]:checked::after { left: 18px; }

.control-row output {
  font-family: var(--mono);
  font-size: 14px;
  font-weight: 500;
  color: var(--accent);
  text-align: right;
}

.control-output {
  margin: 0;
  padding: 14px 18px;
  background: var(--code-bg);
  color: var(--code-fg);
  font: 13px/1.65 var(--mono);
  min-height: 120px;
  overflow: auto;
  border-bottom: 1px solid var(--code-rule);
}

.control-actions {
  display: flex;
  gap: 8px;
  padding: 12px 18px;
  background: var(--code-shoulder);
}

.copy-button {
  padding: 8px 14px;
  border: 1px solid var(--code-rule);
  border-radius: 6px;
  background: rgba(255,255,255,0.06);
  color: var(--code-fg);
  font-family: var(--sans);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.copy-button.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.copy-button:hover { background: rgba(255,255,255,0.14); }
.copy-button.primary:hover { background: var(--accent-2); border-color: var(--accent-2); }

.prompt-export p { color: var(--muted); }

.block-export {
  padding: 20px 22px;
  background: var(--bg-soft);
  border-radius: 12px;
}

.block-export p {
  margin-bottom: 14px;
  font-size: 15px;
  line-height: 1.65;
  color: var(--ink-2);
  max-width: 58ch;
}

.block-export .copy-button {
  background: var(--ink);
  color: var(--bg);
  border-color: var(--ink);
}

.block-export .copy-button:hover { background: var(--accent-2); border-color: var(--accent-2); }

/* ============================================================
   BLOCK: relations
   ============================================================ */
.relations-list {
  display: grid;
  gap: 10px;
}

.relation {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  background: var(--panel);
  border: 1px solid var(--rule);
  border-radius: 12px;
  flex-wrap: wrap;
}

.rel-chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 11px;
  border-radius: 6px;
  background: var(--bg-soft);
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-2);
  text-decoration: none;
  transition: background 0.15s;
}

.rel-chip:hover {
  background: var(--accent-bg);
  color: var(--accent-2);
  text-decoration: none;
}

.rel-chip .rid {
  font-family: var(--mono);
  font-size: 11px;
  color: var(--accent);
  font-weight: 500;
}

.rel-arrow {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 500;
  color: var(--muted);
  white-space: nowrap;
}

.rel-arrow::before, .rel-arrow::after {
  content: "";
  width: 18px;
  height: 1.5px;
  background: var(--faint);
}

.rel-arrow::after { background: currentColor; clip-path: polygon(0 0, 100% 50%, 0 100%, 0 60%, 80% 50%, 0 40%); }

.rel-type-implements .rel-arrow { color: var(--c-done); }
.rel-type-depends_on .rel-arrow { color: var(--accent); }
.rel-type-addresses  .rel-arrow { color: var(--c-next); }
.rel-type-supersedes .rel-arrow { color: var(--c-must); }

/* ============================================================
   RESPONSIVE
   ============================================================ */
@media (max-width: 860px) {
  .hero { padding: 40px 20px 28px; }
  .hero h1 { font-size: clamp(28px, 7vw, 40px); }
  .hero-sub { font-size: 15px; }

  body { font-size: 14px; }

  .section { padding: 36px 0; }

  .metrics-grid { grid-template-columns: 1fr 1fr; }
  .metric { border-right: 1px solid var(--rule); border-bottom: 1px solid var(--rule); padding: 18px; }
  .metric:nth-child(2n) { border-right: 0; }
  .metric:nth-last-child(-n+2) { border-bottom: 0; }

  .component-grid { grid-template-columns: 1fr; }

  .requirement, .code-note, .control-row, .control-row.toggle-row {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .data-table { font-size: 13px; }
  .data-table .col-score { font-size: 20px; }
  .data-table thead { display: none; }
  .data-table tbody td {
    display: block;
    padding: 5px 0;
    border-bottom: 0;
  }
  .data-table tbody tr {
    display: block;
    padding: 14px 0;
    border-bottom: 1px solid var(--rule);
  }
  .data-table .col-option { padding-top: 0; }

  .relation { flex-direction: column; align-items: flex-start; gap: 8px; }
  .rel-arrow::before, .rel-arrow::after { display: none; }

  .block-grid { grid-template-columns: 1fr; }
}

@media print {
  .toc, .copy-button, .copy-btn { display: none; }
  .section { page-break-inside: avoid; }
  body { background: #fff; }
}
`;
}
