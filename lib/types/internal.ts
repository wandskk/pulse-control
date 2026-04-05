/** Opções de `logRouteError` (observabilidade) */
export type RouteErrorLogOptions = {
  request?: Request;
  method?: string;
  /** Apenas IDs curtos (ex.: cuid), sem e-mail, telefone ou corpo de requisição */
  ids?: Record<string, string | undefined>;
};
