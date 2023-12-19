import { describe, it, expect, vi, beforeEach } from "vitest";
import { LocationClient } from "./location";
import { TursoClient } from "./client";

vi.mock("./client", () => ({
  TursoClient: { request: vi.fn() },
}));

describe("LocationClient", () => {
  let client: LocationClient;

  beforeEach(() => {
    client = new LocationClient({ org: "turso", token: "abc" });
    vi.resetAllMocks();
  });

  it("should list locations correctly", async () => {
    const mockLocations = {
      ams: "Amsterdam",
      bos: "Boston",
    };

    vi.mocked(TursoClient.request).mockResolvedValue({
      locations: mockLocations,
    });

    const locations = await client.list();

    expect(locations).toEqual([
      { code: "ams", description: "Amsterdam" },
      { code: "bos", description: "Boston" },
    ]);
  });

  it("should return the closest locations", async () => {
    const expectedResponse = { server: "ams", client: "bos" };

    vi.spyOn(client, "closest").mockResolvedValue(expectedResponse);

    const closestLocations = await client.closest();

    expect(closestLocations).toEqual(expectedResponse);

    expect(client.closest).toHaveBeenCalledTimes(1);
  });
});
