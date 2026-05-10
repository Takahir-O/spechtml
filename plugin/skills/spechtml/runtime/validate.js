import { arrayOf, isObject } from './utils/helpers.js';
import { SpecDocSchema } from './schema.js';

export function validateSpecDoc(data) {
  const errors = [];

  // Structural checks
  if (!isObject(data.doc)) errors.push('doc object is required');
  if (!Array.isArray(data.sections) || data.sections.length === 0) errors.push('sections[N] is required');
  if (!Array.isArray(data.blocks) || data.blocks.length === 0) errors.push('blocks[N] is required');

  if (isObject(data.doc) && !data.doc.title) errors.push('doc.title is required');

  for (const section of arrayOf(data.sections)) {
    if (!section.id || !section.title) errors.push(`section is missing id/title: ${JSON.stringify(section)}`);
  }

  const sectionIds = new Set(arrayOf(data.sections).map((section) => section.id));
  for (const block of arrayOf(data.blocks)) {
    if (!block.id || !block.section || !block.type) errors.push(`block is missing id/section/type: ${JSON.stringify(block)}`);
    if (block.section && !sectionIds.has(block.section)) errors.push(`block ${block.id} references unknown section ${block.section}`);
  }

  if (errors.length > 0) {
    throw new Error(`Invalid SpecDoc:\n- ${errors.join('\n- ')}`);
  }

  // Zod schema validation (strict: type/shape checks)
  const result = SpecDocSchema.safeParse(data);
  if (!result.success) {
    const zodErrors = result.error.issues.map((issue) =>
      `${issue.path.join('.')}: ${issue.message}`
    );
    throw new Error(`Invalid SpecDoc (schema):\n- ${zodErrors.join('\n- ')}`);
  }
}
