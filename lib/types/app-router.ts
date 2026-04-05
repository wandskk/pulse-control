/** `context` em rotas App Router com segmento dinâmico `[id]` */
export type IdRouteContext = {
  params: Promise<{ id: string }>;
};
