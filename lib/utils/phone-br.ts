/**
 * Telefone para persistência/API: apenas dígitos (sem máscara).
 */
export function normalizePhoneDigits(raw: string): string {
  return raw.replace(/\D/g, "");
}

/**
 * Exibe telefone no padrão BR: (XX) XXXXX-XXXX (celular) ou (XX) XXXX-XXXX (fixo).
 * Aceita valor já salvo (só dígitos) ou texto colado com máscara.
 * Acima de 11 dígitos (ex.: internacional), devolve só os dígitos sem máscara BR.
 */
export function formatPhoneBrDisplay(raw: string): string {
  const d = normalizePhoneDigits(raw);
  if (d.length === 0) return "";
  if (d.length > 11) return d;

  if (d.length === 1) return `(${d}`;
  if (d.length === 2) return `(${d})`;

  const ddd = d.slice(0, 2);
  const rest = d.slice(2);
  if (rest.length === 0) return `(${ddd})`;

  const isMobile = rest[0] === "9";
  if (isMobile) {
    if (rest.length <= 5) return `(${ddd}) ${rest}`;
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  }
  if (rest.length <= 4) return `(${ddd}) ${rest}`;
  return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
}
