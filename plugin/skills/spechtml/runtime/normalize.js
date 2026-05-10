import { arrayOf, isObject } from './utils/helpers.js';

export function normalizeSpecDoc(data) {
  if (Array.isArray(data.order) && !Array.isArray(data.sections) && !Array.isArray(data.blocks)) {
    return normalizeCompactSpecDoc(data);
  }
  return data;
}

function normalizeCompactSpecDoc(data) {
  const canonical = {
    doc: normalizeDoc(data.doc),
    sections: [],
    blocks: [],
    metrics: [],
    requirements: [],
    decisions: [],
    flow_nodes: [],
    flow_edges: [],
    components: [],
    code_notes: [],
    timeline: [],
    controls: [],
    prose: [],
    snippets: [],
    relations: [],
    diagrams: []
  };

  for (const sectionId of data.order) {
    const section = data[sectionId];
    if (!isObject(section)) continue;

    canonical.sections.push({
      id: sectionId,
      title: field(section, 'title', 't'),
      variant: section.variant ?? 'default',
      label: field(section, 'label', 'l')
    });

    if (section.note) {
      pushBlock(canonical, sectionId, 'callout', '概要', '', section.note);
    }

    if (section.prose) {
      pushBlock(canonical, sectionId, 'prose', '説明', 'prose');
      const paragraphs = Array.isArray(section.prose) ? section.prose : [section.prose];
      paragraphs.forEach((text, index) => {
        canonical.prose.push({
          id: `${sectionId}_prose_${index + 1}`,
          section: sectionId,
          text: String(text)
        });
      });
    }

    if (Array.isArray(section.snippets)) {
      pushBlock(canonical, sectionId, 'snippets', 'コード例', 'snippets');
      section.snippets.forEach((item, index) => {
        canonical.snippets.push({
          id: `${sectionId}_snippet_${index + 1}`,
          section: sectionId,
          lang: field(item, 'lang'),
          path: field(item, 'path'),
          lines: field(item, 'lines'),
          code: field(item, 'code')
        });
      });
    }

    if (Array.isArray(section.metrics)) {
      pushBlock(canonical, sectionId, 'metrics', '設計目標', 'metrics');
      section.metrics.forEach((item, index) => {
        canonical.metrics.push({
          id: `${sectionId}_metric_${index + 1}`,
          section: sectionId,
          label: field(item, 'label'),
          value: field(item, 'value'),
          caption: field(item, 'caption')
        });
      });
    }

    if (Array.isArray(section.reqs)) {
      pushBlock(canonical, sectionId, 'requirements', '機能要求', 'requirements');
      section.reqs.forEach((item) => {
        canonical.requirements.push({
          id: item.id,
          section: sectionId,
          priority: decodePriority(field(item, 'priority', 'prio', 'p')),
          status: decodeStatus(field(item, 'status', 'state', 's')),
          title: field(item, 'title', 't'),
          description: field(item, 'description', 'desc', 'd')
        });
      });
    }

    if (Array.isArray(section.decisions)) {
      pushBlock(canonical, sectionId, 'decision_matrix', '方式比較', 'decisions');
      section.decisions.forEach((item) => {
        canonical.decisions.push({
          id: item.id,
          section: sectionId,
          option: field(item, 'option'),
          score: field(item, 'score'),
          tradeoff: field(item, 'tradeoff'),
          recommendation: field(item, 'recommendation', 'recommend', 'rec')
        });
      });
    }

    if (Array.isArray(section.nodes) || Array.isArray(section.edges)) {
      pushBlock(canonical, sectionId, 'flowchart', '生成フロー', 'flow');
      arrayOf(section.nodes).forEach((item) => {
        canonical.flow_nodes.push({
          id: item.id,
          section: sectionId,
          label: field(item, 'label'),
          kind: field(item, 'kind')
        });
      });
      arrayOf(section.edges).forEach((item) => {
        canonical.flow_edges.push({
          from: field(item, 'from'),
          to: field(item, 'to'),
          section: sectionId,
          label: field(item, 'label')
        });
      });
    }

    if (Array.isArray(section.components)) {
      pushBlock(canonical, sectionId, 'component_catalog', '部品カタログ', 'components');
      section.components.forEach((item, index) => {
        canonical.components.push({
          id: `${sectionId}_component_${index + 1}`,
          section: sectionId,
          name: field(item, 'name'),
          category: field(item, 'category', 'cat'),
          purpose: field(item, 'purpose'),
          notes: field(item, 'notes', 'note')
        });
      });
    }

    if (Array.isArray(section.notes)) {
      pushBlock(canonical, sectionId, 'code_notes', '実装メモ', 'notes');
      section.notes.forEach((item, index) => {
        canonical.code_notes.push({
          id: `${sectionId}_note_${index + 1}`,
          section: sectionId,
          file: field(item, 'file'),
          line: field(item, 'line'),
          concept: field(item, 'concept'),
          note: field(item, 'note')
        });
      });
    }

    if (Array.isArray(section.steps)) {
      pushBlock(canonical, sectionId, 'timeline', '利用手順', 'steps');
      section.steps.forEach((item, index) => {
        canonical.timeline.push({
          id: `${sectionId}_step_${index + 1}`,
          section: sectionId,
          step: field(item, 'step'),
          status: field(item, 'state', 'status', 's'),
          detail: field(item, 'detail')
        });
      });
    }

    if (Array.isArray(section.controls)) {
      pushBlock(canonical, sectionId, 'controls', '出力プリセット調整', 'controls');
      section.controls.forEach((item) => {
        canonical.controls.push({
          id: item.id,
          section: sectionId,
          label: field(item, 'label'),
          kind: field(item, 'kind'),
          min: field(item, 'min'),
          max: field(item, 'max'),
          step: field(item, 'step'),
          value: field(item, 'value'),
          options: field(item, 'options')
        });
      });
      pushBlock(canonical, sectionId, 'export_prompt', '調整結果をプロンプト化', sectionId);
    }

    if (Array.isArray(section.relations)) {
      pushBlock(canonical, sectionId, 'relations', '関連', 'relations');
      section.relations.forEach((item, index) => {
        canonical.relations.push({
          id: `${sectionId}_relation_${index + 1}`,
          section: sectionId,
          from_ref: field(item, 'from_ref', 'from'),
          to_ref: field(item, 'to_ref', 'to'),
          type: field(item, 'type') || 'relates_to'
        });
      });
    }
    if (Array.isArray(section.diagrams)) {
      pushBlock(canonical, sectionId, 'diagram', '図', 'diagram');
      section.diagrams.forEach((item, index) => {
        const kind = field(item, 'kind') || 'graph';
        const source = String(field(item, 'source')).replaceAll('\\n', '\n');
        canonical.diagrams.push({
          id: `${sectionId}_diagram_${index + 1}`,
          section: sectionId,
          kind,
          source
        });
      });
    }
  }

  return canonical;
}

function pushBlock(canonical, section, type, title, ref = '', text = '') {
  canonical.blocks.push({
    id: `${section}_${type}_${canonical.blocks.length + 1}`,
    section,
    type,
    title,
    ref,
    text
  });
}

function normalizeDoc(doc) {
  if (!isObject(doc)) return doc;
  return {
    title: field(doc, 'title', 't'),
    subtitle: field(doc, 'subtitle', 'sub'),
    kind: field(doc, 'kind', 'k'),
    theme: field(doc, 'theme'),
    lang: field(doc, 'lang'),
    updated: field(doc, 'updated'),
    author: field(doc, 'author'),
    version: field(doc, 'version'),
    tags: Array.isArray(doc.tags) ? doc.tags : [],
    source_url: field(doc, 'source_url', 'source') || undefined
  };
}

export function field(object, ...keys) {
  for (const key of keys) {
    if (object && object[key] !== undefined) return object[key];
  }
  return '';
}

function decodePriority(value) {
  const map = { M: 'must', S: 'should', C: 'could' };
  return map[value] ?? value;
}

function decodeStatus(value) {
  const map = { A: 'accepted', P: 'planned', B: 'blocked', D: 'done' };
  return map[value] ?? value;
}
