# Contrato mínimo da API (JSON)

Referência para manter respostas e códigos alinhados entre backend e cliente. Atualizar quando rotas públicas mudarem.

**Convenções gerais**

- Corpo JSON nas respostas de erro costuma incluir `{ message: string }`.
- Listagens com sucesso: `{ data: T[] }` ou `{ data: T }` conforme a rota.
- Autenticação: com `AUTH_SECRET`, rotas em `/api/*` (exceto `/api/auth/*` públicos indicados) exigem sessão válida nos handlers; páginas em `app/(app)/` exigem cookie no layout (sem middleware Edge na Vercel).
- Erros 500 no servidor: logs estruturados em JSON (`lib/internal-error.ts`) com `requestId` (header `x-request-id` ou `x-vercel-id` quando existir), rota, método e IDs de recurso (cuid); sem PII no log.

---

## Auth e sessão

| Rota | Método | Entrada | Sucesso | Erros comuns |
|------|--------|---------|---------|--------------|
| `/api/auth/session` | GET | — | `{ authRequired, authenticated, user }` | — |
| `/api/auth/login` | POST | `{ email, password }` | Set-Cookie + JSON de sucesso | 400 validação; 401 credenciais; 429 rate limit |
| `/api/auth/logout` | POST | — | 204 / ok | — |
| `/api/auth/change-password` | POST | `{ currentPassword, newPassword }` | 200 | 400; 401 |
| `/api/auth/bootstrap` | POST | (ver rota / schema interno) | Cria primeiro admin se aplicável | 400; 403 se já existir |

---

## Admin (ADMIN)

| Rota | Método | Entrada | Sucesso | Erros |
|------|--------|---------|---------|-------|
| `/api/admin/users` | GET | — | `{ data: AdminUserRow[] }` | 401; 403 |
| `/api/admin/users` | POST | `{ email, password, role }` | `{ data }` 201 | 400; 409 |
| `/api/admin/users/[id]` | PATCH | `{ password?, role? }` | `{ data }` | 400; 404 |

---

## Dispositivos (números)

| Rota | Método | Entrada | Sucesso | Erros |
|------|--------|---------|---------|-------|
| `/api/devices` | GET | — | `{ data: DeviceDto[] }` | 500 |
| `/api/devices` | POST | body validado (Zod) | `{ data }` 201 | 400 |
| `/api/devices/[id]` | PATCH | body parcial | `{ data }` | 400; 404 |
| `/api/devices/[id]` | DELETE | — | 204 | 404 |

---

## Categorias

| Rota | Método | Entrada | Sucesso | Erros |
|------|--------|---------|---------|-------|
| `/api/categories` | GET | query `deviceId` obrigatório | `{ data }` | 400; 404 device |
| `/api/categories` | POST | body + `deviceId` | `{ data }` 201 | 400; 409 nome duplicado |
| `/api/categories/[id]` | PATCH | body parcial | `{ data }` | 400; 404; 409 |
| `/api/categories/[id]` | DELETE | — | 204 | 404 |

---

## Comandos

| Rota | Método | Entrada | Sucesso | Erros |
|------|--------|---------|---------|-------|
| `/api/commands` | GET | query `deviceId`; opcional `category` | `{ data: CommandDto[] }` | 400; 404 |
| `/api/commands` | POST | body create | `{ data }` 201 | 400; 404 |
| `/api/commands/[id]` | PATCH | body parcial | `{ data }` | 400; 404 |
| `/api/commands/[id]` | DELETE | — | 204 | 404 |

---

## Execução e histórico

| Rota | Método | Entrada | Sucesso | Erros |
|------|--------|---------|---------|-------|
| `/api/execute` | POST | `{ deviceId, commandId }` | `{ success: true, executionId, provider, ... }` ou falha com `message` | 400; 401 (auth on); 404; 429; 500 |
| `/api/history` | GET | query opcional `deviceId` | `{ data: ExecutionDto[] }` | 500 |

---

*Última revisão em linha com o código em `app/api/`.*
