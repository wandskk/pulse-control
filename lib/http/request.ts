import { z } from "zod";

export function zodErrorMessage(error: z.ZodError): string {
  return error.issues.map((i) => i.message).join(" · ");
}

export async function readJsonBody(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}
