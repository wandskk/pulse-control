/** Com AUTH_SECRET definido, login e sessão JWT são obrigatórios (usuários no banco). */
export function isAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET?.trim());
}
