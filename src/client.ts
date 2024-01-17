import { TursoConfig } from "./config";
import { ApiTokenClient } from "./api-token";
import { OrganizationClient } from "./organization";
import { LocationClient } from "./location";
import { GroupClient } from "./group";
import { DatabaseClient } from "./database";

export class TursoClient {
  private config: TursoConfig;
  public apiTokens: ApiTokenClient;
  public organizations: OrganizationClient;
  public locations: LocationClient;
  public groups: GroupClient;
  public databases: DatabaseClient;

  constructor(config: TursoConfig) {
    if (!config.token) {
      throw new Error("You must provide an API token");
    }

    this.config = {
      baseUrl: "https://api.turso.tech/v1",
      ...config,
    };

    this.apiTokens = new ApiTokenClient(this.config);
    this.organizations = new OrganizationClient(this.config);
    this.locations = new LocationClient(this.config);
    this.groups = new GroupClient(this.config);
    this.databases = new DatabaseClient(this.config);
  }

  static async request<T>(
    url: string,
    config: TursoConfig,
    options: RequestInit = {}
  ) {
    const response = await fetch(new URL(url, config.baseUrl), {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${config.token}`,
        "User-Agent": "@tursodatabase/api",
      },
    });

    if (!response.ok) {
      throw new Error(`Something went wrong! Status ${response.status}`);
    }

    return response.json() as T;
  }
}

export function createClient(config: TursoConfig): TursoClient {
  return new TursoClient(config);
}
