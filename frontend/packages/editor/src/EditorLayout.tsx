import { useState } from 'react';
import { Button } from '../../ui/src';
import type { DomainNode, NodeType, Operation, WorkflowDocument } from '../../workflow/src';
import { Canvas } from './Canvas';
import { Inspector } from './Inspector';
import { NodePalette } from './NodePalette';

type EditorLayoutProps = {
  doc: WorkflowDocument;
  selectedNode?: DomainNode;
  onApplyOperations: (operations: Operation[]) => void;
  onUpdateNodeParams: (nodeId: string, partialParams: Record<string, unknown>) => void;
  onSelectionChange: (nodeId?: string) => void;
  onNew: () => void;
  onSaveSnapshot: () => void;
};

export function EditorLayout({
  doc,
  selectedNode,
  onApplyOperations,
  onUpdateNodeParams,
  onSelectionChange,
  onNew,
  onSaveSnapshot,
}: EditorLayoutProps) {
  const [addNodeRequest, setAddNodeRequest] = useState<{ type: NodeType; requestId: number }>();

  const handleAddNode = (type: NodeType) => {
    setAddNodeRequest({ type, requestId: Date.now() });
  };

  return (
    <div className="flex h-screen flex-col bg-slate-900 text-slate-100">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900 px-4">
        <h1 className="text-lg font-semibold">BPMN Studio</h1>
        <div className="flex gap-2">
          <Button onClick={onNew}>New</Button>
          <Button onClick={onSaveSnapshot}>Save snapshot</Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr_320px]">
        <NodePalette onAddNode={handleAddNode} />
        <main className="min-h-0">
          <Canvas
            doc={doc}
            addNodeRequest={addNodeRequest}
            onApplyOperations={onApplyOperations}
            onSelectionChange={onSelectionChange}
          />
        </main>
        <Inspector selectedNode={selectedNode} updateNodeParams={onUpdateNodeParams} />
      </div>
    </div>
  );
}
