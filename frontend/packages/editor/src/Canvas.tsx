import { memo, useEffect, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Connection,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { getNodeDefinition, type NodeType, type WorkflowDocument } from '../../workflow/src';
import {
  applyReactFlowChanges,
  getViewportFromReactFlow,
  mapDocumentToReactFlow,
} from './reactFlowAdapter';

type AddNodeRequest = {
  type: NodeType;
  requestId: number;
};

type CanvasProps = {
  doc: WorkflowDocument;
  addNodeRequest?: AddNodeRequest;
  onDocumentChange: (next: WorkflowDocument) => void;
  onSelectionChange: (nodeId?: string) => void;
};

type WorkflowNodeData = {
  label: string;
  icon: string;
  typeBadge: string;
};

const WorkflowNode = memo(({ data }: NodeProps<WorkflowNodeData>) => (
  <div className="min-w-[180px] rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 shadow-lg">
    <div className="flex items-center justify-between gap-2">
      <span className="text-sm font-semibold text-slate-100">
        {data.icon} {data.label}
      </span>
      <span className="rounded bg-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-200">
        {data.typeBadge}
      </span>
    </div>
  </div>
));

const nodeTypes = {
  workflowNode: WorkflowNode,
};

export function Canvas({ doc, addNodeRequest, onDocumentChange, onSelectionChange }: CanvasProps) {
  const [instance, setInstance] = useState<ReactFlowInstance | null>(null);
  const { nodes, edges } = mapDocumentToReactFlow(doc);
  const workflowNodes = nodes.map((node) => ({ ...node, type: 'workflowNode' }));

  useEffect(() => {
    if (!addNodeRequest || !instance) {
      return;
    }

    const definition = getNodeDefinition(addNodeRequest.type);
    if (!definition) {
      return;
    }

    const { x, y, zoom } = doc.view.viewport;
    const paneRect = document.querySelector('.react-flow')?.getBoundingClientRect();
    const centerX = paneRect ? paneRect.left + paneRect.width / 2 : 640;
    const centerY = paneRect ? paneRect.top + paneRect.height / 2 : 360;
    const worldX = (centerX - x) / zoom;
    const worldY = (centerY - y) / zoom;
    const nodeId = `node-${addNodeRequest.type.replace('.', '-')}-${crypto.randomUUID()}`;

    onDocumentChange({
      ...doc,
      domain: {
        ...doc.domain,
        nodes: [
          ...doc.domain.nodes,
          {
            id: nodeId,
            type: definition.type,
            typeVersion: definition.typeVersion,
            params: definition.defaultParams(),
          },
        ],
      },
      view: {
        ...doc.view,
        nodes: [...doc.view.nodes, { id: nodeId, x: worldX, y: worldY }],
      },
    });
  }, [addNodeRequest, doc, instance, onDocumentChange]);

  const onNodesChange = (changes: NodeChange[]) => {
    onDocumentChange(applyReactFlowChanges(doc, { nodeChanges: changes }));
  };

  const onEdgesChange = (changes: EdgeChange[]) => {
    onDocumentChange(applyReactFlowChanges(doc, { edgeChanges: changes }));
  };

  const onConnect = (connection: Connection) => {
    onDocumentChange(applyReactFlowChanges(doc, { connection }));
  };

  const onMoveEnd = (_event: unknown, flowInstance: ReactFlowInstance) => {
    const viewport = getViewportFromReactFlow(flowInstance);

    onDocumentChange({
      ...doc,
      view: {
        ...doc.view,
        viewport,
      },
    });
  };

  return (
    <div className="h-full w-full bg-slate-950">
      <ReactFlow
        nodes={workflowNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={setInstance}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onMoveEnd={onMoveEnd}
        defaultViewport={doc.view.viewport}
        onSelectionChange={({ nodes: selectedNodes }) =>
          onSelectionChange((selectedNodes[0] as Node | undefined)?.id)
        }
      >
        <MiniMap />
        <Background gap={16} size={1} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
