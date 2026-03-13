import { useMemo, useState } from 'react';
import { EditorLayout } from '../../../packages/editor/src';
import {
  createStarterWorkflowDocument,
  getNodeById,
  type WorkflowDocument,
} from '../../../packages/workflow/src';

export default function App() {
  const [doc, setDoc] = useState<WorkflowDocument>(() => createStarterWorkflowDocument());
  const [selectedNodeId, setSelectedNodeId] = useState<string>();

  const selectedNode = useMemo(
    () => (selectedNodeId ? getNodeById(doc, selectedNodeId) : undefined),
    [doc, selectedNodeId],
  );

  return (
    <EditorLayout
      doc={doc}
      selectedNode={selectedNode}
      onDocumentChange={setDoc}
      onSelectionChange={setSelectedNodeId}
    />
  );
}
