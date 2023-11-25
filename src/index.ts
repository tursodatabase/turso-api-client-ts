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

interface OrganizationMember {
  role: "owner" | "member";
  username: string;
}

class OrganizationClient {
  constructor(private config: TursoConfig) {}

  async list(): Promise<Organization[]> {
    const response = await TursoClient.request<{
      organizations: Organization[];
    }>("organizations", this.config);

    return response.organizations ?? [];
  }

  async members(slug: string): Promise<OrganizationMember[]> {
    const response = await TursoClient.request<{
      members: OrganizationMember[];
    }>(`organisations/${slug}/members`, this.config);

    return response.members ?? [];
  }
}

type LocationKeys = {
  ams: string;
  arn: string;
  bog: string;
  bos: string;
  cdg: string;
  den: string;
  dfw: string;
  ewr: string;
  fra: string;
  gdl: string;
  gig: string;
  gru: string;
  hkg: string;
  iad: string;
  jnb: string;
  lax: string;
  lhr: string;
  mad: string;
  mia: string;
  nrt: string;
  ord: string;
  otp: string;
  qro: string;
  scl: string;
  sea: string;
  sin: string;
  sjc: string;
  syd: string;
  waw: string;
  yul: string;
  yyz: string;
  [key: string]: string;
};

type Location = {
  [K in keyof LocationKeys]: { code: K; description: LocationKeys[K] };
}[keyof LocationKeys];

class LocationClient {
  constructor(private config: TursoConfig) {}

  async list(): Promise<Location[]> {
    const response = await TursoClient.request<{
      locations: LocationKeys;
    }>("locations", this.config);

    if (!response.locations) {
      return [];
    }

    return Object.entries(response.locations).map(([code, description]) => ({
      code,
      description,
    }));
  }
}

interface Group {
  locations: Array<keyof LocationKeys>;
  name: string;
  primary: keyof LocationKeys;
}

class GroupClient {
  constructor(private config: TursoConfig) {}

  async list(orgSlug?: string): Promise<Group[]> {
    const response = await TursoClient.request<{ groups: Group[] }>(
      orgSlug ? `organizations/${orgSlug}/groups` : "groups",
      this.config
    );

    return response.groups ?? [];
  }

  async get(name: string, orgSlug?: string): Promise<Group> {
    const response = await TursoClient.request<{ group: Group }>(
      orgSlug ? `organizations/${orgSlug}/groups/${name}` : `groups/${name}`,
      this.config
    );

    return response.group;
  }

  async create(
    data: {
      name: string;
      location: Array<keyof LocationKeys>;
    },
    orgSlug?: string
  ): Promise<Group> {
    const response = await TursoClient.request<{ group: Group }>(
      orgSlug ? `organizations/${orgSlug}/groups` : "groups",
      this.config,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    return response.group;
  }

  async delete(name: string, orgSlug?: string): Promise<Group> {
    const response = await TursoClient.request<{ group: Group }>(
      orgSlug ? `organizations/${orgSlug}/groups/${name}` : `groups/${name}`,
      this.config,
      {
        method: "DELETE",
      }
    );

    return response.group;
  }

  async addLocation(
    groupName: string,
    location: keyof LocationKeys,
    orgSlug?: string
  ): Promise<Group> {
    const endpoint = orgSlug
      ? `organizations/${orgSlug}/groups/${groupName}/locations/${location}`
      : `groups/${groupName}/locations/${location}`;

    const response = await TursoClient.request<{ group: Group }>(
      endpoint,
      this.config,
      {
        method: "POST",
      }
    );

    return response.group;
  }

  async removeLocation(
    groupName: string,
    location: keyof LocationKeys,
    orgSlug?: string
  ): Promise<Group> {
    const endpoint = orgSlug
      ? `organizations/${orgSlug}/groups/${groupName}/locations/${location}`
      : `groups/${groupName}/locations/${location}`;

    const response = await TursoClient.request<{ group: Group }>(
      endpoint,
      this.config,
      {
        method: "DELETE",
      }
    );

    return response.group;
  }
}

class TursoClient {
  private config: TursoConfig;
  public organizations: OrganizationClient;
  public locations: LocationClient;
  public groups: GroupClient;

  constructor(config: TursoConfig) {
    this.config = {
      baseUrl: "https://api.turso.tech/v1",
      ...config,
    };

    this.organizations = new OrganizationClient(this.config);
    this.locations = new LocationClient(this.config);
    this.groups = new GroupClient(this.config);
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
