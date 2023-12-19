import { describe, it, expect } from "vitest";
import { TursoClient, createClient } from "./client";

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
});

describe("createClient", () => {
  it("should create a new TursoClient instance", () => {
    const client = createClient({ org: "turso", token: "abc" });

    expect(client).toBeInstanceOf(TursoClient);
  });
});
