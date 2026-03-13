# Frontend

## Como rodar

Na raiz do monorepo:

```bash
pnpm install
pnpm dev
```

Comandos úteis:

```bash
pnpm --filter @bpmn/web dev
pnpm --filter @bpmn/web build
pnpm --filter @bpmn/workflow test
```

## Estrutura do monorepo

- `apps/web`: aplicação React (Vite + TypeScript + Tailwind) que monta o editor e persiste snapshot/ops no `localStorage`.
- `packages/editor`: componentes de UI do editor (canvas React Flow, palette, inspector e layout).
- `packages/workflow`: modelo de domínio do workflow, operações, serialização/importação e validações.
- `packages/ui`: componentes visuais reutilizáveis (botão, painel, etc).

## Como adicionar um novo NodeDefinition

1. Abra `packages/workflow/src/nodeDefinitions.ts`.
2. Adicione um novo item no array `NODE_DEFINITIONS` com:
   - `type` único (ex: `action.email`)
   - `typeVersion`
   - metadados de exibição (`displayName`, `category`, `description`, `icon`)
   - `ports.inputs` / `ports.outputs`
   - `paramSchema`
   - `defaultParams`
3. Garanta que o novo `type` esteja na união `NodeType` em `packages/workflow/src/types.ts`.
4. (Opcional, recomendado) Atualize `packages/workflow/src/nodeSummary.ts` para exibir um resumo útil no canvas.
5. Rode os testes:

```bash
pnpm --filter @bpmn/workflow test
```
