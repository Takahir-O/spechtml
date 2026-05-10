import { arrayOf } from '../utils/helpers.js';
import { safeJsonForScript } from '../utils/escape.js';

export function controlsScript(data) {
  const payload = safeJsonForScript({
    title: data.doc.title,
    controls: arrayOf(data.controls).map(({ id, section, label, kind, value }) => ({ id, section, label, kind, value }))
  });

  return `
const specDoc = ${payload};

function copyText(text) {
  try { return navigator.clipboard.writeText(text); } catch {}
}

function panelValues(section) {
  const panel = document.querySelector('[data-control-panel="' + section + '"]');
  if (!panel) return {};
  const v = {};
  panel.querySelectorAll('input, select').forEach(function(f) {
    if (f.type === 'checkbox') v[f.name] = f.checked;
    else if (f.type === 'range') v[f.name] = Number(f.value);
    else v[f.name] = f.value;
  });
  return v;
}

function refreshPanel(section) {
  const panel = document.querySelector('[data-control-panel="' + section + '"]');
  const out = document.querySelector('[data-control-output="' + section + '"]');
  if (!panel || !out) return;
  panel.querySelectorAll('input[type="range"]').forEach(function(i) {
    var o = i.parentElement.querySelector('output');
    if (o) o.value = i.value;
  });
  out.textContent = JSON.stringify(panelValues(section), null, 2);
}

document.querySelectorAll('[data-control-panel]').forEach(function(p) {
  var s = p.getAttribute('data-control-panel');
  p.addEventListener('input', function() { refreshPanel(s); });
  refreshPanel(s);
});

document.querySelectorAll('[data-copy-json]').forEach(function(btn) {
  btn.addEventListener('click', async function() {
    var s = btn.getAttribute('data-copy-json');
    await copyText(JSON.stringify(panelValues(s), null, 2));
    var orig = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(function() { btn.textContent = orig; }, 1100);
  });
});

document.querySelectorAll('[data-copy-prompt]').forEach(function(btn) {
  btn.addEventListener('click', async function() {
    var s = btn.getAttribute('data-copy-prompt');
    var text = 'Update the retry policy for ' + JSON.stringify(specDoc.title).slice(1, -1) + ' using these parameters:\\n' + JSON.stringify(panelValues(s), null, 2);
    await copyText(text);
    var orig = btn.textContent;
    btn.textContent = 'Copied';
    setTimeout(function() { btn.textContent = orig; }, 1100);
  });
});
`;
}

export function codeCopyScript() {
  return `
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); } catch {}
}

document.querySelectorAll('.copy-btn').forEach(function(btn) {
  btn.addEventListener('click', async function() {
    var id = btn.getAttribute('data-copy-target');
    var code = document.getElementById(id);
    if (!code) return;
    var text = code.textContent.replace(/^\\s*\\d+/gm, '').trim();
    await copyText(text);
    var orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.textContent = orig; }, 1100);
  });
});

/* Legacy .code-copy-btn support */
document.querySelectorAll('.code-copy-btn').forEach(function(btn) {
  btn.addEventListener('click', async function() {
    var targetId = btn.getAttribute('data-copy-target');
    var code = document.getElementById(targetId);
    if (!code) return;
    var lines = [];
    code.childNodes.forEach(function(node) {
      if (node.nodeType === 3) lines.push(node.textContent || '');
      if (node.nodeType === 1 && node.classList.contains('line-number')) {
        lines.push((node.nextSibling ? node.nextSibling.textContent : '') || '');
      }
    });
    var text = lines.join('').trim() + '\\n';
    await copyText(text);
    var orig = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(function() { btn.textContent = orig; }, 1100);
  });
});
`;
}
