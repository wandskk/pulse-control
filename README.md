# Pulse Control PWA - Cursor Starter Pack

Este pacote foi preparado para orientar o Cursor na construção de uma aplicação **PWA, mobile first, em Next.js**, com backend no próprio framework, **envio de comandos** via provedor **SMS Dev** e desenvolvimento incremental por partes.

## Objetivo do produto

Criar um app instalável no celular, com foco em uso simples, onde o usuário poderá:

- cadastrar um ou mais números/dispositivos
- criar botões de ação com:
  - título
  - texto/código do comando
  - cor predefinida
- escolher um número/dispositivo
- tocar em um botão
- disparar o comando correspondente por backend seguro
- registrar histórico de execuções

## Premissas principais

- **Next.js** como base full-stack
- **App Router**
- **Tailwind CSS**
- **shadcn/ui** para modais, selects, formulários e feedback visual
- **PWA** instalável no dispositivo
- **mobile first**
- backend com **Route Handlers**
- **envio de comandos** via provedor **SMS Dev** somente no servidor
- persistência inicial pode começar simples, mas o projeto já deve nascer preparado para banco
- implementação incremental por sprints/partes

## Organização do pacote

- `docs/`: documentação funcional e técnica (inclui escopo MVP e regras de domínio)
- `.cursor/skills/`: skills para orientar o Cursor

## Ordem recomendada de execução no Cursor

1. Ler `docs/00-product-overview.md`
2. Ler `docs/01-architecture.md`
3. Ler `docs/07-implementation-plan.md` e `docs/08-cursor-workflow.md`
4. Implementar em partes pequenas, conforme o plano

## Diretriz importante

Não implementar tudo de uma vez. Sempre entregar em partes pequenas, testáveis e com boa base para o próximo passo.
