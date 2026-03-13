export type NodeType =
  | 'trigger.cron'
  | 'trigger.webhook'
  | 'action.http'
  | 'action.transform'
  | 'control.if'
  | 'action.log';

export type PortKind = 'data' | 'control';
export type PortDataType = 'json' | 'string' | 'number' | 'boolean' | 'binary';

export type PortDef = {
  name: string;
  kind: PortKind;
  dataType?: PortDataType;
};

export type NodeCategory = 'Triggers' | 'Actions' | 'Control';

export type JsonSchema = {
  $schema?: 'http://json-schema.org/draft-07/schema#';
  type?: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean' | 'null';
  properties?: Record<string, JsonSchema>;
  required?: string[];
  items?: JsonSchema;
  enum?: Array<string | number | boolean | null>;
  description?: string;
  default?: unknown;
};

export type NodeDefinition = {
  type: NodeType;
  typeVersion: number;
  displayName: string;
  category: NodeCategory;
  description: string;
  icon: string;
  ports: {
    inputs: PortDef[];
    outputs: PortDef[];
  };
  paramSchema: JsonSchema;
  defaultParams: () => Record<string, unknown>;
};

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
