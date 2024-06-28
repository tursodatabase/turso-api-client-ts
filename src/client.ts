import { ApiTokenClient } from "./api-token";
import { OrganizationClient } from "./organization";
import { LocationClient } from "./location";
import { GroupClient } from "./group";
import { DatabaseClient } from "./database";

export const TURSO_API_URL = "https://api.turso.tech/v1/";

interface ApiErrorResponse {
  error: string;
}

interface AdditionalInfo {
  status?: number;
}

export class TursoClientError extends Error {
  status?: number;
  constructor(message: string, additionalInfo?: AdditionalInfo) {
    super(message);
    this.name = "TursoClientError";
    this.status = additionalInfo?.status;
  }
}

/**
 * Configuration interface for Turso API client.
 */
export interface TursoConfig {
  /**
   * Organization identifier.
   */
  org?: string;

  /**
   * API token for authentication.
   */
  token: string;

  /**
   * Base URL for the API. Optional and defaults to "https://api.turso.tech/v1/".
   */
  baseUrl?: string;
}

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
      baseUrl: TURSO_API_URL,
      ...config,
    };

    this.apiTokens = new ApiTokenClient(this.config);
    this.organizations = new OrganizationClient(this.config);
    this.locations = new LocationClient(this.config);
    this.groups = new GroupClient(this.config);
    this.databases = new DatabaseClient(this.config);
  }

  /**
   * Makes an API request.
   * @param url - The endpoint URL.
   * @param config - The Turso configuration.
   * @param options - The request options.
   * @returns The API response.
   * @throws TursoClientError if the request fails.
   */
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
        ...(config.org && { "x-turso-organization": config.org }),
      },
    });

    if (!response.ok) {
      const errorResponse = (await response.json().catch(() => {
        throw new Error(`Something went wrong! Status ${response.status}`);
      })) as ApiErrorResponse;

      throw new TursoClientError(errorResponse.error, {
        status: response.status,
      });
    }

    return response.json() as T;
  }
}

/**
 * Creates a new TursoClient instance.
 * @param config - The Turso configuration.
 * @returns The TursoClient instance.
 */
export function createClient(config: TursoConfig): TursoClient {
  return new TursoClient(config);
}
