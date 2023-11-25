import "whatwg-fetch";

interface TursoConfig {
  token: string;
  baseUrl?: string;
}

interface Organization {
  name: string;
  slug: string;
  type: "personal" | "team";
  overages: boolean;
  blocked_reads: boolean;
  blocked_writes: boolean;
}

class OrganizationClient {
  constructor(private config: TursoConfig) {}

  async list(): Promise<Organization[]> {
    return TursoClient.request<Organization[]>("organizations", this.config);
  }
}

class TursoClient {
  private config: TursoConfig;
  public organizations: OrganizationClient;

  constructor(config: TursoConfig) {
    this.config = {
      baseUrl: "https://api.turso.tech/v1",
      ...config,
    };

    this.organizations = new OrganizationClient(this.config);
  }

  static async request<T>(
    url: string,
    config: TursoConfig,
    options: RequestInit = {}
  ) {
    const response = await fetch(new URL(`/v1/${url}`, config.baseUrl), {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${config.token}`,
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
