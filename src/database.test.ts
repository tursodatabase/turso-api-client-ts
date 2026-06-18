import { describe, it, expect, vi, beforeEach } from "vitest";

import { DatabaseClient } from "./database";
import { TursoClient } from "./client";

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

  it("forwards group_id when groupId is provided", async () => {
    vi.mocked(TursoClient.request).mockResolvedValue({
      database: { DbId: "id", Hostname: "host", Name: "testDB" },
    });

    await client.create("testDB", { groupId: "grp_123" });

    expect(TursoClient.request).toHaveBeenCalledWith(
      "organizations/turso/databases",
      expect.anything(),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "testDB",
          group_id: "grp_123",
        }),
      })
    );
  });

  it("throws an error when both group and groupId are provided", async () => {
    await expect(
      client.create("testDB", { group: "default", groupId: "grp_123" })
    ).rejects.toThrow("'group' and 'groupId' cannot both be provided");
  });

  it("uses orgId in the request path when provided instead of org", async () => {
    const orgIdClient = new DatabaseClient({ orgId: "org_123", token: "abc" });

    vi.mocked(TursoClient.request).mockResolvedValue({
      database: { DbId: "id", Hostname: "host", Name: "testDB" },
    });

    await orgIdClient.create("testDB", { group: "default" });

    expect(TursoClient.request).toHaveBeenCalledWith(
      "organizations/org_123/databases",
      expect.anything(),
      expect.anything()
    );
  });

  it("forwards remote_encryption options when creating an encrypted database", async () => {
    vi.mocked(TursoClient.request).mockResolvedValue({
      database: { DbId: "id", Hostname: "host", Name: "testDB" },
    });

    await client.create("testDB", {
      group: "default",
      remote_encryption: {
        encryption_key: "c29tZS1iYXNlNjQta2V5",
        encryption_cipher: "aes256gcm",
      },
    });

    expect(TursoClient.request).toHaveBeenCalledWith(
      "organizations/turso/databases",
      expect.anything(),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "testDB",
          group: "default",
          remote_encryption: {
            encryption_key: "c29tZS1iYXNlNjQta2V5",
            encryption_cipher: "aes256gcm",
          },
        }),
      })
    );
  });
});
