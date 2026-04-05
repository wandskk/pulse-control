# 08 - Workflow no Cursor

## Objetivo

Usar o Cursor como executor guiado, sempre por etapas pequenas.

## Regras para o Cursor

- nunca implementar o sistema inteiro de uma vez
- sempre seguir a ordem do plano de implementação
- antes de codar, ler a documentação relevante daquela etapa
- gerar código limpo e modular
- manter foco mobile first
- respeitar a arquitetura proposta
- não expor segredos no client
- atualizar documentação quando uma decisão estrutural mudar

## Forma de pedir no Cursor

Sempre pedir assim:
1. objetivo da etapa
2. escopo fechado
3. arquivos que podem ser criados/alterados
4. critérios de aceite

## Exemplo de comando

“Implemente apenas a Parte 4 do plano. Crie o CRUD de dispositivos com modal em shadcn/ui, validação com Zod, rotas API em Next.js App Router e persistência com Prisma. Não implemente comandos ainda.”

## Regra de revisão

Ao final de cada etapa, pedir:
- resumo do que foi feito
- lista de arquivos criados/alterados
- próximos passos recomendados
- possíveis riscos ou pontos de atenção
