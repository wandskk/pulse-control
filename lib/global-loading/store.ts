/**
 * Contador global de requisições HTTP rastreadas (cliente).
 * Usado pelo overlay de loading; suporta pedidos em paralelo.
 */

let count = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function beginGlobalLoading(): void {
  if (typeof window === "undefined") return;
  count += 1;
  emit();
}

export function endGlobalLoading(): void {
  if (typeof window === "undefined") return;
  count = Math.max(0, count - 1);
  emit();
}

export function getGlobalLoadingActive(): boolean {
  return count > 0;
}

export function subscribeGlobalLoading(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}
