import type { Edge as RFEdge, Node as RFNode } from 'reactflow';
import { getNodeDefinition, getNodeSummary, type DomainNode, type WorkflowDocument } from '../../workflow/src';

const buildNodeLabel = (node: DomainNode) => {
  const definition = getNodeDefinition(node.type, node.typeVersion);

  return {
    type: node.type,
    displayName: definition?.displayName ?? node.type,
    icon: definition?.icon ?? '◻️',
    summary: getNodeSummary(node.type, node.params),
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
      type: 'workflowNode',
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
