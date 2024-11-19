import { LocationKeys } from "./location";
import { TursoConfig } from "./config";
import { TursoClient } from "./client";

export interface Database {
  name: string;
  id: string;
  hostname: string;
  regions?: Array<keyof LocationKeys>;
  primaryRegion?: keyof LocationKeys;
  type: string;
  version: string;
  group?: string;
  sleeping: boolean;
  archived: boolean;
  allow_attach: boolean;
  block_reads: boolean;
  block_writes: boolean;
  schema?: string;
  is_schema: boolean;
}

export interface ApiDatabaseResponse
  extends Database,
    ApiCreateDatabaseResponse {}

export interface ApiCreateDatabaseResponse {
  DbId: string;
  Hostname: string;
  Name: string;
}

export interface CreatedDatabase {
  name: string;
  id: string;
  hostname: string;
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

export interface DatabaseUsage {
  uuid: string;
  instances: DatabaseInstanceUsage[];
  usage: DatabaseInstanceUsageDetail;
}

export interface InstanceUsages {
  [instanceUuid: string]: DatabaseInstanceUsageDetail;
}

export interface TotalUsage {
  rows_read: number;
  rows_written: number;
  storage_bytes: number;
}

export interface DatabaseInstance {
  uuid: string;
  name: keyof LocationKeys;
  type: "primary" | "replica";
  region: keyof LocationKeys;
  hostname: string;
}

export interface DeletedDatabase {
  database: string;
}

export interface DatabaseToken {
  jwt: string;
}

type MultiDBSchemaOptions =
  | { is_schema: boolean; schema?: never }
  | { is_schema?: never; schema: string }
  | {};

function hasIsSchemaOption(
  options: any
): options is { is_schema: boolean; schema?: never } {
  return options !== undefined && options.is_schema !== undefined;
}

function hasSchemaOption(
  options: any
): options is { is_schema?: never; schema: string } {
  return options !== undefined && options.schema !== undefined;
}

export class DatabaseClient {
  constructor(private config: TursoConfig) {}

  async list(options?: {
    schema?: string;
    group?: string;
    type?: "schema";
  }): Promise<Database[]> {
    const queryParams = new URLSearchParams(
      Object.entries({
        schema: options?.schema,
        group: options?.group,
        type: options?.type,
      }).filter(([_, value]) => value !== undefined) as [string, string][]
    );

    const url = `organizations/${this.config.org}/databases${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await TursoClient.request<{
      databases: ApiDatabaseResponse[];
    }>(url, this.config);

    return (response.databases ?? []).map((db) => this.formatResponse(db));
  }

  async get(dbName: string): Promise<Database> {
    const response = await TursoClient.request<{
      database: ApiDatabaseResponse;
    }>(`organizations/${this.config.org}/databases/${dbName}`, this.config);

    return this.formatResponse(response.database);
  }

  async create(
    dbName: string,
    options?: {
      image?: "latest" | "canary";
      group?: string;
      seed?: {
        type: "database" | "dump";
        name?: string;
        url?: string;
        timestamp?: string | Date;
      };
    } & MultiDBSchemaOptions
  ): Promise<CreatedDatabase> {
    if (hasIsSchemaOption(options) && hasSchemaOption(options)) {
      throw new Error("'is_schema' and 'schema' cannot both be provided");
    }

    if (options?.seed) {
      if (options.seed.type === "database" && !options.seed.name) {
        throw new Error("Seed name is required when type is 'database'");
      }
      if (options.seed.type === "dump" && !options.seed.url) {
        throw new Error("Seed URL is required when type is 'dump'");
      }
    }

    if (options?.seed?.timestamp) {
      options.seed.timestamp = this.formatDateParameter(options.seed.timestamp);
    }

    const response = await TursoClient.request<{
      database: ApiCreateDatabaseResponse;
    }>(`organizations/${this.config.org}/databases`, this.config, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        name: dbName,
        ...options,
      }),
    });

    return this.formatCreateResponse(response.database);
  }

  async updateVersion(dbName: string): Promise<void> {
    return await TursoClient.request(
      `organizations/${this.config.org}/databases/${dbName}/update`,
      this.config,
      {
        method: "POST",
      }
    );
  }

  async delete(dbName: string) {
    const response = await TursoClient.request<DeletedDatabase>(
      `organizations/${this.config.org}/databases/${dbName}`,
      this.config,
      {
        method: "DELETE",
      }
    );

    return response;
  }

  async listInstances(dbName: string): Promise<DatabaseInstance[]> {
    const response = await TursoClient.request<{
      instances: DatabaseInstance[];
    }>(
      `organizations/${this.config.org}/databases/${dbName}/instances`,
      this.config
    );

    return response.instances ?? [];
  }

  async getInstance(
    dbName: string,
    instanceName: keyof LocationKeys
  ): Promise<DatabaseInstance> {
    const response = await TursoClient.request<{
      instance: DatabaseInstance;
    }>(
      `organizations/${this.config.org}/databases/${dbName}/instances/${instanceName}`,
      this.config
    );

    return response.instance ?? null;
  }

  async createToken(
    dbName: string,
    options?: {
      expiration?: string;
      authorization?: "read-only" | "full-access";
      permissions?: {
        read_attach: { databases: Database["name"][] };
      };
    }
  ): Promise<DatabaseToken> {
    const queryParams = new URLSearchParams();

    if (options?.expiration) {
      queryParams.set("expiration", options.expiration);
    }

    if (options?.authorization) {
      queryParams.set("authorization", options.authorization);
    }

    const response = await TursoClient.request<DatabaseToken>(
      `organizations/${this.config.org}/databases/${dbName}/auth/tokens?${queryParams}`,
      this.config,
      {
        method: "POST",
        body: JSON.stringify({
          permissions: {
            read_attach: {
              databases: options?.permissions?.read_attach?.databases ?? [],
            },
          },
        }),
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
      sleeping: db.sleeping,
      archived: db.archived,
      allow_attach: db.allow_attach,
      block_reads: db.block_reads,
      block_writes: db.block_writes,
      schema: db.schema,
      is_schema: db.is_schema,
    };
  }

  private formatCreateResponse(db: ApiCreateDatabaseResponse): CreatedDatabase {
    return {
      id: db.DbId,
      hostname: db.Hostname,
      name: db.Name,
    };
  }
}
