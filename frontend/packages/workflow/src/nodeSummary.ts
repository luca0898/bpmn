import type { NodeType } from './types';

const asText = (value: unknown): string => (typeof value === 'string' && value.length > 0 ? value : '—');

const asBool = (value: unknown): string => (typeof value === 'boolean' ? (value ? 'true' : 'false') : '—');

export const getNodeSummary = (type: NodeType, params: Record<string, unknown>): string => {
  switch (type) {
    case 'trigger.cron':
      return `cron: ${asText(params.cron)}`;
    case 'trigger.webhook':
      return `${asText(params.method)} ${asText(params.path)}`;
    case 'action.http':
      return `${asText(params.method)} ${asText(params.url)}`;
    case 'action.transform':
      return `expr: ${asText(params.expression)}`;
    case 'control.if':
      return `if: ${asText(params.condition)}`;
    case 'action.log':
      return `msg: ${asText(params.message)}`;
    default:
      return asBool(params.enabled);
  }
};
