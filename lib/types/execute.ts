/** Resposta JSON de `POST /api/execute` (cliente) */
export type ExecuteResponse =
  | {
      success: true;
      executionId: string;
      provider: string;
      providerMessageId?: string;
    }
  | {
      success: false;
      message: string;
      executionId?: string;
    };

/** Resultado interno de `executeCommandAndPersist` */
export type ExecuteCommandPersistResult =
  | { ok: false; reason: "device_not_found" | "command_not_found" }
  | {
      ok: true;
      sendOk: boolean;
      executionId: string;
      provider: string;
      providerMessageId: string | null;
      providerError: string | null;
      apiKeyConfigured: boolean;
    };
