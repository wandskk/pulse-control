import { describe, expect, it } from "vitest";
import { deviceWhereScoped } from "./where";

describe("deviceWhereScoped", () => {
  it("filtra por id, ativo e usuário quando scopedUserId está definido", () => {
    expect(deviceWhereScoped("dev-1", "user-a", true)).toEqual({
      id: "dev-1",
      isActive: true,
      userId: "user-a",
    });
  });

  it("sem usuário no escopo não inclui userId (modo aberto)", () => {
    expect(deviceWhereScoped("dev-1", null, true)).toEqual({
      id: "dev-1",
      isActive: true,
    });
  });

  it("activeOnly false omite isActive", () => {
    expect(deviceWhereScoped("dev-1", "u", false)).toEqual({
      id: "dev-1",
      userId: "u",
    });
  });
});
