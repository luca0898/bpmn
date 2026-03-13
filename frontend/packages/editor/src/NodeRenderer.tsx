import { memo } from 'react';
import type { NodeProps } from 'reactflow';

type NodeRendererData = {
  type: string;
  displayName: string;
  summary: string;
  icon: string;
};

export const NodeRenderer = memo(({ data }: NodeProps<NodeRendererData>) => (
  <div className="min-w-[220px] rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 shadow-lg">
    <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
      <span>{data.icon}</span>
      <span className="truncate">{data.displayName}</span>
    </div>
    <p className="mt-1 truncate text-xs text-slate-300">{data.summary}</p>
    <p className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">{data.type}</p>
  </div>
));

NodeRenderer.displayName = 'NodeRenderer';
