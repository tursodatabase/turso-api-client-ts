import { describe, it, expect } from "vitest";
import { TursoClient, TursoClientError, createClient } from "./client";

describe("TursoClient", () => {
  it("should throw an error if no API token is provided", () => {
    const config = { org: "turso" };

    // @ts-expect-error
    expect(() => new TursoClient(config)).toThrow(
      "You must provide an API token"
    );
  });

  it("should create an instance of TursoClient", () => {
    const config = { org: "turso", token: "abc" };
    const client = new TursoClient(config);

    expect(client).toBeInstanceOf(TursoClient);
  });

  it("should throw an error if neither org nor orgId is provided", () => {
    const config = { token: "abc" };

    expect(() => new TursoClient(config)).toThrow(
      "You must provide an organization slug (org) or id (orgId)"
    );
  });

  it("should create an instance when orgId is provided instead of org", () => {
    const config = { orgId: "org_123", token: "abc" };
    const client = new TursoClient(config);

    expect(client).toBeInstanceOf(TursoClient);
  });

  it("should accept a function that resolves the API token", () => {
    const config = { org: "turso", token: async () => "abc" };
    const client = new TursoClient(config);

    expect(client).toBeInstanceOf(TursoClient);
  });

  it("should throw an error message that will match with API's error message", async () => {
    const config = { org: "turso", token: "abc" };
    const client = new TursoClient(config);

    const error = await client.databases
      .get("databaseName")
      .catch((err: Error) => err);

    expect(error).toBeInstanceOf(TursoClientError);
    if (error instanceof TursoClientError) {
      expect(error.message).toBe(
        "token contains an invalid number of segments"
      );
      expect(error.status).toBe(401);
    }
  });
});

describe("createClient", () => {
  it("should create a new TursoClient instance", () => {
    const client = createClient({ org: "turso", token: "abc" });

    expect(client).toBeInstanceOf(TursoClient);
  });
});
