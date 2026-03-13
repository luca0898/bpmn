import { describe, expect, it } from 'vitest';
import {
  applyOperation,
  parseWorkflowDocument,
  replaySnapshotWithOperations,
  stringifyWorkflowDocument,
  validateWorkflow,
  type Operation,
  type Snapshot,
  type WorkflowDocument,
} from '../src';

const makeDoc = (): WorkflowDocument => ({
  id: 'wf-1',
  name: 'Workflow 1',
  version: 1,
  domain: {
    nodes: [
      { id: 'trigger-1', type: 'trigger.cron', typeVersion: 1, params: { cron: '* * * * *' } },
      { id: 'action-1', type: 'action.log', typeVersion: 1, params: { message: 'hi' } },
    ],
    edges: [],
  },
  view: {
    nodes: [
      { id: 'trigger-1', x: 0, y: 0 },
      { id: 'action-1', x: 200, y: 0 },
    ],
    edges: [],
    viewport: { x: 0, y: 0, zoom: 1 },
  },
});

describe('workflow operations and validation', () => {
  it('applyOperation AddNode adds domain and view node', () => {
    const doc = makeDoc();
    const next = applyOperation(doc, {
      type: 'AddNode',
      node: {
        id: 'action-2',
        type: 'action.http',
        typeVersion: 1,
        params: { method: 'GET', url: 'x' },
      },
      view: { id: 'action-2', x: 100, y: 100 },
    });

    expect(next.domain.nodes.some((node) => node.id === 'action-2')).toBe(true);
    expect(next.view.nodes.some((node) => node.id === 'action-2')).toBe(true);
  });

  it('applyOperation UpdateNodeParams merges params', () => {
    const doc = makeDoc();
    const next = applyOperation(doc, {
      type: 'UpdateNodeParams',
      nodeId: 'action-1',
      params: { message: 'updated' },
    });

    expect(next.domain.nodes.find((node) => node.id === 'action-1')?.params.message).toBe(
      'updated',
    );
  });

  it('validateWorkflow enforces single trigger rule', () => {
    const doc = makeDoc();
    doc.domain.nodes.push({
      id: 'trigger-2',
      type: 'trigger.webhook',
      typeVersion: 1,
      params: { method: 'POST', path: '/x' },
    });

    const result = validateWorkflow(doc);
    expect(result.ok).toBe(false);
    expect(result.errors.some((error) => error.code === 'TRIGGER_LIMIT_EXCEEDED')).toBe(true);
  });

  it('import/export roundtrip preserves workflow document', () => {
    const doc = makeDoc();
    doc.domain.edges.push({
      id: 'edge-1',
      sourceNodeId: 'trigger-1',
      sourcePort: 'out',
      targetNodeId: 'action-1',
      targetPort: 'in',
    });

    const raw = stringifyWorkflowDocument(doc);
    const parsed = parseWorkflowDocument(raw);

    expect(parsed).toEqual(doc);
  });

  it('replay snapshot + ops rebuilds current document', () => {
    const snapshot: Snapshot = {
      snapshotId: 'snap-1',
      createdAt: '2024-01-01T00:00:00.000Z',
      document: makeDoc(),
    };

    const operations: Operation[] = [
      {
        type: 'AddEdge',
        edge: {
          id: 'edge-1',
          sourceNodeId: 'trigger-1',
          sourcePort: 'out',
          targetNodeId: 'action-1',
          targetPort: 'in',
        },
      },
      {
        type: 'UpdateNodeParams',
        nodeId: 'action-1',
        params: { message: 'done' },
      },
    ];

    const rebuilt = replaySnapshotWithOperations(snapshot, operations);
    expect(rebuilt.domain.edges).toHaveLength(1);
    expect(rebuilt.domain.nodes.find((node) => node.id === 'action-1')?.params.message).toBe(
      'done',
    );
  });
});
