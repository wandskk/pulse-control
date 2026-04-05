export type SmsDevSendResult =
  | { ok: true; providerMessageId: string }
  | { ok: false; error: string };
