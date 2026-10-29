import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

describe("headers option", () => {
  const fetchMock = vi.fn(
    async (_url: URL, _init?: RequestInit) => new Response("{}")
  );

  beforeEach(() => {
    fetchMock.mockClear();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function sentHeaders(): Headers {
    return new Headers(fetchMock.mock.calls[0][1]?.headers);
  }

  it("sends custom headers to the Turso API", async () => {
    const client = createClient({
      org: "turso",
      token: "abc",
      headers: { "X-Custom-Header": "custom-value" },
    });

    await client.groups.list();

    const headers = sentHeaders();
    expect(headers.get("X-Custom-Header")).toBe("custom-value");
    expect(headers.get("Authorization")).toBe("Bearer abc");
    expect(headers.get("User-Agent")).toBe("@tursodatabase/api");
  });

  it("replaces custom headers that the client also sets", async () => {
    const client = createClient({
      org: "turso",
      token: "abc",
      headers: {
        authorization: "Bearer other-token",
        "user-agent": "other-agent",
        "Content-Type": "text/plain",
      },
    });

    await client.groups.create("default", "ams");

    const headers = sentHeaders();
    expect(headers.get("Authorization")).toBe("Bearer abc");
    expect(headers.get("User-Agent")).toBe("@tursodatabase/api");
    expect(headers.get("Content-Type")).toBe("application/json");
  });
});
