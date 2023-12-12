import "whatwg-fetch";

interface TursoConfig {
  org: string;
  token: string;
  baseUrl?: string;
}

interface ApiToken {
  id: string;
  name: string;
}

class ApiTokenClient {
  constructor(private config: TursoConfig) {}

  async list(): Promise<ApiToken[]> {
    const response = await TursoClient.request<{ tokens: ApiToken[] }>(
      "auth/api-tokens",
      this.config
    );

    return response.tokens ?? [];
  }

  async create(name: string) {
    const response = await TursoClient.request<ApiToken & { token: string }>(
      `auth/api-tokens/${name}`,
      this.config,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
      }
    );

    return response;
  }

  async revoke(name: string) {
    const response = await TursoClient.request<{ token: string }>(
      `auth/api-tokens/${name}`,
      this.config,
      {
        method: "DELETE",
      }
    );

    return response;
  }

  async validate(token: string): Promise<{ valid: boolean; expiry: number }> {
    const response = await TursoClient.request<{ exp: number }>(
      "auth/api-tokens/validate",
      this.config,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const currentTime = Math.floor(Date.now() / 1000);

    return {
      valid: response.exp !== -1 && response.exp > currentTime,
      expiry: response.exp,
    };
  }
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
  role: "owner" | "admin" | "member";
  username: string;
  email: string;
}

interface OrganizationInvite {
  ID: number;
  CreatedAt: string;
  UpdatedAt: string;
  DeletedAt: string;
  Role: "admin" | "member";
  Email: string;
  OrganizationID: number;
  Organization: Organization;
  Accepted: boolean;
}

class OrganizationClient {
  constructor(private config: TursoConfig) {}

  async list(): Promise<Organization[]> {
    const response = await TursoClient.request<{
      organizations: Organization[];
    }>("organizations", this.config);

    return response.organizations ?? [];
  }

  async update(options: { overages: boolean }): Promise<Organization> {
    const response = await TursoClient.request<{
      organization: Organization;
    }>("", this.config, {
      method: "POST",
      body: JSON.stringify(options),
    });

    return response.organization ?? null;
  }

  async delete(): Promise<void> {
    return TursoClient.request("", this.config, {
      method: "DELETE",
    });
  }

  async members(): Promise<OrganizationMember[]> {
    const response = await TursoClient.request<{
      members: OrganizationMember[];
    }>(`organisations/${this.config.org}/members`, this.config);

    return response.members ?? [];
  }

  async addMember(
    username: string,
    role?: "admin" | "member"
  ): Promise<{ member: string; role: "admin" | "member" }> {
    return TursoClient.request(`members/${username}`, this.config, {
      method: "POST",
      body: JSON.stringify({ member: username, role: role ? role : "member" }),
    });
  }

  async removeMember(username: string): Promise<{ member: string }> {
    return TursoClient.request(`members/${username}`, this.config, {
      method: "DELETE",
    });
  }

  async inviteUser(
    email: string,
    role?: "admin" | "member"
  ): Promise<OrganizationInvite> {
    const response = await TursoClient.request<{ invited: OrganizationInvite }>(
      "invites",
      this.config,
      {
        method: "POST",
        body: JSON.stringify({ email, role: role ? role : "member" }),
      }
    );

    return response.invited;
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

  async closest(): Promise<{
    server: keyof LocationKeys;
    client: keyof LocationKeys;
  }> {
    return fetch("https://region.turso.io/").then((res) => res.json());
  }
}

interface Group {
  locations: Array<keyof LocationKeys>;
  name: string;
  primary: keyof LocationKeys;
}

class GroupClient {
  constructor(private config: TursoConfig) {}

  async list(): Promise<Group[]> {
    const response = await TursoClient.request<{ groups: Group[] }>(
      `organizations/${this.config.org}/groups`,
      this.config
    );

    return response.groups ?? [];
  }

  async get(name: string): Promise<Group> {
    const response = await TursoClient.request<{ group: Group }>(
      `organizations/${this.config.org}/groups/${name}`,
      this.config
    );

    return response.group;
  }

  async create(
    name: string,
    location?: Array<keyof LocationKeys>
  ): Promise<Group> {
    const response = await TursoClient.request<{ group: Group }>(
      `organizations/${this.config.org}/groups`,
      this.config,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ name, location }),
      }
    );

    return response.group;
  }

  async delete(name: string): Promise<Group> {
    const response = await TursoClient.request<{ group: Group }>(
      `organizations/${this.config.org}/groups/${name}`,
      this.config,
      {
        method: "DELETE",
      }
    );

    return response.group;
  }

  async addLocation(
    groupName: string,
    location: keyof LocationKeys
  ): Promise<Group> {
    const response = await TursoClient.request<{ group: Group }>(
      `organizations/${this.config.org}/groups/${groupName}/locations/${location}`,
      this.config,
      {
        method: "POST",
      }
    );

    return response.group;
  }

  async removeLocation(
    groupName: string,
    location: keyof LocationKeys
  ): Promise<Group> {
    const response = await TursoClient.request<{ group: Group }>(
      `organizations/${this.config.org}/groups/${groupName}/locations/${location}`,
      this.config,
      {
        method: "DELETE",
      }
    );

    return response.group;
  }

  async createToken(
    groupName: string,
    options?: {
      expiration: string;
      authorization: "read-only" | "full-access";
    }
  ) {
    const queryParams = new URLSearchParams();

    if (options?.expiration) {
      queryParams.set("expiration", options.expiration);
    }

    if (options?.authorization) {
      queryParams.set("authorization", options.authorization);
    }

    const response = await TursoClient.request<{ jwt: string }>(
      `organizations/${this.config.org}/groups/${groupName}/auth/tokens?${queryParams}`,
      this.config,
      {
        method: "POST",
      }
    );

    return response;
  }

  async rotateTokens(groupName: string): Promise<void> {
    return await TursoClient.request<void>(
      `organizations/${this.config.org}/groups/${groupName}/auth/rotate`,
      this.config,
      {
        method: "POST",
      }
    );
  }
}

interface ApiDatabaseResponse extends Database {
  Name: string;
  DbId: string;
  Hostname: string;
}

interface Database {
  name: string;
  id: string;
  hostname: string;
  regions?: Array<keyof LocationKeys>;
  primaryRegion?: keyof LocationKeys;
  type: string;
  version: string;
  group?: string;
}

interface DatabaseInstanceUsageDetail {
  rows_read: number;
  rows_written: number;
  storage_bytes: number;
}

interface DatabaseInstanceUsage {
  uuid: string;
  usage: DatabaseInstanceUsageDetail;
}

interface DatabaseUsage {
  uuid: string;
  instances: DatabaseInstanceUsage[];
  usage: DatabaseInstanceUsageDetail;
}

interface InstanceUsages {
  [instanceUuid: string]: DatabaseInstanceUsageDetail;
}

interface TotalUsage {
  rows_read: number;
  rows_written: number;
  storage_bytes: number;
}

class DatabaseClient {
  constructor(private config: TursoConfig) {}

  async list(): Promise<Database[]> {
    const response = await TursoClient.request<{
      databases: ApiDatabaseResponse[];
    }>(`organizations/${this.config.org}/databases`, this.config);

    return (response.databases ?? []).map((db) => this.formatResponse(db));
  }

  async get(name: string): Promise<Database> {
    const response = await TursoClient.request<{
      database: ApiDatabaseResponse;
    }>(`organizations/${this.config.org}/databases/${name}`, this.config);

    return this.formatResponse(response.database);
  }

  async create(
    name: string,
    options?: { image: "latest" | "canary"; group?: string }
  ): Promise<Database> {
    const response = await TursoClient.request<{ database: Database }>(
      `organizations/${this.config.org}/databases/${name}`,
      this.config,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name,
          ...options,
        }),
      }
    );

    return response.database;
  }

  async updateVersion(name: string): Promise<void> {
    return await TursoClient.request(
      `organizations/${this.config.org}/databases/${name}/update`,
      this.config,
      {
        method: "POST",
      }
    );
  }

  async delete(name: string) {
    const response = await TursoClient.request<{ database: string }>(
      `organizations/${this.config.org}/databases/${name}`,
      this.config,
      {
        method: "DELETE",
      }
    );

    return response;
  }

  async createToken(
    dbName: string,
    options?: {
      expiration: string;
      authorization: "read-only" | "full-access";
    }
  ) {
    const queryParams = new URLSearchParams();

    if (options?.expiration) {
      queryParams.set("expiration", options.expiration);
    }

    if (options?.authorization) {
      queryParams.set("authorization", options.authorization);
    }

    const response = await TursoClient.request<{ jwt: string }>(
      `organizations/${this.config.org}/databases/${dbName}/auth/tokens?${queryParams}`,
      this.config,
      {
        method: "POST",
      }
    );

    return response;
  }

  async rotateTokens(dbName: string): Promise<void> {
    return await TursoClient.request<void>(
      `organizations/${this.config.org}/databases/${dbName}/auth/rotate`,
      this.config,
      {
        method: "POST",
      }
    );
  }

  async usage(
    dbName: string,
    options?: { from?: Date | string; to?: Date | string }
  ): Promise<DatabaseUsage> {
    const queryParams = new URLSearchParams();

    if (options?.from) {
      queryParams.set("from", this.formatDateParameter(options.from));
    }

    if (options?.to) {
      queryParams.set("to", this.formatDateParameter(options.to));
    }

    const response = await TursoClient.request<{
      database: DatabaseUsage;
      instances: InstanceUsages;
      total: TotalUsage;
    }>(
      `organizations/${this.config.org}/databases/${dbName}/usage?${queryParams}`,
      this.config
    );

    return response.database;
  }

  private formatDateParameter(date: Date | string): string {
    return date instanceof Date ? date.toISOString() : date;
  }

  private formatResponse(db: ApiDatabaseResponse): Database {
    return {
      name: db.Name,
      id: db.DbId,
      hostname: db.Hostname,
      regions: db.regions,
      primaryRegion: db.primaryRegion,
      type: db.type,
      version: db.version,
      group: db.group,
    };
  }
}

class TursoClient {
  private config: TursoConfig;
  public apiTokens: ApiTokenClient;
  public organizations: OrganizationClient;
  public locations: LocationClient;
  public groups: GroupClient;
  public databases: DatabaseClient;

  constructor(config: TursoConfig) {
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
        "User-Agent": "JS SDK",
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
