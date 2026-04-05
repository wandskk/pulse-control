import { describe, expect, it } from "vitest";
import { formatPhoneBrDisplay, normalizePhoneDigits } from "./phone-br";

describe("normalizePhoneDigits", () => {
  it("remove não dígitos", () => {
    expect(normalizePhoneDigits("(11) 98765-4321")).toBe("11987654321");
  });
});

describe("formatPhoneBrDisplay", () => {
  it("formata celular 11 dígitos", () => {
    expect(formatPhoneBrDisplay("11987654321")).toBe("(11) 98765-4321");
  });

  it("acima de 11 dígitos devolve só dígitos", () => {
    expect(formatPhoneBrDisplay("5511987654321")).toBe("5511987654321");
  });

  it("string vazia", () => {
    expect(formatPhoneBrDisplay("")).toBe("");
  });
});
