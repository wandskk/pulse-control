/**
 * Rotas de API que não devem ativar o overlay (pedidos frequentes ou em segundo plano).
 * `/api/auth/session` não está excluído — o overlay global cobre o gate de auth (ex.: F5 na home).
 * `/api/auth/logout`: contador manual em `logoutSession` (overlay até redirect).
 * `/api/auth/login` e `/api/auth/bootstrap` (POST): contador manual no formulário de login.
 */
export const GLOBAL_LOADING_EXCLUDED_API_PATHS = new Set<string>([
  "/api/auth/logout",
  "/api/auth/login",
  "/api/auth/bootstrap",
]);
