/** Query `?device=<id>` para abrir Comandos com o número já selecionado. */
export const DEVICE_QUERY_PARAM = "device" as const;

export function comandosComNumeroHref(deviceId: string): string {
  const q = new URLSearchParams({ [DEVICE_QUERY_PARAM]: deviceId });
  return `/comandos?${q.toString()}`;
}

export function historicoComNumeroHref(deviceId: string): string {
  const q = new URLSearchParams({ [DEVICE_QUERY_PARAM]: deviceId });
  return `/historico?${q.toString()}`;
}
