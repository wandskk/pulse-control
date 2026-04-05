/** Mapa id → nome para listas (ex.: categorias). */
export function buildIdToNameMap<T extends { id: string; name: string }>(
  items: T[],
): Map<string, string> {
  const m = new Map<string, string>();
  for (const item of items) {
    m.set(item.id, item.name);
  }
  return m;
}
