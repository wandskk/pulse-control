# SMS Remote Control PWA - Cursor Starter Pack

Este pacote foi preparado para orientar o Cursor na construção de uma aplicação **PWA, mobile first, em Next.js**, com backend no próprio framework, integração com **SMS Dev** e desenvolvimento incremental por partes.

## Objetivo do produto

Criar um app instalável no celular, com foco em uso simples, onde o usuário poderá:

- cadastrar um ou mais números/dispositivos
- criar botões de ação com:
  - título
  - texto/código SMS
  - cor predefinida
- escolher um número/dispositivo
- tocar em um botão
- disparar o SMS correspondente por backend seguro
- registrar histórico de execuções

## Premissas principais

- **Next.js** como base full-stack
- **App Router**
- **Tailwind CSS**
- **shadcn/ui** para modais, selects, formulários e feedback visual
- **PWA** instalável no dispositivo
- **mobile first**
- backend com **Route Handlers**
- integração com **SMS Dev** somente no servidor
- persistência inicial pode começar simples, mas o projeto já deve nascer preparado para banco
- implementação incremental por sprints/partes

## Organização do pacote

- `docs/`: documentação funcional e técnica
- `specs/`: especificações resumidas por módulo
- `.cursor/skills/`: skills para orientar o Cursor
- `prompts/`: prompts prontos para pedir cada etapa

## Ordem recomendada de execução no Cursor

1. Ler `docs/00-product-overview.md`
2. Ler `docs/01-architecture.md`
3. Ler `docs/07-implementation-plan.md`
4. Executar `prompts/01-bootstrap.txt`
5. Seguir um prompt por vez

## Diretriz importante

Não implementar tudo de uma vez. Sempre entregar em partes pequenas, testáveis e com boa base para o próximo passo.
