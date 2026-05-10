export function escapeMermaidLabel(value) {
  return String(value ?? '')
    .replaceAll(/["\[\]{}()|]/g, ' ')
    .replaceAll(/\s+/g, ' ')
    .trim();
}

export function escapeMermaidId(id) {
  const cleaned = String(id ?? '').replaceAll(/[^A-Za-z0-9_]/g, '_');
  return cleaned || 'n0';
}
