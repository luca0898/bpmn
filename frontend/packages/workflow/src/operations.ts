import type { DomainEdge, DomainNode, WorkflowDocument } from './types';

export type AddNodeOperation = {
  type: 'AddNode';
  node: DomainNode;
  view: { id: string; x: number; y: number; width?: number; height?: number; collapsed?: boolean };
};

export type UpdateNodeParamsOperation = {
  type: 'UpdateNodeParams';
  nodeId: string;
  params: Record<string, unknown>;
};

export type MoveNodeOperation = {
  type: 'MoveNode';
  nodeId: string;
  position: { x: number; y: number };
};

export type RemoveNodeOperation = {
  type: 'RemoveNode';
  nodeId: string;
};

export type AddEdgeOperation = {
  type: 'AddEdge';
  edge: DomainEdge;
};

export type RemoveEdgeOperation = {
  type: 'RemoveEdge';
  edgeId: string;
};

export type SetViewportOperation = {
  type: 'SetViewport';
  viewport: { x: number; y: number; zoom: number };
};

export type Operation =
  | AddNodeOperation
  | UpdateNodeParamsOperation
  | MoveNodeOperation
  | RemoveNodeOperation
  | AddEdgeOperation
  | RemoveEdgeOperation
  | SetViewportOperation;

export type Snapshot = {
  snapshotId: string;
  createdAt: string;
  document: WorkflowDocument;
};

export type EditorHistory = {
  operations: Operation[];
  snapshots: Snapshot[];
  headSeq: number;
};

export const applyOperation = (doc: WorkflowDocument, op: Operation): WorkflowDocument => {
  switch (op.type) {
    case 'AddNode':
      return {
        ...doc,
        domain: {
          ...doc.domain,
          nodes: [...doc.domain.nodes.filter((node) => node.id !== op.node.id), op.node],
        },
        view: {
          ...doc.view,
          nodes: [...doc.view.nodes.filter((node) => node.id !== op.view.id), op.view],
        },
      };
    case 'UpdateNodeParams':
      return {
        ...doc,
        domain: {
          ...doc.domain,
          nodes: doc.domain.nodes.map((node) =>
            node.id === op.nodeId
              ? {
                  ...node,
                  params: {
                    ...node.params,
                    ...op.params,
                  },
                }
              : node,
          ),
        },
      };
    case 'MoveNode':
      return {
        ...doc,
        view: {
          ...doc.view,
          nodes: doc.view.nodes.map((node) =>
            node.id === op.nodeId
              ? {
                  ...node,
                  x: op.position.x,
                  y: op.position.y,
                }
              : node,
          ),
        },
      };
    case 'RemoveNode': {
      const remainingEdges = doc.domain.edges.filter(
        (edge) => edge.sourceNodeId !== op.nodeId && edge.targetNodeId !== op.nodeId,
      );

      return {
        ...doc,
        domain: {
          ...doc.domain,
          nodes: doc.domain.nodes.filter((node) => node.id !== op.nodeId),
          edges: remainingEdges,
        },
        view: {
          ...doc.view,
          nodes: doc.view.nodes.filter((node) => node.id !== op.nodeId),
          edges: doc.view.edges.filter((edge) => remainingEdges.some((candidate) => candidate.id === edge.id)),
        },
      };
    }
    case 'AddEdge':
      return {
        ...doc,
        domain: {
          ...doc.domain,
          edges: [...doc.domain.edges.filter((edge) => edge.id !== op.edge.id), op.edge],
        },
        view: {
          ...doc.view,
          edges: [...doc.view.edges.filter((edge) => edge.id !== op.edge.id), { id: op.edge.id }],
        },
      };
    case 'RemoveEdge':
      return {
        ...doc,
        domain: {
          ...doc.domain,
          edges: doc.domain.edges.filter((edge) => edge.id !== op.edgeId),
        },
        view: {
          ...doc.view,
          edges: doc.view.edges.filter((edge) => edge.id !== op.edgeId),
        },
      };
    case 'SetViewport':
      return {
        ...doc,
        view: {
          ...doc.view,
          viewport: op.viewport,
        },
      };
    default:
      return doc;
  }
};

export const serializeOperation = (op: Operation): string => JSON.stringify(op);

export const deserializeOperation = (raw: string): Operation => JSON.parse(raw) as Operation;
