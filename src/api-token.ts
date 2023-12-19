import { TursoConfig } from "./config";
import { TursoClient } from "./client";

export interface ApiToken {
  id: string;
  name: string;
}

export class ApiTokenClient {
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
