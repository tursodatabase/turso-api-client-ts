import { describe, it, expect, vi, beforeEach } from "vitest";

import { DatabaseClient } from "./database";

vi.mock("./client", () => ({
  TursoClient: { request: vi.fn() },
}));

describe("DatabaseClient", () => {
  let client: DatabaseClient;

  beforeEach(() => {
    client = new DatabaseClient({ org: "turso", token: "abc" });
    vi.resetAllMocks();
  });

  it("should throw an error when both is_schema and schema are provided", async () => {
    await expect(
      client.create("test", {
        is_schema: true,
        schema: "test",
      } as unknown as (typeof client.create.arguments)[1])
    ).rejects.toThrow("'is_schema' and 'schema' cannot both be provided");
  });
});
