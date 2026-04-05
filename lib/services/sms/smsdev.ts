/**
 * Integração server-side com SMS Dev (Brasil).
 * Documentação: https://www.smsdev.com.br/envio-sms/
 *
 * A API costuma aceitar GET ou POST; usamos POST (form-urlencoded) para mensagens
 * com caracteres especiais e URLs mais previsíveis.
 */

import type { SmsDevSendResult } from "@/lib/types/sms";

const DEFAULT_SEND_URL = "https://api.smsdev.com.br/v1/send";

export type { SmsDevSendResult } from "@/lib/types/sms";

function onlyDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function parseSendResponse(
  text: string,
  json: unknown,
): { ok: true; providerMessageId: string } | { ok: false; reason: string } {
  if (json && typeof json === "object") {
    const o = json as Record<string, unknown>;
    const situacao = String(o.situacao ?? o.status ?? "").toUpperCase();

    if (situacao === "ERRO" || situacao === "ERROR" || situacao === "FAIL") {
      const desc =
        typeof o.descricao === "string"
          ? o.descricao
          : typeof o.message === "string"
            ? o.message
            : typeof o.erro === "string"
              ? o.erro
              : "Erro retornado pelo provedor de envio";
      const codigo = o.codigo ?? o.code;
      const suffix =
        codigo != null && String(codigo).length > 0
          ? ` (código ${String(codigo)})`
          : "";
      return { ok: false, reason: `${desc}${suffix}`.slice(0, 300) };
    }

    if (situacao === "OK" || situacao === "SUCCESS") {
      const id =
        o.id ?? o.ids ?? o.message_id ?? o.messageId ?? o.smsId ?? o.sms_id;
      if (id != null && String(id).length > 0) {
        return { ok: true, providerMessageId: String(id) };
      }
      return { ok: false, reason: "Resposta OK sem identificador do envio" };
    }

    const id = o.id ?? o.ids;
    if (id != null && String(id).length > 0 && situacao === "") {
      return { ok: true, providerMessageId: String(id) };
    }
  }

  const trimmed = text.trim();
  if (/^\d+$/.test(trimmed)) {
    return { ok: true, providerMessageId: trimmed };
  }

  return {
    ok: false,
    reason: text ? text.slice(0, 300) : "Resposta vazia do provedor",
  };
}

function logSmsDevDev(message: string, extra?: Record<string, unknown>) {
  if (process.env.NODE_ENV === "development") {
    console.info(`[SMS Dev] ${message}`, extra ?? "");
  }
}

/**
 * Envia o comando (payload) via API HTTP do provedor SMS Dev.
 * Preferência: POST application/x-www-form-urlencoded (documentação Node/cURL).
 */
export async function sendSmsViaSmsDev(options: {
  apiKey: string;
  /** DDI + número (apenas dígitos), ex.: 5584999999999 */
  number: string;
  message: string;
}): Promise<SmsDevSendResult> {
  const base =
    process.env.SMSDEV_SEND_URL?.trim() || DEFAULT_SEND_URL;
  const number = onlyDigits(options.number);
  if (number.length < 10) {
    return { ok: false, error: "Número inválido (use DDI + DDD + número)" };
  }

  const sendType = process.env.SMSDEV_SEND_TYPE?.trim();

  const params = new URLSearchParams();
  params.set("key", options.apiKey);
  params.set("number", number);
  params.set("msg", options.message);
  if (sendType) {
    params.set("type", sendType);
  } else {
    params.set("type", "9");
  }

  const useGet = process.env.SMSDEV_USE_GET === "true";

  let res: Response;
  try {
    if (useGet) {
      const url = new URL(base);
      params.forEach((v, k) => url.searchParams.set(k, v));
      logSmsDevDev("GET", { host: url.host, number });
      res = await fetch(url.toString(), {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
    } else {
      logSmsDevDev("POST", { host: new URL(base).host, number });
      res = await fetch(base, {
        method: "POST",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body: params.toString(),
      });
    }
  } catch (e) {
    logSmsDevDev("rede falhou", { err: String(e) });
    return { ok: false, error: "Falha de rede ao contatar o provedor" };
  }

  const text = await res.text();
  let json: unknown;
  try {
    json = JSON.parse(text) as unknown;
  } catch {
    json = null;
  }

  logSmsDevDev("resposta", {
    httpStatus: res.status,
    bodyPreview: text.slice(0, 400),
  });

  const parsed = parseSendResponse(text, json);
  if (parsed.ok) {
    return { ok: true, providerMessageId: parsed.providerMessageId };
  }
  return { ok: false, error: parsed.reason };
}
