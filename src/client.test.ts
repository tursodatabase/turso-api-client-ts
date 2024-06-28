import { describe, it, expect } from "vitest";
import { TursoClient, TursoClientError, createClient } from "./client";

describe("TursoClient", () => {
  it("should throw an error if no API token is provided", () => {
    // @ts-expect-error
    expect(() => new TursoClient({ org: "turso" })).toThrow(
      "You must provide an API token"
    );
  });

  it("should create an instance of TursoClient", () => {
    const client = new TursoClient({ org: "turso", token: "abc" });

    expect(client).toBeInstanceOf(TursoClient);
  });

  it("should throw an error message that will match with API's error message", async () => {
    const client = new TursoClient({ org: "turso", token: "abc" });

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
