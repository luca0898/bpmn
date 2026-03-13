import { useState } from 'react';
import { Button } from '../../ui/src';
import type {
  DomainNode,
  NodeType,
  Operation,
  ValidationError,
  WorkflowDocument,
} from '../../workflow/src';
import { Canvas } from './Canvas';
import { Inspector } from './Inspector';
import { NodePalette } from './NodePalette';

type EditorLayoutProps = {
  doc: WorkflowDocument;
  selectedNode?: DomainNode;
  validation: { ok: boolean; errors: ValidationError[] };
  onApplyOperations: (operations: Operation[]) => void;
  onUpdateNodeParams: (nodeId: string, partialParams: Record<string, unknown>) => void;
  onSelectionChange: (nodeId?: string) => void;
  onNew: () => void;
  onSaveSnapshot: () => void;
  onOpen: () => void;
  onExport: () => void;
};

export function EditorLayout({
  doc,
  selectedNode,
  validation,
  onApplyOperations,
  onUpdateNodeParams,
  onSelectionChange,
  onNew,
  onSaveSnapshot,
  onOpen,
  onExport,
}: EditorLayoutProps) {
  const [addNodeRequest, setAddNodeRequest] = useState<{ type: NodeType; requestId: number }>();
  const [inspectorOpen, setInspectorOpen] = useState(false);

  const handleAddNode = (type: NodeType) => {
    setAddNodeRequest({ type, requestId: Date.now() });
  };

  return (
    <div className="flex h-screen flex-col bg-slate-900 text-slate-100">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-800 bg-slate-900 px-4">
        <h1 className="text-lg font-semibold">BPMN Studio</h1>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              validation.ok ? 'bg-emerald-900/50 text-emerald-300' : 'bg-rose-900/50 text-rose-300'
            }`}
          >
            {validation.ok ? 'Valid' : `Invalid (${validation.errors.length})`}
          </span>
          <Button onClick={onOpen} aria-label="Open workflow JSON">
            Open
          </Button>
          <Button onClick={onExport} aria-label="Export workflow JSON">
            Export
          </Button>
          <Button onClick={onNew} aria-label="Create new workflow">
            New
          </Button>
          <Button onClick={onSaveSnapshot} aria-label="Save workflow snapshot">
            Save snapshot
          </Button>
          <Button
            className="md:hidden"
            onClick={() => setInspectorOpen((current) => !current)}
            aria-label="Toggle inspector"
          >
            Inspector
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[260px_1fr_320px]">
        <div className="hidden md:block">
          <NodePalette onAddNode={handleAddNode} />
        </div>
        <main className="min-h-0">
          <Canvas
            doc={doc}
            addNodeRequest={addNodeRequest}
            onApplyOperations={onApplyOperations}
            onSelectionChange={onSelectionChange}
          />
        </main>
        <div className={`${inspectorOpen ? 'block' : 'hidden'} border-l border-slate-800 md:block`}>
          <Inspector selectedNode={selectedNode} updateNodeParams={onUpdateNodeParams} />
        </div>
      </div>
      <div className="border-t border-slate-800 md:hidden">
        <NodePalette onAddNode={handleAddNode} />
      </div>
    </div>
  );
}
