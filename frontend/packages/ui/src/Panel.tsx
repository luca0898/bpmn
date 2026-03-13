import type { PropsWithChildren } from 'react';

type PanelProps = PropsWithChildren<{
  title?: string;
  className?: string;
}>;

export function Panel({ title, className = '', children }: PanelProps) {
  return (
    <section className={`border border-slate-800 bg-slate-900 ${className}`}>
      {title ? (
        <header className="border-b border-slate-800 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {title}
        </header>
      ) : null}
      <div className="p-3">{children}</div>
    </section>
  );
}
