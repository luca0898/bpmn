import type { DomainEdge, DomainNode, WorkflowDocument } from './types';

const DEFAULT_VIEWPORT = { x: 0, y: 0, zoom: 1 };

export const createNewWorkflowDocument = (): WorkflowDocument => ({
  id: 'workflow-new',
  name: 'Untitled Workflow',
  version: 1,
  domain: {
    nodes: [],
    edges: [],
  },
  view: {
    nodes: [],
    edges: [],
    viewport: DEFAULT_VIEWPORT,
  },
});

export const createStarterWorkflowDocument = (): WorkflowDocument => {
  const nodes: DomainNode[] = [
    {
      id: 'node-cron-1',
      type: 'trigger.cron',
      typeVersion: 1,
      params: { cron: '0 * * * *' },
    },
    {
      id: 'node-http-1',
      type: 'action.http',
      typeVersion: 1,
      params: { method: 'GET', url: 'https://api.example.com' },
    },
    {
      id: 'node-log-1',
      type: 'action.log',
      typeVersion: 1,
      params: { message: 'Done' },
    },
  ];

  const edges: DomainEdge[] = [
    {
      id: 'edge-1',
      sourceNodeId: 'node-cron-1',
      sourcePort: 'out',
      targetNodeId: 'node-http-1',
      targetPort: 'in',
    },
    {
      id: 'edge-2',
      sourceNodeId: 'node-http-1',
      sourcePort: 'out',
      targetNodeId: 'node-log-1',
      targetPort: 'in',
    },
  ];

  return {
    id: 'workflow-starter',
    name: 'Starter Workflow',
    version: 1,
    domain: { nodes, edges },
    view: {
      nodes: [
        { id: 'node-cron-1', x: 120, y: 160 },
        { id: 'node-http-1', x: 420, y: 160 },
        { id: 'node-log-1', x: 740, y: 160 },
      ],
      edges: [{ id: 'edge-1' }, { id: 'edge-2' }],
      viewport: DEFAULT_VIEWPORT,
    },
  };
};

export const getNodeById = (
  doc: WorkflowDocument,
  id: string,
): DomainNode | undefined => doc.domain.nodes.find((node) => node.id === id);

export const updateNodeParams = (
  doc: WorkflowDocument,
  nodeId: string,
  partialParams: Record<string, unknown>,
): WorkflowDocument => ({
  ...doc,
  domain: {
    ...doc.domain,
    nodes: doc.domain.nodes.map((node) =>
      node.id === nodeId
        ? {
            ...node,
            params: {
              ...node.params,
              ...partialParams,
            },
          }
        : node,
    ),
  },
});
