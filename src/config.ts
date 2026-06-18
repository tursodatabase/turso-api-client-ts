/**
 * API token used to authenticate requests. Either a static string or a factory
 * that resolves one on demand (e.g. to refresh short-lived tokens).
 */
export type TursoToken = string | (() => Promise<string>);

export interface TursoConfig {
  /**
   * Organization slug. Provide either `org` or `orgId`.
   */
  org?: string;
  /**
   * Organization id. Can be provided instead of the organization slug (`org`).
   * Takes precedence over `org` when both are set.
   *
   * Requires v3 of the Turso API.
   */
  orgId?: string;
  token: TursoToken;
  baseUrl?: string;
}

/**
 * Resolves the organization identifier used in request paths, preferring the
 * explicit `orgId` over the `org` slug. Throws if neither is provided.
 */
export function resolveOrganization(config: TursoConfig): string {
  const organization = config.orgId || config.org;
  if (!organization) {
    throw new Error(
      "You must provide an organization slug (org) or id (orgId)"
    );
  }
  return organization;
}

/**
 * Resolves the API token, invoking the factory when a function is provided.
 */
export async function resolveToken(config: TursoConfig): Promise<string> {
  return typeof config.token === "function"
    ? await config.token()
    : config.token;
}
