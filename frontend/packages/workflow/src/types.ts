export type NodeType =
  | 'trigger.cron'
  | 'trigger.webhook'
  | 'action.http'
  | 'action.transform'
  | 'control.if'
  | 'action.log';

export type WorkflowDocument = {
  id: string;
  name: string;
  version: number;
  domain: DomainGraph;
  view: ViewGraph;
};

export type DomainGraph = {
  nodes: DomainNode[];
  edges: DomainEdge[];
};

export type DomainNode = {
  id: string;
  type: NodeType;
  typeVersion: number;
  params: Record<string, unknown>;
};

export type DomainEdge = {
  id: string;
  sourceNodeId: string;
  sourcePort: string;
  targetNodeId: string;
  targetPort: string;
};

export type ViewGraph = {
  nodes: ViewNode[];
  edges: ViewEdge[];
  viewport: { x: number; y: number; zoom: number };
};

export type ViewNode = {
  id: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  collapsed?: boolean;
};

export type ViewEdge = {
  id: string;
  style?: Record<string, unknown>;
};
