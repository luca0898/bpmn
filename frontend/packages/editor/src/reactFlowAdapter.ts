import type {
  Connection,
  Edge as RFEdge,
  EdgeChange,
  Node as RFNode,
  NodeChange,
  ReactFlowInstance,
} from 'reactflow';
import type { DomainEdge, DomainNode, WorkflowDocument } from '../../workflow/src';
import { getNodeDefinition } from '../../workflow/src';

const DEFAULT_SOURCE_PORT = 'out';
const DEFAULT_TARGET_PORT = 'in';

const buildNodeLabel = (node: DomainNode) => {
  const definition = getNodeDefinition(node.type, node.typeVersion);

  return {
    label: definition?.displayName ?? node.type,
    icon: definition?.icon ?? '◻️',
    typeBadge: node.type,
  };
};

export const mapDocumentToReactFlow = (
  doc: WorkflowDocument,
): { nodes: RFNode[]; edges: RFEdge[] } => {
  const nodes: RFNode[] = doc.domain.nodes.map((node) => {
    const viewNode = doc.view.nodes.find((item) => item.id === node.id);

    return {
      id: node.id,
      position: { x: viewNode?.x ?? 0, y: viewNode?.y ?? 0 },
      type: 'default',
      data: buildNodeLabel(node),
    };
  });

  const edges: RFEdge[] = doc.domain.edges.map((edge) => ({
    id: edge.id,
    source: edge.sourceNodeId,
    sourceHandle: edge.sourcePort,
    target: edge.targetNodeId,
    targetHandle: edge.targetPort,
  }));

  return { nodes, edges };
};

const applyNodeChangesToDoc = (doc: WorkflowDocument, changes: NodeChange[]): WorkflowDocument => {
  const removedNodeIds = new Set(
    changes.filter((change) => change.type === 'remove').map((change) => change.id),
  );

  const movedNodesById = new Map(
    changes
      .filter((change): change is Extract<NodeChange, { type: 'position' }> => change.type === 'position')
      .map((change) => [change.id, change.position]),
  );

  const nextDomainNodes = doc.domain.nodes.filter((node) => !removedNodeIds.has(node.id));
  const nextDomainEdges = doc.domain.edges.filter(
    (edge) => !removedNodeIds.has(edge.sourceNodeId) && !removedNodeIds.has(edge.targetNodeId),
  );

  return {
    ...doc,
    domain: {
      ...doc.domain,
      nodes: nextDomainNodes,
      edges: nextDomainEdges,
    },
    view: {
      ...doc.view,
      nodes: doc.view.nodes
        .filter((node) => !removedNodeIds.has(node.id))
        .map((viewNode) => {
          const movedPosition = movedNodesById.get(viewNode.id);

          if (!movedPosition) {
            return viewNode;
          }

          return {
            ...viewNode,
            x: movedPosition.x,
            y: movedPosition.y,
          };
        }),
      edges: doc.view.edges.filter((edge) => nextDomainEdges.some((domainEdge) => domainEdge.id === edge.id)),
    },
  };
};

const applyEdgeChangesToDoc = (doc: WorkflowDocument, changes: EdgeChange[]): WorkflowDocument => {
  const removedEdgeIds = new Set(
    changes.filter((change) => change.type === 'remove').map((change) => change.id),
  );

  if (removedEdgeIds.size === 0) {
    return doc;
  }

  return {
    ...doc,
    domain: {
      ...doc.domain,
      edges: doc.domain.edges.filter((edge) => !removedEdgeIds.has(edge.id)),
    },
    view: {
      ...doc.view,
      edges: doc.view.edges.filter((edge) => !removedEdgeIds.has(edge.id)),
    },
  };
};

export const applyReactFlowChanges = (
  doc: WorkflowDocument,
  changes: {
    nodeChanges?: NodeChange[];
    edgeChanges?: EdgeChange[];
    connection?: Connection;
  },
): WorkflowDocument => {
  let nextDoc = doc;

  if (changes.nodeChanges && changes.nodeChanges.length > 0) {
    nextDoc = applyNodeChangesToDoc(nextDoc, changes.nodeChanges);
  }

  if (changes.edgeChanges && changes.edgeChanges.length > 0) {
    nextDoc = applyEdgeChangesToDoc(nextDoc, changes.edgeChanges);
  }

  if (changes.connection) {
    const { source, target, sourceHandle, targetHandle } = changes.connection;

    if (!source || !target) {
      return nextDoc;
    }

    const edgeId = `edge-${crypto.randomUUID()}`;
    const edge: DomainEdge = {
      id: edgeId,
      sourceNodeId: source,
      targetNodeId: target,
      sourcePort: sourceHandle ?? DEFAULT_SOURCE_PORT,
      targetPort: targetHandle ?? DEFAULT_TARGET_PORT,
    };

    nextDoc = {
      ...nextDoc,
      domain: {
        ...nextDoc.domain,
        edges: [...nextDoc.domain.edges, edge],
      },
      view: {
        ...nextDoc.view,
        edges: [...nextDoc.view.edges, { id: edgeId }],
      },
    };
  }

  return nextDoc;
};

export const getViewportFromReactFlow = (instance: ReactFlowInstance) => instance.getViewport();
