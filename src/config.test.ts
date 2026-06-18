import { describe, it, expect } from "vitest";

import { resolveToken } from "./config";

describe("resolveToken", () => {
  it("returns a static string token as-is", async () => {
    expect(await resolveToken({ org: "turso", token: "abc" })).toBe("abc");
  });

  it("invokes a function token and returns its resolved value", async () => {
    const token = await resolveToken({
      org: "turso",
      token: async () => "dynamic-token",
    });

    expect(token).toBe("dynamic-token");
  });
});
