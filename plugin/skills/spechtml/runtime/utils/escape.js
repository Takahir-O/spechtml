export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function escapeAttr(value) {
  return escapeHtml(value);
}

export function escapeClass(value) {
  return escapeHtml(value).replaceAll(/\s+/g, '-');
}

// Escapes a JSON string so it can be safely embedded inside <script>...</script>.
// Prevents the JSON content from terminating the script element via </script>,
// or being interpreted as HTML comment markers.
export function safeJsonForScript(value) {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026');
}
