import { Panel } from '../../ui/src';
import type { DomainNode } from '../../workflow/src';

type InspectorProps = {
  selectedNode?: DomainNode;
};

export function Inspector({ selectedNode }: InspectorProps) {
  return (
    <Panel title="Inspector" className="h-full rounded-none border-0 border-l">
      {selectedNode ? (
        <div className="space-y-2">
          <p className="text-sm text-slate-300">
            <span className="font-semibold">Node:</span> {selectedNode.id}
          </p>
          <pre className="overflow-auto rounded-md bg-slate-950 p-3 text-xs text-slate-200">
            {JSON.stringify(selectedNode.params, null, 2)}
          </pre>
        </div>
      ) : (
        <p className="text-sm text-slate-400">Select a node to inspect its properties.</p>
      )}
    </Panel>
  );
}
