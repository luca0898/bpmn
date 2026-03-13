import { Panel } from '../../ui/src';

const NODE_LIBRARY = [
  {
    category: 'Triggers',
    items: ['Cron Trigger', 'Webhook Trigger'],
  },
  {
    category: 'Actions',
    items: ['HTTP Request', 'Transform', 'Log'],
  },
  {
    category: 'Control',
    items: ['IF'],
  },
];

export function NodePalette() {
  return (
    <Panel title="Node Library" className="h-full rounded-none border-0 border-r">
      <div className="space-y-4">
        {NODE_LIBRARY.map((group) => (
          <div key={group.category}>
            <h3 className="mb-2 text-xs font-semibold uppercase text-slate-500">
              {group.category}
            </h3>
            <ul className="space-y-2">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="cursor-grab rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-200"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Panel>
  );
}
