export interface TursoConfig {
  /**
   * Organization slug. Provide either `org` or `orgId`.
   */
  org?: string;
  /**
   * Organization id. Can be provided instead of the organization slug (`org`).
   * Takes precedence over `org` when both are set.
   */
  orgId?: string;
  token: string;
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
