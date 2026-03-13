import { useEffect, useMemo, useState } from 'react';
import { Panel } from '../../ui/src';
import { getNodeDefinition, type DomainNode } from '../../workflow/src';

type InspectorProps = {
  selectedNode?: DomainNode;
  updateNodeParams: (nodeId: string, partialParams: Record<string, unknown>) => void;
};

export function Inspector({ selectedNode, updateNodeParams }: InspectorProps) {
  const [draftParams, setDraftParams] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setDraftParams(selectedNode?.params ?? {});
  }, [selectedNode]);

  useEffect(() => {
    if (!selectedNode) {
      return;
    }

    const timer = window.setTimeout(() => {
      updateNodeParams(selectedNode.id, draftParams);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [draftParams, selectedNode, updateNodeParams]);

  const definition = useMemo(
    () =>
      selectedNode ? getNodeDefinition(selectedNode.type, selectedNode.typeVersion) : undefined,
    [selectedNode],
  );

  const schemaProperties = definition?.paramSchema.properties ?? {};

  return (
    <Panel title="Inspector" className="h-full rounded-none border-0 border-l">
      {!selectedNode || !definition ? (
        <p className="text-sm text-slate-400">Select a node</p>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-300">
            <span className="font-semibold">{definition.displayName}</span>
          </p>
          {Object.entries(schemaProperties).map(([fieldName, fieldSchema]) => {
            const value = draftParams[fieldName];
            const label = fieldSchema.description || fieldName;

            if (fieldSchema.enum && fieldSchema.enum.length > 0) {
              return (
                <label key={fieldName} className="block space-y-1 text-xs text-slate-300">
                  <span>{label}</span>
                  <select
                    className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
                    value={String(value ?? '')}
                    onChange={(event) =>
                      setDraftParams((current) => ({ ...current, [fieldName]: event.target.value }))
                    }
                  >
                    {fieldSchema.enum.map((enumValue) => (
                      <option key={String(enumValue)} value={String(enumValue)}>
                        {String(enumValue)}
                      </option>
                    ))}
                  </select>
                </label>
              );
            }

            if (fieldSchema.type === 'boolean') {
              return (
                <label key={fieldName} className="flex items-center gap-2 text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(event) =>
                      setDraftParams((current) => ({ ...current, [fieldName]: event.target.checked }))
                    }
                  />
                  <span>{label}</span>
                </label>
              );
            }

            return (
              <label key={fieldName} className="block space-y-1 text-xs text-slate-300">
                <span>{label}</span>
                <input
                  className="w-full rounded border border-slate-700 bg-slate-900 px-2 py-1 text-sm"
                  type="text"
                  value={String(value ?? '')}
                  onChange={(event) =>
                    setDraftParams((current) => ({ ...current, [fieldName]: event.target.value }))
                  }
                />
              </label>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
