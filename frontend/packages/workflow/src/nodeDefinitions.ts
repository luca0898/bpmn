import type { NodeDefinition, NodeType } from './types';

const NODE_DEFINITIONS: NodeDefinition[] = [
  {
    type: 'trigger.cron',
    typeVersion: 1,
    displayName: 'Cron Trigger',
    category: 'Triggers',
    description: 'Dispara o workflow em um agendamento cron.',
    icon: '⏰',
    ports: {
      inputs: [],
      outputs: [{ name: 'out', kind: 'control' }],
    },
    paramSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        cron: { type: 'string', description: 'Expressão cron.' },
      },
      required: ['cron'],
    },
    defaultParams: () => ({ cron: '0 * * * *' }),
  },
  {
    type: 'trigger.webhook',
    typeVersion: 1,
    displayName: 'Webhook Trigger',
    category: 'Triggers',
    description: 'Dispara o workflow quando recebe uma requisição HTTP.',
    icon: '🪝',
    ports: {
      inputs: [],
      outputs: [
        { name: 'out', kind: 'control' },
        { name: 'payload', kind: 'data', dataType: 'json' },
      ],
    },
    paramSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
        path: { type: 'string' },
      },
      required: ['method', 'path'],
    },
    defaultParams: () => ({ method: 'POST', path: '/hook' }),
  },
  {
    type: 'action.http',
    typeVersion: 1,
    displayName: 'HTTP Request',
    category: 'Actions',
    description: 'Executa uma chamada HTTP.',
    icon: '🌐',
    ports: {
      inputs: [{ name: 'in', kind: 'control' }],
      outputs: [
        { name: 'out', kind: 'control' },
        { name: 'response', kind: 'data', dataType: 'json' },
      ],
    },
    paramSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
        url: { type: 'string' },
      },
      required: ['method', 'url'],
    },
    defaultParams: () => ({ method: 'GET', url: 'https://api.example.com' }),
  },
  {
    type: 'action.transform',
    typeVersion: 1,
    displayName: 'Transform',
    category: 'Actions',
    description: 'Transforma dados de entrada em nova estrutura.',
    icon: '🧩',
    ports: {
      inputs: [
        { name: 'in', kind: 'control' },
        { name: 'input', kind: 'data', dataType: 'json' },
      ],
      outputs: [
        { name: 'out', kind: 'control' },
        { name: 'output', kind: 'data', dataType: 'json' },
      ],
    },
    paramSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        expression: { type: 'string' },
      },
      required: ['expression'],
    },
    defaultParams: () => ({ expression: 'return input;' }),
  },
  {
    type: 'control.if',
    typeVersion: 1,
    displayName: 'IF',
    category: 'Control',
    description: 'Desvia o fluxo de controle com base em uma condição.',
    icon: '🔀',
    ports: {
      inputs: [{ name: 'in', kind: 'control' }],
      outputs: [
        { name: 'true', kind: 'control' },
        { name: 'false', kind: 'control' },
      ],
    },
    paramSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        condition: { type: 'string' },
      },
      required: ['condition'],
    },
    defaultParams: () => ({ condition: 'true' }),
  },
  {
    type: 'action.log',
    typeVersion: 1,
    displayName: 'Log',
    category: 'Actions',
    description: 'Registra uma mensagem no sistema de logs.',
    icon: '📝',
    ports: {
      inputs: [
        { name: 'in', kind: 'control' },
        { name: 'payload', kind: 'data', dataType: 'json' },
      ],
      outputs: [{ name: 'out', kind: 'control' }],
    },
    paramSchema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
      required: ['message'],
    },
    defaultParams: () => ({ message: 'Done' }),
  },
];

export const getAllNodeDefinitions = (): NodeDefinition[] => NODE_DEFINITIONS;

export const getNodeDefinition = (
  type: NodeType,
  version?: number,
): NodeDefinition | undefined => {
  if (version === undefined) {
    return NODE_DEFINITIONS.find((definition) => definition.type === type);
  }

  return NODE_DEFINITIONS.find(
    (definition) => definition.type === type && definition.typeVersion === version,
  );
};
