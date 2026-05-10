import { escapeHtml, escapeAttr, escapeClass } from '../utils/escape.js';
import { refBadge } from '../utils/ref-registry.js';
import { arrayOf } from '../utils/helpers.js';
import { escapeMermaidLabel, escapeMermaidId } from '../utils/mermaid-escape.js';

export function blockSourcePath(block) {
  const tableByType = {
    callout: 'note',
    metrics: 'metrics',
    timeline: 'steps',
    findings: 'findings',
    requirements: 'reqs',
    decision_matrix: 'decisions',
    component_catalog: 'components',
    code_notes: 'notes',
    flowchart: 'flow',
    controls: 'controls',
    export_prompt: 'export',
    prose: 'prose',
    snippets: 'snippets',
    diagram: 'diagram'
  };
  return `/${block.section}/${tableByType[block.type] ?? block.type}`;
}

export function renderBlock(block, data, refs) {
  switch (block.type) {
    case 'callout':
      return wrapBlock(block, `<p class="callout-text">${escapeHtml(block.text ?? '')}</p>`, 'callout', refs, `/${block.section}/note`);
    case 'prose':
      return wrapBlock(block, renderProse(data.prose, block.section), 'prose', refs);
    case 'snippets':
      return wrapBlock(block, renderSnippets(data.snippets, block.section), 'snippets', refs);
    case 'metrics':
      return wrapBlock(block, renderMetrics(data.metrics, block.section, refs), 'metrics', refs);
    case 'timeline':
      return wrapBlock(block, renderTimeline(data.timeline, block.section, refs), 'timeline', refs);
    case 'requirements':
      return wrapBlock(block, renderRequirements(data.requirements, block.section, refs), 'requirements', refs);
    case 'decision_matrix':
      return wrapBlock(block, renderDecisionMatrix(data.decisions, block.section, refs), 'decision-matrix', refs);
    case 'component_catalog':
      return wrapBlock(block, renderComponentCatalog(data.components, block.section, refs), 'component-catalog', refs);
    case 'code_notes':
      return wrapBlock(block, renderCodeNotes(data.code_notes, block.section, refs), 'code-notes', refs);
    case 'diagram':
      return wrapBlock(block, renderDiagram(data.diagrams, block.section), 'diagram', refs);
    case 'flowchart':
      return wrapBlock(block, renderFlowchart(data.flow_nodes, data.flow_edges, block.section, refs), 'flowchart', refs);
    case 'controls':
      return wrapBlock(block, renderControls(data.controls, block.section, refs), 'controls', refs);
    case 'export_prompt':
      return wrapBlock(block, renderExportPrompt(block), 'export', refs);
    case 'relations':
      return wrapBlock(block, renderRelations(data.relations, block.section, refs), 'relations', refs);
    default:
      return wrapBlock(block, `<p>${escapeHtml(block.text ?? `Unsupported block type: ${block.type}`)}</p>`, 'unknown', refs);
  }
}

export function wrapBlock(block, inner, modifier, refs, path = blockSourcePath(block)) {
  const ref = refs.mark(path, block.title ?? block.type);
  const meta = block.ref ? `<span class="meta">${escapeHtml(block.ref)}</span>` : '';
  return `<article class="block block-${escapeClass(modifier)}" data-ref="${escapeAttr(ref.id)}" data-stable-id="${escapeAttr(ref.stableId)}" data-path="${escapeAttr(ref.path)}">
  <div class="block-title">
    <h3>${refBadge(ref.id)} ${escapeHtml(block.title ?? block.type)}</h3>
    ${meta}
  </div>
  ${inner}
</article>`;
}

function renderMetrics(metrics, sectionId, refs) {
  const items = arrayOf(metrics).filter((item) => item.section === sectionId);
  if (!items.length) return '<p>No metrics.</p>';
  return `<div class="metrics-grid">
    ${items.map((item, index) => {
      const ref = refs.mark(`/${sectionId}/metrics/${index}`, item.label);
      let valueHtml = escapeHtml(item.value ?? '');
      // Support unit in value like "18%" -> split for styling
      const unitMatch = String(item.value ?? '').match(/^(\d+(?:\.\d+)?)(%|ms|s|px|KB|MB|GB)?$/);
      if (unitMatch && unitMatch[2]) {
        valueHtml = `${escapeHtml(unitMatch[1])}<span class="unit">${escapeHtml(unitMatch[2])}</span>`;
      }
      return `<div class="metric" data-ref="${escapeAttr(ref.id)}" data-stable-id="${escapeAttr(ref.stableId)}" data-path="${escapeAttr(ref.path)}">
      <span class="label">${refBadge(ref.id)} ${escapeHtml(item.label)}</span>
      <span class="value">${valueHtml}</span>
      <span class="caption">${escapeHtml(item.caption ?? '')}</span>
    </div>`;
    }).join('\n    ')}
  </div>`;
}

function renderTimeline(timeline, sectionId, refs) {
  const items = arrayOf(timeline).filter((item) => item.section === sectionId);
  if (!items.length) return '<p>No steps.</p>';
  return `<ol class="timeline-list">
    ${items.map((item, index) => {
      const ref = refs.mark(`/${sectionId}/steps/${index}`, item.step);
      const statusClass = item.status ? `status-${escapeClass(item.status)}` : '';
      return `<li class="timeline-item ${statusClass}" data-ref="${escapeAttr(ref.id)}" data-stable-id="${escapeAttr(ref.stableId)}" data-path="${escapeAttr(ref.path)}">
      <span class="marker"></span>
      <div class="body">
        <strong>${refBadge(ref.id)} ${escapeHtml(item.step)}</strong>
        <p>${escapeHtml(item.detail ?? '')}</p>
      </div>
      <span class="status-tag">${escapeHtml(item.status ?? '')}</span>
    </li>`;
    }).join('\n    ')}
  </ol>`;
}

function renderRequirements(requirements, sectionId, refs) {
  const items = arrayOf(requirements).filter((item) => item.section === sectionId);
  if (!items.length) return '<p>No requirements.</p>';
  return `<div class="requirement-list">
    ${items.map((item, index) => {
      const ref = refs.mark(`/${sectionId}/reqs/${item.id ? `id=${item.id}` : index}`, item.title);
      const priorityClass = item.priority ? `priority-${escapeClass(item.priority)}` : '';
      const statusClass = item.status ? `status-${escapeClass(item.status)}` : '';
      const priorityLabel = { must: 'Must', should: 'Should', could: 'Could' };
      return `<div class="requirement ${priorityClass}" data-ref="${escapeAttr(ref.id)}" data-stable-id="${escapeAttr(ref.stableId)}" data-path="${escapeAttr(ref.path)}">
      <span class="req-priority">${priorityLabel[item.priority] ?? escapeHtml(item.priority ?? '')}</span>
      <div class="req-body">
        <strong>${refBadge(ref.id)} ${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.description ?? '')}</p>
      </div>
      <span class="req-status ${statusClass}">${escapeHtml(item.status ?? '')}</span>
    </div>`;
    }).join('\n    ')}
  </div>`;
}

function renderDecisionMatrix(decisions, sectionId, refs) {
  const items = arrayOf(decisions).filter((item) => item.section === sectionId);
  if (!items.length) return '<p>No decisions.</p>';
  return `<div class="table-scroll">
    <table class="data-table">
      <thead>
        <tr>
          <th>Option</th>
          <th>Score</th>
          <th>Tradeoff</th>
          <th>Recommendation</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item, index) => {
          const ref = refs.mark(`/${sectionId}/decisions/${item.id ? `id=${item.id}` : index}`, item.option);
          const recClass = item.recommendation ? `rec-${escapeClass(item.recommendation.toLowerCase())}` : '';
          return `<tr data-ref="${escapeAttr(ref.id)}" data-stable-id="${escapeAttr(ref.stableId)}" data-path="${escapeAttr(ref.path)}">
          <td class="col-option">${refBadge(ref.id)} ${escapeHtml(item.option)}</td>
          <td class="col-score"><strong>${escapeHtml(item.score ?? '')}</strong></td>
          <td>${escapeHtml(item.tradeoff ?? '')}</td>
          <td class="col-rec"><span class="rec-pill ${recClass}">${escapeHtml(item.recommendation ?? '')}</span></td>
        </tr>`;
        }).join('        ')}
      </tbody>
    </table>
  </div>`;
}

function renderComponentCatalog(components, sectionId, refs) {
  const items = arrayOf(components).filter((item) => item.section === sectionId);
  if (!items.length) return '<p>No components.</p>';
  return `<div class="component-grid">
    ${items.map((item, index) => {
      const ref = refs.mark(`/${sectionId}/components/${item.name ? `name=${item.name}` : index}`, item.name);
      return `<div class="component-card" data-ref="${escapeAttr(ref.id)}" data-stable-id="${escapeAttr(ref.stableId)}" data-path="${escapeAttr(ref.path)}">
      <span class="cat">${refBadge(ref.id)} ${escapeHtml(item.category ?? '')}</span>
      <span class="name">${escapeHtml(item.name ?? '')}</span>
      <p class="purpose">${escapeHtml(item.purpose ?? '')}</p>
      <small class="notes">${escapeHtml(item.notes ?? '')}</small>
    </div>`;
    }).join('\n    ')}
  </div>`;
}

function renderCodeNotes(notes, sectionId, refs) {
  const items = arrayOf(notes).filter((item) => item.section === sectionId);
  if (!items.length) return '<p>No code notes.</p>';
  return `<div class="code-note-list">
    ${items.map((item, index) => {
      const ref = refs.mark(`/${sectionId}/notes/${index}`, item.concept);
      return `<div class="code-note" data-ref="${escapeAttr(ref.id)}" data-stable-id="${escapeAttr(ref.stableId)}" data-path="${escapeAttr(ref.path)}">
      <span class="loc">${escapeHtml(item.file ?? '')}:${escapeHtml(item.line ?? '')}</span>
      <div class="body">
        <strong>${refBadge(ref.id)} ${escapeHtml(item.concept ?? '')}</strong>
        <p>${escapeHtml(item.note ?? '')}</p>
      </div>
    </div>`;
    }).join('\n    ')}
  </div>`;
}

function renderFlowchart(nodes, edges, sectionId, refs) {
  const nodeItems = arrayOf(nodes).filter((item) => item.section === sectionId);
  const edgeItems = arrayOf(edges).filter((item) => item.section === sectionId);
  if (!nodeItems.length && !edgeItems.length) return '<p>No flowchart data.</p>';

  const nodeLabels = new Map(nodeItems.map((n) => [n.id, n.label]));
  const lines = ['graph TB'];
  for (const edge of edgeItems) {
    const fromNode = nodeItems.find(n => n.id === edge.from);
    const toNode = nodeItems.find(n => n.id === edge.to);
    const fromLabel = nodeLabels.get(edge.from) ?? edge.from;
    const toLabel = nodeLabels.get(edge.to) ?? edge.to;
    const fromPart = mermaidNode(edge.from, fromLabel, fromNode?.kind);
    const toPart = mermaidNode(edge.to, toLabel, toNode?.kind);
    const edgeLabel = escapeMermaidLabel(edge.label ?? '');
    lines.push(`  ${fromPart} -->|${edgeLabel}| ${toPart}`);
  }
  const connectedIds = new Set(edgeItems.flatMap(e => [e.from, e.to]));
  for (const node of nodeItems) {
    if (!connectedIds.has(node.id)) {
      lines.push(`  ${mermaidNode(node.id, node.label, node.kind)}`);
    }
  }

  return `<div class="flow-wrap">
    <pre class="mermaid">${escapeHtml(lines.join('\n'))}</pre>
  </div>`;
}

function mermaidNode(id, label, kind) {
  const safeId = escapeMermaidId(id);
  const safeLabel = escapeMermaidLabel(label);
  if (kind === 'input' || kind === 'output') return `${safeId}(["${safeLabel}"])`;
  if (kind === 'event' || kind === 'decision') return `${safeId}{"${safeLabel}"}`;
  return `${safeId}["${safeLabel}"]`;
}

function renderControls(controls, sectionId, refs) {
  const items = arrayOf(controls).filter((item) => item.section === sectionId);
  if (!items.length) return '<p>No controls.</p>';
  return `<div class="control-panel" data-control-panel="${escapeAttr(sectionId)}">
    ${items.map((item) => renderControl(item, refs)).join('\n    ')}
    <pre class="control-output" data-control-output="${escapeAttr(sectionId)}"></pre>
    <div class="control-actions">
      <button class="copy-button primary" type="button" data-copy-json="${escapeAttr(sectionId)}">Copy JSON</button>
    </div>
  </div>`;
}

function renderControl(item, refs) {
  const ref = refs.mark(`/${item.section}/controls/id=${item.id}`, item.label);
  if (item.kind === 'slider') {
    return `<label class="control-row" data-ref="${escapeAttr(ref.id)}" data-stable-id="${escapeAttr(ref.stableId)}" data-path="${escapeAttr(ref.path)}">
      <span class="label">${refBadge(ref.id)} ${escapeHtml(item.label)}</span>
      <input type="range" name="${escapeAttr(item.id)}" min="${escapeAttr(item.min)}" max="${escapeAttr(item.max)}" step="${escapeAttr(item.step)}" value="${escapeAttr(item.value)}">
      <output>${escapeHtml(item.value)}</output>
    </label>`;
  }

  if (item.kind === 'toggle') {
    const checked = String(item.value) === 'true' ? ' checked' : '';
    return '<label class="control-row toggle-row" data-ref="' + escapeAttr(ref.id) + '" data-path="' + escapeAttr(ref.path) + '">\n      <span class="label">' + refBadge(ref.id) + ' ' + escapeHtml(item.label) + '</span>\n      <input type="checkbox" name="' + escapeAttr(item.id) + '"' + checked + '>\n    </label>';
  }

  if (item.kind === 'select') {
    const options = String(item.options ?? '').split(',').filter(Boolean);
    return `<label class="control-row" data-ref="${escapeAttr(ref.id)}" data-stable-id="${escapeAttr(ref.stableId)}" data-path="${escapeAttr(ref.path)}">
      <span class="label">${refBadge(ref.id)} ${escapeHtml(item.label)}</span>
      <select name="${escapeAttr(item.id)}">
        ${options.map((option) => `<option value="${escapeAttr(option)}"${option === item.value ? ' selected' : ''}>${escapeHtml(option)}</option>`).join('        ')}
      </select>
      <span></span>
    </label>`;
  }

  return `<p>Unsupported control: ${escapeHtml(item.kind)}</p>`;
}

function renderExportPrompt(block) {
  return `<div class="prompt-export">
    <p>Use the current control values to update the retry policy. Preserve the cancellation cleanup invariant and add tests for the selected edge cases.</p>
    <button class="copy-button" type="button" data-copy-prompt="${escapeAttr(block.ref)}">Copy Prompt →</button>
  </div>`;
}

function renderRelations(relations, sectionId, refs) {
  const items = arrayOf(relations).filter((item) => item.section === sectionId);
  if (!items.length) return '<p>No relations.</p>';
  return '<div class="relations-list">\n    ' + items.map((item) => {
    const fromKey = item.from_ref ?? 'from';
    const toKey = item.to_ref ?? 'to';
    const fromRef = refs.mark(`/${sectionId}/relations/${fromKey}`, fromKey);
    const toRef = refs.mark(`/${sectionId}/relations/${toKey}`, toKey);
    const typeClass = item.type ? 'rel-type-' + escapeClass(item.type) : '';
    return '<div class="relation ' + typeClass + '">\n      <span class="rel-chip"><span class="rid">' + escapeHtml(fromRef.id) + '</span>' + escapeHtml(fromKey) + '</span>\n      <span class="rel-arrow">' + escapeHtml(item.type ?? '') + '</span>\n      <span class="rel-chip"><span class="rid">' + escapeHtml(toRef.id) + '</span>' + escapeHtml(toKey) + '</span>\n    </div>';
  }).join('\n    ') + '\n  </div>';
}

function renderProse(prose, sectionId) {
  const items = arrayOf(prose).filter((item) => item.section === sectionId);
  if (!items.length) return '<p>No prose.</p>';
  return `<div class="prose">
    ${items.map((item) => renderProseText(item.text ?? '')).join('\n    ')}
  </div>`;
}

export function renderProseText(text) {
  const fenceRe = /^```([A-Za-z0-9_+-]*)\n([\s\S]*?)\n```$/gm;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = fenceRe.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index).replace(/^\n+|\n+$/g, '');
      if (before) parts.push(`<p>${escapeHtml(before)}</p>`);
    }
    const lang = match[1] || 'text';
    const code = match[2];
    parts.push(`<pre><code class="language-${escapeAttr(lang)}">${escapeHtml(code)}</code></pre>`);
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    const after = text.slice(lastIndex).replace(/^\n+|\n+$/g, '');
    if (after) parts.push(`<p>${escapeHtml(after)}</p>`);
  }
  if (parts.length === 0) {
    return `<p>${escapeHtml(text)}</p>`;
  }
  return parts.join('\n    ');
}

function renderSnippets(snippets, sectionId) {
  const items = arrayOf(snippets).filter((item) => item.section === sectionId);
  if (!items.length) return '<p>No snippets.</p>';
  return `<div class="snippet-list">
    ${items.map((item, index) => {
      const source = item.path ? `${escapeHtml(item.path)}${item.lines ? `:${escapeHtml(item.lines)}` : ''}` : '';
      const codeLines = String(item.code ?? '').split('\n');
      const lang = item.lang ?? 'text';
      const targetId = `snip-${sectionId}-${index}`;
      const safeTargetId = escapeAttr(targetId);
      return `<div class="snippet">
      ${source ? `<div class="snippet-source"><span class="snippet-lang">${escapeHtml(lang)}</span><span class="snippet-path">${source}</span><button class="copy-btn" type="button" data-copy-target="${safeTargetId}">Copy</button></div>` : ''}
      <pre><code id="${safeTargetId}" class="language-${escapeAttr(lang)}">${codeLines.map((line, i) => `<span class="line-number">${String(i + 1).padStart(3, ' ')}</span>${escapeHtml(line)}`).join('\n')}</code></pre>
    </div>`;
    }).join('\n    ')}
  </div>`;
}

function renderDiagram(diagrams, sectionId) {
  const items = arrayOf(diagrams).filter((item) => item.section === sectionId);
  return `<div class="diagram-list">
    ${items.map((item) => `<div class="diagram-item">
      <div class="diagram-kind">${escapeHtml(item.kind)}</div>
      <div class="flow-wrap">
        <pre class="mermaid">${escapeHtml(item.source)}</pre>
      </div>
    </div>`).join('\n    ')}
  </div>`;
}
