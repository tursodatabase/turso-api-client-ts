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
}

export interface ApiDatabaseResponse extends Database {
  Name: string;
  DbId: string;
  Hostname: string;
}

export interface DatabaseInstanceUsageDetail {
  rows_read: number;
  rows_written: number;
  storage_bytes: number;
}

export interface DatabaseInstanceUsage {
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

export class DatabaseClient {
  constructor(private config: TursoConfig) {}

  async list(): Promise<Database[]> {
    const response = await TursoClient.request<{
      databases: ApiDatabaseResponse[];
    }>(`organizations/${this.config.org}/databases`, this.config);

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
      image: "latest" | "canary";
      group?: string;
      seed?: {
        type: "database" | "dump";
        name?: string;
        url?: string;
        timestamp?: string | Date;
      };
    }
  ): Promise<Database> {
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

    const response = await TursoClient.request<{ database: Database }>(
      `organizations/${this.config.org}/databases`,
      this.config,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          name: dbName,
          ...options,
        }),
      }
    );

    return response.database;
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
    const response = await TursoClient.request<{ database: string }>(
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
