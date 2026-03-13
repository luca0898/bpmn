import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from 'reactflow';
import 'reactflow/dist/style.css';
import type { WorkflowDocument } from '../../workflow/src';

type CanvasProps = {
  doc: WorkflowDocument;
  onDocumentChange: (next: WorkflowDocument) => void;
  onSelectionChange: (nodeId?: string) => void;
};

const nodeLabelByType: Record<string, string> = {
  'trigger.cron': 'Cron Trigger',
  'trigger.webhook': 'Webhook Trigger',
  'action.http': 'HTTP Request',
  'action.transform': 'Transform',
  'control.if': 'IF',
  'action.log': 'Log',
};

export function Canvas({ doc, onDocumentChange, onSelectionChange }: CanvasProps) {
  const nodes: Node[] = doc.domain.nodes.map((node) => {
    const viewNode = doc.view.nodes.find((item) => item.id === node.id);

    return {
      id: node.id,
      position: { x: viewNode?.x ?? 0, y: viewNode?.y ?? 0 },
      data: { label: nodeLabelByType[node.type] ?? node.type },
      type: 'default',
      selected: false,
    };
  });

  const edges: Edge[] = doc.domain.edges.map((edge) => ({
    id: edge.id,
    source: edge.sourceNodeId,
    target: edge.targetNodeId,
  }));

  const updateFromReactFlow = (nextNodes: Node[], nextEdges: Edge[]) => {
    onDocumentChange({
      ...doc,
      domain: {
        ...doc.domain,
        edges: nextEdges.map((edge) => ({
          id: edge.id,
          sourceNodeId: edge.source,
          sourcePort: 'out',
          targetNodeId: edge.target,
          targetPort: 'in',
        })),
      },
      view: {
        ...doc.view,
        nodes: nextNodes.map((node) => ({
          ...doc.view.nodes.find((item) => item.id === node.id),
          id: node.id,
          x: node.position.x,
          y: node.position.y,
        })),
      },
    });
  };

  const onNodesChange = (changes: NodeChange[]) => {
    const changedNodes = applyNodeChanges(changes, nodes);
    updateFromReactFlow(changedNodes, edges);
  };

  const onEdgesChange = (changes: EdgeChange[]) => {
    const changedEdges = applyEdgeChanges(changes, edges);
    updateFromReactFlow(nodes, changedEdges);
  };

  const onConnect = (connection: Connection) => {
    const connectedEdges = addEdge(
      {
        id: `edge-${crypto.randomUUID()}`,
        source: connection.source ?? '',
        target: connection.target ?? '',
      },
      edges,
    );
    updateFromReactFlow(nodes, connectedEdges);
  };

  return (
    <div className="h-full w-full bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={({ nodes: selectedNodes }) =>
          onSelectionChange(selectedNodes[0]?.id)
        }
        fitView
      >
        <MiniMap />
        <Background gap={16} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
