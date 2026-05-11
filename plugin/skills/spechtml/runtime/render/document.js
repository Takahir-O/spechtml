import { escapeHtml, escapeAttr, escapeClass, safeJsonForScript } from '../utils/escape.js';
import { refBadge, createRefRegistry } from '../utils/ref-registry.js';
import { groupBy, arrayOf } from '../utils/helpers.js';
import { renderBlock } from './blocks.js';
import { styles } from './styles.js';
import { controlsScript, codeCopyScript } from './client.js';

export function renderDocument(data) {
  const sections = arrayOf(data.sections);
  const blocksBySection = groupBy(arrayOf(data.blocks), 'section');
  const doc = data.doc;
  const refs = createRefRegistry();
  const hasControls = arrayOf(data.controls).length > 0;
  const hasFlowcharts = arrayOf(data.blocks).some(b => b.type === 'flowchart');
  const hasSnippets = arrayOf(data.snippets).length > 0;

  return `<!doctype html>
<html lang="${escapeAttr(doc.lang ?? 'ja')}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(doc.title)}</title>
  ${doc.author ? `<meta name="author" content="${escapeAttr(doc.author)}">` : ''}
  ${doc.tags?.length ? `<meta name="keywords" content="${escapeAttr(doc.tags.join(', '))}">` : ''}
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>${styles()}</style>
</head>
<body>
  <header class="hero">
    <div class="hero-wrap">
      <div class="hero-meta">
        ${renderBadges(doc)}
      </div>
      <h1>${escapeHtml(doc.title)}</h1>
      ${doc.subtitle ? `<p class="hero-sub">${escapeHtml(doc.subtitle)}</p>` : ''}
      <dl class="hero-stamp">
        ${doc.version ? `<div><dt>Version</dt><dd>v${escapeHtml(doc.version)}</dd></div>` : ''}
        ${doc.author ? `<div><dt>Author</dt><dd>${escapeHtml(doc.author)}</dd></div>` : ''}
        ${doc.updated ? `<div><dt>Updated</dt><dd><strong>${escapeHtml(doc.updated)}</strong></dd></div>` : ''}
        ${sections.length ? `<div><dt>Sections</dt><dd><strong>${sections.length}</strong></dd></div>` : ''}
      </dl>
    </div>
  </header>

  <nav class="toc" aria-label="Sections">
    <div class="toc-inner">
      <span class="toc-label">Contents</span>
      ${sections.map((section, i) => {
        const num = String(i + 1).padStart(2, '0');
        return `<a href="#${escapeAttr(section.id)}"><span class="num">${num}</span>${escapeHtml(section.title)}</a>`;
      }).join('\n      ')}
      <span class="toc-tools">
        <button id="toggle-refs" type="button">Ref IDs</button>
      </span>
    </div>
  </nav>

  <main>
    ${sections.map((section) => renderSection(section, blocksBySection.get(section.id) ?? [], data, refs)).join('\n')}
  </main>

  <script type="application/json" id="spechtml-ref-map">${safeJsonForScript(refs.items)}</script>
  ${hasFlowcharts ? '<script src="https://cdn.jsdelivr.net/npm/mermaid@11.14.0/dist/mermaid.min.js" integrity="sha384-1CMXl090wj8Dd6YfnzSQUOgWbE6suWCaenYG7pox5AX7apTpY3PmJMeS2oPql4Gk" crossorigin="anonymous"></script><script>mermaid.initialize({startOnLoad:true,securityLevel:"strict",theme:"base",themeVariables:{fontFamily:"var(--sans)",fontSize:"18px",primaryColor:"#ffffff",primaryTextColor:"#08131a",primaryBorderColor:"#08131a",lineColor:"#5a656b",secondaryColor:"#f5f8fa",tertiaryColor:"#f5f8fa"},flowchart:{nodeSpacing:50,rankSpacing:60,curve:"basis"}});</script>' : ''}
  ${hasSnippets ? `<script>${codeCopyScript()}</script>` : ''}
  ${hasControls ? `<script>${controlsScript(data)}</script>` : ''}
  <script>
  (function(){
    var btn=document.getElementById('toggle-refs');
    if(btn)btn.addEventListener('click',function(){document.body.classList.toggle('show-refs');btn.classList.toggle('is-on');});
  })();
  </script>
</body>
</html>
`;
}

function renderBadges(doc) {
  const parts = [];
  if (doc.kind) parts.push(`<span class="label">${escapeHtml(doc.kind)}</span>`);
  if (doc.theme) parts.push(`<span class="sep">·</span><span class="label">${escapeHtml(doc.theme)}</span>`);
  if (doc.source_url) {
    parts.push(`<span class="sep">·</span><a href="${escapeAttr(doc.source_url)}" class="label source-link">source</a>`);
  }
  if (doc.tags?.length) {
    parts.push(...doc.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`));
  }
  return parts.join('');
}

function renderSection(section, blocks, data, refs) {
  const label = section.label || makeLabel(data.doc, section.id);
  const ref = refs.mark(`/${section.id}`, label);
  const secIndex = data.sections?.indexOf(section) ?? 0;
  const num = String(secIndex + 1).padStart(2, '0');

  return `<section id="${escapeAttr(section.id)}" class="section${section.variant && section.variant !== 'default' ? ' section-' + escapeClass(section.variant) : ''}" data-ref="${escapeAttr(ref.id)}" data-stable-id="${escapeAttr(ref.stableId)}" data-path="${escapeAttr(ref.path)}" data-label="${escapeAttr(label)}">
  <header class="section-head">
    <span class="section-num">${num}</span>
    <h2>${escapeHtml(section.title)}</h2>
    ${section.description ? `<p class="section-sub">${escapeHtml(section.description)}</p>` : ''}
  </header>
  <div class="block-stack">
    ${blocks.map((block) => renderBlock(block, data, refs)).join('\n    ')}
  </div>
</section>`;
}

function makeLabel(doc, sectionId) {
  const title = String(doc?.title ?? 'doc');
  const latin = title.match(/[A-Za-z][A-Za-z0-9]*/g);
  const prefix = latin?.[0]?.toUpperCase() ?? 'DOC';
  return `${prefix}-${String(sectionId).replaceAll('_', '-').toUpperCase()}`;
}
