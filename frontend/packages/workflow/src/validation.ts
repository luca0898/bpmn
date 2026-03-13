import { getNodeDefinition } from './nodeDefinitions';
import type { DomainEdge, WorkflowDocument } from './types';

export type ValidationError = {
  code:
    | 'EDGE_INVALID_DIRECTION'
    | 'EDGE_SELF_CONNECTION'
    | 'EDGE_UNKNOWN_PORT'
    | 'EDGE_MULTIPLE_CONTROL_INPUT'
    | 'TRIGGER_LIMIT_EXCEEDED'
    | 'WORKFLOW_NOT_RUNNABLE';
  message: string;
  nodeId?: string;
  edgeId?: string;
};

const getPortKind = (nodeType: string, portName: string, direction: 'input' | 'output') => {
  const definition = getNodeDefinition(nodeType as never);
  if (!definition) {
    return undefined;
  }

  const ports = direction === 'input' ? definition.ports.inputs : definition.ports.outputs;
  return ports.find((port) => port.name === portName)?.kind;
};

const validateEdge = (
  doc: WorkflowDocument,
  edge: DomainEdge,
  existingControlInputMap: Map<string, string[]>,
): ValidationError[] => {
  const sourceNode = doc.domain.nodes.find((node) => node.id === edge.sourceNodeId);
  const targetNode = doc.domain.nodes.find((node) => node.id === edge.targetNodeId);

  if (!sourceNode || !targetNode) {
    return [];
  }

  const errors: ValidationError[] = [];

  if (edge.sourceNodeId === edge.targetNodeId) {
    errors.push({
      code: 'EDGE_SELF_CONNECTION',
      message: 'A node cannot connect to itself.',
      edgeId: edge.id,
      nodeId: edge.sourceNodeId,
    });
  }

  const sourceKind = getPortKind(sourceNode.type, edge.sourcePort, 'output');
  const targetKind = getPortKind(targetNode.type, edge.targetPort, 'input');

  if (!sourceKind || !targetKind) {
    errors.push({
      code: 'EDGE_UNKNOWN_PORT',
      message: 'Edge references an unknown source or target port.',
      edgeId: edge.id,
    });
    return errors;
  }

  if (
    !(sourceKind === 'control' && targetKind === 'control') &&
    !(sourceKind === 'data' && targetKind === 'data')
  ) {
    errors.push({
      code: 'EDGE_INVALID_DIRECTION',
      message: 'Each edge must connect output to input using matching port kinds.',
      edgeId: edge.id,
    });
  }

  if (targetKind === 'control') {
    const key = `${edge.targetNodeId}:${edge.targetPort}`;
    const incoming = existingControlInputMap.get(key) ?? [];
    incoming.push(edge.id);
    existingControlInputMap.set(key, incoming);

    if (incoming.length > 1) {
      errors.push({
        code: 'EDGE_MULTIPLE_CONTROL_INPUT',
        message: 'Control input ports only accept a single incoming connection.',
        edgeId: edge.id,
        nodeId: edge.targetNodeId,
      });
    }
  }

  return errors;
};

export const validateWorkflow = (
  doc: WorkflowDocument,
): { ok: boolean; errors: ValidationError[] } => {
  const errors: ValidationError[] = [];
  const controlInputMap = new Map<string, string[]>();

  for (const edge of doc.domain.edges) {
    errors.push(...validateEdge(doc, edge, controlInputMap));
  }

  const triggerNodes = doc.domain.nodes.filter((node) => node.type.startsWith('trigger.'));
  if (triggerNodes.length > 1) {
    triggerNodes.slice(1).forEach((node) => {
      errors.push({
        code: 'TRIGGER_LIMIT_EXCEEDED',
        message: 'Only one trigger is allowed per workflow (MVP).',
        nodeId: node.id,
      });
    });
  }

  const actionNodes = new Set(
    doc.domain.nodes.filter((node) => node.type.startsWith('action.')).map((node) => node.id),
  );

  const triggerNodeIds = new Set(triggerNodes.map((node) => node.id));
  const hasRunnablePath = doc.domain.edges.some(
    (edge) => triggerNodeIds.has(edge.sourceNodeId) && actionNodes.has(edge.targetNodeId),
  );

  if (triggerNodes.length > 0 && !hasRunnablePath) {
    errors.push({
      code: 'WORKFLOW_NOT_RUNNABLE',
      message: 'Workflow must have at least one action connected to the trigger to be runnable.',
    });
  }

  return { ok: errors.length === 0, errors };
};
