# 01 - Arquitetura da Aplicação

## Stack principal

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Zod
- React Hook Form
- Prisma
- PostgreSQL
- PWA (manifest + service worker)
- Vercel para deploy

## Por que Next.js

A aplicação precisa de frontend instalável e backend seguro no mesmo projeto. O Next.js resolve isso muito bem com App Router e Route Handlers.

## Estilo arquitetural

Arquitetura orientada por domínio, separando claramente:

- UI
- regras de negócio
- validação
- acesso a dados
- integrações externas

## Camadas sugeridas

```txt
src/
  app/
    (public)/
    (app)/
    api/
  components/
  features/
  lib/
  server/
  types/
```

## Estrutura sugerida detalhada

```txt
src/
  app/
    layout.tsx
    globals.css
    manifest.ts
    (app)/
      page.tsx
      devices/
        page.tsx
      history/
        page.tsx
    api/
      devices/
        route.ts
      devices/[id]/
        route.ts
      commands/
        route.ts
      commands/[id]/
        route.ts
      execute/
        route.ts
      history/
        route.ts
  components/
    ui/
    shared/
  features/
    devices/
      components/
      hooks/
      schemas/
      services/
      types/
    commands/
      components/
      hooks/
      schemas/
      services/
      types/
    history/
      components/
      services/
  lib/
    utils.ts
    constants.ts
    color-options.ts
  server/
    db/
      prisma.ts
    auth/
    sms/
      smsdev.ts
    repositories/
    services/
    validators/
  types/
```

## Responsabilidade por camada

### app/
Define rotas, layouts e handlers.

### features/
Cada feature agrupa UI, schemas, hooks e tipos próprios.

### server/
Abriga tudo o que é sensível:
- integração com SMS Dev
- serviços de execução
- acesso ao banco
- validações server-side

### components/
Componentes compartilhados e base UI.

## Fluxo principal de execução

1. usuário seleciona um dispositivo
2. usuário toca em um botão de comando
3. frontend chama `POST /api/execute`
4. backend valida dispositivo e comando
5. backend chama SMS Dev
6. backend persiste histórico
7. frontend recebe resultado e mostra feedback

## Estratégia de persistência

### MVP inicial
- banco para dados reais do domínio
- localStorage apenas para preferências de UI, como último dispositivo selecionado

### Evolução futura
- autenticação
- multiusuário
- auditoria mais completa
- status assíncrono de entrega
