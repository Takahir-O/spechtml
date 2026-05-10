import { z } from 'zod';

export const SafeUrlSchema = z
  .string()
  .refine((value) => /^https?:\/\//i.test(value), {
    message: 'source_url must use http or https scheme'
  });

const DocSchema = z.object({
  title: z.string().min(1, 'doc.title is required'),
  subtitle: z.string().optional(),
  kind: z.string().optional(),
  theme: z.string().optional(),
  lang: z.string().optional(),
  updated: z.string().optional(),
  author: z.string().optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
  source_url: SafeUrlSchema.optional()
});

const SectionSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  variant: z.enum(['default', 'wide']).optional(),
  label: z.string().optional()
});

const BlockSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  type: z.enum([
    'callout', 'metrics', 'timeline', 'requirements', 'decision_matrix',
    'component_catalog', 'code_notes', 'flowchart', 'controls', 'export_prompt',
    'prose', 'snippets', 'relations', 'diagram'
  ]),
  title: z.string(),
  ref: z.string().optional(),
  text: z.string().optional()
});

const MetricSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  label: z.string(),
  value: z.union([z.string(), z.number()]),
  caption: z.string().optional()
});

const RequirementSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  priority: z.enum(['must', 'should', 'could']),
  status: z.enum(['accepted', 'planned', 'blocked', 'done']),
  title: z.string(),
  description: z.string().optional()
});

const DecisionSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  option: z.string(),
  score: z.union([z.string(), z.number()]),
  tradeoff: z.string(),
  recommendation: z.string().optional()
});

const FlowNodeSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  label: z.string(),
  kind: z.string()
});

const FlowEdgeSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  section: z.string().min(1),
  label: z.string()
});

const ComponentSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  name: z.string(),
  category: z.string(),
  purpose: z.string(),
  notes: z.string().optional()
});

const CodeNoteSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  file: z.string(),
  line: z.union([z.string(), z.number()]),
  concept: z.string(),
  note: z.string()
});

const TimelineSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  step: z.string(),
  status: z.string(),
  detail: z.string()
});

const ControlSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  label: z.string(),
  kind: z.string(),
  min: z.union([z.string(), z.number()]).optional(),
  max: z.union([z.string(), z.number()]).optional(),
  step: z.union([z.string(), z.number()]).optional(),
  value: z.union([z.string(), z.boolean(), z.number()]).optional(),
  options: z.string().optional()
});

const ProseSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  text: z.string()
});

const SnippetSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  lang: z.string().optional(),
  path: z.string().optional(),
  lines: z.string().optional(),
  code: z.string()
});

const RelationSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  from_ref: z.string(),
  to_ref: z.string(),
  type: z.enum(['depends_on', 'implements', 'addresses', 'references', 'supersedes', 'relates_to'])
});

const DiagramSchema = z.object({
  id: z.string().min(1),
  section: z.string().min(1),
  kind: z.enum(['flowchart', 'sequence', 'class', 'state', 'er', 'gantt', 'pie', 'mindmap', 'timeline', 'graph']),
  source: z.string()
});

export const SpecDocSchema = z.object({
  doc: DocSchema,
  sections: z.array(SectionSchema).min(1, 'sections[N] is required'),
  blocks: z.array(BlockSchema).min(1, 'blocks[N] is required'),
  metrics: z.array(MetricSchema).optional().default([]),
  requirements: z.array(RequirementSchema).optional().default([]),
  decisions: z.array(DecisionSchema).optional().default([]),
  flow_nodes: z.array(FlowNodeSchema).optional().default([]),
  flow_edges: z.array(FlowEdgeSchema).optional().default([]),
  components: z.array(ComponentSchema).optional().default([]),
  code_notes: z.array(CodeNoteSchema).optional().default([]),
  timeline: z.array(TimelineSchema).optional().default([]),
  controls: z.array(ControlSchema).optional().default([]),
  prose: z.array(ProseSchema).optional().default([]),
  snippets: z.array(SnippetSchema).optional().default([]),
  relations: z.array(RelationSchema).optional().default([]),
  diagrams: z.array(DiagramSchema).optional().default([])
});
