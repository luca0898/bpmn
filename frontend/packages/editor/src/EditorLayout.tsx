import { useState } from 'react';
import { Button } from '../../ui/src';
import type { DomainNode, NodeType, WorkflowDocument } from '../../workflow/src';
import { Canvas } from './Canvas';
import { Inspector } from './Inspector';
import { NodePalette } from './NodePalette';

type EditorLayoutProps = {
  doc: WorkflowDocument;
  selectedNode?: DomainNode;
  onDocumentChange: (next: WorkflowDocument) => void;
  onSelectionChange: (nodeId?: string) => void;
};

export function EditorLayout({
  doc,
  selectedNode,
  onDocumentChange,
  onSelectionChange,
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
          <Button>New</Button>
          <Button>Open</Button>
          <Button>Save snapshot</Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr_320px]">
        <NodePalette onAddNode={handleAddNode} />
        <main className="min-h-0">
          <Canvas
            doc={doc}
            addNodeRequest={addNodeRequest}
            onDocumentChange={onDocumentChange}
            onSelectionChange={onSelectionChange}
          />
        </main>
        <Inspector selectedNode={selectedNode} />
      </div>
    </div>
  );
}
