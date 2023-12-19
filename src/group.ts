import { TursoConfig } from "./config";
import { LocationKeys } from "./location";
import { TursoClient } from "./client";

export interface Group {
  locations: Array<keyof LocationKeys>;
  name: string;
  primary: keyof LocationKeys;
}

export class GroupClient {
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
