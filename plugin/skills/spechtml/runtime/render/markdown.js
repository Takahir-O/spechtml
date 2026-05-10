import { arrayOf, groupBy } from '../utils/helpers.js';
import { escapeMermaidLabel, escapeMermaidId } from '../utils/mermaid-escape.js';

export { escapeMermaidLabel, escapeMermaidId };

export function escapeMdCell(value) {
  return String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll('|', '\\|')
    .replaceAll(/\r?\n/g, ' ');
}

export function pickFence(code) {
  const text = String(code ?? '');
  let max = 0;
  for (const match of text.matchAll(/`+/g)) {
    if (match[0].length > max) max = match[0].length;
  }
  return '`'.repeat(Math.max(3, max + 1));
}

export function renderMarkdown(data) {
  const sections = arrayOf(data.sections);
  const blocksBySection = groupBy(arrayOf(data.blocks), 'section');
  const doc = data.doc;

  const lines = [];

  lines.push(`# ${doc.title ?? ''}`);
  if (doc.subtitle) lines.push(`> ${doc.subtitle}`);
  lines.push('');
  if (doc.updated) lines.push(`_Updated: ${doc.updated}_\n`);

  for (const section of sections) {
    lines.push(`- [${section.title}](#${slug(section.id)})`);
  }
  lines.push('');

  for (const section of sections) {
    const blocks = blocksBySection.get(section.id) ?? [];
    lines.push(`## ${section.title}`);
    lines.push('');

    for (const block of blocks) {
      const content = renderMarkdownBlock(block, data);
      if (content) {
        lines.push(content);
        lines.push('');
      }
    }
  }

  return lines.join('\n').trim() + '\n';
}

function renderMarkdownBlock(block, data) {
  switch (block.type) {
    case 'callout':
      return `> ${block.text ?? ''}`;

    case 'metrics': {
      const items = arrayOf(data.metrics).filter((item) => item.section === block.section);
      if (!items.length) return '';
      return [
        '| Label | Value | Caption |',
        '|---|---|---|',
        ...items.map((item) => `| ${escapeMdCell(item.label)} | ${escapeMdCell(item.value)} | ${escapeMdCell(item.caption ?? '')} |`)
      ].join('\n');
    }

    case 'timeline': {
      const items = arrayOf(data.timeline).filter((item) => item.section === block.section);
      if (!items.length) return '';
      return items.map((item) => `- [${item.status}] **${item.step}** — ${item.detail}`).join('\n');
    }

    case 'requirements': {
      const items = arrayOf(data.requirements).filter((item) => item.section === block.section);
      if (!items.length) return '';
      return [
        '| ID | Priority | Status | Title | Description |',
        '|---|---|---|---|---|',
        ...items.map((item) => `| ${escapeMdCell(item.id)} | ${escapeMdCell(item.priority)} | ${escapeMdCell(item.status)} | ${escapeMdCell(item.title)} | ${escapeMdCell(item.description ?? '')} |`)
      ].join('\n');
    }

    case 'decision_matrix': {
      const items = arrayOf(data.decisions).filter((item) => item.section === block.section);
      if (!items.length) return '';
      return [
        '| ID | Option | Score | Tradeoff | Recommendation |',
        '|---|---|---|---|---|',
        ...items.map((item) => `| ${escapeMdCell(item.id)} | ${escapeMdCell(item.option)} | ${escapeMdCell(item.score)} | ${escapeMdCell(item.tradeoff)} | ${escapeMdCell(item.recommendation)} |`)
      ].join('\n');
    }

    case 'component_catalog': {
      const items = arrayOf(data.components).filter((item) => item.section === block.section);
      if (!items.length) return '';
      return [
        '| Name | Category | Purpose | Notes |',
        '|---|---|---|---|',
        ...items.map((item) => `| ${escapeMdCell(item.name)} | ${escapeMdCell(item.category)} | ${escapeMdCell(item.purpose)} | ${escapeMdCell(item.notes ?? '')} |`)
      ].join('\n');
    }

    case 'code_notes': {
      const items = arrayOf(data.code_notes).filter((item) => item.section === block.section);
      if (!items.length) return '';
      return items.map((item) => `- \`${item.file}:${item.line}\` **${item.concept}** — ${item.note}`).join('\n');
    }

    case 'flowchart': {
      const nodes = arrayOf(data.flow_nodes).filter((item) => item.section === block.section);
      const edges = arrayOf(data.flow_edges).filter((item) => item.section === block.section);
      if (!nodes.length && !edges.length) return '';

      const lines = ['```mermaid', 'graph TB'];
      const nodeLabels = new Map(nodes.map((n) => [n.id, n.label]));
      for (const edge of edges) {
        const fromId = escapeMermaidId(edge.from);
        const toId = escapeMermaidId(edge.to);
        const fromLabel = escapeMermaidLabel(nodeLabels.get(edge.from) ?? edge.from);
        const toLabel = escapeMermaidLabel(nodeLabels.get(edge.to) ?? edge.to);
        const edgeLabel = escapeMermaidLabel(edge.label ?? '');
        lines.push(`  ${fromId}[${fromLabel}] -->|${edgeLabel}| ${toId}[${toLabel}]`);
      }
      lines.push('```');
      return lines.join('\n');
    }

    case 'controls': {
      const items = arrayOf(data.controls).filter((item) => item.section === block.section);
      if (!items.length) return '';
      return items.map((item) => {
        if (item.kind === 'slider') return `- ${item.label}: \`${item.value}\` (${item.min}–${item.max})`;
        if (item.kind === 'toggle') return `- ${item.label}: \`${String(item.value) === 'true' ? 'on' : 'off'}\``;
        if (item.kind === 'select') return `- ${item.label}: \`${item.value}\``;
        return `- ${item.label}`;
      }).join('\n');
    }

    case 'prose': {
      const items = arrayOf(data.prose).filter((item) => item.section === block.section);
      if (!items.length) return '';
      return items.map((item) => item.text).join('\n\n');
    }

    case 'snippets': {
      const items = arrayOf(data.snippets).filter((item) => item.section === block.section);
      if (!items.length) return '';
      return items.map((item) => {
        const header = item.path ? `${item.lang}:${item.path}${item.lines ? `:${item.lines}` : ''}` : item.lang ?? '';
        const fence = pickFence(item.code);
        return `${fence}${header}\n${item.code}\n${fence}`;
      }).join('\n\n');
    }

    default:
      return block.text ? `> ${block.text}` : '';
  }
}

function slug(text) {
  return String(text ?? '')
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-|-$/g, '');
}
