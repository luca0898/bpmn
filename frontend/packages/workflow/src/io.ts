import { getNodeDefinition } from './nodeDefinitions';
import type { NodeType, WorkflowDocument } from './types';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const assert = (condition: boolean, message: string): asserts condition => {
  if (!condition) {
    throw new Error(message);
  }
};

const isKnownNodeType = (value: unknown): value is NodeType =>
  typeof value === 'string' && getNodeDefinition(value as NodeType) !== undefined;

export const parseWorkflowDocument = (raw: string): WorkflowDocument => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid JSON file.');
  }

  assert(isObject(parsed), 'Workflow document must be a JSON object.');
  assert(typeof parsed.id === 'string' && parsed.id.length > 0, 'Workflow id is required.');
  assert(typeof parsed.name === 'string', 'Workflow name is required.');
  assert(typeof parsed.version === 'number', 'Workflow version is required.');
  assert(isObject(parsed.domain), 'Workflow domain is required.');
  assert(Array.isArray(parsed.domain.nodes), 'Workflow domain.nodes must be an array.');
  assert(Array.isArray(parsed.domain.edges), 'Workflow domain.edges must be an array.');
  assert(isObject(parsed.view), 'Workflow view is required.');
  assert(Array.isArray(parsed.view.nodes), 'Workflow view.nodes must be an array.');
  assert(Array.isArray(parsed.view.edges), 'Workflow view.edges must be an array.');
  assert(isObject(parsed.view.viewport), 'Workflow view.viewport is required.');

  parsed.domain.nodes.forEach((node, index) => {
    assert(isObject(node), `Node at index ${index} must be an object.`);
    assert(
      typeof node.id === 'string' && node.id.length > 0,
      `Node at index ${index} must have an id.`,
    );
    assert(
      isKnownNodeType(node.type),
      `Node \"${String(node.id ?? index)}\" has unknown NodeType.`,
    );
    assert(
      typeof node.typeVersion === 'number',
      `Node \"${String(node.id ?? index)}\" must have typeVersion.`,
    );
    assert(isObject(node.params), `Node \"${String(node.id ?? index)}\" params must be an object.`);
  });

  return parsed as WorkflowDocument;
};

export const stringifyWorkflowDocument = (doc: WorkflowDocument): string =>
  JSON.stringify(doc, null, 2);
