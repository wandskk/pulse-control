/** Mensagem segura a partir de `unknown` (catch) para toast ou UI. */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
