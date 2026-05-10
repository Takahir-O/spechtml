export function groupBy(items, key) {
  const map = new Map();
  for (const item of items) {
    const value = item[key];
    if (!map.has(value)) map.set(value, []);
    map.get(value).push(item);
  }
  return map;
}

export function arrayOf(value) {
  return Array.isArray(value) ? value : [];
}

export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}
