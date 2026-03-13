import { useMemo, useRef, useState, type ChangeEvent } from 'react';
import { EditorLayout } from '../../../packages/editor/src';
import {
  applyOperation,
  createNewWorkflowDocument,
  createStarterWorkflowDocument,
  deserializeOperation,
  parseWorkflowDocument,
  replaySnapshotWithOperations,
  serializeOperation,
  stringifyWorkflowDocument,
  validateWorkflow,
  getNodeById,
  type EditorHistory,
  type Operation,
  type Snapshot,
  type WorkflowDocument,
} from '../../../packages/workflow/src';

const SNAPSHOTS_KEY = 'workflow:mvp:snapshots';
const OPS_KEY = 'workflow:mvp:ops';
const MAX_OPS = 200;

const getInitialState = (): { doc: WorkflowDocument; history: EditorHistory } => {
  const fallbackDoc = createStarterWorkflowDocument();

  try {
    const snapshotRaw = localStorage.getItem(SNAPSHOTS_KEY);
    const operationRaw = localStorage.getItem(OPS_KEY);

    const snapshots = snapshotRaw ? (JSON.parse(snapshotRaw) as Snapshot[]) : [];
    const operations = operationRaw
      ? (JSON.parse(operationRaw) as string[]).map((item) => deserializeOperation(item))
      : [];

    const doc =
      snapshots.length > 0
        ? replaySnapshotWithOperations(snapshots[snapshots.length - 1], operations)
        : fallbackDoc;

    return {
      doc,
      history: {
        operations,
        snapshots,
        headSeq: operations.length,
      },
    };
  } catch {
    return {
      doc: fallbackDoc,
      history: {
        operations: [],
        snapshots: [],
        headSeq: 0,
      },
    };
  }
};

export default function App() {
  const [{ doc: initialDoc, history: initialHistory }] = useState(getInitialState);
  const [currentDoc, setCurrentDoc] = useState<WorkflowDocument>(initialDoc);
  const [, setHistory] = useState<EditorHistory>(initialHistory);
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const [importError, setImportError] = useState<string>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const persistHistory = (nextHistory: EditorHistory) => {
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(nextHistory.snapshots));
    localStorage.setItem(
      OPS_KEY,
      JSON.stringify(nextHistory.operations.map((item) => serializeOperation(item))),
    );
  };

  const applyOperations = (operations: Operation[]) => {
    if (operations.length === 0) {
      return;
    }

    setCurrentDoc((prev) =>
      operations.reduce((acc, operation) => applyOperation(acc, operation), prev),
    );

    setHistory((prev) => {
      const nextOperations = [...prev.operations, ...operations].slice(-MAX_OPS);
      const nextHistory = {
        ...prev,
        operations: nextOperations,
        headSeq: prev.headSeq + operations.length,
      };

      persistHistory(nextHistory);
      return nextHistory;
    });
  };

  const updateNodeParams = (nodeId: string, partialParams: Record<string, unknown>) => {
    applyOperations([
      {
        type: 'UpdateNodeParams',
        nodeId,
        params: partialParams,
      },
    ]);
  };

  const saveSnapshot = () => {
    const snapshot: Snapshot = {
      snapshotId: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      document: currentDoc,
    };

    setHistory((prev) => {
      const nextHistory: EditorHistory = {
        snapshots: [...prev.snapshots, snapshot],
        operations: prev.operations.slice(-MAX_OPS),
        headSeq: prev.headSeq,
      };
      persistHistory(nextHistory);
      return nextHistory;
    });
  };

  const createNew = () => {
    const doc = createNewWorkflowDocument();
    const nextHistory: EditorHistory = { operations: [], snapshots: [], headSeq: 0 };
    setCurrentDoc(doc);
    setSelectedNodeId(undefined);
    setHistory(nextHistory);
    setImportError(undefined);
    persistHistory(nextHistory);
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const importWorkflow = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const importedDoc = parseWorkflowDocument(raw);
      const snapshot: Snapshot = {
        snapshotId: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        document: importedDoc,
      };
      const nextHistory: EditorHistory = { operations: [], snapshots: [snapshot], headSeq: 0 };

      setCurrentDoc(importedDoc);
      setSelectedNodeId(undefined);
      setImportError(undefined);
      setHistory(nextHistory);
      persistHistory(nextHistory);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown import error.';
      setImportError(`Import failed: ${message}`);
    } finally {
      event.target.value = '';
    }
  };

  const exportWorkflow = () => {
    const json = stringifyWorkflowDocument(currentDoc);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workflow-${currentDoc.id}-v${currentDoc.version}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const selectedNode = useMemo(
    () => (selectedNodeId ? getNodeById(currentDoc, selectedNodeId) : undefined),
    [currentDoc, selectedNodeId],
  );

  const validation = useMemo(() => validateWorkflow(currentDoc), [currentDoc]);

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={importWorkflow}
        aria-label="Open workflow file"
      />
      {importError ? (
        <div className="border-b border-rose-800 bg-rose-950 px-4 py-2 text-sm text-rose-200">
          {importError}
        </div>
      ) : null}
      <EditorLayout
        doc={currentDoc}
        selectedNode={selectedNode}
        validation={validation}
        onApplyOperations={applyOperations}
        onUpdateNodeParams={updateNodeParams}
        onSelectionChange={setSelectedNodeId}
        onNew={createNew}
        onSaveSnapshot={saveSnapshot}
        onOpen={openFilePicker}
        onExport={exportWorkflow}
      />
    </>
  );
}
