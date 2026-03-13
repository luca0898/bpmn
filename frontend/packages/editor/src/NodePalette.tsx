import { getAllNodeDefinitions, type NodeType } from '../../workflow/src';
import { Panel } from '../../ui/src';

type NodePaletteProps = {
  onAddNode: (type: NodeType) => void;
};

const groups = getAllNodeDefinitions().reduce(
  (acc, definition) => {
    const categoryItems = acc.get(definition.category) ?? [];
    categoryItems.push(definition);
    acc.set(definition.category, categoryItems);
    return acc;
  },
  new Map<string, ReturnType<typeof getAllNodeDefinitions>>(),
);

export function NodePalette({ onAddNode }: NodePaletteProps) {
  return (
    <Panel title="Node Library" className="h-full rounded-none border-0 border-r">
      <div className="space-y-4">
        {Array.from(groups.entries()).map(([category, definitions]) => (
          <div key={category}>
            <h3 className="mb-2 text-xs font-semibold uppercase text-slate-500">{category}</h3>
            <ul className="space-y-2">
              {definitions.map((definition) => (
                <li key={definition.type}>
                  <button
                    type="button"
                    onClick={() => onAddNode(definition.type)}
                    className="w-full rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-left text-sm text-slate-200 hover:bg-slate-700"
                  >
                    <div className="font-medium">
                      {definition.icon} {definition.displayName}
                    </div>
                    <div className="text-xs text-slate-400">{definition.type}</div>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}
