import { escapeHtml } from './escape.js';

export function createRefRegistry() {
  let next = 1;
  const items = [];
  return {
    items,
    mark(path, label = '') {
      const stableId = hashPath(path);
      const id = `id${next++}`;
      items.push({ id, stableId, path, label: String(label ?? '') });
      return { id, stableId, path };
    }
  };
}

export function refBadge(id) {
  return `<span class="ref-badge">${escapeHtml(id)}</span>`;
}

function hashPath(path) {
  let hash = 0;
  for (let i = 0; i < path.length; i++) {
    hash = ((hash << 5) - hash + path.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
