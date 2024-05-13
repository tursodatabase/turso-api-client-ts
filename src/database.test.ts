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

  it('throws error if seed type is "database" and name is missing', async () => {
    const options = { seed: { type: "database" } };
    // @ts-expect-error
    await expect(client.create("testDB", options)).rejects.toThrow(
      "Seed name is required when type is 'database'"
    );
  });

  it('throws error if seed type is "dump" and url is missing', async () => {
    const options = { seed: { type: "dump" } };
    // @ts-expect-error
    await expect(client.create("testDB", options)).rejects.toThrow(
      "Seed URL is required when type is 'dump'"
    );
  });
});
