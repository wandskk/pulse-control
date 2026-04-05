<img width="970" height="257" alt="Logotipo_moderno_PulseControl_em_azul__1_-removebg-preview" src="https://github.com/user-attachments/assets/921cb264-fabf-416c-af7c-bb17440c0603" />

# PulseControl

**PWA mobile first** para **controle remoto por comandos via SMS**: cadastre números (dispositivos), organize comandos por categorias e dispare mensagens com um toque — com histórico de execuções e backend seguro no **Next.js** (App Router).

---

## Sumário

- [Visão do produto](#visão-do-produto)
- [Funcionalidades](#funcionalidades)
- [PWA e experiência mobile first](#pwa-e-experiência-mobile-first)
- [Stack tecnológica](#stack-tecnológica)
- [Arquitetura](#arquitetura)
- [Metodologias e boas práticas](#metodologias-e-boas-práticas)
- [Requisitos](#requisitos)
- [Configuração e execução local](#configuração-e-execução-local)
- [Scripts](#scripts)
- [Testes](#testes)
- [Deploy (ex.: Vercel)](#deploy-ex-vercel)
- [Documentação adicional](#documentação-adicional)

---

## Visão do produto

O PulseControl é pensado para uso **no celular**, com interface **touch-first** e possibilidade de **instalar** o app na tela inicial (PWA). O envio real das mensagens ocorre **somente no servidor**, integrado ao provedor **SMS Dev**, evitando exposição de chaves no cliente.

Fluxo típico:

1. Autenticar (quando `AUTH_SECRET` está configurado).
2. Cadastrar **dispositivos** (números de destino).
3. Criar **categorias** e **comandos** (título, texto da mensagem, cor).
4. Selecionar dispositivo e tocar em um comando para **executar**.
5. Consultar o **histórico** de execuções.

Perfis **ADMIN** podem gerenciar usuários via área administrativa.

---

## Funcionalidades

| Área | Descrição |
|------|-----------|
| **Autenticação** | Sessão via JWT em cookie **httpOnly**; login, logout, troca de senha; bootstrap do primeiro administrador quando o banco está vazio. |
| **Dispositivos** | CRUD de números associados ao utilizador; base para filtrar comandos e histórico. |
| **Categorias** | Agrupamento de comandos por dispositivo; ordem e ativação. |
| **Comandos** | Botões de ação com título, mensagem (payload SMS) e cor; filtro por categoria. |
| **Execução** | `POST /api/execute` valida posse do dispositivo, envia SMS via SMS Dev (ou dry-run em desenvolvimento) e persiste **Execution** com estado e metadados do provedor. |
| **Histórico** | Listagem de execuções com contexto de auditoria mínima (`actorSub` quando aplicável). |
| **Admin** | Gestão de utilizadores (roles `ADMIN` / `USER`) para utilizadores com papel administrativo. |

Modelo de dados principal: **User** → **Device** → **Category** / **Command** → **Execution** (ver `prisma/schema.prisma`).

---

## PWA e experiência mobile first

- **Manifest** dinâmico (`app/manifest.ts`): `display: standalone`, `orientation: portrait-primary`, ícones 192/512, `theme_color` / `background_color` alinhados à marca (`lib/constants/brand`).
- **Metadata** no layout raiz: `viewport` com `theme-color`, `appleWebApp`, ícones e `manifest.webmanifest`.
- **Service Worker** (`public/sw.js` + `ServiceWorkerRegister`): registo **apenas em produção**; cache conservador de ícones; **sem** modelo offline-first — pass-through para pedidos GET same-origin, adequado a critérios de instalabilidade sem assumir app totalmente offline.
- **UI**: Tailwind, componentes **shadcn/ui** (Base UI), tipografia e layout pensados para ecrãs pequenos e interação por toque.

Variáveis úteis: `NEXT_PUBLIC_APP_NAME`, `NEXT_PUBLIC_APP_URL` (origem estável para o `id` do manifest; na Vercel pode usar-se `VERCEL_URL` no build). Ver `.env.example`.

---

## Stack tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Framework** | [Next.js](https://nextjs.org/) 16 (App Router), React 19 |
| **Linguagem** | TypeScript 5 |
| **Estilos** | Tailwind CSS 4, `tw-animate-css`, `class-variance-authority`, `tailwind-merge` |
| **UI** | shadcn (componentes em `components/ui/`), Lucide, Sonner (toasts) |
| **Formulários / validação** | React Hook Form, Zod 4, `@hookform/resolvers` |
| **Dados** | [Prisma](https://www.prisma.io/) 7 + PostgreSQL (`@prisma/adapter-pg`, `pg`) |
| **Auth** | [jose](https://github.com/panva/jose) (JWT), bcryptjs para passwords |
| **Testes** | [Vitest](https://vitest.dev/) |
| **Lint** | ESLint 9 + `eslint-config-next` |

Integração SMS: módulo em `lib/services/sms/` (SMS Dev), chamado apenas em contexto de servidor.

---

## Arquitetura

Visão em camadas (alinhada a `docs/roadmap-arquitetura.md`):

```
app/
  (app)/          # Rotas autenticadas na UI — composição de páginas
  api/            # Route Handlers HTTP — finos (auth, parse, serviço, DTO)
  login/, manifest.ts, layout.tsx, …
features/         # Por domínio (dashboard, devices, categories, history, …)
components/
  ui/             # shadcn
  shared/         # Breadcrumb, loading, service worker, etc.
lib/
  server/         # Regras e queries por domínio (ex.: dispositivo scoped ao user, execute-command)
  services/       # Integrações externas (SMS)
  api-client/     # Cliente HTTP no browser, por módulo (devices, commands, …)
  validators/     # Schemas Zod por domínio
  types/          # DTOs / tipos partilhados
  auth/, http/, constants/, utils/
db/               # Cliente Prisma
prisma/           # schema, migrations, seed
```

- **Rotas API**: validação de entrada com **Zod**; respostas consistentes (`data`, mensagens de erro); erros internos com logging estruturado (`requestId`, sem PII).
- **Domínio**: lógica sensível (ex.: executar comando, ownership de dispositivo) em **`lib/server`**, não em componentes React nem duplicada na UI.
- **Cliente**: `"use client"` apenas onde necessário; chamadas à API via `lib/api-client/`.

---

## Metodologias e boas práticas

- **Contrato explícito**: `docs/api-contract.md` descreve rotas, métodos, corpos e códigos HTTP — manter atualizado quando a API pública mudar.
- **Spec / roadmap**: `docs/roadmap-arquitetura.md` fixa princípios (domínio no centro, rotas finas, UI por feature) e evolução incremental em fases.
- **Segurança**: chave SMS Dev **nunca** em `NEXT_PUBLIC_*`; envio só em route handlers / serviços de servidor; rate limit e validação nas rotas sensíveis conforme implementação.
- **Qualidade**: testes unitários em helpers e camada de domínio; ESLint com **imports restritos** de `@/db/prisma` fora dos caminhos autorizados (ver `eslint.config.mjs`).
- **Entrega incremental**: preferência por PRs pequenos e testáveis (evitar refactors gigantes de uma só vez).

---

## Requisitos

- **Node.js** (versão suportada pelo Next 16 — ver documentação oficial).
- **PostgreSQL** acessível (ex.: [Neon](https://neon.tech/) com URL e, em serverless, pooler quando aplicável).
- Conta/chave **SMS Dev** para envio real em produção (opcional em dev com `SMSDEV_DRY_RUN`).

---

## Configuração e execução local

1. **Clonar** o repositório e instalar dependências:

   ```bash
   npm install
   ```

2. **Variáveis de ambiente**: copiar `.env.example` para `.env` e preencher pelo menos:

   - `DATABASE_URL` — URL do PostgreSQL.
   - `SMSDEV_KEY` — para envio real (ou usar `SMSDEV_DRY_RUN=true` em desenvolvimento).
   - `AUTH_SECRET` — string aleatória (mín. 16 caracteres) para ativar autenticação multi-conta.

   Comentários em `.env.example` descrevem `BOOTSTRAP_ADMIN_*`, URLs públicas do PWA e opções de dev.

3. **Base de dados**:

   ```bash
   npx prisma migrate dev
   ```

   Opcional: `npm run db:seed` para dados iniciais quando configurado.

4. **Ícones PWA** (se necessário): `npm run icons:generate` (script em `scripts/`).

5. **Servidor de desenvolvimento**:

   ```bash
   npm run dev
   ```

6. Abrir [http://localhost:3000](http://localhost:3000).

Para testar num telemóvel na mesma rede, pode usar `npm run start:lan` após `npm run build` e apontar o browser para o IP da máquina; ajustar `NEXT_ALLOWED_DEV_ORIGINS` se o HMR falhar por origem.

---

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Next.js em modo desenvolvimento |
| `npm run build` | `prisma generate` + `next build` |
| `npm run start` | Servidor de produção |
| `npm run start:lan` | Produção em `0.0.0.0:3000` (rede local) |
| `npm run lint` | ESLint |
| `npm test` / `npm run test:watch` | Vitest |
| `npm run db:seed` | Seed Prisma (`tsx prisma/seed.ts`) |
| `npm run icons:generate` | Geração de ícones PWA |

---

## Testes

- Framework: **Vitest** (`vitest.config.ts`).
- Cobertura focada em utilitários e lógica de domínio (ex.: validações, helpers); alargar conforme necessidade.

```bash
npm test
```

---

## Deploy (ex.: Vercel)

- Ligar o repositório à **Vercel** (ou similar) com as mesmas variáveis de ambiente de produção.
- Definir `DATABASE_URL` de produção e `AUTH_SECRET`; `SMSDEV_KEY` no ambiente servidor.
- O manifest pode inferir origem via `VERCEL_URL` se `NEXT_PUBLIC_APP_URL` não estiver definido (ver `app/manifest.ts`).
- Garantir que o build executa `prisma generate` (já incluído no script `build` do `package.json`).

---

## Documentação adicional

| Ficheiro | Conteúdo |
|----------|----------|
| [`docs/api-contract.md`](docs/api-contract.md) | Contrato JSON das rotas públicas |
| [`docs/roadmap-arquitetura.md`](docs/roadmap-arquitetura.md) | Princípios, mapa de pastas, backlog e anti-padrões |
| [`.env.example`](.env.example) | Variáveis de ambiente comentadas |

Skills do Cursor para este repositório: `.cursor/skills/` (ex.: `nextjs-feature-builder`, `pwa-vercel`).

---

*PulseControl — PWA mobile first para comandos remotos via SMS.*
