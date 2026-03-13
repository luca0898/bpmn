import { useMemo, useState } from 'react';
import { EditorLayout } from '../../../packages/editor/src';
import {
  applyOperation,
  createNewWorkflowDocument,
  createStarterWorkflowDocument,
  deserializeOperation,
  getNodeById,
  serializeOperation,
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

    const baseDoc = snapshots.length > 0 ? snapshots[snapshots.length - 1].document : fallbackDoc;
    const doc = operations.reduce((acc, operation) => applyOperation(acc, operation), baseDoc);

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

  const persistHistory = (nextHistory: EditorHistory) => {
    localStorage.setItem(SNAPSHOTS_KEY, JSON.stringify(nextHistory.snapshots));
    localStorage.setItem(OPS_KEY, JSON.stringify(nextHistory.operations.map((item) => serializeOperation(item))));
  };

  const applyOperations = (operations: Operation[]) => {
    if (operations.length === 0) {
      return;
    }

    setCurrentDoc((prev) => operations.reduce((acc, operation) => applyOperation(acc, operation), prev));

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
    persistHistory(nextHistory);
  };

  const selectedNode = useMemo(
    () => (selectedNodeId ? getNodeById(currentDoc, selectedNodeId) : undefined),
    [currentDoc, selectedNodeId],
  );

  return (
    <EditorLayout
      doc={currentDoc}
      selectedNode={selectedNode}
      onApplyOperations={applyOperations}
      onUpdateNodeParams={updateNodeParams}
      onSelectionChange={setSelectedNodeId}
      onNew={createNew}
      onSaveSnapshot={saveSnapshot}
    />
  );
}
