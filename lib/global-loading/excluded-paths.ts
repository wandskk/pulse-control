/**
 * Rotas de API que não devem ativar o overlay (pedidos frequentes ou em segundo plano).
 * `/api/auth/session` não está excluído — o overlay global cobre o gate de auth (ex.: F5 na home).
 */
export const GLOBAL_LOADING_EXCLUDED_API_PATHS = new Set<string>();
