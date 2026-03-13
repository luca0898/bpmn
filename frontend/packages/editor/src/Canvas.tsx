import { useEffect, useState } from 'react';
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Connection,
  type EdgeChange,
  type Node,
  type NodeChange,
  type ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  getNodeDefinition,
  type AddEdgeOperation,
  type AddNodeOperation,
  type MoveNodeOperation,
  type NodeType,
  type Operation,
  type RemoveEdgeOperation,
  type RemoveNodeOperation,
  type SetViewportOperation,
  type WorkflowDocument,
} from '../../workflow/src';
import { mapDocumentToReactFlow } from './reactFlowAdapter';
import { NodeRenderer } from './NodeRenderer';

type AddNodeRequest = {
  type: NodeType;
  requestId: number;
};

type CanvasProps = {
  doc: WorkflowDocument;
  addNodeRequest?: AddNodeRequest;
  onApplyOperations: (operations: Operation[]) => void;
  onSelectionChange: (nodeId?: string) => void;
};

const DEFAULT_SOURCE_PORT = 'out';
const DEFAULT_TARGET_PORT = 'in';

const nodeTypes = {
  workflowNode: NodeRenderer,
};

export function Canvas({ doc, addNodeRequest, onApplyOperations, onSelectionChange }: CanvasProps) {
  const [instance, setInstance] = useState<ReactFlowInstance | null>(null);
  const { nodes, edges } = mapDocumentToReactFlow(doc);

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

    const operation: AddNodeOperation = {
      type: 'AddNode',
      node: {
        id: nodeId,
        type: definition.type,
        typeVersion: definition.typeVersion,
        params: definition.defaultParams(),
      },
      view: { id: nodeId, x: worldX, y: worldY },
    };

    onApplyOperations([operation]);
  }, [addNodeRequest, doc.view.viewport, instance, onApplyOperations]);

  const onNodesChange = (changes: NodeChange[]) => {
    const operations: Operation[] = [];

    changes.forEach((change) => {
      if (change.type === 'remove') {
        operations.push({ type: 'RemoveNode', nodeId: change.id } satisfies RemoveNodeOperation);
      }

      if (change.type === 'position' && change.position) {
        operations.push({
          type: 'MoveNode',
          nodeId: change.id,
          position: { x: change.position.x, y: change.position.y },
        } satisfies MoveNodeOperation);
      }
    });

    if (operations.length > 0) {
      onApplyOperations(operations);
    }
  };

  const onEdgesChange = (changes: EdgeChange[]) => {
    const operations: Operation[] = changes
      .filter((change) => change.type === 'remove')
      .map((change) => ({ type: 'RemoveEdge', edgeId: change.id }) satisfies RemoveEdgeOperation);

    if (operations.length > 0) {
      onApplyOperations(operations);
    }
  };

  const onConnect = (connection: Connection) => {
    const { source, target, sourceHandle, targetHandle } = connection;

    if (!source || !target) {
      return;
    }

    const op: AddEdgeOperation = {
      type: 'AddEdge',
      edge: {
        id: `edge-${crypto.randomUUID()}`,
        sourceNodeId: source,
        targetNodeId: target,
        sourcePort: sourceHandle ?? DEFAULT_SOURCE_PORT,
        targetPort: targetHandle ?? DEFAULT_TARGET_PORT,
      },
    };

    onApplyOperations([op]);
  };

  const onMoveEnd = (_event: unknown, flowInstance: ReactFlowInstance) => {
    const op: SetViewportOperation = {
      type: 'SetViewport',
      viewport: flowInstance.getViewport(),
    };

    onApplyOperations([op]);
  };

  return (
    <div className="h-full w-full bg-slate-950">
      <ReactFlow
        nodes={nodes}
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
