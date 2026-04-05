# Roadmap de arquitetura — Pulse Control

Documento vivo para ajustes incrementais: organização de pastas, separação de responsabilidades, performance e aderência a um fluxo **spec-driven** (regras e contratos explícitos antes da implementação).

**Como usar:** marque itens concluídos (`[x]`), adicione datas ou PRs na coluna de notas quando útil. Evite expandir o escopo de um item ao implementá-lo.

---

## 1. Princípios alvo

| Princípio | Significado prático |
|-----------|---------------------|
| **Domínio no centro** | Regras de negócio e acesso a dados agnósticos de HTTP/React ficam em `lib/server/` (ou `lib/domain/`), não nas `route.ts`. |
| **Rotas finas** | `app/api/**/route.ts` só: auth, parse, chama serviço, mapeia status/DTO, erro. |
| **Um lugar para contratos** | Entrada: Zod em `lib/validators/<domínio>/`. Saída: DTOs tipados; opcionalmente schemas Zod de resposta para validação em testes ou clientes gerados. |
| **UI por feature** | Telas e componentes específicos em `features/<domínio>/`; compartilhados em `components/shared` e `components/ui`. |
| **Cliente HTTP** | Chamadas do browser em `lib/api-client/` (módulos por domínio + `index.ts`), para não virar um único arquivo gigante. |
| **Utils vs domínio** | `lib/utils/*`: puro, sem Prisma, sem segredos. Formatação, `cn`, helpers genéricos. Não misturar com regras de SMS, ownership de device, etc. |

---

## 2. Mapa de pastas (estado alvo)

```
app/
  (app)/          # rotas autenticadas — só composição de páginas
  api/            # handlers HTTP — finos
  login/
components/
  ui/             # shadcn
  shared/         # cross-feature
features/
  <domínio>/
    components/
    hooks/        # opcional: hooks só usados nessa feature
    lib/          # opcional: constantes/copy específicos
lib/
  api-client/     # http.ts + auth, devices, … + index.ts
  auth/
  constants/
  http/
  server/         # NOVO sugerido: serviços e queries por domínio
    devices/
    commands/
    categories/
    executions/
  services/       # integrações externas (ex.: sms/smsdev)
  storage/        # apenas client (localStorage, etc.)
  types/          # device, command, category, execution + index; dto.ts reexporta
  validators/
  utils/
db/
  prisma.ts
prisma/
specs/            # opcional: ADRs, decisões, contratos OpenAPI leves
```

---

## 3. Estado atual (observação objetiva)

**Pontos fortes**

- Stack alinhada (Next App Router, Zod, Prisma, shadcn).
- Validação de entrada em rotas com Zod; `lib/http/request` para body e erros.
- DTOs em `lib/types/` (`index.ts` + arquivos por entidade).
- `lib/services/sms/smsdev.ts` separado da UI.
- `features/*` para páginas principais; `components/shared` para padrões de lista/ações.

**Gaps típicos de evolução sênior**

- **Lógica repetida nas rotas:** padrão `requireSessionWhenConfigured` + `prisma.device.findFirst` com `userId` aparece em vários arquivos — candidato a helper de autorização + “obter device com escopo usuário”.
- **Handler de execute:** orquestração (dry-run, SMS, persistência) poderia viver em `lib/server/executions/execute-command.ts` para testar e ler sem passar por HTTP.
- **`lib/api-client/`:** particionado por domínio; import público continua `@/lib/api-client`.
- **Documentação de produto/API:** pasta `docs/` foi reduzida; a skill do projeto ainda referencia `docs/` — alinhar (restaurar visão mínima ou atualizar a skill).
- **Testes:** Vitest + `npm test`; ampliar cobertura conforme necessidade.
- **Performance frontend:** revisar `fetch` no cliente (cache, `stale-while-revalidate` onde fizer sentido, evitar waterfalls em páginas com muitas dependências).

---

## 4. Backlog priorizado

### Fase A — Fundação (baixo risco, alto ganho de clareza)

- [x] **A1 — Camada `lib/server` (ou nome equivalente)**  
  Introduzir módulos por domínio com funções puras do tipo `listCommandsForDevice(...)`, `assertDeviceOwnedByUser(...)`. Migrar uma rota piloto (ex.: `GET /api/commands`) e depois as demais em PRs pequenos.

- [x] **A2 — Helper de acesso a dispositivo**  
  Centralizar a query `device.findFirst` + regras de `userId` / `isActive` em uma função (ex.: `getDeviceForUserOrThrow` / `getDeviceScoped`). Usar nas rotas que hoje duplicam o bloco.

- [x] **A3 — Extrair caso de uso “executar comando”**  
  Mover corpo principal de `app/api/execute/route.ts` para serviço testável; rota só delega.

- [x] **A4 — Documento de contrato mínimo**  
  Um arquivo em `specs/` ou `docs/` com tabela: rota → método → body/query → resposta `{ data | message }` → códigos HTTP. Atualizar quando mudar API pública.

### Fase B — Organização de código cliente e tipos

- [x] **B1 — Particionar `lib/api-client.ts`**  
  Arquivos `lib/api-client/devices.ts`, `commands.ts`, … + `lib/api-client/index.ts` reexportando (ou manter `api-client.ts` como barrel).

- [x] **B2 — Particionar DTOs**  
  Arquivos por entidade em `lib/types/` + barrel `index.ts`; importar via `@/lib/types`.

- [x] **B3 — Hooks por feature**  
  Onde um hook só serve a uma tela (ex.: lógica de formulário), mover de `hooks/` global para `features/<x>/hooks/`. Manter em `hooks/` apenas o verdadeiramente compartilhado.

### Fase C — Qualidade e performance

- [x] **C1 — Testes unitários**  
  Adicionar Vitest (ou Jest compatível com Next) e cobrir: helpers em `lib/utils`, funções em `lib/server`, cliente SMS mockado.

- [x] **C2 — Lint e consistência**  
  Regra ESLint para evitar imports de `db/prisma` fora de `lib/server`, `app/api`, `prisma/`, se a arquitetura for adotada (pode ser gradual).

- [x] **C3 — Revisão de fetch no cliente**  
  Mapear chamadas em sequência na montagem de páginas; onde possível, paralelizar (`Promise.all`) ou um endpoint agregador (só se medir ganho real).

- [x] **C4 — Observabilidade**  
  Garantir que `logRouteError` cubra contexto suficiente (rota, ids não sensíveis); opcional: request id.

### Fase D — Spec-driven explícito (opcional, conforme necessidade)

- [ ] **D1 — Checklist por feature**  
  Para cada feature nova: objetivo, regras de negócio, casos de borda, contrato API — antes do código.

- [ ] **D2 — Schemas de saída (opcional)**  
  Zod para respostas críticas ou tipos gerados a partir do Prisma + camada fina de mapeamento — avaliar custo/benefício.

---

## 5. O que não fazer (anti-padrões)

- Misturar chamadas Prisma em componentes client (`"use client"`).
- Colocar regras de “pode enviar SMS?” espalhadas em UI e API sem uma função única de domínio.
- Criar `lib/helpers` genérico sem critério — preferir nome do domínio ou `utils` com função clara.
- Refatorar tudo de uma vez em um único PR gigante.

---

## 6. Alinhamento com a skill do repositório

A skill `nextjs-feature-builder` menciona `docs/` e organização por domínio. Após estabilizar este roadmap:

- Atualizar a skill para apontar para `docs/roadmap-arquitetura.md` e/ou um `docs/overview.md` mínimo; **ou**
- Manter `docs/` com este roadmap + `docs/api-contract.md` (contrato JSON das rotas).

---

## 7. Notas de implementação (preencher ao concluir itens)

| Item | Data / PR | Observações |
|------|-----------|-------------|
| A1–A3 | | `lib/server/devices` (`deviceWhereScoped`, `findDeviceScoped`); `lib/server/executions/execute-command.ts`; rotas `commands`, `categories`, `devices/[id]`, `execute` migradas. |
| B1 | | `lib/api-client/` com `http.ts`, `auth`, `devices`, `categories`, `commands`, `execute`, `history` + `index.ts`; removido `lib/api-client.ts`. |
| B2 | | `lib/types/{device,command,category,execution}.ts` + `index.ts`; `dto.ts` reexporta para compatibilidade. |
| B3 | | `useDevicesWithPersistedSelection` → `features/devices/hooks/`; pasta `hooks/` na raiz removida se vazia. |
| A4 | | `docs/api-contract.md` — tabelas por grupo de rotas. |
| C1 | | Vitest + `vitest.config.ts`; testes em `where.test.ts` e `phone-br.test.ts`; scripts `npm test` / `test:watch`. |
| C2 | | `eslint.config.mjs`: `no-restricted-imports` para `@/db/prisma` fora de `app/api`, `lib/server`, `db`, `prisma`. |
| C3 | | Comandos: `Promise.all` categorias+comandos ao trocar linha e após salvar; ref `deviceJustChangedRef` evita refetch duplicado ao resetar filtro. Histórico: `Promise.all` devices+histórico (todos) no mount; 1º filtro "" não refaz fetch. |
| C4 | | `logRouteError` JSON com `requestId` (headers `x-request-id` / `x-vercel-id` ou UUID), `method`, `ids` (cuid), `prismaCode`; stack só em dev. |
| | | |

---

*Última revisão estrutural do codebase: alinhada ao estado do repositório (App Router, Prisma, rotas em `app/api`, features em `features/*`).*
