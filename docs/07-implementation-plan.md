# 07 - Plano de Implementação por Partes

## Regra central

Implementar por etapas pequenas, sempre finalizando algo funcional antes de avançar.

## Parte 1 - Bootstrap do projeto

Entregas:
- criar projeto Next.js com TypeScript
- instalar Tailwind
- instalar shadcn/ui
- preparar App Router
- estruturar pastas base
- configurar lint e aliases
- preparar PWA base

## Parte 2 - Base visual mobile first

Entregas:
- layout principal
- header simples
- navegação mínima
- container responsivo
- empty states
- estrutura da home

## Parte 3 - Persistência e banco

Entregas:
- Prisma
- schema inicial
- conexão com PostgreSQL
- seed simples opcional

## Parte 4 - CRUD de dispositivos

Entregas:
- modal de criação
- listagem
- edição
- exclusão
- rotas API
- validações

## Parte 5 - CRUD de comandos

Entregas:
- modal de criação
- seleção de cor
- listagem por dispositivo
- edição
- exclusão
- rotas API
- validações

## Parte 6 - Execução de comando

Entregas:
- endpoint `/api/execute`
- integração SMS Dev server-side
- loading
- toasts
- persistência do histórico

## Parte 7 - Histórico

Entregas:
- listagem de execuções
- filtros simples por dispositivo
- status visual

## Parte 8 - Endurecimento do projeto

Entregas:
- tratamento melhor de erro
- refino de acessibilidade
- refino de estados vazios
- refino de responsividade

## Parte 9 - Autenticação

Entregas:
- login
- proteção de rotas
- auditoria por usuário

## Definição de pronto por etapa

Cada etapa deve sair com:
- código organizado
- sem gambiarra estrutural
- validado manualmente
- documentação atualizada se houver impacto arquitetural
